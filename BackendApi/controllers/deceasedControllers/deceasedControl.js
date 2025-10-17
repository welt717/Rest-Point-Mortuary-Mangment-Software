const asyncHandler = require('express-async-handler');
const NodeCache = require('node-cache');
const { safeQuery } = require('../../configurations/sqlConfig/db');
const { getKenyaTimeISO } = require('../../utilities/timeStamps/timeStamps');
const fs = require('fs');
const path = require('path');

// ----------------- Setup -----------------
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
const ALL_DECEASED_CACHE_KEY = 'all_deceased';
const deceasedCache = new Map();
const errorLogPath = path.join(__dirname, '../../logs/error.log');

function logError(err) {
  const logEntry = `[${new Date().toISOString()}] ${err.stack || err}\n`;
  fs.appendFile(errorLogPath, logEntry, e => {
    if (e) console.error('❌ Failed to write to error log:', e);
  });
}

// ----------------- Register Deceased -----------------
const registerDeceased = asyncHandler(async (req, res) => {
  try {
    const {
      admission_number, cause_of_death, date_of_birth, date_of_death,
      full_name, gender, mortuary_id, place_of_death, county,
      location, national_id
    } = req.body;

    const date_registered = getKenyaTimeISO();
    const date_admitted = getKenyaTimeISO();
    const created_at = getKenyaTimeISO();

    const safe_mortuary_id = (typeof mortuary_id === 'string' && mortuary_id.trim() !== '')
      ? mortuary_id.trim()
      : 'UNKNOWN';

    function generateUniqueDeceasedId(fullName) {
      const prefix = (fullName?.split(" ")[0] || 'NONAME').substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `${prefix}-${timestamp}-${random}`;
    }

    const deceased_id = generateUniqueDeceasedId(full_name);

    function sanitize(value) {
      return value === undefined ? null : value;
    }

    const insertValues = [
      sanitize(deceased_id),
      sanitize(admission_number),
      sanitize(cause_of_death),
      sanitize(date_admitted),
      sanitize(date_of_birth),
      sanitize(date_of_death),
      sanitize(date_registered),
      sanitize(full_name),
      sanitize(gender),
      sanitize(safe_mortuary_id),
      sanitize(place_of_death),
      sanitize(county),
      sanitize(national_id),
      sanitize(created_at),
      sanitize(location)
    ];

    const insertQuery = `
      INSERT INTO deceased (
        deceased_id, admission_number, cause_of_death, date_admitted,
        date_of_birth, date_of_death, date_registered, full_name,
        gender, mortuary_id, place_of_death, county,
        national_id, created_at, location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await safeQuery(insertQuery, insertValues);

    // Refresh cache in background
    safeQuery(`
      SELECT 
        d.*,
        CASE WHEN p.deceased_id IS NOT NULL THEN 1 ELSE 0 END AS has_autopsy
      FROM deceased d
      LEFT JOIN postmortem p ON d.deceased_id = p.deceased_id
      ORDER BY d.date_of_death DESC
    `)
      .then(data => cache.set(ALL_DECEASED_CACHE_KEY, data))
      .catch(err => {
        console.error('❌ Failed to update cache after registration:', err);
        logError(err);
      });

    res.status(200).json({ message: "Deceased registered successfully", deceased_id });
  } catch (err) {
    console.error('❌ Error registering deceased:', err);
    logError(err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// ----------------- Get All Deceased -----------------
let isPopulatingCache = false;
let cachePromise = null;

const getAllRegisteredDeceased = asyncHandler(async (req, res) => {
  try {
    let deceasedRecords = cache.get(ALL_DECEASED_CACHE_KEY);

    if (!deceasedRecords) {
      if (!isPopulatingCache) {
        isPopulatingCache = true;
        cachePromise = safeQuery(`
          SELECT 
            d.*,
            CASE WHEN p.deceased_id IS NOT NULL THEN 1 ELSE 0 END AS has_autopsy,
            k.full_name AS kin_name,
            k.relationship AS kin_relationship,
            k.contact AS kin_contact,
            k.email AS kin_email,
            CASE WHEN k.id IS NOT NULL THEN 1 ELSE 0 END AS has_kin
          FROM deceased d
          LEFT JOIN postmortem p ON d.deceased_id = p.deceased_id
          LEFT JOIN next_of_kin k ON d.deceased_id = k.deceased_id
          ORDER BY d.date_of_death DESC
        `).then(data => {
          cache.set(ALL_DECEASED_CACHE_KEY, data);
          isPopulatingCache = false;
          return data;
        }).catch(err => {
          isPopulatingCache = false;
          logError(err);
          throw err;
        });
      }
      deceasedRecords = await cachePromise;
    }

    res.status(200).json({
      message: 'Deceased records fetched successfully',
      count: deceasedRecords.length,
      data: deceasedRecords,
    });
  } catch (err) {
    console.error('❌ Error fetching deceased records:', err);
    logError(err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// ----------------- Get Deceased By ID -----------------
const getDeceasedById = asyncHandler(async (req, res) => {
  const id = req.query.id || req.params.id || req.body.deceased_id;

  if (!id) return res.status(400).json({ message: 'Deceased ID is required' });

  try {
    const deceasedRows = await safeQuery(`
      SELECT 
        d.*,
        u.name AS registered_by_name,
        u.username AS registered_by_username,
        u.role AS registered_by_role
      FROM deceased d
      LEFT JOIN users u ON d.registered_by_user_id = u.id
      WHERE d.deceased_id = ?
    `, [id]);

    const deceased = deceasedRows[0];
    if (!deceased) return res.status(404).json({ message: 'Deceased record not found' });

    const safeFetch = async (label, sql, params = []) => {
      if (!params || params.includes(undefined) || params.includes(null)) return [];
      try {
        return await safeQuery(sql, params);
      } catch (err) {
        console.error(`❌ ${label} query failed:`, err.message);
        return [];
      }
    };

    const [
      nextOfKinRows,
      dispatchRows,
      chargesRows,
      paymentsRows,
      visitorsRows,
      rawDocumentsRows,
      postRows
    ] = await Promise.all([
      safeFetch("next_of_kin", `SELECT * FROM next_of_kin WHERE deceased_id = ?`, [id]),
      safeFetch("vehicle_dispatch", `SELECT * FROM vehicle_dispatch WHERE deceased_id = ?`, [id]),
      safeFetch("charges", `SELECT * FROM charges WHERE deceased_id = ?`, [id]),
      safeFetch("payments", `SELECT * FROM payments WHERE deceased_id = ?`, [id]),
      safeFetch("visitors", `SELECT * FROM visitors WHERE deceased_id = ?`, [id]),
      safeFetch("documents", `SELECT * FROM documents WHERE deceased_id = ?`, [id]),
      safeFetch("postmortem", `SELECT * FROM postmortem WHERE deceased_id = ?`, [id]),
    ]);

    const documentBaseUrl = process.env.FILE_BASE_URL || 'https://yourdomain.com/uploads';
    const documentsRows = rawDocumentsRows.map(doc => ({
      ...doc,
      file_url: `${documentBaseUrl}/${doc.file_path || ''}`
    }));

    let postmortem = null;
    if (postRows.length > 0) {
      postmortem = postRows[0];
      if (postmortem.postmortem_id) {
        const postmortemVisitors = await safeFetch("postmortem_visitors",
          `SELECT * FROM postmortem_visitors WHERE postmortem_id = ?`, [postmortem.postmortem_id]);
        postmortem.visitors = postmortemVisitors;
      }
    }

    const daysSpent = deceased.date_admitted
      ? Math.floor((new Date() - new Date(deceased.date_admitted)) / (1000 * 60 * 60 * 24))
      : 0;

    const coldRoomCharges = daysSpent * (deceased.currency === 'USD' ? deceased.usd_charge_rate || 0 : 800);
    const otherCharges = chargesRows.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
    const totalPayments = paymentsRows.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const totalCharges = coldRoomCharges + otherCharges;
    const balance = totalCharges - totalPayments;

    const notifications = [];

    if (deceased.is_embalmed)
      notifications.push({ type: "embalmed", status: "success", message: `🧼 Embalming done on ${deceased.embalmed_at || 'unknown date'}.` });
    else
      notifications.push({ type: "not_embalmed", status: "warning", message: "⚠️ Embalming not done yet." });

    if (nextOfKinRows.length > 0)
      notifications.push({ type: "next_of_kin", status: "success", message: "👤 Next of kin is recorded." });
    else
      notifications.push({ type: "no_next_of_kin", status: "error", message: "❗ No next of kin recorded." });

    if (postmortem)
      notifications.push({ type: "postmortem", status: "info", message: "🩺 Postmortem report exists." });
    else
      notifications.push({ type: "no_postmortem", status: "info", message: "ℹ️ No postmortem report." });

    if (dispatchRows.length > 0)
      notifications.push({ type: "dispatch", status: "info", message: "🚚 Dispatch record exists." });

    if (deceased.is_unclaimed)
      notifications.push({ type: "unclaimed", status: "warning", message: "❗ This body is unclaimed." });

    if (!deceased.coffin_status)
      notifications.push({ type: "no_coffin", status: "warning", message: "⚰️ No coffin assigned." });

    if (documentsRows.length > 0)
      notifications.push({ type: "documents", status: "success", message: `📄 ${documentsRows.length} document(s) uploaded.` });
    else
      notifications.push({ type: "no_documents", status: "warning", message: "❗ No documents uploaded." });

    const responseData = {
      ...deceased,
      next_of_kin: nextOfKinRows,
      dispatch: dispatchRows[0] || null,
      charges: chargesRows,
      payments: paymentsRows,
      documents: documentsRows,
      visitors: visitorsRows,
      postmortem,
      financial_details: {
        days_spent: daysSpent,
        cold_room_charges: coldRoomCharges,
        other_charges: otherCharges,
        total_charges: totalCharges,
        total_payments: totalPayments,
        balance,
        currency: deceased.currency || "KES"
      },
      cold_room_info: {
        room_no: deceased.cold_room_no || null,
        tray_no: deceased.tray_no || null
      }
    };

    deceasedCache.set(id, {
      timestamp: Date.now(),
      data: responseData,
      notifications
    });

    res.status(200).json({
      message: '✅ Full deceased record fetched successfully',
      data: responseData,
      notifications
    });
  } catch (err) {
    console.error('❌ Error fetching deceased record:', err);
    logError(err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// ----------------- Update Coffin Status -----------------
const updateCoffinStatus = asyncHandler(async (req, res) => {
  const { deceased_id } = req.query;
  const { coffin_status } = req.body;

  if (!deceased_id || !coffin_status)
    return res.status(400).json({ message: "Missing required fields", success: false });

  try {
    await safeQuery("UPDATE deceased SET coffin_status = ? WHERE deceased_id = ?", [coffin_status, deceased_id]);
    res.status(200).json({ message: "Coffin status updated successfully", success: true });
  } catch (err) {
    console.error('❌ Error updating coffin status:', err);
    logError(err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});

// ----------------- Update Dispatch Date -----------------
const updateDeceasedDispatchDate = asyncHandler(async (req, res) => {
  const deceased_id = req.body.deceased_id || req.query.deceased_id;
  const dispatch_date = req.body.dispatch_date;

  if (!deceased_id || !dispatch_date)
    return res.status(400).json({ message: "Missing required fields", success: false });

  try {
    await safeQuery("UPDATE deceased SET dispatch_date = ? WHERE deceased_id = ?", [dispatch_date, deceased_id]);
    res.status(200).json({ message: "Dispatch date updated successfully", success: true });
  } catch (err) {
    console.error('❌ Error updating dispatch date:', err);
    logError(err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});

// ----------------- Update Deceased Status -----------------
function updateDeceasedStatus(cid, status, callback) {
  safeQuery(`UPDATE deceased_status_log SET status = ? WHERE cid = ?`, [status, cid])
    .then(() => callback({ success: true, message: 'Status updated successfully' }))
    .catch(err => {
      console.error('❌ DB Error:', err.message);
      logError(err);
      callback({ success: false, message: 'Database update failed' });
    });
}

// ----------------- Update Global Mortuary Rate -----------------
function updateMortuaryRateForAll(newRate) {
  safeQuery(`UPDATE deceased SET mortuary_charge = ?`, [newRate])
    .then(() => console.log(`✅ Updated mortuary charge for all records to KES ${newRate}`))
    .catch(err => {
      console.error(`❌ Error updating global mortuary rate:`, err.message);
      logError(err);
    });
}

// ----------------- Exports -----------------
module.exports = {
  registerDeceased,
  getAllRegisteredDeceased,
  getDeceasedById,
  updateCoffinStatus,
  updateDeceasedDispatchDate,
  updateDeceasedStatus,
  updateMortuaryRateForAll
};
