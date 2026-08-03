import { NextResponse } from "next/server";
import { enforceTop10RateLimit, top10Choice, top10Page, top10ProviderFailure, top10Text, top10Type } from "@/lib/top10/apiResponse";
import { getDogCategories, getDogsByCategory, searchDogs } from "@/lib/providers/apininjas/dogs";
import { requireProviderKey } from "@/lib/providers/_shared/configuration";

export const runtime = "nodejs";

/**
 * GET /api/dogs?type=categories
 * GET /api/dogs?type=by_category&categoryId=...&page=...
 * GET /api/dogs?type=search&query=...&page=...
 *
 * Thin proxy over API Ninjas — the only thing client code should ever
 * call for dog breed data, so API_NINJAS_KEY never reaches the browser.
 * Same shape as every other /api/<product> route.
 */
export async function GET(request) {
  const limited = enforceTop10RateLimit(request);
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const type = top10Type(searchParams, ["categories", "by_category", "search"], "categories");
  const query = top10Text(searchParams, "query");
  const categoryId = top10Choice(searchParams, "categoryId", getDogCategories().map(({ id }) => id));
  const page = top10Page(searchParams);

  try {
    requireProviderKey("API_NINJAS_KEY", "API Ninjas");
    if (type === "categories") {
      const categories = getDogCategories();
      return NextResponse.json(
        { categories },
        { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
      );
    }

    const { dogs, hasMore } =
      type === "search" ? await searchDogs(query, { page }) : await getDogsByCategory(categoryId, { page });

    return NextResponse.json(
      { dogs, hasMore, page, type, query, categoryId },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    return top10ProviderFailure(
      { dogs: [], categories: [], hasMore: false, page, type, query, categoryId },
      error,
    );
  }
}
