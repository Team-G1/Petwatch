require('dotenv').config(); // This loads the variables from .env
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI; // This pulls the string from your .env file
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ Successfully connected to MongoDB Atlas via Environment Variables!");
        
        const db = client.db("PetWatchDB");
        return db;
    } catch (error) {
        console.error("❌ Connection error:", error);
    }
}

connectDB();