/**
 * Does a high BMI mean fat, or muscle?
 *
 * BMI = weight (kg) / height (m)^2 counts every kilogram the same way, so a
 * lifter carrying 12 kg of extra lean mass reads exactly like someone carrying
 * 12 kg of fat. This module cross-checks a BMI against three measures that do
 * distinguish the two:
 *
 *  1. Body fat percentage. Estimated here with the US Navy circumference
 *     equations (Hodgdon JA & Beckett MB, Naval Health Research Center report
 *     84-11, 1984), in their metric form:
 *       men:   %BF = 495 / (1.0324 - 0.19077*log10(waist-neck) + 0.15456*log10(height)) - 450
 *       women: %BF = 495 / (1.29579 - 0.35004*log10(waist+hip-neck) + 0.22100*log10(height)) - 450
 *     Categories follow the widely used American Council on Exercise bands.
 *  2. Fat-free mass index, FFMI = lean mass (kg) / height (m)^2, with the
 *     height normalisation FFMI + 6.1 * (1.8 - height in m) from Kouri EM et al.,
 *     Clin J Sport Med 1995;5:223-8, whose drug-free lifters almost never
 *     exceeded a normalised FFMI of 25.
 *  3. Waist-to-height ratio. A ratio of 0.5 or more flags central fat
 *     regardless of BMI (Ashwell M & Hsieh SD, Int J Food Sci Nutr 2005), and
 *     it is the measure that most often exposes a "normal weight, high fat"
 *     reading in a sedentary person.
 *
 * Pure functions only; no clock, no randomness.
 */

/** Adult WHO BMI lines, kg/m^2 (Technical Report Series 894). */
export const BMI_CUTOFFS = { overweight: 25, obesity: 30 };

/** Waist-to-height ratio at or above which central adiposity is flagged. */
export const WHTR_LIMIT = 0.5;

/** Normalised FFMI a drug-free trainee rarely exceeds (Kouri et al. 1995). */
export const NATURAL_FFMI_CEILING = { male: 25, female: 22 };

/** American Council on Exercise body fat bands, percent. `max` is exclusive. */
export const BODY_FAT_BANDS = {
  male: [
    { key: "essential", label: "Essential fat", min: 0, max: 6, tone: "warn" },
    { key: "athlete", label: "Athletic", min: 6, max: 14, tone: "good" },
    { key: "fitness", label: "Fitness", min: 14, max: 18, tone: "good" },
    { key: "average", label: "Average", min: 18, max: 25, tone: "warn" },
    { key: "obese", label: "Obese range", min: 25, max: Infinity, tone: "bad" },
  ],
  female: [
    { key: "essential", label: "Essential fat", min: 0, max: 14, tone: "warn" },
    { key: "athlete", label: "Athletic", min: 14, max: 21, tone: "good" },
    { key: "fitness", label: "Fitness", min: 21, max: 25, tone: "good" },
    { key: "average", label: "Average", min: 25, max: 32, tone: "warn" },
    { key: "obese", label: "Obese range", min: 32, max: Infinity, tone: "bad" },
  ],
};

/** Upper edge of the athletic band, used to decide "lean enough that BMI misleads". */
export const ATHLETE_FAT_LIMIT = { male: 14, female: 21 };

/** Body fat at or above which the high BMI is supported by real adiposity. */
export const OBESE_FAT_LIMIT = { male: 25, female: 32 };

/**
 * A lean but sustainable body fat percentage, used for the "even stripped to
 * this, what would BMI say?" projection. Sits just above the essential-fat
 * floor in the ACE bands, so it is achievable rather than a stage-day figure.
 */
export const LEAN_FLOOR_FAT = { male: 10, female: 18 };

/** Sanity limits so a typo cannot produce a plausible-looking answer. */
export const LIMITS = {
  heightCm: { min: 130, max: 230 },
  weightKg: { min: 30, max: 300 },
  neckCm: { min: 20, max: 70 },
  waistCm: { min: 50, max: 200 },
  hipCm: { min: 50, max: 200 },
  bodyFatPct: { min: 2, max: 70 },
};

