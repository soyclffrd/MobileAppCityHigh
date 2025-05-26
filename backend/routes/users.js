const express = require('express');
const router = express.Router();
const db = require('../database/db');
const bcrypt = require('bcryptjs');

// Get all users with pagination and search
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        // Count total records
        const [countResult] = await db.query(
            'SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL AND (name LIKE ? OR email LIKE ?)',
            [`%${search}%`, `%${search}%`]
        );
        const total = countResult[0].total;

        // Get paginated results
        const [users] = await db.query(
            'SELECT * FROM users WHERE deleted_at IS NULL AND (name LIKE ? OR email LIKE ?) ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [`%${search}%`, `%${search}%`, limit, offset]
        );

        res.json({
            success: true,
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

// Get a single user by ID
router.get('/:id', async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
});

// Create a new user
router.post('/', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, password, and role are required'
            });
        }

        // Validate role
        const validRoles = ['Admin', 'Student', 'Teacher'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be one of: Admin, Student, Teacher'
            });
        }

        // Check for duplicate email
        const [existing] = await db.query(
            'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'A user with this email already exists'
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        // Get the created user (excluding password)
        const [users] = await db.query(
            'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: users[0]
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message
        });
    }
});

// Update a user
router.put('/:id', async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const userId = req.params.id;

        // Validate required fields
        if (!name || !email || !role) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and role are required'
            });
        }

        // Check if user exists
        const [existing] = await db.query(
            'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL',
            [userId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check for duplicate email (excluding current user)
        const [duplicate] = await db.query(
            'SELECT id FROM users WHERE email = ? AND id != ? AND deleted_at IS NULL',
            [email, userId]
        );

        if (duplicate.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'A user with this email already exists'
            });
        }

        // Update user
        await db.query(
            'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
            [name, email, role, userId]
        );

        // Get the updated user
        const [users] = await db.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'User updated successfully',
            data: users[0]
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
});

// Delete a user (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const [existing] = await db.query(
            'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL',
            [userId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Soft delete user
        await db.query(
            'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
});

module.exports = router; 