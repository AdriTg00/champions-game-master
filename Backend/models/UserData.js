import mongoose from "mongoose";

const userDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["votes", "tierlist", "history"], required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

userDataSchema.index({ userId: 1, type: 1 }, { unique: true });

export default mongoose.model("UserData", userDataSchema);
