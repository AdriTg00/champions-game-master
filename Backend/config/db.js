// config/db.js
import mongoose from "mongoose";

const connectDB = async (mongoUri) => {
  try {
    if (!mongoUri) throw new Error("MONGO_URI no definido");

    // Conexión simple: mongoose se encarga de las opciones internamente en versiones recientes
    await mongoose.connect(mongoUri);

    console.log("✅ Conectado a MongoDB");
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err.message);
    throw err;
  }
};

export default connectDB;
