import { byHash, hashString, seededShuffle } from "../_shared/rng";
import { collectionRows, glossHidesWord, isPlainWord, isWholeGloss } from "../_shared/pool";

/*
 * Round construction for the definition quiz.
 *
 * The interesting half of this game is the wrong answers. Three made-up
 * definitions are trivially spotted — they read wrong, because nobody writes
 * lexicographer's prose by accident. So the distractors here are real WordNet
 * definitions of real entries, and they are drawn from the target's own part of
 * speech, which removes the giveaway that a noun's definition and a verb's
 * definition do not even have the same grammatical shape.
 */

export const ROUND_COUNT = 24;
export const OPTION_COUNT = 4;

export const SOURCE_COLLECTIONS = [
  "core-english",
  "everyday-words",
  "adjectives-worth-knowing",
  "verbs-worth-knowing",
  "concrete-nouns",
  "every-verb",
  "adverbs",
  "advanced-vocabulary",
];

export const MIN_BAND = 3;

/** A part of speech needs a deep bench before it can supply plausible distractors. */
const MIN_POS_GROUP = 40;

export async function buildDefinitionRounds() {
  const rows = await collectionRows(SOURCE_COLLECTIONS);

  const pool = rows.filter(
    (row) =>
      isPlainWord(row, { min: 3, max: 13 }) &&
      row.c >= MIN_BAND &&
      // One part of speech only. A word that is both a noun and a verb has a
      // first sense that may not be the one the reader thought of, and the
      // round then punishes a correct instinct.
      row.p?.length === 1 &&
      isWholeGloss(row.g, { min: 22, max: 118 }) &&
      glossHidesWord(row.g, row.w),
  );

  const byPos = new Map();
  for (const row of pool) {
    if (!byPos.has(row.p)) byPos.set(row.p, []);
    byPos.get(row.p).push(row);
  }

  const targets = byHash(
    pool.filter((row) => byPos.get(row.p).length >= MIN_POS_GROUP),
    (row) => row.s,
    "define",
  );

  const rounds = [];
  for (const target of targets) {
    if (rounds.length >= ROUND_COUNT) break;

    // Re-ordered per target, so two rounds in the same part of speech never
    // draw the same three distractors.
    const siblings = byHash(byPos.get(target.p), (row) => row.s, `distract:${target.s}`);

    const distractors = [];
    for (const sibling of siblings) {
      if (distractors.length === OPTION_COUNT - 1) break;
      if (sibling.s === target.s) continue;
      if (sibling.g === target.g) continue;
      // A distractor that mentions the target word is not a wrong answer, it
      // is a second correct one.
      if (!glossHidesWord(sibling.g, target.w)) continue;
      if (distractors.some((chosen) => chosen.g === sibling.g)) continue;
      distractors.push(sibling);
    }
    if (distractors.length < OPTION_COUNT - 1) continue;

    const options = seededShuffle(
      [
        { gloss: target.g, correct: true },
        ...distractors.map((row) => ({ gloss: row.g, correct: false })),
      ],
      hashString(`options:${target.s}`),
    );

    rounds.push({
      slug: target.s,
      word: target.w,
      pos: target.p,
      band: target.c,
      syllables: target.y || 0,
      options: options.map((option) => option.gloss),
      answer: options.findIndex((option) => option.correct),
    });
  }

  return { rounds, poolSize: pool.length, posGroups: [...byPos.entries()] };
}
