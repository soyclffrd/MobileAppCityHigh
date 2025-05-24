const mysql = require('mysql2/promise');
const db = require('../db');

async function migrate() {
  try {
    // Check if phone column exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'teachers' 
      AND COLUMN_NAME = 'phone'
    `);

    // Add phone column if it doesn't exist
    if (columns.length === 0) {
      await db.query(`
        ALTER TABLE teachers 
        ADD COLUMN phone VARCHAR(20) NOT NULL DEFAULT 'Not Provided'
      `);
      console.log('Successfully added phone column to teachers table');
    } else {
      console.log('Phone column already exists');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 