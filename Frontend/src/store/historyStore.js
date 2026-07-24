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

export function saveHistoryEntry(entry) {
  if (typeof window === "undefined") return;
  const list = loadHistory();
  const next = [entry, ...list].slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}
