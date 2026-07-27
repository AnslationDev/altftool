/**
 * Pure, dependency-free search-intent detection — safe to import from both
 * client components and server code (unlike search.service.js, which pulls
 * in server-only fetch/cache/env logic).
 */

const MALL_INTENT_KEYWORDS = [
  "mall",
  "shopping mall",
  "sale near me",
  "nearby sale",
  "nike",
  "electronics",
  "electronic",
  "fashion",
  "clothes",
  "clothing",
  "department store",
];

/**
 * Detect whether a free-text search query is asking for a nearby-mall/store
 * search (as opposed to a normal product-deal search) — e.g. "Nike",
 * "Shopping Mall", "Sale Near Me", "Electronics", "Fashion", "Nearby Sale".
 *
 * @param {string} rawKeyword
 * @returns {boolean}
 */
export function isMallSearchIntent(rawKeyword) {
  const keyword = String(rawKeyword || "").trim().toLowerCase();
  if (!keyword) return false;
  return MALL_INTENT_KEYWORDS.some((k) => keyword.includes(k));
}
