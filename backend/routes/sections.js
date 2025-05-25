const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get all sections with pagination and search
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        // Count total records
        const [countResult] = await db.query(
            'SELECT COUNT(*) as total FROM sections WHERE deleted_at IS NULL AND name LIKE ?',
            [`%${search}%`]
        );
        const total = countResult[0].total;

        // Get paginated results
        const [sections] = await db.query(
            'SELECT * FROM sections WHERE deleted_at IS NULL AND name LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [`%${search}%`, limit, offset]
        );

        res.json({
            success: true,
            data: sections,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching sections:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sections',
            error: error.message
        });
    }
});

// Get a single section by ID
router.get('/:id', async (req, res) => {
    try {
        const [sections] = await db.query(
            'SELECT * FROM sections WHERE id = ? AND deleted_at IS NULL',
            [req.params.id]
        );

        if (sections.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        res.json({
            success: true,
            data: sections[0]
        });
    } catch (error) {
        console.error('Error fetching section:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch section',
            error: error.message
        });
    }
});

// Create a new section
router.post('/', async (req, res) => {
    try {
        const { name, description, is_active } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Section name is required'
            });
        }

        // Check for duplicate section name
        const [existing] = await db.query(
            'SELECT id FROM sections WHERE name = ? AND deleted_at IS NULL',
            [name]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'A section with this name already exists'
            });
        }

        // Insert new section
        const [result] = await db.query(
            'INSERT INTO sections (name, description, is_active) VALUES (?, ?, ?)',
            [name, description || null, is_active !== undefined ? is_active : true]
        );

        // Get the created section
        const [sections] = await db.query(
            'SELECT * FROM sections WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Section created successfully',
            data: sections[0]
        });
    } catch (error) {
        console.error('Error creating section:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create section',
            error: error.message
        });
    }
});

// Update a section
router.put('/:id', async (req, res) => {
    try {
        const { name, description, is_active } = req.body;
        const sectionId = req.params.id;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Section name is required'
            });
        }

        // Check if section exists
        const [existing] = await db.query(
            'SELECT id FROM sections WHERE id = ? AND deleted_at IS NULL',
            [sectionId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        // Check for duplicate section name (excluding current section)
        const [duplicate] = await db.query(
            'SELECT id FROM sections WHERE name = ? AND id != ? AND deleted_at IS NULL',
            [name, sectionId]
        );

        if (duplicate.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'A section with this name already exists'
            });
        }

        // Update section
        await db.query(
            'UPDATE sections SET name = ?, description = ?, is_active = ? WHERE id = ?',
            [name, description || null, is_active !== undefined ? is_active : true, sectionId]
        );

        // Get the updated section
        const [sections] = await db.query(
            'SELECT * FROM sections WHERE id = ?',
            [sectionId]
        );

        res.json({
            success: true,
            message: 'Section updated successfully',
            data: sections[0]
        });
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update section',
            error: error.message
        });
    }
});

// Delete a section (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const sectionId = req.params.id;

        // Check if section exists
        const [existing] = await db.query(
            'SELECT id FROM sections WHERE id = ? AND deleted_at IS NULL',
            [sectionId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        // Soft delete section
        await db.query(
            'UPDATE sections SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
            [sectionId]
        );

        res.json({
            success: true,
            message: 'Section deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting section:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete section',
            error: error.message
        });
    }
});

module.exports = router; 