export const VERDICTS = {
  muscle: {
    key: "muscle",
    label: "BMI overstates fat — this is lean mass",
    tone: "good",
    detail:
      "BMI is in the overweight range but body fat sits in the athletic band and the waist is proportionate. This is the classic false positive BMI produces in trained people.",
  },
  leanish: {
    key: "leanish",
    label: "BMI partly overstates fat",
    tone: "warn",
    detail:
      "BMI reads high while body fat and waist are below the risk thresholds, so lean mass is carrying part of the number — but there is fat to lose as well.",
  },
  supported: {
    key: "supported",
    label: "High BMI is supported by body fat",
    tone: "bad",
    detail:
      "Body fat percentage or waist-to-height ratio confirms what BMI is saying, so the reading is not a muscle artefact.",
  },
  normalWeightHighFat: {
    key: "normalWeightHighFat",
    label: "Normal BMI but high body fat",
    tone: "bad",
    detail:
      "BMI is inside the normal range while body fat or waist-to-height says otherwise — the pattern sometimes called normal-weight obesity, which BMI alone misses entirely.",
  },
  agree: {
    key: "agree",
    label: "BMI and body composition agree",
    tone: "good",
    detail: "All three measures point the same way, so BMI is a reasonable summary in this case.",
  },
};

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

/**
 * US Navy circumference body fat estimate, metric.
 * @returns {number|{error:string}} percent body fat, or an error object.
 */
export function navyBodyFat({ sex, heightCm, neckCm, waistCm, hipCm }) {
  if (![heightCm, neckCm, waistCm].every((n) => Number.isFinite(n) && n > 0)) {
    return { error: "Enter height, neck and waist measurements in centimetres." };
  }
  if (sex === "female") {
    if (!Number.isFinite(hipCm) || hipCm <= 0) {
      return { error: "The female equation needs a hip measurement as well." };
    }
    const girth = waistCm + hipCm - neckCm;
    if (girth <= 0) return { error: "Waist plus hip must be larger than the neck measurement." };
    const denominator = 1.29579 - 0.35004 * log10(girth) + 0.221 * log10(heightCm);
    if (!(denominator > 0)) return { error: "Those measurements do not produce a usable estimate." };
    const bf = 495 / denominator - 450;
    if (!Number.isFinite(bf)) return { error: "Those measurements do not produce a usable estimate." };
    return bf;
  }

  const girth = waistCm - neckCm;
  if (girth <= 0) return { error: "Waist must be larger than the neck measurement." };
  const denominator = 1.0324 - 0.19077 * log10(girth) + 0.15456 * log10(heightCm);
  if (!(denominator > 0)) return { error: "Those measurements do not produce a usable estimate." };
  const bf = 495 / denominator - 450;
  if (!Number.isFinite(bf)) return { error: "Those measurements do not produce a usable estimate." };
  return bf;
}

/** Which ACE band a body fat percentage falls in. */
export function bodyFatBand(bodyFatPct, sex) {
  const bands = BODY_FAT_BANDS[sex] ?? BODY_FAT_BANDS.male;
  return bands.find((band) => bodyFatPct >= band.min && bodyFatPct < band.max) ?? bands[bands.length - 1];
}

/**
 * Cross-check a BMI against body composition.
 *
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.heightCm
 * @param {number} input.weightKg
 * @param {number} input.waistCm
 * @param {number} [input.neckCm]        Needed when body fat is estimated from tape.
 * @param {number} [input.hipCm]         Needed for the female tape equation.
 * @param {number} [input.knownBodyFatPct] Supply a DEXA or skinfold figure to skip the tape estimate.
 * @returns {object} interpretation, or { error }.
 */
