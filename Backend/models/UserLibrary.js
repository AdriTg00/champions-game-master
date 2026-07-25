import mongoose from "mongoose";

const userLibrarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  gameId: { type: String, required: true },
  gameName: { type: String, required: true },
  gameThumbnail: { type: String, default: "" },
  gameMeta: {
    platforms: { type: String, default: "" },
    genres: { type: String, default: "" },
    metacritic: { type: Number, default: null },
    released: { type: String, default: null },
  },
  status: {
    type: String,
    enum: ["playing", "backlog", "completed", "completed100", "dropped", "wishlist"],
    default: "backlog",
  },
  rating: { type: Number, default: null, min: 1, max: 10 },
  hoursPlayed: { type: Number, default: 0, min: 0 },
  favorite: { type: Boolean, default: false },
  notes: { type: String, default: "", maxlength: 2000 },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  startedAt: { type: Date, default: null },
  finishedAt: { type: Date, default: null },
}, { timestamps: true });

userLibrarySchema.index({ userId: 1, gameId: 1 }, { unique: true });

export default mongoose.model("UserLibrary", userLibrarySchema);
