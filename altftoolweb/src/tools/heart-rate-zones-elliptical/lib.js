/**
 * Elliptical (cross-trainer) heart rate zone maths.
 *
 * Heart rate bands follow the ACSM intensity classification. The stride-rate and
 * resistance suggestions are practical starting points scaled to whatever machine you
 * are on, because console resistance scales are arbitrary and differ per manufacturer.
 */

/**
 * Maximum heart rate estimators.
 * - tanaka: Tanaka H, Monahan KD, Seals DR, J Am Coll Cardiol 2001. 208 - 0.7 x age.
 * - fox: Fox SM et al. 1971, the familiar 220 - age.
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
    note: "The classic textbook formula; overestimates in the young, underestimates after 40.",
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
 * ACSM intensity classification, expressed both as a percentage of maximum heart rate
 * and as a percentage of heart rate reserve.
 *
 * strideRate is in strides per minute counting both feet as one stride, the unit most
 * elliptical consoles display as SPM. resistancePct is the share of your machine's own
 * maximum resistance level, so the same table works on a 1-16 and a 1-25 console.
 */
export const ELLIPTICAL_ZONES = [
  {
    key: "very-light",
    label: "Very light — warm-up",
    pctMax: [40, 57],
    pctHrr: [20, 30],
    strideRate: [40, 50],
    resistancePct: [10, 20],
    purpose: "First five minutes. Loosen the hips and let the heart rate drift up before adding load.",
  },
  {
    key: "light",
    label: "Light — recovery pace",
    pctMax: [57, 64],
    pctHrr: [30, 40],
    strideRate: [45, 55],
    resistancePct: [20, 35],
    purpose: "Between intervals and on easy days. Handles moving but arms doing little work.",
  },
  {
    key: "moderate",
    label: "Moderate — steady cardio",
    pctMax: [64, 76],
    pctHrr: [40, 60],
    strideRate: [50, 65],
    resistancePct: [35, 55],
    purpose: "The main working zone. Push and pull the handles so the upper body shares the load.",
  },
  {
    key: "vigorous",
    label: "Vigorous — threshold work",
    pctMax: [76, 96],
    pctHrr: [60, 90],
    strideRate: [60, 75],
    resistancePct: [55, 80],
    purpose: "Tempo blocks of 5-20 minutes. Raise resistance before raising stride rate.",
  },
  {
    key: "near-max",
    label: "Near maximal — sprint intervals",
    pctMax: [96, 100],
    pctHrr: [90, 100],
    strideRate: [75, 95],
    resistancePct: [80, 100],
    purpose: "Bursts of 20-60 seconds only, with full recovery between. Not for beginners.",
  },
];

/** Adding ramp or incline raises heart rate at the same stride rate on machines that offer it. */
export const RAMP_TIP =
  "On a machine with an adjustable ramp, raising the ramp shifts load onto the glutes and raises heart rate without changing stride rate.";

export const AGE_LIMITS = [10, 100];
export const RESTING_HR_LIMITS = [30, 120];
export const MACHINE_RESISTANCE_LIMITS = [1, 40];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Karvonen method: target = resting + (maximum - resting) x intensity fraction. */
export function karvonen(restingHr, maxHr, pct) {
  if (!isFiniteNumber(restingHr) || !isFiniteNumber(maxHr) || !isFiniteNumber(pct)) return NaN;
  return restingHr + (maxHr - restingHr) * (pct / 100);
}

/** Map a percentage of the console scale onto an actual level, never below level 1. */
export function resistanceLevel(machineMaxLevel, pct) {
  if (!isFiniteNumber(machineMaxLevel) || !isFiniteNumber(pct)) return NaN;
  return Math.max(1, Math.min(machineMaxLevel, Math.round((machineMaxLevel * pct) / 100)));
}

