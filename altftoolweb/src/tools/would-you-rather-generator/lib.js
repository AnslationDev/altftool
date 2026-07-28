/**
 * Would You Rather Generator — deterministic dilemma picker.
 *
 * A "would you rather" question is a forced-choice dilemma: two options, no
 * opt-out. This module holds a hand-written bank of such pairs grouped by
 * category and difficulty, plus a seeded shuffle so the same seed always
 * produces the same run of questions (shareable, reproducible, testable).
 *
 * Randomness: mulberry32, a 32-bit counter-based PRNG. It is fully
 * deterministic from its seed and has a period of 2^32, which is far more than
 * this bank needs. Deck order is produced with a Fisher–Yates shuffle driven by
 * that PRNG, so every question appears exactly once before any repeats — a
 * plain "pick a random index" approach repeats roughly 1 question in every
 * sqrt(n) draws, which players notice immediately.
 *
 * Pure module: no React, no DOM, no clock reads. Callers pass the seed in.
 */

/** Difficulty bands. "easy" is light and silly, "hard" forces a real trade-off. */
export const DIFFICULTIES = ["easy", "medium", "hard"];

/** Category ids used for filtering. `all` is handled by the picker, not stored. */
export const CATEGORIES = [
  { id: "classic", label: "Classic" },
  { id: "food", label: "Food & Drink" },
  { id: "superpowers", label: "Superpowers" },
  { id: "travel", label: "Travel" },
  { id: "work", label: "Work & Money" },
  { id: "tech", label: "Tech & Internet" },
  { id: "gross", label: "Silly & Gross" },
  { id: "deep", label: "Deep & Philosophical" },
];

/**
 * The dilemma bank. Each entry is [categoryId, difficulty, optionA, optionB].
 * Kept as tuples so the file stays compact and easy to extend.
 */
const BANK = [
  // Classic
  ["classic", "easy", "always be 10 minutes late", "always be 20 minutes early"],
  ["classic", "easy", "never have to do laundry again", "never have to wash dishes again"],
  ["classic", "medium", "lose all your old photos", "lose all your old messages"],
  ["classic", "medium", "be the funniest person in the room", "be the smartest person in the room"],
  ["classic", "hard", "know when you will die", "know how you will die"],
  ["classic", "medium", "have unlimited free time", "have unlimited money but no free time"],
  ["classic", "easy", "always have a song stuck in your head", "always have an itch you cannot reach"],
  ["classic", "hard", "relive the same great day forever", "get a new average day every day"],

  // Food & Drink
  ["food", "easy", "give up cheese for a year", "give up chocolate for a year"],
  ["food", "easy", "only ever eat breakfast food", "only ever eat dinner food"],
  ["food", "medium", "eat your favourite meal every day for a year", "never eat it again"],
  ["food", "easy", "have unlimited street food", "have unlimited restaurant meals"],
  ["food", "medium", "lose your sense of taste", "lose your sense of smell"],
  ["food", "easy", "drink only tea for life", "drink only coffee for life"],
  ["food", "hard", "know exactly how every dish is made but never cook", "cook brilliantly but never taste your own food"],

  // Superpowers
  ["superpowers", "easy", "be able to fly", "be able to turn invisible"],
  ["superpowers", "medium", "read minds but never turn it off", "see one week into the future once a month"],
  ["superpowers", "easy", "teleport anywhere instantly", "pause time for ten minutes a day"],
  ["superpowers", "hard", "be immortal but alone", "live 80 good years surrounded by people"],
  ["superpowers", "medium", "speak every human language", "speak to every animal"],
  ["superpowers", "medium", "never need sleep", "never need food"],
  ["superpowers", "hard", "undo one decision from your past", "see the outcome of one future decision"],

  // Travel
  ["travel", "easy", "travel to 30 countries but never leave the cities", "know one country completely, village by village"],
  ["travel", "medium", "always fly economy but travel free", "always fly business but pay full price"],
  ["travel", "easy", "spend a year on a beach", "spend a year in the mountains"],
  ["travel", "medium", "have no phone signal while travelling", "have no camera while travelling"],
  ["travel", "hard", "move abroad permanently for a dream job", "stay home near everyone you love"],
  ["travel", "easy", "take a 30-hour train ride", "take three connecting flights"],

  // Work & Money
  ["work", "medium", "work four days a week for 80% pay", "work five days for full pay"],
  ["work", "hard", "have a job you love that pays poorly", "have a job you hate that pays brilliantly"],
  ["work", "easy", "work from home forever", "work from an office forever"],
  ["work", "medium", "get a big bonus once", "get a small raise every year"],
  ["work", "hard", "be famous in your field but never rich", "be rich but completely unknown"],
  ["work", "medium", "have a boss who ignores you", "have a boss who watches everything"],
  ["work", "easy", "never attend another meeting", "never write another email"],

  // Tech & Internet
  ["tech", "easy", "lose access to all streaming services", "lose access to all social media"],
  ["tech", "medium", "have your search history made public", "have your bank balance made public"],
  ["tech", "easy", "use a phone with no camera", "use a phone with no browser"],
  ["tech", "medium", "have unlimited storage but slow internet", "have blazing internet but 8 GB of storage"],
  ["tech", "hard", "have every app free but ad-supported forever", "pay for every app and see no ads"],
  ["tech", "easy", "go back to a keypad phone for a month", "go without headphones for a month"],
  ["tech", "medium", "lose every password you have saved", "lose every contact you have saved"],

  // Silly & Gross
  ["gross", "easy", "sneeze every time you laugh", "hiccup every time you speak"],
  ["gross", "easy", "have hands for feet", "have feet for hands"],
  ["gross", "medium", "smell like garlic all the time", "hear a faint kazoo all the time"],
  ["gross", "easy", "wear shoes two sizes too small", "wear a jumper two sizes too big"],
  ["gross", "medium", "have your thoughts narrated aloud", "have your dreams broadcast on TV"],
  ["gross", "easy", "always speak in rhyme", "always sing instead of speaking"],

  // Deep & Philosophical
  ["deep", "hard", "be deeply understood by one person", "be liked by everyone shallowly"],
  ["deep", "hard", "always tell the truth", "always hear the truth"],
  ["deep", "medium", "forget your worst memory", "keep it and remember why it mattered"],
  ["deep", "hard", "have a life of comfort with no purpose", "a life of purpose with constant struggle"],
  ["deep", "medium", "be remembered for one great thing", "be quietly useful to hundreds of people"],
  ["deep", "hard", "know every answer but never be asked", "be asked everything but know nothing"],
  ["deep", "medium", "start over at 18 with what you know now", "keep your life exactly as it is"],
];

