/**
 * Sunscreen reapplication scheduling.
 *
 * Rules encoded here come from sunscreen labelling regulation and dermatology
 * guidance, not from any single product:
 *
 *  - US FDA sunscreen labelling directions: "Apply liberally 15 minutes before
 *    sun exposure" and "reapply at least every 2 hours".
 *  - The FDA permits only two water-resistance claims: "Water Resistant (40
 *    minutes)" and "Water Resistant (80 minutes)". That number is how long the
 *    labelled SPF is maintained while swimming or sweating, so it becomes the
 *    reapplication interval once you are wet — not the 2-hour dry interval.
 *  - A sunscreen with no water-resistance claim must be labelled "reapply
 *    immediately after swimming or sweating", so a fixed timer cannot cover it.
 *  - Reapply immediately after towel drying regardless of the timer.
 *  - Quantity: the widely used "teaspoon rule" (Cancer Council Australia) is
 *    about 5 mL per body region — face/head/neck, each arm, each leg, front of
 *    torso, back of torso — roughly 35 mL for a whole adult body, which matches
 *    the American Academy of Dermatology's "about 1 ounce, a shot glass full"
 *    and the 2 mg/cm² density used in SPF testing.
 */

/** FDA label direction: apply 15 minutes before sun exposure. */
export const PRE_APPLICATION_LEAD_MINUTES = 15;

/** FDA label direction: reapply at least every 2 hours. */
export const BASE_REAPPLY_MINUTES = 120;

/** The only water-resistance durations the FDA allows on a label, in minutes. */
export const WATER_RESISTANCE_MINUTES = Object.freeze([0, 40, 80]);

/**
 * Fallback cadence used when a NON water-resistant sunscreen is worn in water
 * or heavy sweat. It mirrors the shortest permitted water-resistance rating; it
 * is a floor, not a substitute for reapplying the moment you leave the water.
 */
export const NON_WATER_RESISTANT_WET_FALLBACK_MINUTES = 40;

/** Millilitres in one teaspoon, the unit of the teaspoon rule. */
export const TEASPOON_ML = 5;

/** Teaspoons of sunscreen per body region (Cancer Council teaspoon rule). */
export const BODY_REGIONS = Object.freeze([
  { key: "faceNeck", label: "Face, ears, head and neck", teaspoons: 1 },
  { key: "arms", label: "Both arms and hands", teaspoons: 2 },
  { key: "torsoFront", label: "Front of torso", teaspoons: 1 },
  { key: "torsoBack", label: "Back of torso", teaspoons: 1 },
  { key: "legs", label: "Both legs and feet", teaspoons: 2 },
]);

/** Activity levels that decide whether the wet or dry interval applies. */
export const ACTIVITY_LEVELS = Object.freeze(["dry", "sweating", "water"]);

/** Longest single outdoor session this planner will schedule, in minutes. */
export const MAX_EXPOSURE_MINUTES = 720;

