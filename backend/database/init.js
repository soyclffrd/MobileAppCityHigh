const mysql = require('mysql2/promise');
const fs = require('fs').promises;
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
    console.log('Using school_app database');

    // Drop existing table
    try {
      await connection.query('DROP TABLE IF EXISTS grade_levels');
      console.log('Dropped existing grade_levels table if it existed');
    } catch (error) {
      console.log('No existing grade_levels table to drop');
    }

    // Create the table with explicit settings
    await connection.query(`
      CREATE TABLE grade_levels (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(191) NOT NULL,
        description TEXT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY unique_grade_level_name (name)
      ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Created grade_levels table');

    // Add indexes
    await connection.query('CREATE INDEX idx_grade_levels_is_active ON grade_levels(is_active)');
    await connection.query('CREATE INDEX idx_grade_levels_created_at ON grade_levels(created_at)');
    await connection.query('CREATE INDEX idx_grade_levels_deleted_at ON grade_levels(deleted_at)');
    console.log('Added indexes');

    // Verify the table structure
    const [columns] = await connection.query('SHOW COLUMNS FROM grade_levels');
    console.log('Grade levels table structure:', columns);

    // Verify AUTO_INCREMENT
    const [autoIncrement] = await connection.query(`
      SELECT AUTO_INCREMENT 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'school_app' 
      AND TABLE_NAME = 'grade_levels'
    `);
    console.log('AUTO_INCREMENT value:', autoIncrement[0]);

    // Test insert
    try {
      const [result] = await connection.query(
        'INSERT INTO grade_levels (name, description, is_active) VALUES (?, ?, ?)',
        ['Test Grade', 'Test Description', true]
      );
      console.log('Test insert successful:', result);
      
      // Clean up test data
      await connection.query('DELETE FROM grade_levels WHERE name = ?', ['Test Grade']);
      console.log('Test data cleaned up');
    } catch (error) {
      console.error('Test insert failed:', error);
      throw error;
    }

    console.log('Database initialized successfully');
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