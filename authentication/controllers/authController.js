
// AUTH CONTROLLER (controllers/authController.js)
// ===================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../utils/db');
const logger = require('../utils/logger');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Signup validation failed', { 
        errors: errors.array(),
        email: req.body.email 
      });
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, username, password } = req.body;

    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userExists.rows.length > 0) {
      logger.warn('Signup attempt with existing credentials', { 
        email,
        username 
      });
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email or username' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
      [email, username, hashedPassword]
    );

    const user = newUser.rows[0];
    const token = generateToken(user.id);

    logger.info('User registered successfully', { 
      userId: user.id,
      email: user.email,
      username: user.username 
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.created_at
        },
        token
      }
    });
  } catch (error) {
    logger.error('Signup error', error, { email: req.body.email });
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/signin
// @access  Public
exports.signin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Signin validation failed', { errors: errors.array() });
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { identifier, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [identifier]
    );

    if (result.rows.length === 0) {
      logger.warn('Signin attempt with non-existent user', { identifier });
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn('Signin attempt with incorrect password', { 
        userId: user.id,
        identifier 
      });
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken(user.id);

    logger.info('User signed in successfully', { 
      userId: user.id,
      username: user.username 
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.created_at
        },
        token
      }
    });
  } catch (error) {
    logger.error('Signin error', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, created_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      logger.warn('User not found', { userId: req.userId });
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('GetMe error', error, { userId: req.userId });
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
