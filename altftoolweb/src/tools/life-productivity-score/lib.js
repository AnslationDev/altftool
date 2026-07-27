/**
 * Life Productivity Score — a transparent 100-point daily score.
 *
 * The score is the sum of seven weighted components. Every target below is a
 * published guideline rather than an invented number, and every weight is
 * declared in COMPONENTS so the arithmetic can be checked by hand:
 *
 *   Sleep            25 pts  7–9 h/night, National Sleep Foundation adult range
 *   Focused work     20 pts  3–5 h/day of deliberate, undistracted work
 *   Physical activity15 pts  150 min moderate activity per week (WHO 2020) ≈ 21 min/day
 *   Task completion  15 pts  tasks finished ÷ tasks planned
 *   Discretionary
 *   screen time      10 pts  full marks at 2 h or less of non-work screen time
 *   Learning          8 pts  30 min/day of reading or study
 *   Social contact    7 pts  30 min/day of meaningful non-work contact
 *
 * It is a self-tracking aid, not a clinical or diagnostic instrument.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Minutes in an hour, and hours in a day — used by the sanity check. */
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;

/** National Sleep Foundation recommendation for adults aged 18–64: 7–9 hours. */
export const SLEEP_TARGET_MIN_H = 7;
export const SLEEP_TARGET_MAX_H = 9;
/** Points lost per hour outside the recommended sleep range. */
export const SLEEP_PENALTY_PER_HOUR = 8;

/** Sustained deliberate work tops out around 4 h/day (Ericsson et al., 1993). */
export const FOCUS_TARGET_MIN_H = 3;
export const FOCUS_TARGET_MAX_H = 5;
/** Points lost per hour of "focused work" claimed beyond the plausible ceiling. */
export const FOCUS_PENALTY_PER_HOUR = 4;

/** WHO 2020 guideline: 150 minutes of moderate activity per week. */
export const ACTIVITY_WEEKLY_TARGET_MIN = 150;
export const ACTIVITY_DAILY_TARGET_MIN = ACTIVITY_WEEKLY_TARGET_MIN / 7;

/** Discretionary (non-work) screen time allowance before points come off. */
export const SCREEN_ALLOWANCE_H = 2;
export const SCREEN_PENALTY_PER_HOUR = 5;

/** Daily targets for the two smaller components. */
export const LEARNING_TARGET_MIN = 30;
export const SOCIAL_TARGET_MIN = 30;

/** Component weights — these must add up to 100. */
export const COMPONENTS = [
  { id: "sleep", label: "Sleep", weight: 25, target: "7–9 hours" },
  { id: "focus", label: "Focused work", weight: 20, target: "3–5 hours" },
  { id: "activity", label: "Physical activity", weight: 15, target: "21+ minutes" },
  { id: "tasks", label: "Task completion", weight: 15, target: "all planned tasks" },
  { id: "screen", label: "Discretionary screen time", weight: 10, target: "2 hours or less" },
  { id: "learning", label: "Learning", weight: 8, target: "30+ minutes" },
  { id: "social", label: "Social contact", weight: 7, target: "30+ minutes" },
];

