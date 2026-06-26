import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser
} from '../controllers/user.controller.js';
import { verifyToken, requireOwnership } from '../middleware/auth.js';
import {
  validateUserCreation,
  validateUserLogin,
  validateUserUpdate,
  validateObjectId
} from '../middleware/validation.js';
import { loginLimiter, createUserLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/', createUserLimiter, validateUserCreation, createUser);
router.post('/login', loginLimiter, validateUserLogin, loginUser);
router.get('/', verifyToken, getAllUsers);
router.get('/:id', verifyToken, validateObjectId, getUserById);
router.put('/:id', verifyToken, validateObjectId, requireOwnership, validateUserUpdate, updateUser);
router.delete('/:id', verifyToken, validateObjectId, requireOwnership, deleteUser);

export default router;
