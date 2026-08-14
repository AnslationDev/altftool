/*
 * Standard English Scrabble tile values.
 *
 * Pure data plus one pure function, kept in its own module so both the server
 * (which scores results) and the client (which prints the table on the page)
 * can import it. Everything else in the word engine touches the filesystem and
 * would drag node:fs into the browser bundle.
 *
 * These are the values printed on an English-language Scrabble set — the same
 * distribution Alfred Butts derived from front-page letter counts in the New
 * York Times in 1938. Other language editions use different values, and the
 * pages that show this table say so.
 */

export const TILE_VALUES = Object.freeze({
  a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1,
  j: 8, k: 5, l: 1, m: 3, n: 1, o: 1, p: 3, q: 10, r: 1,
  s: 1, t: 1, u: 1, v: 4, w: 4, x: 8, y: 4, z: 10,
});

/** The table as rows, grouped by value — how a player actually reads it. */
export const TILE_ROWS = Object.freeze([
  { value: 1, letters: "A E I O U L N S T R" },
  { value: 2, letters: "D G" },
  { value: 3, letters: "B C M P" },
  { value: 4, letters: "F H V W Y" },
  { value: 5, letters: "K" },
  { value: 8, letters: "J X" },
  { value: 10, letters: "Q Z" },
]);

/**
 * Face value of a word, with no board multipliers.
 *
 * A real board doubles and triples letters and words, so this is the floor of
 * what a word is worth, not a prediction of the score you will take. Blank
 * tiles are worth nothing, which is why the pages that show a score also say
 * to subtract the value of any letter a blank stood in for.
 */
export function scoreWord(word) {
  let total = 0;
  const clean = String(word).toLowerCase();
  for (let index = 0; index < clean.length; index += 1) {
    total += TILE_VALUES[clean[index]] || 0;
  }
  return total;
}
