const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET all strands with pagination and search
router.get('/', async (req, res) => {
  try {
    console.log('GET /strands - Query params:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = 'SELECT * FROM strands';
    let countQuery = 'SELECT COUNT(*) as total FROM strands';
    const queryParams = [];

    if (search) {
      query += ' WHERE name LIKE ? OR description LIKE ?';
      countQuery += ' WHERE name LIKE ? OR description LIKE ?';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    console.log('Executing query:', query);
    console.log('Query params:', queryParams);

    const [strands] = await db.query(query, queryParams);
    const [totalResult] = await db.query(countQuery, search ? [`%${search}%`, `%${search}%`] : []);

    console.log('Query results:', { strands, total: totalResult[0].total });

    res.json({
      success: true,
      strands,
      total: totalResult[0].total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error in GET /strands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch strands',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET single strand
router.get('/:id', async (req, res) => {
  try {
    console.log('GET /strands/:id - ID:', req.params.id);
    const [strands] = await db.query('SELECT * FROM strands WHERE id = ?', [req.params.id]);
    
    if (strands.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Strand not found'
      });
    }

    console.log('Found strand:', strands[0]);
    res.json({
      success: true,
      strand: strands[0]
    });
  } catch (error) {
    console.error('Error in GET /strands/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch strand',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST new strand
router.post('/', async (req, res) => {
  try {
    console.log('POST /strands - Request body:', req.body);
    const { name, description } = req.body;

    // Validate required fields
    if (!name || !description) {
      console.log('Missing required fields:', { name, description });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name and description are required'
      });
    }

    // Check if strand name already exists
    const [existingStrands] = await db.query('SELECT id FROM strands WHERE name = ?', [name]);
    if (existingStrands.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Strand name already exists'
      });
    }

    const query = `
      INSERT INTO strands (name, description)
      VALUES (?, ?)
    `;
    const values = [name, description];

    console.log('Executing insert query:', query);
    console.log('Insert values:', values);

    const [result] = await db.query(query, values);
    const [newStrand] = await db.query('SELECT * FROM strands WHERE id = ?', [result.insertId]);

    console.log('Created new strand:', newStrand[0]);
    res.status(201).json({
      success: true,
      message: 'Strand created successfully',
      strand: newStrand[0]
    });
  } catch (error) {
    console.error('Error in POST /strands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create strand',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT update strand
router.put('/:id', async (req, res) => {
  try {
    console.log('PUT /strands/:id - ID:', req.params.id);
    console.log('Request body:', req.body);
    const { name, description } = req.body;

    // Validate required fields
    if (!name || !description) {
      console.log('Missing required fields:', { name, description });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name and description are required'
      });
    }

    // Check if strand exists
    const [existingStrands] = await db.query('SELECT id FROM strands WHERE id = ?', [req.params.id]);
    if (existingStrands.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Strand not found'
      });
    }

    // Check if name is being changed and if new name already exists
    if (name !== existingStrands[0].name) {
      const [duplicateStrands] = await db.query('SELECT id FROM strands WHERE name = ? AND id != ?', [name, req.params.id]);
      if (duplicateStrands.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Strand name already exists'
        });
      }
    }

    const query = `
      UPDATE strands 
      SET name = ?, description = ?
      WHERE id = ?
    `;
    const values = [name, description, req.params.id];

    console.log('Executing update query:', query);
    console.log('Update values:', values);

    await db.query(query, values);
    const [updatedStrand] = await db.query('SELECT * FROM strands WHERE id = ?', [req.params.id]);

    console.log('Updated strand:', updatedStrand[0]);
    res.json({
      success: true,
      message: 'Strand updated successfully',
      strand: updatedStrand[0]
    });
  } catch (error) {
    console.error('Error in PUT /strands/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update strand',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE strand
router.delete('/:id', async (req, res) => {
  try {
    console.log('DELETE /strands/:id - ID:', req.params.id);
    
    // Check if strand exists
    const [existingStrands] = await db.query('SELECT id FROM strands WHERE id = ?', [req.params.id]);
    if (existingStrands.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Strand not found'
      });
    }

    await db.query('DELETE FROM strands WHERE id = ?', [req.params.id]);
    res.json({
      success: true,
      message: 'Strand deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /strands/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete strand',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 