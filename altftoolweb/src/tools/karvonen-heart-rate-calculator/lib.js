/**
 * Karvonen (heart rate reserve) method.
 *
 * Karvonen MJ, Kentala E, Mustala O (1957), "The effects of training on heart rate",
 * Annales Medicinae Experimentalis et Biologiae Fenniae 35:307-315.
 *
 *   Heart rate reserve (HRR) = HRmax - HRrest
 *   Target HR at intensity i = (HRR x i) + HRrest
 *
 * Unlike a plain "percent of max" calculation, Karvonen anchors the bottom of the
 * scale at your resting heart rate, so a fitter athlete with a low resting pulse
 * gets a wider, lower-sitting set of zones.
 */

/** Plausible human bounds, used purely for input validation. */
export const AGE_MIN = 10;
export const AGE_MAX = 100;
/** Resting pulse below ~25 bpm is not physiological; above 130 bpm is tachycardia, not "rest". */
export const RESTING_HR_MIN = 25;
export const RESTING_HR_MAX = 130;
/** Recorded human maxima sit roughly in this window. */
export const MAX_HR_MIN = 80;
export const MAX_HR_MAX = 230;

/**
 * Age-predicted maximum heart rate formulas. Each is a published regression, not a rule of thumb.
 */
export const MAX_HR_FORMULAS = [
  {
    key: "tanaka",
    label: "Tanaka: 208 - 0.7 x age",
    // Tanaka H, Monahan KD, Seals DR (2001), J Am Coll Cardiol 37(1):153-156.
    source: "Tanaka et al. 2001 — meta-analysis of 351 studies, 18,712 subjects.",
    predict: (age) => 208 - 0.7 * age,
  },
  {
    key: "fox",
    label: "Fox: 220 - age",
    // Fox SM, Naughton JP, Haskell WL (1971), Ann Clin Res 3(6):404-432.
    source: "Fox, Naughton & Haskell 1971 — the classic gym-poster estimate.",
    predict: (age) => 220 - age,
  },
  {
    key: "gulati",
    label: "Gulati: 206 - 0.88 x age",
    // Gulati M et al. (2010), Circulation 122(2):130-137 — women-specific.
    source: "Gulati et al. 2010 — derived from 5,437 women, women-specific.",
    predict: (age) => 206 - 0.88 * age,
  },
  {
    key: "nes",
    label: "Nes: 211 - 0.64 x age",
    // Nes BM et al. (2013), Scand J Med Sci Sports 23(6):697-704 (HUNT Fitness Study).
    source: "Nes et al. 2013 — HUNT study, 3,320 healthy adults.",
    predict: (age) => 211 - 0.64 * age,
  },
];

/**
 * Five-zone model expressed as fractions of heart rate reserve.
 * Boundaries follow the widely used ACSM / British Cycling five-zone split.
 */
