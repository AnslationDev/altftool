/**
 * Kneeling Chair Adaptation Planner — pure calculation module.
 *
 * A kneeling chair moves a share of your body weight onto the shins and holds
 * the hips in an open angle. Both are loads your body is not used to, so the
 * plan is a progressive ramp rather than a switch you flip on Monday morning.
 */

/**
 * The "10% rule": a long-standing loading guideline in rehabilitation and
 * endurance training that keeps weekly increases at or below about 10% of the
 * previous week. It is a rule of thumb, not a law, but it is the standard
 * starting point for progressing an unfamiliar load.
 */
export const SAFE_WEEKLY_INCREASE_PERCENT = 10;

/** Longest single sit in week one, before the shins have adapted. */
export const START_BOUT_MIN = 20;

/** How much the single-sit limit grows each week. */
export const BOUT_GROWTH_MIN_PER_WEEK = 5;

/** Ceiling on a single unbroken sit, at any stage of the ramp. */
export const MAX_BOUT_MIN = 45;

/** Longest ramp the planner will generate. */
export const MAX_WEEKS = 52;

/**
 * Mobility work that pairs with a kneeling chair: the shin pads load the
 * tibialis anterior and the ankles sit in plantarflexion, while the open hip
 * angle keeps the quadriceps and hip flexors in a shortened-to-mid range.
 */
export const PAIRED_STRETCHES = [
  {
    name: "Kneeling shin stretch",
    seconds: 60,
    cue: "Sit back on your heels with the tops of the feet flat, 30 s, twice — this is the tissue the shin pads press on.",
  },
  {
    name: "Ankle dorsiflexion rock",
    seconds: 60,
    cue: "Half-kneel, drive the front knee over the toes, 10 slow rocks each side.",
  },
  {
    name: "Standing quad stretch",
    seconds: 60,
    cue: "Heel to buttock, knees together, tailbone tucked, 30 s each side.",
  },
  {
    name: "Calf stretch at a wall",
    seconds: 60,
    cue: "Back leg straight, heel down, 30 s each side.",
  },
  {
    name: "Glute bridge",
    seconds: 45,
    cue: "12 slow reps — the kneeling position lets the glutes switch off, so wake them up.",
  },
];

/** Total seconds of the paired mobility routine. */
export const PAIRED_STRETCH_SECONDS = PAIRED_STRETCHES.reduce(
  (sum, step) => sum + step.seconds,
  0,
);

/**
 * @param {object} input
 * @param {number} input.startMinutes    Minutes on the chair in week one, 5-240.
 * @param {number} input.targetMinutes   Daily minutes you want to reach, 5-600.
 * @param {number} input.weeklyPercent   Weekly increase, 1-50.
 * @param {number} input.weekLimit       Weeks you are willing to spend, 1-52.
 * @returns {object} the ramp, or { error }.
 */
export function buildAdaptationRamp({ startMinutes, targetMinutes, weeklyPercent, weekLimit }) {
  const start = Number(startMinutes);
  const target = Number(targetMinutes);
  const percent = Number(weeklyPercent);
  const limit = Number(weekLimit);

  if ([start, target, percent, limit].some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (start < 5 || start > 240) return { error: "Start between 5 and 240 minutes a day." };
  if (target < 5 || target > 600) return { error: "Set a target between 5 and 600 minutes a day." };
  if (target < start) return { error: "The target has to be at least as long as your starting time." };
  if (percent < 1 || percent > 50) {
    return { error: "A weekly increase outside 1%–50% is not a ramp — enter a realistic figure." };
  }
  if (limit < 1 || limit > MAX_WEEKS) {
    return { error: `Choose a plan length between 1 and ${MAX_WEEKS} weeks.` };
  }

  const rate = percent / 100;
  // Week 1 sits at the starting value, so week k = start x (1+rate)^(k-1).
  const weeksNeeded =
    target === start
      ? 1
      : Math.ceil(Math.log(target / start) / Math.log(1 + rate)) + 1;
  const weeksShown = Math.min(weeksNeeded, limit, MAX_WEEKS);
  const reachedWithinLimit = weeksNeeded <= limit;

  const weeks = [];
  for (let week = 1; week <= weeksShown; week += 1) {
    const raw = start * Math.pow(1 + rate, week - 1);
    const dailyMinutes = Math.min(target, Math.round(raw));
    const boutMinutes = Math.min(
      MAX_BOUT_MIN,
      START_BOUT_MIN + (week - 1) * BOUT_GROWTH_MIN_PER_WEEK,
    );
    const bouts = Math.max(1, Math.ceil(dailyMinutes / boutMinutes));
    weeks.push({
      week,
      dailyMinutes,
      boutMinutes,
      bouts,
      averageBoutMinutes: Math.round(dailyMinutes / bouts),
      atTarget: dailyMinutes >= target,
    });
  }

  const finalWeek = weeks[weeks.length - 1];
  const totalMinutes = weeks.reduce((sum, entry) => sum + entry.dailyMinutes * 5, 0);

  return {
    weeks,
    weeksNeeded,
    weeksShown,
    reachedWithinLimit,
    finalDailyMinutes: finalWeek ? finalWeek.dailyMinutes : 0,
    targetMinutes: Math.round(target),
    startMinutes: Math.round(start),
    weeklyPercent: percent,
    aboveSafeRate: percent > SAFE_WEEKLY_INCREASE_PERCENT,
    safeRatePercent: SAFE_WEEKLY_INCREASE_PERCENT,
    totalMinutesOverPlan: totalMinutes,
    stretchSeconds: PAIRED_STRETCH_SECONDS,
  };
}

/** Minutes -> "2 h 5 m". Pure formatting helper. */
export function formatMinutes(totalMin) {
  const value = Number(totalMin);
  if (!Number.isFinite(value) || value < 0) return "—";
  const mins = Math.round(value);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} m`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} m`;
}

/** Seconds -> "4 min 45 s". Pure formatting helper. */
export function formatSeconds(totalSeconds) {
  const value = Number(totalSeconds);
  if (!Number.isFinite(value) || value < 0) return "—";
  const seconds = Math.round(value);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} s`;
  if (s === 0) return `${m} min`;
  return `${m} min ${s} s`;
}
