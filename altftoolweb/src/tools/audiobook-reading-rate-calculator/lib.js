/**
 * Audiobook reading-rate and production-time maths.
 *
 * Reference points:
 *  - Comfortable narration pace for non-fiction and commercial fiction sits at roughly
 *    150-160 words per minute; 155 wpm is the usual planning figure.
 *  - The industry unit is the "finished hour" (PFH/FH): one hour of edited, mastered audio.
 *    At 155 wpm a finished hour holds 155 x 60 = 9,300 words, which is the number ACX
 *    publishes as the average for an audiobook.
 *  - Production multipliers are expressed against the finished hour. Typical ranges for a
 *    solo narrator using punch-and-roll: 1.5-2.5x FH at the mic, 2-3x FH for editing,
 *    mastering and proof-listening, and about 0.5x FH for prep and pronunciation research.
 *  - ACX/Audible delivery spec: 192 kbps constant-bitrate MP3, 44.1 kHz, one file per
 *    chapter, so 192 kbps = 24,000 bytes of audio per second.
 */

/** Planning pace in words per minute. */
export const DEFAULT_WPM = 155;

/** Sensible bounds for narration pace. Below 100 wpm is a dictation read; above 200 is unlistenable. */
export const MIN_WPM = 80;
export const MAX_WPM = 260;

/** Words in one finished hour at the default pace: 155 x 60. */
export const WORDS_PER_FINISHED_HOUR = DEFAULT_WPM * 60;

/** Default production multipliers, expressed as hours of work per finished hour. */
export const DEFAULT_FACTORS = {
  prep: 0.5,
  record: 2.0,
  edit: 2.0,
};

/** ACX delivery spec constants. */
export const ACX_BITRATE_KBPS = 192;
const BYTES_PER_SECOND = (ACX_BITRATE_KBPS * 1000) / 8; // 24,000 bytes per second
const BYTES_PER_MB = 1024 * 1024;

/** Named narration styles with their planning pace. */
export const PACE_PRESETS = [
  { id: "slow", label: "Deliberate — technical, children's, poetry", wpm: 130 },
  { id: "standard", label: "Standard — most fiction and non-fiction", wpm: 155 },
  { id: "brisk", label: "Brisk — thriller, business, self-help", wpm: 175 },
];

/** Audible's listing bands, used to describe the finished length. */
export const LENGTH_BANDS = [
  { maxHours: 1, label: "Short — under 1 hour" },
  { maxHours: 3, label: "Novella length — 1 to 3 hours" },
  { maxHours: 6, label: "Short book — 3 to 6 hours" },
  { maxHours: 12, label: "Standard novel — 6 to 12 hours" },
  { maxHours: 20, label: "Long novel — 12 to 20 hours" },
  { maxHours: Infinity, label: "Epic — over 20 hours" },
];

/** Format a duration in minutes as "9h 41m". */
export function formatHoursMinutes(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "—";
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

/**
 * Convert a manuscript into finished audio time and production time.
 *
 * @param {object} input
 * @param {number} input.wordCount manuscript words
 * @param {number} input.wordsPerMinute narration pace
 * @param {number} input.prepFactor hours of prep per finished hour
 * @param {number} input.recordFactor hours at the mic per finished hour
 * @param {number} input.editFactor hours of edit/master/proof per finished hour
 * @param {number} input.sessionHours usable recording hours in one booth session
 * @returns {object} results or { error }
 */
export function computeAudiobookLength({
  wordCount,
  wordsPerMinute = DEFAULT_WPM,
  prepFactor = DEFAULT_FACTORS.prep,
  recordFactor = DEFAULT_FACTORS.record,
  editFactor = DEFAULT_FACTORS.edit,
  sessionHours = 3,
} = {}) {
  const words = Number(wordCount);
  const wpm = Number(wordsPerMinute);

  if (!Number.isFinite(words)) return { error: "Enter the manuscript word count." };
  if (words <= 0) return { error: "Word count must be greater than zero." };
  if (words > 5000000) return { error: "That word count is beyond any single audiobook — check the figure." };

  if (!Number.isFinite(wpm)) return { error: "Enter a narration pace in words per minute." };
  if (wpm < MIN_WPM || wpm > MAX_WPM) {
    return { error: `Narration pace should be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }

  const prep = Number(prepFactor);
  const record = Number(recordFactor);
  const edit = Number(editFactor);
  if (![prep, record, edit].every((value) => Number.isFinite(value) && value >= 0 && value <= 20)) {
    return { error: "Production multipliers must be between 0 and 20 hours per finished hour." };
  }

  const session = Number(sessionHours);
  if (!Number.isFinite(session) || session <= 0 || session > 12) {
    return { error: "A recording session should be between 0 and 12 hours." };
  }

  const finishedMinutes = words / wpm;
  const finishedHours = finishedMinutes / 60;
  const wordsPerFinishedHour = wpm * 60;

  const prepHours = finishedHours * prep;
  const recordHours = finishedHours * record;
  const editHours = finishedHours * edit;
  const totalProductionHours = prepHours + recordHours + editHours;

  const sessionsNeeded = Math.ceil(recordHours / session);
  const finishedSeconds = finishedMinutes * 60;
  const fileSizeMb = (finishedSeconds * BYTES_PER_SECOND) / BYTES_PER_MB;

  const band = LENGTH_BANDS.find((entry) => finishedHours <= entry.maxHours) ||
    LENGTH_BANDS[LENGTH_BANDS.length - 1];

  return {
    words,
    wordsPerMinute: wpm,
    wordsPerFinishedHour,
    finishedMinutes,
    finishedHours,
    finishedLabel: formatHoursMinutes(finishedMinutes),
    prepHours,
    recordHours,
    editHours,
    totalProductionHours,
    productionRatio: finishedHours > 0 ? totalProductionHours / finishedHours : 0,
    sessionsNeeded,
    sessionHours: session,
    fileSizeMb,
    band: band.label,
  };
}

/**
 * How many words to write (or cut to) in order to land on a target finished duration.
 * @param {{targetHours:number, wordsPerMinute:number}} input
 * @returns {object} { targetWords, targetMinutes } or { error }
 */
export function wordsForTargetLength({ targetHours, wordsPerMinute = DEFAULT_WPM } = {}) {
  const hours = Number(targetHours);
  const wpm = Number(wordsPerMinute);
  if (!Number.isFinite(hours) || hours <= 0) return { error: "Enter a target length in hours." };
  if (hours > 200) return { error: "Target length must be 200 hours or less." };
  if (!Number.isFinite(wpm) || wpm < MIN_WPM || wpm > MAX_WPM) {
    return { error: `Narration pace should be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }
  const targetMinutes = hours * 60;
  return { targetMinutes, targetWords: Math.round(targetMinutes * wpm) };
}
