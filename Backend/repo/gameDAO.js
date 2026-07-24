import FileStore from '../lib/fileStore.js';
import { config } from '../utils/config.js';

let Game;
if (config.isVercel) {
  const mongoose = (await import('mongoose')).default;
  await import('../models/Game.js');
  Game = mongoose.model('Game');
}
const fileStore = new FileStore('games');

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

function normalizePageResult(pageResult) {
  const { docs, data, total, page, limit } = pageResult;
  const raw = data || docs || [];
  return {
    data: raw.map(normalizeDoc),
    total,
    page,
    limit,
  };
}

class GameDAO {
  async create(gameData) {
    if (config.isVercel) {
      const doc = await Game.create(gameData);
      return normalizeDoc(doc.toObject ? doc.toObject() : doc);
    }
    const doc = {
      ...gameData,
      picked: gameData.picked || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const inserted = await fileStore.insert(doc);
    return normalizeDoc(inserted);
  }

  async findAll(options = {}) {
    const { filter = {}, page = 1, limit = 0, sort = { createdAt: -1 } } = options;

    if (config.isVercel) {
      let query = Game.find(filter).sort(sort);
      if (limit > 0) query = query.skip((page - 1) * limit).limit(limit);
      const docs = await query.lean();
      const total = await Game.countDocuments(filter);
      return normalizePageResult({ docs, total, page, limit: limit || total });
    }

    if (limit > 0) {
      const result = await fileStore.findWithPagination(filter, { page, limit, sort });
      return normalizePageResult(result);
    }
    const data = await fileStore.find(filter);
    return normalizePageResult({ data, total: data.length, page: 1, limit: data.length });
  }

  async findById(id) {
    if (config.isVercel) {
      const doc = await Game.findById(id).lean();
      return normalizeDoc(doc);
    }
    const doc = await fileStore.findOne({ _id: id });
    return normalizeDoc(doc);
  }

  async findByName(name) {
    if (!name) return null;
    const nameTrim = name.toString().trim();

    if (config.isVercel) {
      const doc = await Game.findOne({ name: { $regex: new RegExp(`^${nameTrim}$`, 'i') } }).lean();
      return normalizeDoc(doc);
    }

    const results = await fileStore.find();
    const found = results.find(g => g.name?.toLowerCase() === nameTrim.toLowerCase());
    return normalizeDoc(found) || null;
  }

  async findByExternalId(externalId) {
    if (!externalId) return null;

    if (config.isVercel) {
      const doc = await Game.findOne({ externalId: String(externalId) }).lean();
      return normalizeDoc(doc);
    }
    const doc = await fileStore.findOne({ externalId: String(externalId) });
    return normalizeDoc(doc);
  }

  async update(id, data) {
    if (config.isVercel) {
      const doc = await Game.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).lean();
      return normalizeDoc(doc);
    }
    const updatedDoc = await fileStore.update({ _id: id }, { ...data, updatedAt: new Date().toISOString() });
    return normalizeDoc(updatedDoc);
  }

  async delete(id) {
    if (config.isVercel) {
      const doc = await Game.findByIdAndDelete(id).lean();
      return doc ? normalizeDoc(doc) : null;
    }
    const removed = await fileStore.remove({ _id: id });
    return removed;
  }

  async getRandomUnpicked() {
    if (config.isVercel) {
      const count = await Game.countDocuments({ picked: { $ne: true } });
      if (count === 0) return null;
      const random = Math.floor(Math.random() * count);
      const doc = await Game.findOne({ picked: { $ne: true } }).skip(random).lean();
      return normalizeDoc(doc);
    }
    const docs = await fileStore.find({ picked: { $ne: true } });
    if (docs.length === 0) return null;
    return normalizeDoc(docs[Math.floor(Math.random() * docs.length)]);
  }

  async markPicked(id) {
    return await this.update(id, { picked: true });
  }

  async resetAllPicked() {
    if (config.isVercel) {
      const result = await Game.updateMany({ picked: true }, { picked: false, updatedAt: new Date() });
      return { modifiedCount: result.modifiedCount };
    }
    const docs = await fileStore.find({ picked: true });
    for (const doc of docs) {
      await fileStore.update({ _id: doc._id }, { picked: false, updatedAt: new Date().toISOString() });
    }
    return { modifiedCount: docs.length };
  }
}

export default new GameDAO();
