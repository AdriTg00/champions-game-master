import mongoose from "mongoose";
import "../models/UserLibrary.js";

const UserLibrary = mongoose.model("UserLibrary");

function normalizeDoc(doc) {
  if (!doc) return doc;
  return {
    _id: String(doc._id),
    id: String(doc._id),
    userId: doc.userId,
    gameId: doc.gameId,
    gameName: doc.gameName,
    gameThumbnail: doc.gameThumbnail || "",
    gameMeta: doc.gameMeta || {},
    status: doc.status,
    rating: doc.rating ?? null,
    hoursPlayed: doc.hoursPlayed ?? 0,
    favorite: !!doc.favorite,
    notes: doc.notes || "",
    completionPercentage: doc.completionPercentage ?? 0,
    startedAt: doc.startedAt || null,
    finishedAt: doc.finishedAt || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

class LibraryDAO {
  async findByUser(userId, options = {}) {
    const { status, favorite, sort = { updatedAt: -1 } } = options;
    const filter = { userId: new mongoose.Types.ObjectId(userId) };
    if (status) filter.status = status;
    if (favorite) filter.favorite = true;
    const docs = await UserLibrary.find(filter).sort(sort).lean();
    return docs.map(normalizeDoc);
  }

  async findOne(userId, gameId) {
    const doc = await UserLibrary.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      gameId,
    }).lean();
    return normalizeDoc(doc);
  }

  async create(data) {
    const doc = await UserLibrary.create(data);
    return normalizeDoc(doc.toObject ? doc.toObject() : doc);
  }

  async update(id, userId, data) {
    const doc = await UserLibrary.findOneAndUpdate(
      { _id: id, userId: new mongoose.Types.ObjectId(userId) },
      { ...data, updatedAt: new Date() },
      { new: true }
    ).lean();
    return normalizeDoc(doc);
  }

  async delete(id, userId) {
    const doc = await UserLibrary.findOneAndDelete({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();
    return doc ? normalizeDoc(doc) : null;
  }

  async getStats(userId) {
    const objectId = new mongoose.Types.ObjectId(userId);
    const all = await UserLibrary.find({ userId: objectId }).lean();
    const total = all.length;
    const playing = all.filter((e) => e.status === "playing").length;
    const backlog = all.filter((e) => e.status === "backlog").length;
    const completed = all.filter((e) => e.status === "completed").length;
    const completed100 = all.filter((e) => e.status === "completed100").length;
    const dropped = all.filter((e) => e.status === "dropped").length;
    const wishlist = all.filter((e) => e.status === "wishlist").length;
    const totalHours = all.reduce((s, e) => s + (e.hoursPlayed || 0), 0);
    const ratings = all.filter((e) => e.rating != null).map((e) => e.rating);
    const avgRating = ratings.length
      ? ratings.reduce((s, r) => s + r, 0) / ratings.length
      : null;
    const completedCount = completed + completed100;
    const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    return { total, playing, backlog, completed, completed100, dropped, wishlist, totalHours, avgRating, completionRate };
  }
}

export default new LibraryDAO();
