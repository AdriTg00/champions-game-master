import UserModel from '../models/User.js';

class UserDAO {
  async create(userData) {
    try {
      const user = new UserModel(userData);
      const saved = await user.save();
      return saved;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Username o email ya existe');
      }
      throw new Error('Error creando usuario: ' + error.message);
    }
  }

  async findById(id) {
    const user = await UserModel.findById(id);
    return user;
  }

  async findByEmail(email) {
    const user = await UserModel.findOne({ email });
    return user;
  }

  async findByUsername(username) {
    const user = await UserModel.findOne({ username });
    return user;
  }

  async findAll({ limit = 50, page = 1 } = {}) {
    const skip = (page - 1) * limit;
    const users = await UserModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return users;
  }

  async update(id, userData) {
    try {
      const updated = await UserModel.findByIdAndUpdate(
        id,
        { ...userData },
        { new: true, runValidators: true }
      );
      if (!updated) {
        throw new Error('Usuario no encontrado');
      }
      return updated;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Username o email ya existe');
      }
      throw new Error('Error actualizando usuario: ' + error.message);
    }
  }

  async updatePartial(id, fields) {
    try {
      const updated = await UserModel.findByIdAndUpdate(
        id,
        { $set: fields },
        { new: true, runValidators: true }
      );
      if (!updated) {
        throw new Error('Usuario no encontrado');
      }
      return updated;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Username o email ya existe');
      }
      throw new Error('Error actualizando usuario: ' + error.message);
    }
  }

  async delete(id) {
    const deleted = await UserModel.findByIdAndDelete(id);
    return deleted;
  }

  async exists(id) {
    const exists = await UserModel.exists({ _id: id });
    return !!exists;
  }

  async count() {
    return await UserModel.countDocuments();
  }
}

export default UserDAO;
