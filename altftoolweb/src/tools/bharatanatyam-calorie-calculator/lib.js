/**
 * Energy cost of a Bharatanatyam practice session.
 *
 * HONEST SOURCING NOTE: the compendium of physical activities has no code for
 * Bharatanatyam, or for any Indian classical dance form. Rather than invent a number,
 * this module maps each part of a session onto the closest published dance entry and
 * names that entry on every row, so you can see exactly what your figure is built on:
 *
 *   - Adavu drill and class work behave like a technique class, so they use the
 *     "ballet, modern or jazz — general, rehearsal or class" value of 5.0 METs.
 *   - Sustained nritta (jathi and korvai footwork in araimandi) and a full item run
 *     are performance-intensity work, so they use the "ballet, modern or jazz —
 *     performance, vigorous effort" value of 6.8 METs.
 *   - Abhinaya passages are largely stationary and use the slow social dancing value
 *     of 3.0 METs.
 *   - Correction and rest between items use standing quietly at 1.3 METs.
 *
 * Araimandi, the half-seated position that defines the form, is an isometric demand
 * with no published MET value of its own; it is inside the class and performance
 * figures above, not added separately.
 *
 * Energy method:
 *   VO2 (mL/kg/min) = MET x 3.5
 *   kcal/min        = VO2 x kg / 1000 x 5 kcal per litre of oxygen
 *                   = MET x 3.5 x kg / 200
 *
 * MET values: Ainsworth BE et al., "2011 Compendium of Physical Activities: a second
 * update of codes and MET values", Med Sci Sports Exerc 2011;43(8):1575-1581, major
 * heading 03 (Dancing) and 07 (Inactivity, quiet standing).
 *
 * Intensity bands and the weekly target follow the WHO 2020 guidelines: moderate is
 * 3.0-5.9 METs, vigorous is 6.0 METs and above, adults are advised to reach 150-300
 * moderate-intensity minutes a week, and one vigorous minute counts as two moderate.
 */

/** Oxygen uptake of one metabolic equivalent, mL O2 per kg per minute. */
export const ML_O2_PER_MET = 3.5;
/** Caloric equivalent of oxygen used throughout the compendium, kcal per litre. */
export const KCAL_PER_LITRE_O2 = 5;
/** 1 pound = 0.45359237 kg exactly. */
export const KG_PER_LB = 0.45359237;
/** WHO: moderate-intensity activity starts at 3.0 METs. */
export const MODERATE_MET_FLOOR = 3.0;
/** WHO: vigorous-intensity activity starts at 6.0 METs. */
export const VIGOROUS_MET_FLOOR = 6.0;
/** WHO 2020: lower end of the weekly moderate-activity recommendation, in minutes. */
export const WHO_WEEKLY_MODERATE_MIN = 150;
/** One vigorous minute counts as two moderate minutes toward the weekly target. */
export const VIGOROUS_TO_MODERATE_FACTOR = 2;
/** 365.25 days / 7 — average weeks in a calendar year. */
export const WEEKS_PER_YEAR = 365.25 / 7;

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const SEGMENT_MAX_MIN = 300;
export const SESSION_MAX_MIN = 480;
export const SESSIONS_PER_WEEK_MAX = 14;

