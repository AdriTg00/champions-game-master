import axios from "axios";
import { config } from "../utils/config.js";
import { escapeRegex } from "../utils/security.js";
import { searchIGDB } from "../services/igdb.service.js";
import { searchSteam } from "../services/steam.service.js";
import gameDAO from "../repo/gameDAO.js";
import logger from "../utils/logger.js";

const SOURCE_PRIORITY = ["local", "rawg", "steam", "igdb"];

async function searchRawg(query, pageSize) {
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
      logger.warn("RAWG search failed, will try next source:", { query, message: err.message });
    }
    return null;
  }
}

async function searchLocal(query, pageSize) {
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

const SOURCES = {
  rawg: searchRawg,
  igdb: searchIGDB,
  steam: searchSteam,
  local: searchLocal,
};

export async function unifiedSearch(req, res) {
  try {
    const query = (req.query.name || "").trim();
    const pageSize = Math.min(parseInt(req.query.page_size) || 10, 30);

    if (!query) {
      const games = await searchLocal("", pageSize);
      return res.status(200).json({ games });
    }

    const allResults = await Promise.allSettled(
      SOURCE_PRIORITY.map((source) => {
        const fn = SOURCES[source];
        return fn ? fn(query, pageSize) : [];
      })
    );

    const seen = new Set();
    const results = [];

    for (const settled of allResults) {
      const games = settled.status === "fulfilled" ? settled.value : [];
      if (!Array.isArray(games)) continue;
      for (const g of games) {
        const key = g.name.toLowerCase().trim();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        results.push(g);
      }
    }

    results.sort((a, b) => {
      const aE = a.name.toLowerCase() === query.toLowerCase() ? 0 : 1;
      const bE = b.name.toLowerCase() === query.toLowerCase() ? 0 : 1;
      if (aE !== bE) return aE - bE;
      const aS = a.name.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
      const bS = b.name.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
      return aS - bS;
    });

    return res.status(200).json({ games: results.slice(0, pageSize) });
  } catch (err) {
    logger.error("unifiedSearch error:", { message: err.message });
    return res.status(500).json({ error: "Error en búsqueda" });
  }
}
