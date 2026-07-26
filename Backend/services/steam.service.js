import axios from "axios";
import { config } from "../utils/config.js";
import logger from "../utils/logger.js";

const STEAM_SEARCH_URL = "https://api.steampowered.com/ISteamApps/GetAppList/v2/";
const STEAM_APP_DETAILS_URL = "https://store.steampowered.com/api/appdetails";
const STEAM_APP_INFO_URL = "https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/";

let appListCache = null;
let appListCacheTime = 0;

async function getAppList() {
  if (appListCache && Date.now() - appListCacheTime < 3600000) return appListCache;
  try {
    const r = await axios.get(STEAM_SEARCH_URL, { timeout: 15000 });
    appListCache = r.data?.applist?.apps || [];
    appListCacheTime = Date.now();
    return appListCache;
  } catch (err) {
    logger.error("Steam applist error:", { message: err.message });
    return [];
  }
}

function mapSteamGame(app) {
  return {
    _id: `steam-${app.appid}`,
    id: `steam-${app.appid}`,
    name: app.name,
    thumbnail: "",
    genre: "",
    platform: "PC",
    metacritic: 0,
    rating: 0,
    released: "",
    steamAppId: app.appid,
  };
}

export async function searchSteam(query, pageSize = 10) {
  if (!config.steamApiKey) return [];
  try {
    const apps = await getAppList();
    if (!apps.length) return [];

    const q = query.toLowerCase();
    const exact = apps.find((a) => a.name.toLowerCase() === q);
    const matches = apps.filter((a) => a.name.toLowerCase().includes(q));
    const sorted = matches.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts || a.name.length - b.name.length;
    });

    const top = exact ? [exact, ...sorted.filter((a) => a.appid !== exact.appid)] : sorted;
    const results = top.slice(0, pageSize).map(mapSteamGame);

    const detailResults = await Promise.allSettled(
      results.slice(0, 5).map(async (game) => {
        try {
          const detail = await axios.get(STEAM_APP_DETAILS_URL, {
            params: { appids: game.steamAppId },
            timeout: 5000,
          });
          const data = detail.data?.[String(game.steamAppId)];
          if (data?.success) {
            game.thumbnail = data.data?.header_image || "";
            game.genre = (data.data?.genres || []).map((g) => g.description).join(", ");
            game.metacritic = data.data?.metacritic?.score || 0;
            game.released = data.data?.release_date?.date || "";
            game.rating = data.data?.metacritic?.score
              ? Math.round(data.data.metacritic.score / 10)
              : 0;
          }
        } catch {}
      })
    );
    return results;
  } catch (err) {
    logger.error("Steam search error:", { message: err.message });
    return [];
  }
}
