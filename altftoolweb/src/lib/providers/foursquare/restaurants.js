import { getFoursquareClient, withFoursquareAuth } from "./client";
import { sortByRatingDesc } from "@/lib/providers/_shared/normalize";

/**
 * Foursquare has no user geolocation to scope to on this page yet, so
 * category browsing defaults to one major city with dense restaurant
 * data. Swap for a user-supplied `ll=lat,lon` once the site has a real
 * location (same limitation as Geoapify's places, documented there too).
 */
const DEFAULT_NEAR = "New York, NY, USA";

/** Foursquare photo objects are {prefix, suffix} — concatenate with a size to get a real URL. */
function photoUrl(photo, size = "400x400") {
  if (!photo?.prefix || !photo?.suffix) return null;
  return `${photo.prefix}${size}${photo.suffix}`;
}

/** Builds a real, place-derived description — Foursquare returns no bio/summary field on search results, so this is assembled from the place's own address + category + price. */
function buildDescription(place, categoryNoun) {
  const location = place.location?.formatted_address || [place.location?.locality, place.location?.region, place.location?.country].filter(Boolean).join(", ") || null;
  const parts = [];
  if (categoryNoun && location) parts.push(`A ${categoryNoun} in ${location}.`);
  else if (location) parts.push(`Located in ${location}.`);
  if (typeof place.price === "number") parts.push(`Price level: ${"$".repeat(place.price)}.`);
  return parts.join(" ") || null;
}

/** Shapes a raw Foursquare place result into what the UI needs. */
function normalizeRestaurant(place, categoryNoun) {
  return {
    // New Places API renamed fsq_id -> fsq_place_id; accept either in
    // case the account is still on the older field name for some fields.
    id: place.fsq_place_id || place.fsq_id,
    title: place.name,
    subtitle: [place.location?.locality, place.location?.country].filter(Boolean).join(", ") || null,
    image: photoUrl(place.photos?.[0]) || null,
    // Foursquare's rating is already 0-10, the same scale the UI already
    // uses for TMDB's vote_average — no rescaling needed, and left null
    // (not 0) when Foursquare itself has no rating for a place.
    rating: typeof place.rating === "number" ? place.rating : null,
    description: buildDescription(place, categoryNoun),
    url: place.website || null,
  };
}

/**
 * A curated set of Foursquare's own restaurant category IDs — powers the
 * "browse by category" grid. The restaurants themselves are always real,
 * live-fetched; this only decides which category buttons the grid
 * offers, same idea as TMDB's curated genre list.
 */
const RESTAURANT_CATEGORIES = [
  {
    id: "13068",
    label: "American",
    noun: "American restaurant",
    image: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=500&q=75",
    description: "Burgers, diners, and classic American plates.",
  },
  {
    id: "13064",
    label: "Pizza",
    noun: "pizza place",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=75",
    description: "Slices and pies, from neighborhood joints to wood-fired ovens.",
  },
  {
    id: "13263",
    label: "Japanese",
    noun: "Japanese restaurant",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=500&q=75",
    description: "Ramen, sushi, and everything in between.",
  },
  {
    id: "13199",
    label: "Indian",
    noun: "Indian restaurant",
    image: "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=500&q=75",
    description: "Bold spices and real regional Indian cooking.",
  },
  {
    id: "13338",
    label: "Seafood",
    noun: "seafood restaurant",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&q=75",
    description: "Fresh catches, coastal classics, and raw bars.",
  },
  {
    id: "13383",
    label: "Steakhouse",
    noun: "steakhouse",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=75",
    description: "Serious cuts, done right.",
  },
  {
    id: "13072",
    label: "Asian",
    noun: "Asian restaurant",
    image: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=500&q=75",
    description: "Fresh, fast, and full of flavor — Asian kitchens worth seeking out.",
  },
  {
    id: "13002",
    label: "Breakfast & Brunch",
    noun: "breakfast spot",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=75",
    description: "Pancakes, eggs, and the best way to start the day.",
  },
  {
    id: "13003",
    label: "Bar & Grill",
    noun: "bar and grill",
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=500&q=75",
    description: "Wings, drinks, and good pub food.",
  },
];

export function getRestaurantCategories() {
  return RESTAURANT_CATEGORIES;
}

/**
 * Top restaurants within a single cuisine category, sorted highest-rated
 * first (Foursquare genuinely returns a rating, unlike Geoapify/
 * TheMealDB — this is real ranking, not just preserved API order). v3's
 * /search endpoint doesn't offer reliable offset pagination, so one
 * request fetches a generous batch and pagination slices it client-side,
 * same pattern as TheMealDB/Apple's charts feed.
 */
export async function getRestaurantsByCategory(categoryId, { page = 1, limit = 10 } = {}) {
  const client = getFoursquareClient();
  const categoryNoun = RESTAURANT_CATEGORIES.find((c) => c.id === categoryId)?.noun || null;

  const data = await client.get("/search", {
    params: {
      near: DEFAULT_NEAR,
      categories: categoryId,
      fields: "fsq_id,name,categories,location,rating,price,website,photos",
      sort: "RATING",
      limit: 50,
    },
    headers: withFoursquareAuth(),
  });
  const all = sortByRatingDesc((data.results || []).map((place) => normalizeRestaurant(place, categoryNoun)));
  const start = (page - 1) * limit;
  const restaurants = all.slice(start, start + limit);
  return { restaurants, hasMore: start + limit < all.length };
}

/**
 * Free-text restaurant search via the same /search endpoint, `query`
 * instead of `categories`. Same fetch-once-slice pagination as category
 * browsing.
 */
export async function searchRestaurants(query, { page = 1, limit = 10 } = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return { restaurants: [], hasMore: false };

  const client = getFoursquareClient();
  const data = await client.get("/search", {
    params: {
      near: DEFAULT_NEAR,
      query: trimmed,
      fields: "fsq_id,name,categories,location,rating,price,website,photos",
      sort: "RATING",
      limit: 50,
    },
    headers: withFoursquareAuth(),
  });

  const all = sortByRatingDesc((data.results || []).map((place) => normalizeRestaurant(place, null)));
  const start = (page - 1) * limit;
  const restaurants = all.slice(start, start + limit);
  return { restaurants, hasMore: start + limit < all.length };
}
