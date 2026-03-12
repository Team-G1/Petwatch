require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./db'); 
const crypto = require('crypto');
const multer = require('multer');
const path = require('path'); 

const Vet = require('./models/vet');

const app = express();
const port = process.env.PORT || 5001; 

// --- 1. MIDDLEWARE ---
app.use(cors()); 
app.use(express.json());

// --- 2. DATABASE CONNECTION ---
connectDB();

// Import Models
const User = require('./models/User');
const Pet = require('./models/Pet'); 
const auth = require('./middleware/auth');

// Import Routes
const authRoutes = require('./routes/authRoutes');

// --- 3. API ROUTES (Must be above Static Serving) ---

// Auth Routes
app.use('/api/auth', authRoutes);

// Review Schema
const ReviewSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', ReviewSchema);

/**
 * @route   POST /api/reviews
 * @desc    Save a new customer review
 */
app.post('/api/reviews', async (req, res) => {
    try {
        const { userName, rating, comment } = req.body;

        if (!userName || !rating || !comment) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newReview = new Review({
            userName,
            rating: parseInt(rating),
            comment
        });

        await newReview.save();
        res.status(201).json({ success: true, message: "Review added!" });
    } catch (error) {
        console.error("Review Save Error:", error);
        res.status(500).json({ message: "Server error saving review" });
    }
});

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews (Sorted by newest first)
 */
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews" });
    }
});

// --- 4. FILE UPLOADS CONFIG ---
// Import Routes
const authRoutes = require('./routes/authRoutes');

// Use Routes
app.use('/api/auth', authRoutes);

// Review Schema
// --- server.js ---
const ReviewSchema = new mongoose.Schema({
    userName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', ReviewSchema);

/**
 * @route   POST /api/reviews
 * @desc    Save a new customer review
 */
app.post('/api/reviews', async (req, res) => {
    try {
        const { userName, rating, comment } = req.body;

        if (!userName || !rating || !comment) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newReview = new Review({
            userName,
            rating: parseInt(rating),
            comment
        });

        await newReview.save();
        res.status(201).json({ success: true, message: "Review added!" });
    } catch (error) {
        console.error("Review Save Error:", error);
        res.status(500).json({ message: "Server error saving review" });
    }
});

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews (Sorted by newest first)
 */
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews" });
    }
});

// --- 4. FILE UPLOADS CONFIG ---
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

// --- 5. VETERINARIAN ROUTES ---
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

app.get('/api/vets', async (req, res) => {
    try {
        const vets = await Vet.find().sort({ createdAt: -1 });
        res.status(200).json(vets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vets' });
    }
});

app.get('/api/vets/:id', async (req, res) => {
    try {
        const vet = await Vet.findById(req.params.id);
        if (!vet) return res.status(404).json({ message: 'Vet not found' });
        res.json(vet);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

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

app.delete('/api/vets/:id', async (req, res) => {
    try {
        await Vet.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
});

// --- 6. BOOKING SCHEMA & ROUTES ---
const BookingSchema = new mongoose.Schema({
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
    userName: String,
    userPhone: String,
    userEmail: String,
    userAddress: String,
    appointmentNumber: String, 
    status: {
        type: String,
        enum: ['Confirmed', 'Pending', 'Completed', 'Cancelled'],
        default: 'Confirmed'
    },
    createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', BookingSchema);

app.post('/api/auth/signup', async (req, res) => {
    console.log("🚀 SIGNUP ROUTE WAS HIT! Request body:", req.body); 
    try {
        const { username, email, mobile, password } = req.body;
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = crypto.scryptSync(password, salt, 64).toString('hex');
        const savedPassword = `${salt}:${hashedPassword}`;
        const newUser = new User({
            username,
            email,
            mobile,
            password: savedPassword
        });
        await newUser.save();
        res.status(201).json({ message: 'Account created successfully!' });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

app.post('/api/book', auth, async (req, res) => {
    try {
        const apptNum = '#APT-' + Math.floor(100000 + Math.random() * 900000);
        const newBooking = new Booking({
            ...req.body,
            owner: req.user.id,
            appointmentNumber: apptNum
        });
        await newBooking.save();
        res.status(201).json({ message: 'Step 1 Complete', bookingId: newBooking._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error saving booking details' });
    }
});

app.put('/api/book/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Booking.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json({ message: 'Step 2 Complete' });
    } catch (error) {
        res.status(500).json({ message: 'Could not save user details' });
    }
});

app.get('/api/book/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching summary' });
    }
});

// --- 7. ADMIN ROUTES ---
app.get('/api/admin/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin records' });
    }
});

app.get('/api/admin/stats', async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const total = await Booking.countDocuments();
        const today = await Booking.countDocuments({ $or: [{ date: todayStr }, { dateFrom: todayStr }] });
        const completed = await Booking.countDocuments({ status: 'Completed' });
        const cancelled = await Booking.countDocuments({ status: 'Cancelled' });
        const locations = await Booking.aggregate([{ $group: { _id: "$location", count: { $sum: 1 } } }]);
        res.status(200).json({ total, today, completed, cancelled, locations });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating statistics' });
    }
});

