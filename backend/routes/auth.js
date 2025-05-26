const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  console.log('Registration request received:', req.body);
  const { name, email, password, role } = req.body;

  // Validate input
  if (!name || !email || !password || !role) {
    console.log('Missing fields:', { name: !!name, email: !!email, password: !!password, role: !!role });
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Validate role
  const validRoles = ['Admin', 'Student', 'Teacher'];
  if (!validRoles.includes(role)) {
    console.log('Invalid role:', role);
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  try {
    // Check if the email already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      console.log('Email already exists:', email);
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    console.log('User registered successfully:', { userId: result.insertId, name, email, role });
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: 'Email and password required' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 1) {
      const user = rows[0];
      if (await bcrypt.compare(password, user.password)) {
        delete user.password;
        return res.json({ success: true, user });
      }
    }
    res.json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    res.json({ success: false, message: 'Login failed' });
  }
});

module.exports = router; 