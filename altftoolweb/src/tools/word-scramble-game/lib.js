/**
 * Word Scramble Game — deterministic scrambling, checking and scoring.
 *
 * The whole game is pure: the same seed always produces the same puzzle, so a
 * round can be replayed, shared or tested. Randomness comes from mulberry32, a
 * small well-distributed 32-bit PRNG seeded by an integer the caller supplies,
 * never from Math.random(), and never from the clock.
 *
 * Shuffling is Fisher-Yates: walking from the end of the array, swap each item
 * with a uniformly chosen item at or before it. That is the only shuffle that
 * gives every permutation equal probability; the common "sort by random" trick
 * does not.
 *
 * Scoring:
 *   base points  = letters in the word x 10
 *   time bonus   = round(seconds left / time limit x base x 0.5)
 *   hint penalty = 25 per hint used
 *   round score  = max(0, base + time bonus - hint penalty)
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Points awarded per letter of the answer. */
export const POINTS_PER_LETTER = 10;

/** The time bonus is worth at most half the base points. */
export const TIME_BONUS_SHARE = 0.5;

/** Each hint costs this many points. */
export const HINT_PENALTY = 25;

/** How many attempts the scrambler makes before accepting a weak shuffle. */
export const MAX_SCRAMBLE_ATTEMPTS = 12;

export const DIFFICULTIES = [
  { id: "easy", label: "Easy — 4 to 5 letters", timeLimitSeconds: 45 },
  { id: "medium", label: "Medium — 6 to 7 letters", timeLimitSeconds: 60 },
  { id: "hard", label: "Hard — 8 letters or more", timeLimitSeconds: 90 },
];

/**
 * Word bank. Each entry is a common English word with a short definition used
 * as the hint, and a category so the puzzle can tell you the general area.
 */
