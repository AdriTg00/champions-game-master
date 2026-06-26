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
  validateObjectId,
  validateNumericParam
} from '../middleware/validation.js';
import {
  getThumbnailStatus,
  backfillThumbnails
} from '../controllers/game.controller.js';

const router = express.Router();

// CRUD básico
// POST y PUT requieren autenticación
router.post('/', verifyToken, validateGameCreation, createGame);
router.get('/', getAllGames);

router.get('/external/:id', verifyToken, validateNumericParam, fetchExternalGame);
router.post('/import/:id', verifyToken, validateNumericParam, importExternalGame);
router.post('/import', verifyToken, importBatch);

router.get('/thumbnails/status', verifyToken, getThumbnailStatus);
router.post('/thumbnails/backfill', verifyToken, backfillThumbnails);

router.post('/import-all', verifyToken, importAllFromFreeToGame);
router.get('/compact', getCompactGames);

// Random / pick - pick requiere auth
router.get('/random', getRandomGame);
router.post('/pick/:id', optionalAuth, validateObjectId, pickGame);
router.post('/reset-picks', verifyToken, resetPicks);

// Rutas con :id al final
router.get('/:id', getGameById);
router.put('/:id', verifyToken, validateObjectId, validateGameUpdate, updateGame);
router.delete('/:id', verifyToken, validateObjectId, deleteGame);

export default router;
