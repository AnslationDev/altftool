/**
 * FINDRISC — Finnish Diabetes Risk Score
 *
 * Eight-item questionnaire published by Lindström & Tuomilehto,
 * "The Diabetes Risk Score", Diabetes Care 2003;26(3):725-731, and used by the
 * Finnish Diabetes Association and many European public-health programmes to
 * estimate the 10-year risk of developing type 2 diabetes. Total range 0-26.
 *
 * Informational only. A FINDRISC score is a screening prompt, not a diagnosis;
 * only a blood glucose or HbA1c test ordered by a clinician can diagnose diabetes.
 */

/** Maximum attainable total: 4 + 3 + 4 + 2 + 1 + 2 + 5 + 5. */
export const FINDRISC_MAX = 26;

/** Item 1 — age in years. */
export const AGE_POINTS = [
  { max: 44, points: 0, label: "Under 45" },
  { max: 54, points: 2, label: "45-54" },
  { max: 64, points: 3, label: "55-64" },
  { max: Infinity, points: 4, label: "Over 64" },
];

/** Item 2 — body mass index, kg/m2. */
export const BMI_POINTS = [
  { max: 25, points: 0, label: "Under 25", exclusive: true },
  { max: 30, points: 1, label: "25 to 30" },
  { max: Infinity, points: 3, label: "Over 30" },
];

/** Item 3 — waist circumference measured at navel level, sex-specific cut-offs. */
export const WAIST_POINTS = {
  male: [
    { max: 94, points: 0, label: "Under 94 cm", exclusive: true },
    { max: 102, points: 3, label: "94 to 102 cm" },
    { max: Infinity, points: 4, label: "Over 102 cm" },
  ],
  female: [
    { max: 80, points: 0, label: "Under 80 cm", exclusive: true },
    { max: 88, points: 3, label: "80 to 88 cm" },
    { max: Infinity, points: 4, label: "Over 88 cm" },
  ],
};

/** Item 4 — at least 30 minutes of physical activity daily, work and leisure combined. */
export const ACTIVITY_OPTIONS = [
  { value: "yes", points: 0, label: "Yes, at least 30 minutes most days" },
  { value: "no", points: 2, label: "No, less than that" },
];

/** Item 5 — how often vegetables, fruit or berries are eaten. */
export const DIET_OPTIONS = [
  { value: "daily", points: 0, label: "Every day" },
  { value: "not-daily", points: 1, label: "Not every day" },
];

/** Item 6 — regular blood pressure medication, ever. */
export const BP_MED_OPTIONS = [
  { value: "no", points: 0, label: "No" },
  { value: "yes", points: 2, label: "Yes" },
];

/** Item 7 — ever found to have high blood glucose (screening, illness or pregnancy). */
export const HIGH_GLUCOSE_OPTIONS = [
  { value: "no", points: 0, label: "No" },
  { value: "yes", points: 5, label: "Yes" },
];

/** Item 8 — family history of diagnosed diabetes (type 1 or type 2). */
export const FAMILY_OPTIONS = [
  { value: "none", points: 0, label: "No" },
  { value: "second-degree", points: 3, label: "Yes: grandparent, aunt, uncle or first cousin" },
  { value: "first-degree", points: 5, label: "Yes: parent, sibling or own child" },
];

/**
 * Risk bands from the original FINDRISC publication. The percentages are the
 * approximate 10-year probability of developing type 2 diabetes reported for
 * each band in the Finnish cohort.
 */
export const RISK_BANDS = [
  { min: 0, max: 6, label: "Low", risk: "about 1 in 100", percent: 1 },
  { min: 7, max: 11, label: "Slightly elevated", risk: "about 1 in 25", percent: 4 },
  { min: 12, max: 14, label: "Moderate", risk: "about 1 in 6", percent: 17 },
  { min: 15, max: 20, label: "High", risk: "about 1 in 3", percent: 33 },
  { min: 21, max: FINDRISC_MAX, label: "Very high", risk: "about 1 in 2", percent: 50 },
];

export function bandForScore(score) {
  return RISK_BANDS.find((b) => score >= b.min && score <= b.max) || null;
}

/** Body mass index in kg/m2. Returns null when the inputs cannot give a real value. */
export function calcBmi({ weightKg, heightCm }) {
  const w = Number(weightKg);
  const h = Number(heightCm);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  const metres = h / 100;
  return w / (metres * metres);
}

function pointsFromTable(value, table) {
  for (const row of table) {
    if (row.exclusive ? value < row.max : value <= row.max) return row;
  }
  return table[table.length - 1];
}

function pointsFromOptions(value, options) {
  return options.find((o) => o.value === value) || null;
}

