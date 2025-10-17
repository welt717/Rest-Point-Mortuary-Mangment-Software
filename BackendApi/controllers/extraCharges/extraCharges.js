const { safeQuery } = require('../configurations/sqlConfig/db');
const path = require('path');

// Function to add a new extra charge
async function addExtraCharge(req, res) {
  const { deceased_id, charge_type, amount, requested_by, service_date, notes } = req.body;

  if (!deceased_id || !charge_type || !amount || !service_date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = `
      INSERT INTO extra_charges (deceased_id, charge_type, amount, requested_by, service_date, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await safeQuery(query, [deceased_id, charge_type, amount, requested_by || null, service_date, notes || null]);

    return res.status(201).json({ message: 'Extra charge added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding extra charge:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Function to update an existing extra charge
async function updateExtraCharge(req, res) {
  const { id } = req.params;
  const { charge_type, amount, requested_by, service_date, status, notes } = req.body;

  if (!charge_type && !amount && !service_date && !status && !notes) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  try {
    const fieldsToUpdate = [];
    const valuesToUpdate = [];

    if (charge_type) {
      fieldsToUpdate.push('charge_type = ?');
      valuesToUpdate.push(charge_type);
    }
    if (amount) {
      fieldsToUpdate.push('amount = ?');
      valuesToUpdate.push(amount);
    }
    if (requested_by) {
      fieldsToUpdate.push('requested_by = ?');
      valuesToUpdate.push(requested_by);
    }
    if (service_date) {
      fieldsToUpdate.push('service_date = ?');
      valuesToUpdate.push(service_date);
    }
    if (status) {
      fieldsToUpdate.push('status = ?');
      valuesToUpdate.push(status);
    }
    if (notes) {
      fieldsToUpdate.push('notes = ?');
      valuesToUpdate.push(notes);
    }

    valuesToUpdate.push(id); // Append the ID of the charge to update

    const query = `
      UPDATE extra_charges
      SET ${fieldsToUpdate.join(', ')}
      WHERE id = ?
    `;
    await safeQuery(query, valuesToUpdate);

    return res.status(200).json({ message: 'Extra charge updated successfully' });
  } catch (error) {
    console.error('Error updating extra charge:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Function to get all extra charges for a specific deceased
async function getExtraChargesForDeceased(req, res) {
  const { deceased_id } = req.params;

  if (!deceased_id) {
    return res.status(400).json({ message: 'Deceased ID is required' });
  }

  try {
    const query = 'SELECT * FROM extra_charges WHERE deceased_id = ?';
    const extraCharges = await safeQuery(query, [deceased_id]);

    return res.status(200).json({ extraCharges });
  } catch (error) {
    console.error('Error fetching extra charges:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Function to delete an extra charge
async function deleteExtraCharge(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Charge ID is required' });
  }

  try {
    const query = 'DELETE FROM extra_charges WHERE id = ?';
    const result = await safeQuery(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Extra charge not found' });
    }

    return res.status(200).json({ message: 'Extra charge deleted successfully' });
  } catch (error) {
    console.error('Error deleting extra charge:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  addExtraCharge,
  updateExtraCharge,
  getExtraChargesForDeceased,
  deleteExtraCharge,
};
