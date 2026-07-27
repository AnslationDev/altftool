/**
 * Voiceover word budget maths.
 *
 * Core rule: a read of W words at P words per minute occupies W / P minutes,
 * so the number of words that fit S seconds of speaking time is
 *     words = S * P / 60
 * This is the standard words-per-minute model used by broadcast copywriters
 * and audiobook producers. Everything else here is bookkeeping around it
 * (breath pauses, end tags, over/under deltas).
 */

/** Seconds in one minute — the only unit bridge in the whole module. */
export const SECONDS_PER_MINUTE = 60;

/**
 * Reading-pace presets in words per minute.
 * Ranges reflect widely published copywriting/voiceover conventions:
 * unhurried narration sits near 110-130 wpm, a natural conversational
 * broadcast read near 150 wpm, upbeat promo reads near 170 wpm, and
 * legal/disclaimer "speed reads" run 190-200+ wpm.
 */
export const PACE_PRESETS = [
  { id: "narration", label: "Slow narration / e-learning", wpm: 115 },
  { id: "documentary", label: "Documentary / corporate", wpm: 135 },
  { id: "broadcast", label: "Conversational broadcast", wpm: 150 },
  { id: "promo", label: "Upbeat promo / retail", wpm: 170 },
  { id: "disclaimer", label: "Legal disclaimer speed read", wpm: 195 },
];

/** Standard broadcast spot lengths in seconds. */
export const SLOT_PRESETS = [6, 10, 15, 20, 30, 45, 60, 90];

/** Guard rails so a typo cannot produce a nonsense budget. */
export const MIN_WPM = 40;
export const MAX_WPM = 400;
export const MAX_SLOT_SECONDS = 7200; // two hours — beyond this it is not a "slot"

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Count words the way a script is actually read: any run of non-whitespace
 * separated by whitespace. Hyphenated words count once, which matches how a
 * performer reads them.
 */
export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Words that fit a given number of SPEAKING seconds at a given pace.
 * Returns a whole number because you cannot deliver a fraction of a word.
 */
export function wordsForSeconds(seconds, wordsPerMinute) {
  if (!isNum(seconds) || !isNum(wordsPerMinute)) return 0;
  if (seconds <= 0 || wordsPerMinute <= 0) return 0;
  return Math.floor((seconds * wordsPerMinute) / SECONDS_PER_MINUTE);
}

/**
 * Seconds a given word count takes at a given pace.
 */
export function secondsForWords(words, wordsPerMinute) {
  if (!isNum(words) || !isNum(wordsPerMinute)) return 0;
  if (words <= 0 || wordsPerMinute <= 0) return 0;
  return (words * SECONDS_PER_MINUTE) / wordsPerMinute;
}

/**
 * Main calculation.
 *
 * @param {object} input
 * @param {number} input.slotSeconds      Total on-air length of the spot.
 * @param {number} input.wordsPerMinute   Delivery pace.
 * @param {number} [input.pauseSeconds]   Silence reserved for breaths/beats.
 * @param {number} [input.tagSeconds]     Time reserved for a music tag, sting
 *                                        or logo at the end (no speech).
 * @param {number} [input.scriptWords]    Words already written, for over/under.
 * @returns {object} budget figures, or { error } for unusable input.
 */
export function computeWordBudget({
  slotSeconds,
  wordsPerMinute,
  pauseSeconds = 0,
  tagSeconds = 0,
  scriptWords = 0,
} = {}) {
  if (![slotSeconds, wordsPerMinute, pauseSeconds, tagSeconds, scriptWords].every(isNum)) {
    return { error: "Enter a number in every field." };
  }
  if (slotSeconds <= 0) {
    return { error: "Slot length must be greater than zero seconds." };
  }
  if (slotSeconds > MAX_SLOT_SECONDS) {
    return { error: `Slot length must be ${MAX_SLOT_SECONDS} seconds (2 hours) or less.` };
  }
  if (wordsPerMinute < MIN_WPM || wordsPerMinute > MAX_WPM) {
    return { error: `Reading pace must be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }
  if (pauseSeconds < 0 || tagSeconds < 0 || scriptWords < 0) {
    return { error: "Pause, tag and word count cannot be negative." };
  }

  const reserved = pauseSeconds + tagSeconds;
  const speakingSeconds = slotSeconds - reserved;
  if (speakingSeconds <= 0) {
    return { error: "Pauses and the end tag use up the whole slot — no speaking time is left." };
  }

  const wordBudget = wordsForSeconds(speakingSeconds, wordsPerMinute);
  const secondsPerWord = SECONDS_PER_MINUTE / wordsPerMinute;
  const scriptSeconds = secondsForWords(scriptWords, wordsPerMinute);

  // Pace the writer would have to hit to squeeze the current script in.
  const requiredWpm =
    scriptWords > 0 ? (scriptWords * SECONDS_PER_MINUTE) / speakingSeconds : 0;

  const perSlot = SLOT_PRESETS.map((seconds) => {
    const speak = Math.max(0, seconds - reserved);
    return { seconds, words: wordsForSeconds(speak, wordsPerMinute) };
  });

  return {
    slotSeconds,
    wordsPerMinute,
    reservedSeconds: reserved,
    speakingSeconds,
    wordBudget,
    secondsPerWord,
    scriptWords,
    scriptSeconds,
    deltaWords: wordBudget - scriptWords,
    deltaSeconds: speakingSeconds - scriptSeconds,
    fits: scriptWords <= wordBudget,
    requiredWpm,
    perSlot,
  };
}
