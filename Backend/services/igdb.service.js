// Backend/services/igdb.service.js
import axios from "axios";
import qs from "qs";

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_GAMES_URL = "https://api.igdb.com/v4/games";
const IGDB_COVERS_URL = "https://api.igdb.com/v4/covers";

async function getTwitchToken(clientId, clientSecret) {
  // Puedes cachearlo según prefieras (token dura horas)
  const params = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  };
  const r = await axios.post(`${TWITCH_TOKEN_URL}`, qs.stringify(params));
  return r.data.access_token;
}

export async function fetchGameFromIGDBByName(name, env) {
  const token = await getTwitchToken(env.IGDB_CLIENT_ID, env.IGDB_CLIENT_SECRET);
  // Consulta básica: pedimos id, name, cover, genres, summary
  const body = `search "${name}"; fields id,name,cover,genres,summary; limit 10;`;
  const r = await axios.post(IGDB_GAMES_URL, body, {
    headers: {
      "Client-ID": env.IGDB_CLIENT_ID,
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });
  if (!r.data || !r.data.length) return null;
  const g = r.data[0];

  // Obtener cover URL si existe
  let coverUrl = null;
  if (g.cover) {
    const cb = await axios.post(IGDB_COVERS_URL, `fields url,width,height; where id = ${g.cover};`, {
      headers: {
        "Client-ID": env.IGDB_CLIENT_ID,
        "Authorization": `Bearer ${token}`,
      },
    });
    if (cb.data && cb.data[0] && cb.data[0].url) {
      // IGDB returns e.g. //images.igdb.com/igdb/image/upload/t_thumb/xxx.jpg
      coverUrl = cb.data[0].url.startsWith("//") ? `https:${cb.data[0].url}` : cb.data[0].url;
      // Puedes pedir 't_cover_big' u otro tamaño si quieres
    }
  }

  // Para genres: IGDB devuelve ids en `genres`. Si quieres nombres, necesitarías otra consulta a /genres
  // Simplificamos: devolvemos ids; puedes mapear a nombre si necesitas
  return {
    externalId: g.id,
    name: g.name,
    summary: g.summary,
    coverUrl,
    genreIds: g.genres || [],
  };
}