/**
 * Compute the FINDRISC total, the per-item breakdown and the risk band.
 *
 * @param {object} input
 * @param {number} input.age                Age in years.
 * @param {number} input.weightKg           Body weight in kilograms.
 * @param {number} input.heightCm           Height in centimetres.
 * @param {number} input.waistCm            Waist circumference at navel level, centimetres.
 * @param {"male"|"female"} input.sex       Sex used for the waist cut-offs.
 * @param {"yes"|"no"} input.activity       At least 30 minutes of daily physical activity.
 * @param {"daily"|"not-daily"} input.diet  Vegetable, fruit or berry intake.
 * @param {"yes"|"no"} input.bpMedication   Ever taken regular blood pressure medication.
 * @param {"yes"|"no"} input.highGlucose    Ever found to have high blood glucose.
 * @param {"none"|"second-degree"|"first-degree"} input.familyHistory
 * @returns {object} Result object, or { error } when the input is not scoreable.
 */
export function computeFindrisc({
  age,
  weightKg,
  heightCm,
  waistCm,
  sex = "male",
  activity = "yes",
  diet = "daily",
  bpMedication = "no",
  highGlucose = "no",
  familyHistory = "none",
} = {}) {
  const a = Number(age);
  const w = Number(weightKg);
  const h = Number(heightCm);
  const waist = Number(waistCm);

  if (!Number.isFinite(a) || a < 18 || a > 120) {
    return { error: "Enter an age between 18 and 120 years. FINDRISC was validated in adults." };
  }
  if (!Number.isFinite(w) || w < 20 || w > 400) {
    return { error: "Enter a weight between 20 and 400 kg." };
  }
  if (!Number.isFinite(h) || h < 100 || h > 250) {
    return { error: "Enter a height between 100 and 250 cm." };
  }
  if (!Number.isFinite(waist) || waist < 40 || waist > 250) {
    return { error: "Enter a waist measurement between 40 and 250 cm, taken at navel level." };
  }
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female — the waist cut-offs in FINDRISC differ by sex." };
  }

  const activityRow = pointsFromOptions(activity, ACTIVITY_OPTIONS);
  const dietRow = pointsFromOptions(diet, DIET_OPTIONS);
  const bpRow = pointsFromOptions(bpMedication, BP_MED_OPTIONS);
  const glucoseRow = pointsFromOptions(highGlucose, HIGH_GLUCOSE_OPTIONS);
  const familyRow = pointsFromOptions(familyHistory, FAMILY_OPTIONS);

  if (!activityRow || !dietRow || !bpRow || !glucoseRow || !familyRow) {
    return { error: "Answer every question before the score can be calculated." };
  }

  const bmi = calcBmi({ weightKg: w, heightCm: h });
  if (bmi === null || !Number.isFinite(bmi)) {
    return { error: "Height and weight must both be greater than zero to work out BMI." };
  }

  const ageRow = pointsFromTable(a, AGE_POINTS);
  // Band on BMI rounded to 2 decimals: dividing by a squared float makes an exact
  // 25.0 or 30.0 land a hair above the cut-off and jump a band unfairly.
  const bmiRow = pointsFromTable(Math.round(bmi * 100) / 100, BMI_POINTS);
  const waistRow = pointsFromTable(waist, WAIST_POINTS[sex]);

  const breakdown = [
    { key: "age", question: "Age", answer: ageRow.label, points: ageRow.points, max: 4 },
    { key: "bmi", question: "Body mass index", answer: `${bmi.toFixed(1)} — ${bmiRow.label}`, points: bmiRow.points, max: 3 },
    { key: "waist", question: "Waist circumference", answer: `${waist} cm — ${waistRow.label}`, points: waistRow.points, max: 4 },
    { key: "activity", question: "Daily physical activity", answer: activityRow.label, points: activityRow.points, max: 2 },
    { key: "diet", question: "Vegetables, fruit or berries", answer: dietRow.label, points: dietRow.points, max: 1 },
    { key: "bp", question: "Blood pressure medication", answer: bpRow.label, points: bpRow.points, max: 2 },
    { key: "glucose", question: "Ever had high blood glucose", answer: glucoseRow.label, points: glucoseRow.points, max: 5 },
    { key: "family", question: "Family history of diabetes", answer: familyRow.label, points: familyRow.points, max: 5 },
  ];

  const score = breakdown.reduce((sum, row) => sum + row.points, 0);
  const band = bandForScore(score);

  return {
    score,
    max: FINDRISC_MAX,
    bmi,
    breakdown,
    band: band ? band.label : "Low",
    risk: band ? band.risk : "about 1 in 100",
    percent: band ? band.percent : 1,
    topContributor: breakdown.reduce((a2, b) => (b.points > a2.points ? b : a2), breakdown[0]),
  };
}
