import mongoose from "mongoose";
import logger from '../utils/logger.js';

const connectDB = async (mongoUri) => {
  try {
    if (!mongoUri) throw new Error("MONGO_URI no definido");

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info("Conectado a MongoDB");
  } catch (err) {
    logger.error("Error conectando a MongoDB:", { message: err.message });
    throw err;
  }
};

export default connectDB;
