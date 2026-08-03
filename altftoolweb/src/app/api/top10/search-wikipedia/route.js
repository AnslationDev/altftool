import { NextResponse } from "next/server";
import { enforceTop10RateLimit, top10Page, top10ProviderFailure, top10Text } from "@/lib/top10/apiResponse";
import { searchWikipediaTopics } from "@/lib/providers/wikipedia/general";

export const runtime = "nodejs";

/**
 * GET /api/top10/search-wikipedia?query=...&page=...
 *
 * The global search catch-all — used by the client ONLY after every
 * wired product's own search has already come back empty for a query.
 * Backed by Wikipedia's own free-text search (keyless), so it can answer
 * genuinely arbitrary keywords with real data, not just the site's
 * pre-wired categories.
 */
export async function GET(request) {
  const limited = enforceTop10RateLimit(request);
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const query = top10Text(searchParams, "query");
  const page = top10Page(searchParams);

  try {
    const { results, hasMore } = await searchWikipediaTopics(query, { page });
    return NextResponse.json(
      { results, hasMore, page, query },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    return top10ProviderFailure(
      { results: [], hasMore: false, page, query },
      error,
    );
  }
}
