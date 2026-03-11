const User = require('../models/User');
const crypto = require('crypto');

const authController = {
    // SIGNUP
    async signup(req, res) {
        console.log("🚀 SIGNUP ROUTE WAS HIT!", req.body);
        
        try {
            const { username, email, mobile, password } = req.body;

            // Check if user exists
            let existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ 
                    message: 'User already exists with this email' 
                });
            }

            // Hash password
            const salt = crypto.randomBytes(16).toString('hex');
            const hashedPassword = crypto.scryptSync(password, salt, 64).toString('hex');
            const savedPassword = `${salt}:${hashedPassword}`;

            // Create user
            const newUser = new User({
                username,
                email,
                mobile,
                password: savedPassword
            });

            await newUser.save();
            console.log("✅ User saved successfully!");
            
            res.status(201).json({ 
                message: 'Account created successfully!' 
            });

        } catch (error) {
            console.error("Signup Error:", error);
            res.status(500).json({ 
                message: 'Server error during signup' 
            });
        }
    },

    // SIGNIN (if you need it)
    async signin(req, res) {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ 
                    message: 'Invalid email or password' 
                });
            }

            // Verify password
            const [salt, key] = user.password.split(':');
            const hashedBuffer = crypto.scryptSync(password, salt, 64);
            const keyBuffer = Buffer.from(key, 'hex');
            const isValid = crypto.timingSafeEqual(hashedBuffer, keyBuffer);

            if (!isValid) {
                return res.status(401).json({ 
                    message: 'Invalid email or password' 
                });
            }

            // Return user without password
            const userResponse = user.toObject();
            delete userResponse.password;

            res.status(200).json({ 
                message: 'Login successful',
                user: userResponse 
            });

        } catch (error) {
            console.error("Signin Error:", error);
            res.status(500).json({ 
                message: 'Server error during signin' 
            });
        }
    }
};

module.exports = authController;