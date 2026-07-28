/**
 * Senior hydration target calculator.
 *
 * Baseline: 30 mL of fluid per kilogram of body weight per day, with an absolute
 * floor of 1,500 mL/day. This is the weight-based estimate used in geriatric
 * nutrition practice and reflected in ESPEN guidance on clinical nutrition and
 * hydration in geriatrics, which stresses that intake below about 1.5 L/day is
 * rarely enough for an older adult.
 *
 * Cross-check: EFSA adequate intakes for total water are 2.5 L/day for men and
 * 2.0 L/day for women, of which roughly 20-30% comes from food, leaving about
 * 2.0 L and 1.6 L from drinks.
 *
 * Older adults dehydrate more easily because the thirst signal blunts with age,
 * total body water falls, and the kidney concentrates urine less well. Several
 * common medicines change fluid balance, so this tool flags them rather than
 * silently adding millilitres.
 */

/** Baseline fluid per kilogram of body weight, in millilitres per day. */
export const ML_PER_KG = 30;

/** Absolute daily minimum for an older adult, in millilitres. */
export const MIN_DAILY_ML = 1500;

/** Above this, a target is unusual enough to be worth checking with a clinician. */
export const HIGH_TARGET_ML = 3000;

/** EFSA adequate intake of water from drinks, in millilitres per day. */
export const EFSA_DRINKS_ML = { male: 2000, female: 1600 };

/** Extra fluid per 1 °C of fever above 37 °C, as a fraction of the baseline. */
export const FEVER_UPLIFT_PER_DEGREE = 0.12;

/** Extra fluid for a hot day or a heatwave, in millilitres. */
export const HOT_WEATHER_ML = 500;

/** Extra fluid per hour of sustained physical activity, in millilitres. */
export const ACTIVITY_ML_PER_HOUR = 500;

/** Common serving sizes for turning a target into something countable. */
export const SERVINGS = [
  { key: "glass", label: "Indian glass (200 mL)", ml: 200 },
  { key: "cup", label: "Cup / mug (240 mL)", ml: 240 },
  { key: "bottle", label: "Water bottle (750 mL)", ml: 750 },
];

/**
 * Medicines and conditions that change fluid balance. These are prompts to
 * discuss with a prescriber, never instructions to change a dose or a target.
 */
export const MEDICATION_FLAGS = [
  {
    key: "diuretic",
    label: "Diuretic (water tablet) such as furosemide or hydrochlorothiazide",
    note: "Increases urine output and salt loss. Do not simply drink more to compensate — the fluid target belongs to the prescriber, who is balancing it against heart or kidney disease.",
  },
  {
    key: "sglt2",
    label: "SGLT2 inhibitor for diabetes (empagliflozin, dapagliflozin)",
    note: "Increases glucose and water loss in the urine, so dehydration risk rises, especially during illness. Ask about sick-day rules.",
  },
  {
    key: "lithium",
    label: "Lithium",
    note: "Dehydration raises blood lithium levels and toxicity risk. Steady daily fluid and salt intake matters, and levels need monitoring.",
  },
  {
    key: "laxative",
    label: "Regular laxatives",
    note: "Increase fluid loss through the gut. Fibre-based laxatives in particular need extra fluid to work rather than to worsen constipation.",
  },
  {
    key: "anticholinergic",
    label: "Anticholinergic medicines (some bladder, allergy and antidepressant drugs)",
    note: "Reduce sweating and cause dry mouth, which masks thirst cues and raises heat risk in summer.",
  },
  {
    key: "restriction",
    label: "A fluid restriction set by a doctor (heart failure, kidney disease, hyponatraemia)",
    note: "A prescribed restriction always overrides any calculated target. Enter it below so the tool uses that figure instead.",
  },
];

/** Practical signs that intake is falling short. */
export const DEHYDRATION_SIGNS = [
  "Dark yellow or strong-smelling urine, or passing urine less than four times a day",
  "Dry mouth, cracked lips or a furred tongue",
  "New confusion, drowsiness or a sudden change in alertness",
  "Dizziness or light-headedness on standing",
  "Headache, constipation or unexplained fatigue",
  "Loss of skin elasticity and sunken eyes (a late sign in older adults)",
];

const MIN_WEIGHT_KG = 25;
const MAX_WEIGHT_KG = 250;

function round(value) {
  return Math.round(value);
}

/**
 * @param {object} input
 * @param {number} input.weightKg
 * @param {"male"|"female"} input.sex
 * @param {number} [input.temperatureC] current body temperature in Celsius
 * @param {boolean} [input.hotWeather]
 * @param {number} [input.activityMinutes] minutes of sustained activity today
 * @param {number|null} [input.restrictionMl] doctor-set daily fluid restriction
 * @param {string[]} [input.medications] keys from MEDICATION_FLAGS
 * @param {number} [input.intakeSoFarMl] fluid already drunk today
 * @returns {object} target breakdown, or { error }
 */
