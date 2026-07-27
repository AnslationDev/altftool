/**
 * Voiceover runtime estimator.
 *
 * Runtime is modelled as reading time plus pause time:
 *
 *   readSeconds  = words / wpm * 60
 *   pauseSeconds = sentenceEnds * SENTENCE_PAUSE
 *                + commas       * COMMA_PAUSE
 *                + paragraphs-1 * PARAGRAPH_PAUSE
 *   total        = readSeconds + pauseSeconds
 *
 * The pause lengths below are the defaults used when "count punctuation pauses"
 * is on; they are averages of unhurried studio delivery and can be overridden.
 * Word rate is the dominant term — pauses typically add 5-15% on top.
 */

/**
 * Reference speaking rates in words per minute. These are the ranges commonly
 * quoted for each delivery style; the midpoint is used as the preset value.
 */
export const PACE_PRESETS = [
  { id: "meditation", label: "Meditation / relaxation", wpm: 100, note: "Deliberate, heavily paused" },
  { id: "presentation", label: "Presentation / keynote", wpm: 120, note: "Slow enough for slides" },
  { id: "elearning", label: "E-learning / corporate", wpm: 135, note: "Clear instructional pace" },
  { id: "explainer", label: "Explainer / documentary", wpm: 145, note: "Neutral narration" },
  { id: "audiobook", label: "Audiobook narration", wpm: 155, note: "Publisher guidance is often 150-160" },
  { id: "conversational", label: "Podcast / conversational", wpm: 160, note: "Natural speech" },
  { id: "commercial", label: "Commercial / promo", wpm: 175, note: "Fast, to fit a fixed spot" },
];

export const MIN_WPM = 60;
export const MAX_WPM = 260;

/** Default pause lengths in seconds. */
export const SENTENCE_PAUSE = 0.5;
export const COMMA_PAUSE = 0.2;
export const PARAGRAPH_PAUSE = 0.8;

/** Standard advertising spot lengths, in seconds. */
export const SPOT_LENGTHS = [15, 30, 60, 90];

const collapse = (value) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");

/**
 * Count spoken words. Hyphenated compounds count once; standalone numbers and
 * symbols separated by whitespace count as one word each, which is how a
 * narrator reads a script line.
 */
export function countWords(text) {
  const clean = collapse(text);
  if (!clean) return 0;
  return clean.split(" ").filter((token) => /[A-Za-z0-9]/.test(token)).length;
}

/** Count the punctuation events that create pauses. */
export function countPauseEvents(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return { sentences: 0, commas: 0, paragraphs: 0 };
  }
  const sentences = (text.match(/[.!?]+(?=\s|$)/g) || []).length;
  const commas = (text.match(/[,;:]/g) || []).length;
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean).length;
  return { sentences, commas, paragraphs };
}

/** Format seconds as m:ss, or h:mm:ss once past an hour. */
export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

