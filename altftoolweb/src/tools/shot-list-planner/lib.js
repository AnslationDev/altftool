/**
 * Shot List Planner — turns a list of shots into a shooting-time estimate and
 * a day count.
 *
 * The scheduling model is the one assistant directors use when boarding a
 * schedule: time on set is dominated by SETUPS, not by how long each take runs.
 *
 *   shot minutes = setup + rig + rehearsal + takes x (duration + reset)
 *
 *  - Setup is the camera position plus its lighting. 30 minutes is the common
 *    planning average for a standard setup on a small crew; a simple pickup
 *    runs 15, a complex lit setup 60, and a stunt or effects setup 90.
 *  - Rig time is the extra hardware overhead for the camera move: nothing for
 *    a locked-off tripod, 5 minutes for a pan or tilt, 10 for handheld or a
 *    gimbal, 15 for a slider or dolly, and 30 for a crane or drone (which also
 *    needs a pre-flight check).
 *  - Reset between takes is 1 minute for a static shot and 2 minutes where a
 *    dolly, gimbal or crane has to return to its mark.
 *  - Rehearsal is a flat 5 minutes per shot for blocking with talent, and 0
 *    when there is no talent in frame.
 *
 * Day capacity follows a standard 10-hour shooting day with a 1-hour meal
 * break — the DGA/SAG working pattern that requires a meal break within six
 * hours of call — and a 15% contingency for company moves, weather, resets and
 * battery/card swaps.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Minutes to build a camera position and light it. */
export const SETUP_MINUTES = {
  simple: 15,
  standard: 30,
  complex: 60,
  stunt: 90,
};

export const COMPLEXITY_OPTIONS = [
  { id: "simple", label: "Simple — reuse the existing lighting (15 min setup)" },
  { id: "standard", label: "Standard — new camera position and relight (30 min)" },
  { id: "complex", label: "Complex — multiple lights, practical effects (60 min)" },
  { id: "stunt", label: "Stunt / VFX — safety brief and rehearsal (90 min)" },
];

/** Extra minutes of rig time for the camera move, and the between-take reset. */
export const MOVEMENT_OPTIONS = [
  { id: "static", label: "Locked off (tripod)", rigMinutes: 0, resetMinutes: 1 },
  { id: "pan", label: "Pan / tilt", rigMinutes: 5, resetMinutes: 1 },
  { id: "handheld", label: "Handheld / gimbal", rigMinutes: 10, resetMinutes: 2 },
  { id: "dolly", label: "Slider / dolly", rigMinutes: 15, resetMinutes: 2 },
  { id: "crane", label: "Crane / drone", rigMinutes: 30, resetMinutes: 2 },
];

/** Standard framings, kept as a controlled vocabulary for the printable sheet. */
export const SHOT_SIZES = [
  "Extreme wide",
  "Wide",
  "Medium wide",
  "Medium",
  "Medium close-up",
  "Close-up",
  "Extreme close-up",
  "Insert",
];

export const SHOT_STATUSES = [
  { id: "planned", label: "Planned" },
  { id: "scheduled", label: "Scheduled" },
  { id: "shot", label: "Shot" },
  { id: "cut", label: "Cut" },
];

/** Statuses that no longer consume shooting time. */
const DONE_STATUSES = new Set(["shot", "cut"]);

/** Flat blocking rehearsal with talent, in minutes. */
export const REHEARSAL_MINUTES = 5;

/** Standard shooting day and the meal break that must fall inside it. */
export const DEFAULT_DAY_HOURS = 10;
export const DEFAULT_MEAL_MINUTES = 60;
/** Industry planning buffer for overruns, company moves and weather. */
export const DEFAULT_CONTINGENCY_PERCENT = 15;

/** Guard rails so one typo cannot produce a nonsense schedule. */
export const MAX_TAKES = 50;
export const MAX_SHOT_SECONDS = 3600;

/**
 * Minutes needed for one shot.
 * @param {object} shot
 * @returns {{totalMinutes: number, setup: number, rig: number, rehearsal: number, takeMinutes: number}|{error: string}}
 */
export function estimateShot(shot) {
  if (!shot || typeof shot !== "object") return { error: "Each shot must be an object." };

  const setup = SETUP_MINUTES[shot.complexity];
  if (!Number.isFinite(setup)) {
    return { error: `Shot "${shot.name || "untitled"}" has an unknown complexity.` };
  }

  const movement = MOVEMENT_OPTIONS.find((entry) => entry.id === shot.movement);
  if (!movement) {
    return { error: `Shot "${shot.name || "untitled"}" has an unknown camera move.` };
  }

  const takes = Number(shot.takes);
  if (!Number.isInteger(takes) || takes < 1) {
    return { error: `Shot "${shot.name || "untitled"}" needs at least one take.` };
  }
  if (takes > MAX_TAKES) {
    return { error: `More than ${MAX_TAKES} takes on one shot is not a schedule, it is a problem.` };
  }

  const seconds = Number(shot.durationSeconds);
  if (!Number.isFinite(seconds) || seconds < 0) {
    return { error: `Shot "${shot.name || "untitled"}" needs a duration of zero seconds or more.` };
  }
  if (seconds > MAX_SHOT_SECONDS) {
    return { error: `A single shot longer than ${MAX_SHOT_SECONDS / 60} minutes is outside this planner's range.` };
  }

  const rehearsal = shot.hasTalent === false ? 0 : REHEARSAL_MINUTES;
  const takeMinutes = takes * (seconds / 60 + movement.resetMinutes);
  const totalMinutes = setup + movement.rigMinutes + rehearsal + takeMinutes;

  return {
    totalMinutes,
    setup,
    rig: movement.rigMinutes,
    rehearsal,
    takeMinutes,
    screenSeconds: seconds,
    recordedSeconds: takes * seconds,
  };
}

