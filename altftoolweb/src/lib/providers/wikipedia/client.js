import { createApiClient } from "@/lib/providers/_shared/apiClient";

/**
 * Wikipedia / Wikimedia — server-only, fully keyless. Never import this
 * from a "use client" component; go through /api/top10/famous-people instead.
 *
 * Three distinct Wikimedia hosts are used together here:
 *  - en.wikipedia.org/w/api.php    — the classic MediaWiki Action API,
 *    used for category membership (real people per profession) and
 *    free-text search. Not the same as the REST API the user linked,
 *    but it's Wikipedia's own keyless endpoint and it's the only one
 *    that exposes category membership.
 *  - en.wikipedia.org/api/rest_v1  — the REST API the user pointed to,
 *    used for each person's summary (thumbnail, description, extract,
 *    canonical page URL).
 *  - wikimedia.org/api/rest_v1/metrics/pageviews — real per-article
 *    monthly pageview counts, used as the ranking metric (see people.js).
 *
 * Wikimedia's API etiquette policy asks every client to send a
 * descriptive User-Agent identifying the app — requests without one are
 * more likely to get rate-limited or blocked.
 */

const USER_AGENT = "AltFTool-Top10/1.0 (https://altftool.com; top10 ranking feature)";

export function getWikipediaActionClient() {
  return createApiClient({
    // Base stops at /w/ (not /w/api.php) so callers hit exactly
    // /w/api.php via client.get("/api.php", ...) with no trailing
    // slash — buildUrl's URL(path, base) resolution would otherwise
    // append one, which the Action API redirects (301) rather than
    // serving directly.
    baseUrl: "https://en.wikipedia.org/w/",
    defaultHeaders: { Accept: "application/json", "User-Agent": USER_AGENT },
  });
}

export function getWikipediaRestClient() {
  return createApiClient({
    baseUrl: "https://en.wikipedia.org/api/rest_v1",
    defaultHeaders: { Accept: "application/json", "User-Agent": USER_AGENT },
  });
}

export function getWikimediaPageviewsClient() {
  return createApiClient({
    baseUrl: "https://wikimedia.org/api/rest_v1/metrics/pageviews",
    defaultHeaders: { Accept: "application/json", "User-Agent": USER_AGENT },
  });
}
