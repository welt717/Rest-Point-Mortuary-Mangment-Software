const express = require('express');
const router = express.Router();
const {
  registerHearse,
  updateHearse,
  deleteHearse,
  getAllHearses,
  getAvailableHearses,
  upload,
} = require('../controllers/hearseControllers/registerhearse');

// Register new hearse
router.post('/hearses', upload.single('image'), registerHearse);

// Update existing hearse
router.put('/hearses/:id', upload.single('image'), updateHearse);

// Delete hearse
router.delete('/hearses/:id', deleteHearse);

// Get all hearses
router.get('/hearses', getAllHearses);

// Get only available hearses
router.get('/hearses/available', getAvailableHearses);

module.exports = router;
