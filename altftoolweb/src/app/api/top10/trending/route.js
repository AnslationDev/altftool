import { NextResponse } from "next/server";
import { enforceTop10RateLimit, top10ProviderFailure } from "@/lib/top10/apiResponse";
import { getTrendingCards } from "@/lib/top10/trendingCards";

export const runtime = "nodejs";

/**
 * GET /api/top10/trending
 *
 * Aggregates ONE real card per product for the homepage "Trending Now"
 * strip. Card-building logic lives in @/lib/top10/trendingCards (shared
 * with the universe-highlight endpoint) — this route is just the thin
 * HTTP wrapper around it.
 */
export async function GET(request) {
  const limited = enforceTop10RateLimit(request);
  if (limited) return limited;
  try {
    const trending = await getTrendingCards();
    return NextResponse.json(
      { trending },
      { headers: { "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600" } },
    );
  } catch (error) {
    return top10ProviderFailure(
      { trending: [] },
      error,
    );
  }
}
