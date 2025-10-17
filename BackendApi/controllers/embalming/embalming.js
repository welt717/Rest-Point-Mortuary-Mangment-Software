const { safeQuery } = require('../../configurations/sqlConfig/db');
const { getKenyaTimeISO } = require('../../utilities/timeStamps/timeStamps');
const fs = require('fs');
const path = require('path');

// Optional error logger
const errorLogPath = path.join(__dirname, '../../logs/error.log');
function logError(err) {
  const logEntry = `[${new Date().toISOString()}] ${err.stack || err}\n`;
  fs.appendFile(errorLogPath, logEntry, e => {
    if (e) console.error('❌ Failed to write to error log:', e);
  });
}

// ===================== Update Embalming Info =====================
async function updateEmbalmingInfo(req, res) {
  const { id } = req.params;

  // Destructure and sanitize
  const {
    isEmbalmed,
    embalmedBy,
    embalmingRemarks,
    embalmingCost
  } = req.body;

  // Validation
  if (typeof isEmbalmed === 'undefined') {
    return res.status(400).json({ success: false, message: "Missing 'isEmbalmed' field" });
  }

  try {
    // 1. Check if deceased record exists
    const deceasedRows = await safeQuery('SELECT * FROM deceased WHERE id = ?', [id]);
    if (deceasedRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Deceased record not found' });
    }

    // 2. Determine embalmed timestamp
    const embalmed_at = isEmbalmed ? getKenyaTimeISO() : null;

    // 3. Update database
    const updateQuery = `
      UPDATE deceased SET 
        is_embalmed = ?, 
        embalmed_at = ?, 
        embalmed_by = ?, 
        embalming_remarks = ?, 
        embalming_cost = ? 
      WHERE id = ?
    `;

    const updateValues = [
      isEmbalmed ? 1 : 0,
      embalmed_at,
      embalmedBy || null,
      embalmingRemarks || null,
      embalmingCost || null,
      id
    ];

    await safeQuery(updateQuery, updateValues);

    // 4. Response
    return res.status(200).json({
      success: true,
      message: `✅ Embalming info updated for deceased ID: ${id}`,
      embalmed_at
    });

  } catch (error) {
    console.error('❌ Error updating embalming info:', error);
    logError(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

module.exports = { updateEmbalmingInfo };
