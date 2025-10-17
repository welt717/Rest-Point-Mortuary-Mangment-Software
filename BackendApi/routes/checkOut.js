const express = require('express');
const router = express.Router();
const { upload, normalizePath } = require('../controllers/bodyCheckout/checkOut');
const { safeQuery } = require('../configurations/sqlConfig/db');

// Helper for generating clean short IDs
function generateShortId() {
  return 'CHK-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 10000).toString(36);
}

// Checkout endpoint
router.post(
  '/:deceased_id/checkout',
  upload.fields([
    { name: 'signature', maxCount: 1 },
    { name: 'idImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { collector_name, relationship } = req.body;
      const { deceased_id } = req.params;

      const idImagePath = normalizePath(req.files['idImage']?.[0]?.path);
      const signaturePath = normalizePath(req.files['signature']?.[0]?.path);

      // Generate clean checkout ID
      const checkoutId = generateShortId();

      // 1️⃣ Insert into body_checkouts table
      await safeQuery(
        `INSERT INTO body_checkouts 
          (id, deceased_id, collector_name, relationship, id_image_path, signature_path, created_at, completed) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), 0)`,
        [checkoutId, deceased_id, collector_name, relationship, idImagePath, signaturePath]
      );

      // 2️⃣ Update deceased status to "Complete"
      await safeQuery(
        `UPDATE deceased SET status = ?, updated_at = NOW() WHERE deceased_id = ?`,
        ['Complete', deceased_id]
      );

      res.json({
        message: 'Checkout recorded successfully and deceased status updated to Completed',
        data: {
          id: checkoutId,
          collector_name,
          relationship,
          deceased_id,
          idImageUrl: idImagePath,
          signatureUrl: signaturePath
        }
      });
    } catch (err) {
      console.error('Checkout Error:', err);
      res.status(500).json({ error: 'Something went wrong while saving to DB', details: err.message });
    }
  }
);

module.exports = router;
