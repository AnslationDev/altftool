export const HISTORY_KEY = "altftool_clipboard_history_data";
export const MAX_HISTORY = 500;

// Detect the type of content automatically
export function detectContentType(text) {
  if (!text || text.trim() === "") return "text";
  const trimmed = text.trim();

  // URL detection
  try {
    new URL(trimmed);
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("ftp://")) {
      return "url";
    }
  } catch (_) {}

  // Email detection
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "email";

  // JSON detection
  try {
    JSON.parse(trimmed);
    return "json";
  } catch (_) {}

  // Code detection (heuristic: contains common code patterns)
  const codePatterns = [
    /^\s*(function|const|let|var|class|import|export|return|if|for|while|=>)\s/m,
    /[{};]\s*$/m,
    /^\s*<[a-z][^>]*>/im,
    /^\s*(def |class |import |from |print\()/m,
    /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP)\s/im,
  ];
  if (codePatterns.some((re) => re.test(trimmed))) return "code";

  // Number detection
  if (/^[\d\s,.\-+%$€£¥]+$/.test(trimmed) && trimmed.length < 50) return "number";

  // Color hex detection
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) return "color";

  return "text";
}

export function getTypeIcon(type) {
  const map = {
    url: "link",
    email: "mail",
    code: "code-2",
    json: "braces",
    number: "hash",
    color: "palette",
    text: "type",
  };
  return map[type] || "type";
}

export function getTypeBadgeTone(type) {
  const tones = {
    url: "blue",
    email: "purple",
    code: "orange",
    json: "green",
    number: "teal",
    color: "pink",
    text: "neutral",
  };
  return tones[type] || "neutral";
}

export function getHistory() {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load clipboard history", e);
    return [];
  }
}

export function saveHistory(history) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save clipboard history", e);
  }
}

export function addEntry(text) {
  const history = getHistory();
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Deduplicate: remove existing entry with same content to move it to top
  const deduplicated = history.filter((item) => item.content !== trimmed);

  const newEntry = {
    id: Date.now().toString(),
    content: trimmed,
    type: detectContentType(trimmed),
    timestamp: new Date().toISOString(),
    isFavorite: false,
    charCount: trimmed.length,
    wordCount: trimmed.trim().split(/\s+/).filter(Boolean).length,
  };

  const updated = [newEntry, ...deduplicated].slice(0, MAX_HISTORY);
  saveHistory(updated);
  return newEntry;
}

export function deleteEntry(id) {
  const history = getHistory();
  saveHistory(history.filter((item) => item.id !== id));
}

export function toggleFavorite(id) {
  const history = getHistory();
  const index = history.findIndex((item) => item.id === id);
  if (index !== -1) {
    history[index].isFavorite = !history[index].isFavorite;
    saveHistory(history);
    return history[index].isFavorite;
  }
  return false;
}

export function clearAll() {
  saveHistory([]);
}

export function clearNonFavorites() {
  const history = getHistory();
  saveHistory(history.filter((item) => item.isFavorite));
}

export function formatTimestamp(iso) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}
