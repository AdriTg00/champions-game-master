import userDataDAO from "../repo/userDataDAO.js";
import logger from "../utils/logger.js";

async function getData(req, res, type) {
  try {
    const result = await userDataDAO.findByUserAndType(req.userId, type);
    return res.status(200).json({ data: result ? result.data : null });
  } catch (err) {
    logger.error(`get${type}:`, { message: err.message });
    return res.status(500).json({ error: "Error al obtener datos" });
  }
}

async function updateData(req, res, type) {
  try {
    const { data } = req.body;
    if (data === undefined) {
      return res.status(400).json({ error: "Faltan datos" });
    }
    const result = await userDataDAO.upsert(req.userId, type, data);
    logger.audit(req.userId, "UPSERT", `UserData:${type}`);
    return res.status(200).json({ data: result.data, updatedAt: result.updatedAt });
  } catch (err) {
    if (err.message === "Data exceeds size limit") {
      return res.status(413).json({ error: "Datos demasiado grandes" });
    }
    logger.error(`update${type}:`, { message: err.message });
    return res.status(500).json({ error: "Error al guardar datos" });
  }
}

export const getVotes = (req, res) => getData(req, res, "votes");
export const updateVotes = (req, res) => updateData(req, res, "votes");
export const getTierList = (req, res) => getData(req, res, "tierlist");
export const updateTierList = (req, res) => updateData(req, res, "tierlist");
export const getHistory = (req, res) => getData(req, res, "history");
export const updateHistory = (req, res) => updateData(req, res, "history");
