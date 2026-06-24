// @altftool/core/seo/registry
//
// Pure helpers for the ALTF Engine Page Registry + Global Search (Phase A).
//   - normalizeSearchText(): build a lowercase searchable string
//   - buildPageIndexEntry(): normalize a heterogeneous page record into one shape
//   - computePageHealth(): per-page SEO health flags
//   - searchPages(): ranked, AND-term search with title/path boosts
//   - summarizeRegistry(): dashboard counts (by type) + aggregate health
//
// No I/O, no dependencies — trivially unit-testable. The web "inventory"
// endpoint produces raw records; this normalizes/searches them.

export const PAGE_HEALTH_FLAGS = Object.freeze([
  "missingTitle",
  "missingDescription",
  "missingCanonical",
  "missingH1",
  "missingSchema",
  "noindex",
]);

export function normalizeSearchText(...parts) {
  return parts
    .flat()
    .filter(Boolean)
    .map((p) => String(p))
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize a heterogeneous page record into a PageIndexEntry.
 * @param {object} input { path, pageType, source, title, description, h1,
 *   keywords[], noindex, canonical, hasSchema, hasOverride, updatedAt }
 * @returns {object}
 */
export function buildPageIndexEntry(input = {}) {
  const path = typeof input.path === "string" ? input.path : "";
  const pageType = input.pageType || "page";
  const source = input.source || pageType;
  const title = String(input.title || "").trim();
  const description = String(input.description || "").trim();
  const h1 = String(input.h1 || "").trim();
  const keywords = Array.isArray(input.keywords)
    ? input.keywords.map((k) => String(k).trim()).filter(Boolean)
    : [];
  const indexState = input.noindex ? "noindex" : "index";

  const entry = {
    path,
    pageType,
    source,
    title,
    description,
    h1,
    keywords,
    indexState,
    canonical: input.canonical || path,
    hasSchema: Boolean(input.hasSchema),
    hasOverride: Boolean(input.hasOverride),
    updatedAt: input.updatedAt || null,
  };
  entry.searchText = normalizeSearchText(title, description, path, keywords);
  entry.health = computePageHealth(entry);
  return entry;
}

export function computePageHealth(entry = {}) {
  return {
    missingTitle: !entry.title,
    missingDescription: !entry.description,
    missingCanonical: !entry.canonical,
    missingH1: !entry.h1,
    missingSchema: !entry.hasSchema,
    noindex: entry.indexState === "noindex",
  };
}

function scoreMatch(entry, terms) {
  const text = entry.searchText || "";
  const title = (entry.title || "").toLowerCase();
  const path = (entry.path || "").toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (!text.includes(t)) return 0; // AND: every term must appear somewhere
    if (title.includes(t)) score += 3;
    if (path.includes(t)) score += 2;
    score += 1;
  }
  const joined = terms.join(" ");
  if (title === joined) score += 12;
  else if (title.startsWith(joined)) score += 6;
  return score;
}

/**
 * Ranked search over normalized entries.
 * @param {object[]} entries
 * @param {string} query
 * @param {object} [opts] { type, source, limit=50 }
 * @returns {object[]}
 */
export function searchPages(entries, query, opts = {}) {
  const { type, source, limit = 50 } = opts;
  let list = Array.isArray(entries) ? entries : [];
  if (type && type !== "all") list = list.filter((e) => e.pageType === type);
  if (source && source !== "all") list = list.filter((e) => e.source === source);

  const q = normalizeSearchText(query);
  if (!q) {
    return list
      .slice()
      .sort((a, b) => (a.title || a.path).localeCompare(b.title || b.path))
      .slice(0, limit);
  }
  const terms = q.split(" ").filter(Boolean);
  const scored = [];
  for (const e of list) {
    const s = scoreMatch(e, terms);
    if (s > 0) scored.push([s, e]);
  }
  scored.sort((a, b) => b[0] - a[0] || (a[1].title || "").localeCompare(b[1].title || ""));
  return scored.slice(0, limit).map(([, e]) => e);
}

/**
 * Dashboard summary: total, counts by type/source, aggregate health.
 * @param {object[]} entries
 */
export function summarizeRegistry(entries = []) {
  const list = Array.isArray(entries) ? entries : [];
  const byType = {};
  const bySource = {};
  const health = Object.fromEntries(PAGE_HEALTH_FLAGS.map((f) => [f, 0]));

  for (const e of list) {
    byType[e.pageType] = (byType[e.pageType] || 0) + 1;
    bySource[e.source] = (bySource[e.source] || 0) + 1;
    for (const f of PAGE_HEALTH_FLAGS) if (e.health?.[f]) health[f] += 1;
  }
  return { total: list.length, byType, bySource, health };
}
