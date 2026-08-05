// lib/news/rank.js

import { compareNewsNewestFirst } from "./time.js";

const MAX_ARTICLES = 50;

/**
 * Sort by newest first and limit results.
 * @param {Array} articles  Deduplicated normalized articles
 * @param {number} limit
 * @returns {Array}
 */
export function rankArticles(articles, limit = MAX_ARTICLES) {
  return [...articles]
    .sort(compareNewsNewestFirst)
    .slice(0, limit);
}
