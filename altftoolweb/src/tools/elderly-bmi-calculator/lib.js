/**
 * BMI for older adults (65+), with the age-adjusted healthy range, a stature
 * estimate for people who can no longer stand straight, and the MUST
 * malnutrition-risk score.
 *
 * BMI = weight (kg) / height (m)^2.
 *
 * Sources:
 *  - Lipschitz DA, "Screening for nutritional status in the elderly",
 *    Primary Care 1994;21:55-67 — proposed a desirable BMI of 24-29 for people
 *    over 65, higher than the 18.5-24.9 adult band.
 *  - Winter JE et al., "BMI and all-cause mortality in older adults: a
 *    meta-analysis", Am J Clin Nutr 2014;99:875-90 — lowest mortality clustered
 *    around BMI 27.5 in adults 65 and over; risk rose below BMI 23.
 *  - BAPEN 'MUST' (Malnutrition Universal Screening Tool) explanatory booklet:
 *    BMI score, unplanned weight-loss score and acute-disease score, summed to
 *    a 0 (low), 1 (medium), 2+ (high) risk category.
 *  - Chumlea WC, Roche AF, Steinbaugh ML, "Estimating stature from knee height
 *    for persons 60 to 90 years of age", J Am Geriatr Soc 1985;33:116-20.
 *  - WHO Technical Report Series 894 (2000) for the standard adult bands.
 */

/** These age-adjusted bands are only intended for people at or above this age. */
export const OLDER_ADULT_AGE = 65;

export const LIMITS = {
  age: { min: 50, max: 120 },
  heightCm: { min: 120, max: 220 },
  kneeHeightCm: { min: 30, max: 70 },
  weightKg: { min: 25, max: 250 },
};

/** Standard WHO adult bands (TRS 894). `max` is exclusive. */
export const STANDARD_BANDS = [
  { key: "underweight", label: "Underweight", min: 0, max: 18.5, tone: "bad" },
  { key: "normal", label: "Healthy weight", min: 18.5, max: 25, tone: "good" },
  { key: "overweight", label: "Overweight", min: 25, max: 30, tone: "warn" },
  { key: "obese", label: "Obesity", min: 30, max: Infinity, tone: "bad" },
];

/**
 * Age-adjusted bands for 65+. The desirable window is Lipschitz's 24-29;
 * the 22 line is the BMI below which malnutrition screening tools flag risk in
 * older adults, and the 30/35 lines keep the standard obesity classes.
 */
export const OLDER_ADULT_BANDS = [
  { key: "underweight", label: "Underweight — malnutrition risk", min: 0, max: 22, tone: "bad" },
  { key: "low", label: "Below the desirable range", min: 22, max: 24, tone: "warn" },
  { key: "desirable", label: "Desirable for 65+", min: 24, max: 29, tone: "good" },
  { key: "above", label: "Above desirable", min: 29, max: 35, tone: "warn" },
  { key: "obese", label: "Obesity with functional risk", min: 35, max: Infinity, tone: "bad" },
];

/** Lipschitz desirable BMI window for 65+, used for the target-weight figure. */
export const DESIRABLE_BMI = { min: 24, max: 29 };

/** MUST step 1 — BMI score. Bands are BMI <18.5 = 2, 18.5 to 20 = 1, above 20 = 0. */
export const MUST_BMI_SCORE = [
  { score: 2, text: "BMI below 18.5" },
  { score: 1, text: "BMI 18.5 to 20" },
  { score: 0, text: "BMI above 20" },
];

/** MUST step 2 — unplanned weight loss over 3 to 6 months: <5% = 0, 5-10% = 1, >10% = 2. */
export const MUST_LOSS_SCORE = [
  { score: 0, text: "Unplanned weight loss under 5%" },
  { score: 1, text: "Unplanned weight loss of 5% to 10%" },
  { score: 2, text: "Unplanned weight loss above 10%" },
];

/** MUST step 1 lookup. Boundaries follow BAPEN exactly: 18.5 and 20 score 1. */
export function mustBmiScore(bmi) {
  if (bmi < 18.5) return MUST_BMI_SCORE[0];
  if (bmi <= 20) return MUST_BMI_SCORE[1];
  return MUST_BMI_SCORE[2];
}

