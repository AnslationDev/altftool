import { createApiClient } from "@/lib/providers/_shared/apiClient";
import { requireProviderKey } from "@/lib/providers/_shared/configuration";

/**
 * Geoapify — server-only, requires GEOAPIFY_API_KEY. Never import this
 * from a "use client" component; go through /api/top10/places instead, so the
 * key never reaches the browser. Same provider shape as tmdb/: two base
 * URLs because Geoapify splits this across two endpoints — Places
 * (category + area browsing) and Geocoding (free-text place search).
 */

const GEOAPIFY_PLACES_BASE_URL = "https://api.geoapify.com/v2";
const GEOAPIFY_GEOCODE_BASE_URL = "https://api.geoapify.com/v1/geocode";

function getApiKey() {
  return requireProviderKey("GEOAPIFY_API_KEY", "Geoapify");
}

/** Merges Geoapify's required apiKey into a params object. */
export function withGeoapifyAuth(params = {}) {
  return { ...params, apiKey: getApiKey() };
}

export function getGeoapifyPlacesClient() {
  return createApiClient({
    baseUrl: GEOAPIFY_PLACES_BASE_URL,
    defaultHeaders: { Accept: "application/json" },
  });
}

export function getGeoapifyGeocodeClient() {
  return createApiClient({
    baseUrl: GEOAPIFY_GEOCODE_BASE_URL,
    defaultHeaders: { Accept: "application/json" },
  });
}
