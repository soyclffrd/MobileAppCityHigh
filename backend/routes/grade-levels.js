const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all grade levels with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const isActive = req.query.isActive !== 'false'; // Default to true if not specified

    // Get total count
    const [countResult] = await db.query(
      'SELECT COUNT(*) as count FROM grade_levels WHERE is_active = ?',
      [isActive]
    );
    const total = countResult[0].count;

    // Get paginated results
    const [rows] = await db.query(
      'SELECT * FROM grade_levels WHERE is_active = ? ORDER BY name ASC LIMIT ? OFFSET ?',
      [isActive, limit, offset]
    );

    res.json({
      success: true,
      gradeLevels: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching grade levels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grade levels'
    });
  }
});

// Create a new grade level
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Check if name already exists
    const [existingName] = await db.query(
      'SELECT id FROM grade_levels WHERE name = ?',
      [name]
    );

    if (existingName.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Grade level name already exists'
      });
    }

    const [result] = await db.query(
      'INSERT INTO grade_levels (name, description) VALUES (?, ?)',
      [name, description]
    );

    const [newGradeLevel] = await db.query(
      'SELECT * FROM grade_levels WHERE id = ?',
      [result.insertId]
    );

    res.json({
      success: true,
      gradeLevel: newGradeLevel[0]
    });
  } catch (error) {
    console.error('Error creating grade level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create grade level'
    });
  }
});

// Update a grade level
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Check if name already exists (excluding current record)
    const [existingName] = await db.query(
      'SELECT id FROM grade_levels WHERE name = ? AND id != ?',
      [name, id]
    );

    if (existingName.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Grade level name already exists'
      });
    }

    await db.query(
      'UPDATE grade_levels SET name = ?, description = ?, is_active = ? WHERE id = ?',
      [name, description, is_active, id]
    );

    const [updatedGradeLevel] = await db.query(
      'SELECT * FROM grade_levels WHERE id = ?',
      [id]
    );

    if (updatedGradeLevel.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grade level not found'
      });
    }

    res.json({
      success: true,
      gradeLevel: updatedGradeLevel[0]
    });
  } catch (error) {
    console.error('Error updating grade level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grade level'
    });
  }
});

// Delete a grade level (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'UPDATE grade_levels SET is_active = false WHERE id = ?',
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
      message: 'Failed to delete grade level'
    });
  }
});

module.exports = router; 