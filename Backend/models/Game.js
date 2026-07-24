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
  metacritic: {
    type: Number,
    default: null
  },
  rating: {
    type: Number,
    default: null
  },
  released: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

gameSchema.index({ externalId: 1 }, { unique: true, sparse: true });

export default mongoose.model("Game", gameSchema);
