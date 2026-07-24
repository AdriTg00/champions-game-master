import FileStore from '../lib/fileStore.js';

export default class GameDAO {
  constructor() {
    this.store = new FileStore('games');
  }

  async create(gameData) {
    const doc = {
      ...gameData,
      picked: gameData.picked || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return await this.store.insert(doc);
  }

  async findAll(options = {}) {
    const { filter = {}, page = 1, limit = 0, sort = { createdAt: -1 } } = options;
    if (limit > 0) {
      return await this.store.findWithPagination(filter, { page, limit, sort });
    } else {
      const data = await this.store.find(filter);
      return { data, total: data.length, page: 1, limit: data.length };
    }
  }

  async findById(id) {
    return await this.store.findOne({ _id: id });
  }

  async findByName(name) {
    if (!name) return null;
    const nameTrim = name.toString().trim();
    const results = await this.store.find();
    return results.find(g => g.name?.toLowerCase() === nameTrim.toLowerCase()) || null;
  }

  async findByExternalId(externalId) {
    if (!externalId) return null;
    return await this.store.findOne({ externalId: String(externalId) });
  }

  async update(id, data) {
    return await this.store.update({ _id: id }, { ...data, updatedAt: new Date().toISOString() });
  }

  async delete(id) {
    return await this.store.remove({ _id: id });
  }

  async getRandomUnpicked() {
    const docs = await this.store.find({ picked: { $ne: true } });
    if (docs.length === 0) return null;
    return docs[Math.floor(Math.random() * docs.length)];
  }

  async markPicked(id) {
    return await this.store.update({ _id: id }, { picked: true, updatedAt: new Date().toISOString() });
  }

  async resetAllPicked() {
    const docs = await this.store.find({ picked: true });
    for (const doc of docs) {
      await this.store.update({ _id: doc._id }, { picked: false, updatedAt: new Date().toISOString() });
    }
    return { modifiedCount: docs.length };
  }
}
