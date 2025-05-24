const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET all subjects with pagination and search
router.get('/', async (req, res) => {
  try {
    console.log('GET /subjects - Query params:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = 'SELECT * FROM subjects';
    let countQuery = 'SELECT COUNT(*) as total FROM subjects';
    const queryParams = [];

    if (search) {
      query += ' WHERE name LIKE ? OR code LIKE ?';
      countQuery += ' WHERE name LIKE ? OR code LIKE ?';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    console.log('Executing query:', query);
    console.log('Query params:', queryParams);

    const [subjects] = await db.query(query, queryParams);
    const [totalResult] = await db.query(countQuery, search ? [`%${search}%`, `%${search}%`] : []);

    console.log('Query results:', { subjects, total: totalResult[0].total });

    res.json({
      success: true,
      subjects,
      total: totalResult[0].total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error in GET /subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET single subject
router.get('/:id', async (req, res) => {
  try {
    console.log('GET /subjects/:id - ID:', req.params.id);
    const [subjects] = await db.query('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
    
    if (subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    console.log('Found subject:', subjects[0]);
    res.json({
      success: true,
      subject: subjects[0]
    });
  } catch (error) {
    console.error('Error in GET /subjects/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST new subject
router.post('/', async (req, res) => {
  try {
    console.log('POST /subjects - Request body:', req.body);
    const { name, code, status, gradeLevel, strand, students, description } = req.body;

    // Validate required fields
    if (!name || !code || !gradeLevel || !strand) {
      console.log('Missing required fields:', { name, code, gradeLevel, strand });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, code, gradeLevel, and strand are required'
      });
    }

    // Check if subject code already exists
    const [existingSubjects] = await db.query('SELECT id FROM subjects WHERE code = ?', [code]);
    if (existingSubjects.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject code already exists'
      });
    }

    const query = `
      INSERT INTO subjects (name, code, status, grade_level, strand, students, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [name, code, status || 'Available', gradeLevel, strand, students || 0, description || ''];

    console.log('Executing insert query:', query);
    console.log('Insert values:', values);

    const [result] = await db.query(query, values);
    const [newSubject] = await db.query('SELECT * FROM subjects WHERE id = ?', [result.insertId]);

    console.log('Created new subject:', newSubject[0]);
    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      subject: newSubject[0]
    });
  } catch (error) {
    console.error('Error in POST /subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subject',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT update subject
router.put('/:id', async (req, res) => {
  try {
    console.log('PUT /subjects/:id - ID:', req.params.id);
    console.log('Request body:', req.body);
    const { name, code, status, gradeLevel, strand, students, description } = req.body;

    // Validate required fields
    if (!name || !code || !gradeLevel || !strand) {
      console.log('Missing required fields:', { name, code, gradeLevel, strand });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, code, gradeLevel, and strand are required'
      });
    }

    // Check if subject exists
    const [existingSubjects] = await db.query('SELECT id FROM subjects WHERE id = ?', [req.params.id]);
    if (existingSubjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if code is being changed and if new code already exists
    if (code !== existingSubjects[0].code) {
      const [duplicateSubjects] = await db.query('SELECT id FROM subjects WHERE code = ? AND id != ?', [code, req.params.id]);
      if (duplicateSubjects.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Subject code already exists'
        });
      }
    }

    const query = `
      UPDATE subjects 
      SET name = ?, code = ?, status = ?, grade_level = ?, strand = ?, students = ?, description = ?
      WHERE id = ?
    `;
    const values = [name, code, status, gradeLevel, strand, students || 0, description || '', req.params.id];

    console.log('Executing update query:', query);
    console.log('Update values:', values);

    await db.query(query, values);
    const [updatedSubject] = await db.query('SELECT * FROM subjects WHERE id = ?', [req.params.id]);

    console.log('Updated subject:', updatedSubject[0]);
    res.json({
      success: true,
      message: 'Subject updated successfully',
      subject: updatedSubject[0]
    });
  } catch (error) {
    console.error('Error in PUT /subjects/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subject',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE subject
router.delete('/:id', async (req, res) => {
  try {
    console.log('DELETE /subjects/:id - ID:', req.params.id);
    
    // Check if subject exists
    const [existingSubjects] = await db.query('SELECT id FROM subjects WHERE id = ?', [req.params.id]);
    if (existingSubjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    await db.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /subjects/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subject',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 