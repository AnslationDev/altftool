import { fetchWithRetry } from "./httpClient.js";
import { toSaleApiError, SaleApiError } from "./errors.js";
import { getOrSetSaleCache, buildCacheKey } from "./cache.js";

// Free, keyless nearby-places search via the OpenStreetMap Overpass API —
// no paid Google Places key required. Same public interface as before
// (fetchNearbyStores / PLACE_TYPES / getPlacePhotoUrl) so callers don't change.
const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
const PROVIDER = "openstreetmap";
const USER_AGENT = "AltFTool-SaleLocator/1.0 (https://altftool.com)";

/** Supported store categories for the Sale Locator. */
export const PLACE_TYPES = [
  "shopping_mall",
  "department_store",
  "electronics_store",
  "clothing_store",
  "shoe_store",
  "supermarket",
  "book_store",
  "jewelry_store",
];

/** Map our category names to the OSM `shop=` tag value they correspond to. */
const SHOP_TAG_BY_TYPE = {
  shopping_mall: "mall",
  department_store: "department_store",
  electronics_store: "electronics",
  clothing_store: "clothes",
  shoe_store: "shoes",
  supermarket: "supermarket",
  book_store: "books",
  jewelry_store: "jewelry",
};

function defaultRadiusMeters() {
  const value = Number(process.env.GOOGLE_PLACE_RADIUS);
  return Number.isFinite(value) && value > 0 ? value : 10000;
}

function humanizeShopTag(shopTag) {
  return String(shopTag || "store")
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * OSM `opening_hours` values follow a mini-DSL that's impractical to fully
 * parse here — only recognise the unambiguous "always open" case and leave
 * everything else as "unknown" rather than guessing.
 */
function parseOpenNow(openingHours) {
  if (!openingHours) return null;
  return openingHours.trim() === "24/7" ? true : null;
}

function buildOverpassQuery({ latitude, longitude, radius, shopTag }) {
  const around = `around:${radius},${latitude},${longitude}`;
  return `[out:json][timeout:25];(node["shop"="${shopTag}"](${around});way["shop"="${shopTag}"](${around});relation["shop"="${shopTag}"](${around}););out center 60;`;
}

/**
 * Normalise one raw Overpass element (node/way/relation) into a PlaceResult.
 * @param {any} raw
 * @param {string} category
 * @returns {import("./types.js").PlaceResult}
 */
function normalizeOverpassElement(raw, category) {
  const tags = raw.tags || {};
  const latitude = raw.lat ?? raw.center?.lat ?? null;
  const longitude = raw.lon ?? raw.center?.lon ?? null;

  const streetLine = tags["addr:housenumber"] && tags["addr:street"]
    ? `${tags["addr:housenumber"]} ${tags["addr:street"]}`
    : tags["addr:street"];

  const address = [streetLine, tags["addr:suburb"] || tags["addr:neighbourhood"], tags["addr:city"]]
    .filter(Boolean)
    .join(", ");

  return {
    placeId: `${raw.type}/${raw.id}`,
    name: tags.name || tags.brand || humanizeShopTag(tags.shop),
    address,
    latitude,
    longitude,
    rating: null,
    businessStatus: tags.disused ? "CLOSED_PERMANENTLY" : "OPERATIONAL",
    openNow: parseOpenNow(tags.opening_hours),
    openingHours: tags.opening_hours ? [tags.opening_hours] : [],
    photoReference: null,
    website: tags.website || tags["contact:website"] || null,
    phoneNumber: tags.phone || tags["contact:phone"] || null,
    category,
    source: PROVIDER,
  };
}

/**
 * Search nearby businesses of a single store category via OpenStreetMap.
 *
 * @param {{ latitude: number, longitude: number, radius?: number, type: string }} params
 * @returns {Promise<import("./types.js").PlaceResult[]>}
 */
export async function searchNearbyPlacesByType({ latitude, longitude, radius, type }) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new SaleApiError("A valid latitude/longitude is required.", {
      status: 400,
      code: "upstream_error",
      provider: PROVIDER,
    });
  }

  const shopTag = SHOP_TAG_BY_TYPE[type];
  if (!shopTag) return [];

  const searchRadius = Number.isFinite(Number(radius)) && Number(radius) > 0 ? Number(radius) : defaultRadiusMeters();
  const cacheKey = buildCacheKey("places:nearby", { lat: latitude.toFixed(3), lng: longitude.toFixed(3), radius: searchRadius, type });

  return getOrSetSaleCache(cacheKey, async () => {
    const upstream = new URL(OVERPASS_ENDPOINT);
    upstream.searchParams.set(
      "data",
      buildOverpassQuery({ latitude, longitude, radius: searchRadius, shopTag }),
    );

    let data;
    try {
      data = await fetchWithRetry(upstream, {
        provider: PROVIDER,
        timeoutMs: 15000,
        retries: 1,
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });
    } catch (error) {
      throw toSaleApiError(error, { provider: PROVIDER });
    }

    const elements = Array.isArray(data?.elements) ? data.elements : [];
    return elements
      .filter((el) => (el.lat ?? el.center?.lat) != null && (el.lon ?? el.center?.lon) != null)
      .map((raw) => normalizeOverpassElement(raw, type));
  });
}

/**
 * Fetch nearby businesses across one or more store categories, deduplicated by place id.
 *
 * @param {{ latitude: number, longitude: number, radius?: number, types?: string[] }} params
 * @returns {Promise<import("./types.js").PlaceResult[]>}
 */
export async function searchNearbyPlaces({ latitude, longitude, radius, types = PLACE_TYPES }) {
  const requestedTypes = (Array.isArray(types) && types.length ? types : PLACE_TYPES).filter((type) =>
    PLACE_TYPES.includes(type),
  );

  const resultsByType = await Promise.allSettled(
    requestedTypes.map((type) => searchNearbyPlacesByType({ latitude, longitude, radius, type })),
  );

  const dedupedByPlaceId = new Map();

  resultsByType.forEach((settled) => {
    if (settled.status !== "fulfilled") return;
    settled.value.forEach((place) => {
      if (!dedupedByPlaceId.has(place.placeId)) {
        dedupedByPlaceId.set(place.placeId, place);
      }
    });
  });

  const firstRejection = resultsByType.find((settled) => settled.status === "rejected");
  if (firstRejection && dedupedByPlaceId.size === 0) {
    throw toSaleApiError(firstRejection.reason, { provider: PROVIDER });
  }

  return [...dedupedByPlaceId.values()];
}

/**
 * Fetch nearby stores. Kept for API-compatibility with the previous
 * Google Places-backed version — OSM tags already carry website/phone/hours,
 * so no separate "details" enrichment call is needed.
 *
 * @param {{ latitude: number, longitude: number, radius?: number, types?: string[] }} params
 * @returns {Promise<import("./types.js").PlaceResult[]>}
 */
export async function fetchNearbyStores({ latitude, longitude, radius, types }) {
  const places = await searchNearbyPlaces({ latitude, longitude, radius, types });
  return [...places].sort((a, b) => (b.name ? -1 : 0) - (a.name ? -1 : 0));
}

/**
 * OSM has no equivalent of Google's Place Photo API — always returns null
 * so callers fall back to their own placeholder image.
 * @returns {null}
 */
export function getPlacePhotoUrl() {
  return null;
}
