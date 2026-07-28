/**
 * Prediabetes / type 2 diabetes risk scoring.
 *
 * Two published, non-invasive questionnaires are computed from one set of
 * answers. Neither diagnoses anything — both are screening prompts.
 *
 * 1. ADA / CDC Prediabetes Risk Test (the 7-question test on doihaveprediabetes.org).
 *    Items and weights: age band (0-3), sex male (1), gestational diabetes (1),
 *    parent or sibling with diabetes (1), ever told you have high blood
 *    pressure (1), not physically active (1), weight band (0-3).
 *    Maximum 11. A total of 5 or more is reported as "likely to have
 *    prediabetes / high risk for type 2 diabetes".
 *    The printed weight chart is height-by-weight; its cut lines follow the
 *    BMI boundaries 25, 30 and 40 kg/m^2, which is what is used here.
 *
 * 2. Indian Diabetes Risk Score (IDRS), Madras Diabetes Research Foundation
 *    (Mohan V et al., JAPI 2005). Four items — age, waist, physical activity
 *    and family history — scored out of 100. Published bands: below 30 low
 *    risk, 30-50 moderate risk, 60 and above high risk.
 */

/** ADA test: age in years -> points. */
export const ADA_AGE_BANDS = [
  { min: 0, max: 39, points: 0, label: "Under 40" },
  { min: 40, max: 49, points: 1, label: "40 to 49" },
  { min: 50, max: 59, points: 2, label: "50 to 59" },
  { min: 60, max: Infinity, points: 3, label: "60 or over" },
];

/** ADA weight chart approximated by its BMI cut lines (kg/m^2). */
export const ADA_BMI_BANDS = [
  { min: 0, max: 25, points: 0, label: "BMI under 25" },
  { min: 25, max: 30, points: 1, label: "BMI 25 to 29.9" },
  { min: 30, max: 40, points: 2, label: "BMI 30 to 39.9" },
  { min: 40, max: Infinity, points: 3, label: "BMI 40 or over" },
];

/** ADA total of 5 or more is the published high-risk threshold. */
export const ADA_HIGH_RISK_SCORE = 5;
export const ADA_MAX_SCORE = 11;

/** IDRS age bands (years). */
export const IDRS_AGE_BANDS = [
  { min: 0, max: 34, points: 0, label: "Under 35" },
  { min: 35, max: 49, points: 20, label: "35 to 49" },
  { min: 50, max: Infinity, points: 30, label: "50 or over" },
];

/** IDRS waist bands in centimetres, by sex. */
export const IDRS_WAIST_BANDS = {
  male: [
    { min: 0, max: 90, points: 0, label: "Under 90 cm" },
    { min: 90, max: 100, points: 10, label: "90 to 99 cm" },
    { min: 100, max: Infinity, points: 20, label: "100 cm or more" },
  ],
  female: [
    { min: 0, max: 80, points: 0, label: "Under 80 cm" },
    { min: 80, max: 90, points: 10, label: "80 to 89 cm" },
    { min: 90, max: Infinity, points: 20, label: "90 cm or more" },
  ],
};

/** Shared activity options; ADA treats vigorous/moderate as "physically active". */
export const ACTIVITY_LEVELS = [
  {
    id: "vigorous",
    label: "Vigorous exercise or strenuous manual work",
    idrsPoints: 0,
    adaActive: true,
  },
  {
    id: "moderate",
    label: "Moderate exercise at work or home",
    idrsPoints: 20,
    adaActive: true,
  },
  {
    id: "mild",
    label: "Mild exercise at work or home",
    idrsPoints: 20,
    adaActive: false,
  },
  {
    id: "sedentary",
    label: "No exercise and mostly sedentary",
    idrsPoints: 30,
    adaActive: false,
  },
];

/** Family history options. IDRS counts parents only; ADA counts any first-degree relative. */
export const FAMILY_HISTORY_OPTIONS = [
  { id: "none", label: "No parent or sibling with diabetes", idrsPoints: 0, adaPoints: 0 },
  { id: "sibling", label: "A brother or sister only", idrsPoints: 0, adaPoints: 1 },
  { id: "one-parent", label: "One parent", idrsPoints: 10, adaPoints: 1 },
  { id: "both-parents", label: "Both parents", idrsPoints: 20, adaPoints: 1 },
];

export const IDRS_MAX_SCORE = 100;

