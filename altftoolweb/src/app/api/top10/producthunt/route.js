import { NextResponse } from "next/server";
import { enforceTop10RateLimit, top10Choice, top10Page, top10ProviderFailure, top10Text, top10Type } from "@/lib/top10/apiResponse";
import { getToolCategories, getToolsByCategory, searchTools } from "@/lib/providers/producthunt/products";
import { assertProductHuntConfigured } from "@/lib/providers/producthunt/client";

export const runtime = "nodejs";

/**
 * GET /api/producthunt?type=categories
 * GET /api/producthunt?type=by_category&categoryId=...&page=...
 * GET /api/producthunt?type=search&query=...&page=...
 *
 * Thin proxy over Product Hunt — the only thing client code should ever
 * call for tool data, so PRODUCTHUNT_API_KEY/SECRET never reach the
 * browser. Same shape as every other /api/<product> route. Named
 * /api/producthunt (not /api/tools) to avoid any collision with the
 * site's existing, unrelated /api/tools/* tree (giphy, remove-bg,
 * pagespeed, and dozens more tool-specific routes already live there).
 */
export async function GET(request) {
  const limited = enforceTop10RateLimit(request);
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const type = top10Type(searchParams, ["categories", "by_category", "search"], "categories");
  const query = top10Text(searchParams, "query");
  const categoryId = top10Choice(searchParams, "categoryId", getToolCategories().map(({ id }) => id));
  const page = top10Page(searchParams);

  try {
    assertProductHuntConfigured();
    if (type === "categories") {
      const categories = getToolCategories();
      return NextResponse.json(
        { categories },
        { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
      );
    }

    const { tools, hasMore } =
      type === "search" ? await searchTools(query, { page }) : await getToolsByCategory(categoryId, { page });

    return NextResponse.json(
      { tools, hasMore, page, type, query, categoryId },
      { headers: { "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600" } },
    );
  } catch (error) {
    return top10ProviderFailure(
      { tools: [], categories: [], hasMore: false, page, type, query, categoryId },
      error,
    );
  }
}
