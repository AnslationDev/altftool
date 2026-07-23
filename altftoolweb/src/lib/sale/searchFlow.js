import { geocodeLocation } from "./geocoding.js";
import { fetchNearbyStores } from "./places.js";
import { searchSerpApiShopping } from "./serpapi.js";
import { searchRapidApiShopping } from "./rapidapi.js";
import { searchAllAffiliateDeals } from "./providers/index.js";
import { normalizePlaceToDeal, normalizeShoppingResultToDeal, normalizeAffiliateOfferToDeal } from "./normalize.js";
import { mergeDeals } from "./merge.js";
import { toSaleApiError } from "./errors.js";

/**
 * Run one settled promise, returning `[]` (and swallowing the error) on
 * failure so a single upstream outage never breaks the whole search.
 * @template T
 * @param {Promise<T[]>} promise
 * @returns {Promise<T[]>}
 */
async function settleOrEmpty(promise) {
  const result = await Promise.allSettled([promise]);
  return result[0].status === "fulfilled" ? result[0].value : [];
}

/**
 * Full location-based deal search flow:
 *   location name → geocode → nearby stores → shopping search (SerpAPI +
 *   RapidAPI + affiliate providers) → merge → unified response.
 *
 * @param {{
 *   location: string,
 *   query?: string,
 *   page?: number,
 *   radius?: number,
 *   placeTypes?: string[],
 *   rapidApiSources?: string[],
 * }} params
 * @returns {Promise<{
 *   location: import("./types.js").GeocodeResult,
 *   stores: import("./types.js").Deal[],
 *   deals: import("./types.js").Deal[],
 *   meta: { total: number, page: number },
 * }>}
 */
export async function runLocationSearchFlow({
  location,
  query = "deals",
  page = 1,
  radius,
  placeTypes,
  rapidApiSources,
}) {
  let geocodeResult;
  try {
    geocodeResult = await geocodeLocation(location);
  } catch (error) {
    throw toSaleApiError(error, { provider: "sale-search-flow" });
  }

  const refCoords = { lat: geocodeResult.latitude, lng: geocodeResult.longitude };

  const [places, serpApiResult, rapidApiItems, affiliateOffers] = await Promise.all([
    settleOrEmpty(
      fetchNearbyStores({
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        radius,
        types: placeTypes,
      }),
    ),
    settleOrEmpty(
      searchSerpApiShopping({ query, location: geocodeResult.formattedAddress, page }).then(
        (result) => result.items,
      ),
    ),
    settleOrEmpty(
      searchRapidApiShopping({ query, page, country: geocodeResult.country || "IN", sources: rapidApiSources }),
    ),
    settleOrEmpty(searchAllAffiliateDeals({ query, page })),
  ]);

  const storeDeals = places.map(normalizePlaceToDeal);
  const serpApiDeals = serpApiResult.map(normalizeShoppingResultToDeal);
  const rapidApiDeals = rapidApiItems.map(normalizeShoppingResultToDeal);
  const affiliateDeals = affiliateOffers.map(normalizeAffiliateOfferToDeal);

  const merged = mergeDeals({
    places: storeDeals,
    serpApiDeals,
    rapidApiDeals,
    affiliateDeals,
    refCoords,
  });

  return {
    location: geocodeResult,
    stores: storeDeals,
    deals: merged,
    meta: { total: merged.length, page: Number(page) || 1 },
  };
}
