const mongoose = require('mongoose');

const vetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: String,
    location: String,
    experience: Number,
    phone: String,
    email: String,
    tags: String,
    status: String,
    role: String,
    image: String
});

module.exports = mongoose.model('Vet', vetSchema);