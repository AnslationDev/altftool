import { createApiClient } from "@/lib/providers/_shared/apiClient";

/**
 * OpenLibrary — free, keyless public API (no API key required, unlike
 * TMDB). Same provider shape as providers/tmdb/ for consistency:
 * client.js (base URL/auth helpers) + <resource>.js (typed fetch +
 * normalize) + an /api/<name> route that's the only thing client code
 * talks to.
 */

const OPENLIBRARY_BASE_URL = "https://openlibrary.org";
const OPENLIBRARY_COVER_BASE_URL = "https://covers.openlibrary.org/b";

export function getOpenLibraryClient() {
  return createApiClient({
    baseUrl: OPENLIBRARY_BASE_URL,
    defaultHeaders: { Accept: "application/json" },
    label: "OpenLibrary",
  });
}

/** Builds a cover image URL from a numeric cover ID, or null if there isn't one. Sizes: S/M/L. */
export function openLibraryCoverUrl(coverId, size = "M") {
  return coverId ? `${OPENLIBRARY_COVER_BASE_URL}/id/${coverId}-${size}.jpg` : null;
}
