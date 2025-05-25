const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  let connection;
  try {
    // Create connection without database
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
    const sectionsSql = fs.readFileSync(path.join(__dirname, 'sections.sql'), 'utf8');
    const statements = sectionsSql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    console.log('Sections table created and sample data inserted');

    // Verify the table structure
    const [columns] = await connection.query('SHOW COLUMNS FROM sections');
    console.log('Sections table structure:', columns);

    // Verify the sample data
    const [sections] = await connection.query('SELECT * FROM sections');
    console.log('Sample sections:', sections);

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the initialization
initializeDatabase().catch(console.error); 