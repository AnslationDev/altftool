/**
 * Shared normalization helpers for the provider modules in this directory.
 * Provider-agnostic on purpose: every provider returns the same
 * {title, subtitle, image, rating, description, url} card shape to the UI,
 * so the ranking/cleanup rules live here once instead of per provider.
 */

/**
 * Highest rating first, wherever it came from (TMDB, OpenLibrary, or whatever
 * provider comes next) — items with no rating sort last instead of being
 * treated as a 0.
 */
export function sortByRatingDesc(items) {
  return [...items].sort((a, b) => {
    if (a.rating == null && b.rating == null) return 0;
    if (a.rating == null) return 1;
    if (b.rating == null) return -1;
    return b.rating - a.rating;
  });
}

/**
 * Cleans provider-supplied description text for display. Some sources
 * (OpenLibrary in particular) return raw Markdown instead of prose —
 * including anthology works whose "description" is literally a list of links,
 * e.g. "Contains: - [A Scandal in Bohemia](url) [The Red-Headed League](url)".
 * Stripped down to plain, readable text without inventing or removing any
 * actual content — just formatting it the way a real description should read.
 */
export function cleanDescription(text) {
  if (!text) return null;

  const cleaned = text
    .split(/\n\s*-{3,}\s*\n/)[0] // drop trailing "--- Also contained in: ..." boilerplate
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [label](url) -> label
    .replace(/^#{1,6}\s+/gm, "") // markdown headers
    .replace(/[*_`]{1,3}/g, "") // bold/italic/code markers
    .replace(/^>\s?/gm, "") // blockquote markers
    .replace(/^[-*]\s+/gm, "") // list bullets
    .replace(/\s*\n\s*/g, " ") // collapse newlines into spaces
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned || null;
}

/**
 * Generic "fetch extra per-item detail, but only for what's actually shown"
 * helper. Some providers' list endpoints don't return everything the UI wants
 * (e.g. OpenLibrary's subject/search endpoints have no description — only the
 * single-work endpoint does). Rather than hand-rolling this per provider,
 * every provider calls the same helper: enrich the top N already-sorted items
 * with one extra request each, leave the rest untouched.
 *
 * @param {Array<object>} items - already-sorted list (highest rank first)
 * @param {number} limit - how many leading items are worth the extra fetch
 * @param {(item: object) => Promise<object>} enrichOne - resolves to the item merged with its extra detail
 * @returns {Promise<Array<object>>}
 */
export async function enrichTopItems(items, limit, enrichOne) {
  const top = items.slice(0, limit);
  const rest = items.slice(limit);

  const enriched = await Promise.all(top.map((item) => enrichOne(item).catch(() => item)));

  return [...enriched, ...rest];
}
