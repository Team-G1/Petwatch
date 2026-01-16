// backend/controllers/authController.js

const User = require('../models/User'); // Mongoose User Model
const bcrypt = require('bcryptjs');     // For password hashing
const jwt = require('jsonwebtoken');    // For creating tokens

// Helper function to create a JWT
const createToken = (userId) => {
    // Uses JWT_SECRET and JWT_LIFETIME from your .env file
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME,
    });
};

// @desc    Register a new user (Sign Up)
// @route   POST /api/auth/register
async function register(req, res) {
    const { name, email, password } = req.body;

    // --- DIAGNOSTIC LOG 1: Check Input ---
    console.log('\n--- SIGN UP REQUEST RECEIVED ---');
    console.log('Data Received:', { name, email });
    
    try {
        // 1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // --- DIAGNOSTIC LOG 2: Check before Mongoose save ---
        console.log('Attempting to save user with email:', email);
        
        // 3. Create and Save the user
        user = await User.create({
            name,
            email,
            password: hashedPassword, // Store the HASHED password
        });

        // --- DIAGNOSTIC LOG 3: Confirmation log ---
        console.log('✅ Successfully saved user with ID:', user._id); 

        // 4. Create a JWT and send it back
        const token = createToken(user._id);

        res.status(201).json({ 
            user: { id: user._id, name: user.name, email: user.email, role: user.role }, 
            token 
        });

    } catch (err) {
        // --- DIAGNOSTIC LOG 4: Log Mongoose or Server Error ---
        console.error('❌ REGISTRATION ERROR:', err.message);
        
        // Send an appropriate error response
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: 'Validation Failed. Check required fields.' });
        }
        res.status(500).send('Server Error');
    }
}

// @desc    Authenticate a user & get token (Sign In)
// @route   POST /api/auth/login
async function login(req, res) {
    const { email, password } = req.body;
    console.log('\n--- LOGIN REQUEST RECEIVED ---');

    // Simple validation
    if (!email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. Compare the provided password with the hashed password in the DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 3. Create a JWT and send it back
        const token = createToken(user._id);

        res.json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role }, 
            token 
        });

    } catch (err) {
        console.error('❌ LOGIN ERROR:', err.message);
        res.status(500).send('Server Error');
    }
}

module.exports = { register, login };