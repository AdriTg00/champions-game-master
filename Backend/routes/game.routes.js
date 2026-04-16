// routes/game.routes.js
import express from 'express';
import {
  createGame,
  getAllGames, // importante
  getGameById,
  updateGame,
  deleteGame,
  fetchExternalGame,
  importExternalGame,
  importBatch,
  getRandomGame, // importante
  pickGame,
  resetPicks,
  importAllFromFreeToGame,
  getCompactGames
} from '../controllers/game.controller.js';

const router = express.Router();

// CRUD básico
router.post('/', createGame);
router.get('/', getAllGames);

// Rutas de import / external (deben ir antes de '/:id')
router.get('/external/:id', fetchExternalGame);
router.post('/import/:id', importExternalGame);
router.post('/import', importBatch);

// NUEVAS rutas: import all y compact (antes de '/:id')
router.post('/import-all', importAllFromFreeToGame);
router.get('/compact', getCompactGames);

// Random / pick
router.get('/random', getRandomGame);
router.post('/pick/:id', pickGame);
router.post('/reset-picks', resetPicks);

// Rutas con :id al final
router.get('/:id', getGameById);
router.put('/:id', updateGame);
router.delete('/:id', deleteGame);

export default router;
