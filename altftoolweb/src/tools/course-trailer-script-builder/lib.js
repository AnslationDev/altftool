/**
 * Course trailer (course promo video) script builder.
 *
 * Two real rules drive every number here:
 *
 * 1. Narration word budget = seconds x words-per-minute / 60.
 *    Voice-over pace conventions: 120 wpm is a slow, deliberate documentary read,
 *    140 wpm is the standard conversational e-learning narration pace, and
 *    160 wpm is an energetic advertising/promo read. Above ~180 wpm listener
 *    comprehension of new material drops sharply, so the tool caps input at 220.
 *
 * 2. Beat weighting. A course trailer is a direct-response promo, so the running
 *    time is split across seven fixed beats whose shares sum to exactly 1.
 *    Seconds are distributed with the largest-remainder method so the beats
 *    always add back up to the exact total you typed.
 */

/** Meta/Facebook counts a video "view" at 3 seconds, so the hook has to land inside it. */
export const HOOK_WINDOW_SECONDS = 3;

/** Shortest trailer worth structuring (a 15s pre-roll slot). */
export const MIN_DURATION_SECONDS = 15;

/** Longest trailer that still reads as a trailer rather than a lesson. */
export const MAX_DURATION_SECONDS = 300;

/** Comprehension guard rails for narration pace, in words per minute. */
export const MIN_WPM = 80;
export const MAX_WPM = 220;

/** Named narration paces used as presets in the UI. */
export const PACE_PRESETS = [
  { id: "measured", label: "Measured (120 wpm)", wpm: 120 },
  { id: "standard", label: "Standard narration (140 wpm)", wpm: 140 },
  { id: "promo", label: "Energetic promo (160 wpm)", wpm: 160 },
];

/**
 * The seven beats of a course trailer, with the share of running time each gets.
 * Shares are chosen so the "what you'll learn" payload is the single largest
 * block and the hook stays short enough to fit the 3-second view window.
 * Sum of shares === 1.
 */
export const TRAILER_BEATS = [
  {
    id: "hook",
    title: "Hook",
    share: 0.1,
    purpose: "Open on the sharpest promise or the most surprising claim. No logo, no greeting.",
  },
  {
    id: "problem",
    title: "Problem",
    share: 0.15,
    purpose: "Name the exact frustration the learner has right now, in their words.",
  },
  {
    id: "promise",
    title: "Promise",
    share: 0.15,
    purpose: "State the outcome they walk away with, as a thing they can do.",
  },
  {
    id: "curriculum",
    title: "What you'll learn",
    share: 0.25,
    purpose: "Three to five concrete modules or skills. Show the screen, don't describe it.",
  },
  {
    id: "audience",
    title: "Who it's for",
    share: 0.1,
    purpose: "Qualify in and qualify out, so the wrong buyer self-selects away.",
  },
  {
    id: "credibility",
    title: "Credibility",
    share: 0.15,
    purpose: "One proof point: your track record, a result, or a student outcome.",
  },
  {
    id: "cta",
    title: "Call to action",
    share: 0.1,
    purpose: "One instruction, spoken and on screen at the same time.",
  },
];

const roundTo = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/**
 * Split `total` whole seconds across `shares` (which must sum to 1) using the
 * largest-remainder method, so the parts always sum back to `total` exactly.
 */
export function allocateSeconds(total, shares) {
  const raw = shares.map((share) => total * share);
  const parts = raw.map((value) => Math.floor(value));
  const assigned = parts.reduce((sum, value) => sum + value, 0);
  let remainder = total - assigned;

  const byFraction = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  let cursor = 0;
  while (remainder > 0 && byFraction.length > 0) {
    parts[byFraction[cursor % byFraction.length].index] += 1;
    cursor += 1;
    remainder -= 1;
  }
  return parts;
}