/** IDRS published risk bands. */
export const IDRS_BANDS = [
  { min: 0, max: 30, key: "low", label: "Low risk" },
  { min: 30, max: 60, key: "moderate", label: "Moderate risk" },
  { min: 60, max: Infinity, key: "high", label: "High risk" },
];

/**
 * ADA diagnostic ranges for prediabetes, quoted so the tool can point at a
 * real test rather than a vague "see a doctor".
 */
export const PREDIABETES_LAB_RANGES = [
  ["HbA1c", "5.7% to 6.4% (39 to 47 mmol/mol)"],
  ["Fasting plasma glucose", "100 to 125 mg/dL (5.6 to 6.9 mmol/L)"],
  ["2-hour value in a 75 g OGTT", "140 to 199 mg/dL (7.8 to 11.0 mmol/L)"],
];

/**
 * Diabetes Prevention Program (DPP, NEJM 2002): a lifestyle programme aiming
 * at 7% body-weight loss and 150 minutes a week of moderate activity cut
 * progression to type 2 diabetes by 58% over an average 2.8 years (71% in
 * participants aged 60 and over).
 */
export const DPP_WEIGHT_LOSS_FRACTION = 0.07;
export const DPP_WEEKLY_ACTIVITY_MINUTES = 150;

const bandFor = (bands, value) =>
  bands.find((band) => value >= band.min && value < band.max) || bands[bands.length - 1];

const round1 = (value) => Math.round(value * 10) / 10;

/** BMI in kg/m^2 from height in centimetres and weight in kilograms. */
export function computeBmi({ heightCm, weightKg }) {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) return null;
  const metres = h / 100;
  return w / (metres * metres);
}

/**
 * Score both questionnaires.
 *
 * @param {object} input
 * @param {number} input.age            years
 * @param {"male"|"female"} input.sex
 * @param {number} input.heightCm
 * @param {number} input.weightKg
 * @param {number} input.waistCm
 * @param {string} input.activity       an ACTIVITY_LEVELS id
 * @param {string} input.familyHistory  a FAMILY_HISTORY_OPTIONS id
 * @param {boolean} input.highBloodPressure
 * @param {boolean} input.gestationalDiabetes  only counted for sex "female"
 * @returns {object} scores and actions, or { error }
 */