/** The bank as objects, built once. Ids are stable positions in BANK. */
export const QUESTIONS = BANK.map(([category, difficulty, a, b], index) => ({
  id: index,
  category,
  difficulty,
  optionA: a,
  optionB: b,
}));

/** Total dilemmas available. */
export const TOTAL_QUESTIONS = QUESTIONS.length;

/**
 * mulberry32 PRNG — deterministic, returns a float in [0, 1).
 * Constants are the published mulberry32 values (Tommy Ettinger, 2017).
 */
export function mulberry32(seed) {
  let state = Math.imul(seed >>> 0, 1) >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turn any string into a 32-bit seed (FNV-1a, offset basis 2166136261). */
export function seedFromString(text) {
  let hash = 2166136261 >>> 0;
  const str = String(text == null ? "" : text);
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

/** Fisher–Yates shuffle driven by a supplied PRNG. Does not mutate `items`. */
export function shuffle(items, rand) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const swap = out[i];
    out[i] = out[j];
    out[j] = swap;
  }
  return out;
}

/**
 * Filter the bank.
 * @param {{category?:string, difficulty?:string}} filters  "all" means no filter
 * @returns {Array} matching questions
 */
export function filterQuestions({ category = "all", difficulty = "all" } = {}) {
  return QUESTIONS.filter(
    (question) =>
      (category === "all" || question.category === category) &&
      (difficulty === "all" || question.difficulty === difficulty),
  );
}

/**
 * Build a shuffled deck for a seed and filter set.
 *
 * @param {{seed?:string|number, category?:string, difficulty?:string}} options
 * @returns {{deck:Array, size:number}|{error:string}}
 */
export function buildDeck({ seed = 0, category = "all", difficulty = "all" } = {}) {
  if (category !== "all" && !CATEGORIES.some((item) => item.id === category)) {
    return { error: "Pick a category from the list." };
  }
  if (difficulty !== "all" && !DIFFICULTIES.includes(difficulty)) {
    return { error: "Pick a difficulty from the list." };
  }

  const pool = filterQuestions({ category, difficulty });
  if (pool.length === 0) {
    return { error: "No dilemmas match that combination — try a different category or difficulty." };
  }

  const numericSeed = typeof seed === "number" && Number.isFinite(seed) ? seed >>> 0 : seedFromString(seed);
  const deck = shuffle(pool, mulberry32(numericSeed));
  return { deck, size: deck.length };
}

/**
 * Pick the question at a position in the deck. Positions wrap, so the deck
 * loops forever without ever repeating inside one pass.
 *
 * @returns {{question:object, position:number, size:number}|{error:string}}
 */
export function drawQuestion({ seed = 0, category = "all", difficulty = "all", index = 0 } = {}) {
  const built = buildDeck({ seed, category, difficulty });
  if (built.error) return { error: built.error };

  if (typeof index !== "number" || !Number.isFinite(index)) {
    return { error: "The question number must be a whole number." };
  }
  const size = built.size;
  const position = ((Math.trunc(index) % size) + size) % size;
  return { question: built.deck[position], position, size };
}

/** Render one dilemma as shareable plain text. */
export function formatQuestion(question) {
  if (!question || !question.optionA || !question.optionB) return "";
  return `Would you rather ${question.optionA}, or ${question.optionB}?`;
}

/**
 * Tally a running vote and return whole-number percentages that add to 100.
 * Uses largest-remainder rounding so 1 vs 2 shows 33% / 67%, never 33% / 67%
 * plus a stray point.
 *
 * @returns {{total:number, percentA:number, percentB:number}|{error:string}}
 */
export function voteSplit(votesA, votesB) {
  const a = Number(votesA);
  const b = Number(votesB);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return { error: "Vote counts must be numbers." };
  if (a < 0 || b < 0) return { error: "Vote counts cannot be negative." };

  const total = a + b;
  if (total === 0) return { total: 0, percentA: 0, percentB: 0 };

  const rawA = (a / total) * 100;
  const floorA = Math.floor(rawA);
  // Give the leftover point to whichever side has the larger fractional part.
  const percentA = rawA - floorA >= 0.5 ? Math.min(100, floorA + 1) : floorA;
  return { total, percentA, percentB: 100 - percentA };
}
