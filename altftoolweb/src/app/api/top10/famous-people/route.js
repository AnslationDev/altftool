import { NextResponse } from "next/server";
import { enforceTop10RateLimit, top10Choice, top10Page, top10ProviderFailure, top10Text, top10Type } from "@/lib/top10/apiResponse";
import { getPeopleByCategory, getPersonCategories, searchPeople } from "@/lib/providers/wikipedia/people";

export const runtime = "nodejs";

/**
 * GET /api/famous-people?type=categories
 * GET /api/famous-people?type=by_category&categoryId=...&page=...
 * GET /api/famous-people?type=search&query=...&page=...
 *
 * Thin proxy over Wikipedia/Wikimedia — same shape as every other
 * /api/<product> route.
 */
export async function GET(request) {
  const limited = enforceTop10RateLimit(request);
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const type = top10Type(searchParams, ["categories", "by_category", "search"], "categories");
  const query = top10Text(searchParams, "query");
  const categoryId = top10Choice(searchParams, "categoryId", getPersonCategories().map(({ id }) => id));
  const page = top10Page(searchParams);

  try {
    if (type === "categories") {
      const categories = getPersonCategories();
      return NextResponse.json(
        { categories },
        { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
      );
    }

    const { people, hasMore } =
      type === "search" ? await searchPeople(query, { page }) : await getPeopleByCategory(categoryId, { page });

    return NextResponse.json(
      { people, hasMore, page, type, query, categoryId },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    return top10ProviderFailure(
      { people: [], categories: [], hasMore: false, page, type, query, categoryId },
      error,
    );
  }
}