/** MUST step 2 lookup. Boundaries follow BAPEN exactly: 5% and 10% score 1. */
export function mustLossScore(lossPercent) {
  if (lossPercent < 5) return MUST_LOSS_SCORE[0];
  if (lossPercent <= 10) return MUST_LOSS_SCORE[1];
  return MUST_LOSS_SCORE[2];
}

/** MUST step 3 — acutely ill with no nutritional intake for more than 5 days. */
export const MUST_ACUTE_SCORE = 2;

export const MUST_RISK = [
  { max: 1, key: "low", label: "Low risk", action: "Routine clinical care; repeat the screen as your setting requires." },
  { max: 2, key: "medium", label: "Medium risk", action: "Observe: record intake for three days and re-screen." },
  { max: Infinity, key: "high", label: "High risk", action: "Treat: refer to a dietitian or nutritional support team." },
];

const round = (value, dp = 1) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

const classify = (bmi, bands) =>
  bands.find((band) => bmi >= band.min && bmi < band.max) ?? bands[bands.length - 1];

/**
 * Chumlea (1985) stature estimate from knee height, for people aged 60-90 who
 * cannot stand for a normal height measurement.
 * @param {object} input
 * @param {number} input.kneeHeightCm Knee-to-floor height, left leg bent at 90 degrees.
 * @param {number} input.age Age in years.
 * @param {"male"|"female"} input.sex
 * @returns {number|null} estimated standing height in cm, or null on bad input.
 */
export function statureFromKneeHeight({ kneeHeightCm, age, sex }) {
  if (![kneeHeightCm, age].every((n) => typeof n === "number" && Number.isFinite(n))) return null;
  if (kneeHeightCm < LIMITS.kneeHeightCm.min || kneeHeightCm > LIMITS.kneeHeightCm.max) return null;
  if (age <= 0) return null;
  const height =
    sex === "female"
      ? 84.88 - 0.24 * age + 1.83 * kneeHeightCm
      : 64.19 - 0.04 * age + 2.02 * kneeHeightCm;
  return Number.isFinite(height) ? round(height, 1) : null;
}

/**
 * @param {object} input
 * @param {number} input.weightKg        Current weight in kilograms.
 * @param {number} input.age             Age in years.
 * @param {"male"|"female"} input.sex
 * @param {"measured"|"knee"} [input.heightMode]
 * @param {number} [input.heightCm]      Measured standing height, cm.
 * @param {number} [input.kneeHeightCm]  Knee height, cm (used when heightMode is "knee").
 * @param {number} [input.usualWeightKg] Weight 3 to 6 months ago, kg. Optional.
 * @param {boolean} [input.acutelyIll]   Acutely ill with no intake for over 5 days.
 * @returns {object} classification and MUST score, or { error }.
 */
