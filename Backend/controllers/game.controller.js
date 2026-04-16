// controllers/game.controller.js
import axios from "axios";
import mongoose from "mongoose";
import GameDAO from "../repo/gameDAO.js"; // ajustado a tu carpeta 'repo'

const gameDAO = new GameDAO();

/* Basic CRUD */

// POST /api/games
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
    return res.status(201).json({ message: "Juego creado correctamente", game: created.toJSON ? created.toJSON() : created });
  } catch (err) {
    console.error("createGame:", err);
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/games
export const getAllGames = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const name = req.query.name;
    const filter = {};
    if (name) filter.name = { $regex: name.toString().trim(), $options: "i" };
    const { data, total } = await gameDAO.findAll({ filter, page, limit, sort: { createdAt: -1 }});
    const gamesResp = data.map(g => (g.toJSON ? g.toJSON() : g));
    return res.status(200).json({ count: total, page, limit: limit || total, games: gamesResp });
  } catch (err) {
    console.error("getAllGames:", err);
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/games/:id
export const getGameById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID inválido" });
    const game = await gameDAO.findById(id);
    if (!game) return res.status(404).json({ error: "Juego no encontrado" });
    return res.status(200).json({ game: game.toJSON ? game.toJSON() : game });
  } catch (err) {
    console.error("getGameById:", err);
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/games/:id
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
    return res.status(200).json({ message: "Juego actualizado exitosamente", game: updated.toJSON ? updated.toJSON() : updated });
  } catch (err) {
    console.error("updateGame:", err);
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /api/games/:id
export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID inválido" });
    const deleted = await gameDAO.delete(id);
    if (!deleted) return res.status(404).json({ error: "Juego no encontrado" });
    return res.status(200).json({ message: "Juego eliminado exitosamente", game: deleted.toJSON ? deleted.toJSON() : deleted });
  } catch (err) {
    console.error("deleteGame:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* -------------------
   FreeToGame integration
   ------------------- */

// GET /api/games/external/:id  -> trae datos externos (no guarda)
export const fetchExternalGame = async (req, res) => {
  try {
    const extId = req.params.id;
    if (!extId || isNaN(Number(extId))) return res.status(400).json({ error: "ID externo inválido" });
    const url = `https://www.freetogame.com/api/game?id=${encodeURIComponent(extId)}`;
    const response = await axios.get(url, { timeout: 8000 });
    return res.status(200).json({ external: response.data });
  } catch (err) {
    if (err.response) return res.status(err.response.status).json({ error: err.response.data || "Error API externa" });
    console.error("fetchExternalGame:", err.message);
    return res.status(500).json({ error: "Error al obtener datos externos" });
  }
};

// POST /api/games/import/:id  -> importar 1 juego externo a BD
export const importExternalGame = async (req, res) => {
  try {
    const extId = req.params.id;
    if (!extId || isNaN(Number(extId))) return res.status(400).json({ error: "ID externo inválido" });
    const url = `https://www.freetogame.com/api/game?id=${encodeURIComponent(extId)}`;
    const response = await axios.get(url, { timeout: 8000 });
    const external = response.data;

    const name = (external.title || "").toString().trim();
    const description = (external.short_description || "").toString().trim();
    if (!name) return res.status(400).json({ error: "Recurso externo sin título" });

    // Evitar duplicados: primero por externalId, luego por name
    const existingByExternal = external.id ? await gameDAO.findByExternalId(String(external.id)) : null;
    if (existingByExternal) {
      return res.status(400).json({ error: "Ya existe un juego con ese externalId en la BD", game: existingByExternal.toJSON ? existingByExternal.toJSON() : existingByExternal });
    }

    const existingByName = await gameDAO.findByName(name);
    if (existingByName) {
      return res.status(400).json({ error: "Ya existe un juego con ese nombre en la BD", game: existingByName.toJSON ? existingByName.toJSON() : existingByName });
    }

    const gameData = {
      name,
      description: description || undefined,
      externalId: external.id ? String(external.id) : undefined,
      thumbnail: external.thumbnail || undefined,
      genre: external.genre || undefined,
      platform: external.platform || undefined
    };

    const created = await gameDAO.create(gameData);
    return res.status(201).json({ message: "Juego importado correctamente", game: created.toJSON ? created.toJSON() : created });
  } catch (err) {
    if (err.response) return res.status(err.response.status).json({ error: err.response.data || "Error API externa" });
    console.error("importExternalGame:", err);
    return res.status(500).json({ error: "Error al importar el juego" });
  }
};

// POST /api/games/import  -> importar en batch (body: { ids: [452,123,...] })
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

        // Evitar duplicados por externalId primero
        const existingByExternal = external.id ? await gameDAO.findByExternalId(String(external.id)) : null;
        if (existingByExternal) return { id: extId, status: "exists", game: existingByExternal.toJSON ? existingByExternal.toJSON() : existingByExternal };

        const existing = await gameDAO.findByName(name);
        if (existing) return { id: extId, status: "exists", game: existing.toJSON ? existing.toJSON() : existing };

        const gameData = {
          name,
          description: external.short_description || undefined,
          externalId: external.id ? String(external.id) : undefined,
          thumbnail: external.thumbnail || undefined,
          genre: external.genre || undefined,
          platform: external.platform || undefined
        };
        const created = await gameDAO.create(gameData);
        return { id: extId, status: "imported", game: created.toJSON ? created.toJSON() : created };
      } catch (e) {
        return { id: extId, status: "error", error: e.response ? e.response.data : e.message };
      }
    }));

    return res.status(200).json({ results });
  } catch (err) {
    console.error("importBatch:", err);
    return res.status(500).json({ error: "Error en importBatch" });
  }
};

