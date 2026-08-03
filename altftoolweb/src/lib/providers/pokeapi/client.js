import { createApiClient } from "@/lib/providers/_shared/apiClient";

/**
 * PokeAPI — server-only, fully keyless (no auth required at all, confirmed
 * live). Never import this from a "use client" component; go through
 * /api/top10/pokemon instead, so the fetch logic and caching stay server-side.
 */

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

export function getPokeApiClient() {
  return createApiClient({
    baseUrl: POKEAPI_BASE_URL,
    defaultHeaders: { Accept: "application/json" },
  });
}
