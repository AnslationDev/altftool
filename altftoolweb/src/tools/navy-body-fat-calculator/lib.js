/**
 * US Navy circumference body fat equations.
 *
 * Developed by Hodgdon JA and Beckett MB at the Naval Health Research Center
 * (reports 84-11 and 84-29, 1984) by regressing hydrostatic-weighing body
 * density against tape measurements, and still the basis of the Department of
 * Defense tape test. Two published forms exist and this module implements each
 * in its native units rather than converting, because the coefficients were
 * rounded separately:
 *
 *   Imperial (inches):
 *     men   %BF =  86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
 *     women %BF = 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
 *
 *   Metric (centimetres):
 *     men   %BF = 495 / (1.0324 - 0.19077*log10(waist-neck) + 0.15456*log10(height)) - 450
 *     women %BF = 495 / (1.29579 - 0.35004*log10(waist+hip-neck) + 0.22100*log10(height)) - 450
 *
 * The two agree to within a few tenths of a percentage point.
 *
 * Body fat categories follow the American Council on Exercise bands, which are
 * the ones most commonly quoted alongside a tape result.
 *
 * Reported standard error against hydrostatic weighing is roughly 3-4
 * percentage points, so treat any single number as a range, not a reading.
 *
 * All functions are pure.
 */

/** Reported standard error of the estimate against hydrostatic weighing, percentage points. */
export const STANDARD_ERROR_PCT = 3.5;

/** American Council on Exercise body fat bands, percent. `max` is exclusive. */
export const BODY_FAT_BANDS = {
  male: [
    { key: "essential", label: "Essential fat", min: 0, max: 6, tone: "warn", note: "At or below the minimum the body needs for normal function." },
    { key: "athlete", label: "Athletic", min: 6, max: 14, tone: "good", note: "Typical of competitive athletes in weight-sensitive sports." },
    { key: "fitness", label: "Fitness", min: 14, max: 18, tone: "good", note: "Lean and healthy for a regularly active adult." },
    { key: "average", label: "Average", min: 18, max: 25, tone: "warn", note: "Typical of the general adult population." },
    { key: "obese", label: "Obese range", min: 25, max: Infinity, tone: "bad", note: "Associated with raised metabolic and cardiovascular risk." },
  ],
  female: [
    { key: "essential", label: "Essential fat", min: 0, max: 14, tone: "warn", note: "At or below the minimum needed for hormonal and reproductive function." },
    { key: "athlete", label: "Athletic", min: 14, max: 21, tone: "good", note: "Typical of competitive athletes in weight-sensitive sports." },
    { key: "fitness", label: "Fitness", min: 21, max: 25, tone: "good", note: "Lean and healthy for a regularly active adult." },
    { key: "average", label: "Average", min: 25, max: 32, tone: "warn", note: "Typical of the general adult population." },
    { key: "obese", label: "Obese range", min: 32, max: Infinity, tone: "bad", note: "Associated with raised metabolic and cardiovascular risk." },
  ],
};

/** Sanity limits, in centimetres and kilograms. */
export const LIMITS = {
  heightCm: { min: 130, max: 230 },
  weightKg: { min: 30, max: 300 },
  neckCm: { min: 20, max: 70 },
  waistCm: { min: 45, max: 220 },
  hipCm: { min: 50, max: 220 },
  bodyFatPct: { min: 2, max: 70 },
  targetFatPct: { min: 3, max: 45 },
};

/** How to hold the tape for each site, so the numbers are comparable run to run. */
export const MEASURING_TIPS = [
  ["Neck", "Just below the larynx, tape sloping slightly downward at the front. Do not flare the shoulders."],
  ["Waist (men)", "At the navel, horizontal all the way round, at the end of a normal exhale. Do not suck in."],
  ["Waist (women)", "At the narrowest point of the torso, usually above the navel."],
  ["Hip (women)", "At the widest point of the buttocks, feet together."],
  ["Tape tension", "Snug against the skin without compressing it. Measure three times and use the average."],
];

const round = (value, dp = 1) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

const log10 = (value) => Math.log10(value);

