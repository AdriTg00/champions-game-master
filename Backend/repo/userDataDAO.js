import mongoose from "mongoose";
import "../models/UserData.js";

const UserData = mongoose.model("UserData");

const VALID_TYPES = ["votes", "tierlist", "history"];
const MAX_DATA_SIZE = 500000;

class UserDataDAO {
  async upsert(userId, type, data) {
    if (!VALID_TYPES.includes(type)) throw new Error("Invalid data type");

    const raw = JSON.stringify(data);
    if (raw.length > MAX_DATA_SIZE) throw new Error("Data exceeds size limit");

    const doc = await UserData.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), type },
      { data, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return { type: doc.type, data: doc.data, updatedAt: doc.updatedAt };
  }

  async findByUserAndType(userId, type) {
    if (!VALID_TYPES.includes(type)) return null;
    const doc = await UserData.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      type,
    }).lean();
    return doc ? { type: doc.type, data: doc.data, updatedAt: doc.updatedAt } : null;
  }

  async findByUser(userId) {
    const docs = await UserData.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();
    return docs.map((d) => ({ type: d.type, data: d.data, updatedAt: d.updatedAt }));
  }

  async delete(userId, type) {
    if (!VALID_TYPES.includes(type)) return false;
    const doc = await UserData.findOneAndDelete({
      userId: new mongoose.Types.ObjectId(userId),
      type,
    }).lean();
    return !!doc;
  }
}

export default new UserDataDAO();
