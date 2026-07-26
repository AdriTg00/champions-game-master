import axios from "axios";
import qs from "qs";
import { config } from "../utils/config.js";
import logger from "../utils/logger.js";

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_GAMES_URL = "https://api.igdb.com/v4/games";
const IGDB_COVERS_URL = "https://api.igdb.com/v4/covers";

let cachedToken = null;
let tokenExpiresAt = 0;

async function getTwitchToken() {
  if (!config.igdbClientId || !config.igdbClientSecret) return null;
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  try {
    const r = await axios.post(TWITCH_TOKEN_URL,
      qs.stringify({
        client_id: config.igdbClientId,
        client_secret: config.igdbClientSecret,
        grant_type: "client_credentials",
      }),
      { timeout: 10000 }
    );
    cachedToken = r.data.access_token;
    tokenExpiresAt = Date.now() + (r.data.expires_in - 60) * 1000;
    return cachedToken;
  } catch (err) {
    logger.error("IGDB token error:", { message: err.message });
    return null;
  }
}

function igdbHeaders() {
  return {
    "Client-ID": config.igdbClientId,
    "Authorization": `Bearer ${cachedToken}`,
    "Accept": "application/json",
  };
}

async function fetchCover(coverId) {
  try {
    const cb = await axios.post(IGDB_COVERS_URL,
      `fields url; where id = ${coverId};`,
      { headers: igdbHeaders(), timeout: 5000 }
    );
    if (cb.data?.[0]?.url) {
      const url = cb.data[0].url;
      return url.startsWith("//") ? `https:${url}` : url;
    }
  } catch {}
  return "";
}

function mapIGDBGame(g) {
  const imageUrl = g.cover
    ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover.image_id}.jpg`
    : "";
  return {
    _id: `igdb-${g.id}`,
    id: `igdb-${g.id}`,
    name: g.name,
    thumbnail: imageUrl,
    genre: (g.genres || []).map((x) => x.name || x).join(", "),
    platform: (g.platforms || []).map((p) => p.name || p).join(", "),
    metacritic: g.aggregated_rating ? Math.round(g.aggregated_rating) : 0,
    rating: g.rating ? Math.round(g.rating * 10) / 10 : 0,
    released: g.first_release_date
      ? new Date(g.first_release_date * 1000).toISOString().split("T")[0]
      : "",
    summary: g.summary || "",
  };
}

export async function searchIGDB(query, pageSize = 10) {
  if (!config.igdbClientId || !config.igdbClientSecret) return [];
  const token = await getTwitchToken();
  if (!token) return [];

  try {
    const body = `search "${query.replace(/"/g, '')}"; fields id,name,cover,genres,platforms,aggregated_rating,rating,first_release_date,summary; limit ${pageSize};`;
    const r = await axios.post(IGDB_GAMES_URL, body, {
      headers: igdbHeaders(),
      timeout: 10000,
    });
    if (!r.data?.length) return [];

    const results = await Promise.all(
      r.data.slice(0, pageSize).map(async (g) => {
        const mapped = mapIGDBGame(g);
        if (g.cover && !mapped.thumbnail) {
          const coverUrl = await fetchCover(g.cover);
          if (coverUrl) mapped.thumbnail = coverUrl;
        }
        return mapped;
      })
    );
    return results;
  } catch (err) {
    logger.error("IGDB search error:", { message: err.message });
    return [];
  }
}

export async function fetchGameFromIGDBByName(name) {
  if (!config.igdbClientId || !config.igdbClientSecret) return null;
  const results = await searchIGDB(name, 1);
  return results[0] || null;
}