app.patch('/api/book/status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
});

// --- 7.5 USER BOOKINGS ROUTE (ADDED) ---
/**
 * @route   GET /api/my-bookings/:userId
 * @desc    Get all bookings for a specific user
 */
app.get('/api/my-bookings/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log(`📅 Fetching bookings for user: ${userId}`);
        
        // Find the user to get their email and username
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Find bookings that match this user's email or username
        const bookings = await Booking.find({
            $or: [
                { userEmail: user.email },
                { userName: user.username }
            ]
        }).sort({ createdAt: -1 });
        
        console.log(`✅ Found ${bookings.length} bookings for user ${userId}`);
        res.status(200).json(bookings);
        
    } catch (error) {
        console.error('❌ Error fetching user bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});

// --- 8. HEALTH TIP SCHEMA & ROUTES ---
const HealthTipSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishDate: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const HealthTip = mongoose.model('HealthTip', HealthTipSchema);

app.post('/api/health-tips', upload.single('image'), async (req, res) => {
    try {
        const { title, category, description, status, publishDate } = req.body;
        if (!title || !category || !description) return res.status(400).json({ message: 'Required fields missing' });
        const newTip = new HealthTip({ title, category, description, status, publishDate: publishDate || null, image: req.file ? `/uploads/${req.file.filename}` : null });
        await newTip.save();
        res.status(201).json({ message: 'Health tip created successfully', data: newTip });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/health-tips', async (req, res) => {
    try {
        const tips = await HealthTip.find().sort({ createdAt: -1 });
        res.status(200).json(tips);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch health tips' });
    }
});

app.get('/api/health-tips/:id', async (req, res) => {
    try {
        const tip = await HealthTip.findById(req.params.id);
        if (!tip) return res.status(404).json({ message: 'Tip not found' });
        res.json(tip);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/health-tips/:id', upload.single('image'), async (req, res) => {
    try {
        const updatedData = { title: req.body.title, category: req.body.category, description: req.body.description, status: req.body.status, publishDate: req.body.publishDate || null };
        if (req.file) updatedData.image = `/uploads/${req.file.filename}`;
        const tip = await HealthTip.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        res.json(tip);
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
});

app.delete('/api/health-tips/:id', async (req, res) => {
    try {
        const deletedTip = await HealthTip.findByIdAndDelete(req.params.id);
        if (!deletedTip) return res.status(404).json({ message: 'Tip not found' });
        res.status(200).json({ message: 'Health tip deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

// --- 9. USER & PET LOGIC ---
app.put('/api/users/:id', async (req, res) => {
    try {
        const { username, email, mobile } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { username, email, mobile }, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "User not found" });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
});

app.get('/api/users/:userId/pets', auth, async (req, res) => {
    try {
        const pets = await Pet.findByUser(req.params.userId);
        res.json(pets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pets" });
    }
});

app.post('/api/users/:userId/pets', auth, async (req, res) => {
    try {
        const newPet = new Pet({ userId: req.params.userId, ...req.body });
        await newPet.save();
        res.status(201).json(newPet);
    } catch (error) {
        res.status(400).json({ message: "Error saving pet", error: error.message });
    }
});

app.put('/api/users/:userId/pets/:petId', auth, async (req, res) => {
    try {
        const updatedPet = await Pet.findByIdAndUpdate(req.params.petId, req.body, { new: true, runValidators: true });
        if (!updatedPet) return res.status(404).json({ message: "Pet not found" });
        res.json(updatedPet);
    } catch (error) {
        res.status(400).json({ message: "Update failed", error: error.message });
    }
});

app.delete('/api/users/:userId/pets/:petId', auth, async (req, res) => {
    try {
        await Pet.findByIdAndDelete(req.params.petId);
        res.json({ message: "Pet deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
});

// --- 10. STATIC SERVING (Last Resort) ---
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, '../Frontend')));  

app.listen(port, () => {
  console.log(`🚀 PetWatch Server live at http://localhost:${port}`);
});