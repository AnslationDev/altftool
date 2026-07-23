import { fetchWithRetry } from "./httpClient.js";
import { toSaleApiError, SaleApiError } from "./errors.js";
import { getOrSetSaleCache, buildCacheKey } from "./cache.js";

// Free, keyless geocoding via OpenStreetMap's Nominatim — no paid Google
// Maps key required. Nominatim's usage policy requires a descriptive
// User-Agent identifying the app (https://operations.osmfoundation.org/policies/nominatim/).
const GEOCODE_ENDPOINT = "https://nominatim.openstreetmap.org/search";
const PROVIDER = "nominatim";
const USER_AGENT = "AltFTool-SaleLocator/1.0 (https://altftool.com)";

/**
 * Convert a free-text location name into latitude/longitude via the
 * free OpenStreetMap Nominatim geocoding service (India only).
 *
 * @param {string} locationName e.g. "Gurugram"
 * @returns {Promise<import("./types.js").GeocodeResult>}
 */
export async function geocodeLocation(locationName) {
  const query = String(locationName || "").trim();

  if (!query) {
    throw new SaleApiError("A location name is required.", { status: 400, code: "not_found", provider: PROVIDER });
  }

  const cacheKey = buildCacheKey("geocode", { q: query });

  return getOrSetSaleCache(cacheKey, async () => {
    const upstream = new URL(GEOCODE_ENDPOINT);
    upstream.searchParams.set("q", query);
    upstream.searchParams.set("format", "jsonv2");
    upstream.searchParams.set("addressdetails", "1");
    upstream.searchParams.set("limit", "1");
    // India only — restrict results so a search for e.g. "Delhi" never
    // resolves to somewhere outside the country.
    upstream.searchParams.set("countrycodes", "in");

    let data;
    try {
      data = await fetchWithRetry(upstream, {
        provider: PROVIDER,
        timeoutMs: 10000,
        retries: 1,
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });
    } catch (error) {
      throw toSaleApiError(error, { provider: PROVIDER });
    }

    const result = Array.isArray(data) ? data[0] : null;
    if (!result) {
      throw new SaleApiError(`No location found for "${query}".`, {
        status: 404,
        code: "not_found",
        provider: PROVIDER,
      });
    }

    const country = result.address?.country_code?.toUpperCase();
    if (country && country !== "IN") {
      throw new SaleApiError(`"${query}" is outside India — only Indian locations are supported.`, {
        status: 404,
        code: "not_found",
        provider: PROVIDER,
      });
    }

    return {
      query,
      formattedAddress: result.display_name || query,
      latitude: Number(result.lat),
      longitude: Number(result.lon),
      placeId: result.place_id ? String(result.place_id) : null,
      country: country || "IN",
    };
  });
}