/**
 * @param {object} input
 * @param {number} input.age                age in years
 * @param {number} input.restingHr          resting heart rate in beats per minute
 * @param {string} [input.formula]          key of MAX_HR_FORMULAS
 * @param {number} [input.machineMaxLevel]  highest resistance level on your console
 */
export function computeEllipticalZones({ age, restingHr, formula = "tanaka", machineMaxLevel = 20 }) {
  if (!isFiniteNumber(age) || !isFiniteNumber(restingHr) || !isFiniteNumber(machineMaxLevel)) {
    return { error: "Enter your age, resting heart rate and the machine's top resistance level." };
  }
  if (age < AGE_LIMITS[0] || age > AGE_LIMITS[1]) {
    return { error: `Age should be between ${AGE_LIMITS[0]} and ${AGE_LIMITS[1]} years.` };
  }
  if (restingHr < RESTING_HR_LIMITS[0] || restingHr > RESTING_HR_LIMITS[1]) {
    return {
      error: `Resting heart rate should be between ${RESTING_HR_LIMITS[0]} and ${RESTING_HR_LIMITS[1]} bpm. Measure it lying still, before getting out of bed.`,
    };
  }
  if (
    machineMaxLevel < MACHINE_RESISTANCE_LIMITS[0] ||
    machineMaxLevel > MACHINE_RESISTANCE_LIMITS[1]
  ) {
    return {
      error: `Machine resistance levels usually top out between ${MACHINE_RESISTANCE_LIMITS[0]} and ${MACHINE_RESISTANCE_LIMITS[1]}. Enter the highest number on your console.`,
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

  const zones = ELLIPTICAL_ZONES.map((zone) => ({
    ...zone,
    maxLowBpm: Math.round((maxHr * zone.pctMax[0]) / 100),
    maxHighBpm: Math.round((maxHr * zone.pctMax[1]) / 100),
    hrrLowBpm: Math.round(karvonen(restingHr, maxHr, zone.pctHrr[0])),
    hrrHighBpm: Math.round(karvonen(restingHr, maxHr, zone.pctHrr[1])),
    resistanceLow: resistanceLevel(machineMaxLevel, zone.resistancePct[0]),
    resistanceHigh: resistanceLevel(machineMaxLevel, zone.resistancePct[1]),
  }));

  const steady = zones.find((zone) => zone.key === "moderate");

  return {
    maxHr,
    maxHrRounded: Math.round(maxHr),
    restingHr,
    heartRateReserve,
    machineMaxLevel,
    formulaLabel: chosen.label,
    formulaNote: chosen.note,
    zones,
    steadyLowBpm: steady.maxLowBpm,
    steadyHighBpm: steady.maxHighBpm,
    steadyHrrLowBpm: steady.hrrLowBpm,
    steadyHrrHighBpm: steady.hrrHighBpm,
    steadyResistanceLow: steady.resistanceLow,
    steadyResistanceHigh: steady.resistanceHigh,
    rampTip: RAMP_TIP,
  };
}

/**
 * Which zone does an observed heart rate fall in?
 * @param {Array} zones      zones array returned by computeEllipticalZones
 * @param {number} observedHr the reading from the console or chest strap
 * @param {"max"|"hrr"} method which set of boundaries to use
 * @returns {object|null} the matching zone, or null when below or above every band
 */
export function classifyHeartRate(zones, observedHr, method = "max") {
  if (!Array.isArray(zones) || !isFiniteNumber(observedHr)) return null;
  const low = (zone) => (method === "hrr" ? zone.hrrLowBpm : zone.maxLowBpm);
  const high = (zone) => (method === "hrr" ? zone.hrrHighBpm : zone.maxHighBpm);
  for (let i = 0; i < zones.length; i += 1) {
    const zone = zones[i];
    const isLast = i === zones.length - 1;
    if (observedHr >= low(zone) && (isLast ? observedHr <= high(zone) : observedHr < high(zone))) {
      return zone;
    }
  }
  return null;
}