export const KARVONEN_ZONES = [
  {
    key: "z1",
    name: "Zone 1 - Recovery",
    low: 0.5,
    high: 0.6,
    focus: "Warm-up, cool-down and easy spinning. Conversation is completely effortless.",
  },
  {
    key: "z2",
    name: "Zone 2 - Aerobic base",
    low: 0.6,
    high: 0.7,
    focus: "Fat oxidation and capillary growth. Where most weekly endurance volume belongs.",
  },
  {
    key: "z3",
    name: "Zone 3 - Tempo",
    low: 0.7,
    high: 0.8,
    focus: "Steady 'comfortably hard' work. Speaking drops to short sentences.",
  },
  {
    key: "z4",
    name: "Zone 4 - Threshold",
    low: 0.8,
    high: 0.9,
    focus: "Around lactate threshold. Raises the pace you can hold for an hour.",
  },
  {
    key: "z5",
    name: "Zone 5 - VO2 max",
    low: 0.9,
    high: 1.0,
    focus: "Short, hard intervals. Sustainable only for a few minutes at a time.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Target heart rate for a single intensity fraction (0-1) of heart rate reserve. */
export function targetHeartRate({ restingHr, maxHr, intensity }) {
  if (!isNum(restingHr) || !isNum(maxHr) || !isNum(intensity)) return null;
  const reserve = maxHr - restingHr;
  if (reserve <= 0) return null;
  return reserve * intensity + restingHr;
}

/**
 * Full Karvonen breakdown.
 *
 * @param {object} input
 * @param {number} input.age              Age in years (used only when maxHr is not supplied).
 * @param {number} input.restingHr        Resting heart rate in bpm.
 * @param {string} [input.formula]        Key from MAX_HR_FORMULAS. Default "tanaka".
 * @param {number|null} [input.maxHr]     Measured max HR in bpm; overrides the formula when given.
 * @param {number} [input.customIntensity] Extra intensity as a percentage (0-100).
 * @returns {object} zones + summary, or { error } for invalid input.
 */
export function computeKarvonenZones({
  age,
  restingHr,
  formula = "tanaka",
  maxHr = null,
  customIntensity = 70,
}) {
  if (!isNum(restingHr)) return { error: "Enter your resting heart rate in beats per minute." };
  if (restingHr < RESTING_HR_MIN || restingHr > RESTING_HR_MAX) {
    return {
      error: `Resting heart rate should be between ${RESTING_HR_MIN} and ${RESTING_HR_MAX} bpm.`,
    };
  }

  const chosen =
    MAX_HR_FORMULAS.find((item) => item.key === formula) || MAX_HR_FORMULAS[0];

  let resolvedMax;
  let maxHrSource;

  if (maxHr !== null && maxHr !== undefined && maxHr !== "") {
    if (!isNum(maxHr)) return { error: "Measured maximum heart rate must be a number." };
    if (maxHr < MAX_HR_MIN || maxHr > MAX_HR_MAX) {
      return {
        error: `Maximum heart rate should be between ${MAX_HR_MIN} and ${MAX_HR_MAX} bpm.`,
      };
    }
    resolvedMax = maxHr;
    maxHrSource = "Measured value you entered";
  } else {
    if (!isNum(age)) return { error: "Enter your age, or a measured maximum heart rate." };
    if (age < AGE_MIN || age > AGE_MAX) {
      return { error: `Age should be between ${AGE_MIN} and ${AGE_MAX} years.` };
    }
    resolvedMax = chosen.predict(age);
    maxHrSource = chosen.source;
  }

  const reserve = resolvedMax - restingHr;
  if (reserve <= 0) {
    return {
      error: "Maximum heart rate must be higher than resting heart rate — check both numbers.",
    };
  }

  const zones = KARVONEN_ZONES.map((zone) => ({
    key: zone.key,
    name: zone.name,
    focus: zone.focus,
    lowPercent: Math.round(zone.low * 100),
    highPercent: Math.round(zone.high * 100),
    lowBpm: Math.round(reserve * zone.low + restingHr),
    highBpm: Math.round(reserve * zone.high + restingHr),
  }));

  let custom = null;
  if (isNum(customIntensity)) {
    if (customIntensity < 0 || customIntensity > 100) {
      return { error: "Custom intensity must be between 0% and 100% of heart rate reserve." };
    }
    custom = {
      percent: customIntensity,
      bpm: Math.round(reserve * (customIntensity / 100) + restingHr),
    };
  }

  return {
    restingHr,
    maxHr: Math.round(resolvedMax),
    maxHrExact: resolvedMax,
    maxHrSource,
    formulaKey: chosen.key,
    formulaLabel: chosen.label,
    usedMeasuredMax: maxHrSource === "Measured value you entered",
    reserve: Math.round(reserve),
    zones,
    custom,
    /** The aerobic-base target most endurance plans anchor on: 60-70% HRR. */
    easyRange: {
      lowBpm: Math.round(reserve * 0.6 + restingHr),
      highBpm: Math.round(reserve * 0.7 + restingHr),
    },
  };
}
