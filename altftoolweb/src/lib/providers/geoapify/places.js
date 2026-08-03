import { getGeoapifyGeocodeClient, getGeoapifyPlacesClient, withGeoapifyAuth } from "./client";

/**
 * Geoapify's /v2/places requires a `filter`, and only accepts
 * circle/rect/geometry/place — no countrycode list (confirmed by a live
 * 400: "Invalid filterType parameter. Possible values: 'circle' | 'rect'
 * | 'geometry' | 'place'."). No user geolocation input exists on this
 * page today, so this uses a `rect` spanning nearly the whole globe as a
 * "worldwide" default. Swap for a user-supplied `circle:lon,lat,radius`
 * once the site has a real location to scope to.
 */
const WORLDWIDE_RECT_FILTER = "rect:-179,-85,179,85";

/** Builds a real, place-derived description — Geoapify returns no bio/summary field, so this is assembled from the place's own address + category. */
function buildPlaceDescription(props, categoryNoun) {
  const location = [props.city, props.state, props.country].filter(Boolean).join(", ") || props.formatted || null;
  const parts = [];
  if (categoryNoun && location) parts.push(`A ${categoryNoun} in ${location}.`);
  else if (location) parts.push(`Located in ${location}.`);
  if (props.address_line2 && props.address_line2 !== location) parts.push(`${props.address_line2}.`);
  return parts.join(" ") || null;
}

/** Shapes a raw Geoapify place feature into what the UI needs. */
function normalizePlace(feature, categoryNoun) {
  const props = feature.properties || {};
  return {
    id: props.place_id,
    title: props.name || props.address_line1 || "Unnamed place",
    subtitle: [props.city, props.country].filter(Boolean).join(", ") || null,
    // Geoapify's Places API returns no photos — left null rather than
    // faked; RankedItem/CategoryCard already fall back to a placeholder
    // icon when image is missing (same as any provider with a gap).
    image: null,
    // No popularity/rating field in the base API either — never invent
    // one. sortByRatingDesc (movies/books/music/food all run it) would
    // be a no-op here since every place has the same null rating, so
    // it's skipped rather than pretending to rank by something that
    // doesn't exist; Geoapify's own relevance order is kept as-is.
    rating: null,
    description: buildPlaceDescription(props, categoryNoun),
    url: props.website || null,
  };
}

/**
 * A curated set of Geoapify's own place categories — powers the "browse
 * by category" grid. The places themselves are always real, live-fetched;
 * this only decides which category buttons the grid offers, same idea as
 * TMDB's curated genre list.
 */
const PLACE_CATEGORIES = [
  {
    id: "accommodation.hotel",
    label: "Hotels",
    noun: "hotel",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=75",
    description: "Places to stay, from boutique stays to beachfront resorts.",
  },
  {
    id: "catering.restaurant",
    label: "Restaurants",
    noun: "restaurant",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=75",
    description: "Real places to eat, wherever the trip takes you.",
  },
  {
    id: "catering.cafe",
    label: "Cafes",
    noun: "cafe",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&q=75",
    description: "Coffee, pastries, and a place to slow down.",
  },
  {
    id: "entertainment.museum",
    label: "Museums",
    noun: "museum",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=500&q=75",
    description: "Art, history, and culture worth the detour.",
  },
  {
    id: "leisure.park",
    label: "Parks",
    noun: "park",
    image: "https://images.unsplash.com/photo-1499591934245-40b55745b905?w=500&q=75",
    description: "Green space and open air, in the middle of it all.",
  },
  {
    id: "tourism.sights",
    label: "Landmarks & Sights",
    noun: "landmark",
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&q=75",
    description: "The sights worth planning a trip around.",
  },
  {
    id: "natural.beach",
    label: "Beaches",
    noun: "beach",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500&q=75",
    description: "Sand, sun, and the coastline's best stretches.",
  },
  {
    id: "commercial.shopping_mall",
    label: "Shopping",
    noun: "shopping destination",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=500&q=75",
    description: "Malls and shopping districts worth a visit.",
  },
  {
    id: "catering.bar",
    label: "Nightlife",
    noun: "bar",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&q=75",
    description: "Bars and late-night spots for when the sun goes down.",
  },
  {
    id: "sport",
    label: "Sports & Recreation",
    noun: "sports venue",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=500&q=75",
    description: "Courts, pools, and places built to move in.",
  },
];

export function getPlaceCategories() {
  return PLACE_CATEGORIES;
}

/**
 * Top places within a single category. Geoapify's Places API supports
 * real offset pagination, unlike TheMealDB/Deezer's fixed-list feeds —
 * the caller requests the next `page` as the user scrolls.
 */
export async function getPlacesByCategory(categoryId, { page = 1, limit = 10 } = {}) {
  const client = getGeoapifyPlacesClient();
  const offset = (page - 1) * limit;
  const categoryNoun = PLACE_CATEGORIES.find((c) => c.id === categoryId)?.noun || null;

  const data = await client.get("/places", {
    params: withGeoapifyAuth({
      categories: categoryId,
      filter: WORLDWIDE_RECT_FILTER,
      limit,
      offset,
    }),
  });

  const places = (data.features || []).map((feature) => normalizePlace(feature, categoryNoun));
  return { places, hasMore: places.length === limit };
}

/**
 * Free-text place search via Geoapify's Geocoding API (a different
 * endpoint from category browsing — built for "find this place by
 * name", worldwide, no area filter required). No offset support, so
 * pagination slices the one batch client-side.
 */
export async function searchPlaces(query, { page = 1, limit = 10 } = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return { places: [], hasMore: false };

  const client = getGeoapifyGeocodeClient();
  const data = await client.get("/search", {
    params: withGeoapifyAuth({ text: trimmed, format: "geojson", limit: 40 }),
  });

  const all = (data.features || []).map((feature) => normalizePlace(feature, null));
  const start = (page - 1) * limit;
  const places = all.slice(start, start + limit);
  return { places, hasMore: start + limit < all.length };
}
