import { NextResponse } from "next/server";
import { enforceTop10RateLimit, top10Choice, top10Page, top10ProviderFailure, top10Text, top10Type } from "@/lib/top10/apiResponse";
import { getCatCategories, getCatsByCategory, searchCats } from "@/lib/providers/thecatapi/cats";

export const runtime = "nodejs";

/**
 * GET /api/cats?type=categories
 * GET /api/cats?type=by_category&categoryId=...&page=...
 * GET /api/cats?type=search&query=...&page=...
 *
 * Thin proxy over TheCatAPI — same shape as every other /api/<product>
 * route (movies, books, music, food, places, restaurants, drinks,
 * crypto, dogs).
 */
export async function GET(request) {
  const limited = enforceTop10RateLimit(request);
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const type = top10Type(searchParams, ["categories", "by_category", "search"], "categories");
  const query = top10Text(searchParams, "query");
  const categoryId = top10Choice(searchParams, "categoryId", getCatCategories().map(({ id }) => id));
  const page = top10Page(searchParams);

  try {
    if (type === "categories") {
      const categories = getCatCategories();
      return NextResponse.json(
        { categories },
        { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
      );
    }

    const { cats, hasMore } =
      type === "search" ? await searchCats(query, { page }) : await getCatsByCategory(categoryId, { page });

    return NextResponse.json(
      { cats, hasMore, page, type, query, categoryId },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    return top10ProviderFailure(
      { cats: [], categories: [], hasMore: false, page, type, query, categoryId },
      error,
    );
  }
}
