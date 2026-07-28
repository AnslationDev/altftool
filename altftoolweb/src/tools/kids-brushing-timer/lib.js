/**
 * Kids brushing timer — session plan, progress maths and streak counting.
 *
 * The two-minute, twice-a-day standard comes from the same place in every major
 * dental guideline: NHS England, the American Dental Association and the FDI
 * all advise brushing for two minutes twice a day with fluoride toothpaste,
 * last thing at night and on one other occasion. The mouth is conventionally
 * split into four quadrants so each gets an equal 30 seconds of the two minutes.
 */

/** Standard session length in seconds (two minutes). */
export const TOTAL_SECONDS = 120;

/** Allowed range for a custom session, in seconds. */
export const MIN_SESSION_SECONDS = 30;
export const MAX_SESSION_SECONDS = 300;

/** Seconds reserved for tongue brushing when that step is switched on. */
export const TONGUE_SECONDS = 10;

/** Recommended sessions per day. */
export const SESSIONS_PER_DAY = 2;

export const QUADRANTS = [
  {
    key: "upper-right",
    label: "Top right",
    tip: "Start at the back top right. Small circles, brush angled where the tooth meets the gum.",
  },
  {
    key: "upper-left",
    label: "Top left",
    tip: "Cross to the top left. Outsides, then insides, then the flat chewing tops.",
  },
  {
    key: "lower-left",
    label: "Bottom left",
    tip: "Drop to the bottom left. Do not forget the inside surfaces facing the tongue.",
  },
  {
    key: "lower-right",
    label: "Bottom right",
    tip: "Finish the teeth at the bottom right, right to the very back molar.",
  },
];

export const TONGUE_STEP = {
  key: "tongue",
  label: "Tongue",
  tip: "Gentle sweeps from back to front along the tongue, then spit — do not rinse with water.",
};

/**
 * Fluoride toothpaste amounts and strengths, per NHS and ADA guidance.
 * Fluoride concentrations are in parts per million (ppm).
 */
export const TOOTHPASTE_GUIDE = [
  { ages: "Under 3 years", amount: "A smear, about the size of a grain of rice", fluoride: "At least 1,000 ppm fluoride" },
  { ages: "3 to 6 years", amount: "A pea-sized blob", fluoride: "More than 1,000 ppm fluoride" },
  { ages: "7 years and over", amount: "A pea-sized blob", fluoride: "1,350 to 1,500 ppm fluoride" },
];

/** Badges unlocked by consecutive brushing days. */
export const REWARD_BADGES = [
  { minStreak: 1, label: "First brush" },
  { minStreak: 3, label: "Three days strong" },
  { minStreak: 7, label: "Full week" },
  { minStreak: 30, label: "Whole month" },
];

const DAY_MS = 86400000;

/**
 * Build the ordered list of timed steps for one brushing session.
 *
 * @param {object} [input]
 * @param {number} [input.totalSeconds] session length
 * @param {boolean} [input.includeTongue] add a tongue-brushing step at the end
 * @returns {{segments:Array, totalSeconds:number, perQuadrantSeconds:number}|{error:string}}
 */
