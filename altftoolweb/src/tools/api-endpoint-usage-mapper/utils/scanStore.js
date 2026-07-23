const HISTORY_KEY = "api-endpoint-usage-mapper:scan-history";
const FAVORITES_KEY = "api-endpoint-usage-mapper:favorites";
const MAX_HISTORY = 12;

function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // persistence is best-effort only
  }
}

export function getScanHistory() {
  return read(HISTORY_KEY, []);
}

// Oldest → newest, capped. Each entry stores metric totals only (not corpora).
export function recordScan(totals) {
  const history = read(HISTORY_KEY, []);
  const entry = { id: `scan-${Date.now()}`, at: Date.now(), ...totals };
  const next = [...history, entry].slice(-MAX_HISTORY);
  write(HISTORY_KEY, next);
  return next;
}

export function clearScanHistory() {
  write(HISTORY_KEY, []);
  return [];
}

export function getFavorites() {
  return new Set(read(FAVORITES_KEY, []));
}

export function toggleFavorite(key) {
  const favorites = getFavorites();
  if (favorites.has(key)) favorites.delete(key);
  else favorites.add(key);
  write(FAVORITES_KEY, [...favorites]);
  return favorites;
}
