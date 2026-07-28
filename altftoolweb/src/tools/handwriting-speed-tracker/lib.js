/**
 * Handwriting speed maths.
 *
 * Handwriting research reports speed two ways: words per minute (wpm) and
 * letters per minute (lpm). Both are plain rates — count divided by elapsed
 * minutes — so everything here is exact arithmetic with no lookup tables of
 * invented "normal" speeds. Timing is passed in as a number of seconds; nothing
 * in this module reads the clock.
 */

export const SECONDS_PER_MINUTE = 60;

/**
 * Comfortable sustained longhand for an adult is usually quoted in the
 * 20-30 words per minute band; a short burst can be faster but is rarely
 * legible for a whole exam paper. Used only to place your own result in
 * context, never as a pass mark.
 */
export const ADULT_SUSTAINED_WPM_MIN = 20;
export const ADULT_SUSTAINED_WPM_MAX = 30;

/**
 * Standardised handwriting tests count a "word" as five characters including
 * the space, the same convention typing tests use. Real English averages a
 * little under this, which is why the tool also reports your measured letters
 * per word.
 */
export const STANDARD_CHARS_PER_WORD = 5;

/** A copy task shorter than this is dominated by starting and stopping. */
export const MIN_RELIABLE_SECONDS = 30;

export const MAX_SECONDS = 3 * 60 * 60; // three hours

const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Convert a completed copy task into speed rates.
 *
 * @param {object} input
 * @param {number} input.words   words actually written
 * @param {number} input.letters letters written (0 or omitted to skip lpm)
 * @param {number} input.seconds elapsed time in seconds
 */
export function computeSpeed({ words, letters = 0, seconds } = {}) {
  if (![words, letters, seconds].every((value) => Number.isFinite(value))) {
    return { error: "Enter a number for words written and time taken." };
  }
  if (words <= 0) return { error: "Words written must be greater than zero." };
  if (letters < 0) return { error: "Letters written cannot be negative." };
  if (seconds <= 0) return { error: "Time taken must be greater than zero seconds." };
  if (seconds > MAX_SECONDS) return { error: "Time taken must be under three hours." };
  if (letters > 0 && letters < words) {
    return { error: "Letters written cannot be fewer than words written." };
  }

  const minutes = seconds / SECONDS_PER_MINUTE;
  const wpm = words / minutes;
  const lpm = letters > 0 ? letters / minutes : null;
  const lettersPerWord = letters > 0 ? letters / words : null;

  return {
    words,
    letters,
    seconds,
    minutes: round2(minutes),
    wpm: round1(wpm),
    lpm: lpm === null ? null : round1(lpm),
    secondsPerWord: round2(seconds / words),
    lettersPerWord: lettersPerWord === null ? null : round2(lettersPerWord),
    /** Speed in five-character "standard words", the typing-test convention. */
    standardWpm: letters > 0 ? round1(letters / STANDARD_CHARS_PER_WORD / minutes) : null,
    /** Short samples bounce around; flag them rather than silently reporting them. */
    reliable: seconds >= MIN_RELIABLE_SECONDS,
    inAdultSustainedBand: wpm >= ADULT_SUSTAINED_WPM_MIN && wpm <= ADULT_SUSTAINED_WPM_MAX,
  };
}

/**
 * Will this speed finish a written paper in the time allowed?
 *
 * @param {object} input
 * @param {number} input.wpm              measured words per minute
 * @param {number} input.targetWords      words the answer needs
 * @param {number} input.availableMinutes writing time available
 */