export function assessPrediabetesRisk({
  age,
  sex = "female",
  heightCm,
  weightKg,
  waistCm,
  activity = "moderate",
  familyHistory = "none",
  highBloodPressure = false,
  gestationalDiabetes = false,
} = {}) {
  const a = Number(age);
  const h = Number(heightCm);
  const w = Number(weightKg);
  const waist = Number(waistCm);

  if (![a, h, w, waist].every((value) => Number.isFinite(value))) {
    return { error: "Enter a number for age, height, weight and waist." };
  }
  if (a < 18 || a > 120) {
    return { error: "This questionnaire is validated in adults — enter an age between 18 and 120." };
  }
  if (h < 100 || h > 250) return { error: "Enter a height between 100 and 250 cm." };
  if (w < 25 || w > 400) return { error: "Enter a weight between 25 and 400 kg." };
  if (waist < 40 || waist > 250) return { error: "Enter a waist measurement between 40 and 250 cm." };

  const normalisedSex = sex === "male" ? "male" : "female";
  const activityOption =
    ACTIVITY_LEVELS.find((option) => option.id === activity) || ACTIVITY_LEVELS[1];
  const familyOption =
    FAMILY_HISTORY_OPTIONS.find((option) => option.id === familyHistory) ||
    FAMILY_HISTORY_OPTIONS[0];

  const bmi = computeBmi({ heightCm: h, weightKg: w });
  if (bmi === null || !Number.isFinite(bmi)) {
    return { error: "Height and weight must both be greater than zero." };
  }

  // --- ADA / CDC risk test ---
  const adaAgeBand = bandFor(ADA_AGE_BANDS, a);
  const adaBmiBand = bandFor(ADA_BMI_BANDS, bmi);
  const adaParts = [
    { label: `Age (${adaAgeBand.label})`, points: adaAgeBand.points },
    { label: normalisedSex === "male" ? "Male" : "Female", points: normalisedSex === "male" ? 1 : 0 },
    {
      label: "Gestational diabetes in a past pregnancy",
      points: normalisedSex === "female" && gestationalDiabetes ? 1 : 0,
    },
    { label: "Parent or sibling with diabetes", points: familyOption.adaPoints },
    { label: "Ever told you have high blood pressure", points: highBloodPressure ? 1 : 0 },
    { label: "Not physically active", points: activityOption.adaActive ? 0 : 1 },
    { label: `Weight (${adaBmiBand.label})`, points: adaBmiBand.points },
  ];
  const adaScore = adaParts.reduce((sum, part) => sum + part.points, 0);
  const adaHighRisk = adaScore >= ADA_HIGH_RISK_SCORE;

  // --- Indian Diabetes Risk Score ---
  const idrsAgeBand = bandFor(IDRS_AGE_BANDS, a);
  const idrsWaistBand = bandFor(IDRS_WAIST_BANDS[normalisedSex], waist);
  const idrsParts = [
    { label: `Age (${idrsAgeBand.label})`, points: idrsAgeBand.points },
    { label: `Waist (${idrsWaistBand.label})`, points: idrsWaistBand.points },
    { label: `Physical activity — ${activityOption.label.toLowerCase()}`, points: activityOption.idrsPoints },
    { label: `Family history — ${familyOption.label.toLowerCase()}`, points: familyOption.idrsPoints },
  ];
  const idrsScore = idrsParts.reduce((sum, part) => sum + part.points, 0);
  const idrsBand = bandFor(IDRS_BANDS, idrsScore);

  // --- Actions ---
  const actions = [];
  if (bmi >= 25) {
    actions.push({
      title: `Target about ${round1(w * DPP_WEIGHT_LOSS_FRACTION)} kg of weight loss`,
      detail: `The Diabetes Prevention Program used a 7% body-weight goal — for ${round1(w)} kg that is roughly ${round1(w * DPP_WEIGHT_LOSS_FRACTION)} kg, taking you to about ${round1(w * (1 - DPP_WEIGHT_LOSS_FRACTION))} kg.`,
    });
  } else {
    actions.push({
      title: "Hold your current weight",
      detail: `A BMI of ${round1(bmi)} is already below the 25 kg/m² cut used in the risk test — the aim now is to avoid drifting upward.`,
    });
  }
  if (!activityOption.adaActive) {
    actions.push({
      title: `Build up to ${DPP_WEEKLY_ACTIVITY_MINUTES} minutes a week`,
      detail: "That is the DPP activity target — about 30 minutes of brisk walking on five days, and it is the single item on this test you can change fastest.",
    });
  } else {
    actions.push({
      title: `Keep the ${DPP_WEEKLY_ACTIVITY_MINUTES} minutes a week going`,
      detail: "You already score zero or low on the activity item; adding two resistance sessions a week improves insulin sensitivity further.",
    });
  }
  if (idrsWaistBand.points > 0) {
    const target = normalisedSex === "male" ? 90 : 80;
    actions.push({
      title: `Bring waist below ${target} cm`,
      detail: `Your waist is ${round1(waist)} cm. The IDRS and Indian consensus cut-offs are 90 cm for men and 80 cm for women; central fat matters more than total weight for insulin resistance.`,
    });
  }
  if (highBloodPressure) {
    actions.push({
      title: "Keep blood pressure under review",
      detail: "Raised blood pressure clusters with insulin resistance, so it is scored in the risk test — keep taking prescribed treatment and have it rechecked at agreed intervals.",
    });
  }
  if (adaHighRisk || idrsBand.key === "high") {
    actions.push({
      title: "Ask for a blood test",
      detail: "A score in the high band is a prompt to request an HbA1c or fasting glucose, not a diagnosis — only a blood test can confirm prediabetes.",
    });
  } else {
    actions.push({
      title: "Recheck this score each year",
      detail: "Risk rises with age even if nothing else changes, so rescore annually or after any significant weight change.",
    });
  }

  return {
    bmi: round1(bmi),
    adaScore,
    adaMaxScore: ADA_MAX_SCORE,
    adaHighRisk,
    adaThreshold: ADA_HIGH_RISK_SCORE,
    adaVerdict: adaHighRisk
      ? "5 or more — high risk for prediabetes"
      : "Below 5 — lower risk on this test",
    adaParts,
    idrsScore,
    idrsMaxScore: IDRS_MAX_SCORE,
    idrsBandKey: idrsBand.key,
    idrsBandLabel: idrsBand.label,
    idrsParts,
    waistBandLabel: idrsWaistBand.label,
    actions,
  };
}
