require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const vetRoutes = require('./routes/vetRoutes');

const app = express();
app.use(cors());
app.use(express.json()); // Essential to read your form data

// Connect to MongoDB using the credentials you reset
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ Connection error:", err));

app.use('/api/vets', vetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));