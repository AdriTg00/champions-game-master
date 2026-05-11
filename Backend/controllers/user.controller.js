import UserDAO from "../repo/userDAO.js";
import bcrypt from "bcrypt";
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const userDAO = new UserDAO();

export const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            logger.warn('Intento de crear usuario sin datos desde', req.ip);
            return res.status(400).json({ error: "Faltan datos" });
        }

                const existingUsername = await userDAO.findByUsername(username);
        if (existingUsername) {
            logger.warn(`Intento de crear usuario con username duplicado: ${username}`);
            return res.status(400).json({ error: "El username ya existe" });
        }

        const existingEmail = await userDAO.findByEmail(email);
        if (existingEmail) {
            logger.warn(`Intento de crear usuario con email duplicado: ${email}`);
            return res.status(400).json({ error: "El email ya existe" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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
        logger.error('Error en createUser:', error.message);
        res.status(500).json({ error: "Error al crear usuario" });
        }
};

export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            logger.warn(`Login sin datos desde ${req.ip}`);
            return res.status(400).json({ error: "Faltan datos" });
        }

        const user = await userDAO.findByUsername(username);
        if (!user) {
                        logger.warn(`Intento de login con usuario inexistente: ${username}`);
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
                        logger.warn(`Intento de login con contraseña incorrecta para: ${username}`);
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const token = generateToken(user);
        logger.audit(user._id, 'LOGIN', 'User', { username, ip: req.ip });
        logger.info(`Login exitoso: ${username}`);

        return res.status(200).json({
            message: "Login correcto",
            token,
            user: user.toJSON()
        });

        } catch (error) {
        logger.error("Error en login:", error.message);
        return res.status(500).json({ error: "Error en el servidor" });
        }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await userDAO.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: error.message });
        }
};

export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id ?? req.params.userId;
        if (!userId) return res.status(400).json({ error: "ID de usuario no proporcionado" });

        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        return res.json(user);

    } catch (err) {
        console.error("Error al obtener usuario:", err);
        return res.status(500).json({ error: "Server error" });
        }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
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
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: error.message });
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
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: error.message });
    }
};
