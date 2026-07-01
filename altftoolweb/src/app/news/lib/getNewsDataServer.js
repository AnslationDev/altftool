import { GLOBAL_FEEDS, buildGoogleNewsUrl } from "./sources";
import { fetchFeeds } from "./fetchFeeds";
import { normalizeItems } from "./normalize";
import { deduplicate } from "./dedupe";
import { rankArticles } from "./rank";
import { cache } from "./cache";
import { getDummyNewsData } from "./dummyNewsData";

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
      console.warn("News API returned no results, falling back to dummy data");
      const dummy = getDummyNewsData();
      cache.set(cacheKey, dummy);
      return dummy;
    }

    cache.set(cacheKey, ranked);
    return ranked;
  } catch (error) {
    console.error("Failed to fetch news on the server, falling back to dummy data:", error);
    const dummy = getDummyNewsData();
    cache.set(cacheKey, dummy);
    return dummy;
  }
}
