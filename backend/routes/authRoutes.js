// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Import User model - make sure the path is correct
const User = require('../models/User');  // This should point to your User model

// Test route to check if User model is loaded
router.get('/test', (req, res) => {
    console.log('User model:', User);
    res.json({ 
        message: 'Auth routes working',
        userModelExists: !!User,
        userModelType: typeof User
    });
});

// Signup Route
router.post('/signup', async (req, res) => {
    console.log("🚀 SIGNUP ROUTE WAS HIT! Request body:", req.body); 

    try {
        const { username, email, mobile, password } = req.body;

        // Check if User model is properly imported
        if (!User) {
            console.error('❌ User model is not defined!');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        // 1. Check if the user already exists by email
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // 2. Hash the password using Node's built-in crypto module
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = crypto.scryptSync(password, salt, 64).toString('hex');
        const savedPassword = `${salt}:${hashedPassword}`;

        // 3. Create and save the new user
        const newUser = new User({
            username,
            email,
            mobile,
            password: savedPassword
        });

        await newUser.save();
        console.log("✅ User saved successfully!");
        res.status(201).json({ message: 'Account created successfully!' });

    } catch (error) {
        console.error("Signup Error:", error);
        
        // Handle duplicate key error (email)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// Signin Route
router.post('/signin', async (req, res) => {
    console.log("🔐 SIGNIN ROUTE WAS HIT!", req.body);
    
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Extract salt and hashed password from stored value
        const [salt, storedHash] = user.password.split(':');
        
        // Hash the provided password with the same salt
        const hash = crypto.scryptSync(password, salt, 64).toString('hex');
        
        // Compare
        if (hash !== storedHash) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Password matches 
       const token = jwt.sign(
            { id: user._id, email: user.email }, // Payload data
            process.env.JWT_SECRET || 'petwatch2026', 
            { expiresIn: '24h' } // Token expiration
        );
        
        // Return user info (excluding password)
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            mobile: user.mobile
        };
        
        res.json({
            message: 'Sign in successful',
            user: userResponse,
            token: token
        });
        
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Server error during sign in' });
    }
});

module.exports = router;