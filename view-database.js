// Quick script to view database contents
// Run with: node view-database.js

import Database from 'better-sqlite3';

const db = new Database('./db.sqlite');

console.log('\n📊 DATABASE OVERVIEW\n' + '='.repeat(50));

// List all tables
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  ORDER BY name
`).all();

console.log('\n📋 Tables in database:');
tables.forEach(t => console.log(`  - ${t.name}`));

// Function to show table contents
function showTable(tableName, limit = 10) {
  try {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
    const rows = db.prepare(`SELECT * FROM ${tableName} LIMIT ${limit}`).all();
    
    console.log(`\n\n📄 ${tableName.toUpperCase()} (${count.count} total rows)`);
    console.log('-'.repeat(50));
    
    if (rows.length === 0) {
      console.log('  (empty table)');
    } else {
      rows.forEach((row, i) => {
        console.log(`\n  Row ${i + 1}:`);
        Object.entries(row).forEach(([key, value]) => {
          const displayValue = typeof value === 'string' && value.length > 100 
            ? value.substring(0, 100) + '...' 
            : value;
          console.log(`    ${key}: ${displayValue}`);
        });
      });
    }
  } catch (err) {
    console.log(`  Error reading table: ${err.message}`);
  }
}

// Show key tables
console.log('\n' + '='.repeat(50));
showTable('users');
showTable('schools');
showTable('applications');
showTable('videos');
showTable('user_video_progress', 5);
showTable('user_credits');

console.log('\n' + '='.repeat(50));
console.log('\n✅ Done! To query specific data, use:');
console.log('   const users = db.prepare("SELECT * FROM users WHERE role = ?").all("student");');
console.log('\n📖 More info: https://github.com/WiseLibs/better-sqlite3/wiki/API\n');

db.close();
