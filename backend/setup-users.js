const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setupUsersTable() {
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
    await connection.query('CREATE DATABASE IF NOT EXISTS school_management');
    console.log('Database created or already exists');

    // Use the database
    await connection.query('USE school_management');

    // Drop the existing users table
    await connection.query('DROP TABLE IF EXISTS users');
    console.log('Dropped existing users table');

    // Create users table with correct schema
    await connection.query(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('Admin', 'Student', 'Teacher') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      )
    `);
    console.log('Created users table with correct schema');

    // Create indexes
    await connection.query('CREATE INDEX idx_users_role ON users(role)');
    await connection.query('CREATE INDEX idx_users_deleted_at ON users(deleted_at)');
    console.log('Created indexes');

    // Insert sample data
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await connection.query(`
      INSERT INTO users (name, email, password, role) VALUES
      ('John Doe', 'john@example.com', ?, 'Admin'),
      ('Jane Smith', 'jane@example.com', ?, 'Teacher'),
      ('Bob Johnson', 'bob@example.com', ?, 'Student')
    `, [hashedPassword, hashedPassword, hashedPassword]);
    console.log('Inserted sample data');

    console.log('Users table setup completed successfully');
  } catch (error) {
    console.error('Error setting up users table:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupUsersTable(); 