import { createApiClient } from "@/lib/providers/_shared/apiClient";

/**
 * Jikan — free, keyless public API wrapping MyAnimeList (no API key
 * required, same as OpenLibrary/TheCatAPI). Same provider shape as
 * every other provider here.
 */

const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

export function getJikanClient() {
  return createApiClient({
    baseUrl: JIKAN_BASE_URL,
    defaultHeaders: { Accept: "application/json" },
  });
}
