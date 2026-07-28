/**
 * Energy cost of a garba or dandiya raas night.
 *
 * HONEST SOURCING NOTE: the compendium of physical activities has no code for garba
 * or dandiya. It does have a code for general dancing that explicitly covers folk and
 * line dancing at 7.8 METs, which is the right home for full-tempo garba, and lower
 * entries for slower social dancing and class-pace dance. Each tempo band below names
 * the published entry it borrows from — no value here is invented.
 *
 * A garba night is also mostly not dancing. Rounds are interrupted by aarti, costume
 * fixes, water breaks and standing in the circle waiting for the tempo to pick up, so
 * standing time is entered separately and credited at the standing-quietly value of
 * 1.3 METs rather than counted as dance.
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
 * 3.0-5.9 METs, vigorous is 6.0 METs and above, and one vigorous minute counts as two
 * moderate minutes toward the 150-minute weekly target.
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
/** Navratri runs for nine nights. */
export const NAVRATRI_NIGHTS = 9;

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const SEGMENT_MAX_MIN = 480;
export const NIGHT_MAX_MIN = 720;
export const NIGHTS_MAX = 15;

/** Tempo bands of a garba night and the published entry each MET value comes from. */
export const GARBA_SEGMENTS = [
  {
    id: "warmup",
    label: "Slow opening rounds and simple two-clap taali",
    met: 3.0,
    code: "03040",
    source: "Slow social dancing — the closest published low-tempo dance entry",
  },
  {
    id: "steady",
    label: "Steady mid-tempo garba, three- and four-clap steps",
    met: 5.0,
    code: "03010",
    source: "Dance class or rehearsal pace",
  },
  {
    id: "fast",
    label: "Full-tempo garba and dandiya raas",
    met: 7.8,
    code: "03031",
    source: "General dancing, explicitly including folk and line dancing",
  },
  {
    id: "standing",
    label: "Standing in the circle, aarti, water and costume breaks",
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
 * Energy cost of a garba night, and of a whole Navratri run.
 *
 * @param {object} input
 * @param {number} input.weight
 * @param {"kg"|"lb"} [input.weightUnit]
 * @param {Record<string, number>} input.minutes Minutes per segment id from GARBA_SEGMENTS.
 * @param {number} input.nights                  Nights you dance across the festival.
 * @returns {object} Energy figures, or { error }.
 */
export function computeGarbaCalories({ weight, weightUnit = "kg", minutes = {}, nights }) {
  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  if (!isNum(nights)) return { error: "Enter how many nights you dance." };
  if (nights <= 0) return { error: "Enter at least one night." };
  if (nights > NIGHTS_MAX) {
    return { error: `More than ${NIGHTS_MAX} nights is outside this calculator's range.` };
  }

  const rows = [];
  let nightMinutes = 0;
  let nightKcal = 0;
  let metMinutes = 0;
  let danceMinutes = 0;
  let moderateMinutes = 0;
  let vigorousMinutes = 0;

  for (const segment of GARBA_SEGMENTS) {
    const raw = minutes[segment.id];
    const value = raw === undefined || raw === null || raw === "" ? 0 : raw;
    if (!isNum(value)) return { error: `Enter a number of minutes for "${segment.label}".` };
    if (value < 0) return { error: "Minutes cannot be negative." };
    if (value > SEGMENT_MAX_MIN) {
      return { error: `No single part of the night can be longer than ${SEGMENT_MAX_MIN} minutes.` };
    }
    if (value === 0) continue;

    const band = intensityBand(segment.met);
    if (band === "vigorous") vigorousMinutes += value;
    else if (band === "moderate") moderateMinutes += value;
    if (segment.id !== "standing") danceMinutes += value;

    const perMin = kcalPerMinute(segment.met, weightKg);
    const kcal = perMin * value;
    nightMinutes += value;
    nightKcal += kcal;
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

  if (nightMinutes <= 0) return { error: "Add some minutes to at least one part of the night." };
  if (nightMinutes > NIGHT_MAX_MIN) {
    return { error: `A single night cannot exceed ${NIGHT_MAX_MIN} minutes here.` };
  }

  const restingPerMin = kcalPerMinute(1, weightKg);
  const nightRestingKcal = restingPerMin * nightMinutes;
  const nightNetKcal = Math.max(0, nightKcal - nightRestingKcal);
  const averageMet = nightKcal / nightRestingKcal;
  const dancingShare = (danceMinutes / nightMinutes) * 100;

  const mvpaEquivalentPerNight =
    moderateMinutes + vigorousMinutes * VIGOROUS_TO_MODERATE_FACTOR;

  return {
    weightKg,
    nights,
    nightMinutes,
    danceMinutes,
    dancingShare,
    nightKcal,
    nightNetKcal,
    nightRestingKcal,
    averageMet,
    kcalPerMin: nightKcal / nightMinutes,
    metMinutes,
    moderateMinutes,
    vigorousMinutes,
    mvpaEquivalentPerNight,
    festivalMinutes: nightMinutes * nights,
    festivalKcal: nightKcal * nights,
    festivalNetKcal: nightNetKcal * nights,
    festivalMvpaEquivalent: mvpaEquivalentPerNight * nights,
    whoTargetPercentPerNight: (mvpaEquivalentPerNight / WHO_WEEKLY_MODERATE_MIN) * 100,
    meetsWhoInOneNight: mvpaEquivalentPerNight >= WHO_WEEKLY_MODERATE_MIN,
    rows,
  };
}
