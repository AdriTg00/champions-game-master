// src/api/games.js
import axios from "axios";
const api = axios.create({ baseURL: "/api/games" });

// Si tu backend monta otro router cambia la baseURL o endpoints a los que correspondan.
export async function fetchGamesList() { // GET /api/games
  const r = await api.get("/");
  return r.data; // si tu backend devuelve { games: [...] } o array; ajusta
}

export async function fetchRandom(genre) { // GET /api/games/random?genre=...
  const q = genre ? `?genre=${encodeURIComponent(genre)}` : "";
  const r = await api.get(`/random${q}`);
  return r.data.game ?? r.data; // adaptarse según respuesta
}

export async function pickById(id) { // POST /api/games/pick/:id
  const r = await api.post(`/pick/${id}`);
  return r.data;
}

// Si tu backend solo tiene POST /api/games/:gameId/select (ver games.routes.js plural),
// en ese caso usa:
export async function selectById_legacy(gameId) { // POST /api/games/:gameId/select
  const r = await axios.post(`/api/games/${gameId}/select`);
  return r.data;
}

export async function getRanking() {
  const r = await axios.get("/ranking");
  return r.data;
}
