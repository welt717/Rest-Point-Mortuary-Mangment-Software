const express = require('express');
const router = express.Router();

const { getMortuaryAnalytics  ,    exportDeceasedAutopsy  } = require('../controllers/analyticsRevenue/analytics');
const  {
    getReportData
}  =  require('../controllers/analyticsRevenue/data')
// Route for general analytics (returns JSON data)
router.get('/moltuary-analytics', getMortuaryAnalytics);

// Route for exporting analytics to Excel
router.get('/moltuary-analytics/export',  exportDeceasedAutopsy);
router.get('/moltuary-analytics/generate-report', getReportData);





module.exports = router;