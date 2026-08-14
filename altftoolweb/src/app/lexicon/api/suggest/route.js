import { searchWords } from "@altftool/core/lexicon/corpus";

/*
 * Type-ahead for the lookup box.
 *
 * Reads one letter index server-side and returns at most ten rows. The
 * alternative — shipping a 147,000-word index to the browser — costs every
 * visitor several megabytes to save a round trip most of them never make.
 *
 * Cached hard: the corpus is immutable per deploy, so the answer for a given
 * prefix cannot change between builds.
 */
export const revalidate = 86400;

export async function GET(request) {
  const query = new URL(request.url).searchParams.get("q") || "";
  if (query.trim().length < 2) {
    return Response.json({ words: [] });
  }

  try {
    const rows = await searchWords(query, { limit: 10 });
    return Response.json(
      {
        words: rows.map((row) => ({ s: row.s, w: row.w, g: row.g, p: row.p, c: row.c })),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=604800",
        },
      },
    );
  } catch {
    // A suggestion list is a convenience; a corpus read failure must not turn
    // the search box into an error state.
    return Response.json({ words: [] });
  }
}
