const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection and database
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');

    // Test if subjects table exists
    const [tables] = await connection.query('SHOW TABLES LIKE "subjects"');
    if (tables.length === 0) {
      console.log('Subjects table does not exist. Running initialization...');
      // You might want to run the initialization script here
    } else {
      console.log('Subjects table exists');
    }

    // Test if strands table exists
    const [strandTables] = await connection.query('SHOW TABLES LIKE "strands"');
    if (strandTables.length === 0) {
      console.log('Strands table does not exist. Running initialization...');
      // You might want to run the initialization script here
    } else {
      console.log('Strands table exists');
    }

    connection.release();
  } catch (err) {
    console.error('Error connecting to the database:', err);
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('Database "school_app" does not exist. Please run the initialization script first.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('Could not connect to MySQL server. Please make sure MySQL is running.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Please check your MySQL username and password.');
    }
    throw err;
  }
}

// Run the connection test
testConnection().catch(console.error);

module.exports = pool; 