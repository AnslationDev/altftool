import { MAX_TILES, solveLetters } from "@/app/lexicon/tools/_shared/wordbank";

/*
 * The Scrabble rack solver behind /lexicon/tools/words-from-letters.
 *
 * Same index and same subset rule as /lexicon/api/anagrams; what differs is
 * the ordering, and the ordering is the whole point of the tool. A player with
 * seven tiles does not want the longest word, they want the one worth the most,
 * and those are frequently not the same word — QI is worth eleven from two
 * tiles, RETAINS is worth seven from all of them.
 *
 * Scores are face values with no board multipliers, and a word played through
 * a blank is scored with that letter at zero, because that is what the rules
 * say a blank is worth.
 */
export const revalidate = 86400;

const DEFAULT_LIMIT = 300;
const MAX_LIMIT = 500;

const emptyResult = (letters = "") => ({
  letters,
  blanks: 0,
  tiles: 0,
  total: 0,
  shown: 0,
  capped: false,
  limit: DEFAULT_LIMIT,
  groups: [],
  truncated: false,
  ignored: 0,
  best: null,
});

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const letters = params.get("letters") || "";

  const requested = Number.parseInt(params.get("limit") || "", 10);
  const limit = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  if (letters.replace(/[^a-zA-Z?*_]/g, "").length < 2) {
    return Response.json({ ...emptyResult(letters.toLowerCase()), limit });
  }

  try {
    const result = await solveLetters(letters, { subset: true, limit, order: "score" });
    // The top row is the answer to the question the player actually asked, so
    // it is lifted out rather than left for the reader to find in the grid.
    const best = result.groups[0]?.words[0] || null;

    return Response.json(
      { ...result, limit, maxTiles: MAX_TILES, best },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=604800",
        },
      },
    );
  } catch {
    return Response.json({ ...emptyResult(letters.toLowerCase()), limit });
  }
}
