// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();

// Import the controller functions (register and login)
// Ensure your authController.js file exports both { register, login }
const { register, login } = require('../controllers/authController'); 

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public (no token needed)
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token (Sign In)
// @access  Public (no token needed)
router.post('/login', login); 

module.exports = router;