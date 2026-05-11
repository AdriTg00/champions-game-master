// src/api/games.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api/games",
});

export async function fetchGamesList() {
  const response = await api.get("/");
  return response.data;
}

export async function fetchRandom(genre) {
  const query = genre ? `?genre=${encodeURIComponent(genre)}` : "";
  const response = await api.get(`/random${query}`);

  return response.data.game ?? response.data;
}

export async function pickById(id) {
  const response = await api.post(`/pick/${id}`);
  return response.data;
}

// Endpoint antiguo: POST /api/games/:gameId/select
export async function selectByIdLegacy(gameId) {
  const response = await api.post(`/${gameId}/select`);
  return response.data;
}

export async function getRanking() {
  const response = await axios.get("/ranking");
  return response.data;
}