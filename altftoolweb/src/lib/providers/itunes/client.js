import { createApiClient } from "@/lib/providers/_shared/apiClient";

/**
 * Apple's iTunes/Music APIs — free, keyless, and (unlike Deezer's API
 * from this environment) not geo-restricted at the data level. Two base
 * URLs because Apple splits this across two legacy endpoints: the
 * classic Search API (real text search, real offset pagination) and the
 * RSS charts feed (genre-ranked top songs, no auth, no offset param).
 * Same provider shape as tmdb/ and openlibrary/ otherwise.
 */

const ITUNES_SEARCH_BASE_URL = "https://itunes.apple.com";
const ITUNES_RSS_BASE_URL = "https://itunes.apple.com/us/rss";

export function getItunesSearchClient() {
  return createApiClient({
    baseUrl: ITUNES_SEARCH_BASE_URL,
    defaultHeaders: { Accept: "application/json" },
  });
}

export function getItunesRssClient() {
  return createApiClient({
    baseUrl: ITUNES_RSS_BASE_URL,
    defaultHeaders: { Accept: "application/json" },
  });
}

/** Swaps an Apple artwork URL's baked-in size (e.g. ".../100x100bb.jpg") for a larger one. */
export function itunesArtworkUrl(url, size = "600x600bb") {
  if (!url) return null;
  return url.replace(/\/\d+x\d+bb(\.\w+)$/, `/${size}$1`);
}