export function buildBrushingPlan({ totalSeconds = TOTAL_SECONDS, includeTongue = false } = {}) {
  const total = Math.round(Number(totalSeconds));
  if (!Number.isFinite(total)) return { error: "Enter the session length in seconds." };
  if (total < MIN_SESSION_SECONDS || total > MAX_SESSION_SECONDS) {
    return {
      error: `A session must be between ${MIN_SESSION_SECONDS} and ${MAX_SESSION_SECONDS} seconds. Dentists advise ${TOTAL_SECONDS} seconds.`,
    };
  }

  const tongue = includeTongue ? Math.min(TONGUE_SECONDS, total - QUADRANTS.length) : 0;
  const brushingSeconds = total - tongue;
  const base = Math.floor(brushingSeconds / QUADRANTS.length);
  if (base < 1) return { error: "The session is too short to give each quadrant any time." };
  const remainder = brushingSeconds - base * QUADRANTS.length;

  const segments = [];
  let cursor = 0;
  QUADRANTS.forEach((quadrant, index) => {
    // Any leftover second goes to the last quadrant so the steps stay contiguous.
    const duration = index === QUADRANTS.length - 1 ? base + remainder : base;
    segments.push({ ...quadrant, startSec: cursor, endSec: cursor + duration, durationSec: duration });
    cursor += duration;
  });

  if (tongue > 0) {
    segments.push({ ...TONGUE_STEP, startSec: cursor, endSec: cursor + tongue, durationSec: tongue });
    cursor += tongue;
  }

  return { segments, totalSeconds: cursor, perQuadrantSeconds: base };
}

/**
 * Where the session is at a given elapsed time.
 *
 * @param {object} plan a plan from buildBrushingPlan
 * @param {number} elapsedSeconds seconds since the session started
 */
export function progressAt(plan, elapsedSeconds) {
  if (!plan || !Array.isArray(plan.segments) || plan.segments.length === 0) {
    return { error: "Build a session plan first." };
  }
  const elapsed = Number(elapsedSeconds);
  if (!Number.isFinite(elapsed)) return { error: "Elapsed time must be a number of seconds." };
  if (elapsed < 0) return { error: "Elapsed time cannot be negative." };

  const total = plan.totalSeconds;
  const clamped = Math.min(elapsed, total);
  const finished = elapsed >= total;

  let index = plan.segments.findIndex((segment) => clamped < segment.endSec);
  if (index === -1) index = plan.segments.length - 1;
  const segment = plan.segments[index];

  return {
    finished,
    index,
    segment,
    stepNumber: index + 1,
    stepCount: plan.segments.length,
    elapsedInSegment: Math.max(0, clamped - segment.startSec),
    remainingInSegment: Math.max(0, segment.endSec - clamped),
    remainingTotal: Math.max(0, total - clamped),
    percent: total > 0 ? Math.round((clamped / total) * 100) : 0,
    completedSteps: finished ? plan.segments.length : index,
  };
}

/** Format whole seconds as m:ss. */
export function formatClock(seconds) {
  const value = Math.max(0, Math.round(Number(seconds) || 0));
  const mins = Math.floor(value / 60);
  const secs = value % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function toDayNumber(isoDate) {
  if (typeof isoDate !== "string") return NaN;
  const ms = Date.parse(`${isoDate.slice(0, 10)}T00:00:00`);
  return Number.isFinite(ms) ? Math.round(ms / DAY_MS) : NaN;
}

/**
 * Count consecutive brushing days ending today (or yesterday, so an unfinished
 * today does not wipe the streak).
 *
 * @param {string[]} dates ISO date strings, any order, duplicates allowed
 * @param {string} todayIso today's date as YYYY-MM-DD (passed in, never read from the clock)
 */
export function computeStreak(dates, todayIso) {
  if (!Array.isArray(dates)) return { error: "Pass the brushing days as an array of dates." };
  const today = toDayNumber(todayIso);
  if (!Number.isFinite(today)) return { error: "Pass today's date as YYYY-MM-DD." };

  const days = new Set();
  for (const value of dates) {
    const day = toDayNumber(value);
    if (Number.isFinite(day) && day <= today) days.add(day);
  }
  if (days.size === 0) return { streak: 0, brushedToday: false, totalDays: 0, badge: null };

  const brushedToday = days.has(today);
  let cursor = brushedToday ? today : today - 1;
  if (!days.has(cursor)) return { streak: 0, brushedToday, totalDays: days.size, badge: null };

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }

  const badge = REWARD_BADGES.reduce(
    (best, item) => (streak >= item.minStreak ? item : best),
    null,
  );

  return { streak, brushedToday, totalDays: days.size, badge };
}
