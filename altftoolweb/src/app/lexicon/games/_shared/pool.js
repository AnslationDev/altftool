import { getCollection } from "@altftool/core/lexicon/corpus";

/*
 * Where the games get their words. Server only.
 *
 * Every game reads collection files rather than letter indexes. Three reasons:
 * a collection file is capped at 600 rows so the read is bounded no matter how
 * big the underlying set is; the rows are already ordered by commonness, so the
 * candidates are words a player has actually met; and a collection is a
 * published surface, which means a game and the collection page behind it can
 * never disagree about what counts as an animal.
 */

/** Read several collections at once and return one deduped list of compact rows. */
export async function collectionRows(slugs) {
  const files = await Promise.all(slugs.map((slug) => getCollection(slug)));

  const seen = new Map();
  for (const rows of files) {
    if (!rows) continue;
    for (const row of rows) if (!seen.has(row.s)) seen.set(row.s, row);
  }
  return [...seen.values()];
}

/**
 * A single plain word, spelled the way it is played.
 *
 * Phrases, hyphenated forms and anything with a digit are out of every game:
 * "jack-in-the-pulpit" cannot be scrambled into a puzzle a reader can solve,
 * and a syllable count for a four-word phrase is a different question from the
 * one these games ask.
 */
export const isPlainWord = (row, { min = 3, max = 12 } = {}) =>
  !row.ph && row.ix !== undefined && new RegExp(`^[a-z]{${min},${max}}$`).test(row.w);

/**
 * Reject a gloss that gives its own word away.
 *
 * WordNet defines "abandonment" as "the act of abandoning" often enough that
 * this is the single most valuable filter in the file — without it a third of
 * the scramble hints solve the puzzle outright.
 */
export function glossHidesWord(gloss, word) {
  if (!gloss || !word) return false;
  const stem = word.length > 5 ? word.slice(0, Math.max(4, word.length - 3)) : word;
  return !new RegExp(`\\b${stem}`, "i").test(gloss);
}

/**
 * A gloss that reads as a complete sentence of definition.
 *
 * Compact rows carry a truncated gloss ending in an ellipsis. Those are fine on
 * a card, where the full text is one click away, and useless as a multiple
 * choice option — an option that trails off is visibly the odd one out for a
 * reason that has nothing to do with meaning.
 */
export const isWholeGloss = (gloss, { min = 20, max = 150 } = {}) =>
  typeof gloss === "string" &&
  !gloss.endsWith("…") &&
  gloss.length >= min &&
  gloss.length <= max;
