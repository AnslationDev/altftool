// lib/news/rank.js

const MAX_ARTICLES = 50;

/**
 * Sort by newest first and limit results.
 * @param {Array} articles  Deduplicated normalized articles
 * @param {number} limit
 * @returns {Array}
 */
export function rankArticles(articles, limit = MAX_ARTICLES) {
  return [...articles]
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .slice(0, limit);
}