/**
 * Schedule a whole shot list.
 *
 * @param {Array<object>} shots
 * @param {{dayHours?: number, mealMinutes?: number, contingencyPercent?: number}} [options]
 * @returns {object|{error: string}}
 */
export function planShotList(shots, options = {}) {
  if (!Array.isArray(shots)) return { error: "Pass the shot list as an array." };
  if (shots.length === 0) return { error: "Add at least one shot to plan a schedule." };

  const dayHours = Number(options.dayHours ?? DEFAULT_DAY_HOURS);
  const mealMinutes = Number(options.mealMinutes ?? DEFAULT_MEAL_MINUTES);
  const contingencyPercent = Number(options.contingencyPercent ?? DEFAULT_CONTINGENCY_PERCENT);

  if (!Number.isFinite(dayHours) || dayHours <= 0) {
    return { error: "The shooting day must be longer than zero hours." };
  }
  if (!Number.isFinite(mealMinutes) || mealMinutes < 0) {
    return { error: "The meal break cannot be negative." };
  }
  if (!Number.isFinite(contingencyPercent) || contingencyPercent < 0 || contingencyPercent >= 100) {
    return { error: "Contingency must be between 0 and 99 percent." };
  }

  const grossMinutes = dayHours * 60;
  const afterMeal = grossMinutes - mealMinutes;
  if (afterMeal <= 0) {
    return { error: "The meal break is longer than the shooting day." };
  }
  const productiveMinutesPerDay = afterMeal * (1 - contingencyPercent / 100);
  if (productiveMinutesPerDay <= 0) {
    return { error: "Nothing is left of the day once the meal break and contingency are removed." };
  }

  const rows = [];
  let workingMinutes = 0;
  let screenSeconds = 0;
  let recordedSeconds = 0;
  const statusCounts = Object.fromEntries(SHOT_STATUSES.map((entry) => [entry.id, 0]));
  const sceneTotals = new Map();

  for (const shot of shots) {
    const estimate = estimateShot(shot);
    if (estimate.error) return estimate;

    const status = SHOT_STATUSES.some((entry) => entry.id === shot.status) ? shot.status : "planned";
    statusCounts[status] += 1;

    const counts = !DONE_STATUSES.has(status);
    if (counts) workingMinutes += estimate.totalMinutes;
    if (status !== "cut") {
      screenSeconds += estimate.screenSeconds;
      recordedSeconds += estimate.recordedSeconds;
    }

    const scene = shot.scene || "Unassigned";
    const previous = sceneTotals.get(scene) ?? { scene, minutes: 0, shots: 0 };
    sceneTotals.set(scene, {
      scene,
      minutes: previous.minutes + (counts ? estimate.totalMinutes : 0),
      shots: previous.shots + 1,
    });

    rows.push({ ...shot, status, estimate });
  }

  const daysNeeded = workingMinutes === 0 ? 0 : Math.ceil(workingMinutes / productiveMinutesPerDay);

  return {
    rows,
    scenes: Array.from(sceneTotals.values()),
    statusCounts,
    shotCount: shots.length,
    remainingShots: shots.length - statusCounts.shot - statusCounts.cut,
    workingMinutes,
    productiveMinutesPerDay,
    daysNeeded,
    lastDayMinutes:
      daysNeeded === 0 ? 0 : workingMinutes - (daysNeeded - 1) * productiveMinutesPerDay,
    screenSeconds,
    screenMinutes: screenSeconds / 60,
    recordedSeconds,
    /** Shooting ratio: seconds recorded for every second that reaches the edit. */
    shootingRatio: screenSeconds === 0 ? null : recordedSeconds / screenSeconds,
    settings: { dayHours, mealMinutes, contingencyPercent },
  };
}

/** Format minutes as "3 h 25 min" for a call sheet. */
export function formatMinutes(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return "—";
  const whole = Math.round(minutes);
  const hours = Math.floor(whole / 60);
  const rest = whole % 60;
  if (hours === 0) return `${rest} min`;
  return `${hours} h ${rest} min`;
}

/** Plain-text shooting sheet for printing or pasting into a call sheet. */
export function buildShootingSheet(plan) {
  if (!plan || plan.error) return "";
  const lines = [
    `Shot list — ${plan.shotCount} shots, ${formatMinutes(plan.workingMinutes)} of shooting time`,
    `Estimated days: ${plan.daysNeeded} at ${formatMinutes(plan.productiveMinutesPerDay)} productive time per day`,
    "",
  ];
  plan.rows.forEach((row, index) => {
    lines.push(
      `${index + 1}. [${row.status}] ${row.scene || "Unassigned"} — ${row.name || "Untitled"} (${row.size || "n/a"}, ${row.movement}) ${row.takes} takes, ${formatMinutes(row.estimate.totalMinutes)}${row.gear ? ` | gear: ${row.gear}` : ""}`,
    );
  });
  return lines.join("\n");
}
