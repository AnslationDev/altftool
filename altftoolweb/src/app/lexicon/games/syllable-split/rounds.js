import { getWords } from "@altftool/core/lexicon/corpus";
import { byHash } from "../_shared/rng";
import { collectionRows, isPlainWord } from "../_shared/pool";

/*
 * Round construction for the syllable game.
 *
 * This is the one game that is allowed to be strict about its data, because it
 * is the playable form of the thing the whole dictionary is built around. Every
 * word here has a real entry in the CMU Pronouncing Dictionary: the syllable
 * count is recorded, not counted off the spelling, and the stress position is
 * read rather than inferred. Entries carrying `pd` — the flag that means the
 * split was derived from spelling because CMU has never heard of the word — are
 * thrown out. Asking a player to guess a number we ourselves guessed would make
 * the wrong answer indefensible.
 */

export const MAX_SYLLABLES = 6;
export const PER_SYLLABLE = 5;
export const ROUND_COUNT = MAX_SYLLABLES * PER_SYLLABLE;

/** How many candidates to pull per syllable count before the CMU filter thins them. */
const CANDIDATES_PER_SYLLABLE = 34;

/*
 * Sound-shaped collections alongside the everyday ones.
 *
 * Left to the everyday collections alone the draw is nearly all one- and
 * two-syllable words, because that is what English mostly is. The sound
 * collections are what make a six-button game worth six buttons.
 */
export const SOURCE_COLLECTIONS = [
  "core-english",
  "everyday-words",
  "hard-to-say",
  "stress-on-last",
  "one-syllable",
  "five-syllable-words",
  "spelled-nothing-like-said",
  "advanced-vocabulary",
  "concrete-nouns",
];

export const MIN_BAND = 3;

/*
 * Suffixes that fix English stress.
 *
 * Each rule predicts an index counted from the end of the word. A rule is only
 * ever printed when its prediction matches the stress CMU actually recorded —
 * so a reader is never told a rule that the word in front of them breaks. About
 * one word in two hundred here breaks one, and those quietly fall through to
 * the positional note instead.
 */
const STRESS_RULES = [
  {
    pattern: /(?:tion|sion|cion)$/,
    at: (count) => count - 2,
    note: "Words ending -tion, -sion and -cion always take the stress onto the syllable directly in front of the ending, however long the stem in front of it gets.",
  },
  {
    pattern: /(?:cian|tial|cial|cious|tious|geous|gious)$/,
    at: (count) => count - 2,
    note: "Endings spelled -cian, -tial and -cious behave the same way -tion does: the stress lands on the syllable immediately before them.",
  },
  {
    pattern: /ical$/,
    at: (count) => count - 3,
    note: "The ending -ical pulls the stress two syllables back from itself, one further back than bare -ic does.",
  },
  {
    pattern: /ic$/,
    at: (count) => count - 2,
    note: "The ending -ic takes the stress onto the syllable directly before it, wherever the root would have put it on its own.",
  },
  {
    pattern: /(?:ity|ety|ify|ography|graphy|ology|ogy|onomy|nomy|cracy|logy|metry|pathy|scopy)$/,
    at: (count) => count - 3,
    note: "Endings like -ity, -ology and -graphy fix the stress three syllables from the end, no matter how the stem was stressed before the ending was added.",
  },
  {
    pattern: /(?:eer|ese|ette|esque|oon)$/,
    at: (count) => count - 1,
    note: "Endings borrowed intact from French — -eer, -ette, -esque, -oon — keep the stress on themselves, which is why they sound foreign in an English sentence.",
  },
];

/**
 * One sentence saying why the stress sits where it does.
 *
 * A suffix rule where one holds; otherwise a plain description of the position.
 * The positional sentences that make a claim about English (front-stressed
 * nouns, back-stressed verbs) are only used when the word's part of speech
 * actually supports the claim.
 */
function stressNote(entry) {
  const parts = entry.pt;
  const count = parts.length;
  const stress = entry.st;

  if (count === 1) return "One syllable, so the stress has nowhere else to go.";

  for (const rule of STRESS_RULES) {
    if (rule.pattern.test(entry.w) && rule.at(count) === stress) return rule.note;
  }

  const positions = entry.p || [];
  if (count === 2 && stress === 0 && (positions.includes("n") || positions.includes("a"))) {
    return "Two syllables with the stress at the front, which is where English puts it for most nouns and adjectives of this length.";
  }
  if (count === 2 && stress === 1 && positions.includes("v")) {
    return "Two syllables with the stress at the back — the pattern English uses for verbs, and the only difference between a noun like CON-duct and the verb con-DUCT.";
  }
  if (stress === 0) {
    return `The stress opens the word: syllable 1 of ${count}, with the rest falling away from it.`;
  }
  if (stress === count - 1) {
    return `The stress lands on the final syllable, ${stress + 1} of ${count}.`;
  }
  return `The stress sits in the middle, on syllable ${stress + 1} of ${count}.`;
}

export async function buildSyllableRounds() {
  const rows = await collectionRows(SOURCE_COLLECTIONS);

  const pool = rows.filter(
    (row) =>
      isPlainWord(row, { min: 2, max: 14 }) &&
      row.c >= MIN_BAND &&
      row.y >= 1 &&
      row.y <= MAX_SYLLABLES,
  );

  // Draw evenly across the six counts, or the game becomes "press 2".
  const candidates = [];
  for (let count = 1; count <= MAX_SYLLABLES; count += 1) {
    candidates.push(
      ...byHash(
        pool.filter((row) => row.y === count),
        (row) => row.s,
        `syllables:${count}`,
      ).slice(0, CANDIDATES_PER_SYLLABLE),
    );
  }

  const entries = await getWords(candidates.map((row) => row.s));

  const usable = entries.filter(
    (entry) =>
      // `pd` set means the split came from spelling, not from CMU.
      !entry.pd &&
      entry.ip &&
      entry.rs &&
      Array.isArray(entry.pt) &&
      entry.pt.length === entry.sy &&
      entry.sy >= 1 &&
      entry.sy <= MAX_SYLLABLES &&
      entry.st >= 0 &&
      entry.st < entry.pt.length,
  );

  const taken = new Map();
  const rounds = [];
  for (const entry of byHash(usable, (item) => item.s, "syllable-round")) {
    const used = taken.get(entry.sy) || 0;
    if (used >= PER_SYLLABLE) continue;
    taken.set(entry.sy, used + 1);

    rounds.push({
      slug: entry.s,
      word: entry.w,
      parts: entry.pt,
      stress: entry.st,
      ipa: entry.ip,
      respelling: entry.rs,
      count: entry.sy,
      band: entry.c,
      pos: (entry.p || []).join(""),
      note: stressNote(entry),
    });
  }

  return {
    rounds,
    poolSize: pool.length,
    checked: entries.length,
    withPronunciation: usable.length,
  };
}
