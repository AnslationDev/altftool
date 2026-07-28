/**
 * STOP-BANG questionnaire for obstructive sleep apnoea (OSA) risk
 *
 * Eight yes/no items worth one point each, from Chung et al.,
 * "STOP questionnaire: a tool to screen patients for obstructive sleep apnea",
 * Anesthesiology 2008;108:812-821, and the STOP-BANG extension.
 *
 *   S — Snoring loudly
 *   T — Tired during the day
 *   O — Observed to stop breathing, choke or gasp in sleep
 *   P — Pressure: treated or diagnosed high blood pressure
 *   B — BMI over 35 kg/m2
 *   A — Age over 50 years
 *   N — Neck circumference over 40 cm
 *   G — Gender: male
 *
 * Informational only. STOP-BANG is a screening questionnaire; obstructive sleep
 * apnoea can only be diagnosed with a sleep study arranged by a clinician.
 */

export const STOPBANG_MAX = 8;

/** Cut-offs used by the B, A and N items, from the original publication. */
export const BMI_THRESHOLD = 35; // kg/m2
export const AGE_THRESHOLD = 50; // years
export const NECK_THRESHOLD_CM = 40; // centimetres, about 16 inches

/** The first four items form the "STOP" subscore used by the refined criteria. */
export const STOP_ITEM_KEYS = ["snoring", "tired", "observed", "pressure"];

export const ITEM_META = {
  snoring: {
    letter: "S",
    question: "Do you snore loudly?",
    help: "Loud enough to be heard through a closed door, or loud enough to disturb a partner.",
  },
  tired: {
    letter: "T",
    question: "Do you often feel tired, fatigued or sleepy during the day?",
    help: "Includes nodding off while reading, watching television or driving.",
  },
  observed: {
    letter: "O",
    question: "Has anyone observed you stop breathing, choke or gasp during sleep?",
    help: "Usually reported by a bed partner rather than noticed by you.",
  },
  pressure: {
    letter: "P",
    question: "Do you have high blood pressure, or are you being treated for it?",
    help: "Counts if you take blood pressure medication even when readings are now normal.",
  },
  bmi: { letter: "B", question: `Is your BMI over ${BMI_THRESHOLD} kg/m²?`, help: "Worked out from the height and weight you enter." },
  age: { letter: "A", question: `Are you over ${AGE_THRESHOLD} years old?`, help: "Strictly over 50; exactly 50 does not score." },
  neck: {
    letter: "N",
    question: `Is your neck circumference over ${NECK_THRESHOLD_CM} cm?`,
    help: "Measure around the neck at the level of the Adam's apple, roughly at collar height.",
  },
  gender: { letter: "G", question: "Are you male?", help: "Male sex is an independent risk factor in the questionnaire." },
};

/** Overall risk bands for moderate-to-severe OSA. */
export const RISK_BANDS = [
  { min: 0, max: 2, label: "Low risk", note: "Moderate-to-severe obstructive sleep apnoea is unlikely on this screen." },
  { min: 3, max: 4, label: "Intermediate risk", note: "Worth discussing with a doctor, especially if snoring or witnessed pauses are present." },
  { min: 5, max: STOPBANG_MAX, label: "High risk", note: "A sleep study is commonly recommended at this level." },
];

export function bandForScore(score) {
  return RISK_BANDS.find((b) => score >= b.min && score <= b.max) || null;
}

/** Body mass index in kg/m2, or null when the inputs cannot give a real value. */
export function calcBmi({ weightKg, heightCm }) {
  const w = Number(weightKg);
  const h = Number(heightCm);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  const metres = h / 100;
  return w / (metres * metres);
}

/**
 * Score a STOP-BANG questionnaire.
 *
 * @param {object} input
 * @param {boolean} input.snoring
 * @param {boolean} input.tired
 * @param {boolean} input.observed
 * @param {boolean} input.pressure
 * @param {number}  input.weightKg  Weight in kilograms, used for the B item.
 * @param {number}  input.heightCm  Height in centimetres, used for the B item.
 * @param {number}  input.age       Age in years, used for the A item.
 * @param {number}  input.neckCm    Neck circumference in centimetres, used for the N item.
 * @param {"male"|"female"} input.sex Used for the G item.
 * @returns {object} Result object, or { error } when the input is not scoreable.
 */
export function computeStopBang({
  snoring = false,
  tired = false,
  observed = false,
  pressure = false,
  weightKg,
  heightCm,
  age,
  neckCm,
  sex = "male",
} = {}) {
  const a = Number(age);
  const neck = Number(neckCm);

  if (!Number.isFinite(a) || a < 18 || a > 120) {
    return { error: "Enter an age between 18 and 120 years. STOP-BANG was validated in adults." };
  }
  if (!Number.isFinite(neck) || neck < 20 || neck > 80) {
    return { error: "Enter a neck circumference between 20 and 80 cm." };
  }
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female — sex is one of the eight STOP-BANG items." };
  }

  const bmi = calcBmi({ weightKg, heightCm });
  if (bmi === null || !Number.isFinite(bmi) || bmi < 8 || bmi > 100) {
    return { error: "Enter a realistic height and weight so BMI can be worked out." };
  }

  // Round BMI to 2 decimals before comparing: a squared float can push an exact
  // 35.0 a hair over the cut-off and add a point that is not really there.
  const bmiRounded = Math.round(bmi * 100) / 100;

  const answers = {
    snoring: Boolean(snoring),
    tired: Boolean(tired),
    observed: Boolean(observed),
    pressure: Boolean(pressure),
    bmi: bmiRounded > BMI_THRESHOLD,
    age: a > AGE_THRESHOLD,
    neck: neck > NECK_THRESHOLD_CM,
    gender: sex === "male",
  };

  const breakdown = Object.keys(ITEM_META).map((key) => ({
    key,
    letter: ITEM_META[key].letter,
    question: ITEM_META[key].question,
    yes: answers[key],
    points: answers[key] ? 1 : 0,
  }));

  const score = breakdown.reduce((sum, row) => sum + row.points, 0);
  const stopScore = STOP_ITEM_KEYS.reduce((sum, key) => sum + (answers[key] ? 1 : 0), 0);
  const band = bandForScore(score);

  /**
   * Refined high-risk criteria (Chung et al., Br J Anaesth 2012): a STOP subscore
   * of 2 or more combined with male sex, BMI over 35, or neck over 40 cm improves
   * specificity for moderate-to-severe OSA compared with the plain total.
   */
  const refinedTriggers = [];
  if (stopScore >= 2) {
    if (answers.gender) refinedTriggers.push("male sex");
    if (answers.bmi) refinedTriggers.push(`BMI over ${BMI_THRESHOLD}`);
    if (answers.neck) refinedTriggers.push(`neck over ${NECK_THRESHOLD_CM} cm`);
  }

  return {
    score,
    max: STOPBANG_MAX,
    stopScore,
    bmi: bmiRounded,
    neckCm: neck,
    age: a,
    answers,
    breakdown,
    band: band ? band.label : "Low risk",
    bandNote: band ? band.note : "",
    refinedHighRisk: refinedTriggers.length > 0,
    refinedTriggers,
  };
}
