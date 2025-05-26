const mysql = require('mysql2/promise');

async function migrate() {
  let connection;
  try {
    // Create connection without database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('Connected to MySQL server');

    // Use the database
    await connection.query('USE school_app');
    console.log('Using school_app database');

    // First, update any existing users to use the new role values
    await connection.query(`
      UPDATE users 
      SET role = CASE 
        WHEN role = 'admin' THEN 'Admin'
        WHEN role = 'user' THEN 'Student'
        WHEN role = 'teacher' THEN 'Teacher'
        ELSE role
      END
    `);
    console.log('Updated existing user roles');

    // Then modify the column to use the new enum values
    await connection.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('Admin', 'Student', 'Teacher') NOT NULL
    `);
    console.log('Updated role column enum values');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the migration
migrate().catch(console.error); 