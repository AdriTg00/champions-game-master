import { config } from '../utils/config.js';

let User;
let users = [];

if (config.isVercel) {
  const mongoose = (await import('mongoose')).default;
  await import('../models/User.js');
  User = mongoose.model('User');
}

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
    if (config.isVercel) {
      const doc = await User.create(userData);
      return toSafeUser(doc);
    }

    const existingUsername = users.find(u => u.username === userData.username);
    if (existingUsername) throw new Error('Username o email ya existe');

    const existingEmail = users.find(u => u.email === userData.email);
    if (existingEmail) throw new Error('Username o email ya existe');

    const user = {
      id: String(Date.now() + Math.random()),
      username: userData.username,
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
  }

  async findByUsername(username) {
    if (config.isVercel) {
      const doc = await User.findOne({ username }).lean();
      return doc ? toSafeUser(doc) : null;
    }
    return users.find(u => u.username === username) || null;
  }

  async findById(id) {
    if (config.isVercel) {
      const doc = await User.findById(id).lean();
      return doc ? toSafeUser(doc) : null;
    }
    return users.find(u => u.id === id) || null;
  }

  async findByEmail(email) {
    if (config.isVercel) {
      const doc = await User.findOne({ email }).lean();
      return doc ? toSafeUser(doc) : null;
    }
    return users.find(u => u.email === email) || null;
  }

  async findAll({ limit = 50, page = 1 } = {}) {
    if (config.isVercel) {
      const docs = await User.find().skip((page - 1) * limit).limit(limit).lean();
      return docs.map(toSafeUser);
    }
    const skip = (page - 1) * limit;
    return users.slice(skip, skip + limit);
  }

  async update(id, userData) {
    if (config.isVercel) {
      const doc = await User.findByIdAndUpdate(id, userData, { new: true }).lean();
      if (!doc) throw new Error('Usuario no encontrado');
      return toSafeUser(doc);
    }

    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Usuario no encontrado');

    if (userData.username) {
      const existing = users.find(u => u.username === userData.username && u.id !== id);
      if (existing) throw new Error('Username o email ya existe');
    }
    if (userData.email) {
      const existing = users.find(u => u.email === userData.email && u.id !== id);
      if (existing) throw new Error('Username o email ya existe');
    }

    users[idx] = { ...users[idx], ...userData, updatedAt: new Date().toISOString() };
    return users[idx];
  }

  async delete(id) {
    if (config.isVercel) {
      const doc = await User.findByIdAndDelete(id).lean();
      return doc ? toSafeUser(doc) : null;
    }
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    return users.splice(idx, 1)[0];
  }

  async count() {
    if (config.isVercel) {
      return await User.countDocuments();
    }
    return users.length;
  }
}

export default new UserDAO();
