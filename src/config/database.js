import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

/**
 * Database Connection
 *
 * Connects to MongoDB Atlas with retry logic and graceful shutdown.
 * Uses Mongoose 8 connection pooling defaults.
 */

let isConnected = false;

export const connectDB = async (retries = 5, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      mongoose.set('strictQuery', true);
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      });
      isConnected = true;
      logger.info('MongoDB connected successfully', { attempt });
      return mongoose.connection;
    } catch (err) {
      logger.error(`MongoDB connection attempt ${attempt} failed`, { error: err.message });
      if (attempt === retries) {
        logger.error('MongoDB connection exhausted retries — exiting');
        throw err;
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

export const disconnectDB = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected');
};

export const getConnectionState = () => mongoose.connection.readyState;

export default { connectDB, disconnectDB, getConnectionState };