/** 1 inch = 2.54 cm exactly. */
export function inchesToCm(inches) {
  return Number.isFinite(inches) ? inches * 2.54 : 0;
}

/** Feet plus inches to centimetres. */
export function feetInchesToCm(feet, inches) {
  const ft = Number.isFinite(feet) ? feet : 0;
  const inch = Number.isFinite(inches) ? inches : 0;
  return (ft * 12 + inch) * 2.54;
}

/** 1 lb = 0.45359237 kg exactly. */
export function poundsToKg(pounds) {
  return Number.isFinite(pounds) ? pounds * 0.45359237 : 0;
}

/** Metric form of the Navy equations. Returns a percentage or null. */
export function navyBodyFatMetric({ sex, heightCm, neckCm, waistCm, hipCm }) {
  if (![heightCm, neckCm, waistCm].every((n) => Number.isFinite(n) && n > 0)) return null;
  if (sex === "female") {
    if (!Number.isFinite(hipCm) || hipCm <= 0) return null;
    const girth = waistCm + hipCm - neckCm;
    if (girth <= 0) return null;
    const denominator = 1.29579 - 0.35004 * log10(girth) + 0.221 * log10(heightCm);
    if (!(denominator > 0)) return null;
    const value = 495 / denominator - 450;
    return Number.isFinite(value) ? value : null;
  }
  const girth = waistCm - neckCm;
  if (girth <= 0) return null;
  const denominator = 1.0324 - 0.19077 * log10(girth) + 0.15456 * log10(heightCm);
  if (!(denominator > 0)) return null;
  const value = 495 / denominator - 450;
  return Number.isFinite(value) ? value : null;
}

/** Imperial form of the Navy equations, all inputs in inches. Returns a percentage or null. */
export function navyBodyFatImperial({ sex, heightIn, neckIn, waistIn, hipIn }) {
  if (![heightIn, neckIn, waistIn].every((n) => Number.isFinite(n) && n > 0)) return null;
  if (sex === "female") {
    if (!Number.isFinite(hipIn) || hipIn <= 0) return null;
    const girth = waistIn + hipIn - neckIn;
    if (girth <= 0) return null;
    const value = 163.205 * log10(girth) - 97.684 * log10(heightIn) - 78.387;
    return Number.isFinite(value) ? value : null;
  }
  const girth = waistIn - neckIn;
  if (girth <= 0) return null;
  const value = 86.01 * log10(girth) - 70.041 * log10(heightIn) + 36.76;
  return Number.isFinite(value) ? value : null;
}

/** Which ACE band a body fat percentage falls in. */
export function bodyFatBand(bodyFatPct, sex) {
  const bands = BODY_FAT_BANDS[sex] ?? BODY_FAT_BANDS.male;
  return bands.find((band) => bodyFatPct >= band.min && bodyFatPct < band.max) ?? bands[bands.length - 1];
}

/**
 * Full tape-test result.
 *
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.heightCm
 * @param {number} input.neckCm
 * @param {number} input.waistCm
 * @param {number} [input.hipCm]     Required for the female equation.
 * @param {number} [input.weightKg]  Optional; unlocks fat mass, lean mass and target weight.
 * @param {number} [input.targetFatPct] Optional goal body fat percentage.
 * @param {"metric"|"imperial"} [input.equation] Which published form to use. Defaults to metric.
 * @returns {object} result, or { error }.
 */
