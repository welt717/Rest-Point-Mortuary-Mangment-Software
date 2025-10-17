const express = require("express");
const router = express.Router();
const { bookVisit, getPortalDeceasedById,downloadAutopsyPDF,getMinisterDeceasedRecords,
} = require("../controllers/portal/portal");

// ------------------- Book a Visit -------------------
// POST /api/portal/book-visit
router.post("/book-visit", bookVisit);

// ------------------- Get Portal Deceased By ID -------------------
// POST /api/portal/deceased
router.post("/deceased", getPortalDeceasedById);

// ------------------- Download Autopsy PDF -------------------
// POST /api/portal/download-autopsy
router.post("/download-autopsy", downloadAutopsyPDF);

// ------------------- Fetch Minister Records -------------------
// GET /api/portal/ministers
router.get("/ministers", getMinisterDeceasedRecords);

module.exports = router;
