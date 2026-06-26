import axios from "axios";
import mongoose from "mongoose";
import GameDAO from "../repo/gameDAO.js";
import { escapeRegex } from '../utils/security.js';
import Game from '../models/Game.js';
import logger from '../utils/logger.js';

const gameDAO = new GameDAO();

const toJSON = (doc) => {
  if (!doc) return doc;
  return typeof doc.toJSON === 'function' ? doc.toJSON() : doc;
};
export const createGame = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.toString().trim().length) return res.status(400).json({ error: "Faltan datos: name" });
    const nameTrim = name.toString().trim();
    if (nameTrim.length > 100) return res.status(400).json({ error: "El nombre no puede tener más de 100 caracteres" });
    if (description && description.toString().length > 1000) return res.status(400).json({ error: "La descripción es demasiado larga" });

    const existing = await gameDAO.findByName(nameTrim);
    if (existing) return res.status(400).json({ error: "Ya existe un juego con ese nombre" });

    const created = await gameDAO.create({ name: nameTrim, description: description ? description.toString().trim() : undefined });
    logger.audit(req.userId, 'CREATE', 'Game', { name: nameTrim });
    logger.info(`Juego creado: ${nameTrim}`);
    return res.status(201).json({ message: "Juego creado correctamente", game: toJSON(created) });
  } catch (err) {
    logger.error("createGame:", { message: err.message });
    return res.status(500).json({ error: "Error al crear juego" });
  }
};

export const getAllGames = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 1000);
    const name = req.query.name;
    const filter = {};
    
    if (name) {
      const sanitizedName = escapeRegex(name.toString().trim());
      filter.name = { $regex: sanitizedName, $options: "i" };
    }
    
    const { data, total } = await gameDAO.findAll({ filter, page, limit, sort: { createdAt: -1 }});
    const gamesResp = data.map(toJSON);
    return res.status(200).json({ count: total, page, limit: limit || total, games: gamesResp });
  } catch (err) {
    logger.error("getAllGames:", { message: err.message });
    return res.status(500).json({ error: "Error al obtener juegos" });
  }
};


export const getGameById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID inválido" });
    const game = await gameDAO.findById(id);
    if (!game) return res.status(404).json({ error: "Juego no encontrado" });
    return res.status(200).json({ game: toJSON(game) });
  } catch (err) {
    logger.error("getGameById:", { message: err.message });
    return res.status(500).json({ error: "Error al obtener juego" });
  }
};


export const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID inválido" });

    if (updates.name !== undefined) {
      if (!updates.name || !updates.name.toString().trim().length) return res.status(400).json({ error: "El name no puede estar vacío" });
      if (updates.name.toString().length > 100) return res.status(400).json({ error: "El nombre es demasiado largo" });
      const nameTrim = updates.name.toString().trim();
      const existing = await gameDAO.findByName(nameTrim);
      if (existing && existing._id && existing._id.toString() !== id) return res.status(400).json({ error: "Ya existe otro juego con ese nombre" });
      updates.name = nameTrim;
    }

    if (updates.description !== undefined) {
      if (updates.description && updates.description.toString().length > 1000) return res.status(400).json({ error: "La descripción es demasiado larga" });
      updates.description = updates.description ? updates.description.toString().trim() : updates.description;
    }

    const updated = await gameDAO.update(id, updates);
    if (!updated) return res.status(404).json({ error: "Juego no encontrado" });
    logger.audit(req.userId, 'UPDATE', 'Game', { gameId: id, updates });
    return res.status(200).json({ message: "Juego actualizado exitosamente", game: toJSON(updated) });
  } catch (err) {
    logger.error("updateGame:", { message: err.message });
    return res.status(500).json({ error: "Error al actualizar juego" });
  }
};


export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID inválido" });
    const deleted = await gameDAO.delete(id);
    if (!deleted) return res.status(404).json({ error: "Juego no encontrado" });
    logger.audit(req.userId, 'DELETE', 'Game', { gameId: id });
    logger.warn(`Juego eliminado: ${id}`);
    return res.status(200).json({ message: "Juego eliminado exitosamente", game: toJSON(deleted) });
  } catch (err) {
    logger.error("deleteGame:", { message: err.message });
    return res.status(500).json({ error: "Error al eliminar juego" });
  }
};


export const fetchExternalGame = async (req, res) => {
  try {
    const extId = req.params.id;
    if (!extId || isNaN(Number(extId))) return res.status(400).json({ error: "ID externo inválido" });
    const url = `https://www.freetogame.com/api/game?id=${encodeURIComponent(extId)}`;
    const response = await axios.get(url, { timeout: 8000 });
        return res.status(200).json({ external: response.data });
  } catch (err) {
    if (err.response) return res.status(err.response.status).json({ error: err.response.data || "Error API externa" });
    logger.error("fetchExternalGame:", err.message);
    return res.status(500).json({ error: "Error al obtener datos externos" });
  }
};