export function computeSeniorHydration({
  weightKg,
  sex,
  temperatureC = 37,
  hotWeather = false,
  activityMinutes = 0,
  restrictionMl = null,
  medications = [],
  intakeSoFarMl = 0,
} = {}) {
  if (sex !== "male" && sex !== "female") return { error: "Choose male or female for the EFSA comparison figure." };

  const weight = Number(weightKg);
  if (!Number.isFinite(weight)) return { error: "Enter a body weight in kilograms." };
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Enter a weight between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.` };
  }

  const temp = Number(temperatureC);
  if (!Number.isFinite(temp)) return { error: "Enter a body temperature, or leave it at 37 °C." };
  if (temp < 30 || temp > 45) return { error: "Body temperature must be between 30 °C and 45 °C." };

  const minutes = Number(activityMinutes);
  if (!Number.isFinite(minutes) || minutes < 0) return { error: "Activity minutes must be zero or more." };
  if (minutes > 600) return { error: "Enter up to 600 minutes of activity." };

  const intake = Number(intakeSoFarMl);
  if (!Number.isFinite(intake) || intake < 0) return { error: "Fluid taken so far must be zero or more." };
  if (intake > 10000) return { error: "Enter a realistic amount of fluid taken so far." };

  const rawBaseline = weight * ML_PER_KG;
  const baseline = Math.max(rawBaseline, MIN_DAILY_ML);
  const floorApplied = baseline > rawBaseline;

  const degreesOverNormal = Math.max(0, temp - 37);
  const feverMl = baseline * FEVER_UPLIFT_PER_DEGREE * degreesOverNormal;
  const heatMl = hotWeather ? HOT_WEATHER_ML : 0;
  const activityMl = (minutes / 60) * ACTIVITY_ML_PER_HOUR;

  const adjustedTarget = baseline + feverMl + heatMl + activityMl;

  let restriction = null;
  if (restrictionMl !== null && restrictionMl !== undefined && restrictionMl !== "") {
    restriction = Number(restrictionMl);
    if (!Number.isFinite(restriction)) return { error: "Enter the prescribed fluid restriction as a number of millilitres." };
    if (restriction <= 0) return { error: "A fluid restriction must be greater than zero." };
    if (restriction > 5000) return { error: "Enter a fluid restriction below 5,000 mL." };
  }

  const finalTarget = restriction !== null ? restriction : adjustedTarget;
  const remaining = Math.max(0, finalTarget - intake);
  const percentDone = finalTarget > 0 ? Math.min(999, (intake / finalTarget) * 100) : 0;

  const selected = MEDICATION_FLAGS.filter((row) => medications.includes(row.key));

  const servings = SERVINGS.map((row) => ({
    ...row,
    perDay: Math.ceil(finalTarget / row.ml),
    remaining: remaining > 0 ? Math.ceil(remaining / row.ml) : 0,
  }));

  const notes = [];
  if (restriction !== null) {
    notes.push(
      `A prescribed restriction of ${round(restriction)} mL a day is being used instead of the calculated ${round(adjustedTarget)} mL. Never exceed a restriction set by your doctor.`,
    );
  }
  if (floorApplied) {
    notes.push(
      `${ML_PER_KG} mL/kg gives only ${round(rawBaseline)} mL at this weight, so the ${MIN_DAILY_ML} mL daily minimum for older adults has been used instead.`,
    );
  }
  if (restriction === null && finalTarget > HIGH_TARGET_ML) {
    notes.push(
      `A target above ${HIGH_TARGET_ML} mL a day is high. Check it with a clinician, particularly if there is heart or kidney disease, because too much plain water can drop blood sodium.`,
    );
  }
  if (intake > finalTarget && restriction !== null) {
    notes.push("Intake so far already exceeds the prescribed restriction — contact the care team.");
  }

  return {
    weightKg: weight,
    sex,
    rawBaselineMl: round(rawBaseline),
    baselineMl: round(baseline),
    floorApplied,
    feverMl: round(feverMl),
    heatMl,
    activityMl: round(activityMl),
    adjustedTargetMl: round(adjustedTarget),
    restrictionMl: restriction === null ? null : round(restriction),
    targetMl: round(finalTarget),
    intakeMl: round(intake),
    remainingMl: round(remaining),
    percentDone: Math.round(percentDone),
    efsaDrinksMl: EFSA_DRINKS_ML[sex],
    degreesOverNormal: Math.round(degreesOverNormal * 10) / 10,
    servings,
    medicationNotes: selected,
    notes,
  };
}
