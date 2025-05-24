const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.json({ success: false, message: 'All fields are required' });
  }
  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.json({ success: false, message: 'Email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role]
    );
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: 'Registration failed' });
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