/**
 * Neck circumference screening maths.
 *
 * Neck circumference is a proxy for upper-body (subcutaneous) fat. Two independent
 * sets of published cut-offs are applied: Ben-Noun's adiposity screen and the neck
 * criterion used inside obstructive sleep apnoea questionnaires. Nothing here is
 * diagnostic — it is a screening prompt to take to a clinician.
 */

/** Inches to centimetres, exact. */
export const IN_TO_CM = 2.54;

/**
 * Ben-Noun L, Sohar E, Laor A. "Neck circumference as a simple screening measure for
 * identifying overweight and obese patients." Obesity Research, 2001. Neck at or above
 * these values flagged BMI >= 25.
 */
export const BEN_NOUN_OVERWEIGHT_CM = { male: 37, female: 34 };

/** Same paper: neck at or above these values flagged BMI >= 30. */
export const BEN_NOUN_OBESITY_CM = { male: 39.5, female: 36.5 };

/**
 * The "N" item of the STOP-BANG obstructive sleep apnoea questionnaire scores a point
 * for a neck circumference larger than 40 cm (about 16 inches), applied to both sexes.
 */
export const STOPBANG_NECK_CM = 40;

/**
 * Sex-specific neck thresholds widely used in sleep clinics as a stronger apnoea
 * signal: 43 cm (17 in) for men and 41 cm (16 in) for women.
 */
export const OSA_NECK_CM = { male: 43, female: 41 };

/** WHO adult BMI categories, used only for the optional cross-check. */
export const BMI_OVERWEIGHT = 25;
export const BMI_OBESE = 30;

/** Plausible adult neck circumference range; outside this the tape was misread. */
export const NECK_LIMITS_CM = [20, 70];
export const HEIGHT_LIMITS_CM = [100, 250];
export const WEIGHT_LIMITS_KG = [20, 300];