export const WORD_BANK = {
  easy: [
    { word: "OCEAN", hint: "A vast body of salt water", category: "Nature" },
    { word: "PIANO", hint: "Keyboard instrument with hammers and strings", category: "Music" },
    { word: "RIVER", hint: "Flowing natural watercourse", category: "Nature" },
    { word: "BREAD", hint: "Baked staple made from flour and water", category: "Food" },
    { word: "CLOCK", hint: "Device that shows the time", category: "Objects" },
    { word: "GHOST", hint: "Apparition of a dead person", category: "Fiction" },
    { word: "PLANT", hint: "Living thing that photosynthesises", category: "Nature" },
    { word: "STORM", hint: "Violent weather with wind and rain", category: "Weather" },
    { word: "TIGER", hint: "Large striped wild cat", category: "Animals" },
    { word: "CHAIR", hint: "Seat with a back, for one person", category: "Objects" },
    { word: "MUSIC", hint: "Organised sound arranged in time", category: "Arts" },
    { word: "NIGHT", hint: "The dark part of a day", category: "Time" },
    { word: "SUGAR", hint: "Sweet crystalline carbohydrate", category: "Food" },
    { word: "TRAIN", hint: "Linked carriages running on rails", category: "Travel" },
    { word: "GLOVE", hint: "Garment worn on the hand", category: "Clothing" },
  ],
  medium: [
    { word: "PLANET", hint: "Body orbiting a star, large enough to be round", category: "Space" },
    { word: "GARDEN", hint: "Cultivated plot beside a house", category: "Nature" },
    { word: "CAMERA", hint: "Device that records images", category: "Technology" },
    { word: "BRIDGE", hint: "Structure carrying a road over a gap", category: "Building" },
    { word: "MARKET", hint: "Place where goods are bought and sold", category: "Business" },
    { word: "SILVER", hint: "Shiny white metal, element number 47", category: "Science" },
    { word: "PUZZLE", hint: "Problem set for amusement", category: "Games" },
    { word: "ORANGE", hint: "Citrus fruit and the colour named after it", category: "Food" },
    { word: "WINTER", hint: "Coldest of the four seasons", category: "Weather" },
    { word: "DOCTOR", hint: "Person qualified to treat illness", category: "People" },
    { word: "ISLAND", hint: "Land surrounded entirely by water", category: "Geography" },
    { word: "CIRCUS", hint: "Travelling show of acrobats and clowns", category: "Entertainment" },
    { word: "HARVEST", hint: "Gathering of ripened crops", category: "Farming" },
    { word: "JOURNEY", hint: "An act of travelling from one place to another", category: "Travel" },
    { word: "LIBRARY", hint: "Building holding a collection of books", category: "Places" },
    { word: "MYSTERY", hint: "Something that is not understood or explained", category: "Fiction" },
    { word: "PICTURE", hint: "A painting, drawing or photograph", category: "Arts" },
    { word: "THUNDER", hint: "The sound that follows lightning", category: "Weather" },
  ],
  hard: [
    { word: "ELEPHANT", hint: "Largest living land animal, with a trunk", category: "Animals" },
    { word: "MOUNTAIN", hint: "Landform rising steeply above its surroundings", category: "Geography" },
    { word: "SANDWICH", hint: "Filling served between two slices of bread", category: "Food" },
    { word: "TELESCOPE", hint: "Instrument for viewing distant objects", category: "Science" },
    { word: "CHOCOLATE", hint: "Sweet made from roasted cacao seeds", category: "Food" },
    { word: "ADVENTURE", hint: "An unusual and exciting experience", category: "Fiction" },
    { word: "BUTTERFLY", hint: "Insect with large scaled wings", category: "Animals" },
    { word: "DICTIONARY", hint: "Book listing words and their meanings", category: "Language" },
    { word: "KNOWLEDGE", hint: "Facts and skills acquired by experience", category: "Learning" },
    { word: "ORCHESTRA", hint: "Large group of instrumental musicians", category: "Music" },
    { word: "PYRAMID", hint: "Monument with a square base and triangular sides", category: "History" },
    { word: "SYMPHONY", hint: "Extended composition for full orchestra", category: "Music" },
    { word: "VOLCANO", hint: "Mountain vent that erupts lava", category: "Geography" },
    { word: "WATERFALL", hint: "River falling from a height", category: "Nature" },
    { word: "LIGHTHOUSE", hint: "Tower with a light that warns ships", category: "Building" },
    { word: "ASTRONOMY", hint: "Study of stars, planets and space", category: "Science" },
  ],
};

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/**
 * mulberry32 — a compact 32-bit PRNG. Returns a function producing numbers in
 * [0, 1). The same seed always produces the same sequence.
 */
export function mulberry32(seed) {
  let a = (Math.floor(seed) || 1) >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle driven by a seeded PRNG. Does not mutate the input. */
export function shuffle(items, seed) {
  if (!Array.isArray(items)) return { error: "Nothing to shuffle." };
  const random = mulberry32(seed);
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const swap = out[i];
    out[i] = out[j];
    out[j] = swap;
  }
  return { items: out };
}

/**
 * Scramble a word so the letters are in a different order than the original.
 * Words made of one repeated letter cannot be scrambled and are returned as-is.
 *
 * @param {string} word
 * @param {number} seed
 */
export function scrambleWord(word, seed) {
  const clean = String(word ?? "").trim().toUpperCase();
  if (clean === "") return { error: "There is no word to scramble." };
  const letters = clean.split("");
  const distinct = new Set(letters);
  if (letters.length < 2 || distinct.size < 2) {
    return { scrambled: clean, unscrambleable: true };
  }
  for (let attempt = 0; attempt < MAX_SCRAMBLE_ATTEMPTS; attempt += 1) {
    const shuffled = shuffle(letters, seed + attempt * 7919);
    const candidate = shuffled.items.join("");
    if (candidate !== clean) return { scrambled: candidate, unscrambleable: false };
  }
  // Fallback that is guaranteed to differ: rotate to the first differing letter.
  const firstDifferent = letters.findIndex((letter) => letter !== letters[0]);
  const rotated = letters.slice(firstDifferent).concat(letters.slice(0, firstDifferent));
  return { scrambled: rotated.join(""), unscrambleable: false };
}

/**
 * Deterministically pick a run of puzzles from the bank without repeats.
 *
 * @param {{ difficulty: string, count: number, seed: number }} input
 */
