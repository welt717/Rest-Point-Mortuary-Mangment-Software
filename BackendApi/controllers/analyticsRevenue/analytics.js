const asyncHandler = require('express-async-handler');
const natural = require('natural');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit'); 
const { safeQuery, safeQueryOne } = require('../../configurations/sqlConfig/db'); // Correct import

// ----------------------
// Classifier setup (omitted for brevity)
// ----------------------
const classifier = new natural.BayesClassifier();
classifier.addDocument('died at home', 'home');
classifier.addDocument('passed away at home', 'home');
classifier.addDocument('passed while sleeping', 'home');
classifier.addDocument('found dead in bed', 'home');
classifier.addDocument('collapsed in his house', 'home');
classifier.addDocument('lifeless in bed', 'home');
classifier.addDocument('died while asleep', 'home');
classifier.addDocument('died in his sleep at home', 'home');
classifier.addDocument('body found in house', 'home');
classifier.addDocument('died in hospital', 'hospital');
classifier.addDocument('passed away at the clinic', 'hospital');
classifier.addDocument('received treatment in hospital', 'hospital');
classifier.addDocument('admitted and died at health centre', 'hospital');
classifier.addDocument('died while undergoing treatment', 'hospital');
classifier.addDocument('died after long illness', 'hospital');
classifier.addDocument('hospital', 'hospital');
classifier.addDocument('health center', 'hospital');
classifier.addDocument('killed in a road accident', 'accident');
classifier.addDocument('died in a car crash', 'accident');
classifier.addDocument('motorbike accident', 'accident');
classifier.addDocument('run over by a car', 'accident');
classifier.addDocument('head-on collision', 'accident');
classifier.addDocument('died on the way to hospital', 'way_to_hospital');
classifier.addDocument('died while being rushed to hospital', 'way_to_hospital');
classifier.addDocument('collapsed and died in ambulance', 'way_to_hospital');
classifier.addDocument('passed away before reaching hospital', 'way_to_hospital');
classifier.addDocument('dead before arrival at health center', 'way_to_hospital');
classifier.addDocument('unknown cause', 'unknown');
classifier.addDocument('location unknown', 'unknown');
classifier.addDocument('not specified', 'unknown');
classifier.addDocument('undisclosed location', 'unknown');
classifier.train();

// ----------------------
// Helpers (UPDATED)
// ----------------------
// Re-map your helpers to use the imported functions
const dbGet = async (sql, params = []) => {
    return await safeQueryOne(sql, params);
};

const dbAll = async (sql, params = []) => {
    return await safeQuery(sql, params);
};

function classifyPlace(description) {
    if (!description) return 'unknown';
    return classifier.classify(description.toLowerCase());
}