export const importExternalGame = async (req, res) => {
  try {
    const extId = req.params.id;
    const url = `https://www.freetogame.com/api/game?id=${encodeURIComponent(extId)}`;
    const response = await axios.get(url, { timeout: 8000 });
    const external = response.data;

    const name = (external.title || "").toString().trim();
    if (!name) return res.status(400).json({ error: "Recurso externo sin título" });

    const existingByExternal = external.id ? await gameDAO.findByExternalId(String(external.id)) : null;
    if (existingByExternal) {
      return res.status(400).json({ error: "Ya existe un juego con ese externalId en la BD", game: toJSON(existingByExternal) });
    }

    const existingByName = await gameDAO.findByName(name);
    if (existingByName) {
      return res.status(400).json({ error: "Ya existe un juego con ese nombre en la BD", game: toJSON(existingByName) });
    }

    const gameData = {
      name,
      description: (external.short_description || "").toString().trim() || undefined,
      externalId: external.id ? String(external.id) : undefined,
      thumbnail: external.thumbnail || undefined,
      genre: external.genre || undefined,
      platform: external.platform || undefined
    };

    const created = await gameDAO.create(gameData);
    return res.status(201).json({ message: "Juego importado correctamente", game: toJSON(created) });
  } catch (err) {
    if (err.response) return res.status(err.response.status).json({ error: "Error al obtener datos externos" });
    logger.error("importExternalGame:", { message: err.message });
    return res.status(500).json({ error: "Error al importar el juego" });
  }
};


export const importBatch = async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : null;
    if (!ids || !ids.length) return res.status(400).json({ error: "Debes enviar un array 'ids' en el body" });
    if (ids.length > 500) return res.status(400).json({ error: "Máximo 500 ids por petición" });

    const results = await Promise.allSettled(ids.map(async (extId) => {
      if (!extId || isNaN(Number(extId))) return { id: extId, status: "invalid" };
      try {
        const url = `https://www.freetogame.com/api/game?id=${encodeURIComponent(extId)}`;
        const r = await axios.get(url, { timeout: 8000 });
        const external = r.data;
        const name = (external.title || "").toString().trim();
        if (!name) return { id: extId, status: "no-title" };

        const existingByExternal = external.id ? await gameDAO.findByExternalId(String(external.id)) : null;
        if (existingByExternal) return { id: extId, status: "exists", game: toJSON(existingByExternal) };

        const existing = await gameDAO.findByName(name);
        if (existing) return { id: extId, status: "exists", game: toJSON(existing) };

        const gameData = {
          name,
          description: external.short_description || undefined,
          externalId: external.id ? String(external.id) : undefined,
          thumbnail: external.thumbnail || undefined,
          genre: external.genre || undefined,
          platform: external.platform || undefined
        };
        const created = await gameDAO.create(gameData);
        return { id: extId, status: "imported", game: toJSON(created) };
      } catch (e) {
        return { id: extId, status: "error", error: e.response?.data || e.message };
      }
    }));
    
    return res.status(200).json({ results });
  } catch (err) {
    logger.error("importBatch:", { message: err.message });
    return res.status(500).json({ error: "Error en importBatch" });
  }
};


export const getRandomGame = async (req, res) => {
  try {
    const doc = await gameDAO.getRandomUnpicked();
    if (!doc) return res.status(404).json({ error: "No quedan juegos sin elegir" });
    return res.status(200).json({ game: doc });
  } catch (err) {
    logger.error("getRandomGame:", { message: err.message });
    return res.status(500).json({ error: "Error al obtener juego aleatorio" });
  }
};


export const pickGame = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID inválido" });
    const updated = await gameDAO.markPicked(id);
    if (!updated) return res.status(404).json({ error: "Juego no encontrado" });
    return res.status(200).json({ message: "Juego marcado como elegido", game: toJSON(updated) });
  } catch (err) {
    logger.error("pickGame:", { message: err.message });
    return res.status(500).json({ error: "Error al marcar juego" });
  }
};

export const resetPicks = async (req, res) => {
  try {
    const result = await gameDAO.resetAllPicked();
    return res.status(200).json({ message: "Reseteadas las elecciones", modifiedCount: result.modifiedCount ?? result.nModified ?? 0 });
  } catch (err) {
    logger.error("resetPicks:", { message: err.message });
    return res.status(500).json({ error: "Error al resetear elecciones" });
  }
};

