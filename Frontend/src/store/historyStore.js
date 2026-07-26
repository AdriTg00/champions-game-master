import { syncUpload, syncDownload } from "../utils/syncData";

const HISTORY_KEY = "vs.rank.history.v1";

export function loadHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function saveHistoryEntry(entry) {
  if (typeof window === "undefined") return;
  const list = loadHistory();
  const next = [entry, ...list].slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  await syncUpload("history", next);
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

export async function syncHistoryFromServer() {
  const server = await syncDownload("history");
  if (server && Array.isArray(server) && server.length) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(server));
  }
  return loadHistory();
}

export function getHistoryPayload() {
  return loadHistory();
}
