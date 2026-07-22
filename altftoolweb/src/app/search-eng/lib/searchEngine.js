// ─── SAFE URL PARSER ──────────────────────────────────────────────────────────
const safeGetHostname = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return 'altftool.com';
  }
};

// ─── CONTEXT MAPPING LAYER ────────────────────────────────────────────────────
// All raw data MUST pass through this function before reaching the UI.
export const mapRawToSearchResult = (item) => ({
  id: item.id || Math.random().toString(36).substr(2, 9),
  title: item.title || item.name || 'Untitled',
  url: item.url || '#',
  displayUrl: item.displayUrl || safeGetHostname(item.url || ''),
  description: item.description || item.snippet || 'No description available.',
  category: item.category || 'General',
  tags: Array.isArray(item.tags) ? item.tags : [],
  isExternal: item.url ? !item.url.includes('altftool.com') : false,
  image: item.image || null,
  favicon: `https://www.google.com/s2/favicons?domain=${safeGetHostname(item.url || '')}&sz=32`,
  metadata: {
    type: item.type || 'tool',
    rating: item.rating || null,
    author: item.author || 'AltFTool',
  },
});

// ─── SCORING ENGINE ───────────────────────────────────────────────────────────
const includesSearchWord = (value, word) => {
  if (!/^\d+$/.test(word)) return value.includes(word);
  return new RegExp(`(^|\\D)${word}(?=\\D|$)`).test(value);
};

const calculateScore = (item, normalizedQuery) => {
  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  if (!words.length) return 0;

  let score = 0;
  const title = item.title.toLowerCase();
  const desc = item.description.toLowerCase();
  const tags = item.tags.map((t) => t.toLowerCase());
  const category = String(item.category || '').toLowerCase();

  // Exact phrase in title: highest reward
  if (title.includes(normalizedQuery)) score += 60;

  words.forEach((word) => {
    // Title: most important
    if (includesSearchWord(title, word)) {
      score += 15;
      if (title.startsWith(word)) score += 8; // prefix bonus
    }
    // Tags: high importance
    if (tags.some((t) => t === word)) score += 12;      // exact tag match
    else if (tags.some((t) => includesSearchWord(t, word))) score += 6; // partial tag
    // Description: lower importance
    if (includesSearchWord(desc, word)) score += 3;
    // Category/type matches help broad queries such as "extension" or "tool".
    if (includesSearchWord(category, word)) score += 5;
  });

  return score;
};

// ─── SEARCH CACHE ─────────────────────────────────────────────────────────────
const searchCache = new WeakMap();

// ─── MAIN SEARCH FUNCTION ─────────────────────────────────────────────────────
// Always returns { items: [], metadata: { total, time } }
export const performSmartSearch = (dataset, query) => {
  const EMPTY = { items: [], metadata: { total: 0, time: '0.00' } };
  if (!query || !query.trim()) return EMPTY;

  const source = Array.isArray(dataset) ? dataset : [];
  const normalizedQuery = query.toLowerCase().trim();
  let datasetCache = searchCache.get(source);

  if (!datasetCache) {
    datasetCache = new Map();
    searchCache.set(source, datasetCache);
  }

  // Progressive sources replace the dataset as Firebase layers arrive. Cache
  // per dataset identity so an early empty result cannot hide later records.
  if (datasetCache.has(normalizedQuery)) {
    return datasetCache.get(normalizedQuery);
  }

  const startTime = performance.now();

  const items = source
    .map((item) => {
      const mapped = mapRawToSearchResult(item);
      const score = calculateScore(mapped, normalizedQuery);
      return { ...mapped, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const time = (performance.now() - startTime).toFixed(2);
  const result = { items, metadata: { total: items.length, time } };

  // Cache result (limit cache to 50 entries)
  if (datasetCache.size >= 50) {
    datasetCache.delete(datasetCache.keys().next().value);
  }
  datasetCache.set(normalizedQuery, result);

  return result;
};

export const mergeSearchResults = (localItems = [], webItems = [], maxLocalItems = 8) => {
  const managed = localItems.filter((item) => String(item.id || "").startsWith("managed__"));
  const native = localItems.filter((item) => !String(item.id || "").startsWith("managed__"));
  const prioritizedLocal = [...managed, ...native].slice(0, Math.max(0, maxLocalItems));
  const seen = new Set();

  return [...prioritizedLocal, ...webItems].filter((item) => {
    const url = String(item?.url || "").trim().toLowerCase();
    const fallback = `${String(item?.title || "").trim().toLowerCase()}::${String(item?.id || "")}`;
    const key = url || fallback;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// ─── "DID YOU MEAN" FUZZY MATCH ───────────────────────────────────────────────
// Simple closest-keyword suggestion when 0 results found
export const getDidYouMean = (dataset, query) => {
  const normalizedQuery = query.toLowerCase().trim();
  const allKeywords = [];

  dataset.forEach((item) => {
    const mapped = mapRawToSearchResult(item);
    allKeywords.push(...mapped.tags, ...mapped.title.toLowerCase().split(' '));
  });

  // Find closest keyword by simple character overlap
  let best = null;
  let bestScore = 0;
  const uniqueKeywords = [...new Set(allKeywords)].filter((k) => k.length > 2);

  uniqueKeywords.forEach((kw) => {
    let matches = 0;
    for (const ch of normalizedQuery) {
      if (kw.includes(ch)) matches++;
    }
    const score = matches / Math.max(normalizedQuery.length, kw.length);
    if (score > bestScore && kw !== normalizedQuery) {
      bestScore = score;
      best = kw;
    }
  });

  return bestScore > 0.5 ? best : null;
};

// ─── TYPEAHEAD SUGGESTIONS ────────────────────────────────────────────────────
// Prioritizes: exact title prefix > tag exact > title contains
export const getAutoSuggestions = (dataset, query) => {
  if (!query || query.length < 2) return [];

  const q = query.toLowerCase();
  const mapped = dataset.map(mapRawToSearchResult);

  const exactPrefix = [];
  const tagExact = [];
  const contains = [];

  mapped.forEach((item) => {
    const titleLower = item.title.toLowerCase();
    if (titleLower.startsWith(q)) {
      exactPrefix.push(item);
    } else if (item.tags.some((t) => t === q || t.startsWith(q))) {
      tagExact.push(item);
    } else if (titleLower.includes(q)) {
      contains.push(item);
    }
  });

  return [...exactPrefix, ...tagExact, ...contains]
    .slice(0, 5)
    .map((item) => ({ id: item.id, text: item.title, category: item.category }));
};

// ─── QUERY NORMALIZER ─────────────────────────────────────────────────────────
export const normalizeQueryForURL = (query) =>
  query.toLowerCase().trim().replace(/\s+/g, '+');

export const normalizeQueryFromURL = (raw) =>
  (raw || '').replace(/\+/g, ' ').trim();