/** Parse "HH:MM" into minutes past midnight. Returns null if unparseable. */
export function parseClock(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Format minutes past midnight as "HH:MM", wrapping past midnight. */
export function formatClock(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "--:--";
  const wrapped = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Format a minute count as "2 h 15 min". */
export function formatDuration(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "—";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

/**
 * Reapplication interval for a given activity and water-resistance rating.
 * Returns the interval in minutes plus the reason it was chosen.
 */
export function reapplyInterval({ activity, waterResistanceMinutes }) {
  if (activity === "dry") {
    return { minutes: BASE_REAPPLY_MINUTES, reason: "Dry exposure — the standard every-2-hours label direction applies." };
  }
  if (waterResistanceMinutes === 80 || waterResistanceMinutes === 40) {
    return {
      minutes: waterResistanceMinutes,
      reason: `Your sunscreen is labelled water resistant (${waterResistanceMinutes} minutes), so that rating is the interval once you are wet.`,
    };
  }
  return {
    minutes: NON_WATER_RESISTANT_WET_FALLBACK_MINUTES,
    reason:
      "Your sunscreen has no water-resistance claim, so its label requires reapplying immediately after swimming or sweating. This timer only sets a floor.",
  };
}

/**
 * Build a sunscreen application schedule.
 *
 * @param {object} input
 * @param {string} input.outdoorStart          Clock time you go outdoors, "HH:MM".
 * @param {number} input.exposureMinutes       Minutes you will be outdoors.
 * @param {string} input.activity              "dry" | "sweating" | "water".
 * @param {number} input.waterResistanceMinutes 0, 40 or 80.
 * @param {string[]} input.regions             Keys from BODY_REGIONS to cover.
 * @returns {object|{error:string}}
 */
export function buildSunscreenSchedule(input) {
  const {
    outdoorStart,
    exposureMinutes,
    activity,
    waterResistanceMinutes,
    regions,
  } = input || {};

  const startMinutes = parseClock(outdoorStart);
  if (startMinutes === null) return { error: "Enter the time you go outdoors as a 24-hour time, e.g. 10:30." };

  if (!Number.isFinite(exposureMinutes)) return { error: "Enter how long you will be outdoors, in minutes." };
  if (exposureMinutes <= 0) return { error: "Time outdoors must be more than zero minutes." };
  if (exposureMinutes > MAX_EXPOSURE_MINUTES) {
    return { error: `Plan sessions of up to ${MAX_EXPOSURE_MINUTES / 60} hours at a time — split a longer day into two.` };
  }
  if (!ACTIVITY_LEVELS.includes(activity)) return { error: "Choose an activity level: dry, sweating or in the water." };
  if (!WATER_RESISTANCE_MINUTES.includes(waterResistanceMinutes)) {
    return { error: "Water resistance must be none, 40 minutes or 80 minutes — the only ratings a label may carry." };
  }

  const selected = BODY_REGIONS.filter((region) => Array.isArray(regions) && regions.includes(region.key));
  if (selected.length === 0) return { error: "Select at least one body area to cover." };

  const interval = reapplyInterval({ activity, waterResistanceMinutes });
  const firstApplyAt = startMinutes - PRE_APPLICATION_LEAD_MINUTES;
  const endAt = startMinutes + exposureMinutes;

  const applications = [
    {
      at: firstApplyAt,
      minutesFromFirst: 0,
      label: "First application",
      detail: `${PRE_APPLICATION_LEAD_MINUTES} minutes before you go out, so the film can dry and set.`,
    },
  ];

  let offset = interval.minutes;
  // Stop scheduling once a reapplication would land after you come back inside.
  while (firstApplyAt + offset < endAt) {
    applications.push({
      at: firstApplyAt + offset,
      minutesFromFirst: offset,
      label: `Reapply #${applications.length}`,
      detail:
        activity === "dry"
          ? "Cover every exposed area again — do not just touch up the face."
          : "Dry off first, then reapply to skin that has been wet or sweaty.",
    });
    offset += interval.minutes;
  }

  const teaspoonsPerApplication = selected.reduce((sum, region) => sum + region.teaspoons, 0);
  const mlPerApplication = teaspoonsPerApplication * TEASPOON_ML;
  const totalMl = mlPerApplication * applications.length;

  return {
    intervalMinutes: interval.minutes,
    intervalReason: interval.reason,
    needsImmediateReapply: activity !== "dry" && waterResistanceMinutes === 0,
    firstApplyAt: formatClock(firstApplyAt),
    outdoorStartAt: formatClock(startMinutes),
    finishAt: formatClock(endAt),
    exposureMinutes,
    applications: applications.map((application) => ({
      ...application,
      clock: formatClock(application.at),
      offsetLabel: application.minutesFromFirst === 0 ? "start" : `+${formatDuration(application.minutesFromFirst)}`,
    })),
    applicationCount: applications.length,
    regions: selected,
    teaspoonsPerApplication,
    mlPerApplication,
    totalMl,
    totalTeaspoons: teaspoonsPerApplication * applications.length,
  };
}
