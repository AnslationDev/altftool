// Safe localStorage helpers (no-op on server / when storage is unavailable).
export function loadValue(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeValue(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

// Module-level id generator (kept out of render scope for React purity).
export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `p_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
