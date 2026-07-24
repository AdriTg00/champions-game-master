import mongoose from 'mongoose';
import '../models/Game.js';

const Game = mongoose.model('Game');

function normalizeDoc(doc) {
  if (!doc) return doc;
  const id = String(doc.id || doc._id);
  return {
    _id: id,
    id,
    name: doc.name,
    description: doc.description,
    externalId: doc.externalId,
    thumbnail: doc.thumbnail,
    genre: doc.genre,
    platform: doc.platform,
    picked: doc.picked,
    createdAt: doc.createdAt,
  };
}

class GameDAO {
  async create(gameData) {
    const doc = await Game.create(gameData);
    return normalizeDoc(doc.toObject ? doc.toObject() : doc);
  }

  async findAll(options = {}) {
    const { filter = {}, page = 1, limit = 0, sort = { createdAt: -1 } } = options;
    let query = Game.find(filter).sort(sort);
    if (limit > 0) query = query.skip((page - 1) * limit).limit(limit);
    const docs = await query.lean();
    const total = await Game.countDocuments(filter);
    return { data: docs.map(normalizeDoc), total, page, limit: limit || total };
  }

  async findById(id) {
    const doc = await Game.findById(id).lean();
    return normalizeDoc(doc);
  }

  async findByName(name) {
    if (!name) return null;
    const nameTrim = name.toString().trim();
    const doc = await Game.findOne({ name: { $regex: new RegExp(`^${nameTrim}$`, 'i') } }).lean();
    return normalizeDoc(doc);
  }

  async findByExternalId(externalId) {
    if (!externalId) return null;
    const doc = await Game.findOne({ externalId: String(externalId) }).lean();
    return normalizeDoc(doc);
  }

  async update(id, data) {
    const doc = await Game.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).lean();
    return normalizeDoc(doc);
  }

  async delete(id) {
    const doc = await Game.findByIdAndDelete(id).lean();
    return doc ? normalizeDoc(doc) : null;
  }

  async getRandomUnpicked() {
    const count = await Game.countDocuments({ picked: { $ne: true } });
    if (count === 0) return null;
    const random = Math.floor(Math.random() * count);
    const doc = await Game.findOne({ picked: { $ne: true } }).skip(random).lean();
    return normalizeDoc(doc);
  }

  async markPicked(id) {
    return await this.update(id, { picked: true });
  }

  async resetAllPicked() {
    const result = await Game.updateMany({ picked: true }, { picked: false, updatedAt: new Date() });
    return { modifiedCount: result.modifiedCount };
  }
}

export default new GameDAO();
