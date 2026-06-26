import mongoose from "mongoose";
import logger from '../utils/logger.js';

let cachedConnection = null;

const connectDB = async (mongoUri) => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    if (!mongoUri) throw new Error("MONGO_URI no definido");

    cachedConnection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info("Conectado a MongoDB");
    return cachedConnection;
  } catch (err) {
    logger.error("Error conectando a MongoDB:", { message: err.message });
    throw err;
  }
};

export default connectDB;
