import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { config } from '../utils/config.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    logger.info(`MongoDB conectado: ${conn.connection.host}`);
    return true;
  } catch (err) {
    logger.error('Error conectando a MongoDB:', { message: err.message });
    throw err;
  }
};

export default connectDB;
