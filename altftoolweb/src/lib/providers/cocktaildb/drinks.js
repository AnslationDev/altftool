import { getCocktailDbClient } from "./client";
import { sortByRatingDesc } from "@/lib/providers/_shared/normalize";
import { cleanDescription } from "@/lib/providers/_shared/normalize";

/** Shapes a full TheCocktailDB drink object (from lookup/search) into what the UI needs. */
function normalizeDrink(drink) {
  const origin = [drink.strAlcoholic, drink.strCategory].filter(Boolean).join(" · ") || null;
  const parts = [];
  if (drink.strGlass) parts.push(`Served in a ${drink.strGlass.toLowerCase()}.`);
  const instructions = cleanDescription(drink.strInstructions);
  if (instructions) parts.push(instructions);

  return {
    id: drink.idDrink,
    title: drink.strDrink,
    subtitle: origin,
    image: drink.strDrinkThumb,
    // TheCocktailDB has no rating/popularity field — left null rather
    // than invented, same policy as Food (TheMealDB) and Places
    // (Geoapify). sortByRatingDesc still runs so this list picks up real
    // ranking automatically if a future data source ever adds one.
    rating: null,
    description: parts.join(" ") || null,
    url: null,
  };
}

/** Full details for one drink — filter.php only returns id/name/thumb, so this fills in the real instructions. */
async function fetchDrinkDetails(client, drinkId) {
  try {
    const data = await client.get("/lookup.php", { params: { i: drinkId } });
    const drink = data.drinks?.[0];
    return drink ? normalizeDrink(drink) : null;
  } catch {
    return null;
  }
}

/**
 * TheCocktailDB's own category list (minus "Other / Unknown", which
 * isn't a meaningful browsing category) — powers the "browse by
 * category" grid. The drinks themselves are always real, live-fetched;
 * this only decides which category buttons the grid offers, same idea
 * as TMDB's curated genre list.
 */
const DRINK_CATEGORIES = [
  {
    id: "Cocktail",
    label: "Cocktail",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=75",
    description: "Classic and modern mixed drinks, shaken or stirred.",
  },
  {
    id: "Ordinary Drink",
    label: "Ordinary Drink",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=75",
    description: "Simple, everyday mixed drinks — easy to make, easy to love.",
  },
  {
    id: "Punch / Party Drink",
    label: "Punch & Party Drinks",
    image: "https://images.unsplash.com/photo-1570598912132-0ba1dc952b7d?w=500&q=75",
    description: "Big-batch drinks built for a crowd.",
  },
  {
    id: "Shake",
    label: "Shakes",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=75",
    description: "Creamy, blended, and always a treat.",
  },
  {
    id: "Shot",
    label: "Shots",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=75",
    description: "Small pours, big flavor.",
  },
  {
    id: "Coffee / Tea",
    label: "Coffee & Tea",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=75",
    description: "Warm drinks (and cocktails) built around coffee and tea.",
  },
  {
    id: "Cocoa",
    label: "Cocoa",
    image: "https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=500&q=75",
    description: "Rich, chocolatey, and best served warm.",
  },
  {
    id: "Beer",
    label: "Beer",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&q=75",
    description: "Beer and beer-based drinks.",
  },
  {
    id: "Soft Drink",
    label: "Soft Drinks",
    image: "https://images.unsplash.com/photo-1543253687-c931c8e01820?w=500&q=75",
    description: "Non-alcoholic classics for any time of day.",
  },
  {
    id: "Homemade Liqueur",
    label: "Homemade Liqueur",
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&q=75",
    description: "Craft, made-from-scratch liqueurs and infusions.",
  },
];

export function getDrinkCategories() {
  return DRINK_CATEGORIES;
}

/**
 * Top drinks within a single category. TheCocktailDB's filter endpoint
 * returns every match in one shot (id/name/thumb only, no offset param),
 * so pagination slices that list client-side, then fetches full details
 * (real instructions) for just the slice actually shown — same
 * infinite-scroll contract ({ drinks, hasMore }) as movies/books/food.
 */
export async function getDrinksByCategory(categoryId, { page = 1, limit = 10 } = {}) {
  const client = getCocktailDbClient();
  const data = await client.get("/filter.php", { params: { c: categoryId } });
  const drinks = data.drinks || [];

  const start = (page - 1) * limit;
  const pageSlice = drinks.slice(start, start + limit);
  const enriched = await Promise.all(pageSlice.map((drink) => fetchDrinkDetails(client, drink.idDrink)));
  const results = sortByRatingDesc(enriched.filter(Boolean));

  return { drinks: results, hasMore: start + limit < drinks.length };
}

/**
 * Free-text drink search. search.php already returns full drink objects
 * (real instructions included), so no extra per-item fetch is needed —
 * just paginate the results client-side, same as the category browse.
 */
export async function searchDrinks(query, { page = 1, limit = 10 } = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return { drinks: [], hasMore: false };

  const client = getCocktailDbClient();
  const data = await client.get("/search.php", { params: { s: trimmed } });
  const drinks = sortByRatingDesc((data.drinks || []).map(normalizeDrink));

  const start = (page - 1) * limit;
  const results = drinks.slice(start, start + limit);
  return { drinks: results, hasMore: start + limit < drinks.length };
}
