export function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function formatDuration(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(timestamp) {
  if (!timestamp) return "—";
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return "—";
  }
}

export function computeHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

export function detectLanguage(text) {
  const patterns = {
    JavaScript: /\b(const|let|var|function|=>|import|export|require)\b/,
    Python: /\b(def |import |from |class |if __name__|print\()/,
    HTML: /<(!DOCTYPE|html|div|span|body|head|meta)/i,
    CSS: /[.#][\w-]+\s*\{|@media|@import|flexbox|grid/,
    JSON: /^[\s]*[{\[][\s\S]*[}\]][\s]*$/,
    XML: /<[\w]+[\s>][\s\S]*<\/[\w]+>/,
    Markdown: /^#{1,6}\s|\[.*\]\(.*\)|^[*\-]\s/m,
  };
  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) return lang;
  }
  return "Plain Text";
}

export function estimateReadingTime(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
