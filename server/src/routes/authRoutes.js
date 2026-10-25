const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
  registerUser,
  loginUser,
  getProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Validation rules
const registerValidation = [
  check('name', 'Name is required and cannot be empty').trim().notEmpty(),
  check('email', 'Please include a valid email address').isEmail().normalizeEmail(),
  check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
  validateRequest
];

const loginValidation = [
  check('email', 'Please provide a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists(),
  validateRequest
];

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.get('/me', protect, getProfile);

module.exports = router;
