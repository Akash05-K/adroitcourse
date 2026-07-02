const mongoose = require('mongoose');

// Establishes connection to MongoDB using Mongoose.
// Exits the process if connection fails so the app never runs "half-broken".
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern mongoose versions don't need most legacy options,
      // but these are kept for clarity/compatibility.
      autoIndex: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Helpful connection event logging for production debugging
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect is handled by the driver.');
    });
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;