// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./db'); // Ensure you have this file from previous steps

const app = express();
const port = process.env.PORT || 5001; 

app.use(cors()); 
app.use(express.json());

connectDB();

// 1. UPDATED SCHEMA (Includes User Details & Appt Number)
const BookingSchema = new mongoose.Schema({
    // Pet Details
    serviceType: String,
    petName: String,
    petType: String,
    breed: String,
    age: String,
    weight: String,
    location: String,
    date: String,
    time: String,
    dateFrom: String,
    dateTo: String,
    timeFrom: String,
    timeTo: String,
    groomingPackage: String,
    
    // User Details (Added in Step 2)
    userName: String,
    userPhone: String,
    userEmail: String,
    userAddress: String,

    // System Generated
    appointmentNumber: String, // e.g., #APT-1234
    createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', BookingSchema);

// 2. API ROUTES

// Route A: Create Initial Booking (Pet Info)
app.post('/api/book', async (req, res) => {
    try {
        // Generate a random 6-digit Appointment Number
        const apptNum = '#APT-' + Math.floor(100000 + Math.random() * 900000);
        
        const newBooking = new Booking({
            ...req.body,
            appointmentNumber: apptNum
        });
        await newBooking.save();
        res.status(201).json({ message: 'Step 1 Complete', bookingId: newBooking._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route B: Update Booking (Add User Info)
app.put('/api/book/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Booking.findByIdAndUpdate(id, req.body); // Update with user details
        res.status(200).json({ message: 'Step 2 Complete' });
    } catch (error) {
        res.status(500).json({ message: 'Could not save user details' });
    }
});

// Route C: Get Booking Details (For Confirmation Page)
app.get('/api/book/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});