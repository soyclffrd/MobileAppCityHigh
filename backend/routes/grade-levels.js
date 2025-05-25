const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get all grade levels with pagination
router.get('/', async (req, res) => {
  let connection;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const isActive = req.query.isActive !== 'false'; // Default to true if not specified

    connection = await db.getConnection();
    console.log('Fetching grade levels with params:', { page, limit, search, isActive });

    // Get total count with search
    const [countResult] = await connection.query(
      'SELECT COUNT(*) as count FROM grade_levels WHERE is_active = ? AND name LIKE ?',
      [isActive, `%${search}%`]
    );
    const total = countResult[0].count;

    // Get paginated results with search
    const [rows] = await connection.query(
      'SELECT * FROM grade_levels WHERE is_active = ? AND name LIKE ? ORDER BY name ASC LIMIT ? OFFSET ?',
      [isActive, `%${search}%`, limit, offset]
    );

    console.log(`Found ${rows.length} grade levels`);

    res.json({
      success: true,
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching grade levels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grade levels',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Create a new grade level
router.post('/', async (req, res) => {
  let connection;
  try {
    console.log('POST /grade-levels - Request body:', req.body);
    const { name, description, is_active = true } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    connection = await db.getConnection();
    console.log('Database connection acquired');

    // Check if name already exists
    const [existingName] = await connection.query(
      'SELECT id FROM grade_levels WHERE name = ?',
      [name]
    );

    if (existingName.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Grade level name already exists'
      });
    }

    // Insert new grade level
    const [result] = await connection.query(
      'INSERT INTO grade_levels (name, description, is_active) VALUES (?, ?, ?)',
      [name, description, is_active]
    );

    console.log('Insert result:', result);

    if (!result.insertId) {
      throw new Error('Failed to get insert ID');
    }

    // Fetch the created record
    const [newGradeLevel] = await connection.query(
      'SELECT * FROM grade_levels WHERE id = ?',
      [result.insertId]
    );

    if (!newGradeLevel || newGradeLevel.length === 0) {
      throw new Error('Failed to fetch created grade level');
    }

    console.log('Created new grade level:', newGradeLevel[0]);
    
    res.json({
      success: true,
      data: newGradeLevel[0]
    });
  } catch (error) {
    console.error('Error creating grade level:', error);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });

    // Check if it's a duplicate key error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Grade level name already exists'
      });
    }

    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create grade level',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection released');
    }
  }
});

// Update a grade level
router.put('/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    connection = await db.getConnection();

    // Check if name already exists (excluding current record)
    const [existingName] = await connection.query(
      'SELECT id FROM grade_levels WHERE name = ? AND id != ?',
      [name, id]
    );

    if (existingName.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Grade level name already exists'
      });
    }

    // Update the grade level
    const [result] = await connection.query(
      'UPDATE grade_levels SET name = ?, description = ?, is_active = ? WHERE id = ?',
      [name, description, is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grade level not found'
      });
    }

    // Fetch the updated record
    const [updatedGradeLevel] = await connection.query(
      'SELECT * FROM grade_levels WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: updatedGradeLevel[0]
    });
  } catch (error) {
    console.error('Error updating grade level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grade level',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Delete a grade level (soft delete)
router.delete('/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await db.getConnection();

    const [result] = await connection.query(
      'UPDATE grade_levels SET is_active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grade level not found'
      });
    }

    res.json({
      success: true,
      message: 'Grade level deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting grade level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete grade level',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router; 