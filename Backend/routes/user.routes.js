// routes/user.routes.js
import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser                 // ← IMPORTACIÓN AÑADIDA
} from '../controllers/user.controller.js';

const router = express.Router();

// POST /api/users - Crear usuario
router.post('/', createUser);

// POST /api/users/login - Iniciar sesión
router.post('/login', loginUser);   // ← NUEVA RUTA

// GET /api/users - Obtener todos los usuarios
router.get('/', getAllUsers);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', getUserById);

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', updateUser);

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', deleteUser);

export default router;
