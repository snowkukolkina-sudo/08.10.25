const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult, param, query } = require('express-validator');
const { getDatabase } = require('../config/database');
const { authenticateToken, authorize, requireRole } = require('../middleware/auth');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, password } = req.body;
    const db = getDatabase();

    // Find user by username or email
    const user = await db('users')
      .where(function() {
        this.where('username', username)
          .orWhere('email', username);
      })
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account is inactive'
      });
    }

    // Update last login
    await db('users')
      .where({ id: user.id })
      .update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    logger.info('User logged in', { userId: user.id, username: user.username });

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    logger.error('Error during login:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

router.post('/register', [
  requireRole(['admin']),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('role').isIn(['admin', 'manager', 'cashier', 'senior_cashier']).withMessage('Invalid role'),
  body('phone').optional().isString(),
  body('permissions').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, email, password, first_name, last_name, role, phone, permissions } = req.body;
    const db = getDatabase();

    // Check if user already exists
    const existingUser = await db('users')
      .where(function() {
        this.where('username', username)
          .orWhere('email', email);
      })
      .first();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this username or email already exists'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData = {
      id: uuidv4(),
      username,
      email,
      password_hash: passwordHash,
      first_name,
      last_name,
      role,
      phone: phone || null,
      permissions: permissions || {},
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    };

    const [user] = await db('users')
      .insert(userData)
      .returning('*');

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    logger.info('User registered', { 
      userId: user.id, 
      username: user.username, 
      role: user.role,
      registeredBy: req.user.id 
    });

    res.status(201).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    logger.error('Error during registration:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Protected routes (authentication required)
router.use(authenticateToken);

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const { password_hash, ...userWithoutPassword } = req.user;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// Update current user profile
router.put('/me', [
  body('first_name').optional().notEmpty(),
  body('last_name').optional().notEmpty(),
  body('phone').optional().isString(),
  body('email').optional().isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const db = getDatabase();
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== req.user.email) {
      const existingUser = await db('users')
        .where({ email: updateData.email })
        .whereNot({ id: req.user.id })
        .first();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken'
        });
      }
    }

    const [user] = await db('users')
      .where({ id: req.user.id })
      .update(updateData)
      .returning('*');

    const { password_hash, ...userWithoutPassword } = user;

    logger.info('User profile updated', { userId: user.id });

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile'
    });
  }
});

// Change password
router.put('/me/password', [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { current_password, new_password } = req.body;
    const db = getDatabase();

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, req.user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await db('users')
      .where({ id: req.user.id })
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date()
      });

    logger.info('User password changed', { userId: req.user.id });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

// Get all users (admin only)
router.get('/', [
  requireRole(['admin']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['admin', 'manager', 'cashier', 'senior_cashier']),
  query('status').optional().isIn(['active', 'inactive', 'suspended'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { page = 1, limit = 50, role, status } = req.query;
    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = db('users').select('*');

    if (role) {
      query = query.where('role', role);
    }

    if (status) {
      query = query.where('status', status);
    }

    const users = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('users').count('* as count').first();

    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      data: usersWithoutPasswords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Get user by ID (admin only)
router.get('/:id', [
  requireRole(['admin']),
  param('id').isUUID().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const db = getDatabase();

    const user = await db('users').where({ id }).first();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// Update user (admin only)
router.put('/:id', [
  requireRole(['admin']),
  param('id').isUUID().withMessage('Invalid user ID'),
  body('first_name').optional().notEmpty(),
  body('last_name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('role').optional().isIn(['admin', 'manager', 'cashier', 'senior_cashier']),
  body('status').optional().isIn(['active', 'inactive', 'suspended']),
  body('permissions').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const db = getDatabase();

    // Check if user exists
    const existingUser = await db('users').where({ id }).first();
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== existingUser.email) {
      const emailTaken = await db('users')
        .where({ email: req.body.email })
        .whereNot({ id })
        .first();

      if (emailTaken) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken'
        });
      }
    }

    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    const [user] = await db('users')
      .where({ id })
      .update(updateData)
      .returning('*');

    const { password_hash, ...userWithoutPassword } = user;

    logger.info('User updated', { 
      userId: user.id, 
      updatedBy: req.user.id 
    });

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', [
  requireRole(['admin']),
  param('id').isUUID().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const db = getDatabase();

    // Prevent self-deletion
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    const deleted = await db('users').where({ id }).del();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    logger.info('User deleted', { 
      deletedUserId: id, 
      deletedBy: req.user.id 
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// Reset user password (admin only)
router.post('/:id/reset-password', [
  requireRole(['admin']),
  param('id').isUUID().withMessage('Invalid user ID'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { new_password } = req.body;
    const db = getDatabase();

    // Check if user exists
    const user = await db('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await db('users')
      .where({ id })
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date()
      });

    logger.info('User password reset', { 
      userId: id, 
      resetBy: req.user.id 
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    logger.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
});

module.exports = { router };
