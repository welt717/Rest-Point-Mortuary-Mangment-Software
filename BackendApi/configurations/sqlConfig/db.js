// db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'restpointdatabase';
const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 50, // increased from 10
  queueLimit: 0,
  connectTimeout: 10000,
  dateStrings: true,
});


async function safeQuery(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error('❌ Query failed:', err);
    throw err;
  }
}

async function safeQueryOne(sql, params = []) {
  const rows = await safeQuery(sql, params);
  return rows[0] || null;
}

async function closeDB() {
  await pool.end();
  console.log('🛑 Database pool closed.');
}

async function initDB() {
  try {
    const conn = await pool.getConnection();
    console.log(`✅ Connected to MariaDB at ${DB_HOST}:${DB_PORT}, database: ${DB_NAME}`);
    conn.release();
  } catch (err) {
    console.error('❌ Failed to connect to MariaDB:', err);
    throw err;
  }
}
process.on('SIGINT', closeDB);
process.on('SIGTERM', closeDB);

module.exports = { pool,  initDB   ,  safeQuery, safeQueryOne, closeDB };
