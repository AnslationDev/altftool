import { byHash, hashString, seededShuffle } from "../_shared/rng";
import { collectionRows, glossHidesWord, isPlainWord, isWholeGloss } from "../_shared/pool";

/*
 * Round construction for the scramble.
 *
 * Everything a round needs is decided here, on the server, before the page is
 * sent. The browser never asks the corpus a question — it receives thirty
 * finished puzzles and plays them.
 */

export const ROUND_COUNT = 30;

/*
 * Where the words come from.
 *
 * Four learning collections plus the concrete nouns, which between them are the
 * everyday half of the corpus. A scramble drawn from all 147,478 entries would
 * hand a player "scammony" and "pyrophyllite" — solvable only by someone who
 * already knew the answer, which is not a game.
 */
export const SOURCE_COLLECTIONS = [
  "core-english",
  "everyday-words",
  "adjectives-worth-knowing",
  "verbs-worth-knowing",
  "concrete-nouns",
];

/** Bands 3-5: familiar, common, core. Below that a player is guessing blind. */
export const MIN_BAND = 3;
export const MAX_BAND = 5;
export const MIN_LETTERS = 4;
export const MAX_LETTERS = 8;

/**
 * Shuffle a word into something that is not the word.
 *
 * The seed is the slug, so "purpose" scrambles the same way on every build and
 * in every region. The retry loop matters more than it looks: a four-letter
 * word with a repeated letter has few enough permutations that one shuffle in
 * twenty lands back on the original, and a puzzle whose answer is already
 * printed is the kind of bug nobody reports and everybody notices.
 */
function scramble(word, slug) {
  const letters = word.split("");
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const candidate = seededShuffle(letters, hashString(`${slug}:${attempt}`)).join("");
    if (candidate !== word) return candidate;
  }
  return letters.reverse().join("");
}

export async function buildScrambleRounds() {
  const rows = await collectionRows(SOURCE_COLLECTIONS);

  const pool = rows.filter(
    (row) =>
      isPlainWord(row, { min: MIN_LETTERS, max: MAX_LETTERS }) &&
      row.c >= MIN_BAND &&
      row.c <= MAX_BAND &&
      // A word of one repeated letter cannot be scrambled into a puzzle.
      new Set(row.w).size > 1 &&
      isWholeGloss(row.g, { min: 18, max: 120 }) &&
      glossHidesWord(row.g, row.w),
  );

  const rounds = byHash(pool, (row) => row.s, "scramble")
    .slice(0, ROUND_COUNT)
    .map((row) => ({
      slug: row.s,
      word: row.w,
      gloss: row.g,
      pos: row.p || "",
      band: row.c,
      scrambled: scramble(row.w, row.s),
    }));

  return { rounds, poolSize: pool.length };
}
