import { fetchWithRetry } from "./httpClient.js";
import { toSaleApiError, SaleApiError } from "./errors.js";
import { getOrSetSaleCache, buildCacheKey } from "./cache.js";

// Free, keyless nearby-places search via the OpenStreetMap Overpass API —
// no paid Google Places key required. Same public interface as before
// (fetchNearbyStores / PLACE_TYPES) so callers don't change.
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

/**
 * OSM's `website` tag sometimes holds several semicolon-separated URLs
 * (e.g. "https://site.com/retail;https://site.com/offices") — only the
 * first is a real fetchable homepage, so use that one consistently
 * everywhere a website link/crawl target is needed.
 */
function firstWebsiteUrl(rawWebsite) {
  if (!rawWebsite) return null;
  const first = String(rawWebsite).split(";")[0].trim();
  return first || null;
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
 * Same idea as buildOverpassQuery, but matches several shop= tags in a
 * single Overpass call (via regex alternation) instead of one call per
 * category — Overpass's public instance is rate-limited, so fanning out
 * N parallel requests for N categories burns through that budget fast.
 */
function buildMultiTagOverpassQuery({ latitude, longitude, radius, shopTags }) {
  const around = `around:${radius},${latitude},${longitude}`;
  const tagRegex = shopTags.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const shopMatch = `["shop"~"^(${tagRegex})$"]`;
  return `[out:json][timeout:25];(node${shopMatch}(${around});way${shopMatch}(${around});relation${shopMatch}(${around}););out center 60;`;
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
    // OSM occasionally has a real photo tagged directly as a URL — use it
    // when present; never a fabricated/stock substitute otherwise.
    photoReference: /^https?:\/\//.test(tags.image || "") ? tags.image : null,
    // "en:Article Title" — lets the caller fetch a real Wikipedia photo for
    // notable places that don't have a direct OSM `image` tag.
    wikipedia: tags.wikipedia || null,
    website: firstWebsiteUrl(tags.website || tags["contact:website"]),
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

const CATEGORY_BY_SHOP_TAG = Object.fromEntries(
  Object.entries(SHOP_TAG_BY_TYPE).map(([category, shopTag]) => [shopTag, category]),
);

/**
 * Search nearby businesses across one or more store categories using a
 * SINGLE Overpass call (multiple shop= tags matched via one regex query),
 * instead of one call per category. Overpass's public instance is rate
 * limited, so this is the preferred entry point whenever several categories
 * are needed at once — searchNearbyPlaces (below) still fans out N parallel
 * calls and is kept only for existing callers.
 *
 * @param {{ latitude: number, longitude: number, radius?: number, types?: string[] }} params
 * @returns {Promise<import("./types.js").PlaceResult[]>}
 */
export async function searchNearbyPlacesByTypes({ latitude, longitude, radius, types = PLACE_TYPES }) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new SaleApiError("A valid latitude/longitude is required.", {
      status: 400,
      code: "upstream_error",
      provider: PROVIDER,
    });
  }

  const requestedTypes = (Array.isArray(types) && types.length ? types : PLACE_TYPES).filter((type) =>
    PLACE_TYPES.includes(type),
  );
  const shopTags = requestedTypes.map((type) => SHOP_TAG_BY_TYPE[type]).filter(Boolean);
  if (shopTags.length === 0) return [];

  const searchRadius = Number.isFinite(Number(radius)) && Number(radius) > 0 ? Number(radius) : defaultRadiusMeters();
  const cacheKey = buildCacheKey("places:nearby-multi", {
    lat: latitude.toFixed(3),
    lng: longitude.toFixed(3),
    radius: searchRadius,
    types: [...requestedTypes].sort().join(","),
  });

  // Real shops/malls don't move — cache far longer than the 10-minute
  // default so a repeat search for the same area/category is instant
  // instead of re-hitting the (often slow) Overpass API every time.
  const PLACES_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

  return getOrSetSaleCache(cacheKey, async () => {
    const upstream = new URL(OVERPASS_ENDPOINT);
    upstream.searchParams.set(
      "data",
      buildMultiTagOverpassQuery({ latitude, longitude, radius: searchRadius, shopTags }),
    );

    let data;
    try {
      data = await fetchWithRetry(upstream, {
        provider: PROVIDER,
        // Short and no retry here on purpose: the mall-search caller already
        // retries across multiple radii (see FALLBACK_RADII_METERS in
        // search.service.js), which acts as the outer retry. Combining that
        // with an inner 15s-timeout+1-retry here caused searches to hang for
        // up to ~90s+ when Overpass was slow — this keeps a single worst
        // case bounded to ~8s.
        timeoutMs: 8000,
        retries: 0,
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });
    } catch (error) {
      throw toSaleApiError(error, { provider: PROVIDER });
    }

    const elements = Array.isArray(data?.elements) ? data.elements : [];
    const dedupedByPlaceId = new Map();
    elements
      .filter((el) => (el.lat ?? el.center?.lat) != null && (el.lon ?? el.center?.lon) != null)
      .forEach((raw) => {
        const category = CATEGORY_BY_SHOP_TAG[raw.tags?.shop] || requestedTypes[0];
        const placeId = `${raw.type}/${raw.id}`;
        if (!dedupedByPlaceId.has(placeId)) {
          dedupedByPlaceId.set(placeId, normalizeOverpassElement(raw, category));
        }
      });

    return [...dedupedByPlaceId.values()];
  }, PLACES_CACHE_TTL_MS);
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
  return searchNearbyPlaces({ latitude, longitude, radius, types });
}
