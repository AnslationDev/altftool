import { getApiNinjasClient, withApiNinjasAuth } from "./client";

/** "12–14 years" / "12 years" style range formatting — skips entirely if both bounds are missing. */
function formatRange(min, max, unit) {
  if (min == null && max == null) return null;
  if (min === max || max == null) return `${min}${unit}`;
  if (min == null) return `${max}${unit}`;
  return `${min}–${max}${unit}`;
}

/** Builds a real, trait-derived description — API Ninjas returns no bio/summary field, so this is assembled from the breed's own real data. */
function buildDescription(dog) {
  const parts = [];
  const life = formatRange(dog.min_life_expectancy, dog.max_life_expectancy, " years");
  if (life) parts.push(`Life expectancy: ${life}.`);
  const weight = formatRange(dog.min_weight_male, dog.max_weight_male, " lbs");
  if (weight) parts.push(`Typical weight: ${weight}.`);

  const traits = [];
  if (typeof dog.trainability === "number") traits.push(`trainability (${dog.trainability}/5)`);
  if (typeof dog.energy === "number") traits.push(`energy (${dog.energy}/5)`);
  if (typeof dog.protectiveness === "number") traits.push(`protectiveness (${dog.protectiveness}/5)`);
  if (typeof dog.shedding === "number") traits.push(`shedding (${dog.shedding}/5)`);
  if (typeof dog.barking === "number") traits.push(`barking (${dog.barking}/5)`);
  if (traits.length) parts.push(`Traits: ${traits.join(", ")}.`);

  return parts.join(" ") || null;
}

/**
 * No single canonical "rating" field exists for a dog breed. Rather than
 * invent a composite score to display, real per-trait scores (1-5, from
 * the API itself) are shown in the description instead — rating stays
 * null, same policy as Food/Places/Drinks/Crypto.
 */
function normalizeDog(dog, rank) {
  return {
    id: `${dog.name}-${rank}`,
    title: dog.name,
    subtitle: dog.coat_length ? `${dog.coat_length} coat` : null,
    image: dog.image_link || null,
    rating: null,
    description: buildDescription(dog),
    url: null,
  };
}

/**
 * API Ninjas' /dogs endpoint requires at least one filter param — a bare
 * call with none returns {"error":"No parameters found."} (confirmed
 * live) — and only a subset of the documented trait fields actually work
 * as filters (also confirmed live; several others return "Invalid
 * parameters."): trainability, energy, protectiveness, shedding,
 * barking, min_life_expectancy. Those six become the "browse by
 * category" grid — genuine API-backed filters, not curated guesses.
 */
const DOG_CATEGORIES = [
  {
    id: "trainability=5",
    label: "Highly Trainable",
    image: "https://images.unsplash.com/photo-1587764379873-97837921fd44?w=500&q=75",
    description: "Quick learners that pick up commands and routines easily.",
  },
  {
    id: "energy=5",
    label: "High Energy",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=75",
    description: "Built for activity — long walks, runs, and playtime.",
  },
  {
    id: "protectiveness=5",
    label: "Best Guard Dogs",
    image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=500&q=75",
    description: "Naturally watchful and protective of home and family.",
  },
  {
    id: "shedding=1",
    label: "Low Shedding",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=75",
    description: "Easier on allergies and easier to keep the couch fur-free.",
  },
  {
    id: "barking=1",
    label: "Quiet Breeds",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=500&q=75",
    description: "Calm, low-bark companions — great for close neighbors.",
  },
  {
    id: "min_life_expectancy=10",
    label: "Long-Lived Breeds",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=75",
    description: "Breeds known for a decade or more by your side.",
  },
];

export function getDogCategories() {
  return DOG_CATEGORIES;
}

/** category id is a literal `param=value` pair (e.g. "trainability=5") — split it back into the real API filter. */
function parseCategoryFilter(categoryId) {
  const [key, value] = String(categoryId || "").split("=");
  return key && value ? { [key]: value } : null;
}

/**
 * Top dogs within a single trait category. The endpoint has no offset
 * param and caps around 20 results per call, so pagination slices that
 * batch client-side, same pattern as TheMealDB/TheCocktailDB.
 */
export async function getDogsByCategory(categoryId, { page = 1, limit = 10 } = {}) {
  const filter = parseCategoryFilter(categoryId);
  if (!filter) return { dogs: [], hasMore: false };

  const client = getApiNinjasClient();
  const data = await client.get("/dogs", { params: filter, headers: withApiNinjasAuth() });
  const list = Array.isArray(data) ? data : [];
  const dogs = list.map((dog, index) => normalizeDog(dog, index + 1));

  const start = (page - 1) * limit;
  const results = dogs.slice(start, start + limit);
  return { dogs: results, hasMore: start + limit < dogs.length };
}

/**
 * If the query names a specific breed (e.g. "labrador"), that becomes
 * the API's `name` filter. Generic phrasing ("top 10 dogs", "dog
 * breeds") strips down to nothing — since the API rejects a paramless
 * call, that case falls back to the same "Highly Trainable" filter the
 * first category card uses, a reasonable general "top dogs" default
 * rather than an error.
 */
function extractBreedHint(query) {
  const cleaned = query
    .toLowerCase()
    .replace(/\btop\s*\d*\b/g, "")
    .replace(/\bdogs?\b/g, "")
    .replace(/\bbreeds?\b/g, "")
    .replace(/[^a-z\s]/g, "")
    .trim();
  return cleaned || null;
}

/**
 * Free-text dog breed search — used both when a dog-related search is
 * submitted from the hero search bar and for "search within Dogs" once
 * a category grid is showing.
 */
export async function searchDogs(query, { page = 1, limit = 10 } = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return { dogs: [], hasMore: false };

  const client = getApiNinjasClient();
  const breedHint = extractBreedHint(trimmed);
  const data = await client.get("/dogs", {
    params: breedHint ? { name: breedHint } : { trainability: 5 },
    headers: withApiNinjasAuth(),
  });

  const list = Array.isArray(data) ? data : [];
  const dogs = list.map((dog, index) => normalizeDog(dog, index + 1));

  const start = (page - 1) * limit;
  const results = dogs.slice(start, start + limit);
  return { dogs: results, hasMore: start + limit < dogs.length };
}