export function interpretAthleteBmi({
  sex = "male",
  heightCm,
  weightKg,
  waistCm,
  neckCm,
  hipCm,
  knownBodyFatPct,
}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female — the body fat equations differ." };
  }
  if ([heightCm, weightKg].some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter a height and a weight." };
  }
  if (heightCm < LIMITS.heightCm.min || heightCm > LIMITS.heightCm.max) {
    return { error: `Height must be between ${LIMITS.heightCm.min} cm and ${LIMITS.heightCm.max} cm.` };
  }
  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return { error: `Weight must be between ${LIMITS.weightKg.min} kg and ${LIMITS.weightKg.max} kg.` };
  }
  if (!Number.isFinite(waistCm) || waistCm < LIMITS.waistCm.min || waistCm > LIMITS.waistCm.max) {
    return { error: `Waist must be between ${LIMITS.waistCm.min} cm and ${LIMITS.waistCm.max} cm.` };
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (!Number.isFinite(bmi) || bmi <= 0) {
    return { error: "That height and weight do not produce a usable BMI." };
  }

  let bodyFatPct;
  let bodyFatSource;
  if (Number.isFinite(knownBodyFatPct)) {
    if (knownBodyFatPct < LIMITS.bodyFatPct.min || knownBodyFatPct > LIMITS.bodyFatPct.max) {
      return {
        error: `Body fat must be between ${LIMITS.bodyFatPct.min}% and ${LIMITS.bodyFatPct.max}%.`,
      };
    }
    bodyFatPct = knownBodyFatPct;
    bodyFatSource = "measured value you supplied";
  } else {
    if (!Number.isFinite(neckCm) || neckCm < LIMITS.neckCm.min || neckCm > LIMITS.neckCm.max) {
      return { error: `Neck must be between ${LIMITS.neckCm.min} cm and ${LIMITS.neckCm.max} cm.` };
    }
    if (sex === "female" && (!Number.isFinite(hipCm) || hipCm < LIMITS.hipCm.min || hipCm > LIMITS.hipCm.max)) {
      return { error: `Hip must be between ${LIMITS.hipCm.min} cm and ${LIMITS.hipCm.max} cm.` };
    }
    const estimate = navyBodyFat({ sex, heightCm, neckCm, waistCm, hipCm });
    if (typeof estimate !== "number") return estimate;
    if (estimate < LIMITS.bodyFatPct.min || estimate > LIMITS.bodyFatPct.max) {
      return {
        error: `Those measurements estimate ${round(estimate)}% body fat, outside the range this method can be trusted for. Re-check the tape.`,
      };
    }
    bodyFatPct = estimate;
    bodyFatSource = "US Navy tape estimate";
  }

  const fatMassKg = weightKg * (bodyFatPct / 100);
  const leanMassKg = weightKg - fatMassKg;
  const ffmi = leanMassKg / (heightM * heightM);
  // Kouri height normalisation to a 1.8 m reference.
  const normalisedFfmi = ffmi + 6.1 * (1.8 - heightM);
  const whtr = waistCm / heightCm;

  const bmiHigh = bmi >= BMI_CUTOFFS.overweight;
  const fatHigh = bodyFatPct >= OBESE_FAT_LIMIT[sex];
  const fatAthletic = bodyFatPct < ATHLETE_FAT_LIMIT[sex];
  const whtrHigh = whtr >= WHTR_LIMIT;

  let verdict;
  if (bmiHigh && (fatHigh || whtrHigh)) verdict = VERDICTS.supported;
  else if (bmiHigh && fatAthletic) verdict = VERDICTS.muscle;
  else if (bmiHigh) verdict = VERDICTS.leanish;
  else if (fatHigh || whtrHigh) verdict = VERDICTS.normalWeightHighFat;
  else verdict = VERDICTS.agree;

  // Weight at the BMI 25 line, and the weight this person would carry if their
  // fat fell to a lean-but-sustainable level while lean mass stayed the same: weight = lean / (1 - target fat fraction).
  const weightAtBmi25 = BMI_CUTOFFS.overweight * heightM * heightM;
  const excessOverBmi25 = Math.max(0, weightKg - weightAtBmi25);
  const targetFatPct = LEAN_FLOOR_FAT[sex];
  const leanWeightAtTargetFat = leanMassKg / (1 - targetFatPct / 100);
  const bmiAtTargetFat = leanWeightAtTargetFat / (heightM * heightM);
  // True when even a lean physique at this muscle mass still reads as overweight.
  const bmiStuckHigh = bmiAtTargetFat >= BMI_CUTOFFS.overweight;

  const ceiling = NATURAL_FFMI_CEILING[sex];

  let bmiBandLabel = "normal (under 25)";
  if (bmi >= BMI_CUTOFFS.obesity) bmiBandLabel = "obesity (30+)";
  else if (bmi >= BMI_CUTOFFS.overweight) bmiBandLabel = "overweight (25-29.9)";

  return {
    sex,
    bmi: round(bmi, 1),
    bmiBandLabel,
    bodyFatPct: round(bodyFatPct, 1),
    bodyFatSource,
    bodyFatBand: bodyFatBand(round(bodyFatPct, 1), sex),
    fatMassKg: round(fatMassKg, 1),
    leanMassKg: round(leanMassKg, 1),
    ffmi: round(ffmi, 1),
    normalisedFfmi: round(normalisedFfmi, 1),
    ffmiCeiling: ceiling,
    ffmiNearCeiling: normalisedFfmi >= ceiling - 1,
    whtr: round(whtr, 2),
    whtrHigh,
    weightAtBmi25: round(weightAtBmi25, 1),
    excessOverBmi25: round(excessOverBmi25, 1),
    targetFatPct,
    leanWeightAtTargetFat: round(leanWeightAtTargetFat, 1),
    bmiAtTargetFat: round(bmiAtTargetFat, 1),
    bmiStuckHigh,
    verdict,
    heightM: round(heightM, 3),
  };
}
