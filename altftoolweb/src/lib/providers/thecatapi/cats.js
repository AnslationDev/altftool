import { getCatApiClient, withCatApiAuth } from "./client";

/** Builds a real, trait-derived description — assembled from the breed's own origin/temperament/life span/trait data. */
function buildDescription(breed) {
  const parts = [];
  if (breed.origin) parts.push(`Origin: ${breed.origin}.`);
  if (breed.life_span) parts.push(`Life expectancy: ${breed.life_span} years.`);
  if (breed.temperament) parts.push(`Temperament: ${breed.temperament}.`);

  const traits = [];
  if (typeof breed.affection_level === "number") traits.push(`affection (${breed.affection_level}/5)`);
  if (typeof breed.energy_level === "number") traits.push(`energy (${breed.energy_level}/5)`);
  if (typeof breed.intelligence === "number") traits.push(`intelligence (${breed.intelligence}/5)`);
  if (typeof breed.shedding_level === "number") traits.push(`shedding (${breed.shedding_level}/5)`);
  if (traits.length) parts.push(`Traits: ${traits.join(", ")}.`);

  return parts.join(" ") || null;
}

/**
 * No single canonical "rating" field exists for a cat breed. Rather than
 * invent a composite score, real per-trait scores (1-5, from the API
 * itself) are shown in the description instead — rating stays null,
 * same policy as every other provider here (Food/Places/Drinks/Crypto/
 * Dogs).
 */
function normalizeCat(breed, imageUrl) {
  return {
    id: breed.id,
    title: breed.name,
    subtitle: breed.origin || null,
    image: imageUrl || null,
    rating: null,
    description: buildDescription(breed),
    url: breed.wikipedia_url || null,
  };
}

/** TheCatAPI's /breeds returns the full list in one call, no filter params — fetched once per request and filtered/paginated in memory. */
async function fetchAllBreeds(client) {
  const data = await client.get("/breeds", { headers: withCatApiAuth() });
  return Array.isArray(data) ? data : [];
}

/** /breeds has no image field — one extra call per breed resolves its reference photo, same "enrich only what's shown" idea as enrichTopItems elsewhere. */
async function fetchBreedImage(client, breed) {
  if (!breed.reference_image_id) return null;
  try {
    const data = await client.get(`/images/${breed.reference_image_id}`, { headers: withCatApiAuth() });
    return data?.url || null;
  } catch {
    return null;
  }
}

async function enrichWithImages(client, breeds) {
  return Promise.all(breeds.map(async (breed) => normalizeCat(breed, await fetchBreedImage(client, breed))));
}

/**
 * TheCatAPI's breed objects carry real 1-5 trait scores (and a couple of
 * 0/1 flags) but no server-side filter support — so this filters the
 * full breed list in memory, using genuine field/threshold pairs (not
 * curated guesses). Category id is a literal `field<op><value>` token,
 * parsed back into a real predicate below.
 */
const CAT_CATEGORIES = [
  {
    id: "affection_level>=4",
    label: "Most Affectionate",
    image: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=500&q=75",
    description: "Cats that love to be close — lap time, head bumps, the works.",
  },
  {
    id: "energy_level>=4",
    label: "High Energy",
    image: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=500&q=75",
    description: "Playful, active breeds that keep moving.",
  },
  {
    id: "child_friendly>=4",
    label: "Family Friendly",
    image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&q=75",
    description: "Easygoing breeds that do well around kids.",
  },
  {
    id: "intelligence>=4",
    label: "Highly Intelligent",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=75",
    description: "Quick, curious cats that pick up tricks and puzzle toys fast.",
  },
  {
    id: "shedding_level<=2",
    label: "Low Shedding",
    image: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=500&q=75",
    description: "Easier on the furniture (and the vacuum).",
  },
  {
    id: "hypoallergenic=1",
    label: "Hypoallergenic",
    image: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=500&q=75",
    description: "Breeds better suited to allergy-sensitive households.",
  },
];

export function getCatCategories() {
  return CAT_CATEGORIES;
}

/** Parses a category id like "affection_level>=4" into a real predicate over TheCatAPI's own field. */
function parseCategoryFilter(categoryId) {
  const match = String(categoryId || "").match(/^([a-z_]+)(>=|<=|=)(\d+)$/);
  if (!match) return null;
  const [, field, op, valueStr] = match;
  const value = Number(valueStr);
  return (breed) => {
    const v = breed[field];
    if (typeof v !== "number") return false;
    if (op === ">=") return v >= value;
    if (op === "<=") return v <= value;
    return v === value;
  };
}

/**
 * Top cats within a single trait category, filtered from the full real
 * breed list. Pagination slices in memory (no offset support on
 * /breeds), then resolves real images for just the slice shown.
 */
export async function getCatsByCategory(categoryId, { page = 1, limit = 10 } = {}) {
  const predicate = parseCategoryFilter(categoryId);
  if (!predicate) return { cats: [], hasMore: false };

  const client = getCatApiClient();
  const all = await fetchAllBreeds(client);
  const filtered = all.filter(predicate);

  const start = (page - 1) * limit;
  const pageSlice = filtered.slice(start, start + limit);
  const cats = await enrichWithImages(client, pageSlice);
  return { cats, hasMore: start + limit < filtered.length };
}

/** Free-text breed search via TheCatAPI's own /breeds/search endpoint. */
export async function searchCats(query, { page = 1, limit = 10 } = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return { cats: [], hasMore: false };

  const client = getCatApiClient();
  const data = await client.get("/breeds/search", { params: { q: trimmed }, headers: withCatApiAuth() });
  const list = Array.isArray(data) ? data : [];

  const start = (page - 1) * limit;
  const pageSlice = list.slice(start, start + limit);
  const cats = await enrichWithImages(client, pageSlice);
  return { cats, hasMore: start + limit < list.length };
}
