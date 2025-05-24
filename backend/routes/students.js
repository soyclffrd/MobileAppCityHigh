const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload with file type filter
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = function (req, file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
};

const upload = multer({ storage: storage, fileFilter });

// Multer error handling middleware
function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError || err) {
    console.error('Multer error:', err);
    return res.status(400).json({ success: false, message: err.message || 'File upload error' });
  }
  next();
}

// Get all students
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json({ success: true, students: rows });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Add new student
router.post('/', upload.single('avatar'), multerErrorHandler, async (req, res) => {
  try {
    const { name, gender, grade_level, strand, section } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      'INSERT INTO students (name, gender, grade_level, strand, section, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [name, gender, grade_level, strand, section, avatar]
    );

    const [newStudent] = await pool.query('SELECT * FROM students WHERE id = ?', [result.insertId]);
    res.json({ success: true, student: newStudent[0] });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Update student (POST for file upload compatibility)
router.post('/:id', upload.single('avatar'), multerErrorHandler, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender, grade_level, strand, section } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : req.body.avatar;

    await pool.query(
      'UPDATE students SET name = ?, gender = ?, grade_level = ?, strand = ?, section = ?, avatar = ? WHERE id = ?',
      [name, gender, grade_level, strand, section, avatar, id]
    );

    const [updatedStudent] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
    res.json({ success: true, student: updatedStudent[0] });
  } catch (error) {
    console.error('Error updating student (POST):', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM students WHERE id = ?', [id]);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router; 