// Search & filtering helpers for the Chinese Character Generator.

// Filter the dataset by a free-text query and optional category.
// Query matches the English meaning (case-insensitive) or the exact glyph.
export function filterCharacters(list, query, category) {
  const q = (query || "").trim().toLowerCase();
  return list.filter((item) => {
    if (category && category !== "All" && item.category !== category) {
      return false;
    }
    if (!q) return true;
    if (item.char === query.trim()) return true;
    if (item.meaning.toLowerCase().includes(q)) return true;
    if (item.pinyin.toLowerCase().includes(q)) return true;
    return false;
  });
}

// Pick a random element from a list (module-level; safe for effects/handlers).
export function pickRandom(list) {
  if (!list || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

// Pick up to `count` distinct random items from a list.
export function pickMultiple(list, count) {
  const pool = [...list];
  const out = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i += 1) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

// Build a stable identity key for a character entry.
export function charKey(item) {
  return `${item.char}-${item.unicode}`;
}
