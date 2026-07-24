import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { config } from '../utils/config.js';

const connectDB = async () => {
  if (config.isVercel) {
    try {
      const conn = await mongoose.connect(config.mongoUri);
      logger.info(`MongoDB conectado: ${conn.connection.host}`);
      return true;
    } catch (err) {
      logger.error('Error conectando a MongoDB:', { message: err.message });
      throw err;
    }
  } else {
    logger.info('Usando almacenamiento local de archivos');
    return true;
  }
};

export default connectDB;
