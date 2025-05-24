const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/teachers';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

// Get all teachers
router.get('/', async (req, res) => {
  try {
    const [teachers] = await db.query('SELECT * FROM teachers');
    res.json({ success: true, teachers });
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Add a teacher
router.post('/', upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, phone, subject, gender } = req.body;
    const avatar = req.file ? `/uploads/teachers/${req.file.filename}` : null;

    const [result] = await db.query(
      'INSERT INTO teachers (name, email, phone, subject, gender, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, subject, gender, avatar]
    );

    res.json({ 
      success: true, 
      teacher: {
        id: result.insertId,
        name,
        email,
        phone,
        subject,
        gender,
        avatar
      }
    });
  } catch (err) {
    console.error('Error adding teacher:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Edit a teacher
router.post('/:id', upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, phone, subject, gender } = req.body;
    const teacherId = req.params.id;
    
    // First get the current teacher data
    const [results] = await db.query('SELECT avatar FROM teachers WHERE id = ?', [teacherId]);
    let avatar = results[0]?.avatar;

    // If new file uploaded, update avatar path
    if (req.file) {
      // Delete old avatar file if exists
      if (avatar) {
        const oldPath = path.join(__dirname, '..', avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      avatar = `/uploads/teachers/${req.file.filename}`;
    }

    await db.query(
      'UPDATE teachers SET name=?, email=?, phone=?, subject=?, gender=?, avatar=? WHERE id=?',
      [name, email, phone, subject, gender, avatar, teacherId]
    );

    res.json({ 
      success: true,
      teacher: {
        id: teacherId,
        name,
        email,
        phone,
        subject,
        gender,
        avatar
      }
    });
  } catch (err) {
    console.error('Error updating teacher:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Delete a teacher
router.delete('/:id', async (req, res) => {
  try {
    const teacherId = req.params.id;

    // First get the teacher's avatar
    const [results] = await db.query('SELECT avatar FROM teachers WHERE id = ?', [teacherId]);

    // Delete avatar file if exists
    if (results[0]?.avatar) {
      const avatarPath = path.join(__dirname, '..', results[0].avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Delete teacher from database
    await db.query('DELETE FROM teachers WHERE id = ?', [teacherId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting teacher:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router; 