import { createApiClient } from "@/lib/providers/_shared/apiClient";
import { requireProviderKey } from "@/lib/providers/_shared/configuration";

/**
 * API Ninjas — server-only, requires API_NINJAS_KEY. Never import this
 * from a "use client" component; go through /api/top10/dogs instead, so the
 * key never reaches the browser. Same provider shape as every other
 * provider here.
 *
 * Unlike TMDB/CoinCap (key in query params), API Ninjas expects the raw
 * key in an `X-Api-Key` header (confirmed live: an unauthenticated
 * request to /v1/dogs returns {"error":"Missing API Key."}).
 */

const API_NINJAS_BASE_URL = "https://api.api-ninjas.com/v1";

function getApiKey() {
  return requireProviderKey("API_NINJAS_KEY", "API Ninjas");
}

/** Auth header for an API Ninjas request — merge into a client.get(...) call's `headers`. */
export function withApiNinjasAuth() {
  return { "X-Api-Key": getApiKey() };
}

export function getApiNinjasClient() {
  return createApiClient({
    baseUrl: API_NINJAS_BASE_URL,
    defaultHeaders: { Accept: "application/json" },
  });
}
