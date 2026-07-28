/**
 * Male body-fat estimation.
 *
 * Three published equations, all reproduced exactly:
 *  - US Navy circumference method (metric form) for men
 *  - Jackson & Pollock 3-site skinfold (chest, abdomen, thigh) plus the Siri
 *    body-density-to-fat conversion
 *  - Deurenberg BMI equation, used only as a rough cross-check
 *
 * Every one of these estimates fat; none of them measures it. Expect a
 * standard error of roughly 3-4 percentage points against a DXA scan.
 */

/** US Navy body-fat equation for men, centimetre form. */
export const NAVY_MALE = {
  numerator: 495,
  offset: 450,
  intercept: 1.0324,
  waistNeckCoeff: 0.19077,
  heightCoeff: 0.15456,
};

/** Jackson & Pollock (1978) 3-site body-density equation for men. */
export const JP3_MALE = {
  intercept: 1.10938,
  sumCoeff: 0.0008267,
  sumSquaredCoeff: 0.0000016,
  ageCoeff: 0.0002574,
};

/** Siri (1961) two-compartment conversion from body density to percent fat. */
export const SIRI = { numerator: 495, offset: 450 };

/** Deurenberg et al. (1991): %BF = 1.20 x BMI + 0.23 x age - 10.8 x sex - 5.4, sex = 1 for men. */
export const DEURENBERG = { bmiCoeff: 1.2, ageCoeff: 0.23, maleTerm: 10.8, constant: 5.4 };

/**
 * American Council on Exercise body-fat categories for men.
 * Bands are upper bounds: below 6 essential, below 14 athlete, and so on.
 */
export const ACE_MALE_BANDS = [
  { max: 6, label: "Essential fat", note: "At or below the 2-5% minimum needed for normal physiology — not sustainable." },
  { max: 14, label: "Athletic", note: "6-13%: the range typical of competitive athletes." },
  { max: 18, label: "Fitness", note: "14-17%: lean and healthy for a regularly training adult." },
  { max: 25, label: "Average", note: "18-24%: the acceptable range for most adult men." },
  { max: Infinity, label: "Above average", note: "25% and over is the level ACE labels obese for men." },
];

export const MIN_AGE = 18;
export const MAX_AGE = 100;
export const MIN_HEIGHT_CM = 100;
export const MAX_HEIGHT_CM = 250;
export const MIN_WEIGHT_KG = 25;
export const MAX_WEIGHT_KG = 300;
export const MAX_SKINFOLD_SUM_MM = 250;

/** Below and above these the equations stop being meaningful. */
export const MIN_PLAUSIBLE_PERCENT = 2;
export const MAX_PLAUSIBLE_PERCENT = 70;

