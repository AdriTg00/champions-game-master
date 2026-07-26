import client from "../api/client";
import { useAuthStore } from "../store/authStore";

const ENDPOINTS = {
  votes: "/api/data/votes",
  tierlist: "/api/data/tierlist",
  history: "/api/data/history",
};

function isAuthenticated() {
  return !!useAuthStore.getState().token;
}

export async function syncUpload(type, data) {
  if (!isAuthenticated()) return false;
  try {
    await client.put(ENDPOINTS[type], { data });
    return true;
  } catch {
    return false;
  }
}

export async function syncDownload(type) {
  if (!isAuthenticated()) return null;
  try {
    const res = await client.get(ENDPOINTS[type]);
    return res.data.data;
  } catch {
    return null;
  }
}

export async function syncUploadAll(payload) {
  if (!isAuthenticated()) return {};
  const results = {};
  for (const [type, data] of Object.entries(payload)) {
    results[type] = await syncUpload(type, data);
  }
  return results;
}

export async function syncDownloadAll(types) {
  if (!isAuthenticated()) return {};
  const results = {};
  for (const type of types) {
    try {
      const data = await syncDownload(type);
      if (data !== null) results[type] = data;
    } catch {}
  }
  return results;
}

export async function syncAfterLogin(localPayload) {
  const types = Object.keys(ENDPOINTS);
  await syncUploadAll(localPayload);
  const server = await syncDownloadAll(types);
  return server;
}
