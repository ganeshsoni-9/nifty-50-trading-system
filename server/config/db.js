const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${process.env.MONGODB_URI}.`);
    console.warn(`[MongoDB Warning] ${error.message}`);
    console.warn(`[MongoDB Info] App will run with in-memory persistence fallback for offline dev.`);
    return false;
  }
};

module.exports = connectDB;
