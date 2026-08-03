import { NextResponse } from "next/server";
import { enforceTop10RateLimit, top10Choice, top10Page, top10ProviderFailure, top10Text, top10Type } from "@/lib/top10/apiResponse";
import { getBooksBySubject, getBookSubjects, getTrendingBooks, searchBooks } from "@/lib/providers/openlibrary/books";

export const runtime = "nodejs";

/**
 * GET /api/books?type=trending&window=daily|weekly|monthly|yearly
 * GET /api/books?type=search&query=...
 * GET /api/books?type=subjects
 * GET /api/books?type=by_subject&subject=...
 *
 * Thin proxy over OpenLibrary — it needs no API key, but every external
 * call still goes through our own route so the client never talks to a
 * third party directly (same pattern as /api/movies).
 */
export async function GET(request) {
  const limited = enforceTop10RateLimit(request);
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const type = top10Type(searchParams, ["trending", "search", "subjects", "by_subject"], "trending");
  const query = top10Text(searchParams, "query");
  const window = top10Type(searchParams, ["daily", "weekly", "monthly", "yearly"], "daily", "window");
  const subject = top10Choice(searchParams, "subject", getBookSubjects().map(({ id }) => id));
  const page = top10Page(searchParams);

  try {
    if (type === "subjects") {
      return NextResponse.json(
        { subjects: getBookSubjects() },
        { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
      );
    }

    // by_subject/search are paginated (infinite scroll) and already come
    // back as { books, hasMore }; trending is not.
    const { books, hasMore } =
      type === "search"
        ? await searchBooks(query, { page })
        : type === "by_subject"
          ? await getBooksBySubject(subject, { page })
          : { books: await getTrendingBooks({ window }), hasMore: false };

    return NextResponse.json(
      { books, hasMore, page, type, query, window, subject },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    return top10ProviderFailure(
      { books: [], subjects: [], hasMore: false, page, type, query, window, subject },
      error,
    );
  }
}
