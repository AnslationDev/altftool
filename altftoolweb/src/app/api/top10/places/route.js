import { NextResponse } from "next/server";
import { enforceTop10RateLimit, top10Choice, top10Page, top10ProviderFailure, top10Text, top10Type } from "@/lib/top10/apiResponse";
import { getPlaceCategories, getPlacesByCategory, searchPlaces } from "@/lib/providers/geoapify/places";
import { requireProviderKey } from "@/lib/providers/_shared/configuration";

export const runtime = "nodejs";

/**
 * GET /api/places?type=categories
 * GET /api/places?type=by_category&categoryId=...&page=...
 * GET /api/places?type=search&query=...&page=...
 *
 * Thin proxy over Geoapify — the only thing client code should ever call
 * for place data, so GEOAPIFY_API_KEY never reaches the browser. Same
 * shape as /api/movies, /api/books, /api/music, /api/food.
 */
export async function GET(request) {
  const limited = enforceTop10RateLimit(request);
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const type = top10Type(searchParams, ["categories", "by_category", "search"], "categories");
  const query = top10Text(searchParams, "query");
  const categoryId = top10Choice(searchParams, "categoryId", getPlaceCategories().map(({ id }) => id));
  const page = top10Page(searchParams);

  try {
    requireProviderKey("GEOAPIFY_API_KEY", "Geoapify");
    if (type === "categories") {
      const categories = getPlaceCategories();
      return NextResponse.json(
        { categories },
        { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
      );
    }

    const { places, hasMore } =
      type === "search" ? await searchPlaces(query, { page }) : await getPlacesByCategory(categoryId, { page });

    return NextResponse.json(
      { places, hasMore, page, type, query, categoryId },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    return top10ProviderFailure(
      { places: [], categories: [], hasMore: false, page, type, query, categoryId },
      error,
    );
  }
}
