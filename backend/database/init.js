const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
  let connection;
  try {
    // Connect to MySQL server without specifying a database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS school_app');
    console.log('Database created or already exists');

    // Use the database
    await connection.query('USE school_app');

    // Read and execute sections.sql
    const sectionsSql = await fs.readFile(path.join(__dirname, 'sections.sql'), 'utf8');
    const sectionStatements = sectionsSql.split(';').map(stmt => stmt.trim()).filter(Boolean);
    for (const stmt of sectionStatements) {
      await connection.query(stmt);
    }
    console.log('Sections table created and sample data inserted');

    // Read and execute users.sql
    const usersSql = await fs.readFile(path.join(__dirname, 'users.sql'), 'utf8');
    const userStatements = usersSql.split(';').map(stmt => stmt.trim()).filter(Boolean);
    for (const stmt of userStatements) {
      await connection.query(stmt);
    }
    console.log('Users table created and sample data inserted');

    // Verify sections table structure
    const [sectionsColumns] = await connection.query('DESCRIBE sections');
    console.log('Sections table structure:', sectionsColumns);

    // Verify sections sample data
    const [sections] = await connection.query('SELECT * FROM sections WHERE deleted_at IS NULL');
    console.log('Sample sections:', sections);

    // Verify users table structure
    const [usersColumns] = await connection.query('DESCRIBE users');
    console.log('Users table structure:', usersColumns);

    // Verify users sample data
    const [users] = await connection.query('SELECT * FROM users WHERE deleted_at IS NULL');
    console.log('Sample users:', users);

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the initialization
initializeDatabase().catch(console.error); 