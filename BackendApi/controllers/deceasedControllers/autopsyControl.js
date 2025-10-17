const asyncHandler = require('express-async-handler');
const { safeQuery } = require('../../configurations/sqlConfig/db');
const { getKenyaTimeISO } = require('../../utilities/timeStamps/timeStamps');

// ---------------- Register Autopsy ----------------
const registerAutopsy = asyncHandler(async (req, res) => {
  const {
    deceased_id,
    summary,
    findings,
    cause_of_death,
    // Internal pathologist
    staff_username,
    // External pathologist
    external_name,
    external_mobile,
    external_id_number,
  } = req.body;

  const autopsy_date = getKenyaTimeISO();
  const created_at = getKenyaTimeISO();

  // Basic validation
  if (!deceased_id || !summary || !findings || !cause_of_death) {
    return res.status(400).json({
      message: 'Missing required fields: deceased_id, summary, findings, cause_of_death',
    });
  }

  // Validate pathologist input
  if (!staff_username && !(external_name && external_mobile && external_id_number)) {
    return res.status(400).json({
      message:
        'Provide either a staff_username (internal pathologist) OR all external pathologist details (name, mobile, id_number)',
    });
  }

  try {
    await safeQuery(
      `INSERT INTO postmortem
        (deceased_id, autopsy_date, staff_username,
         external_name, external_mobile, external_id_number,
         cause_of_death, summary, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        deceased_id,
        autopsy_date,
        staff_username || null,
        external_name || null,
        external_mobile || null,
        external_id_number || null,
        cause_of_death,
        summary,
        JSON.stringify(findings),
        created_at,
      ]
    );

    res.status(201).json({
      message: 'Autopsy report saved successfully.',
      status: 201,
      deceased_id,
    });
  } catch (err) {
    console.error('❌ Error in registerAutopsy:', err);
    res.status(500).json({ message: 'Failed to register autopsy', error: err.message });
  }
});

// ---------------- Get Autopsy By Deceased ID ----------------
const getPostmortemByDeceasedId = asyncHandler(async (req, res) => {
  const { deceased_id } = req.params;

  if (!deceased_id) {
    return res.status(400).json({ message: 'deceased_id is required' });
  }

  try {
    const rows = await safeQuery(
      `SELECT id, deceased_id, autopsy_date,
              staff_username, external_name, external_mobile, external_id_number,
              cause_of_death, summary, notes, created_at, updated_at
       FROM postmortem
       WHERE deceased_id = ?
       ORDER BY autopsy_date DESC
       LIMIT 1`,
      [deceased_id]
    );

    if (!rows.length) {
      return res.status(200).json({ postmortem: null });
    }

    const postmortem = rows[0];

    // Parse findings stored in notes
    try {
      postmortem.notes = JSON.parse(postmortem.notes);
    } catch (e) {
      // If not valid JSON, leave as raw string
    }

    res.status(200).json({ postmortem });
  } catch (err) {
    console.error('❌ Error fetching postmortem:', err);
    res.status(500).json({ message: 'Failed to fetch postmortem data', error: err.message });
  }
});

module.exports = {
  registerAutopsy,
  getPostmortemByDeceasedId,
};
