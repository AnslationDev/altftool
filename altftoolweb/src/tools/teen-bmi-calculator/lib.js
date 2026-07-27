/**
 * Teen BMI against age- and sex-specific cut-offs.
 *
 * BMI itself is the ordinary Quetelet index:
 *
 *     BMI = weight (kg) / height (m)^2
 *
 * What changes for adolescents is where the risk lines sit. Body fatness rises
 * and falls through puberty, so the adult lines at 25 and 30 misclassify
 * teenagers badly — a BMI of 24 is well into the overweight range for a
 * 12-year-old but perfectly ordinary at 18.
 *
 * The cut-offs below are the International Obesity Task Force (IOTF) curves
 * published by Cole TJ, Bellizzi MC, Flegal KM and Dietz WH, "Establishing a
 * standard definition for child overweight and obesity worldwide: international
 * survey", BMJ 2000;320:1240-3. Each curve is drawn so that it passes through
 * exactly 25 (overweight) and 30 (obesity) at age 18, which is why the table
 * ends there and the adult lines take over.
 *
 * Deliberate limitation: this tool does NOT assess thinness or underweight.
 * A low adolescent BMI needs a clinician plotting height, weight and growth
 * velocity on a full growth chart, not a single cut-off.
 *
 * Everything here is pure — age is supplied by the caller, never read from a clock.
 */

/** Age range these cut-offs cover, in years. */
export const AGE_RANGE = { min: 10, max: 20 };

/** Age from which the adult lines apply unchanged. */
export const ADULT_AGE = 18;

/** Adult overweight and obesity lines, kg/m^2 (WHO Technical Report Series 894). */
export const ADULT_CUTOFFS = { overweight: 25, obesity: 30 };

/** Sanity limits so a typo cannot produce a plausible-looking BMI. */
export const LIMITS = {
  heightCm: { min: 110, max: 220 },
  weightKg: { min: 20, max: 250 },
};

/**
 * IOTF cut-offs, half-year steps, ages 10 to 18.
 * Each row is [age in years, BMI for overweight, BMI for obesity].
 */
export const IOTF_CUTOFFS = {
  male: [
    [10, 19.84, 24.0],
    [10.5, 20.2, 24.57],
    [11, 20.55, 25.1],
    [11.5, 20.89, 25.58],
    [12, 21.22, 26.02],
    [12.5, 21.56, 26.43],
    [13, 21.91, 26.84],
    [13.5, 22.27, 27.25],
    [14, 22.62, 27.63],
    [14.5, 22.96, 27.98],
    [15, 23.29, 28.3],
    [15.5, 23.6, 28.6],
    [16, 23.9, 28.88],
    [16.5, 24.19, 29.14],
    [17, 24.46, 29.41],
    [17.5, 24.73, 29.7],
    [18, 25.0, 30.0],
  ],
  female: [
    [10, 19.86, 24.11],
    [10.5, 20.29, 24.77],
    [11, 20.74, 25.42],
    [11.5, 21.2, 26.05],
    [12, 21.68, 26.67],
    [12.5, 22.14, 27.24],
    [13, 22.58, 27.76],
    [13.5, 22.98, 28.2],
    [14, 23.34, 28.57],
    [14.5, 23.66, 28.87],
    [15, 23.94, 29.11],
    [15.5, 24.17, 29.29],
    [16, 24.37, 29.43],
    [16.5, 24.54, 29.56],
    [17, 24.7, 29.69],
    [17.5, 24.85, 29.84],
    [18, 25.0, 30.0],
  ],
};

export const TEEN_BANDS = {
  belowOverweight: {
    key: "belowOverweight",
    label: "Below the overweight line for this age",
    tone: "good",
    meaning:
      "BMI sits under the IOTF overweight cut-off for this age and sex. That rules out overweight; it does not by itself confirm the weight is ideal.",
  },
  overweight: {
    key: "overweight",
    label: "Overweight (IOTF)",
    tone: "warn",
    meaning:
      "BMI is at or above the age- and sex-specific line that grows into an adult BMI of 25, but below the obesity line.",
  },
  obesity: {
    key: "obesity",
    label: "Obesity (IOTF)",
    tone: "bad",
    meaning:
      "BMI is at or above the age- and sex-specific line that grows into an adult BMI of 30. Worth a clinical review rather than a self-directed diet.",
  },
};

const round = (value, dp = 1) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** 1 inch = 2.54 cm exactly. */
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
 * Cut-offs for one age and sex, interpolating linearly between the half-year
 * rows of the published table. Ages of 18 and over use the adult lines.
 *
 * @returns {{overweight:number, obesity:number, source:string}|null}
 */
