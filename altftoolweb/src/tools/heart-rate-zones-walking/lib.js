/**
 * Walking heart rate zone maths.
 *
 * Zones follow the ACSM intensity classification (percentage of maximum heart rate
 * and percentage of heart rate reserve), with walking cadence targets from the
 * CADENCE-Adults work by Tudor-Locke and colleagues.
 */

/**
 * Maximum heart rate estimators.
 * - tanaka: Tanaka H, Monahan KD, Seals DR, J Am Coll Cardiol 2001. 208 - 0.7 x age.
 *   Lower standard error than the classic formula across adult ages.
 * - fox: Fox SM et al. 1971, the familiar 220 - age. Kept for comparison.
 * - gulati: Gulati M et al., Circulation 2010, derived in women. 206 - 0.88 x age.
 */
export const MAX_HR_FORMULAS = {
  tanaka: {
    key: "tanaka",
    label: "Tanaka (208 - 0.7 x age)",
    note: "Best general-purpose estimate for adults of both sexes.",
    compute: (age) => 208 - 0.7 * age,
  },
  fox: {
    key: "fox",
    label: "Fox (220 - age)",
    note: "The classic textbook formula; overestimates in the young, underestimates over 40.",
    compute: (age) => 220 - age,
  },
  gulati: {
    key: "gulati",
    label: "Gulati (206 - 0.88 x age)",
    note: "Derived specifically in women; gives a lower maximum than the classic formula.",
    compute: (age) => 206 - 0.88 * age,
  },
};

/**
 * ACSM intensity classification. Percentages are of maximum heart rate (pctMax) and
 * of heart rate reserve (pctHrr). Cadence figures come from CADENCE-Adults:
 * 100 steps/min is the threshold for moderate intensity (about 3 METs) and
 * 130 steps/min for vigorous intensity (about 6 METs) in healthy adults.
 */
export const WALKING_ZONES = [
  {
    key: "very-light",
    label: "Very light — warm-up stroll",
    pctMax: [40, 57],
    pctHrr: [20, 30],
    cadence: "under 100 steps/min",
    feel: "Effortless. You could hold a conversation or sing. Use it for the first and last five minutes.",
  },
  {
    key: "light",
    label: "Light — comfortable walk",
    pctMax: [57, 64],
    pctHrr: [30, 40],
    cadence: "about 90-100 steps/min",
    feel: "Full sentences come easily. Good for daily volume, recovery days and beginners building the habit.",
  },
  {
    key: "moderate",
    label: "Moderate — brisk walk",
    pctMax: [64, 76],
    pctHrr: [40, 60],
    cadence: "100-129 steps/min",
    feel: "You can talk but not sing. This is the zone the 150 minutes a week guideline is written for.",
  },
  {
    key: "vigorous",
    label: "Vigorous — power walk or incline",
    pctMax: [76, 96],
    pctHrr: [60, 90],
    cadence: "130+ steps/min, or any cadence on a steep hill",
    feel: "Only a few words at a time. Reached by adding gradient, speed or a weighted pack.",
  },
  {
    key: "near-max",
    label: "Near maximal — not a walking zone",
    pctMax: [96, 100],
    pctHrr: [90, 100],
    cadence: "n/a",
    feel: "Reachable on a very steep hill or by breaking into a run. Not a target for walking sessions.",
  },
];

/**
 * Physical activity guidelines used by the WHO and the American Heart Association:
 * 150 minutes a week of moderate activity, or 75 minutes of vigorous, or a mix.
 */
export const WEEKLY_MODERATE_MINUTES = 150;
export const WEEKLY_VIGOROUS_MINUTES = 75;

export const AGE_LIMITS = [10, 100];
export const RESTING_HR_LIMITS = [30, 120];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Karvonen method: target = resting + (maximum - resting) x intensity fraction. */
export function karvonen(restingHr, maxHr, pct) {
  if (!isFiniteNumber(restingHr) || !isFiniteNumber(maxHr) || !isFiniteNumber(pct)) return NaN;
  return restingHr + (maxHr - restingHr) * (pct / 100);
}

/**
 * @param {object} input
 * @param {number} input.age          age in years
 * @param {number} input.restingHr    resting heart rate in beats per minute
 * @param {string} [input.formula]    key of MAX_HR_FORMULAS
 */
export function computeWalkingZones({ age, restingHr, formula = "tanaka" }) {
  if (!isFiniteNumber(age) || !isFiniteNumber(restingHr)) {
    return { error: "Enter both your age and your resting heart rate." };
  }
  if (age < AGE_LIMITS[0] || age > AGE_LIMITS[1]) {
    return { error: `Age should be between ${AGE_LIMITS[0]} and ${AGE_LIMITS[1]} years.` };
  }
  if (restingHr < RESTING_HR_LIMITS[0] || restingHr > RESTING_HR_LIMITS[1]) {
    return {
      error: `Resting heart rate should be between ${RESTING_HR_LIMITS[0]} and ${RESTING_HR_LIMITS[1]} bpm. Measure it lying still, before getting out of bed.`,
    };
  }
  const chosen = MAX_HR_FORMULAS[formula];
  if (!chosen) return { error: "Choose a maximum heart rate formula." };

  const maxHr = chosen.compute(age);
  if (!(maxHr > restingHr)) {
    return {
      error: "Your resting heart rate is at or above the estimated maximum, so no zones can be worked out. Re-check both figures.",
    };
  }

  const heartRateReserve = maxHr - restingHr;

  const zones = WALKING_ZONES.map((zone) => ({
    ...zone,
    maxLowBpm: Math.round((maxHr * zone.pctMax[0]) / 100),
    maxHighBpm: Math.round((maxHr * zone.pctMax[1]) / 100),
    hrrLowBpm: Math.round(karvonen(restingHr, maxHr, zone.pctHrr[0])),
    hrrHighBpm: Math.round(karvonen(restingHr, maxHr, zone.pctHrr[1])),
  }));

  const brisk = zones.find((zone) => zone.key === "moderate");

  return {
    maxHr,
    maxHrRounded: Math.round(maxHr),
    restingHr,
    heartRateReserve,
    formulaLabel: chosen.label,
    formulaNote: chosen.note,
    zones,
    briskLowBpm: brisk.maxLowBpm,
    briskHighBpm: brisk.maxHighBpm,
    briskHrrLowBpm: brisk.hrrLowBpm,
    briskHrrHighBpm: brisk.hrrHighBpm,
    weeklyModerateMinutes: WEEKLY_MODERATE_MINUTES,
    weeklyVigorousMinutes: WEEKLY_VIGOROUS_MINUTES,
  };
}

/**
 * How many walks of a given length are needed to hit the weekly moderate-intensity
 * target. Returns null rather than Infinity when the walk length is zero.
 */
export function walksPerWeek(minutesPerWalk, weeklyTarget = WEEKLY_MODERATE_MINUTES) {
  if (!isFiniteNumber(minutesPerWalk) || minutesPerWalk <= 0) return null;
  return Math.ceil(weeklyTarget / minutesPerWalk);
}
