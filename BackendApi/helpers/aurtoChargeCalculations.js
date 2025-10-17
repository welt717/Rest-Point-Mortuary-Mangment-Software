const fs = require('fs');
const path = require('path');
const { safeQuery } = require('../configurations/sqlConfig/db');

// Ensure logs folder exists
const logDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Get Kenyan DateTime (EAT) formatted for MySQL
function getKenyanDateTime() {
  const kenyaTime = new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" });
  const date = new Date(kenyaTime);
  return date.toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:mm:ss
}

// Calculate fractional days between two dates
function getFractionalDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msInDay = 1000 * 60 * 60 * 24;
  const diff = (end - start) / msInDay; // fractional days
  return diff > 0 ? diff : 0;
}

async function updateMortuaryCharges() {
  const now = getKenyanDateTime();
  console.log(`[${new Date().toISOString()}] 🔄 Recalculating mortuary charges...`);

  try {
    // Fetch active deceased
    const deceasedList = await safeQuery(`
      SELECT deceased_id, rate_category, created_at, last_charge_update,
             total_mortuary_charge, mortuary_charge, currency, usd_charge_rate, embalming_cost
      FROM deceased
      WHERE created_at IS NOT NULL AND (status IS NULL OR status != 'Complete')
    `);

    for (const d of deceasedList) {
      const { deceased_id, rate_category, created_at, last_charge_update, total_mortuary_charge = 0, currency, usd_charge_rate, embalming_cost } = d;

      // Determine currency for display
      const cur = currency || 'KES';

      console.log(`Processing deceased ID: ${deceased_id}`);

      // Base rate per day
      const baseRate = cur === 'USD' ? parseFloat(usd_charge_rate || 130) : (rate_category === 'premium' ? 5000 : 3000);
      if (baseRate <= 0) continue;

      // Fractional days since last update
      let lastUpdate = last_charge_update ? new Date(last_charge_update) : new Date(created_at);
      if (isNaN(lastUpdate.getTime())) lastUpdate = new Date(now);
      const fractionalDays = getFractionalDays(lastUpdate, now);

      // Coffin charges (per deceased)
      const coffinRows = await safeQuery(`
        SELECT c.price, ci.quantity
        FROM coffin_issue ci
        JOIN coffins c ON ci.coffin_id = c.coffin_id
        WHERE ci.rfid = ?
      `, [deceased_id]);
      const coffinCharges = coffinRows.reduce((sum, c) => sum + parseFloat(c.price || 0) * parseInt(c.quantity || 1), 0);

      // Extra charges
      const extraRows = await safeQuery(`SELECT amount FROM extra_charges WHERE deceased_id = ?`, [deceased_id]);
      const extraCharges = extraRows.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

      // Embalming cost
      const embalming = parseFloat(embalming_cost || 0);

      // Fractional mortuary charge
      const mortuaryCharge = fractionalDays * baseRate;

      // Ensure total_mortuary_charge is number
      const total_mortuary_charge_num = parseFloat(total_mortuary_charge || 0);

      // Total charge
      const totalCharge = total_mortuary_charge_num + mortuaryCharge + coffinCharges + embalming + extraCharges;

      // Log breakdown including currency
      console.log(`Deceased ${deceased_id} Charges Breakdown:`);
      console.log(`  Fractional Mortuary Charge: ${mortuaryCharge.toFixed(2)} ${cur}`);
      console.log(`  Coffin Charge: ${coffinCharges.toFixed(2)} ${cur}`);
      console.log(`  Embalming Charge: ${embalming.toFixed(2)} ${cur}`);
      console.log(`  Extra Services: ${extraCharges.toFixed(2)} ${cur}`);
      console.log(`  Total Charge: ${totalCharge.toFixed(2)} ${cur}`);

      // Update DB
      await safeQuery(`
        UPDATE deceased
        SET total_mortuary_charge = ?, last_charge_update = ?
        WHERE deceased_id = ?
      `, [totalCharge, now, deceased_id]);
    }

    console.log(`[${now}] ✅ All charges recalculated.`);

  } catch (err) {
    console.error('❌ Charge recalculation failed:', err.message);
    console.error(err.stack);

    const errorLog = `[${new Date().toISOString()}] Error: ${err.message}\nStack:\n${err.stack}\n\n`;
    fs.appendFile(path.join(logDir, 'mortuaryChargeErrors.log'), errorLog, fsErr => {
      if (fsErr) console.error('Failed to write log:', fsErr);
    });
  }
}

// Run periodically (adjust interval)
setInterval(updateMortuaryCharges, 10 * 1000);

module.exports = { updateMortuaryCharges };