export const METHODS = [
  { value: "navy", label: "US Navy tape measurements" },
  { value: "skinfold", label: "Jackson-Pollock 3-site skinfolds" },
  { value: "bmi", label: "Deurenberg BMI estimate" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function classifyMale(percent) {
  return ACE_MALE_BANDS.find((band) => percent < band.max) ?? ACE_MALE_BANDS[ACE_MALE_BANDS.length - 1];
}

/** US Navy circumference method for men. Returns a number or null when undefined. */
export function navyBodyFatMale({ heightCm, neckCm, waistCm } = {}) {
  if (![heightCm, neckCm, waistCm].every(isNum)) return null;
  const girth = waistCm - neckCm;
  if (girth <= 0 || heightCm <= 0) return null;
  const denominator =
    NAVY_MALE.intercept -
    NAVY_MALE.waistNeckCoeff * Math.log10(girth) +
    NAVY_MALE.heightCoeff * Math.log10(heightCm);
  if (denominator <= 0) return null;
  return NAVY_MALE.numerator / denominator - NAVY_MALE.offset;
}

/** Jackson-Pollock 3-site body density for men, from skinfolds in millimetres. */
export function jp3BodyDensityMale({ age, chestMm, abdomenMm, thighMm } = {}) {
  if (![age, chestMm, abdomenMm, thighMm].every(isNum)) return null;
  const sum = chestMm + abdomenMm + thighMm;
  if (sum <= 0) return null;
  return (
    JP3_MALE.intercept -
    JP3_MALE.sumCoeff * sum +
    JP3_MALE.sumSquaredCoeff * sum * sum -
    JP3_MALE.ageCoeff * age
  );
}

/** Siri conversion: percent fat from body density in g/cm3. */
export function siriPercent(density) {
  if (!isNum(density) || density <= 0) return null;
  return SIRI.numerator / density - SIRI.offset;
}

export function deurenbergMale({ bmi, age } = {}) {
  if (![bmi, age].every(isNum)) return null;
  return DEURENBERG.bmiCoeff * bmi + DEURENBERG.ageCoeff * age - DEURENBERG.maleTerm - DEURENBERG.constant;
}

/**
 * @param {object} input
 * @param {"navy"|"skinfold"|"bmi"} input.method  which estimate to headline
 * @param {number} input.age
 * @param {number} input.heightCm
 * @param {number} input.weightKg
 * @param {number} input.neckCm     neck circumference, Navy method
 * @param {number} input.waistCm    waist/abdomen circumference, Navy method
 * @param {number} input.chestMm    chest skinfold
 * @param {number} input.abdomenMm  abdominal skinfold
 * @param {number} input.thighMm    thigh skinfold
 */
export function estimateMaleBodyFat({
  method = "navy",
  age,
  heightCm,
  weightKg,
  neckCm = 0,
  waistCm = 0,
  chestMm = 0,
  abdomenMm = 0,
  thighMm = 0,
} = {}) {
  if (![age, heightCm, weightKg, neckCm, waistCm, chestMm, abdomenMm, thighMm].every(isNum)) {
    return { error: "Enter a number in every field." };
  }
  if (!METHODS.some((entry) => entry.value === method)) {
    return { error: "Choose one of the three methods." };
  }
  if (age < MIN_AGE || age > MAX_AGE) {
    return { error: `These equations were derived on adults — enter an age between ${MIN_AGE} and ${MAX_AGE}.` };
  }
  if (heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) {
    return { error: `Height should be between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM} cm.` };
  }
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Weight should be between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.` };
  }
  if (neckCm < 0 || waistCm < 0 || chestMm < 0 || abdomenMm < 0 || thighMm < 0) {
    return { error: "Measurements cannot be negative." };
  }

  const skinfoldSum = chestMm + abdomenMm + thighMm;
  if (skinfoldSum > MAX_SKINFOLD_SUM_MM) {
    return { error: `A skinfold sum above ${MAX_SKINFOLD_SUM_MM} mm is outside the range the Jackson-Pollock equation covers.` };
  }

  const bmi = weightKg / (heightCm / 100) ** 2;

  if (method === "navy") {
    if (!(neckCm > 0) || !(waistCm > 0)) {
      return { error: "Enter both the neck and the waist measurement for the Navy method." };
    }
    if (waistCm <= neckCm) {
      return { error: "Waist must be larger than neck — check that both are in centimetres." };
    }
  }
  if (method === "skinfold" && !(skinfoldSum > 0)) {
    return { error: "Enter the chest, abdomen and thigh skinfolds in millimetres." };
  }

  const navy = navyBodyFatMale({ heightCm, neckCm, waistCm });
  const density = jp3BodyDensityMale({ age, chestMm, abdomenMm, thighMm });
  const skinfold = siriPercent(density);
  const bmiEstimate = deurenbergMale({ bmi, age });

  const chosen = method === "navy" ? navy : method === "skinfold" ? skinfold : bmiEstimate;

  if (chosen === null || !Number.isFinite(chosen)) {
    return { error: "Those measurements do not produce a usable estimate — re-check them." };
  }
  if (chosen < MIN_PLAUSIBLE_PERCENT || chosen > MAX_PLAUSIBLE_PERCENT) {
    return {
      error: `That works out to ${chosen.toFixed(1)}% body fat, outside the plausible ${MIN_PLAUSIBLE_PERCENT}-${MAX_PLAUSIBLE_PERCENT}% range — re-check the measurements.`,
    };
  }

  const band = classifyMale(chosen);
  const fatMassKg = (chosen / 100) * weightKg;
  const leanMassKg = weightKg - fatMassKg;

  const alternates = [
    { key: "navy", label: "US Navy tape", percent: navy },
    { key: "skinfold", label: "Jackson-Pollock 3-site", percent: skinfold },
    { key: "bmi", label: "Deurenberg BMI", percent: bmiEstimate },
  ].map((entry) => ({
    ...entry,
    available:
      entry.percent !== null &&
      Number.isFinite(entry.percent) &&
      entry.percent >= MIN_PLAUSIBLE_PERCENT &&
      entry.percent <= MAX_PLAUSIBLE_PERCENT,
    selected: entry.key === method,
  }));

  return {
    method,
    percent: chosen,
    bandLabel: band.label,
    bandNote: band.note,
    fatMassKg,
    leanMassKg,
    bmi,
    bodyDensity: density,
    skinfoldSum,
    alternates,
  };
}
