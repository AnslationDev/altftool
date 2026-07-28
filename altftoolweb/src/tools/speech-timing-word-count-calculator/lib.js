/**
 * Speech Timing Calculator — word count to spoken duration.
 *
 * Core relation: speaking minutes = words / words-per-minute. Everything else is
 * overhead added on top (slide changes, planned pauses, demos), because those
 * seconds are not words being spoken.
 *
 * Rate references:
 *  - Brysbaert (2019), a meta-analysis of 190 reading studies, puts reading aloud
 *    at about 183 words per minute and silent reading of non-fiction at about
 *    238 words per minute for adults in English.
 *  - Published analyses of TED talk transcripts put the average delivery rate at
 *    roughly 160-165 words per minute.
 *  - ACX audiobook guidance works out to roughly 9,300 finished words per hour,
 *    which is about 155 words per minute.
 */

/** Adult silent reading rate for non-fiction English prose (Brysbaert 2019). */
export const SILENT_READING_WPM = 238;
/** Adult reading-aloud rate in English (Brysbaert 2019). */
export const READ_ALOUD_WPM = 183;

/** Presets the tool offers, each with the context the figure comes from. */
export const PACE_PRESETS = [
  { id: "ceremonial", label: "Ceremonial / eulogy", wpm: 100, note: "Deliberate, heavy pausing, emotionally weighted material." },
  { id: "technical", label: "Technical or complex", wpm: 120, note: "Dense content an audience has to follow in real time." },
  { id: "conversational", label: "Conversational presentation", wpm: 130, note: "Relaxed business or classroom delivery." },
  { id: "keynote", label: "Keynote / conference talk", wpm: 150, note: "Rehearsed delivery with deliberate emphasis." },
  { id: "audiobook", label: "Audiobook narration", wpm: 155, note: "About 9,300 finished words an hour, the usual ACX target." },
  { id: "ted", label: "TED-style talk", wpm: 163, note: "Average measured across published TED transcripts." },
  { id: "podcast", label: "Podcast / broadcast", wpm: 170, note: "Natural unscripted conversation runs faster than a written script." },
  { id: "fast", label: "Fast delivery", wpm: 190, note: "Energetic, tightly scripted; hard for an audience to follow for long." },
];

/** Default seconds absorbed by a single slide change with a beat to let it land. */
export const DEFAULT_SECONDS_PER_SLIDE = 8;
/** Below this rate a delivery is barely speech; above it, barely intelligible. */
export const MIN_WPM = 40;
export const MAX_WPM = 400;
/** Guard on the size of pasted text so the counter stays responsive. */
export const MAX_WORDS = 500000;

/** Count words: any run of non-whitespace separated by whitespace. */
export function countWords(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Count characters excluding all whitespace. */
export function countCharacters(text, { includeSpaces = true } = {}) {
  const value = String(text ?? "");
  return includeSpaces ? value.length : value.replace(/\s/g, "").length;
}

/** Format a duration given in minutes as "M min S sec" / "H hr M min". */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return "—";
  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) return `${hours} hr ${String(mins).padStart(2, "0")} min`;
  if (mins > 0) return `${mins} min ${String(secs).padStart(2, "0")} sec`;
  return `${secs} sec`;
}

/** Format a duration as a clock-style mm:ss (or h:mm:ss). */
export function formatClock(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return "—";
  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/**
 * Estimate spoken duration and, if a target length is given, the word budget for it.
 * Returns { error } for invalid input rather than a misleading number.
 */
export function estimateSpeech({
  words = 0,
  wpm = 130,
  slides = 0,
  secondsPerSlide = DEFAULT_SECONDS_PER_SLIDE,
  extraPauseSeconds = 0,
  targetMinutes = 0,
} = {}) {
  const wordCount = Number(words);
  const rate = Number(wpm);
  const slideCount = Number(slides);
  const perSlide = Number(secondsPerSlide);
  const extraSeconds = Number(extraPauseSeconds);
  const target = Number(targetMinutes);

  if (![wordCount, rate, slideCount, perSlide, extraSeconds, target].every(Number.isFinite)) {
    return { error: "Enter valid numbers in every field." };
  }
  if (wordCount < 0 || slideCount < 0 || perSlide < 0 || extraSeconds < 0 || target < 0) {
    return { error: "Word count, slides, pauses and target length cannot be negative." };
  }
  if (wordCount > MAX_WORDS) {
    return { error: `That is over ${MAX_WORDS.toLocaleString("en")} words — paste a single talk rather than a whole book.` };
  }
  if (rate < MIN_WPM || rate > MAX_WPM) {
    return { error: `Speaking pace should be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }

  const speakingMinutes = wordCount / rate;
  const overheadMinutes = (slideCount * perSlide + extraSeconds) / 60;
  const totalMinutes = speakingMinutes + overheadMinutes;

  // Word budget: whatever time is left after overhead, spent at the chosen pace.
  const usableMinutes = target > 0 ? target - overheadMinutes : 0;
  const wordBudget = target > 0 ? Math.max(0, Math.floor(usableMinutes * rate)) : null;
  const targetFits = target > 0 ? usableMinutes > 0 : null;
  const deltaMinutes = target > 0 ? totalMinutes - target : null;
  const wordsToCut = target > 0 ? Math.max(0, wordCount - (wordBudget ?? 0)) : null;
  const wordsToAdd = target > 0 ? Math.max(0, (wordBudget ?? 0) - wordCount) : null;

  return {
    words: wordCount,
    wpm: rate,
    speakingMinutes,
    overheadMinutes,
    totalMinutes,
    silentReadMinutes: wordCount / SILENT_READING_WPM,
    readAloudMinutes: wordCount / READ_ALOUD_WPM,
    // How many words a minute of finished talk actually carries once overhead is counted.
    effectiveWpm: totalMinutes > 0 ? wordCount / totalMinutes : 0,
    wordBudget,
    targetFits,
    deltaMinutes,
    wordsToCut,
    wordsToAdd,
  };
}

/**
 * Duration of the same script across every pace preset, for the comparison table.
 * Overhead is added to each row so the rows are directly comparable.
 */
export function paceComparison({ words = 0, slides = 0, secondsPerSlide = DEFAULT_SECONDS_PER_SLIDE, extraPauseSeconds = 0 } = {}) {
  const rows = [];
  for (const preset of PACE_PRESETS) {
    const result = estimateSpeech({
      words,
      wpm: preset.wpm,
      slides,
      secondsPerSlide,
      extraPauseSeconds,
    });
    if (result.error) return { error: result.error, rows: [] };
    rows.push({
      id: preset.id,
      label: preset.label,
      wpm: preset.wpm,
      note: preset.note,
      totalMinutes: result.totalMinutes,
    });
  }
  return { rows };
}
