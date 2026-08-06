import { countSyllables, slugifyWord } from "@altftool/core/lexicon";
import { getRhymes, getWord, resolveWord } from "@altftool/core/lexicon/corpus";

import { getCompactRows } from "@/app/lexicon/tools/_shared/wordbank";

/*
 * The rhyme lookup behind /lexicon/tools/rhyme-finder.
 *
 * Rhymes are matched on the phonemes from the last stressed vowel onward, from
 * the CMU Pronouncing Dictionary — which is why this has to be a server route.
 * The rhyme key of a word is a property of how it is said, and there is no way
 * to compute it in the browser from the spelling: `through` rhymes with `blue`
 * and `rough` does not rhyme with `though`.
 *
 * Enrichment (display form, commonness, syllable count) comes from the compact
 * letter indexes rather than from full entry records. A rhyme set lands in
 * every letter of the alphabet, so reading 26 already-resident index files
 * costs a fraction of reading one entry bucket per answer.
 */
export const revalidate = 86400;

const DEFAULT_LIMIT = 300;
const MAX_LIMIT = 400;

const emptyResult = (query = "") => ({
  query,
  found: false,
  word: null,
  total: 0,
  shown: 0,
  capped: false,
  limit: DEFAULT_LIMIT,
  groups: [],
});

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get("word") || params.get("q") || "").slice(0, 64);

  const requested = Number.parseInt(params.get("limit") || "", 10);
  const limit = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const slug = slugifyWord(query);
  if (!slug) return Response.json({ ...emptyResult(query), limit });

  try {
    // getWord is the direct hit; resolveWord picks up inflections and irregular
    // forms, so "ran" answers as "run" instead of as nothing at all.
    const direct = await getWord(slug);
    const resolved = direct ? { entry: direct, via: null } : await resolveWord(slug);

    if (!resolved?.entry) {
      return Response.json(
        { ...emptyResult(query), limit },
        { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=604800" } },
      );
    }

    const { entry, via } = resolved;
    const slugs = await getRhymes(entry);
    const total = slugs.length;
    const capped = total > limit;
    const visible = capped ? slugs.slice(0, limit) : slugs;

    const rows = await getCompactRows(visible);
    const words = visible.map((rhymeSlug) => {
      const row = rows.get(rhymeSlug);
      return {
        s: rhymeSlug,
        w: row?.w || rhymeSlug.replace(/-/g, " "),
        c: row?.c || 1,
        y: row?.y || countSyllables(rhymeSlug),
        ph: Boolean(row?.ph),
      };
    });

    // Commonest first inside each syllable band: a rhyme you have to look up
    // is not a rhyme you can use.
    words.sort((a, b) => b.c - a.c || (a.w < b.w ? -1 : a.w > b.w ? 1 : 0));

    const bands = new Map();
    for (const word of words) {
      const key = word.y || 1;
      if (!bands.has(key)) bands.set(key, []);
      bands.get(key).push(word);
    }

    const groups = [...bands.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([key, list]) => ({
        key,
        label: `${key} ${key === 1 ? "syllable" : "syllables"}`,
        words: list,
      }));

    return Response.json(
      {
        query,
        found: true,
        word: {
          s: entry.s,
          w: entry.w,
          sy: entry.sy || 0,
          pt: entry.pt || [],
          st: entry.st || 0,
          ip: entry.ip || "",
          rs: entry.rs || "",
          rk: entry.rk || "",
          pd: Boolean(entry.pd),
          via: via ? { from: via.from, kind: via.kind } : null,
        },
        total,
        shown: words.length,
        capped,
        limit,
        groups,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=604800",
        },
      },
    );
  } catch {
    return Response.json({ ...emptyResult(query), limit });
  }
}
