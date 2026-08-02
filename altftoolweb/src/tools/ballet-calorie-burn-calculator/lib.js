/**
 * Ballet class calorie maths.
 *
 * Energy model (ACSM):  kcal/min = MET x 3.5 x kg / 200
 *   1 MET = 3.5 mL O2 per kg per minute, 1 L O2 ~= 5 kcal.
 *
 * The Compendium of Physical Activities (Ainsworth et al., 2011) carries two
 * ballet codes: "ballet, modern or jazz, general, rehearsal or class" at
 * 5.0 MET and "ballet, modern or jazz, performance, vigorous effort" at
 * 6.8 MET. A real class is not one intensity, so the segments below sit around
 * those two anchors and each names its basis.
 */

export const LB_TO_KG = 0.45359237;
export const O2_ML_PER_KG_PER_MET = 3.5;
export const KCAL_PER_LITRE_O2 = 5;
export const RESTING_MET = 1;
export const KCAL_PER_KG_BODY_FAT = 7700;

export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 400;
export const MAX_SEGMENT_MINUTES = 240;
export const MAX_TOTAL_MINUTES = 480;
export const MAX_CLASSES_PER_WEEK = 21;

export const BALLET_SEGMENTS = [
  {
    id: "barre",
    label: "Barre work",
    met: 4.0,
    basis: "Below the compendium ballet class value (5.0 MET) — stationary, one hand supported.",
  },
  {
    id: "centre",
    label: "Centre practice and adagio",
    met: 4.5,
    basis: "Just below the compendium ballet class value of 5.0 MET.",
  },
  {
    id: "petitAllegro",
    label: "Petit allegro and tendu combinations",
    met: 5.0,
    basis: "Compendium value for ballet, modern or jazz, general rehearsal or class (5.0 MET).",
  },
  {
    id: "pointe",
    label: "Pointe work and variations",
    met: 6.0,
    basis: "Between the compendium class (5.0) and performance (6.8 MET) values.",
  },
  {
    id: "grandAllegro",
    label: "Grand allegro and across the floor",
    met: 6.8,
    basis: "Compendium value for ballet, modern or jazz performance at vigorous effort (6.8 MET).",
  },
];

export const BALLET_PRESETS = [
  {
    id: "open60",
    label: "60-minute open class",
    minutes: { barre: 30, centre: 10, petitAllegro: 15, pointe: 0, grandAllegro: 5 },
  },
  {
    id: "full90",
    label: "90-minute technique class",
    minutes: { barre: 40, centre: 20, petitAllegro: 15, pointe: 0, grandAllegro: 15 },
  },
  {
    id: "pointe",
    label: "Class plus pointe",
    minutes: { barre: 35, centre: 15, petitAllegro: 10, pointe: 25, grandAllegro: 5 },
  },
  {
    id: "rehearsal",
    label: "Repertoire rehearsal",
    minutes: { barre: 10, centre: 15, petitAllegro: 10, pointe: 30, grandAllegro: 25 },
  },
];

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export function metToKcalPerMinute(met, weightKg) {
  if (!Number.isFinite(met) || !Number.isFinite(weightKg)) return 0;
  if (met <= 0 || weightKg <= 0) return 0;
  return (met * O2_ML_PER_KG_PER_MET * weightKg * KCAL_PER_LITRE_O2) / 1000;
}

export function getBalletPreset(id) {
  return BALLET_PRESETS.find((item) => item.id === id) || null;
}

/**
 * @param {object} input
 * @param {number} input.weight body weight in `weightUnit`
 * @param {"kg"|"lb"} input.weightUnit
 * @param {Record<string, number>} input.minutesBySegment minutes keyed by segment id
 * @param {number} input.classesPerWeek how often this class is repeated
 */
export function computeBalletBurn({
  weight,
  weightUnit = "kg",
  minutesBySegment = {},
  classesPerWeek = 1,
}) {
  if (!Number.isFinite(weight)) return { error: "Enter your body weight as a number." };
  if (!Number.isFinite(classesPerWeek)) return { error: "Enter classes per week as a number." };

  const weightKg = weightUnit === "lb" ? weight * LB_TO_KG : weight;
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (classesPerWeek < 0 || classesPerWeek > MAX_CLASSES_PER_WEEK) {
    return { error: `Classes per week should be between 0 and ${MAX_CLASSES_PER_WEEK}.` };
  }

  const minutes = {};
  for (const segment of BALLET_SEGMENTS) {
    const value = minutesBySegment[segment.id];
    // A segment left out of the object entirely defaults to 0 minutes, same as
    // classesPerWeek defaulting when omitted. A value that was supplied but is
    // not a finite number (e.g. unparsable text) is rejected instead of being
    // silently treated as 0, matching the weight/classesPerWeek validation above.
    if (value === undefined) {
      minutes[segment.id] = 0;
      continue;
    }
    if (!Number.isFinite(value)) {
      return { error: `Enter ${segment.label.toLowerCase()} minutes as a number.` };
    }
    if (value < 0) return { error: "Segment minutes cannot be negative." };
    if (value > MAX_SEGMENT_MINUTES) {
      return { error: `Each segment should be ${MAX_SEGMENT_MINUTES} minutes or less.` };
    }
    minutes[segment.id] = value;
  }

  const totalMinutes = BALLET_SEGMENTS.reduce((sum, s) => sum + minutes[s.id], 0);
  if (totalMinutes <= 0) return { error: "Add minutes to at least one part of the class." };
  if (totalMinutes > MAX_TOTAL_MINUTES) {
    return { error: `Total class time should be ${MAX_TOTAL_MINUTES} minutes or less.` };
  }

  const rows = BALLET_SEGMENTS.map((segment) => {
    const perMinute = metToKcalPerMinute(segment.met, weightKg);
    return {
      id: segment.id,
      label: segment.label,
      met: segment.met,
      minutes: minutes[segment.id],
      kcalPerMinute: round(perMinute, 2),
      kcal: round(perMinute * minutes[segment.id]),
      rawKcal: perMinute * minutes[segment.id],
    };
  });

  const grossKcal = rows.reduce((sum, row) => sum + row.rawKcal, 0);
  const restingKcalPerMin = metToKcalPerMinute(RESTING_MET, weightKg);
  const restingKcal = restingKcalPerMin * totalMinutes;
  const netKcal = Math.max(0, grossKcal - restingKcal);
  const vigorousMinutes = rows
    .filter((row) => row.met >= 6)
    .reduce((sum, row) => sum + row.minutes, 0);

  return {
    weightKg: round(weightKg, 1),
    totalMinutes: round(totalMinutes, 1),
    rows: rows.map(({ rawKcal, ...rest }) => rest),
    grossKcal: round(grossKcal),
    restingKcal: round(restingKcal),
    netKcal: round(netKcal),
    averageMet: round(grossKcal / (restingKcalPerMin * totalMinutes), 2),
    kcalPerHour: round((grossKcal / totalMinutes) * 60),
    vigorousMinutes: round(vigorousMinutes, 1),
    weeklyGrossKcal: round(grossKcal * classesPerWeek),
    weeklyMinutes: round(totalMinutes * classesPerWeek, 1),
    weeklyVigorousMinutes: round(vigorousMinutes * classesPerWeek, 1),
    fatGramsEquivalent: round((netKcal / KCAL_PER_KG_BODY_FAT) * 1000, 1),
  };
}
