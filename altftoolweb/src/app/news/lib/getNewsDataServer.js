import { GLOBAL_FEEDS, buildGoogleNewsUrl } from "./sources";
import { fetchFeeds } from "./fetchFeeds";
import { normalizeItems } from "./normalize";
import { deduplicate } from "./dedupe";
import { rankArticles } from "./rank";
import { cache } from "./cache";

/**
 * Fetch the live news feed for the server.
 *
 * Returns an empty array when the feed is unavailable or returns nothing.
 * There is deliberately no placeholder dataset: the news surfaces render an
 * honest "temporarily unavailable" state instead of invented articles.
 * Failures are not cached, so the next request retries the feed.
 */
export async function getNewsDataServer({ location, topic } = {}) {
  const cacheKey = `news:${location ?? "global"}:${topic ?? "all"}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const feeds = [...GLOBAL_FEEDS];

  if (location) {
    feeds.push({
      url: buildGoogleNewsUrl(location),
      source: `Google News – ${location}`,
      category: "world",
    });
  }

  if (topic) {
    feeds.push({
      url: buildGoogleNewsUrl(topic),
      source: `Google News – ${topic}`,
      category: "world",
    });
  }

  try {
    const rawItems = await fetchFeeds(feeds);
    const normalized = normalizeItems(rawItems);
    const deduped = deduplicate(normalized);
    const ranked = rankArticles(deduped);

    if (ranked.length === 0) {
      console.warn("News feed returned no results; rendering the unavailable state");
      return [];
    }

    cache.set(cacheKey, ranked);
    return ranked;
  } catch (error) {
    console.error("Failed to fetch news on the server:", error);
    return [];
  }
}
