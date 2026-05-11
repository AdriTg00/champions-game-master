// routes/game.routes.js
import express from 'express';
import {
  createGame,
  getAllGames,
  getGameById,
  updateGame,
  deleteGame,
  fetchExternalGame,
  importExternalGame,
  importBatch,
  getRandomGame,
  pickGame,
  resetPicks,
  importAllFromFreeToGame,
  getCompactGames
} from '../controllers/game.controller.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import {
  validateGameCreation,
  validateGameUpdate,
  validateObjectId
} from '../middleware/validation.js';

const router = express.Router();

// CRUD básico
// POST y PUT requieren autenticación
router.post('/', verifyToken, validateGameCreation, createGame);
router.get('/', getAllGames);

// Rutas de import / external (deben ir antes de '/:id') - requieren autenticación
router.get('/external/:id', verifyToken, validateObjectId, fetchExternalGame);
router.post('/import/:id', verifyToken, validateObjectId, importExternalGame);
router.post('/import', verifyToken, importBatch);

// NUEVAS rutas: import all y compact (antes de '/:id') - requieren autenticación
router.post('/import-all', verifyToken, importAllFromFreeToGame);
router.get('/compact', getAllGames);

// Random / pick - pick requiere auth
router.get('/random', getRandomGame);
router.post('/pick/:id', optionalAuth, validateObjectId, pickGame);
router.post('/reset-picks', verifyToken, resetPicks);

// Rutas con :id al final
router.get('/:id', getGameById);
router.put('/:id', verifyToken, validateObjectId, validateGameUpdate, updateGame);
router.delete('/:id', verifyToken, validateObjectId, deleteGame);

export default router;
