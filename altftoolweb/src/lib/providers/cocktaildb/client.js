import { createApiClient } from "@/lib/providers/_shared/apiClient";

/**
 * TheCocktailDB — free, keyless public API (test key "1", same pattern
 * as TheMealDB — both are from the same API family). Same provider
 * shape as providers/themealdb/: client.js (base URL) + <resource>.js
 * (typed fetch + normalize) + an /api/<name> route that's the only
 * thing client code talks to.
 */

const COCKTAILDB_BASE_URL = "https://www.thecocktaildb.com/api/json/v1/1";

export function getCocktailDbClient() {
  return createApiClient({
    baseUrl: COCKTAILDB_BASE_URL,
    defaultHeaders: { Accept: "application/json" },
  });
}
