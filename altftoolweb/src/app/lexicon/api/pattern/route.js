import { MAX_PATTERN_LENGTH, searchPattern } from "@/app/lexicon/tools/_shared/wordbank";

/*
 * The crossword pattern matcher behind /lexicon/tools/word-pattern-search.
 *
 * `?` one letter · `*` any run · `@` any vowel · `#` any consonant.
 *
 * The pattern is compiled to a regular expression server-side, where the
 * compiler can drop every character that is not one of those four tokens or a
 * letter a–z. Nothing a reader types can reach the regex engine as a
 * metacharacter, and nothing has to be escaped, because nothing that would
 * need escaping survives the parse.
 *
 * A pattern that starts with a literal letter is scanned inside that letter's
 * block only — `st??e` reads 15,854 entries instead of 77,636.
 */
export const revalidate = 86400;

/** Three hundred rows is roughly two screens of grid. Past that the reader is
    scrolling rather than solving, and should narrow the pattern instead. */
const DEFAULT_LIMIT = 300;
const MAX_LIMIT = 300;

const emptyResult = (pattern = "") => ({
  pattern,
  total: 0,
  shown: 0,
  scanned: 0,
  capped: false,
  limit: DEFAULT_LIMIT,
  words: [],
  minLength: 0,
  maxLength: 0,
});

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const raw = (params.get("q") || params.get("pattern") || "").slice(0, MAX_PATTERN_LENGTH * 2);

  const requested = Number.parseInt(params.get("limit") || "", 10);
  const limit = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  // A pattern of pure wildcards matches most of the dictionary and tells the
  // reader nothing. At least one token, and at least one that is not `*`.
  const cleaned = raw.toLowerCase().replace(/[^a-z?*@#]/g, "");
  if (!cleaned || !/[a-z?@#]/.test(cleaned)) {
    return Response.json({ ...emptyResult(cleaned), limit });
  }

  try {
    const result = await searchPattern(cleaned, { limit });
    return Response.json(
      { ...result, limit },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=604800",
        },
      },
    );
  } catch {
    return Response.json({ ...emptyResult(cleaned), limit });
  }
}
