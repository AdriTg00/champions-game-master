import mongoose from 'mongoose';
import '../models/User.js';

const User = mongoose.model('User');

function toSafeUser(doc) {
  return {
    id: String(doc.id || doc._id),
    username: doc.username,
    email: doc.email,
    password: doc.password,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

class UserDAO {
  async create(userData) {
    const doc = await User.create(userData);
    return toSafeUser(doc);
  }

  async findByUsername(username) {
    const doc = await User.findOne({ username }).lean();
    return doc ? toSafeUser(doc) : null;
  }

  async findById(id) {
    const doc = await User.findById(id).lean();
    return doc ? toSafeUser(doc) : null;
  }

  async findByEmail(email) {
    const doc = await User.findOne({ email }).lean();
    return doc ? toSafeUser(doc) : null;
  }

  async findAll({ limit = 50, page = 1 } = {}) {
    const docs = await User.find().skip((page - 1) * limit).limit(limit).lean();
    return docs.map(toSafeUser);
  }

  async update(id, userData) {
    const doc = await User.findByIdAndUpdate(id, userData, { new: true }).lean();
    if (!doc) throw new Error('Usuario no encontrado');
    return toSafeUser(doc);
  }

  async delete(id) {
    const doc = await User.findByIdAndDelete(id).lean();
    return doc ? toSafeUser(doc) : null;
  }

  async count() {
    return await User.countDocuments();
  }
}

export default new UserDAO();