export function elderlyBmi({
  weightKg,
  age,
  sex = "female",
  heightMode = "measured",
  heightCm,
  kneeHeightCm,
  usualWeightKg,
  acutelyIll = false,
}) {
  if (typeof weightKg !== "number" || !Number.isFinite(weightKg)) {
    return { error: "Enter a valid weight in kilograms." };
  }
  if (typeof age !== "number" || !Number.isFinite(age)) {
    return { error: "Enter a valid age in years." };
  }
  if (age < LIMITS.age.min || age > LIMITS.age.max) {
    return { error: `Age must be between ${LIMITS.age.min} and ${LIMITS.age.max} years.` };
  }
  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return { error: `Weight must be between ${LIMITS.weightKg.min} kg and ${LIMITS.weightKg.max} kg.` };
  }

  let effectiveHeight = heightCm;
  let estimatedHeight = null;
  if (heightMode === "knee") {
    if (typeof kneeHeightCm !== "number" || !Number.isFinite(kneeHeightCm)) {
      return { error: "Enter a valid knee height in centimetres." };
    }
    if (kneeHeightCm < LIMITS.kneeHeightCm.min || kneeHeightCm > LIMITS.kneeHeightCm.max) {
      return {
        error: `Knee height must be between ${LIMITS.kneeHeightCm.min} cm and ${LIMITS.kneeHeightCm.max} cm.`,
      };
    }
    estimatedHeight = statureFromKneeHeight({ kneeHeightCm, age, sex });
    if (estimatedHeight === null) return { error: "That knee height does not produce a usable stature estimate." };
    effectiveHeight = estimatedHeight;
  }

  if (typeof effectiveHeight !== "number" || !Number.isFinite(effectiveHeight)) {
    return { error: "Enter a valid height in centimetres." };
  }
  if (effectiveHeight < LIMITS.heightCm.min || effectiveHeight > LIMITS.heightCm.max) {
    return {
      error: `Height must be between ${LIMITS.heightCm.min} cm and ${LIMITS.heightCm.max} cm.`,
    };
  }

  const heightM = effectiveHeight / 100;
  const bmi = weightKg / (heightM * heightM);
  if (!Number.isFinite(bmi) || bmi <= 0) {
    return { error: "That height and weight do not produce a usable BMI." };
  }

  // Classify the value that is actually displayed, so the band can never
  // contradict the number shown next to it.
  const shownBmi = round(bmi, 1);
  const standardBand = classify(shownBmi, STANDARD_BANDS);
  const olderBand = classify(shownBmi, OLDER_ADULT_BANDS);
  const ageAdjustedApplies = age >= OLDER_ADULT_AGE;

  const desirableMinKg = DESIRABLE_BMI.min * heightM * heightM;
  const desirableMaxKg = DESIRABLE_BMI.max * heightM * heightM;

  // MUST step 2 needs a percentage loss; only count unintended loss, never gain.
  let lossPercent = null;
  if (typeof usualWeightKg === "number" && Number.isFinite(usualWeightKg) && usualWeightKg > 0) {
    if (usualWeightKg < LIMITS.weightKg.min || usualWeightKg > LIMITS.weightKg.max) {
      return {
        error: `Previous weight must be between ${LIMITS.weightKg.min} kg and ${LIMITS.weightKg.max} kg, or left blank.`,
      };
    }
    lossPercent = ((usualWeightKg - weightKg) / usualWeightKg) * 100;
  }

  const bmiRow = mustBmiScore(bmi);
  const lossRow = lossPercent === null ? null : mustLossScore(Math.max(0, lossPercent));
  const acuteScore = acutelyIll ? MUST_ACUTE_SCORE : 0;
  const mustTotal = bmiRow.score + (lossRow ? lossRow.score : 0) + acuteScore;
  const mustRisk = MUST_RISK.find((row) => mustTotal < row.max) ?? MUST_RISK[MUST_RISK.length - 1];

  return {
    bmi: round(bmi, 1),
    heightUsedCm: round(effectiveHeight, 1),
    estimatedHeight,
    heightEstimated: heightMode === "knee",
    standardBand,
    olderBand,
    ageAdjustedApplies,
    band: ageAdjustedApplies ? olderBand : standardBand,
    desirableMinKg: round(desirableMinKg, 1),
    desirableMaxKg: round(desirableMaxKg, 1),
    kgToDesirable:
      bmi < DESIRABLE_BMI.min
        ? round(desirableMinKg - weightKg, 1)
        : bmi > DESIRABLE_BMI.max
          ? round(weightKg - desirableMaxKg, 1)
          : 0,
    belowDesirable: bmi < DESIRABLE_BMI.min,
    lossPercent: lossPercent === null ? null : round(lossPercent, 1),
    lossKg: lossPercent === null ? null : round((usualWeightKg ?? 0) - weightKg, 1),
    must: {
      bmiScore: bmiRow.score,
      bmiText: bmiRow.text,
      lossScore: lossRow ? lossRow.score : 0,
      lossText: lossRow ? lossRow.text : "Weight change not supplied — scored as 0",
      acuteScore,
      acuteText: acutelyIll
        ? "Acutely ill with no nutritional intake for more than 5 days"
        : "No acute-disease effect recorded",
      total: mustTotal,
      risk: mustRisk,
    },
  };
}