/* -------------------
   Random / Pick flow
   ------------------- */

// GET /api/games/random -> juego aleatorio no-picked
export const getRandomGame = async (req, res) => {
  try {
    const doc = await gameDAO.getRandomUnpicked();
    if (!doc) return res.status(404).json({ error: "No quedan juegos sin elegir" });
    return res.status(200).json({ game: doc });
  } catch (err) {
    console.error("getRandomGame:", err);
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/games/pick/:id -> marca juego como elegido (picked = true)
export const pickGame = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID inválido" });
    const updated = await gameDAO.markPicked(id);
    if (!updated) return res.status(404).json({ error: "Juego no encontrado" });
    return res.status(200).json({ message: "Juego marcado como elegido", game: updated.toJSON ? updated.toJSON() : updated });
  } catch (err) {
    console.error("pickGame:", err);
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/games/reset-picks -> resetea picked = false para todos
export const resetPicks = async (req, res) => {
  try {
    const result = await gameDAO.resetAllPicked();
    // result.modifiedCount en mongoose 6/7
    return res.status(200).json({ message: "Reseteadas las elecciones", modifiedCount: result.modifiedCount ?? result.nModified ?? 0 });
  } catch (err) {
    console.error("resetPicks:", err);
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/games/import-all
// Descarga https://www.freetogame.com/api/games y los importa en batches,
// evitando duplicados por externalId (y por name si externalId faltase).
export const importAllFromFreeToGame = async (req, res) => {
  try {
    const BATCH_SIZE = parseInt(req.query.batchSize) || 50; // opcional ?batchSize=30
    const REMOTE_ALL_URL = 'https://www.freetogame.com/api/games';

    // 1) obtener listado completo desde FreeToGame
    const r = await axios.get(REMOTE_ALL_URL, { timeout: 30000 });
    const remoteGames = Array.isArray(r.data) ? r.data : [];
    if (!remoteGames.length) return res.status(200).json({ message: "No hay juegos externos disponibles", total: 0 });

    // 2) procesar por batches
    let imported = 0;
    let exists = 0;
    let errors = 0;
    const results = [];

    for (let i = 0; i < remoteGames.length; i += BATCH_SIZE) {
      const batch = remoteGames.slice(i, i + BATCH_SIZE);

      // procesar secuencialmente cada item del batch para no saturar la BD
      for (const external of batch) {
        try {
          const extId = external.id ? String(external.id) : undefined;
          const name = (external.title || '').toString().trim();
          const description = (external.short_description || '').toString().trim();
          const thumbnail = external.thumbnail || undefined;
          const genre = external.genre || undefined;
          const platform = external.platform || undefined;

          if (!name) {
            results.push({ extId, status: 'no-title' });
            errors++;
            continue;
          }

          // comprobar duplicado por externalId
          let existing = null;
          if (extId) existing = await gameDAO.findByExternalId(extId);
          if (!existing) existing = await gameDAO.findByName(name);

          if (existing) {
            results.push({ extId, status: 'exists', id: existing._id?.toString?.() });
            exists++;
            continue;
          }

          // crear
          const created = await gameDAO.create({
            name,
            description: description || undefined,
            externalId: extId || undefined,
            thumbnail,
            genre,
            platform
          });

          results.push({ extId, status: 'imported', id: created._id.toString() });
          imported++;
        } catch (err) {
          errors++;
          results.push({ extId: external?.id, status: 'error', error: err.message || String(err) });
        }
      }
      // pequeña pausa para no golpear la API/BD (ajustable)
      await new Promise(r => setTimeout(r, 200));
    }

    return res.status(200).json({
      message: "Import completo",
      totalRemote: remoteGames.length,
      imported,
      exists,
      errors,
      detailsCount: results.length,
      sample: results.slice(0, 20) // devolver solo una muestra para no saturar la respuesta
    });
  } catch (err) {
    console.error("importAllFromFreeToGame:", err);
    return res.status(500).json({ error: err.message || 'Error importando todos los juegos' });
  }
};

// GET /api/games/compact?limit=100&random=true
// Devuelve lista compacta de { _id, name, thumbnail } para mostrar en galería
export const getCompactGames = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000); // límite máximo 1000
    const random = req.query.random === 'true' || req.query.random === true;

    if (random) {
      // obtener 'limit' docs aleatorios
      const pipeline = [
        { $sample: { size: limit } },
        { $project: { name: 1, thumbnail: 1 } }
      ];
      const docs = await (await gameDAO.findAll()).data; // fallback
      // Pero preferimos usar aggregate direct con el model: gameDAO no tiene método aggregate, así:
      // usar Game model directamente sería más simple, pero para mantener abstracción:
      // Hacemos consulta simple: si hay menos de limit, devuelve todas.
      const all = (await gameDAO.findAll({ limit: 0 })).data;
      const shuffled = all.sort(() => 0.5 - Math.random()).slice(0, limit);
      const compact = shuffled.map(d => ({ _id: d._id, name: d.name, thumbnail: d.thumbnail }));
      return res.status(200).json({ count: compact.length, games: compact });
    } else {
      // paginado simple por fecha
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const offset = (page - 1) * limit;
      const { data, total } = await gameDAO.findAll({ filter: {}, page, limit, sort: { createdAt: -1 }});
      const compact = data.map(d => ({ _id: d._id, name: d.name, thumbnail: d.thumbnail }));
      return res.status(200).json({ count: total, page, limit, games: compact });
    }
  } catch (err) {
    console.error("getCompactGames:", err);
    return res.status(500).json({ error: err.message || 'Error obteniendo juegos compactos' });
  }
};
