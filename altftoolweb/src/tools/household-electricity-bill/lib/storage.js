const STORAGE_KEY = "abhilfe-electricity-estimator";

export function loadSettings() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSettings(settings) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    return;
  }
}

export function clearSettings() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}