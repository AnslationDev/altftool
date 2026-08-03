import { NextResponse } from "next/server";
import { enforceTop10RateLimit, top10Choice, top10Page, top10ProviderFailure, top10Text, top10Type } from "@/lib/top10/apiResponse";
import { getFoodByCategory, getFoodCategories, searchFood } from "@/lib/providers/themealdb/food";

export const runtime = "nodejs";

/**
 * GET /api/food?type=categories
 * GET /api/food?type=by_category&categoryId=...&page=...
 * GET /api/food?type=search&query=...&page=...
 *
 * Thin proxy over TheMealDB — same shape as /api/movies, /api/books, and
 * /api/music, so client code never talks to a third party directly.
 */
export async function GET(request) {
  const limited = enforceTop10RateLimit(request);
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const type = top10Type(searchParams, ["categories", "by_category", "search"], "categories");
  const query = top10Text(searchParams, "query");
  let categoryId = top10Text(searchParams, "categoryId");
  const page = top10Page(searchParams);

  try {
    if (type === "categories") {
      const categories = await getFoodCategories();
      return NextResponse.json(
        { categories },
        { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
      );
    }

    if (type === "by_category") {
      const categories = await getFoodCategories();
      categoryId = top10Choice(searchParams, "categoryId", categories.map(({ id }) => id));
    }

    const { food, hasMore } =
      type === "search" ? await searchFood(query, { page }) : await getFoodByCategory(categoryId, { page });

    return NextResponse.json(
      { food, hasMore, page, type, query, categoryId },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    return top10ProviderFailure(
      { food: [], categories: [], hasMore: false, page, type, query, categoryId },
      error,
    );
  }
}
