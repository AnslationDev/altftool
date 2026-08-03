import { NextResponse } from "next/server";
import { enforceTop10RateLimit, top10Choice, top10Page, top10ProviderFailure, top10Text, top10Type } from "@/lib/top10/apiResponse";
import { getRestaurantCategories, getRestaurantsByCategory, searchRestaurants } from "@/lib/providers/foursquare/restaurants";
import { requireProviderKey } from "@/lib/providers/_shared/configuration";

export const runtime = "nodejs";

/**
 * GET /api/restaurants?type=categories
 * GET /api/restaurants?type=by_category&categoryId=...&page=...
 * GET /api/restaurants?type=search&query=...&page=...
 *
 * Thin proxy over Foursquare — the only thing client code should ever
 * call for restaurant data, so FOURSQUARE_API_KEY never reaches the
 * browser. Same shape as /api/movies, /api/books, /api/music, /api/food,
 * /api/places.
 */
export async function GET(request) {
  const limited = enforceTop10RateLimit(request);
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const type = top10Type(searchParams, ["categories", "by_category", "search"], "categories");
  const query = top10Text(searchParams, "query");
  const categoryId = top10Choice(searchParams, "categoryId", getRestaurantCategories().map(({ id }) => id));
  const page = top10Page(searchParams);

  try {
    requireProviderKey("FOURSQUARE_API_KEY", "Foursquare");
    if (type === "categories") {
      const categories = getRestaurantCategories();
      return NextResponse.json(
        { categories },
        { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
      );
    }

    const { restaurants, hasMore } =
      type === "search"
        ? await searchRestaurants(query, { page })
        : await getRestaurantsByCategory(categoryId, { page });

    return NextResponse.json(
      { restaurants, hasMore, page, type, query, categoryId },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    return top10ProviderFailure(
      { restaurants: [], categories: [], hasMore: false, page, type, query, categoryId },
      error,
    );
  }
}