function normalisePace(value) {
  const wpm = value === undefined || value === "" ? NaN : Number(value);
  if (!Number.isFinite(wpm) || wpm < MIN_WPM || wpm > MAX_WPM) {
    return { error: `Speaking pace must be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }
  return { wpm };
}

/**
 * Estimate the runtime of a script.
 * @param {Object} input
 * @param {string} [input.text]        the script; used when wordCount is not given
 * @param {number} [input.wordCount]   word count, when the script itself is not to hand
 * @param {number} input.wpm           speaking pace
 * @param {boolean} [input.includePauses=true]
 */
export function estimateDuration(input) {
  const raw = input && typeof input === "object" ? input : {};
  const pace = normalisePace(raw.wpm);
  if (pace.error) return pace;

  const hasText = typeof raw.text === "string" && raw.text.trim() !== "";
  let words;
  let pauses = { sentences: 0, commas: 0, paragraphs: 0 };

  if (hasText) {
    words = countWords(raw.text);
    pauses = countPauseEvents(raw.text);
  } else {
    const given = raw.wordCount === undefined || raw.wordCount === "" ? NaN : Number(raw.wordCount);
    if (!Number.isFinite(given)) {
      return { error: "Paste a script, or enter a word count." };
    }
    if (given < 0) return { error: "Word count cannot be negative." };
    if (given > 1000000) return { error: "That word count is too large to estimate usefully." };
    words = Math.round(given);
  }

  if (words === 0) return { error: "No spoken words found — paste a script, or enter a word count." };

  const includePauses = raw.includePauses !== false && hasText;
  const readSeconds = (words / pace.wpm) * 60;
  const pauseSeconds = includePauses
    ? pauses.sentences * SENTENCE_PAUSE +
      pauses.commas * COMMA_PAUSE +
      Math.max(0, pauses.paragraphs - 1) * PARAGRAPH_PAUSE
    : 0;
  const totalSeconds = readSeconds + pauseSeconds;

  return {
    words,
    pauses,
    includePauses,
    wpm: pace.wpm,
    readSeconds: Math.round(readSeconds * 10) / 10,
    pauseSeconds: Math.round(pauseSeconds * 10) / 10,
    totalSeconds: Math.round(totalSeconds * 10) / 10,
    formatted: formatDuration(totalSeconds),
    effectiveWpm: totalSeconds > 0 ? Math.round((words / totalSeconds) * 60) : pace.wpm,
    charactersPerWord: hasText ? Math.round((collapse(raw.text).length / words) * 10) / 10 : null,
  };
}

/** Turn a minutes + seconds pair into a total in seconds. */
export function targetToSeconds(minutes, seconds) {
  const m = minutes === undefined || minutes === "" ? 0 : Number(minutes);
  const s = seconds === undefined || seconds === "" ? 0 : Number(seconds);
  if (!Number.isFinite(m) || !Number.isFinite(s) || m < 0 || s < 0) {
    return { error: "Target length must use non-negative numbers." };
  }
  const total = m * 60 + s;
  if (total <= 0) return { error: "Set a target length greater than zero." };
  if (total > 86400) return { error: "Target length must be under 24 hours." };
  return { seconds: total };
}

/** Words that fit in a target duration at a given pace, ignoring pauses. */
export function wordsForDuration(seconds, wpm) {
  const pace = normalisePace(wpm);
  if (pace.error) return pace;
  const target = Number(seconds);
  if (!Number.isFinite(target) || target <= 0) {
    return { error: "Target length must be greater than zero seconds." };
  }
  return { words: Math.floor((target / 60) * pace.wpm), targetSeconds: target, wpm: pace.wpm };
}

/**
 * Compare an estimate against a target runtime and say how to close the gap:
 * either by cutting/adding words at the current pace, or by changing pace.
 */
export function fitToTarget(estimate, targetSeconds) {
  if (!estimate || estimate.error) {
    return { error: estimate && estimate.error ? estimate.error : "Estimate the script first." };
  }
  const target = Number(targetSeconds);
  if (!Number.isFinite(target) || target <= 0) {
    return { error: "Target length must be greater than zero seconds." };
  }

  const differenceSeconds = Math.round((estimate.totalSeconds - target) * 10) / 10;
  const speakingBudget = target - estimate.pauseSeconds;

  const wordBudget =
    speakingBudget > 0 ? Math.floor((speakingBudget / 60) * estimate.wpm) : 0;
  const wordDelta = estimate.words - wordBudget;

  let requiredWpm = null;
  if (speakingBudget > 0) {
    requiredWpm = Math.round((estimate.words / speakingBudget) * 60);
  }
  const paceAchievable =
    requiredWpm !== null && requiredWpm >= MIN_WPM && requiredWpm <= MAX_WPM;

  return {
    targetSeconds: target,
    targetFormatted: formatDuration(target),
    differenceSeconds,
    absDifferenceSeconds: Math.abs(differenceSeconds),
    over: differenceSeconds > 0,
    withinHalfSecond: Math.abs(differenceSeconds) <= 0.5,
    wordBudget,
    wordDelta,
    absWordDelta: Math.abs(wordDelta),
    requiredWpm,
    paceAchievable,
    pauseSeconds: estimate.pauseSeconds,
    note:
      speakingBudget <= 0
        ? "Pauses alone already fill the target; cut punctuation or shorten the script."
        : null,
  };
}