export function buildRounds({ difficulty, count, seed }) {
  const bank = WORD_BANK[difficulty];
  if (!bank) return { error: "Choose easy, medium or hard." };
  if (!isNum(count) || count < 1) return { error: "Play at least one round." };
  if (count > bank.length) {
    return { error: `There are only ${bank.length} words at this level — pick ${bank.length} rounds or fewer.` };
  }
  if (!isNum(seed)) return { error: "The puzzle seed must be a number." };

  const order = shuffle(bank, seed);
  const chosen = order.items.slice(0, Math.floor(count));
  const rounds = chosen.map((entry, index) => {
    const scrambled = scrambleWord(entry.word, seed + index * 104729);
    return {
      index,
      word: entry.word,
      hint: entry.hint,
      category: entry.category,
      scrambled: scrambled.error ? entry.word : scrambled.scrambled,
      letters: entry.word.length,
    };
  });
  const meta = DIFFICULTIES.find((d) => d.id === difficulty);
  return { rounds, timeLimitSeconds: meta.timeLimitSeconds, difficultyLabel: meta.label };
}

/** Compare a guess with the answer, ignoring case and surrounding spaces. */
export function checkGuess(guess, answer) {
  const cleanGuess = String(guess ?? "").trim().toUpperCase().replace(/\s+/g, "");
  const cleanAnswer = String(answer ?? "").trim().toUpperCase();
  if (cleanAnswer === "") return { error: "There is no answer to check against." };
  if (cleanGuess === "") return { error: "Type your answer first." };
  return {
    correct: cleanGuess === cleanAnswer,
    guess: cleanGuess,
    sameLetters: cleanGuess.split("").sort().join("") === cleanAnswer.split("").sort().join(""),
  };
}

/**
 * Score one solved round.
 *
 * @param {{ letters: number, secondsTaken: number, timeLimitSeconds: number,
 *           hintsUsed: number, solved: boolean }} input
 */
export function scoreRound({ letters, secondsTaken, timeLimitSeconds, hintsUsed, solved }) {
  if (!isNum(letters) || letters <= 0) return { error: "The word length is missing." };
  if (!isNum(timeLimitSeconds) || timeLimitSeconds <= 0) return { error: "The time limit must be more than zero seconds." };
  if (!isNum(secondsTaken) || secondsTaken < 0) return { error: "Time taken cannot be negative." };
  if (!isNum(hintsUsed) || hintsUsed < 0) return { error: "Hints used cannot be negative." };
  if (!solved) return { basePoints: 0, timeBonus: 0, hintPenalty: 0, score: 0 };

  const basePoints = letters * POINTS_PER_LETTER;
  const secondsLeft = Math.max(0, timeLimitSeconds - secondsTaken);
  const timeBonus = Math.round((secondsLeft / timeLimitSeconds) * basePoints * TIME_BONUS_SHARE);
  const hintPenalty = hintsUsed * HINT_PENALTY;
  return {
    basePoints,
    timeBonus,
    hintPenalty,
    secondsLeft,
    score: Math.max(0, basePoints + timeBonus - hintPenalty),
  };
}

/**
 * Totals across a finished game.
 *
 * @param {Array<{ solved: boolean, score: number, secondsTaken: number, hintsUsed: number }>} results
 */
export function summariseGame(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return { error: "No rounds have been played yet." };
  }
  let totalScore = 0;
  let solved = 0;
  let totalSeconds = 0;
  let hints = 0;
  let streak = 0;
  let bestStreak = 0;
  for (const round of results) {
    totalScore += isNum(round.score) ? round.score : 0;
    totalSeconds += isNum(round.secondsTaken) ? round.secondsTaken : 0;
    hints += isNum(round.hintsUsed) ? round.hintsUsed : 0;
    if (round.solved) {
      solved += 1;
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      streak = 0;
    }
  }
  return {
    rounds: results.length,
    solved,
    missed: results.length - solved,
    accuracyPercent: (solved / results.length) * 100,
    totalScore,
    averageScore: totalScore / results.length,
    averageSeconds: totalSeconds / results.length,
    hintsUsed: hints,
    bestStreak,
  };
}
