import bcrypt from 'bcryptjs';

class UserDAO {
  constructor() {
    this.users = [];
  }

  async create(userData) {
    const existingUsername = this.users.find(u => u.username === userData.username);
    if (existingUsername) throw new Error('Username o email ya existe');

    const existingEmail = this.users.find(u => u.email === userData.email);
    if (existingEmail) throw new Error('Username o email ya existe');

    const user = {
      id: String(Date.now() + Math.random()),
      username: userData.username,
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(user);
    return user;
  }

  async findById(id) {
    return this.users.find(u => u.id === id) || null;
  }

  async findByEmail(email) {
    return this.users.find(u => u.email === email) || null;
  }

  async findByUsername(username) {
    return this.users.find(u => u.username === username) || null;
  }

  async findAll({ limit = 50, page = 1 } = {}) {
    const skip = (page - 1) * limit;
    return this.users.slice(skip, skip + limit);
  }

  async update(id, userData) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Usuario no encontrado');

    if (userData.username) {
      const existing = this.users.find(u => u.username === userData.username && u.id !== id);
      if (existing) throw new Error('Username o email ya existe');
    }
    if (userData.email) {
      const existing = this.users.find(u => u.email === userData.email && u.id !== id);
      if (existing) throw new Error('Username o email ya existe');
    }

    this.users[idx] = { ...this.users[idx], ...userData, updatedAt: new Date().toISOString() };
    return this.users[idx];
  }

  async delete(id) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    const deleted = this.users[idx];
    this.users.splice(idx, 1);
    return deleted;
  }

  async exists(id) {
    return this.users.some(u => u.id === id);
  }

  async count() {
    return this.users.length;
  }
}

export default UserDAO;