export function navyBodyFat({
  sex = "male",
  heightCm,
  neckCm,
  waistCm,
  hipCm,
  weightKg,
  targetFatPct,
  equation = "metric",
}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female — the equations are different." };
  }
  if ([heightCm, neckCm, waistCm].some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter height, neck and waist measurements." };
  }
  if (heightCm < LIMITS.heightCm.min || heightCm > LIMITS.heightCm.max) {
    return { error: `Height must be between ${LIMITS.heightCm.min} cm and ${LIMITS.heightCm.max} cm.` };
  }
  if (neckCm < LIMITS.neckCm.min || neckCm > LIMITS.neckCm.max) {
    return { error: `Neck must be between ${LIMITS.neckCm.min} cm and ${LIMITS.neckCm.max} cm.` };
  }
  if (waistCm < LIMITS.waistCm.min || waistCm > LIMITS.waistCm.max) {
    return { error: `Waist must be between ${LIMITS.waistCm.min} cm and ${LIMITS.waistCm.max} cm.` };
  }
  if (sex === "female") {
    if (!Number.isFinite(hipCm)) return { error: "The female equation needs a hip measurement." };
    if (hipCm < LIMITS.hipCm.min || hipCm > LIMITS.hipCm.max) {
      return { error: `Hip must be between ${LIMITS.hipCm.min} cm and ${LIMITS.hipCm.max} cm.` };
    }
    if (waistCm + hipCm - neckCm <= 0) {
      return { error: "Waist plus hip must be larger than the neck measurement." };
    }
  } else if (waistCm - neckCm <= 0) {
    return { error: "Waist must be larger than the neck measurement — re-check the tape." };
  }

  const metricPct = navyBodyFatMetric({ sex, heightCm, neckCm, waistCm, hipCm });
  const imperialPct = navyBodyFatImperial({
    sex,
    heightIn: heightCm / 2.54,
    neckIn: neckCm / 2.54,
    waistIn: waistCm / 2.54,
    hipIn: Number.isFinite(hipCm) ? hipCm / 2.54 : undefined,
  });

  const chosen = equation === "imperial" ? imperialPct : metricPct;
  if (chosen === null) {
    return { error: "Those measurements do not produce a usable estimate — re-check the tape." };
  }
  if (chosen < LIMITS.bodyFatPct.min || chosen > LIMITS.bodyFatPct.max) {
    return {
      error: `Those measurements estimate ${round(chosen)}% body fat, outside the range the tape method can be trusted for. Re-measure with the tape snug but not tight.`,
    };
  }

  const shownPct = round(chosen, 1);
  const band = bodyFatBand(shownPct, sex);

  let composition = null;
  if (Number.isFinite(weightKg)) {
    if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
      return { error: `Weight must be between ${LIMITS.weightKg.min} kg and ${LIMITS.weightKg.max} kg.` };
    }
    const fatMassKg = weightKg * (chosen / 100);
    const leanMassKg = weightKg - fatMassKg;
    composition = {
      weightKg: round(weightKg, 1),
      fatMassKg: round(fatMassKg, 1),
      leanMassKg: round(leanMassKg, 1),
      // Fat-free mass index for context: lean mass / height in metres squared.
      ffmi: round(leanMassKg / (heightCm / 100) ** 2, 1),
    };

    if (Number.isFinite(targetFatPct)) {
      if (targetFatPct < LIMITS.targetFatPct.min || targetFatPct > LIMITS.targetFatPct.max) {
        return {
          error: `A target body fat of ${round(targetFatPct)}% is outside the ${LIMITS.targetFatPct.min}-${LIMITS.targetFatPct.max}% range this tool will plan for.`,
        };
      }
      // Holding lean mass constant: weight = lean / (1 - target fraction).
      const targetWeightKg = leanMassKg / (1 - targetFatPct / 100);
      composition.target = {
        targetFatPct: round(targetFatPct, 1),
        targetWeightKg: round(targetWeightKg, 1),
        changeKg: round(targetWeightKg - weightKg, 1),
        direction: targetWeightKg < weightKg ? "lose" : targetWeightKg > weightKg ? "gain" : "hold",
      };
    }
  }

  return {
    sex,
    equation,
    bodyFatPct: shownPct,
    bodyFatExact: chosen,
    metricPct: metricPct === null ? null : round(metricPct, 1),
    imperialPct: imperialPct === null ? null : round(imperialPct, 1),
    formDifference:
      metricPct === null || imperialPct === null ? null : round(Math.abs(metricPct - imperialPct), 2),
    rangeLow: round(Math.max(0, chosen - STANDARD_ERROR_PCT), 1),
    rangeHigh: round(chosen + STANDARD_ERROR_PCT, 1),
    band,
    girthCm:
      sex === "female"
        ? round(waistCm + hipCm - neckCm, 1)
        : round(waistCm - neckCm, 1),
    waistToHeight: round(waistCm / heightCm, 2),
    composition,
  };
}
