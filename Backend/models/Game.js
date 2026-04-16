// models/Game.js
import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  externalId: {
    type: String,
    default: null,
    index: true
  },
  thumbnail: {
    type: String,
    default: null
  },
  genre: {
    type: String,
    default: null
  },
  platform: {
    type: String,
    default: null
  },
  picked: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// índice único opcional para externalId (evita duplicados por fuente externa)
gameSchema.index({ externalId: 1 }, { unique: true, sparse: true });

export default mongoose.model("Game", gameSchema);
