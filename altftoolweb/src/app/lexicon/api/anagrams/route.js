import { MAX_TILES, solveLetters } from "@/app/lexicon/tools/_shared/wordbank";

/*
 * The letter solver behind /lexicon/tools/anagram-solver and
 * /lexicon/tools/word-unscrambler.
 *
 * Both tools ask the same question of the same index and differ by one flag:
 * `subset=1` drops the rule that every letter must be used. Splitting them into
 * two routes would mean building the 77,636-entry index twice per process.
 *
 * Server-only by necessity, not by preference — the index it reads is 26
 * gzipped letter files, and shipping any useful part of it to the browser
 * would cost several megabytes on first paint.
 *
 * Cached hard: the corpus is immutable per deploy, so the anagrams of a given
 * rack cannot change between builds.
 */
export const revalidate = 86400;

const DEFAULT_LIMIT = 400;
const MAX_LIMIT = 600;

const emptyResult = (letters = "") => ({
  letters,
  blanks: 0,
  tiles: 0,
  subset: false,
  total: 0,
  shown: 0,
  capped: false,
  limit: DEFAULT_LIMIT,
  groups: [],
  truncated: false,
  ignored: 0,
});

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const letters = params.get("letters") || "";
  const subset = params.get("subset") === "1" || params.get("subset") === "true";

  const requested = Number.parseInt(params.get("limit") || "", 10);
  const limit = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  // Two letters is the shortest entry in the corpus, so anything shorter has
  // no answer to give. Answering with an empty set beats a 400 the tool would
  // only have to translate back into "keep typing".
  if (letters.replace(/[^a-zA-Z?*_]/g, "").length < 2) {
    return Response.json({ ...emptyResult(letters.toLowerCase()), subset, limit });
  }

  try {
    const result = await solveLetters(letters, { subset, limit });
    return Response.json(
      { ...result, subset, limit, maxTiles: MAX_TILES },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=604800",
        },
      },
    );
  } catch {
    // A solver is a convenience. A corpus read failure must surface as "no
    // answers", which the tool already knows how to render, rather than as an
    // error status the tool would have to grow a second code path for.
    return Response.json({ ...emptyResult(letters.toLowerCase()), subset, limit });
  }
}