/** Parts of a Bharatanatyam session and the published entry each MET value comes from. */
export const SESSION_SEGMENTS = [
  {
    id: "warmup",
    label: "Warm-up and basic adavu drill at class pace",
    met: 5.0,
    code: "03010",
    source: "Ballet, modern or jazz — general, rehearsal or class",
  },
  {
    id: "nritta",
    label: "Sustained nritta — jathis and korvais in araimandi",
    met: 6.8,
    code: "03012",
    source: "Ballet, modern or jazz — performance, vigorous effort",
  },
  {
    id: "item",
    label: "Full item run-through (alarippu, jathiswaram, varnam, thillana)",
    met: 6.8,
    code: "03012",
    source: "Ballet, modern or jazz — performance, vigorous effort",
  },
  {
    id: "abhinaya",
    label: "Abhinaya and expressive passages, largely stationary",
    met: 3.0,
    code: "03040",
    source: "Slow social dancing — the closest published low-movement dance entry",
  },
  {
    id: "rest",
    label: "Corrections, notation and rest between items",
    met: 1.3,
    code: "07040",
    source: "Standing quietly",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Classify a MET value into the WHO light / moderate / vigorous bands. */
export function intensityBand(met) {
  if (!isNum(met)) return null;
  if (met >= VIGOROUS_MET_FLOOR) return "vigorous";
  if (met >= MODERATE_MET_FLOOR) return "moderate";
  return "light";
}

/** Convert a body weight in kg or lb to kilograms. */
export function toKilograms(weight, unit) {
  if (!isNum(weight)) return null;
  return unit === "lb" ? weight * KG_PER_LB : weight;
}

/** kcal per minute for a given MET value and body mass. */
export function kcalPerMinute(met, weightKg) {
  if (!isNum(met) || !isNum(weightKg)) return null;
  return ((met * ML_O2_PER_MET * weightKg) / 1000) * KCAL_PER_LITRE_O2;
}

/**
 * Energy cost of a Bharatanatyam session and its weekly activity contribution.
 *
 * @param {object} input
 * @param {number} input.weight
 * @param {"kg"|"lb"} [input.weightUnit]
 * @param {Record<string, number>} input.minutes Minutes per segment id from SESSION_SEGMENTS.
 * @param {number} input.sessionsPerWeek         Practice sessions in a typical week.
 * @returns {object} Energy figures, or { error }.
 */
export function computeBharatanatyamCalories({
  weight,
  weightUnit = "kg",
  minutes = {},
  sessionsPerWeek,
}) {
  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  if (!isNum(sessionsPerWeek)) return { error: "Enter how many practice sessions you do a week." };
  if (sessionsPerWeek <= 0) return { error: "Enter at least one practice session per week." };
  if (sessionsPerWeek > SESSIONS_PER_WEEK_MAX) {
    return { error: `More than ${SESSIONS_PER_WEEK_MAX} sessions a week is outside this calculator's range.` };
  }

  const rows = [];
  let sessionMinutes = 0;
  let sessionKcal = 0;
  let metMinutes = 0;
  let moderateMinutes = 0;
  let vigorousMinutes = 0;
  let danceMinutes = 0;

  for (const segment of SESSION_SEGMENTS) {
    const raw = minutes[segment.id];
    const value = raw === undefined || raw === null || raw === "" ? 0 : raw;
    if (!isNum(value)) return { error: `Enter a number of minutes for "${segment.label}".` };
    if (value < 0) return { error: "Minutes cannot be negative." };
    if (value > SEGMENT_MAX_MIN) {
      return { error: `No single part of a session can be longer than ${SEGMENT_MAX_MIN} minutes.` };
    }
    if (value === 0) continue;

    const band = intensityBand(segment.met);
    if (band === "vigorous") vigorousMinutes += value;
    else if (band === "moderate") moderateMinutes += value;
    if (segment.id !== "rest") danceMinutes += value;

    const perMin = kcalPerMinute(segment.met, weightKg);
    const kcal = perMin * value;
    sessionMinutes += value;
    sessionKcal += kcal;
    metMinutes += segment.met * value;

    rows.push({
      id: segment.id,
      label: segment.label,
      met: segment.met,
      code: segment.code,
      band,
      minutes: value,
      kcalPerMin: perMin,
      kcal,
    });
  }

  if (sessionMinutes <= 0) return { error: "Add some minutes to at least one part of the session." };
  if (sessionMinutes > SESSION_MAX_MIN) {
    return { error: `A single session cannot exceed ${SESSION_MAX_MIN} minutes here.` };
  }

  const restingPerMin = kcalPerMinute(1, weightKg);
  const sessionRestingKcal = restingPerMin * sessionMinutes;
  const sessionNetKcal = Math.max(0, sessionKcal - sessionRestingKcal);
  const averageMet = sessionKcal / sessionRestingKcal;

  const weeklyModerateMinutes = moderateMinutes * sessionsPerWeek;
  const weeklyVigorousMinutes = vigorousMinutes * sessionsPerWeek;
  const weeklyMvpaEquivalent =
    weeklyModerateMinutes + weeklyVigorousMinutes * VIGOROUS_TO_MODERATE_FACTOR;
  const weekKcal = sessionKcal * sessionsPerWeek;

  return {
    weightKg,
    sessionsPerWeek,
    sessionMinutes,
    danceMinutes,
    sessionKcal,
    sessionNetKcal,
    sessionRestingKcal,
    averageMet,
    kcalPerMin: sessionKcal / sessionMinutes,
    metMinutes,
    moderateMinutes,
    vigorousMinutes,
    weekKcal,
    weekNetKcal: sessionNetKcal * sessionsPerWeek,
    weekMetMinutes: metMinutes * sessionsPerWeek,
    weeklyModerateMinutes,
    weeklyVigorousMinutes,
    weeklyMvpaEquivalent,
    whoTargetPercent: (weeklyMvpaEquivalent / WHO_WEEKLY_MODERATE_MIN) * 100,
    meetsWhoMinimum: weeklyMvpaEquivalent >= WHO_WEEKLY_MODERATE_MIN,
    yearKcal: weekKcal * WEEKS_PER_YEAR,
    rows,
  };
}