/** Score bands used for the verdict line. */
export const SCORE_BANDS = [
  { min: 90, label: "Exceptional", note: "Every pillar is on target — protect this routine." },
  { min: 75, label: "Strong", note: "A well-balanced day with one area left to tidy up." },
  { min: 60, label: "Solid", note: "The basics are in place; one habit is dragging the total down." },
  { min: 40, label: "Building", note: "Several pillars are short of target — fix the biggest one first." },
  { min: 0, label: "Needs attention", note: "Start with sleep; it carries the largest weight for a reason." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/** Sleep: full marks inside the recommended range, tapering either side. */
export function scoreSleep(hours) {
  if (!isNum(hours) || hours < 0) return 0;
  if (hours >= SLEEP_TARGET_MIN_H && hours <= SLEEP_TARGET_MAX_H) return 25;
  const deviation =
    hours < SLEEP_TARGET_MIN_H ? SLEEP_TARGET_MIN_H - hours : hours - SLEEP_TARGET_MAX_H;
  return Math.max(0, 25 - deviation * SLEEP_PENALTY_PER_HOUR);
}

/** Focused work: linear up to 3 h, full marks 3–5 h, tapering above 5 h. */
export function scoreFocus(hours) {
  if (!isNum(hours) || hours < 0) return 0;
  if (hours >= FOCUS_TARGET_MIN_H && hours <= FOCUS_TARGET_MAX_H) return 20;
  if (hours < FOCUS_TARGET_MIN_H) return (20 * hours) / FOCUS_TARGET_MIN_H;
  return Math.max(0, 20 - (hours - FOCUS_TARGET_MAX_H) * FOCUS_PENALTY_PER_HOUR);
}

/** Physical activity: linear to the daily share of the WHO weekly target. */
export function scoreActivity(minutes) {
  if (!isNum(minutes) || minutes < 0) return 0;
  return clamp((15 * minutes) / ACTIVITY_DAILY_TARGET_MIN, 0, 15);
}

/** Task completion: the plain ratio, capped at 100%. */
export function scoreTasks(done, planned) {
  if (!isNum(done) || !isNum(planned) || planned <= 0 || done < 0) return 0;
  return 15 * clamp(done / planned, 0, 1);
}

/** Discretionary screen time: full marks up to the allowance, then a taper. */
export function scoreScreen(hours) {
  if (!isNum(hours) || hours < 0) return 0;
  if (hours <= SCREEN_ALLOWANCE_H) return 10;
  return Math.max(0, 10 - (hours - SCREEN_ALLOWANCE_H) * SCREEN_PENALTY_PER_HOUR);
}

/** Learning minutes, linear to the 30-minute target. */
export function scoreLearning(minutes) {
  if (!isNum(minutes) || minutes < 0) return 0;
  return clamp((8 * minutes) / LEARNING_TARGET_MIN, 0, 8);
}

/** Social contact minutes, linear to the 30-minute target. */
export function scoreSocial(minutes) {
  if (!isNum(minutes) || minutes < 0) return 0;
  return clamp((7 * minutes) / SOCIAL_TARGET_MIN, 0, 7);
}

/** Band lookup for a finished score. */
export function bandForScore(score) {
  return SCORE_BANDS.find((band) => score >= band.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

/**
 * Calculate the day's score.
 *
 * @param {object} input
 * @param {number} input.sleepHours
 * @param {number} input.focusHours hours of deliberate, undistracted work
 * @param {number} input.activityMinutes moderate-or-harder movement
 * @param {number} input.tasksDone
 * @param {number} input.tasksPlanned
 * @param {number} input.screenHours non-work screen time
 * @param {number} input.learningMinutes
 * @param {number} input.socialMinutes
 * @returns {object} result, or { error }
 */
export function calculateProductivityScore({
  sleepHours,
  focusHours,
  activityMinutes,
  tasksDone,
  tasksPlanned,
  screenHours,
  learningMinutes,
  socialMinutes,
}) {
  const numbers = {
    sleepHours,
    focusHours,
    activityMinutes,
    tasksDone,
    tasksPlanned,
    screenHours,
    learningMinutes,
    socialMinutes,
  };
  for (const [key, value] of Object.entries(numbers)) {
    if (!isNum(value)) return { error: `Enter a number for every field — "${key}" is missing.` };
    if (value < 0) return { error: "None of these values can be negative." };
  }
  if (tasksPlanned > 0 && tasksDone > tasksPlanned) {
    return { error: "You cannot finish more tasks than you planned — raise the planned count." };
  }

  const loggedHours =
    sleepHours +
    focusHours +
    screenHours +
    (activityMinutes + learningMinutes + socialMinutes) / MINUTES_PER_HOUR;
  if (loggedHours > HOURS_PER_DAY) {
    return {
      error: `That adds up to ${loggedHours.toFixed(1)} hours — a day only has ${HOURS_PER_DAY}.`,
    };
  }

  const breakdown = [
    { id: "sleep", points: scoreSleep(sleepHours) },
    { id: "focus", points: scoreFocus(focusHours) },
    { id: "activity", points: scoreActivity(activityMinutes) },
    { id: "tasks", points: scoreTasks(tasksDone, tasksPlanned) },
    { id: "screen", points: scoreScreen(screenHours) },
    { id: "learning", points: scoreLearning(learningMinutes) },
    { id: "social", points: scoreSocial(socialMinutes) },
  ].map((entry) => {
    const meta = COMPONENTS.find((component) => component.id === entry.id);
    return {
      ...entry,
      label: meta.label,
      weight: meta.weight,
      target: meta.target,
      lost: meta.weight - entry.points,
      percentOfWeight: (entry.points / meta.weight) * 100,
    };
  });

  const raw = breakdown.reduce((total, entry) => total + entry.points, 0);
  const score = Math.round(clamp(raw, 0, 100));
  const band = bandForScore(score);

  // The single change worth making first: the component losing the most points.
  const biggestGap = [...breakdown].sort((a, b) => b.lost - a.lost)[0];

  return {
    score,
    rawScore: raw,
    band: band.label,
    bandNote: band.note,
    breakdown,
    loggedHours,
    unloggedHours: HOURS_PER_DAY - loggedHours,
    biggestGap,
    tasksPlanned,
    tasksDone,
  };
}

/**
 * Average a run of daily scores — the number worth watching, since one day
 * tells you very little.
 *
 * @param {number[]} scores
 * @returns {{ average: number, best: number, worst: number, days: number } | { error: string }}
 */
export function averageScore(scores) {
  if (!Array.isArray(scores) || scores.length === 0) {
    return { error: "Add at least one day before averaging." };
  }
  const valid = scores.filter((value) => isNum(value) && value >= 0 && value <= 100);
  if (valid.length === 0) return { error: "None of those values are scores between 0 and 100." };
  const total = valid.reduce((sum, value) => sum + value, 0);
  return {
    average: total / valid.length,
    best: Math.max(...valid),
    worst: Math.min(...valid),
    days: valid.length,
  };
}
