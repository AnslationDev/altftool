// SSR-safe localStorage helpers for recent analyses and favorites.
// Mirrors the safeGet/safeSet pattern used by other tools in this repo
// (see src/tools/cognitive-performance-tracker/utils/storage.js).

const HISTORY_KEY = "estl_history";
const FAVORITES_KEY = "estl_favorites";
const MAX_HISTORY = 20;

function safeGet(key, fallback) {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full, disabled, or private-mode browsing — fail silently
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getHistory() {
  return safeGet(HISTORY_KEY, []);
}

export function pushHistory(entry) {
  const deduped = getHistory().filter((item) => item.subject !== entry.subject);
  const next = [{ ...entry, id: entry.id ?? makeId(), ts: entry.ts ?? Date.now() }, ...deduped].slice(0, MAX_HISTORY);
  safeSet(HISTORY_KEY, next);
  return next;
}

export function clearHistory() {
  safeSet(HISTORY_KEY, []);
  return [];
}

export function getFavorites() {
  return safeGet(FAVORITES_KEY, []);
}

export function toggleFavorite(entry) {
  const favorites = getFavorites();
  const exists = favorites.some((item) => item.subject === entry.subject);
  const next = exists
    ? favorites.filter((item) => item.subject !== entry.subject)
    : [{ ...entry, id: entry.id ?? makeId(), ts: entry.ts ?? Date.now() }, ...favorites];
  safeSet(FAVORITES_KEY, next);
  return next;
}

export function isFavorite(subject, favorites) {
  return favorites.some((item) => item.subject === subject);
}
