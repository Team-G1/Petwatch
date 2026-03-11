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
const multer = require('multer');
const path = require('path');

app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            cb(new Error('Only image files allowed'));
        }
        cb(null, true);
    }
});



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

// HEALTH TIP SCHEMA
const HealthTipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    publishDate: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const HealthTip = mongoose.model('HealthTip', HealthTipSchema);

// Route D: Create Health Tip
app.post('/api/health-tips', upload.single('image'), async (req, res) => {
    try {
        const {
            title,
            category,
            description,
            status,
            publishDate
        } = req.body;

        if (!title || !category || !description) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

       const newTip = new HealthTip({
    title,
    category,
    description,
    status,
    publishDate: publishDate || null,
    image: req.file ? `/uploads/${req.file.filename}` : null
});


        await newTip.save();

        res.status(201).json({
            message: 'Health tip created successfully',
            data: newTip
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route E: Get All Health Tips
app.get('/api/health-tips', async (req, res) => {
    try {
        const tips = await HealthTip.find().sort({ createdAt: -1 });
        res.status(200).json(tips);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch health tips' });
    }
});

// Get single health tip by ID
app.get('/api/health-tips/:id', async (req, res) => {
    try {
        const tip = await HealthTip.findById(req.params.id);
        if (!tip) return res.status(404).json({ message: 'Tip not found' });
        res.json(tip);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update health tip
app.put('/api/health-tips/:id', upload.single('image'), async (req, res) => {
    try {
        const updatedData = {
            title: req.body.title,
            category: req.body.category,
            description: req.body.description,
            status: req.body.status,
            publishDate: req.body.publishDate || null
        };

        if (req.file) {
            updatedData.image = `/uploads/${req.file.filename}`;
        }

        const tip = await HealthTip.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );

        res.json(tip);
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
});

// Delete health tip
app.delete('/api/health-tips/:id', async (req, res) => {
    try {
        const deletedTip = await HealthTip.findByIdAndDelete(req.params.id);

        if (!deletedTip) {
            return res.status(404).json({ message: 'Tip not found' });
        }

        res.status(200).json({ message: 'Health tip deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Delete failed' });
    }
});


//locations

// LOCATION SCHEMA
const LocationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Location = mongoose.model("Location", LocationSchema);
// CREATE location
app.post("/api/locations", async (req, res) => {

    try {

        const location = new Location(req.body);
        await location.save();

        res.json(location);

    } catch (err) {

        console.error(err);
        res.status(500).json({ message: "Error creating location" });

    }

});


// GET all locations
app.get("/api/locations", async (req, res) => {

    try {

        const locations = await Location.find();
        res.json(locations);

    } catch (err) {

        res.status(500).json({ message: "Error loading locations" });

    }

});


// DELETE location
app.delete("/api/locations/:id", async (req, res) => {

    try {

        await Location.findByIdAndDelete(req.params.id);
        res.json({ message: "Location deleted" });

    } catch (err) {

        res.status(500).json({ message: "Error deleting location" });

    }

});


app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});