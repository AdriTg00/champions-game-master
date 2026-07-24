import bcrypt from "bcryptjs";
import { generateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import userDAO from '../repo/userDAO.js';

const saltRounds = 12;

export const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      logger.warn('Intento de crear usuario sin datos desde', { ip: req.ip });
      return res.status(400).json({ error: "Faltan datos" });
    }

    const existingUsername = await userDAO.findByUsername(username);
    if (existingUsername) return res.status(400).json({ error: "El username ya existe" });

    const existingEmail = await userDAO.findByEmail(email);
    if (existingEmail) return res.status(400).json({ error: "El email ya existe" });

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await userDAO.create({ username, email, password: hashedPassword });

    logger.audit(user.id, 'CREATE', 'User', { username, email });
    logger.info(`Usuario creado: ${username}`);

    const token = generateToken(user);

    res.status(201).json({
      message: "Usuario creado correctamente",
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    logger.error('Error en createUser:', { message: error.message });
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Faltan datos" });

    const user = await userDAO.findByUsername(username);
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = generateToken(user);
    logger.audit(user.id, 'LOGIN', 'User', { ip: req.ip });
    logger.info(`Login exitoso: ${username}`);

    return res.status(200).json({
      message: "Login correcto",
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    logger.error("Error en login:", { message: error.message });
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await userDAO.findAll();
    const safeUsers = allUsers.map(u => ({ id: u.id, username: u.username, email: u.email }));
    res.status(200).json(safeUsers);
  } catch (error) {
    logger.error("Error al obtener usuarios:", { message: error.message });
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id ?? req.params.userId;
    if (!userId) return res.status(400).json({ error: "ID de usuario no proporcionado" });
    const user = await userDAO.findById(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    logger.error("Error al obtener usuario:", { message: err.message });
    return res.status(500).json({ error: "Error al obtener usuario" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const existing = await userDAO.findById(id);
    if (!existing) return res.status(404).json({ error: "Usuario no encontrado" });

    if (updates.password) {
      if (updates.password.length < 8) return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    }

    const updated = await userDAO.update(id, updates);
    res.status(200).json({
      message: "Usuario actualizado correctamente",
      user: { id: updated.id, username: updated.username, email: updated.email }
    });
  } catch (error) {
    logger.error("Error al actualizar usuario:", { message: error.message });
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await userDAO.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Usuario no encontrado" });
    res.status(200).json({
      message: "Usuario eliminado correctamente",
      user: { id: deleted.id, username: deleted.username, email: deleted.email }
    });
  } catch (error) {
    logger.error("Error al eliminar usuario:", { message: error.message });
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};
