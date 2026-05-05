// lib/news/fetchFeeds.js

import Parser from "rss-parser";

const parser = new Parser({
  timeout: 8000,
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
      ["enclosure", "enclosure"],
    ],
  },
});

/**
 * Fetch a single RSS feed. Returns [] on failure.
 * @param {{ url: string, source: string, category: string }} feedConfig
 */
async function fetchSingleFeed(feedConfig) {
  try {
    const feed = await parser.parseURL(feedConfig.url);
    return (feed.items || []).map((item) => ({
      ...item,
      _source: feedConfig.source,
      _category: feedConfig.category,
      _feedTitle: feed.title || feedConfig.source,
    }));
  } catch (err) {
    console.warn(`[fetchFeeds] Failed: ${feedConfig.url} — ${err.message}`);
    return [];
  }
}

/**
 * Fetch multiple RSS feeds concurrently.
 * @param {Array<{ url: string, source: string, category: string }>} feeds
 * @returns {Promise<Array>} flat array of raw items
 */
export async function fetchFeeds(feeds) {
  const results = await Promise.allSettled(feeds.map(fetchSingleFeed));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}