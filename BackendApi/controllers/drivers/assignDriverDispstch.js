const asyncHandler = require('express-async-handler');
const { safeQuery } = require('../../configurations/sqlConfig/db');

const assignVehicleDispatch = asyncHandler(async (req, res) => {
  console.log('[DISPATCH] Request received:', req.body);

  const {
    deceased_id,
    vehicle_plate,
    driver_name,
    driver_contact,
    status,
    notes,
    dispatch_date,
    dispatch_time
  } = req.body;

  // ✅ Validate required fields
  if (!deceased_id || !vehicle_plate || !driver_name || !driver_contact) {
    console.warn('[DISPATCH] Missing required fields:', req.body);
    return res.status(400).json({ error: "Missing required fields." });
  }

  const today = new Date();
  const formattedDate = dispatch_date || today.toISOString().split('T')[0];  // YYYY-MM-DD
  const formattedTime = dispatch_time || today.toTimeString().slice(0, 5);   // HH:MM
  const createdAt = today.toISOString().slice(0, 19).replace('T', ' ');     // YYYY-MM-DD HH:MM:SS

  // SQL for inserting dispatch
  const insertSql = `
    INSERT INTO vehicle_dispatch (
      deceased_id, vehicle_plate, driver_name, driver_contact, status,
      notes, dispatch_date, dispatch_time, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // SQL for updating deceased status
  const updateDeceasedSql = `
    UPDATE deceased SET status = ?, updated_at = ? WHERE deceased_id = ?
  `;

  try {
    // Start transaction
    await safeQuery('START TRANSACTION');

    // 1️⃣ Insert vehicle dispatch
    const dispatchResult = await safeQuery(insertSql, [
      deceased_id,
      vehicle_plate,
      driver_name,
      driver_contact,
      status || 'Assigned',
      notes || null,
      formattedDate,
      formattedTime,
      createdAt
    ]);

    console.log('[DISPATCH] Inserted vehicle dispatch ID:', dispatchResult.insertId);

    // 2️⃣ Update deceased status to "Ready"
    await safeQuery(updateDeceasedSql, [
      'Ready',
      createdAt,
      deceased_id
    ]);

    console.log('[DISPATCH] Deceased status updated to Ready');

    // Commit transaction
    await safeQuery('COMMIT');

    res.status(201).json({
      message: "✅ Vehicle dispatched successfully and deceased status set to Ready",
      dispatch_id: dispatchResult.insertId
    });

  } catch (err) {
    // Rollback transaction if any error occurs
    await safeQuery('ROLLBACK');
    console.error('[DISPATCH] DB error:', err.message, err);
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

module.exports = {
  assignVehicleDispatch
};
