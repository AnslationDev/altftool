import { searchNearbyPlacesByTypes, PLACE_TYPES } from "./places.js";
import { sortByDistance } from "./distance.service.js";

/**
 * Map a free-text search term to the OSM place categories it should search.
 * Falls back to "malls first" (matches the product spec: searching a brand
 * name like "Nike" should look in nearby malls before anything else).
 *
 * @param {string} rawKeyword
 * @returns {string[]} a subset of PLACE_TYPES
 */
export function resolveCategoriesForKeyword(rawKeyword) {
  const keyword = String(rawKeyword || "").trim().toLowerCase();

  if (!keyword) return ["shopping_mall"];

  const has = (...words) => words.some((w) => keyword.includes(w));

  if (has("electronic", "mobile", "laptop", "gadget")) return ["electronics_store"];
  if (has("fashion", "clothes", "clothing", "apparel", "wear")) return ["clothing_store"];
  if (has("shoe", "footwear", "sneaker")) return ["shoe_store"];
  if (has("grocery", "supermarket", "kirana")) return ["supermarket"];
  if (has("book")) return ["book_store"];
  if (has("jewel", "jewellery", "jewelry", "gold")) return ["jewelry_store"];
  if (has("department store")) return ["department_store"];
  if (has("mall", "shopping mall", "sale near me", "nearby sale", "sale")) {
    return ["shopping_mall", "department_store"];
  }

  // Any other term (e.g. a brand name like "Nike") — malls are the most
  // likely place to actually find that brand, so search malls first.
  return ["shopping_mall", "department_store"];
}

// Generic search words stripped out when checking whether the user's query
// is actually naming a specific place (e.g. "Ambience Mall" -> "ambience").
// Kept intentionally small/generic — never a list of real mall/brand names,
// so "search anything" still relies entirely on matching real fetched data,
// not a hardcoded catalog of places.
const GENERIC_SEARCH_WORDS = new Set([
  "mall", "malls", "shopping", "shop", "shops", "store", "stores",
  "near", "nearby", "me", "sale", "sales", "offer", "offers",
  "deal", "deals", "outlet", "outlets", "the", "a", "at", "in",
]);

/**
 * Extract the "does this look like a specific place name" residue of a
 * search query, e.g. "Ambience Mall" -> "ambience", "Nike" -> "nike",
 * "Nearby Sale" -> "" (purely generic, no name to match).
 *
 * @param {string} rawKeyword
 * @returns {string}
 */
function extractNameQuery(rawKeyword) {
  const tokens = normalizeForMatch(rawKeyword).split(" ").filter(Boolean);
  return tokens.filter((t) => !GENERIC_SEARCH_WORDS.has(t)).join(" ");
}

// Malls are tagged much more sparsely in OSM than shops/restaurants — many
// smaller Indian cities/towns have zero shop=mall nodes within a normal
// 10km delivery-style radius even though real malls exist a bit further
// out. A 20km radius is a strict superset of a 10km one, so querying it
// directly covers both the dense-area and sparse-area cases in a SINGLE
// Overpass call — a prior "try 10km, then try 30km" two-step version
// doubled the wait whenever the first attempt came back empty, which was
// the main cause of slow/instant-feeling loads. Only used when the caller
// didn't pin an explicit radius.
const DEFAULT_SEARCH_RADIUS_METERS = 20000;
// Hard ceiling on the whole search — Overpass being slow must never turn
// into a near-two-minute hang (a real regression this guards against).
const MAX_SEARCH_BUDGET_MS = 9000;

function normalizeForMatch(str) {
  return String(str || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Search real nearby shopping malls/stores for a free-text keyword, sorted
 * nearest-first. Every result comes from the live OpenStreetMap Overpass
 * API — never hardcoded/mock data.
 *
 * @param {{ latitude: number, longitude: number, radius?: number, keyword?: string }} params
 * @returns {Promise<Array<{
 *   id: string, name: string, address: string, lat: number, lng: number,
 *   distance: number|null, category: string, website: string|null,
 *   phoneNumber: string|null, businessStatus: string, openNow: boolean|null,
 * }>>}
 */
export async function searchNearbyMalls({ latitude, longitude, radius, keyword }) {
  const categories = resolveCategoriesForKeyword(keyword).filter((c) => PLACE_TYPES.includes(c));
  const types = categories.length ? categories : undefined;

  const searchRadius = radius || DEFAULT_SEARCH_RADIUS_METERS;

  // Race against a hard budget as a safety net — the underlying Overpass
  // fetch already times out on its own (see places.js), this just makes
  // sure nothing upstream of it can still turn into a long hang.
  const places = await Promise.race([
    searchNearbyPlacesByTypes({ latitude, longitude, radius: searchRadius, types }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Nearby search took too long.")), MAX_SEARCH_BUDGET_MS),
    ),
  ]);

  const normalized = places.map((place) => ({
    id: place.placeId,
    name: place.name,
    address: place.address || "",
    lat: place.latitude,
    lng: place.longitude,
    category: place.category,
    website: place.website,
    phoneNumber: place.phoneNumber,
    businessStatus: place.businessStatus,
    openNow: place.openNow,
    // Raw OSM opening_hours string (e.g. "Mo-Su 10:00-22:00") — real tagged
    // data when present; there is no fabricated fallback.
    openingHours: place.openingHours?.[0] || null,
    // OSM has no review/rating system — always null. Kept as a field (not
    // omitted) so the UI's "only render if a real rating exists" check has
    // something consistent to check against, without ever fabricating one.
    rating: place.rating ?? null,
    // Real tagged photo URL when OSM happens to have one — null otherwise
    // (never a stock/placeholder substitute; the UI falls back to a
    // category icon). Wikipedia-based enrichment was tried but removed —
    // it added several extra seconds of network latency per search for a
    // nice-to-have, which isn't worth it on this speed-sensitive path.
    imageUrl: place.photoReference ?? null,
  }));

  const publicShape = sortByDistance(normalized, { lat: latitude, lng: longitude });

  // If the query names a specific real place (e.g. "Ambience Mall" ->
  // "ambience"), boost any actual name match to the top — still real,
  // live-fetched OSM data; this only re-orders it, never filters anything
  // out, so a search for a specific mall that isn't in range still falls
  // back to nearby alternatives instead of showing nothing.
  const nameQuery = extractNameQuery(keyword);
  if (!nameQuery) return publicShape;

  return [...publicShape].sort((a, b) => {
    const aMatch = normalizeForMatch(a.name).includes(nameQuery) ? 0 : 1;
    const bMatch = normalizeForMatch(b.name).includes(nameQuery) ? 0 : 1;
    if (aMatch !== bMatch) return aMatch - bMatch;
    return (a.distance ?? Infinity) - (b.distance ?? Infinity);
  });
}
