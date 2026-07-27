/**
 * Storyboard Builder — shot timing, SMPTE timecode and production-sheet export.
 *
 * Timecode follows SMPTE ST 12-1 non-drop-frame: HH:MM:SS:FF, where FF counts
 * from 0 to (frame rate rounded up) - 1. Dialogue timing uses a words-per-minute
 * pace, the standard way voice-over length is estimated before a record.
 *
 * Pure functions. No DOM, no React, no clock reads.
 */

/** Frame rates a storyboard is normally cut against. */
export const FRAME_RATES = Object.freeze([23.976, 24, 25, 29.97, 30, 48, 50, 60]);

/**
 * Standard shot-size abbreviations used on shot lists.
 * `suggestedSeconds` is a starting duration, not a rule — a wide establishing
 * shot needs longer on screen for the eye to read it than a close-up does.
 */
export const SHOT_TYPES = Object.freeze([
  { key: "EWS", label: "Extreme wide shot", suggestedSeconds: 5 },
  { key: "WS", label: "Wide shot", suggestedSeconds: 4 },
  { key: "MLS", label: "Medium long shot", suggestedSeconds: 4 },
  { key: "MS", label: "Medium shot", suggestedSeconds: 3 },
  { key: "MCU", label: "Medium close-up", suggestedSeconds: 3 },
  { key: "CU", label: "Close-up", suggestedSeconds: 2.5 },
  { key: "ECU", label: "Extreme close-up", suggestedSeconds: 2 },
  { key: "OTS", label: "Over the shoulder", suggestedSeconds: 3 },
  { key: "POV", label: "Point of view", suggestedSeconds: 3 },
  { key: "TWO", label: "Two shot", suggestedSeconds: 3.5 },
  { key: "INS", label: "Insert", suggestedSeconds: 1.5 },
]);

/**
 * Default narration pace. 150 words per minute is the long-standing broadcast
 * voice-over reference; conversational dialogue runs nearer 130-160.
 */
export const DEFAULT_WORDS_PER_MINUTE = 150;
export const MIN_WORDS_PER_MINUTE = 80;
export const MAX_WORDS_PER_MINUTE = 260;

/** Headroom to add either side of dialogue so a line does not start on the cut. */
export const DIALOGUE_HANDLE_SECONDS = 0.5;

/** A shot longer than this without a camera move usually reads as dead air. */
export const LONG_SHOT_WARNING_SECONDS = 12;

/** Cap on total runtime the tool will time out, to keep timecode inside 24 hours. */
export const MAX_TOTAL_SECONDS = 86399;

const text = (value) => String(value == null ? "" : value).trim();

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return Number.NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const round = (value, dp = 2) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Words in a line of dialogue or narration. */
export function countWords(value) {
  return text(value).split(/\s+/).filter(Boolean).length;
}

/** Seconds a block of speech takes at a given pace. */
export function speechSeconds(words, wordsPerMinute = DEFAULT_WORDS_PER_MINUTE) {
  const count = Number(words);
  const pace = Number(wordsPerMinute);
  if (!Number.isFinite(count) || count < 0) return 0;
  if (!Number.isFinite(pace) || pace <= 0) return 0;
  return (count / pace) * 60;
}

/**
 * Format seconds as SMPTE non-drop-frame timecode HH:MM:SS:FF.
 * Fractional rates count frames at the next whole number (29.97 -> 30 frames).
 */
export function formatTimecode(seconds, fps) {
  const rate = Number(fps);
  const value = Number(seconds);
  if (!Number.isFinite(rate) || rate <= 0) return { error: "Frame rate must be greater than 0." };
  if (!Number.isFinite(value) || value < 0) return { error: "Time must be 0 seconds or more." };
  const framesPerSecond = Math.ceil(rate);
  const totalFrames = Math.round(value * rate);
  const wholeSeconds = Math.floor(totalFrames / rate);
  const frames = Math.min(framesPerSecond - 1, Math.round(totalFrames - wholeSeconds * rate));
  const hh = Math.floor(wholeSeconds / 3600);
  const mm = Math.floor((wholeSeconds % 3600) / 60);
  const ss = wholeSeconds % 60;
  const pad = (n, width = 2) => String(n).padStart(width, "0");
  return { timecode: `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(frames)}`, totalFrames };
}

