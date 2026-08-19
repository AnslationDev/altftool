/**
 * Kathak riyaz calorie maths.
 *
 * A Kathak practice is not one intensity: abhinaya is close to seated work,
 * tatkar climbs steeply from vilambit to drut laya, and chakkar sequences are
 * the hardest thing in the session. This module takes minutes per segment and
 * prices each one at its own MET value.
 *
 * Energy model (ACSM):  kcal/min = MET x 3.5 x kg / 200
 *   1 MET = 3.5 mL O2 per kg per minute, 1 L O2 ~= 5 kcal.
 *
 * Kathak has no code in the Compendium of Physical Activities (Ainsworth et
 * al., 2011), so each segment names the published dance code it is mapped to.
 */

export const LB_TO_KG = 0.45359237;
export const O2_ML_PER_KG_PER_MET = 3.5;
export const KCAL_PER_LITRE_O2 = 5;
export const RESTING_MET = 1;
export const KCAL_PER_KG_BODY_FAT = 7700;

/**
 * Load carried on the feet costs far more than the same load on the trunk.
 * Soule & Goldman (1969) measured foot-carried load at roughly 4.7-6.3 times
 * the energy cost of torso-carried load during walking; 5 is used here as the
 * midpoint, applied only to footwork segments and only as an approximation.
 */
export const ANKLE_LOAD_EQUIVALENCE = 5;

export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 400;
export const MAX_GHUNGROO_KG_PER_ANKLE = 3;
export const MAX_SEGMENT_MINUTES = 300;
export const MAX_TOTAL_MINUTES = 480;