// ----------------------
// Centralized Data Fetching Logic (UNCHANGED, now it works!)
// ----------------------
const fetchAnalyticsData = async (yearFilter) => {
    const yearCondition = yearFilter ? `AND YEAR(created_at) = ?` : '';
    const yearConditionPostmortem = yearFilter ? `AND YEAR(date) = ?` : '';
    const yearConditionDispatch = yearFilter ? `AND YEAR(dispatch_date) = ?` : '';
    const yearConditionVisitors = yearFilter ? `AND YEAR(check_in_time) = ?` : '';
    
    // The dbGet and dbAll calls now correctly use the safe wrappers
    const mortuaryInfo = await dbGet(`SELECT name FROM mortuaries LIMIT 1`);
    const titleYear = yearFilter ? yearFilter : 'All Years';
    const dailyDeathsRow = await dbGet(`SELECT COUNT(*) AS count FROM deceased WHERE DATE(date_registered) = CURDATE() ${yearCondition}`, [yearFilter]);
    const weeklyDeathsRow = await dbGet(`SELECT COUNT(*) AS count FROM deceased WHERE DATE(date_registered) BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE() ${yearCondition}`, [yearFilter]);
    const monthlyDeathsRow = await dbGet(`SELECT COUNT(*) AS count FROM deceased WHERE DATE_FORMAT(date_registered, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m') ${yearCondition}`, [yearFilter]);
    const avgStayRow = await dbGet(`SELECT AVG(DATEDIFF(dispatch_date, date_registered)) AS avg_stay FROM deceased WHERE dispatch_date IS NOT NULL ${yearCondition}`, [yearFilter]);
    const avgStayByCause = await dbAll(`SELECT cause_of_death, AVG(DATEDIFF(dispatch_date, date_registered)) AS avg_stay FROM deceased WHERE dispatch_date IS NOT NULL ${yearCondition} GROUP BY cause_of_death`, [yearFilter]);
    const allPlaces = await dbAll(`SELECT place_of_death FROM deceased WHERE place_of_death IS NOT NULL ${yearCondition}`, [yearFilter]);
    const deathSources = { hospital: 0, home: 0, accident: 0, way_to_hospital: 0, other: 0, unknown: 0 };
    allPlaces.forEach(row => {
        const category = classifyPlace(row.place_of_death);
        deathSources[category] !== undefined ? deathSources[category]++ : deathSources.other++;
    });
    const dispatchCountRow = await dbGet(`SELECT COUNT(*) AS count FROM vehicle_dispatch WHERE 1=1 ${yearConditionDispatch}`, [yearFilter]);
    const postmortemCountRow = await dbGet(`SELECT COUNT(*) AS count FROM postmortem WHERE 1=1 ${yearConditionPostmortem}`, [yearFilter]);
    const visitorsCountRow = await dbGet(`SELECT COUNT(*) AS count FROM visitors WHERE 1=1 ${yearConditionVisitors}`, [yearFilter]);
    const kinStats = await dbGet(`SELECT 
        SUM(CASE WHEN k.deceased_id IS NULL THEN 1 ELSE 0 END) AS unclaimed,
        SUM(CASE WHEN k.deceased_id IS NOT NULL THEN 1 ELSE 0 END) AS claimed 
        FROM deceased d 
        LEFT JOIN next_of_kin k ON d.deceased_id = k.deceased_id 
        WHERE 1=1 ${yearCondition}`, [yearFilter]);
    const unclaimedBodies = kinStats.unclaimed || 0;
    const claimedBodies = kinStats.claimed || 0;
    const occupancyRow = await dbGet(`SELECT COUNT(*) AS current_occupancy FROM deceased WHERE dispatch_date IS NULL`);
    const monthlyTrendsRaw = await dbAll(`SELECT DATE_FORMAT(date_registered, '%Y-%m') AS month_year, COUNT(*) AS count 
        FROM deceased WHERE 1=1 ${yearCondition} 
        GROUP BY month_year ORDER BY month_year ASC`, [yearFilter]);
    const monthlyTrends = monthlyTrendsRaw.map(row => ({ month_year: row.month_year, count: row.count }));
    let seasonalInsight = '';
    if (yearFilter) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthlyTrendsByMonth = monthlyTrendsRaw.map(row => ({ 
            month_num: parseInt(row.month_year.substring(5)), 
            month_name: monthNames[parseInt(row.month_year.substring(5)) - 1], 
            count: row.count 
        }));
        const aprilData = monthlyTrendsByMonth.find(m => m.month_num === 4);
        if (aprilData) {
            const totalYearDeaths = monthlyTrendsByMonth.reduce((sum, m) => sum + m.count, 0);
            const avgMonthlyDeaths = totalYearDeaths / monthlyTrendsByMonth.length;
            const percentageAboveAvg = ((aprilData.count - avgMonthlyDeaths) / avgMonthlyDeaths) * 100;
            seasonalInsight = percentageAboveAvg > 0
                ? `Deaths in April are ${percentageAboveAvg.toFixed(1)}% above the yearly monthly average. Possible seasonal factors: increased road accidents during holiday travel.`
                : `Deaths in April are ${Math.abs(percentageAboveAvg).toFixed(1)}% below the yearly monthly average.`;
        }
    }
    const deathsByCounty = await dbAll(`SELECT county, COUNT(*) as count 
        FROM deceased WHERE 1=1 ${yearCondition} 
        GROUP BY county ORDER BY count DESC`, [yearFilter]);
    const deceasedData = await dbAll(`SELECT deceased.deceased_id, deceased.full_name, deceased.county, deceased.date_of_death, 
        deceased.place_of_death, deceased.cause_of_death, postmortem.findings 
        FROM deceased LEFT JOIN postmortem ON deceased.deceased_id = postmortem.deceased_id 
        WHERE 1=1 ${yearCondition}`, [yearFilter]);
    const autopsyData = await dbAll(`SELECT deceased_id, date, findings 
        FROM postmortem WHERE 1=1 ${yearConditionPostmortem}`, [yearFilter]);
    const coffinInventory = await dbAll(`SELECT type, material, price, quantity, supplier, date_added FROM coffins`);
    const monthlyRevenue = await dbAll(`
        SELECT DATE_FORMAT(payment_date, '%Y-%m') AS month_year, SUM(amount) AS total_revenue 
        FROM payments
        WHERE 1=1 ${yearFilter ? `AND YEAR(payment_date) = ?` : ''}
        GROUP BY month_year ORDER BY month_year ASC
    `, [yearFilter]);
    const coffinSales = await dbAll(`
        SELECT c.type, SUM(ci.quantity) as sales_count, SUM(ci.quantity * c.price) as revenue
        FROM coffin_issue ci
        JOIN coffins c ON ci.coffin_id = c.coffin_id
        WHERE 1=1 ${yearFilter ? `AND YEAR(ci.issue_date) = ?` : ''}
        GROUP BY c.type
    `, [yearFilter]);
    const coffinRevenueByMonth = await dbAll(`
        SELECT DATE_FORMAT(ci.issue_date, '%Y-%m') as month_year, SUM(ci.quantity * c.price) as revenue
        FROM coffin_issue ci
        JOIN coffins c ON ci.coffin_id = c.coffin_id
        WHERE 1=1 ${yearFilter ? `AND YEAR(ci.issue_date) = ?` : ''}
        GROUP BY month_year ORDER BY month_year ASC
    `, [yearFilter]);
    return {
        mortuaryInfo, titleYear, dailyDeathsRow, weeklyDeathsRow, monthlyDeathsRow,
        avgStayRow, avgStayByCause, allPlaces, deathSources, dispatchCountRow,
        postmortemCountRow, visitorsCountRow, unclaimedBodies, claimedBodies,
        occupancyRow, monthlyTrends, seasonalInsight, deathsByCounty, deceasedData, autopsyData,
        coffinInventory,
        monthlyRevenue,
        coffinSales,
        coffinRevenueByMonth
    };
};

