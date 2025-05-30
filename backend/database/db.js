const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  supportBigNumbers: true,
  dateStrings: true
});

// Test the connection and database
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Connected to MySQL server');

    // Test the grade_levels table
    const [tables] = await connection.query('SHOW TABLES LIKE "grade_levels"');
    if (tables.length === 0) {
      console.log('grade_levels table does not exist');
      return;
    }

    // Check table structure
    const [columns] = await connection.query('SHOW COLUMNS FROM grade_levels');
    console.log('Table structure:', columns);

    // Check AUTO_INCREMENT value
    const [autoIncrement] = await connection.query(`
      SELECT AUTO_INCREMENT 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'school_management' 
      AND TABLE_NAME = 'grade_levels'
    `);
    console.log('AUTO_INCREMENT value:', autoIncrement[0]);

    // Reset AUTO_INCREMENT if needed
    if (autoIncrement[0].AUTO_INCREMENT === null) {
      console.log('Resetting AUTO_INCREMENT...');
      await connection.query('ALTER TABLE grade_levels AUTO_INCREMENT = 1');
      console.log('AUTO_INCREMENT reset successfully');
    }

    // Test if subjects table exists
    const [subjectsTable] = await connection.query('SHOW TABLES LIKE "subjects"');
    if (subjectsTable.length === 0) {
      console.log('Subjects table does not exist. Running initialization...');
      // You might want to run the initialization script here
    } else {
      console.log('Subjects table exists');
    }

    // Test if strands table exists
    const [strandsTable] = await connection.query('SHOW TABLES LIKE "strands"');
    if (strandsTable.length === 0) {
      console.log('Strands table does not exist. Running initialization...');
      // You might want to run the initialization script here
    } else {
      console.log('Strands table exists');
    }

    // Test if we can query the grade_levels table
    const [gradeLevels] = await connection.query('SELECT COUNT(*) as count FROM grade_levels');
    console.log('Number of grade levels in database:', gradeLevels[0].count);

  } catch (error) {
    console.error('Database connection test failed:', error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run the connection test
testConnection();

module.exports = pool; 