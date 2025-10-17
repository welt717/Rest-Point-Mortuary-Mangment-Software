const express = require('express');
const router = express.Router();
const extraChargesController = require('../controllers/extraChargesController');

// Route to add a new extra charge
router.post('/extra-charges', extraChargesController.addExtraCharge);

// Route to update an existing extra charge
router.put('/extra-charges/:id', extraChargesController.updateExtraCharge);

// Route to get all extra charges for a deceased
router.get('/extra-charges/deceased/:deceased_id', extraChargesController.getExtraChargesForDeceased);

// Route to delete an extra charge
router.delete('/extra-charges/:id', extraChargesController.deleteExtraCharge);

module.exports = router;