/** "0:07" style timecode from whole seconds. */
export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Split a comma or newline separated list into trimmed, non-empty items. */
export function parseTopics(raw) {
  return String(raw ?? "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function draftLine(beat, context) {
  const { courseTitle, audience, outcome, credibility, ctaAction, topics } = context;
  switch (beat.id) {
    case "hook":
      return `${outcome} — without the guesswork.`;
    case "problem":
      return `Most ${audience} stall in the same place: plenty of tutorials, no working system.`;
    case "promise":
      return `${courseTitle} takes you from that to ${outcome.toLowerCase()}.`;
    case "curriculum":
      return topics.length > 0
        ? `Inside: ${topics.join("; ")}.`
        : "Inside: list three to five modules here, one clause each.";
    case "audience":
      return `Built for ${audience}. If you already ship this daily, skip it.`;
    case "credibility":
      return credibility || "Add one proof point: years in the field, a result, or a student outcome.";
    case "cta":
      return ctaAction || "Enrol today and start with lesson one.";
    default:
      return "";
  }
}

/**
 * Build the timed trailer script.
 * @returns {{error: string} | object}
 */
export function buildTrailerScript({
  courseTitle = "",
  audience = "",
  outcome = "",
  topicsInput = "",
  credibility = "",
  ctaAction = "",
  durationSeconds,
  wordsPerMinute,
} = {}) {
  const duration = Number(durationSeconds);
  const wpm = Number(wordsPerMinute);

  if (!Number.isFinite(duration) || !Number.isFinite(wpm)) {
    return { error: "Enter a numeric trailer length and narration pace." };
  }
  if (duration < MIN_DURATION_SECONDS || duration > MAX_DURATION_SECONDS) {
    return {
      error: `Trailer length must be between ${MIN_DURATION_SECONDS} and ${MAX_DURATION_SECONDS} seconds.`,
    };
  }
  if (wpm < MIN_WPM || wpm > MAX_WPM) {
    return { error: `Narration pace must be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }

  const totalSeconds = Math.round(duration);
  const title = courseTitle.trim() || "This course";
  const forWhom = audience.trim() || "beginners";
  const result = outcome.trim() || "Ship your first real project";
  const topics = parseTopics(topicsInput);

  const context = {
    courseTitle: title,
    audience: forWhom,
    outcome: result,
    credibility: credibility.trim(),
    ctaAction: ctaAction.trim(),
    topics,
  };

  const seconds = allocateSeconds(totalSeconds, TRAILER_BEATS.map((beat) => beat.share));

  let cursor = 0;
  const beats = TRAILER_BEATS.map((beat, index) => {
    const beatSeconds = seconds[index];
    const start = cursor;
    cursor += beatSeconds;
    return {
      id: beat.id,
      title: beat.title,
      purpose: beat.purpose,
      seconds: beatSeconds,
      startSeconds: start,
      endSeconds: cursor,
      startClock: formatClock(start),
      endClock: formatClock(cursor),
      // Word budget for this beat at the chosen narration pace.
      wordBudget: Math.round((beatSeconds * wpm) / 60),
      sharePercent: roundTo(beat.share * 100, 1),
      draft: draftLine(beat, context),
    };
  });

  const totalWords = beats.reduce((sum, beat) => sum + beat.wordBudget, 0);
  const hookBeat = beats[0];
  const hookFitsViewWindow = hookBeat.seconds <= HOOK_WINDOW_SECONDS;

  const scriptText = [
    `${title} — trailer script (${formatClock(totalSeconds)}, ${wpm} wpm, ~${totalWords} words)`,
    "",
    ...beats.map(
      (beat) =>
        `[${beat.startClock}-${beat.endClock}] ${beat.title} (${beat.seconds}s, ~${beat.wordBudget} words)\n${beat.draft}`,
    ),
  ].join("\n");

  return {
    beats,
    totalSeconds,
    totalClock: formatClock(totalSeconds),
    wpm,
    totalWords,
    topicCount: topics.length,
    hookSeconds: hookBeat.seconds,
    hookFitsViewWindow,
    scriptText,
  };
}
