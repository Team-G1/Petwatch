require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./db'); 
const crypto = require('crypto');
const multer = require('multer');
const path = require('path'); 
const petRoutes = require('./routes/petRoutes');
const Vet = require('./models/vet');

const app = express();
const port = process.env.PORT || 5001; 

// Middleware
app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api', petRoutes);

// Serve static files from Frontend folder
app.use(express.static(path.join(__dirname, '../Frontend')));  // Now path is defined
app.use('/uploads', express.static('uploads'));

// Database Connection
connectDB();

// Import Models
const User = require('./models/User');
const Pet = require('./models/Pet');


// Import Routes
const authRoutes = require('./routes/authRoutes');

// Use Routes
app.use('/api/auth', authRoutes);

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

//Create a new Veterinarian

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

//Fetch all Veterinarians

app.get('/api/vets', async (req, res) => {
    try {
        const vets = await Vet.find().sort({ createdAt: -1 });
        res.status(200).json(vets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vets' });
    }
});

//Fetch single Veterinarian by ID

app.get('/api/vets/:id', async (req, res) => {
    try {
        const vet = await Vet.findById(req.params.id);
        if (!vet) return res.status(404).json({ message: 'Vet not found' });
        res.json(vet);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

//Update Veterinarian

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

//Delete Veterinarian

app.delete('/api/vets/:id', async (req, res) => {
    try {
        await Vet.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
});


// --- SCHEMA DESIGN ---

// schema holds both pet info and user info
const BookingSchema = new mongoose.Schema({
    // Pet & Service Details
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
    
    //User Details 
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
 * SIGN UP ROUTE (Using Built-in Node.js Crypto)
 */
app.post('/api/auth/signup', async (req, res) => {
    console.log("🚀 SIGNUP ROUTE WAS HIT! Request body:", req.body); 

    try {
        const { username, email, mobile, password } = req.body;

        // 1. Check if the user already exists by email
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // 2. Hash the password using Node's built-in crypto module
        
        const salt = crypto.randomBytes(16).toString('hex');
        
        // We hash the password combined with the salt
        const hashedPassword = crypto.scryptSync(password, salt, 64).toString('hex');
        
        
        const savedPassword = `${salt}:${hashedPassword}`;

        // 3. Create and save the new user
        const newUser = new User({
            username,
            email,
            mobile,
            password: savedPassword
        });

        await newUser.save();
        console.log("✅ User saved successfully!");
        res.status(201).json({ message: 'Account created successfully!' });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

/**
 * STEP 1: Create initial booking with Pet details
 * Generate the Appointment Number and returns the Database ID
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

//Update existing booking with User contact info
 
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

//Fetch full details for the Confirmation Page & QR Code

app.get('/api/book/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching summary' });
    }
});


// --- ADMIN-FACING ROUTES ---

// Fetch all bookings for the Admin Table

app.get('/api/admin/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin records' });
    }
});

// Calculate statistics for Admin Dashboard cards

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

//Update Status (When Admin clicks Complete or Cancel)

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

// Create Health Tip
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

// Get All Health Tips
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








const UserPetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    petName: String,
    petType: String,
    breed: String,
    age: String,
    weight: String,
    createdAt: { type: Date, default: Date.now }
});

const UserPet = mongoose.model('UserPet', UserPetSchema);


// Update User Details (Name, Email, Mobile)
app.put('/api/users/:id', async (req, res) => {
    try {
        const { username, email, mobile } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { username, email, mobile }, 
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ message: "User not found" });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
});


// GET all pets for a specific user
app.get('/api/users/:userId/pets', async (req, res) => {
    try {
        const pets = await UserPet.find({ userId: req.params.userId });
        res.json(pets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pets" });
    }
});

// POST a new pet for a user
app.post('/api/users/:userId/pets', async (req, res) => {
    try {
        const newPet = new UserPet({
            userId: req.params.userId,
            ...req.body
        });
        await newPet.save();
        res.status(201).json(newPet);
    } catch (error) {
        res.status(500).json({ message: "Error saving pet" });
    }
});

// PUT (Update) a specific pet
app.put('/api/users/:userId/pets/:petId', async (req, res) => {
    try {
        const updatedPet = await UserPet.findByIdAndUpdate(
            req.params.petId,
            req.body,
            { new: true }
        );
        res.json(updatedPet);
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
});

// DELETE a specific pet
app.delete('/api/users/:userId/pets/:petId', async (req, res) => {
    try {
        await UserPet.findByIdAndDelete(req.params.petId);
        res.json({ message: "Pet deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
});


app.listen(port, () => {
  console.log(`🚀 PetWatch Server live at http://localhost:${port}`);
});