export const importAllFromFreeToGame = async (req, res) => {
  try {
    const BATCH_SIZE = Math.min(parseInt(req.query.batchSize) || 50, 200);
    const REMOTE_ALL_URL = 'https://www.freetogame.com/api/games';

    const r = await axios.get(REMOTE_ALL_URL, { timeout: 30000 });
    const remoteGames = Array.isArray(r.data) ? r.data : [];
    if (!remoteGames.length) return res.status(200).json({ message: "No hay juegos externos disponibles", total: 0 });

    let imported = 0;
    let exists = 0;
    let errors = 0;
    const results = [];

    for (let i = 0; i < remoteGames.length; i += BATCH_SIZE) {
      const batch = remoteGames.slice(i, i + BATCH_SIZE);

      for (const external of batch) {
        try {
          const extId = external.id ? String(external.id) : undefined;
          const name = (external.title || '').toString().trim();
          if (!name) {
            results.push({ extId, status: 'no-title' });
            errors++;
            continue;
          }

          let existing = null;
          if (extId) existing = await gameDAO.findByExternalId(extId);
          if (!existing) existing = await gameDAO.findByName(name);

          if (existing) {
            results.push({ extId, status: 'exists', id: existing._id?.toString?.() });
            exists++;
            continue;
          }

          const created = await gameDAO.create({
            name,
            description: (external.short_description || '').toString().trim() || undefined,
            externalId: extId || undefined,
            thumbnail: external.thumbnail || undefined,
            genre: external.genre || undefined,
            platform: external.platform || undefined
          });

          results.push({ extId, status: 'imported', id: created._id.toString() });
          imported++;
        } catch (err) {
          errors++;
          results.push({ extId: external?.id, status: 'error', error: err.message || String(err) });
        }
      }

      await new Promise(r => setTimeout(r, 200));
    }

    return res.status(200).json({
      message: "Import completo",
      totalRemote: remoteGames.length,
      imported,
      exists,
      errors,
      detailsCount: results.length,
      sample: results.slice(0, 20)
    });
  } catch (err) {
    logger.error("importAllFromFreeToGame:", { message: err.message });
    return res.status(500).json({ error: "Error importando todos los juegos" });
  }
};

export const getThumbnailStatus = async (req, res) => {
  try {
    const total = await Game.countDocuments();
    const withThumbnail = await Game.countDocuments({ thumbnail: { $exists: true, $ne: null, $ne: '' } });
    const withoutThumbnail = total - withThumbnail;
    const sample = await Game.findOne({ thumbnail: { $exists: true, $ne: null, $ne: '' } }).select('name thumbnail').lean();
    const sampleWithout = await Game.findOne({ $or: [{ thumbnail: null }, { thumbnail: '' }, { thumbnail: { $exists: false } }] }).select('name externalId').lean();

    return res.status(200).json({
      total,
      withThumbnail,
      withoutThumbnail,
      sampleWithThumbnail: sample ? { name: sample.name, thumbnail: sample.thumbnail } : null,
      sampleWithoutThumbnail: sampleWithout ? { name: sampleWithout.name, externalId: sampleWithout.externalId } : null,
    });
  } catch (err) {
    logger.error("getThumbnailStatus:", { message: err.message });
    return res.status(500).json({ error: "Error al obtener estado de thumbnails" });
  }
};

export const backfillThumbnails = async (req, res) => {
  try {
    const games = await Game.find({
      externalId: { $exists: true, $ne: null },
      $or: [{ thumbnail: null }, { thumbnail: '' }, { thumbnail: { $exists: false } }]
    }).limit(200).lean();

    if (!games.length) {
      return res.status(200).json({ message: 'No hay juegos sin thumbnail', processed: 0 });
    }

    let updated = 0;
    let failed = 0;

    for (const game of games) {
      try {
        const url = `https://www.freetogame.com/api/game?id=${encodeURIComponent(game.externalId)}`;
        const response = await axios.get(url, { timeout: 8000 });
        const external = response.data;

        if (external && external.thumbnail) {
          await Game.findByIdAndUpdate(game._id, { thumbnail: external.thumbnail });
          updated++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return res.status(200).json({
      message: 'Backfill completado',
      processed: games.length,
      updated,
      failed,
    });
  } catch (err) {
    logger.error("backfillThumbnails:", { message: err.message });
    return res.status(500).json({ error: "Error en backfill de thumbnails" });
  }
};

export const getCompactGames = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const random = req.query.random === 'true' || req.query.random === true;

    if (random) {
      const GameModel = mongoose.model('Game');
      const docs = await GameModel.aggregate([
        { $sample: { size: limit } },
        { $project: { _id: 1, name: 1, thumbnail: 1 } }
      ]);
      return res.status(200).json({ count: docs.length, games: docs });
    } else {
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const { data, total } = await gameDAO.findAll({ filter: {}, page, limit, sort: { createdAt: -1 }});
      const compact = data.map(d => ({ _id: d._id, name: d.name, thumbnail: d.thumbnail }));
      return res.status(200).json({ count: total, page, limit, games: compact });
    }
  } catch (err) {
    logger.error("getCompactGames:", { message: err.message });
    return res.status(500).json({ error: "Error obteniendo juegos compactos" });
  }
};
