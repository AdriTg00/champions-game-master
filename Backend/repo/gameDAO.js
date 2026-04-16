// repo/gameDAO.js
import mongoose from "mongoose";
import Game from "../models/Game.js";

export default class GameDAO {
  constructor() {}

  async create(gameData) {
    try {
      const game = new Game(gameData);
      return await game.save();
    } catch (err) {
      throw err;
    }
  }

  async findAll(options = {}) {
    try {
      const { filter = {}, page = 1, limit = 0, sort = { createdAt: -1 } } = options;
      if (limit && limit > 0) {
        const skip = (Math.max(page, 1) - 1) * limit;
        const [data, total] = await Promise.all([
          Game.find(filter).sort(sort).skip(skip).limit(limit),
          Game.countDocuments(filter)
        ]);
        return { data, total, page: Math.max(page, 1), limit };
      } else {
        const data = await Game.find(filter).sort(sort);
        const total = Array.isArray(data) ? data.length : 0;
        return { data, total, page: 1, limit: total };
      }
    } catch (err) {
      throw err;
    }
  }

  async findById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await Game.findById(id);
    } catch (err) {
      throw err;
    }
  }

  async findByName(name) {
    try {
      if (!name) return null;
      const nameTrim = name.toString().trim();
      return await Game.findOne({ name: { $regex: `^${this._escapeRegex(nameTrim)}$`, $options: "i" } });
    } catch (err) {
      throw err;
    }
  }

  // Buscar por externalId (más fiable para evitar duplicados)
  async findByExternalId(externalId) {
    try {
      if (!externalId) return null;
      return await Game.findOne({ externalId: String(externalId) });
    } catch (err) {
      throw err;
    }
  }

  async update(id, data) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await Game.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (err) {
      throw err;
    }
  }

  async delete(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await Game.findByIdAndDelete(id);
    } catch (err) {
      throw err;
    }
  }

  // Devuelve 1 juego aleatorio que no esté marcado como picked (o null si no hay)
  async getRandomUnpicked() {
    try {
      const pipeline = [
        { $match: { picked: { $ne: true } } },
        { $sample: { size: 1 } }
      ];
      const [doc] = await Game.aggregate(pipeline).exec();
      return doc || null;
    } catch (err) {
      throw err;
    }
  }

  // Marca un juego (por id) como picked = true
  async markPicked(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await Game.findByIdAndUpdate(id, { $set: { picked: true } }, { new: true });
    } catch (err) {
      throw err;
    }
  }

  // Resetea todos los picked a false
  async resetAllPicked() {
    try {
      const res = await Game.updateMany({ picked: true }, { $set: { picked: false } });
      return res;
    } catch (err) {
      throw err;
    }
  }

  _escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
