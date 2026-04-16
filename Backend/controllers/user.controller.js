import UserDAO from "../repo/userDAO.js";
import bcrypt from "bcrypt";
import User from '../models/User.js';

const userDAO = new UserDAO();

// -----------------------------------------------------------
// CREAR USUARIO
// -----------------------------------------------------------
export const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
        }

        if (!email.includes("@")) {
            return res.status(400).json({ error: "El email debe contener @" });
        }

        if (!username.trim().length || !email.trim().length || !password.trim().length) {
            return res.status(400).json({ error: "Todos los campos deben tener contenido" });
        }

        const existingUsername = await userDAO.findByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ error: "El username ya existe" });
        }

        const existingEmail = await userDAO.findByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ error: "El email ya existe" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userDAO.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Usuario creado correctamente",
            user
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// -----------------------------------------------------------
// LOGIN DE USUARIO
// -----------------------------------------------------------
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        // Buscar usuario por username
        const user = await userDAO.findByUsername(username);
        if (!user) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }

        // Login exitoso
        return res.status(200).json({
            message: "Login correcto",
            user: user.toJSON()
        });

    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ error: "Error en el servidor" });
    }
};

// -----------------------------------------------------------
// OBTENER TODOS LOS USUARIOS
// -----------------------------------------------------------
export const getAllUsers = async (req, res) => {
    try {
        const users = await userDAO.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: error.message });
    }
};

// -----------------------------------------------------------
// OBTENER USUARIO POR ID
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// ACTUALIZAR USUARIO
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// ELIMINAR USUARIO
// -----------------------------------------------------------
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
