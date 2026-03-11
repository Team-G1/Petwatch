const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: { 
        type: String,
        required: true,
        enum: ['Dog', 'Cat', 'Bird', 'Reptile', 'Other']
    },
    breed: {
        type: String
    },
    age: {
        type: Number,
        min: 0
    },
    // Reference the User who owns this pet (relationship)
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Pet', petSchema);