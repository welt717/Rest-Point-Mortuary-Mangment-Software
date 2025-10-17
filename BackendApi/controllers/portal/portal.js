const asyncHandler = require("express-async-handler");
const { safeQuery } = require("../../configurations/sqlConfig/db");
const { getKenyaTimeISO } = require("../../utilities/timeStamps/timeStamps");
const fs = require("fs");
const path = require("path");

// Generate booking ID
const generateBookingId = () =>
  "BOOK-" + Math.random().toString(36).substring(2, 8).toUpperCase();

// ------------------- Book a Visit -------------------
const bookVisit = asyncHandler(async (req, res) => {
  const { full_name, contact, date_of_visit, purpose_of_visit, deceased_id } = req.body;

  // Input validation
  if (!full_name || !contact || !date_of_visit || !deceased_id) {
    return res.status(400).json({ message: "Full name, contact, date_of_visit, and deceased_id are required" });
  }

  if (!/^[A-Z0-9-]{5,20}$/i.test(deceased_id)) {
    return res.status(400).json({ message: "Invalid deceased ID format" });
  }

  if (!/^\d{10,15}$/.test(contact)) {
    return res.status(400).json({ message: "Invalid contact number" });
  }

  // Check if deceased exists
  const deceasedCheck = await safeQuery(
    `SELECT has_certificate FROM deceased WHERE deceased_id = ?`,
    [deceased_id]
  );

  if (!deceasedCheck.length) return res.status(404).json({ message: "Deceased not found" });
  if (deceasedCheck[0].has_certificate) return res.status(400).json({ message: "Certificate already issued" });

  // Check if visit already booked
  const existingVisit = await safeQuery(
    `SELECT * FROM visit_bookings WHERE deceased_id = ?`,
    [deceased_id]
  );
  if (existingVisit.length) return res.status(400).json({ message: "A visit has already been booked" });

  // Register visit
  const booking_id = generateBookingId();
  const created_at = getKenyaTimeISO();
  await safeQuery(
    `INSERT INTO visit_bookings 
     (booking_id, client_name, phone, date_of_visit, purpose, deceased_id, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [booking_id, full_name, contact, date_of_visit, purpose_of_visit, deceased_id, created_at]
  );

  // Auto-register in portal_tracking
  const portalCheck = await safeQuery(
    `SELECT * FROM portal_tracking WHERE deceased_id = ?`,
    [deceased_id]
  );

  if (!portalCheck.length) {
    await safeQuery(
      `INSERT INTO portal_tracking (deceased_id, status, last_updated, remarks)
       VALUES (?, ?, ?, ?)`,
      [deceased_id, "pending", created_at, "Visit booked automatically"]
    );
  }

  res.status(201).json({
    message: "Visit booked successfully",
    booking: { booking_id, full_name, contact, date_of_visit, purpose_of_visit, deceased_id, created_at },
  });
});

// ------------------- Login / Get Deceased -------------------
const getPortalDeceasedById = asyncHandler(async (req, res) => {
  let { deceased_id, next_of_kin_name, contact } = req.body;

  if (!deceased_id || !next_of_kin_name) {
    return res.status(400).json({ message: "Both deceased_id and next_of_kin_name are required" });
  }

  // Input validation
  if (!/^[A-Z0-9-]{5,20}$/i.test(deceased_id) || !/^[a-zA-Z\s]{2,100}$/.test(next_of_kin_name)) {
    return res.status(400).json({ message: "Invalid input format" });
  }

  deceased_id = deceased_id.toUpperCase();

  // Fetch deceased and portal status
  const deceasedRows = await safeQuery(
    `SELECT d.*, p.status AS portal_status FROM deceased d
     LEFT JOIN portal_tracking p ON d.deceased_id = p.deceased_id
     WHERE d.deceased_id = ?`,
    [deceased_id]
  );

  if (!deceasedRows.length) return res.status(404).json({ message: "Deceased not found" });

  const deceased = deceasedRows[0];

  if (deceased.portal_status === "completed" || deceased.has_certificate) {
    return res.status(403).json({ message: "Access denied for this deceased" });
  }

  // Limit concurrent logins to 2
  const activeSessions = await safeQuery(
    `SELECT COUNT(*) AS count FROM portal_sessions WHERE deceased_id = ? AND active = TRUE`,
    [deceased_id]
  );

  if (activeSessions[0].count >= 2) {
    return res.status(403).json({ message: "Maximum number of concurrent logins reached for this profile." });
  }

  // Verify next-of-kin match
  const kinCheck = await safeQuery(
    `SELECT full_name FROM next_of_kin WHERE deceased_id = ? AND LOWER(full_name) = LOWER(?) LIMIT 1`,
    [deceased_id, next_of_kin_name]
  );
  if (!kinCheck.length) return res.status(404).json({ message: "Next of kin not recognized" });

  // Register session
  await safeQuery(
    `INSERT INTO portal_sessions (deceased_id, next_of_kin_name, logged_in_at) VALUES (?, ?, ?)`,
    [deceased_id, next_of_kin_name, getKenyaTimeISO()]
  );

  // Log access in portal_notifications
  const now = getKenyaTimeISO();
  const existingAccess = await safeQuery(
    `SELECT * FROM portal_notifications WHERE deceased_id = ? AND next_of_kin_name = ? LIMIT 1`,
    [deceased_id, next_of_kin_name]
  );

  if (existingAccess.length) {
    await safeQuery(
      `UPDATE portal_notifications SET access_count = access_count + 1, accessed_at = ? WHERE id = ?`,
      [now, existingAccess[0].id]
    );
  } else {
    await safeQuery(
      `INSERT INTO portal_notifications (deceased_id, next_of_kin_name, contact, accessed_at) VALUES (?, ?, ?, ?)`,
      [deceased_id, next_of_kin_name, contact || null, now]
    );
  }

  // Fetch portal data
  const rows = await safeQuery(
    `SELECT d.deceased_id, d.full_name AS deceased_name, d.date_of_death, d.cause_of_death,
            d.total_mortuary_charge, d.coffin_status, d.dispatch_date, d.date_admitted,
            TIMESTAMPDIFF(DAY, d.date_admitted, NOW()) AS days_in_morgue,
            p.status AS portal_status, p.remarks AS portal_remarks,
            k.full_name AS next_of_kin, k.relationship, a.findings AS autopsy_findings
     FROM deceased d
     LEFT JOIN portal_tracking p ON d.deceased_id = p.deceased_id
     LEFT JOIN next_of_kin k ON d.deceased_id = k.deceased_id
     LEFT JOIN postmortem a ON d.deceased_id = a.deceased_id
     WHERE d.deceased_id = ? AND LOWER(k.full_name) = LOWER(?)
     LIMIT 1`,
    [deceased_id, next_of_kin_name]
  );

  if (!rows.length) return res.status(404).json({ message: "Deceased or next of kin not found" });

  const record = rows[0];
  const [mortuaryRow] = await safeQuery(`SELECT name, phone, address FROM mortuaries LIMIT 1`);

  res.status(200).json({
    message: `Welcome ${record.next_of_kin}, here is the information for your deceased: ${record.deceased_name}`,
    deceased: {
      deceased_id: record.deceased_id,
      deceased_name: record.deceased_name,
      date_of_death: record.date_of_death,
      cause_of_death: record.cause_of_death,
      total_mortuary_charge: record.total_mortuary_charge,
      coffin_status: record.coffin_status,
      date_admitted: record.date_admitted,
      dispatch_date: record.dispatch_date,
      days_in_morgue: record.days_in_morgue,
      status: record.portal_status || "pending",
      remarks: record.portal_remarks || null,
      next_of_kin_name: record.next_of_kin,
      relationship: record.relationship || null,
      autopsy_findings: record.autopsy_findings || "N/A",
      mortuary: {
        name: mortuaryRow?.name || "N/A",
        phone: mortuaryRow?.phone || "N/A",
        address: mortuaryRow?.address || "N/A",
      },
    },
  });
});

// ------------------- Download Autopsy PDF -------------------
const downloadAutopsyPDF = asyncHandler(async (req, res) => {
  const { deceased_id, next_of_kin_name } = req.body;

  if (!deceased_id || !next_of_kin_name) return res.status(400).json({ message: "Required fields missing" });

  const kinCheck = await safeQuery(
    `SELECT full_name FROM next_of_kin WHERE deceased_id = ? AND LOWER(full_name) = LOWER(?)`,
    [deceased_id, next_of_kin_name]
  );
  if (!kinCheck.length) return res.status(403).json({ message: "Access denied" });

  const pdfPath = path.join(__dirname, `../../private/autopsy_reports/${deceased_id}.pdf`);
  if (!fs.existsSync(pdfPath)) return res.status(404).json({ message: "Autopsy report not found" });

  res.download(pdfPath, `${deceased_id}_autopsy.pdf`);
});

// ------------------- Fetch Minister Records -------------------
const getMinisterDeceasedRecords = asyncHandler(async (req, res) => {
  const rows = await safeQuery(
    `SELECT d.deceased_id, d.full_name, d.date_of_death, d.cause_of_death, 
            p.status, p.remarks, d.created_at
     FROM deceased d
     LEFT JOIN portal_tracking p ON d.deceased_id = p.deceased_id
     WHERE (p.status IS NULL OR p.status != 'completed')
       AND (d.has_certificate IS NULL OR d.has_certificate = 0)
     ORDER BY d.created_at DESC`
  );

  if (!rows.length) return res.status(404).json({ message: "No deceased records for ministers" });

  res.status(200).json({ count: rows.length, deceased: rows });
});

module.exports = {
  bookVisit,
  getPortalDeceasedById,
  downloadAutopsyPDF,
  getMinisterDeceasedRecords,
};
