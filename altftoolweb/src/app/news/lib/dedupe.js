// lib/news/dedupe.js

/**
 * Normalize a headline for comparison:
 * lowercase, strip punctuation, collapse whitespace.
 */
function normalizeHeadline(h = "") {
  return h
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Simple word-overlap Jaccard similarity (0..1).
 */
function similarity(a, b) {
  const setA = new Set(a.split(" "));
  const setB = new Set(b.split(" "));
  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

const DEDUPE_THRESHOLD = 0.65;

/**
 * Remove near-duplicate articles by headline similarity.
 * Keeps the first seen version of each cluster.
 *
 * @param {Array} articles  Normalized news items
 * @returns {Array}
 */
export function deduplicate(articles) {
  const seen = [];

  for (const article of articles) {
    const normalized = normalizeHeadline(article.headline);
    const isDup = seen.some(
      (s) => similarity(s.normalized, normalized) >= DEDUPE_THRESHOLD
    );
    if (!isDup) {
      seen.push({ normalized, article });
    }
  }

  return seen.map((s) => s.article);
}