require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./db'); 
const multer = require('multer');
const path = require('path');
const Vet = require('../models/vet'); // Import your Vet model

const app = express();
const port = process.env.PORT || 5001; 

// Middleware
app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database Connection
connectDB();

// Image Upload Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files allowed'));
        }
        cb(null, true);
    }
});

// --- VETERINARIAN ROUTES ---

/**
 * Create a new Veterinarian
 */
app.post('/api/vets', upload.single('image'), async (req, res) => {
    try {
        const vetData = {
            ...req.body,
            image: req.file ? `/uploads/${req.file.filename}` : null
        };
        const newVet = new Vet(vetData);
        await newVet.save();
        res.status(201).json({ success: true, message: 'Vet created successfully' });
    } catch (error) {
        console.error("Save Error:", error);
        res.status(500).json({ success: false, message: 'Server error saving vet' });
    }
});

/**
 * Fetch all Veterinarians
 */
app.get('/api/vets', async (req, res) => {
    try {
        const vets = await Vet.find().sort({ createdAt: -1 });
        res.status(200).json(vets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vets' });
    }
});

/**
 * Fetch single Veterinarian by ID
 */
app.get('/api/vets/:id', async (req, res) => {
    try {
        const vet = await Vet.findById(req.params.id);
        if (!vet) return res.status(404).json({ message: 'Vet not found' });
        res.json(vet);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Update Veterinarian
 */
app.put('/api/vets/:id', upload.single('image'), async (req, res) => {
    try {
        const updatedData = { ...req.body };
        if (req.file) updatedData.image = `/uploads/${req.file.filename}`;

        const updatedVet = await Vet.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!updatedVet) return res.status(404).json({ message: "Vet not found" });
        
        res.json({ success: true, data: updatedVet });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * Delete Veterinarian
 */
app.delete('/api/vets/:id', async (req, res) => {
    try {
        await Vet.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
});

// (Keep your Booking and HealthTip routes here as they were)

app.listen(port, () => {
  console.log(`🚀 PetWatch Server live at http://localhost:${port}`);
});