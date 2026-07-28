/**
 * Typing speed scoring.
 *
 * The whole tool rests on one long-standing convention: a "word", for typing
 * measurement, is exactly five keystrokes including the space that follows it.
 * That definition comes from the standard used by typewriter-era speed tests
 * and is still what typing certifications and typing tutors use today, so a
 * 300-character passage is 60 words no matter how long the real words are.
 *
 *   Gross WPM = (all characters typed / 5) / minutes elapsed
 *   Net WPM   = Gross WPM - (uncorrected errors / minutes elapsed)
 *   CPM       = all characters typed / minutes elapsed
 *   Accuracy  = correct characters / all characters typed x 100
 *
 * Net WPM is the "one word penalty per uncorrected mistake" formula: each
 * error left standing at the end of the run removes one whole word per minute.
 *
 * Pure module: no React, no DOM, no clock reads. Elapsed time is passed in.
 */

/** Characters that count as one word in every standard typing measurement. */
export const CHARS_PER_WORD = 5;

/** Seconds in a minute, used to turn elapsed seconds into the "per minute" rate. */
export const SECONDS_PER_MINUTE = 60;

/** Test lengths offered, in seconds. 60 s is the classic certification length. */
export const DURATION_PRESETS = [15, 30, 60, 120];

/** Shortest run we will score. Under 3 seconds a single fast burst of muscle
 * memory produces a rate that does not represent sustained typing. */
export const MIN_SCORABLE_SECONDS = 3;

/** Longest run we will score, in seconds (one hour). */
export const MAX_SCORABLE_SECONDS = 3600;

/** Number of words generated for a prompt by default. */
export const DEFAULT_PROMPT_WORDS = 60;

/** Hard cap on prompt length so the DOM stays small. */
export const MAX_PROMPT_WORDS = 400;

/**
 * Descriptive speed bands in net WPM.
 * These are labels for the ranges commonly reported in typing research and by
 * typing-tutor software, not a certification scale:
 * hunt-and-peck typists sit in the teens, the average computer user is around
 * 40 WPM, and touch typists working professionally sit in the 65-80 range.
 */
export const SPEED_BANDS = [
  { min: 0, label: "Getting started" },
  { min: 20, label: "Hunt and peck" },
  { min: 35, label: "Average computer user" },
  { min: 50, label: "Comfortable touch typist" },
  { min: 65, label: "Professional speed" },
  { min: 90, label: "Exceptional" },
];

/**
 * Common-English word pool used to build prompts. Kept to short, high-frequency
 * words so the test measures typing rather than reading or spelling.
 */
