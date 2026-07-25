import libraryDAO from "../repo/libraryDAO.js";
import logger from "../utils/logger.js";

export const getLibraryEntries = async (req, res) => {
  try {
    const { status, favorite, sort } = req.query;
    const entries = await libraryDAO.findByUser(req.userId, { status, favorite: favorite === "true", sort: sort ? { [sort]: -1 } : undefined });
    return res.status(200).json({ entries });
  } catch (err) {
    logger.error("getLibraryEntries:", { message: err.message });
    return res.status(500).json({ error: "Error al obtener la biblioteca" });
  }
};

export const getLibraryEntry = async (req, res) => {
  try {
    const entry = await libraryDAO.findOne(req.userId, req.params.gameId);
    if (!entry) return res.status(404).json({ error: "Entrada no encontrada" });
    return res.status(200).json({ entry });
  } catch (err) {
    logger.error("getLibraryEntry:", { message: err.message });
    return res.status(500).json({ error: "Error al obtener entrada" });
  }
};

export const addLibraryEntry = async (req, res) => {
  try {
    const { gameId, gameName, gameThumbnail, gameMeta, status } = req.body;
    if (!gameId || !gameName) return res.status(400).json({ error: "Faltan datos: gameId, gameName" });

    const existing = await libraryDAO.findOne(req.userId, gameId);
    if (existing) return res.status(400).json({ error: "El juego ya está en tu biblioteca" });

    const entry = await libraryDAO.create({
      userId: req.userId,
      gameId,
      gameName,
      gameThumbnail: gameThumbnail || "",
      gameMeta: gameMeta || {},
      status: status || "backlog",
    });
    logger.audit(req.userId, "CREATE", "LibraryEntry", { gameId, gameName });
    return res.status(201).json({ entry });
  } catch (err) {
    logger.error("addLibraryEntry:", { message: err.message });
    return res.status(500).json({ error: "Error al añadir juego a la biblioteca" });
  }
};

export const updateLibraryEntry = async (req, res) => {
  try {
    const allowed = ["status", "rating", "hoursPlayed", "favorite", "notes", "completionPercentage", "startedAt", "finishedAt"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const entry = await libraryDAO.update(req.params.id, req.userId, updates);
    if (!entry) return res.status(404).json({ error: "Entrada no encontrada" });
    logger.audit(req.userId, "UPDATE", "LibraryEntry", { id: req.params.id });
    return res.status(200).json({ entry });
  } catch (err) {
    logger.error("updateLibraryEntry:", { message: err.message });
    return res.status(500).json({ error: "Error al actualizar entrada" });
  }
};

export const deleteLibraryEntry = async (req, res) => {
  try {
    const entry = await libraryDAO.delete(req.params.id, req.userId);
    if (!entry) return res.status(404).json({ error: "Entrada no encontrada" });
    logger.audit(req.userId, "DELETE", "LibraryEntry", { id: req.params.id });
    return res.status(200).json({ message: "Entrada eliminada" });
  } catch (err) {
    logger.error("deleteLibraryEntry:", { message: err.message });
    return res.status(500).json({ error: "Error al eliminar entrada" });
  }
};

export const getLibraryStats = async (req, res) => {
  try {
    const stats = await libraryDAO.getStats(req.userId);
    return res.status(200).json({ stats });
  } catch (err) {
    logger.error("getLibraryStats:", { message: err.message });
    return res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};