export const KATHAK_SEGMENTS = [
  {
    id: "abhinaya",
    label: "Abhinaya and hasta practice",
    met: 2.5,
    footwork: false,
    basis: "Between standing light effort (2.0) and slow ballroom dance (3.0 MET).",
  },
  {
    id: "vilambit",
    label: "Warm-up and tatkar at vilambit laya",
    met: 3.5,
    footwork: true,
    basis: "Just above the compendium value for slow ballroom dancing (3.0 MET).",
  },
  {
    id: "madhya",
    label: "Tatkar at madhya laya",
    met: 5.5,
    footwork: true,
    basis: "Between cultural dancing (4.5) and general aerobic dance (7.3 MET).",
  },
  {
    id: "drut",
    label: "Drut laya tatkar, tukras and paran",
    met: 7.3,
    footwork: true,
    basis: "Compendium value for general aerobic dancing (7.3 MET).",
  },
  {
    id: "chakkar",
    label: "Chakkar sequences (continuous spins)",
    met: 7.8,
    footwork: true,
    basis: "Compendium value for fast folk and ballroom dancing (7.8 MET).",
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

/**
 * Body mass that the footwork segments effectively have to move, once the
 * ghungroo on both ankles is converted to a torso-equivalent load.
 */
export function effectiveFootworkWeightKg(weightKg, ghungrooPerAnkleKg) {
  if (!Number.isFinite(weightKg) || !Number.isFinite(ghungrooPerAnkleKg)) return weightKg;
  const bothAnkles = Math.max(0, ghungrooPerAnkleKg) * 2;
  return weightKg + bothAnkles * ANKLE_LOAD_EQUIVALENCE;
}

/**
 * @param {object} input
 * @param {number} input.weight  body weight in `weightUnit`
 * @param {"kg"|"lb"} input.weightUnit
 * @param {number} input.ghungrooPerAnkleKg  weight of the ghungroo on one ankle, kg
 * @param {Record<string, number>} input.minutesBySegment  minutes keyed by segment id
 */
export function computeKathakBurn({
  weight,
  weightUnit = "kg",
  ghungrooPerAnkleKg = 0,
  minutesBySegment = {},
}) {
  if (!Number.isFinite(weight) || !Number.isFinite(ghungrooPerAnkleKg)) {
    return { error: "Enter your body weight and ghungroo weight as numbers." };
  }

  const weightKg = weightUnit === "lb" ? weight * LB_TO_KG : weight;
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (ghungrooPerAnkleKg < 0 || ghungrooPerAnkleKg > MAX_GHUNGROO_KG_PER_ANKLE) {
    return {
      error: `Ghungroo weight per ankle should be between 0 and ${MAX_GHUNGROO_KG_PER_ANKLE} kg.`,
    };
  }

  const minutes = {};
  for (const segment of KATHAK_SEGMENTS) {
    const value = minutesBySegment[segment.id];
    const parsed = Number.isFinite(value) ? value : 0;
    if (parsed < 0) return { error: "Segment minutes cannot be negative." };
    if (parsed > MAX_SEGMENT_MINUTES) {
      return { error: `Each segment should be ${MAX_SEGMENT_MINUTES} minutes or less.` };
    }
    minutes[segment.id] = parsed;
  }

  const totalMinutes = KATHAK_SEGMENTS.reduce((sum, s) => sum + minutes[s.id], 0);
  if (totalMinutes <= 0) return { error: "Add minutes to at least one segment." };
  if (totalMinutes > MAX_TOTAL_MINUTES) {
    return { error: `Total riyaz time should be ${MAX_TOTAL_MINUTES} minutes or less.` };
  }

  const footworkWeightKg = effectiveFootworkWeightKg(weightKg, ghungrooPerAnkleKg);

  const rows = KATHAK_SEGMENTS.map((segment) => {
    const massKg = segment.footwork ? footworkWeightKg : weightKg;
    const perMinute = metToKcalPerMinute(segment.met, massKg);
    const segmentMinutes = minutes[segment.id];
    return {
      id: segment.id,
      label: segment.label,
      met: segment.met,
      footwork: segment.footwork,
      minutes: segmentMinutes,
      kcalPerMinute: round(perMinute, 2),
      kcal: round(perMinute * segmentMinutes),
      rawKcal: perMinute * segmentMinutes,
    };
  });

  // Sum the already-rounded per-row kcal values (not the raw pre-rounding
  // sum) so the headline/grand total always matches what a user adding up
  // the visible "Segment breakdown" rows would get.
  const grossKcal = rows.reduce((sum, row) => sum + row.kcal, 0);
  const restingKcal = metToKcalPerMinute(RESTING_MET, weightKg) * totalMinutes;
  const netKcal = Math.max(0, grossKcal - restingKcal);

  const footworkMinutes = rows
    .filter((row) => row.footwork)
    .reduce((sum, row) => sum + row.minutes, 0);

  // Same session with no ghungroo, to isolate what the bells cost. Rounded
  // per-row before summing, matching how grossKcal is built above, so that
  // when ghungroo is 0 kg the two totals are computed identically and cancel
  // to exactly 0 rather than differing by leftover rounding error.
  const withoutGhungroo = rows.reduce(
    (sum, row) => sum + round(metToKcalPerMinute(row.met, weightKg) * row.minutes),
    0,
  );

  // True weighted-average MET across the session, weighted by minutes and
  // taken from each segment's own defined MET value (not derived from kcal
  // totals, which mix different body masses and rounding stages and can
  // push the "average" outside the session's actual MET range).
  const averageMet = totalMinutes > 0
    ? rows.reduce((sum, row) => sum + row.met * row.minutes, 0) / totalMinutes
    : 0;

  return {
    weightKg: round(weightKg, 1),
    footworkWeightKg: round(footworkWeightKg, 1),
    ghungrooTotalKg: round(Math.max(0, ghungrooPerAnkleKg) * 2, 2),
    totalMinutes: round(totalMinutes, 1),
    footworkMinutes: round(footworkMinutes, 1),
    rows: rows.map(({ rawKcal, ...rest }) => rest),
    grossKcal: round(grossKcal),
    restingKcal: round(restingKcal),
    netKcal: round(netKcal),
    ghungrooExtraKcal: round(grossKcal - withoutGhungroo),
    averageMet: round(averageMet, 2),
    kcalPerHour: round((grossKcal / totalMinutes) * 60),
    fatGramsEquivalent: round((netKcal / KCAL_PER_KG_BODY_FAT) * 1000, 1),
  };
}