export const WORD_POOL = [
  "about", "after", "again", "also", "another", "any", "around", "back", "because",
  "before", "below", "better", "between", "book", "both", "bring", "call", "came",
  "change", "city", "close", "come", "could", "country", "course", "days", "different",
  "does", "down", "during", "each", "early", "earth", "enough", "even", "every",
  "example", "family", "father", "feel", "find", "first", "follow", "form", "found",
  "friend", "from", "give", "good", "great", "group", "hand", "hard", "have", "head",
  "hear", "help", "here", "high", "home", "house", "idea", "important", "into", "just",
  "keep", "kind", "know", "land", "large", "last", "late", "learn", "leave", "left",
  "letter", "life", "light", "like", "line", "list", "little", "live", "long", "look",
  "made", "make", "many", "mean", "might", "mind", "money", "more", "most", "mother",
  "move", "much", "music", "must", "name", "near", "need", "never", "next", "night",
  "north", "note", "nothing", "number", "often", "once", "only", "open", "order",
  "other", "over", "page", "paper", "part", "people", "person", "picture", "place",
  "plant", "play", "point", "power", "problem", "public", "question", "quick", "read",
  "ready", "real", "really", "right", "river", "room", "said", "same", "school", "sea",
  "second", "seem", "sentence", "several", "should", "show", "side", "small", "some",
  "sound", "south", "space", "start", "state", "still", "story", "study", "such",
  "sure", "system", "take", "talk", "tell", "than", "that", "their", "them", "then",
  "there", "these", "they", "thing", "think", "this", "those", "though", "three",
  "through", "time", "today", "together", "took", "town", "tree", "true", "turn",
  "under", "until", "upon", "used", "very", "walk", "want", "watch", "water", "week",
  "well", "went", "were", "what", "when", "where", "which", "while", "white", "whole",
  "why", "will", "with", "without", "word", "work", "world", "would", "write", "year",
  "young", "your",
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Mulberry32 — a small, fast, well-distributed 32-bit PRNG.
 * Used so a given seed always rebuilds exactly the same prompt, which keeps
 * buildPrompt pure and makes a run repeatable.
 *
 * @param {number} seed
 * @returns {() => number} generator returning a float in [0, 1)
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build a deterministic space-separated typing prompt from the word pool.
 *
 * @param {number} wordCount how many words to emit
 * @param {number} seed any integer; the same seed always gives the same prompt
 * @returns {{ text: string, words: string[] } | { error: string }}
 */
export function buildPrompt(wordCount, seed) {
  if (!isNum(wordCount)) return { error: "Enter the prompt length as a number of words." };
  const count = Math.floor(wordCount);
  if (count < 1) return { error: "The prompt needs at least one word." };
  if (count > MAX_PROMPT_WORDS) {
    return { error: `Keep the prompt to ${MAX_PROMPT_WORDS} words or fewer.` };
  }
  if (!isNum(seed)) return { error: "The prompt seed must be a number." };

  const random = mulberry32(Math.floor(seed));
  const words = [];
  let previous = "";
  for (let i = 0; i < count; i += 1) {
    let word = WORD_POOL[Math.floor(random() * WORD_POOL.length)];
    // Avoid an immediate repeat, which reads as a typo to the person typing.
    if (word === previous) {
      word = WORD_POOL[(WORD_POOL.indexOf(word) + 1) % WORD_POOL.length];
    }
    previous = word;
    words.push(word);
  }
  return { text: words.join(" "), words };
}

/**
 * Compare what was typed against the prompt, character by character.
 * Only the characters actually typed are judged; the untyped tail of the
 * prompt is neither correct nor an error, it simply was not reached.
 *
 * @param {string} prompt
 * @param {string} typed
 * @returns {{ statuses: Array<"correct"|"incorrect"|"pending">, correctChars: number,
 *             incorrectChars: number, typedChars: number, completed: boolean }}
 */
export function compareTyped(prompt, typed) {
  const target = typeof prompt === "string" ? prompt : "";
  const input = typeof typed === "string" ? typed : "";
  const statuses = new Array(target.length);
  let correctChars = 0;
  let incorrectChars = 0;

  for (let i = 0; i < target.length; i += 1) {
    if (i >= input.length) {
      statuses[i] = "pending";
    } else if (input[i] === target[i]) {
      statuses[i] = "correct";
      correctChars += 1;
    } else {
      statuses[i] = "incorrect";
      incorrectChars += 1;
    }
  }

  // Anything typed past the end of the prompt is an overrun and counts as error.
  const overrun = Math.max(0, input.length - target.length);
  incorrectChars += overrun;

  return {
    statuses,
    correctChars,
    incorrectChars,
    typedChars: input.length,
    completed: input.length >= target.length,
  };
}

/**
 * Score a completed (or abandoned) typing run.
 *
 * @param {object} input
 * @param {number} input.typedChars   every character the person typed
 * @param {number} input.correctChars characters matching the prompt
 * @param {number} input.incorrectChars characters not matching the prompt
 * @param {number} input.elapsedSeconds wall-clock seconds spent typing
 * @returns {{ grossWpm: number, netWpm: number, cpm: number, accuracy: number,
 *             minutes: number, band: string } | { error: string }}
 */
export function computeTypingScore({
  typedChars,
  correctChars,
  incorrectChars,
  elapsedSeconds,
} = {}) {
  if (!isNum(typedChars) || !isNum(correctChars) || !isNum(incorrectChars)) {
    return { error: "Character counts must be numbers." };
  }
  if (typedChars < 0 || correctChars < 0 || incorrectChars < 0) {
    return { error: "Character counts cannot be negative." };
  }
  if (correctChars + incorrectChars > typedChars) {
    return { error: "Correct plus incorrect characters cannot exceed the total typed." };
  }
  if (!isNum(elapsedSeconds)) return { error: "Enter the elapsed time in seconds." };
  if (elapsedSeconds < MIN_SCORABLE_SECONDS) {
    return { error: `Type for at least ${MIN_SCORABLE_SECONDS} seconds to get a fair rate.` };
  }
  if (elapsedSeconds > MAX_SCORABLE_SECONDS) {
    return { error: "That run is longer than an hour, which is too long to score." };
  }
  if (typedChars === 0) {
    return { error: "Nothing was typed, so there is no speed to measure." };
  }

  const minutes = elapsedSeconds / SECONDS_PER_MINUTE;
  const grossWpm = typedChars / CHARS_PER_WORD / minutes;
  // One whole word per minute is deducted for each uncorrected error.
  const netWpm = Math.max(0, grossWpm - incorrectChars / minutes);
  const cpm = typedChars / minutes;
  const accuracy = (correctChars / typedChars) * 100;

  return {
    grossWpm: round1(grossWpm),
    netWpm: round1(netWpm),
    cpm: Math.round(cpm),
    accuracy: round1(accuracy),
    minutes: round3(minutes),
    band: speedBand(netWpm),
  };
}

/**
 * Label for a net WPM figure.
 * @param {number} netWpm
 * @returns {string}
 */
export function speedBand(netWpm) {
  if (!isNum(netWpm) || netWpm < 0) return SPEED_BANDS[0].label;
  let label = SPEED_BANDS[0].label;
  for (const band of SPEED_BANDS) {
    if (netWpm >= band.min) label = band.label;
  }
  return label;
}

/**
 * Seconds as m:ss.
 * @param {number} seconds
 * @returns {string}
 */
export function formatClock(seconds) {
  if (!isNum(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / SECONDS_PER_MINUTE);
  const secs = whole % SECONDS_PER_MINUTE;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function round3(value) {
  return Math.round(value * 1000) / 1000;
}
