const mysql = require('mysql2/promise');

async function setupDatabase() {
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

    // Create teachers table
    await connection.query(`