export function projectExam({ wpm, targetWords, availableMinutes } = {}) {
  if (![wpm, targetWords, availableMinutes].every((value) => Number.isFinite(value))) {
    return { error: "Enter a word target and the minutes available." };
  }
  if (wpm <= 0) return { error: "Measure a writing speed first." };
  if (targetWords <= 0) return { error: "The word target must be greater than zero." };
  if (availableMinutes <= 0) return { error: "Time available must be greater than zero minutes." };

  const minutesNeeded = targetWords / wpm;
  const requiredWpm = targetWords / availableMinutes;
  const spareMinutes = availableMinutes - minutesNeeded;

  return {
    targetWords,
    availableMinutes,
    minutesNeeded: round1(minutesNeeded),
    requiredWpm: round1(requiredWpm),
    spareMinutes: round1(spareMinutes),
    shortfallMinutes: round1(spareMinutes < 0 ? -spareMinutes : 0),
    canFinish: spareMinutes >= 0,
    /** Words you would actually get down in the time available at this speed. */
    wordsInTime: Math.floor(wpm * availableMinutes),
  };
}

/**
 * Least-squares slope of y against its own index, i.e. the average change per
 * session. Returns 0 for a single point (no trend can be measured).
 */
export function trendPerSession(values) {
  if (!Array.isArray(values) || values.length < 2) return 0;
  const n = values.length;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((sum, value) => sum + value, 0) / n;
  let numerator = 0;
  let denominator = 0;
  for (let index = 0; index < n; index += 1) {
    const dx = index - meanX;
    numerator += dx * (values[index] - meanY);
    denominator += dx * dx;
  }
  if (denominator === 0) return 0;
  return round2(numerator / denominator);
}

/**
 * Summarise a run of sessions, oldest first.
 *
 * @param {Array<{wpm:number}>} sessions
 */
export function summariseSessions(sessions) {
  const list = Array.isArray(sessions)
    ? sessions.filter((session) => session && Number.isFinite(session.wpm) && session.wpm > 0)
    : [];
  if (list.length === 0) {
    return { count: 0, firstWpm: null, latestWpm: null, bestWpm: null, averageWpm: null, changePct: null, trend: 0 };
  }

  const speeds = list.map((session) => session.wpm);
  const firstWpm = speeds[0];
  const latestWpm = speeds[speeds.length - 1];
  const total = speeds.reduce((sum, value) => sum + value, 0);

  return {
    count: speeds.length,
    firstWpm: round1(firstWpm),
    latestWpm: round1(latestWpm),
    bestWpm: round1(Math.max(...speeds)),
    averageWpm: round1(total / speeds.length),
    // Guarded: firstWpm is filtered to be > 0, so this never divides by zero.
    changePct: speeds.length > 1 ? round1(((latestWpm - firstWpm) / firstWpm) * 100) : null,
    trend: trendPerSession(speeds),
  };
}

/** Split a passage into words the way a marker would: whitespace-separated tokens. */
export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

/** Count letters only — digits, spaces and punctuation are excluded. */
export function countLetters(text) {
  if (typeof text !== "string") return 0;
  const matches = text.match(/\p{L}/gu);
  return matches ? matches.length : 0;
}

/** Format a whole number of seconds as m:ss. */
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / SECONDS_PER_MINUTE);
  const secs = whole % SECONDS_PER_MINUTE;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/** Short copy passages with pre-counted words and letters for timed practice. */
export const COPY_PASSAGES = [
  {
    id: "pangram",
    label: "Pangram warm-up (every letter of the alphabet)",
    text: "The quick brown fox jumps over the lazy dog while five wizards vex the calm judge and pack my box with a dozen liquor jugs.",
  },
  {
    id: "narrative",
    label: "Narrative paragraph",
    text: "The train pulled out of the station just after six, and the platform emptied in less than a minute. She counted the stops on her fingers, watching the fields turn from green to grey as the light went, and wondered whether anyone would be waiting at the other end.",
  },
  {
    id: "exam",
    label: "Exam-style answer opening",
    text: "There are three reasons the policy failed. First, the funding arrived a full year after the schools had already set their budgets. Second, the training was optional. Third, and most importantly, nobody was asked to report whether it had made any difference at all.",
  },
];
