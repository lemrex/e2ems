// ===================================
// 6. ROUTES (routes/auth.js)
// ===================================
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signup, signin, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const signupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const signinValidation = [
  body('identifier').notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/signup', signupValidation, signup);
router.post('/signin', signinValidation, signin);
router.get('/me', authMiddleware, getMe);

module.exports = router;
