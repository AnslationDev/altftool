import { NextResponse } from "next/server";
import { enforceTop10RateLimit, top10Choice, top10Page, top10ProviderFailure, top10Text, top10Type } from "@/lib/top10/apiResponse";
import { getMusicByGenre, getMusicGenres, searchMusic } from "@/lib/providers/itunes/music";

export const runtime = "nodejs";

/**
 * GET /api/music?type=genres
 * GET /api/music?type=by_genre&genreId=...&page=...
 * GET /api/music?type=search&query=...&page=...
 *
 * Thin proxy over Apple's iTunes APIs — same shape as /api/movies and
 * /api/books, so client code never talks to a third party directly.
 * (Originally built on Deezer, but Deezer's API withholds track data
 * from this server's network/region — confirmed by testing its raw API
 * directly, not something fixable in our own code — so this now uses
 * Apple's iTunes Search + charts RSS, which isn't geo-restricted here.)
 */
export async function GET(request) {
  const limited = enforceTop10RateLimit(request);
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const type = top10Type(searchParams, ["genres", "by_genre", "search"], "genres");
  const query = top10Text(searchParams, "query");
  const genreId = top10Choice(searchParams, "genreId", getMusicGenres().map(({ id }) => id));
  const page = top10Page(searchParams);

  try {
    if (type === "genres") {
      const genres = await getMusicGenres();
      return NextResponse.json(
        { genres },
        { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
      );
    }

    const { music, hasMore } =
      type === "search" ? await searchMusic(query, { page }) : await getMusicByGenre(genreId, { page });

    return NextResponse.json(
      { music, hasMore, page, type, query, genreId },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    return top10ProviderFailure(
      { music: [], genres: [], hasMore: false, page, type, query, genreId },
      error,
    );
  }
}
