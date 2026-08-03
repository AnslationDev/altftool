import { createApiClient } from "@/lib/providers/_shared/apiClient";
import { requireProviderKey } from "@/lib/providers/_shared/configuration";

/**
 * CoinCap — server-only, requires COINCAP_API_KEY. Never import this
 * from a "use client" component; go through /api/top10/crypto instead, so
 * the key never reaches the browser. Same provider shape as tmdb/,
 * openlibrary/, itunes/, geoapify/, foursquare/, cocktaildb/.
 *
 * CoinCap's old host (api.coincap.io) no longer resolves at all — they
 * moved to rest.coincap.io and now require a key (confirmed live:
 * unauthenticated requests return {"error":"Unauthorized"}, and a bad
 * key returns a distinct "API key not found" message, both via the
 * `apiKey` query param — same pattern as TMDB).
 */

const COINCAP_BASE_URL = "https://rest.coincap.io/v3";

function getApiKey() {
  return requireProviderKey("COINCAP_API_KEY", "CoinCap");
}

/** Merges CoinCap's required apiKey into a params object. */
export function withCoinCapAuth(params = {}) {
  return { ...params, apiKey: getApiKey() };
}

export function getCoinCapClient() {
  return createApiClient({
    baseUrl: COINCAP_BASE_URL,
    defaultHeaders: { Accept: "application/json" },
  });
}

/** CoinCap's own public icon CDN — real per-asset logos, same URLs their own web app uses. */
export function coinCapIconUrl(symbol) {
  return symbol ? `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png` : null;
}
