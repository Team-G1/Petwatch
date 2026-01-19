const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Store user's name
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Store unique email for login
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    // Store hashed password (NEVER store plain passwords!)
    password: {
        type: String,
        required: true
    },
    // Define user role (e.g., 'owner', 'sitter', 'admin')
    role: {
        type: String,
        enum: ['owner', 'sitter'],
        default: 'owner'
    },
    // Array to reference all pets owned by this user
    pets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet'
    }]
}, {
    // Mongoose automatically adds 'createdAt' and 'updatedAt' fields
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);