import { NextResponse } from "next/server";
import { enforceTop10RateLimit, top10Choice, top10Page, top10ProviderFailure, top10Text, top10Type } from "@/lib/top10/apiResponse";
import { getDrinkCategories, getDrinksByCategory, searchDrinks } from "@/lib/providers/cocktaildb/drinks";

export const runtime = "nodejs";

/**
 * GET /api/drinks?type=categories
 * GET /api/drinks?type=by_category&categoryId=...&page=...
 * GET /api/drinks?type=search&query=...&page=...
 *
 * Thin proxy over TheCocktailDB — same shape as /api/movies, /api/books,
 * /api/music, /api/food.
 */
export async function GET(request) {
  const limited = enforceTop10RateLimit(request);
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const type = top10Type(searchParams, ["categories", "by_category", "search"], "categories");
  const query = top10Text(searchParams, "query");
  const categoryId = top10Choice(searchParams, "categoryId", getDrinkCategories().map(({ id }) => id));
  const page = top10Page(searchParams);

  try {
    if (type === "categories") {
      const categories = getDrinkCategories();
      return NextResponse.json(
        { categories },
        { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
      );
    }

    const { drinks, hasMore } =
      type === "search" ? await searchDrinks(query, { page }) : await getDrinksByCategory(categoryId, { page });

    return NextResponse.json(
      { drinks, hasMore, page, type, query, categoryId },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    return top10ProviderFailure(
      { drinks: [], categories: [], hasMore: false, page, type, query, categoryId },
      error,
    );
  }
}
