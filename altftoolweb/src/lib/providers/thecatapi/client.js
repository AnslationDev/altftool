import { createApiClient } from "@/lib/providers/_shared/apiClient";

/**
 * TheCatAPI — server-only. Never import this from a "use client"
 * component; go through /api/top10/cats instead. Same provider shape as every
 * other provider here, with one real difference: TheCatAPI's breed
 * endpoints work without a key at all (confirmed live: an unauthenticated
 * request to /v1/breeds returns real data, 200 OK) — a key only raises
 * the rate limit. So CAT_API_KEY is sent when present, but — unlike
 * TMDB/Foursquare/CoinCap/API Ninjas — this provider never throws for a
 * missing one; it just runs on the public tier instead.
 */

const CAT_API_BASE_URL = "https://api.thecatapi.com/v1";

/** Auth header for a TheCatAPI request — empty object (no-op) when no key is configured. */
export function withCatApiAuth() {
  const key = process.env.CAT_API_KEY;
  return key ? { "x-api-key": key } : {};
}

export function getCatApiClient() {
  return createApiClient({
    baseUrl: CAT_API_BASE_URL,
    defaultHeaders: { Accept: "application/json" },
  });
}
