const mongoose = require('mongoose');

/**
 * Establish a connection to MongoDB using Mongoose.
 * This function throws an error when `MONGODB_URI` is missing to enforce
 * fail-fast behavior at application startup.
 *
 * @returns {Promise<void>} resolves when connected
 * @throws {Error} when `MONGODB_URI` is missing or connection fails
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  // Fail fast if configuration is missing — prevents confusing runtime errors later.
  if (!uri) {
    throw new Error('MONGODB_URI is required but not set in environment');
  }

  try {
    // Connect with default options; applications can customize options here
    // (e.g., useNewUrlParser, useUnifiedTopology) if required by older drivers.
    await mongoose.connect(uri, { /* options reserved for compatibility */ });
    console.log('MongoDB connected successfully');
  } catch (err) {
    // Bubble up the error so the caller (index.js) can handle shutdown.
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

// Connection lifecycle logging helps with debugging and observability in production.
mongoose.connection.on('connected', () => console.log('Mongoose: connected'));
mongoose.connection.on('error', (err) => console.error('Mongoose error:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));

module.exports = connectDB;