/** Seconds as m:ss, for the human-readable column. */
export function formatClock(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  const mm = Math.floor(value / 60);
  const ss = Math.floor(value % 60);
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

/**
 * Build the storyboard timing sheet.
 *
 * @param {object} input
 * @param {string} input.title
 * @param {number} input.frameRate
 * @param {number} input.targetRuntimeSeconds  Runtime you are cutting to (0 = no target).
 * @param {number} input.wordsPerMinute        Speaking pace for dialogue estimates.
 * @param {Array} input.shots  [{ id, scene, slug, type, action, dialogue, durationSeconds }]
 * @returns {object} sheet, or { error }
 */
export function buildStoryboard(input = {}) {
  const title = text(input.title) || "Untitled storyboard";
  const frameRate = toNumber(input.frameRate);
  const wordsPerMinute = toNumber(input.wordsPerMinute);
  const targetRuntime = toNumber(input.targetRuntimeSeconds);

  if (!Number.isFinite(frameRate) || frameRate <= 0) {
    return { error: "Pick a frame rate greater than 0." };
  }
  if (!Number.isFinite(wordsPerMinute) || wordsPerMinute < MIN_WORDS_PER_MINUTE || wordsPerMinute > MAX_WORDS_PER_MINUTE) {
    return {
      error: `Speaking pace must be between ${MIN_WORDS_PER_MINUTE} and ${MAX_WORDS_PER_MINUTE} words per minute.`,
    };
  }
  if (!Number.isFinite(targetRuntime) || targetRuntime < 0) {
    return { error: "Target runtime must be 0 seconds or more (use 0 for no target)." };
  }

  const rawShots = (Array.isArray(input.shots) ? input.shots : []).filter(
    (shot) => shot && (text(shot.action) !== "" || text(shot.dialogue) !== "" || text(shot.slug) !== ""),
  );

  if (rawShots.length === 0) {
    return { error: "Add at least one shot with an action, a slug line or a line of dialogue." };
  }

  let elapsed = 0;
  let dialogueWords = 0;
  const warnings = [];
  const shots = [];

  for (let index = 0; index < rawShots.length; index += 1) {
    const shot = rawShots[index];
    const duration = toNumber(shot.durationSeconds);
    if (!Number.isFinite(duration) || duration <= 0) {
      return { error: `Shot ${index + 1} needs a duration greater than 0 seconds.` };
    }
    if (elapsed + duration > MAX_TOTAL_SECONDS) {
      return { error: "Total runtime is over 24 hours — trim the shot durations." };
    }

    const words = countWords(shot.dialogue);
    dialogueWords += words;
    const speech = speechSeconds(words, wordsPerMinute);
    const needed = words > 0 ? speech + DIALOGUE_HANDLE_SECONDS * 2 : 0;

    const start = formatTimecode(elapsed, frameRate);
    const end = formatTimecode(elapsed + duration, frameRate);

    const shotWarnings = [];
    if (needed > duration) {
      shotWarnings.push(
        `Dialogue needs about ${round(needed, 1)}s including handles but the shot holds ${round(duration, 1)}s.`,
      );
    }
    if (duration > LONG_SHOT_WARNING_SECONDS) {
      shotWarnings.push(
        `${round(duration, 1)}s on one static frame is over the ${LONG_SHOT_WARNING_SECONDS}s dead-air guide.`,
      );
    }
    warnings.push(...shotWarnings.map((message) => `Shot ${index + 1}: ${message}`));

    shots.push({
      index: index + 1,
      scene: text(shot.scene) || "1",
      slug: text(shot.slug),
      type: text(shot.type) || "MS",
      action: text(shot.action),
      dialogue: text(shot.dialogue),
      durationSeconds: round(duration, 2),
      words,
      speechSeconds: round(speech, 2),
      startSeconds: round(elapsed, 2),
      endSeconds: round(elapsed + duration, 2),
      startTimecode: start.timecode,
      endTimecode: end.timecode,
      clock: formatClock(elapsed),
      warnings: shotWarnings,
    });

    elapsed += duration;
  }

  const totalSeconds = round(elapsed, 2);
  const totalFrames = Math.round(elapsed * frameRate);
  const totalSpeech = round(speechSeconds(dialogueWords, wordsPerMinute), 2);
  const dialogueDensityPct = totalSeconds > 0 ? round((totalSpeech / totalSeconds) * 100, 1) : 0;
  const averageShotSeconds = round(totalSeconds / shots.length, 2);

  const sceneTotals = {};
  for (const shot of shots) {
    sceneTotals[shot.scene] = round((sceneTotals[shot.scene] || 0) + shot.durationSeconds, 2);
  }

  const overUnderSeconds = targetRuntime > 0 ? round(totalSeconds - targetRuntime, 2) : null;
  const targetFillPct = targetRuntime > 0 ? round((totalSeconds / targetRuntime) * 100, 1) : null;

  const sheetRows = shots.map((shot) =>
    [
      shot.index,
      shot.scene,
      shot.type,
      shot.startTimecode,
      `${shot.durationSeconds}s`,
      shot.slug || "—",
      shot.action || "—",
      shot.dialogue || "—",
    ].join(" | "),
  );

  const markdown = [
    `# ${title}`,
    "",
    `Runtime ${formatClock(totalSeconds)} (${totalSeconds}s, ${totalFrames} frames at ${frameRate} fps)`,
    `${shots.length} shot(s), average ${averageShotSeconds}s, dialogue ${dialogueWords} words (${dialogueDensityPct}% of runtime)`,
    "",
    "| # | Scene | Shot | In | Dur | Slug | Action | Dialogue |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...sheetRows.map((row) => `| ${row} |`),
    "",
  ].join("\n");

  const csv = [
    "index,scene,shot_type,start_timecode,end_timecode,duration_seconds,slug,action,dialogue",
    ...shots.map((shot) =>
      [
        shot.index,
        shot.scene,
        shot.type,
        shot.startTimecode,
        shot.endTimecode,
        shot.durationSeconds,
        shot.slug,
        shot.action,
        shot.dialogue,
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\n");

  return {
    title,
    frameRate,
    shots,
    shotCount: shots.length,
    totalSeconds,
    totalFrames,
    totalTimecode: formatTimecode(totalSeconds, frameRate).timecode,
    totalClock: formatClock(totalSeconds),
    averageShotSeconds,
    dialogueWords,
    dialogueSeconds: totalSpeech,
    dialogueDensityPct,
    sceneTotals,
    overUnderSeconds,
    targetFillPct,
    warnings,
    markdown,
    csv,
  };
}