export const MEASUREMENT_STEPS = [
  "Stand upright, shoulders relaxed, looking straight ahead.",
  "Find the cricothyroid membrane — the soft dip just below the Adam's apple.",
  "Wrap the tape horizontally at that level, perpendicular to the neck, not sloping.",
  "Pull the tape snug but not tight enough to compress the skin, and breathe normally.",
  "Read it at the end of a normal breath out, to the nearest 0.5 cm.",
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

export function inchesToCm(inches) {
  return isFiniteNumber(inches) ? inches * IN_TO_CM : NaN;
}

export function cmToInches(cm) {
  return isFiniteNumber(cm) ? cm / IN_TO_CM : NaN;
}

/**
 * @param {object} input
 * @param {number} input.neckCm            neck circumference in centimetres
 * @param {"male"|"female"} input.sex      which published cut-off set to apply
 * @param {number} [input.heightCm]        optional, enables the BMI cross-check
 * @param {number} [input.weightKg]        optional, enables the BMI cross-check
 */
export function assessNeckCircumference({ neckCm, sex = "male", heightCm, weightKg }) {
  if (!isFiniteNumber(neckCm)) {
    return { error: "Enter your neck measurement." };
  }
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose which cut-off set to use." };
  }
  if (neckCm < NECK_LIMITS_CM[0] || neckCm > NECK_LIMITS_CM[1]) {
    return {
      error: `A neck measurement of ${neckCm} cm is outside the plausible adult range of ${NECK_LIMITS_CM[0]}-${NECK_LIMITS_CM[1]} cm. Re-check the tape.`,
    };
  }

  const overweightCut = BEN_NOUN_OVERWEIGHT_CM[sex];
  const obesityCut = BEN_NOUN_OBESITY_CM[sex];
  const osaCut = OSA_NECK_CM[sex];

  const meetsOverweightScreen = neckCm >= overweightCut;
  const meetsObesityScreen = neckCm >= obesityCut;
  const meetsStopBangNeck = neckCm > STOPBANG_NECK_CM;
  const meetsSexSpecificOsa = neckCm >= osaCut;

  let level;
  let headline;
  if (meetsSexSpecificOsa) {
    level = "high";
    headline = `At or above the ${osaCut} cm neck size sleep clinics treat as a strong apnoea signal for ${sex === "male" ? "men" : "women"}.`;
  } else if (meetsObesityScreen || meetsStopBangNeck) {
    level = "elevated";
    headline = `Above the ${obesityCut} cm adiposity cut-off${meetsStopBangNeck ? ` and above the ${STOPBANG_NECK_CM} cm STOP-BANG neck criterion` : ""}.`;
  } else if (meetsOverweightScreen) {
    level = "borderline";
    headline = `At or above the ${overweightCut} cm cut-off that flagged a BMI of 25 or more in Ben-Noun's screening study.`;
  } else {
    level = "typical";
    headline = `Below the ${overweightCut} cm screening cut-off for ${sex === "male" ? "men" : "women"}.`;
  }

  const flags = [
    {
      key: "overweight",
      label: `Ben-Noun overweight screen (${overweightCut} cm)`,
      met: meetsOverweightScreen,
      meaning: "Neck size alone flagged a BMI of 25 or more in the original study population.",
    },
    {
      key: "obesity",
      label: `Ben-Noun obesity screen (${obesityCut} cm)`,
      met: meetsObesityScreen,
      meaning: "Neck size alone flagged a BMI of 30 or more.",
    },
    {
      key: "stopbang",
      label: `STOP-BANG neck criterion (over ${STOPBANG_NECK_CM} cm)`,
      met: meetsStopBangNeck,
      meaning: "Scores one point on the STOP-BANG sleep apnoea questionnaire.",
    },
    {
      key: "osa",
      label: `Sleep-clinic neck threshold (${osaCut} cm)`,
      met: meetsSexSpecificOsa,
      meaning: "The sex-specific neck size most often quoted alongside higher apnoea likelihood.",
    },
  ];

  const result = {
    neckCm,
    neckInches: cmToInches(neckCm),
    sex,
    level,
    headline,
    overweightCut,
    obesityCut,
    stopBangCut: STOPBANG_NECK_CM,
    osaCut,
    cmToOverweightCut: overweightCut - neckCm,
    cmToOsaCut: osaCut - neckCm,
    flags,
    metCount: flags.filter((flag) => flag.met).length,
  };

  const hasBmiInputs = isFiniteNumber(heightCm) && isFiniteNumber(weightKg);
  if (!hasBmiInputs) return { ...result, bmi: null, bmiCategory: null, agreement: null };

  if (
    heightCm < HEIGHT_LIMITS_CM[0] ||
    heightCm > HEIGHT_LIMITS_CM[1] ||
    weightKg < WEIGHT_LIMITS_KG[0] ||
    weightKg > WEIGHT_LIMITS_KG[1]
  ) {
    return {
      error: `For the BMI cross-check, height must be ${HEIGHT_LIMITS_CM[0]}-${HEIGHT_LIMITS_CM[1]} cm and weight ${WEIGHT_LIMITS_KG[0]}-${WEIGHT_LIMITS_KG[1]} kg. Leave both blank to skip it.`,
    };
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let bmiCategory = "Healthy weight";
  if (bmi < 18.5) bmiCategory = "Underweight";
  else if (bmi >= BMI_OBESE) bmiCategory = "Obese";
  else if (bmi >= BMI_OVERWEIGHT) bmiCategory = "Overweight";

  const bmiFlags = bmi >= BMI_OVERWEIGHT;
  let agreement;
  if (bmiFlags && meetsOverweightScreen) {
    agreement = "Both the neck screen and BMI point the same way.";
  } else if (!bmiFlags && !meetsOverweightScreen) {
    agreement = "Neither the neck screen nor BMI is flagged.";
  } else if (meetsOverweightScreen && !bmiFlags) {
    agreement =
      "The neck screen flags but BMI does not — common in muscular builds, where neck size reflects muscle rather than fat.";
  } else {
    agreement =
      "BMI flags but the neck screen does not — fat may be carried more around the abdomen than the upper body.";
  }

  return { ...result, bmi, bmiCategory, agreement };
}
