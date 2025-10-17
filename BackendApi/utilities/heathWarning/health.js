// utilities/healthCheck.js
const os = require('os');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const { promisify } = require('util');

// Database path
const dbPath = path.resolve(__dirname, '../configurations/sqlConfig/restpoint.db');

// Open SQLite database with read/write
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

// Promisify db.get
const dbGetAsync = promisify(db.get).bind(db);

async function getHealthStatus() {
  let dbOk = true;

  try {
    await dbGetAsync(`SELECT 1`);
  } catch (err) {
    console.error('❌ Database health check failed:', err.message);
    dbOk = false;
  }

  const cpuLoad = os.loadavg()[0]; // 1-minute avg load
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMemPercent = ((totalMem - freeMem) / totalMem) * 100;

  const heap = process.memoryUsage();

  return {
    message: dbOk && usedMemPercent < 90 ? "✅ Server is healthy" : "⚠️ Server has warnings",
    timestamp: new Date().toISOString(),
    server: {
      uptimeSeconds: process.uptime(),
      cpuLoad,
      memory: {
        total: totalMem,
        free: freeMem,
        usedPercent: usedMemPercent.toFixed(2)
      },
      heap: {
        usedMB: (heap.heapUsed / 1024 / 1024).toFixed(2),
        totalMB: (heap.heapTotal / 1024 / 1024).toFixed(2),
        usagePercent: ((heap.heapUsed / heap.heapTotal) * 100).toFixed(2)
      }
    },
    database: { connected: dbOk },
    status: dbOk && usedMemPercent < 90 ? "healthy" : "warning"
  };
}

module.exports = { getHealthStatus };
