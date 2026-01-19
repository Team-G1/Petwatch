// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000; 
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/petwatch'; // Fallback if .env fails

// --- Middleware ---
app.use(cors()); 
app.use(express.json());

// --- Database Connection ---
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connection successful!'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); 
  });

// ==========================================
// 1. DEFINE BOOKING SCHEMA
// ==========================================
const BookingSchema = new mongoose.Schema({
    serviceType: { type: String, required: true }, // 'pet-clinic', 'pet-care', 'pet-grooming'
    petName: { type: String, required: true },
    petType: String,
    breed: String,
    age: String,
    weight: String,
    location: String,
    
    // Clinic & Grooming fields (Single Date)
    date: String,
    time: String,
    
    // Pet Care fields (Date Range)
    dateFrom: String,
    dateTo: String,
    timeFrom: String,
    timeTo: String,
    
    // Grooming specific
    groomingPackage: String,
    
    createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', BookingSchema);

// ==========================================
// 2. API ROUTES
// ==========================================

// Test Route
app.get('/', (req, res) => {
    res.status(200).send('PetWatch Backend API is Running!');
});

// Booking Route (The one your form calls)
app.post('/api/book', async (req, res) => {
    try {
        console.log("Received Booking Data:", req.body); // Debugging log

        const newBooking = new Booking(req.body);
        await newBooking.save();
        
        res.status(201).json({ 
            message: 'Booking successful!', 
            bookingId: newBooking._id 
        });
    } catch (error) {
        console.error("Error saving booking:", error);
        res.status(500).json({ message: 'Server error, could not save booking.' });
    }
});

// Import Auth Routes (If you have them separately)
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);

// --- Start Server ---
app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});