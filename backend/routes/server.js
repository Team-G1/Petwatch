require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./db'); 

const app = express();
const port = process.env.PORT || 5001; 

// Middleware
app.use(cors()); 
app.use(express.json());

// Database Connection
connectDB();

// --- 1. SCHEMA DESIGN ---
// This schema holds both pet info (Step 1) and user info (Step 2)
const BookingSchema = new mongoose.Schema({
    // Step 1: Pet & Service Details
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
    
    // Step 2: User Details (Updated later via PUT)
    userName: String,
    userPhone: String,
    userEmail: String,
    userAddress: String,

    // System Metadata & Admin Logic
    appointmentNumber: String, 
    status: {
        type: String,
        enum: ['Confirmed', 'Pending', 'Completed', 'Cancelled'],
        default: 'Confirmed'
    },
    createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', BookingSchema);

// --- 2. USER-FACING ROUTES ---

/**
 * STEP 1: Create initial booking with Pet details
 * Generates the Appointment Number and returns the Database ID
 */
app.post('/api/book', async (req, res) => {
    try {
        const apptNum = '#APT-' + Math.floor(100000 + Math.random() * 900000);
        
        const newBooking = new Booking({
            ...req.body,
            appointmentNumber: apptNum
        });
        
        await newBooking.save();
        res.status(201).json({ 
            message: 'Step 1 Complete', 
            bookingId: newBooking._id 
        });
    } catch (error) {
        console.error("Step 1 Error:", error);
        res.status(500).json({ message: 'Server error saving pet details' });
    }
});

/**
 * STEP 2: Update existing booking with User contact info
 */
app.put('/api/book/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Booking.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!updated) return res.status(404).json({ message: 'Booking not found' });
        
        res.status(200).json({ message: 'Step 2 Complete' });
    } catch (error) {
        console.error("Step 2 Error:", error);
        res.status(500).json({ message: 'Could not save user details' });
    }
});

/**
 * STEP 3: Fetch full details for the Confirmation Page & QR Code
 */
app.get('/api/book/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching summary' });
    }
});


// --- 3. ADMIN-FACING ROUTES ---

/**
 * Fetch all bookings for the Admin Table
 */
app.get('/api/admin/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin records' });
    }
});

/**
 * Calculate statistics for Admin Dashboard cards
 */
app.get('/api/admin/stats', async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        
        const total = await Booking.countDocuments();
        const today = await Booking.countDocuments({ 
            $or: [{ date: todayStr }, { dateFrom: todayStr }] 
        });
        const completed = await Booking.countDocuments({ status: 'Completed' });
        const cancelled = await Booking.countDocuments({ status: 'Cancelled' });

        // Aggregate counts by location for progress bars
        const locations = await Booking.aggregate([
            { $group: { _id: "$location", count: { $sum: 1 } } }
        ]);

        res.status(200).json({ total, today, completed, cancelled, locations });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating statistics' });
    }
});

/**
 * Update Status (When Admin clicks Complete or Cancel)
 */
app.patch('/api/book/status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 PetWatch Server live at http://localhost:${port}`);
});