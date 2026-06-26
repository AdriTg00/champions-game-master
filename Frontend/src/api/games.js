import client from "./client";

export async function fetchRandom(genre) {
  const query = genre ? `?genre=${encodeURIComponent(genre)}` : "";
  const response = await client.get(`/api/games/random${query}`);
  return response.data.game ?? response.data;
}

export async function pickById(id) {
  const response = await client.post(`/api/games/pick/${id}`);
  return response.data;
}