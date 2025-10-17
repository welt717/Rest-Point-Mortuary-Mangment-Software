const express = require('express');
const router = express.Router();
const uploadCoffinImage = require('../helpers/coffinsUpload');
const { createCoffin, getAllCoffins, assignCoffin } = require('../controllers/coffins/coffinControl');

// Fixed route - call createCoffin controller after file upload
router.post('/register-coffin', uploadCoffinImage.single('coffin_image'), createCoffin);

router.get('/all-coffins', getAllCoffins);
router.post('/assign-coffin', assignCoffin);

module.exports = router;