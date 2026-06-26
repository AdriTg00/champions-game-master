import UserDAO from "../repo/userDAO.js";
import bcrypt from "bcryptjs";
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const userDAO = new UserDAO();

export const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            logger.warn('Intento de crear usuario sin datos desde', { ip: req.ip });
            return res.status(400).json({ error: "Faltan datos" });
        }

        const existingUsername = await userDAO.findByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ error: "El username ya existe" });
        }

        const existingEmail = await userDAO.findByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ error: "El email ya existe" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await userDAO.create({
            username,
            email,
            password: hashedPassword
        });

        logger.audit(user._id, 'CREATE', 'User', { username, email });
        logger.info(`Usuario creado: ${username}`);

        const token = generateToken(user);

        res.status(201).json({
            message: "Usuario creado correctamente",
            token,
            user: user.toJSON()
        });

        } catch (error) {
        logger.error('Error en createUser:', { message: error.message });
        res.status(500).json({ error: "Error al crear usuario" });
        }
};

export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        const user = await userDAO.findByUsername(username);
        if (!user) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const token = generateToken(user);
        logger.audit(user._id, 'LOGIN', 'User', { ip: req.ip });
        logger.info(`Login exitoso: ${username}`);

        return res.status(200).json({
            message: "Login correcto",
            token,
            user: user.toJSON()
        });

        } catch (error) {
        logger.error("Error en login:", { message: error.message });
        return res.status(500).json({ error: "Error en el servidor" });
        }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await userDAO.findAll();
        const safeUsers = users.map(u => u.toJSON ? u.toJSON() : u);
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

        return res.json(user.toJSON());

    } catch (err) {
        logger.error("Error al obtener usuario:", { message: err.message });
        return res.status(500).json({ error: "Error al obtener usuario" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.password) {
            if (updates.password.length < 8) {
                return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
            }
            updates.password = await bcrypt.hash(updates.password, 12);
        }

        const updatedUser = await userDAO.update(id, updates);

        if (!updatedUser) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.status(200).json({
            message: "Usuario actualizado correctamente",
            user: updatedUser.toJSON()
        });

    } catch (error) {
        logger.error("Error al actualizar usuario:", { message: error.message });
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await userDAO.delete(req.params.id);

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.status(200).json({
            message: "Usuario eliminado correctamente",
            user: user.toJSON()
        });

    } catch (error) {
        logger.error("Error al eliminar usuario:", { message: error.message });
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
};
