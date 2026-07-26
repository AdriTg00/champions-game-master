import axios from "axios";
import { config } from "../utils/config.js";
import { escapeRegex } from "../utils/security.js";
import { searchIGDB } from "../services/igdb.service.js";
import { searchSteam } from "../services/steam.service.js";
import gameDAO from "../repo/gameDAO.js";
import logger from "../utils/logger.js";

async function searchRawgDirect(query, pageSize) {
  if (!config.rawgApiKey) return [];
  try {
    const url = `https://api.rawg.io/api/games?key=${config.rawgApiKey}&page_size=${pageSize}&search=${encodeURIComponent(query)}&search_precise=false`;
    const r = await axios.get(url, { timeout: 10000 });
    return (r.data?.results || []).map((g) => ({
      _id: `rawg-${g.id}`,
      id: `rawg-${g.id}`,
      name: g.name,
      thumbnail: g.background_image || "",
      genre: (g.genres || []).map((x) => x.name).join(", "),
      platform: (g.platforms || []).map((p) => p.platform?.name).filter(Boolean).join(", "),
      metacritic: g.metacritic || 0,
      rating: g.rating || 0,
      released: g.released || "",
      _source: "rawg",
    }));
  } catch (err) {
    if (err.response?.status !== 401 && err.response?.status !== 403) {
      logger.error("RAWG direct search error:", { message: err.message });
    }
    return [];
  }
}

async function searchLocalGamesDirect(query, pageSize) {
  try {
    const filter = query ? { name: { $regex: escapeRegex(query), $options: "i" } } : {};
    const { data } = await gameDAO.findAll({ filter, page: 1, limit: pageSize, sort: { name: 1 } });
    return data.map((g) => ({
      _id: g._id,
      id: g._id,
      name: g.name,
      thumbnail: g.thumbnail || "",
      genre: g.genre || "",
      platform: g.platform || "",
      metacritic: g.metacritic || 0,
      rating: g.rating || 0,
      released: "",
      _source: "local",
    }));
  } catch (err) {
    logger.error("Local search error:", { message: err.message });
    return [];
  }
}

export async function unifiedSearch(req, res) {
  try {
    const query = (req.query.name || "").trim();
    const pageSize = Math.min(parseInt(req.query.page_size) || 10, 30);

    if (!query) {
      const local = await searchLocalGamesDirect("", pageSize);
      return res.status(200).json({ games: local });
    }

    const responses = await Promise.allSettled([
      searchRawgDirect(query, pageSize),
      searchIGDB(query, pageSize),
      searchSteam(query, pageSize),
      searchLocalGamesDirect(query, pageSize),
    ]);

    const allGames = [];
    for (const r of responses) {
      if (r.status === "fulfilled") allGames.push(...r.value);
    }

    const seen = new Set();
    const deduped = allGames.filter((g) => {
      const key = g.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    deduped.sort((a, b) => {
      const aE = a.name.toLowerCase() === query.toLowerCase() ? 0 : 1;
      const bE = b.name.toLowerCase() === query.toLowerCase() ? 0 : 1;
      if (aE !== bE) return aE - bE;
      const aS = a.name.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
      const bS = b.name.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
      return aS - bS;
    });

    return res.status(200).json({ games: deduped.slice(0, pageSize) });
  } catch (err) {
    logger.error("unifiedSearch error:", { message: err.message });
    return res.status(500).json({ error: "Error en búsqueda unificada" });
  }
}
