/**
 * BMI Prime.
 *
 *   BMI       = weight (kg) / height (m)^2
 *   BMI Prime = BMI / upper limit of the healthy BMI range
 *
 * With the WHO international upper limit of 25, BMI Prime is a plain ratio:
 * 1.00 sits exactly on the healthy ceiling, 1.15 is 15% above it, 0.90 is 10%
 * below it. Because it is a ratio, every band boundary is just the matching BMI
 * cutoff divided by the same reference, which is why the bands below are
 * generated rather than typed in.
 *
 * Sources:
 *  - WHO Technical Report Series 894 (2000): underweight <18.5, healthy
 *    18.5-24.9, overweight 25-29.9, obesity class I 30-34.9, II 35-39.9,
 *    III 40+. Dividing by 25 gives the familiar 0.74 / 1.00 / 1.20 / 1.40 / 1.60
 *    BMI Prime landmarks.
 *  - WHO/IASO/IOTF "The Asia-Pacific Perspective" (2000) and WHO Expert
 *    Consultation, Lancet 2004;363:157-63: for Asian populations the healthy
 *    ceiling is 23, overweight 23-24.9 and obesity 25+.
 */

export const LIMITS = {
  heightCm: { min: 100, max: 250 },
  weightKg: { min: 20, max: 400 },
};

/**
 * Each scheme lists the healthy floor, the reference ceiling that BMI Prime
 * divides by, and the BMI cutoffs that open each higher category.
 */
export const SCHEMES = {
  who: {
    key: "who",
    label: "WHO international",
    note: "Healthy BMI 18.5–24.9; BMI Prime divides by 25.",
    floor: 18.5,
    reference: 25,
    steps: [
      { at: 0, label: "Underweight", tone: "warn" },
      { at: 18.5, label: "Healthy weight", tone: "good" },
      { at: 25, label: "Overweight", tone: "warn" },
      { at: 30, label: "Obesity class I", tone: "bad" },
      { at: 35, label: "Obesity class II", tone: "bad" },
      { at: 40, label: "Obesity class III", tone: "bad" },
    ],
  },
  asia: {
    key: "asia",
    label: "WHO Asia-Pacific",
    note: "Healthy BMI 18.5–22.9; BMI Prime divides by 23.",
    floor: 18.5,
    reference: 23,
    steps: [
      { at: 0, label: "Underweight", tone: "warn" },
      { at: 18.5, label: "Healthy weight", tone: "good" },
      { at: 23, label: "Overweight (at risk)", tone: "warn" },
      { at: 25, label: "Obese I", tone: "bad" },
      { at: 30, label: "Obese II", tone: "bad" },
    ],
  },
};

const round = (value, dp) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/**
 * Turn a scheme's BMI cutoffs into BMI Prime bands.
 * @param {object} scheme One of SCHEMES.
 * @returns {Array<{label:string,tone:string,bmiMin:number,bmiMax:number,primeMin:number,primeMax:number}>}
 */
export function primeBands(scheme) {
  return scheme.steps.map((step, index) => {
    const next = scheme.steps[index + 1];
    const bmiMax = next ? next.at : Infinity;
    return {
      label: step.label,
      tone: step.tone,
      bmiMin: step.at,
      bmiMax,
      primeMin: round(step.at / scheme.reference, 3),
      primeMax: bmiMax === Infinity ? Infinity : round(bmiMax / scheme.reference, 3),
    };
  });
}

/** Format a height in centimetres as a "X ft Y.Y in" label for imperial error copy. */
const cmToFeetInchesLabel = (cm) => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = round(totalInches - feet * 12, 1);
  return `${feet} ft ${inches} in`;
};

/** Format a weight in kilograms as a "X.X lb" label for imperial error copy. */
const kgToPoundsLabel = (kg) => `${round(kg / 0.45359237, 1)} lb`;

/**
 * @param {object} input
 * @param {number} input.heightCm  Height in centimetres.
 * @param {number} input.weightKg  Weight in kilograms.
 * @param {"who"|"asia"} [input.scheme]
 * @param {"metric"|"imperial"} [input.unit] Controls the units used in validation error copy.
 * @returns {object} BMI Prime result, or { error }.
 */
export function bmiPrime({ heightCm, weightKg, scheme = "who", unit = "metric" }) {
  if ([heightCm, weightKg].some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter a valid height and weight." };
  }
  const imperial = unit === "imperial";
  if (heightCm < LIMITS.heightCm.min || heightCm > LIMITS.heightCm.max) {
    return {
      error: imperial
        ? `Height must be between ${cmToFeetInchesLabel(LIMITS.heightCm.min)} and ${cmToFeetInchesLabel(LIMITS.heightCm.max)}.`
        : `Height must be between ${LIMITS.heightCm.min} cm and ${LIMITS.heightCm.max} cm.`,
    };
  }
  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return {
      error: imperial
        ? `Weight must be between ${kgToPoundsLabel(LIMITS.weightKg.min)} and ${kgToPoundsLabel(LIMITS.weightKg.max)}.`
        : `Weight must be between ${LIMITS.weightKg.min} kg and ${LIMITS.weightKg.max} kg.`,
    };
  }

  const config = SCHEMES[scheme] ?? SCHEMES.who;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (!Number.isFinite(bmi) || bmi <= 0) {
    return { error: "That height and weight do not produce a usable BMI." };
  }

  const prime = bmi / config.reference;
  const bands = primeBands(config);
  // Classify the BMI that is actually displayed, so the band cannot contradict it.
  const shownBmi = round(bmi, 1);
  const band = bands.find((b) => shownBmi >= b.bmiMin && shownBmi < b.bmiMax) ?? bands[bands.length - 1];

  const areaM2 = heightM * heightM;
  const ceilingKg = config.reference * areaM2;
  const floorKg = config.floor * areaM2;
  const excessKg = weightKg > ceilingKg ? weightKg - ceilingKg : 0;
  const deficitKg = weightKg < floorKg ? floorKg - weightKg : 0;

  // Derive the headline and the percentages from the same rounded prime so a
  // headlined 1.00 always reads as exactly 100.0% / +0.0%, never a
  // contradicting sign or nonzero delta caused by rounding only the headline.
  const roundedPrime = round(prime, 2);

  return {
    bmi: round(bmi, 1),
    prime: roundedPrime,
    primeExact: prime,
    percentOfCeiling: round(roundedPrime * 100, 1),
    percentOver: round((roundedPrime - 1) * 100, 1),
    band,
    bands,
    scheme: config,
    reference: config.reference,
    ceilingKg: round(ceilingKg, 1),
    floorKg: round(floorKg, 1),
    excessKg: round(excessKg, 1),
    deficitKg: round(deficitKg, 1),
    /** Prime under both schemes, so the two references can be compared. */
    primeWho: round(bmi / SCHEMES.who.reference, 2),
    primeAsia: round(bmi / SCHEMES.asia.reference, 2),
  };
}

/** Convert feet + inches to centimetres. 1 inch = 2.54 cm exactly. */
export function feetInchesToCm(feet, inches) {
  const ft = Number.isFinite(feet) ? feet : 0;
  const inch = Number.isFinite(inches) ? inches : 0;
  return (ft * 12 + inch) * 2.54;
}

/** Convert pounds to kilograms. 1 lb = 0.45359237 kg exactly. */
export function poundsToKg(pounds) {
  return Number.isFinite(pounds) ? pounds * 0.45359237 : 0;
}
