import { getWikipediaActionClient, getWikipediaRestClient } from "./client";

// Caps how many detail fetches one search fires — same rate-limit-aware
// pattern as searchPeople in people.js.
const MAX_SEARCH_RESULTS = 20;

/** Shapes a Wikipedia page summary into the standard card shape every product uses. */
function normalizeArticle(summary) {
  const bio = summary.extract ? summary.extract.slice(0, 260) : null;
  return {
    id: summary.pageid,
    title: summary.title,
    subtitle: summary.description || null,
    image: summary.thumbnail?.source || null,
    // No genuine 0-10 rating exists for an arbitrary topic — this is a
    // real-data search, not a ranked list, so rating stays honestly null.
    rating: null,
    description: bio || summary.description || "",
    url: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(summary.title.replace(/ /g, "_"))}`,
  };
}

/** Fetches summary details for a batch of titles with limited concurrency, dropping anything that fails or is a disambiguation page. */
async function fetchArticleSummaries(titles, concurrency = 8) {
  const restClient = getWikipediaRestClient();
  const results = [];

  for (let i = 0; i < titles.length; i += concurrency) {
    const batch = titles.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (title) => {
        try {
          const summary = await restClient.get(`/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`);
          if (summary.type && summary.type !== "standard") return null; // disambiguation/missing pages
          return normalizeArticle(summary);
        } catch {
          return null;
        }
      }),
    );
    results.push(...batchResults.filter(Boolean));
  }

  return results;
}

/**
 * Genuinely open-ended search — any real-world keyword, not just the
 * site's ~39 pre-wired categories. Backed by Wikipedia's own free-text
 * search (keyless, no API key required), so results are real articles
 * with real summaries/images, never fabricated. This is the "global
 * search" catch-all: tried only after every wired provider has already
 * come back empty for a query.
 */
export async function searchWikipediaTopics(query, { page = 1, limit = 10 } = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return { results: [], hasMore: false };

  const client = getWikipediaActionClient();
  const data = await client.get("/api.php", {
    params: {
      action: "query",
      list: "search",
      srsearch: trimmed,
      srnamespace: 0,
      srlimit: MAX_SEARCH_RESULTS,
      format: "json",
    },
  });
  const titles = (data?.query?.search || []).map((r) => r.title);
  if (!titles.length) return { results: [], hasMore: false };

  const results = await fetchArticleSummaries(titles);

  const start = (page - 1) * limit;
  const pageResults = results.slice(start, start + limit);
  return { results: pageResults, hasMore: start + limit < results.length };
}