// ----------------------
// Main Analytics Route (JSON Output)
// ----------------------
const getMortuaryAnalytics = asyncHandler(async (req, res) => {
    const yearFilter = req.query.year ? parseInt(req.query.year, 10) : null;
    try {
        const data = await fetchAnalyticsData(yearFilter);
        const monthlyRevenue = data.monthlyRevenue.map(row => ({
            name: row.month_year,
            revenue: row.total_revenue
        }));
        const coffinSalesData = data.coffinSales.map(row => ({
            name: row.type,
            sales: row.sales_count,
            revenue: row.revenue
        }));
        const coffinRevenueByMonthData = data.coffinRevenueByMonth.map(row => ({
            name: row.month_year,
            revenue: row.revenue
        }));
        res.json({
            mortuary: data.mortuaryInfo?.name || 'N/A',
            year: data.titleYear,
            reportedCases: {
                daily: data.dailyDeathsRow.count,
                weekly: data.weeklyDeathsRow.count,
                monthly: data.monthlyDeathsRow.count
            },
            averageStayDays: data.avgStayRow.avg_stay ? parseFloat(data.avgStayRow.avg_stay.toFixed(2)) : 0,
            avgStayByCause: data.avgStayByCause,
            deathSources: data.deathSources,
            monthlyTrends: data.monthlyTrends,
            seasonalInsight: data.seasonalInsight,
            postmortems: data.postmortemCountRow.count,
            dispatches: data.dispatchCountRow.count,
            visitors: data.visitorsCountRow.count,
            unclaimedBodies: data.unclaimedBodies,
            claimedBodies: data.claimedBodies,
            currentOccupancy: data.occupancyRow.current_occupancy,
            deathsByCounty: data.deathsByCounty,
            coffinInventory: data.coffinInventory,
            monthlyRevenue: monthlyRevenue,
            coffinSalesData: coffinSalesData,
            coffinRevenueByMonth: coffinRevenueByMonthData
        });
    } catch (err) {
        console.error('❌ Error in analytics:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------------
// Function to export only Deceased and Autopsy data to Excel
// ----------------------
const exportDeceasedAutopsy = asyncHandler(async (req, res) => {
    const yearFilter = req.query.year ? parseInt(req.query.year, 10) : null;
    try {
        const data = await fetchAnalyticsData(yearFilter);
        const workbook = new ExcelJS.Workbook();
        const deceasedSheet = workbook.addWorksheet('Deceased & Autopsy Info');

        deceasedSheet.columns = [
            { header: 'Full Name', key: 'full_name', width: 30 },
            { header: 'County', key: 'county', width: 20 },
            { header: 'Autopsy Findings', key: 'findings', width: 80 }
        ];

        data.deceasedData.forEach(row => {
            deceasedSheet.addRow({
                full_name: row.full_name,
                county: row.county,
                findings: row.findings || 'N/A'
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="deceased_autopsy_report_${data.titleYear}.xlsx"`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('❌ Error in Excel export:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = { getMortuaryAnalytics, exportDeceasedAutopsy };