const STORAGE_KEY = "barcode-scanner:recent-scans";
const MAX_ENTRIES = 10;

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
    // Thumbnails can overflow the quota — retry once with half the list.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, Math.ceil(entries.length / 2))));
    } catch {
      // persistence is best-effort only
    }
  }
}

export function getScanHistory() {
  return readAll();
}

export function addScanToHistory(entry) {
  const entries = [
    { id: `scan-${Date.now()}`, ...entry },
    ...readAll().filter((item) => !(item.value === entry.value && item.format === entry.format)),
  ].slice(0, MAX_ENTRIES);
  writeAll(entries);
  return entries;
}

export function deleteScanFromHistory(id) {
  const entries = readAll().filter((item) => item.id !== id);
  writeAll(entries);
  return entries;
}
