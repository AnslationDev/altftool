const STORAGE_KEY = "barcode-generator:history";
const MAX_ENTRIES = 12;

function readAll() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(entries) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Thumbnails can overflow the quota — retry once without the oldest half.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, Math.ceil(entries.length / 2))));
    } catch {
      // persistence is best-effort only
    }
  }
}

export function getHistory() {
  return readAll();
}

export function saveToHistory(entry) {
  const entries = [
    { id: `bc-${Date.now()}`, savedAt: Date.now(), ...entry },
    ...readAll().filter((item) => !(item.data === entry.data && item.format === entry.format)),
  ].slice(0, MAX_ENTRIES);
  writeAll(entries);
  return entries;
}

export function deleteFromHistory(id) {
  const entries = readAll().filter((item) => item.id !== id);
  writeAll(entries);
  return entries;
}
