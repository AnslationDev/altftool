// localStorage history of checked domains (safeGet/safeSet pattern used
// across this repo's tools). Prefix "eac_".

const HISTORY_KEY = "eac_history";
const MAX_HISTORY = 10;

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
    // storage unavailable — fail silently
  }
}

export function getHistory() {
  return safeGet(HISTORY_KEY, []);
}

export function pushHistory(entry) {
  const deduped = getHistory().filter((e) => e.domain !== entry.domain);
  const next = [
    { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ts: Date.now() },
    ...deduped,
  ].slice(0, MAX_HISTORY);
  safeSet(HISTORY_KEY, next);
  return next;
}

export function clearHistory() {
  safeSet(HISTORY_KEY, []);
  return [];
}
