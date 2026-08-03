import { createApiClient } from "@/lib/providers/_shared/apiClient";
import { requireProviderKey } from "@/lib/providers/_shared/configuration";

/**
 * Foursquare's new Places API (their v3 API was fully retired — a live
 * request to the old api.foursquare.com/v3/places/search returns 410
 * Gone with a migration notice) — server-only, requires
 * FOURSQUARE_API_KEY. Never import this from a "use client" component;
 * go through /api/top10/restaurants instead, so the key never reaches the
 * browser. Same provider shape as tmdb/, openlibrary/, itunes/,
 * geoapify/.
 *
 * The new platform: different base host, `Authorization: Bearer <key>`
 * (the old v3 API took the raw key with no prefix), and a mandatory
 * dated `X-Places-Api-Version` header (same idea as Stripe's API
 * versioning).
 */

const FOURSQUARE_BASE_URL = "https://places-api.foursquare.com/places";
const FOURSQUARE_API_VERSION = "2025-06-17";

function getApiKey() {
  return requireProviderKey("FOURSQUARE_API_KEY", "Foursquare");
}

/** Auth + version headers for a Foursquare request — merge into a client.get(...) call's `headers`. */
export function withFoursquareAuth() {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "X-Places-Api-Version": FOURSQUARE_API_VERSION,
  };
}

export function getFoursquareClient() {
  return createApiClient({
    baseUrl: FOURSQUARE_BASE_URL,
    defaultHeaders: { Accept: "application/json" },
  });
}
