// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const petSchema = new mongoose.Schema({
    petName: { type: String, required: true },
    petType: { type: String, required: true, enum: ['Cat', 'Dog'] },
    breed: { type: String, required: true },
    age: { type: String, required: true },
    weight: { type: String, required: true }
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);