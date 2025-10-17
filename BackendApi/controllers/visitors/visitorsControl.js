const expressAsyncHandler = require('express-async-handler');
const { safeQuery } = require('../../configurations/sqlConfig/db'); // ✅ use safeQuery
const registerVisitor = expressAsyncHandler(async (req, res) => {
  const {
    full_name,
    contact,
    deceased_id,
    purpose_of_visit
  } = req.body;

  // Map purpose_of_visit → reason_for_visit
  const reason_for_visit = purpose_of_visit;

  // Enhanced validation with specific field names
  const missingFields = [];
  if (!full_name) missingFields.push('full_name');
  if (!contact) missingFields.push('contact');
  if (!reason_for_visit) missingFields.push('reason_for_visit');
  if (!deceased_id) missingFields.push('deceased_id');

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  const sql = `
    INSERT INTO visitors (
      full_name,
      contact,
      reason_for_visit,
      deceased_id,
      check_in_time
    )
    VALUES (?, ?, ?, ?, NOW())
  `;

  try {
    const result = await safeQuery(sql, [
      full_name,
      contact,
      reason_for_visit,
      deceased_id
    ]);

    res.status(201).json({
      message: '✅ Visitor registered successfully',
      id: result.insertId || null
    });
  } catch (err) {
    console.error('❌ Error registering visitor:', err.message);
    res.status(500).json({ message: 'Error registering visitor' });
  }
});

module.exports = { registerVisitor };
