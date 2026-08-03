import { getMealDbClient } from "./client";
import { sortByRatingDesc } from "@/lib/providers/_shared/normalize";
import { cleanDescription } from "@/lib/providers/_shared/normalize";

/** Shapes a full TheMealDB meal object (from lookup/search) into what the UI needs. */
function normalizeMeal(meal) {
  const origin = [meal.strArea, meal.strCategory].filter(Boolean).join(" · ") || null;
  const parts = [];
  if (origin) parts.push(`A ${origin} dish.`);
  const instructions = cleanDescription(meal.strInstructions);
  if (instructions) parts.push(instructions);

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    subtitle: origin,
    image: meal.strMealThumb,
    // TheMealDB has no rating/popularity field — left null rather than
    // invented, same as OpenLibrary's trending books and Apple's chart
    // tracks. sortByRatingDesc still runs so this list picks up real
    // ranking automatically if a future data source ever adds one.
    rating: null,
    description: parts.join(" ") || null,
    url: meal.strSource || meal.strYoutube || null,
  };
}

/** Full details for one meal — filter.php only returns id/name/thumb, so this fills in the real instructions. */
async function fetchMealDetails(client, mealId) {
  try {
    const data = await client.get("/lookup.php", { params: { i: mealId } });
    const meal = data.meals?.[0];
    return meal ? normalizeMeal(meal) : null;
  } catch {
    return null;
  }
}

/** TheMealDB's own category list — powers the "browse by category" grid. */
export async function getFoodCategories() {
  const client = getMealDbClient();
  const data = await client.get("/categories.php");
  return (data.categories || []).map((c) => ({
    id: c.strCategory,
    label: c.strCategory,
    image: c.strCategoryThumb,
    description: cleanDescription(c.strCategoryDescription),
  }));
}

/**
 * Top meals within a single category. TheMealDB's filter endpoint
 * returns every match in one shot (id/name/thumb only, no offset param),
 * so pagination slices that list client-side, then fetches full details
 * (real instructions) for just the slice actually shown — same
 * infinite-scroll contract ({ food, hasMore }) as movies/books/music.
 */
export async function getFoodByCategory(categoryId, { page = 1, limit = 10 } = {}) {
  if (!categoryId) return { food: [], hasMore: false };
  const client = getMealDbClient();
  const data = await client.get("/filter.php", { params: { c: categoryId } });
  const meals = data.meals || [];

  const start = (page - 1) * limit;
  const pageSlice = meals.slice(start, start + limit);
  const enriched = await Promise.all(pageSlice.map((meal) => fetchMealDetails(client, meal.idMeal)));
  const food = sortByRatingDesc(enriched.filter(Boolean));

  return { food, hasMore: start + limit < meals.length };
}

/**
 * Free-text meal search. search.php already returns full meal objects
 * (real instructions included), so no extra per-item fetch is needed —
 * just paginate the results client-side, same as the category browse.
 */
export async function searchFood(query, { page = 1, limit = 10 } = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return { food: [], hasMore: false };

  const client = getMealDbClient();
  const data = await client.get("/search.php", { params: { s: trimmed } });
  const meals = sortByRatingDesc((data.meals || []).map(normalizeMeal));

  const start = (page - 1) * limit;
  const food = meals.slice(start, start + limit);
  return { food, hasMore: start + limit < meals.length };
}
