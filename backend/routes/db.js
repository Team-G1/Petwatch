// db.js
const mongoose = require('mongoose');

// This function handles the connection logic
const connectDB = async () => {
    try {
        // We use the variable from your .env file
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Connection Error: ${error.message}`);
        process.exit(1); // Stop the server if we can't connect
    }
};

module.exports = connectDB; // Export the function so server.js can use it