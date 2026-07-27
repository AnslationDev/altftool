/**
 * Podcast episode length planner.
 *
 * The model is a simple, exact time budget:
 *
 *   target = sum(fixed segments) + sum(flexible segments)
 *
 * Fixed segments (an intro read, a 30-second ad, a sponsor bumper) take the
 * duration you give them. Whatever is left over is shared between the flexible
 * segments in proportion to their weights, so a weight of 2 gets twice the
 * airtime of a weight of 1. If the fixed segments already exceed the target,
 * there is nothing to share and the plan is rejected rather than silently
 * producing negative time.
 *
 * Word budgets use a speaking rate. Unhurried conversational English is
 * commonly measured at 140-160 words per minute, and audiobook narration is
 * standardised at roughly 150 wpm, so 150 is the default here. Scripted reads
 * are usually faster than unscripted conversation, which is why the rate is an
 * input rather than a constant.
 */

/** Default speaking rate in words per minute for conversational English. */
export const DEFAULT_WPM = 150;
/** Sensible bounds on a speaking rate before the numbers stop meaning anything. */
export const MIN_WPM = 80;
export const MAX_WPM = 260;
/** Longest episode this planner will lay out, in minutes. */
export const MAX_EPISODE_MINUTES = 600;
/** IAB-standard audio spot lengths, in seconds. */
export const STANDARD_SPOT_SECONDS = [15, 30, 60];
/**
 * Ad load above this share of runtime is where listener drop-off complaints
 * typically start; it is a rule of thumb, not a platform rule.
 */
export const AD_LOAD_WARNING = 0.15;

/** A starting running order that matches a typical interview show. */
export const DEFAULT_SEGMENTS = [
  { name: "Cold open", mode: "fixed", minutes: 1, weight: 1, isAd: false },
  { name: "Show intro", mode: "fixed", minutes: 1.5, weight: 1, isAd: false },
  { name: "Pre-roll ad", mode: "fixed", minutes: 0.5, weight: 1, isAd: true },
  { name: "Main interview", mode: "flex", minutes: 0, weight: 3, isAd: false },
  { name: "Mid-roll ad", mode: "fixed", minutes: 1, weight: 1, isAd: true },
  { name: "Listener questions", mode: "flex", minutes: 0, weight: 1, isAd: false },
  { name: "Outro and credits", mode: "fixed", minutes: 1.5, weight: 1, isAd: false },
];

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
};

/** Format whole seconds as m:ss, or h:mm:ss once past an hour. */
export function formatClock(totalSeconds) {
  const value = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/** Convert minutes to a word count at a given speaking rate. */
export function wordsFor(minutes, wpm) {
  const m = Math.max(0, Number(minutes) || 0);
  const rate = Math.max(1, Number(wpm) || DEFAULT_WPM);
  return Math.round(m * rate);
}

/**
 * Lay out an episode against a target runtime.
 *
 * @param {object} input
 * @param {number|string} input.targetMinutes
 * @param {Array<{name:string, mode:string, minutes:number, weight:number, isAd:boolean}>} input.segments
 * @param {number|string} [input.speakingRate]
 * @returns {object} plan or { error }
 */
export function planEpisode({ targetMinutes, segments = [], speakingRate = DEFAULT_WPM } = {}) {
  const target = toNumber(targetMinutes);
  if (Number.isNaN(target)) return { error: "Enter the target runtime in minutes." };
  if (target <= 0) return { error: "Target runtime must be greater than zero." };
  if (target > MAX_EPISODE_MINUTES) {
    return { error: `Target runtime must be under ${MAX_EPISODE_MINUTES} minutes.` };
  }

  const rate = toNumber(speakingRate);
  if (Number.isNaN(rate)) return { error: "Speaking rate must be a number." };
  if (rate < MIN_WPM || rate > MAX_WPM) {
    return { error: `Speaking rate should be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }

  if (!Array.isArray(segments) || segments.length === 0) {
    return { error: "Add at least one segment to plan." };
  }

  const cleaned = [];
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const name = String(segment?.name ?? "").trim() || `Segment ${index + 1}`;
    const mode = segment?.mode === "flex" ? "flex" : "fixed";
    const minutes = toNumber(segment?.minutes ?? 0);
    const weight = toNumber(segment?.weight ?? 1);
    if (mode === "fixed") {
      if (Number.isNaN(minutes)) return { error: `"${name}" needs a duration in minutes.` };
      if (minutes < 0) return { error: `"${name}" cannot have a negative duration.` };
    } else {
      if (Number.isNaN(weight)) return { error: `"${name}" needs a numeric weight.` };
      if (weight <= 0) return { error: `"${name}" needs a weight greater than zero.` };
    }
    cleaned.push({ name, mode, minutes: mode === "fixed" ? minutes : 0, weight, isAd: Boolean(segment?.isAd) });
  }

  const fixedMinutes = cleaned
    .filter((segment) => segment.mode === "fixed")
    .reduce((sum, segment) => sum + segment.minutes, 0);
  const flexSegments = cleaned.filter((segment) => segment.mode === "flex");
  const flexWeight = flexSegments.reduce((sum, segment) => sum + segment.weight, 0);
  const flexPool = target - fixedMinutes;

  if (flexPool < 0) {
    return {
      error: `Fixed segments already run ${(fixedMinutes - target).toFixed(1)} minutes over the ${target}-minute target.`,
    };
  }
  if (flexSegments.length === 0 && Math.abs(flexPool) > 0.01) {
    return {
      error: `Every segment is fixed, so the running order totals ${fixedMinutes.toFixed(1)} minutes, not ${target}. Add a flexible segment or change the target.`,
    };
  }
  if (flexSegments.length > 0 && flexPool === 0) {
    return { error: "The fixed segments use the whole target, leaving nothing for the flexible ones." };
  }

  let cursorSeconds = 0;
  const rows = cleaned.map((segment) => {
    const minutes =
      segment.mode === "fixed" ? segment.minutes : (flexPool * segment.weight) / flexWeight;
    const seconds = minutes * 60;
    const row = {
      ...segment,
      minutes,
      seconds,
      startSeconds: cursorSeconds,
      endSeconds: cursorSeconds + seconds,
      start: formatClock(cursorSeconds),
      end: formatClock(cursorSeconds + seconds),
      duration: formatClock(seconds),
      words: segment.isAd ? 0 : wordsFor(minutes, rate),
      share: target > 0 ? minutes / target : 0,
    };
    cursorSeconds += seconds;
    return row;
  });

  const adMinutes = rows.filter((row) => row.isAd).reduce((sum, row) => sum + row.minutes, 0);
  const contentMinutes = target - adMinutes;
  const adShare = target > 0 ? adMinutes / target : 0;
  const totalWords = rows.reduce((sum, row) => sum + row.words, 0);

  return {
    target,
    rate,
    rows,
    fixedMinutes,
    flexPool,
    flexWeight,
    adMinutes,
    adShare,
    contentMinutes,
    totalWords,
    totalSeconds: cursorSeconds,
    adLoadHigh: adShare > AD_LOAD_WARNING,
    runtime: formatClock(target * 60),
    summary: `${rows.length} segments across ${formatClock(target * 60)}, with ${formatClock(
      adMinutes * 60,
    )} of advertising.`,
  };
}
