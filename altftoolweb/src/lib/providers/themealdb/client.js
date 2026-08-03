import { createApiClient } from "@/lib/providers/_shared/apiClient";

/**
 * TheMealDB — free, keyless public API (test key "1", no signup), same
 * shape as providers/openlibrary/ and providers/itunes/: client.js (base
 * URL) + <resource>.js (typed fetch + normalize) + an /api/<name> route
 * that's the only thing client code talks to.
 */

const THEMEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export function getMealDbClient() {
  return createApiClient({
    baseUrl: THEMEALDB_BASE_URL,
    defaultHeaders: { Accept: "application/json" },
  });
}
