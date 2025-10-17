const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

// This file now only connects to the 

async function setupDatabase() {
  const db = await sqlite.open({
    filename: './restpoint.db',
    driver: sqlite3.Database,
  });

  
  
  console.log('✅ Connected to SQLite database.');

  await db.close();

  console.log('🛑 Database connection closed.');
}

setupDatabase().catch(console.error);
