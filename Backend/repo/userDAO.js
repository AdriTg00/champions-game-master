// dao/user.dao.js
import UserModel from '../models/User.js';

class UserDAO {
  // CREATE - Crear nuevo usuario
  async create(userData) {
    try {
      const user = new UserModel(userData);
      const saved = await user.save();
      return saved; // ya puedes usar saved.toJSON() en el controlador
    } catch (error) {
      if (error.code === 11000) {
        // índice único de email/username
        throw new Error('Username o email ya existe');
      }
      throw new Error('Error creando usuario: ' + error.message);
    }
  }

  // READ - Obtener usuario por ID
  async findById(id) {
    const user = await UserModel.findById(id);
    return user; // puede ser null
  }

  // READ - Obtener usuario por email
  async findByEmail(email) {
    const user = await UserModel.findOne({ email });
    return user;
  }

  // READ - Obtener usuario por username
  async findByUsername(username) {
    const user = await UserModel.findOne({ username });
    return user;
  }

  // READ - Obtener todos los usuarios (con paginación básica)
  async findAll({ limit = 50, page = 1 } = {}) {
    const skip = (page - 1) * limit;
    const users = await UserModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return users;
  }

  // UPDATE - Actualizar usuario completo
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

  // UPDATE - Actualizar campos específicos (PATCH)
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

  // DELETE - Eliminar usuario
  async delete(id) {
    const deleted = await UserModel.findByIdAndDelete(id);
    return !!deleted; // true si borró, false si no existía
  }

  // Existe usuario por ID
  async exists(id) {
    const exists = await UserModel.exists({ _id: id });
    return !!exists;
  }

  // Contar usuarios
  async count() {
    return await UserModel.countDocuments();
  }
}

export default UserDAO;