export function cutoffsForAge(ageYears, sex) {
  const table = IOTF_CUTOFFS[sex];
  if (!table) return null;
  if (!Number.isFinite(ageYears)) return null;
  if (ageYears >= ADULT_AGE) {
    return { ...ADULT_CUTOFFS, source: "Adult WHO lines (25 and 30) apply from age 18." };
  }
  if (ageYears < table[0][0]) return null;

  for (let i = 0; i < table.length - 1; i += 1) {
    const [ageLow, owLow, obLow] = table[i];
    const [ageHigh, owHigh, obHigh] = table[i + 1];
    if (ageYears >= ageLow && ageYears <= ageHigh) {
      const span = ageHigh - ageLow;
      const t = span === 0 ? 0 : (ageYears - ageLow) / span;
      return {
        overweight: owLow + (owHigh - owLow) * t,
        obesity: obLow + (obHigh - obLow) * t,
        source: "IOTF cut-offs (Cole et al., BMJ 2000), interpolated between half-year points.",
      };
    }
  }
  return null;
}

/**
 * @param {object} input
 * @param {number} input.heightCm
 * @param {number} input.weightKg
 * @param {number} input.ageYears  Age in years, decimals allowed (13.5 = thirteen and a half).
 * @param {"male"|"female"} input.sex
 * @returns {object} classification, or { error }.
 */
export function teenBmi({ heightCm, weightKg, ageYears, sex = "male" }) {
  if ([heightCm, weightKg, ageYears].some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter a height, a weight and an age." };
  }
  if (!IOTF_CUTOFFS[sex]) return { error: "Choose male or female — the cut-offs differ by sex." };
  if (ageYears < AGE_RANGE.min) {
    return {
      error: `These cut-offs start at age ${AGE_RANGE.min}. Younger children need a full growth chart plotted by a clinician.`,
    };
  }
  if (ageYears > AGE_RANGE.max) {
    return {
      error: `Past age ${AGE_RANGE.max} the ordinary adult BMI bands apply — use a standard BMI calculator.`,
    };
  }
  if (heightCm < LIMITS.heightCm.min || heightCm > LIMITS.heightCm.max) {
    return {
      error: `Height must be between ${LIMITS.heightCm.min} cm and ${LIMITS.heightCm.max} cm.`,
    };
  }
  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return {
      error: `Weight must be between ${LIMITS.weightKg.min} kg and ${LIMITS.weightKg.max} kg.`,
    };
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (!Number.isFinite(bmi) || bmi <= 0) {
    return { error: "That height and weight do not produce a usable BMI." };
  }

  const cutoffs = cutoffsForAge(ageYears, sex);
  if (!cutoffs) return { error: "No cut-offs are published for that age and sex combination." };

  // Classify the value shown on screen so the band can never contradict the number.
  const shownBmi = round(bmi, 1);
  let band = TEEN_BANDS.belowOverweight;
  if (shownBmi >= cutoffs.obesity) band = TEEN_BANDS.obesity;
  else if (shownBmi >= cutoffs.overweight) band = TEEN_BANDS.overweight;

  // Weight at each cut-off for this height, and the change needed to reach it.
  const weightAtOverweight = cutoffs.overweight * heightM * heightM;
  const weightAtObesity = cutoffs.obesity * heightM * heightM;

  // What the same BMI would be called using the adult lines, for the contrast.
  let adultBandLabel = "below 25";
  if (shownBmi >= ADULT_CUTOFFS.obesity) adultBandLabel = "obesity (30+)";
  else if (shownBmi >= ADULT_CUTOFFS.overweight) adultBandLabel = "overweight (25-29.9)";

  const adultWouldDiffer =
    (shownBmi >= cutoffs.overweight && shownBmi < ADULT_CUTOFFS.overweight) ||
    (shownBmi >= cutoffs.obesity && shownBmi < ADULT_CUTOFFS.obesity);

  return {
    bmi: shownBmi,
    bmiExact: bmi,
    heightM: round(heightM, 3),
    ageYears: round(ageYears, 1),
    sex,
    band,
    cutoffs: {
      overweight: round(cutoffs.overweight, 2),
      obesity: round(cutoffs.obesity, 2),
      source: cutoffs.source,
    },
    usesAdultLines: ageYears >= ADULT_AGE,
    gapToOverweight: round(cutoffs.overweight - shownBmi, 1),
    gapToObesity: round(cutoffs.obesity - shownBmi, 1),
    weightAtOverweight: round(weightAtOverweight, 1),
    weightAtObesity: round(weightAtObesity, 1),
    kgAboveOverweight: round(Math.max(0, weightKg - weightAtOverweight), 1),
    kgBelowOverweight: round(Math.max(0, weightAtOverweight - weightKg), 1),
    adultBandLabel,
    adultWouldDiffer,
  };
}
