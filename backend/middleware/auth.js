// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const authHeader = req.header('Authorization');
    console.log('\n--- 🔐 AUTH MIDDLEWARE TRIGGERED ---');
    console.log('1. Raw Auth Header:', authHeader);
    
    // Get token from header
    const token = authHeader?.replace('Bearer ', '');
    console.log('2. Extracted Token:', token);
    
    // Check if no token or literal string 'null'
    if (!token || token === 'null' || token === 'undefined') {
        console.log('❌ FAILED: No valid token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    try {
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        
        // Verify token
        const decoded = jwt.verify(token, secret);
        console.log('✅ SUCCESS: Token verified for user ID:', decoded.id);
        
        // Add user from payload
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ FAILED: Token verification error details:', error.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};