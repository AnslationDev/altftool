/**
 * Sweat rate by the weigh-in / weigh-out method.
 *
 * Sources for the constants below:
 *  - ACSM Position Stand "Exercise and Fluid Replacement" (Med Sci Sports Exerc, 2007)
 *  - NATA Position Statement "Fluid Replacement for the Physically Active" (J Athl Train, 2017)
 *
 * Core formula (NATA):
 *   sweat loss (L) = (pre-exercise mass kg - post-exercise mass kg)
 *                    + fluid consumed during exercise (L)
 *                    - urine passed during exercise (L)
 *   sweat rate (L/h) = sweat loss / exercise duration in hours
 *
 * The method assumes 1 kg of body-mass change equals 1 L of body water, which is the
 * standard field assumption because the density of sweat is ~1.0 kg/L.
 */

/** 1 litre of sweat is treated as 1 kg of body mass. NATA field assumption. */
export const KG_PER_LITRE_SWEAT = 1;

/**
 * ACSM recommends drinking roughly 1.5 L for every 1 kg of body mass lost
 * (150 % of the deficit) when the next session is less than ~12 h away,
 * because some of the drink is passed as urine rather than retained.
 */
export const REHYDRATION_FACTOR_ML_PER_KG = 1500;

/** Minimum sensible replacement: 1.25 L per kg lost (lower end of the ACSM 125-150 % range). */
export const REHYDRATION_MIN_ML_PER_KG = 1250;

/** Molar mass of sodium: 22.99 g/mol, so 1 mmol of Na+ = 23 mg. */
export const MG_SODIUM_PER_MMOL = 23;

/** Typical sweat sodium concentration is 20-80 mmol/L; 50 mmol/L is the usual mid-point. */
export const DEFAULT_SWEAT_SODIUM_MMOL_PER_L = 50;
export const SWEAT_SODIUM_MIN_MMOL_PER_L = 10;
export const SWEAT_SODIUM_MAX_MMOL_PER_L = 100;

/**
 * Dehydration bands as a percentage of starting body mass.
 * ACSM: losses beyond 2 % of body mass begin to impair endurance performance
 * and thermoregulation, especially in the heat.
 */
export const DEHYDRATION_BANDS = [
  { max: 1, label: "Well hydrated", note: "Under 1 % body-mass loss — replacement kept up with sweating." },
  { max: 2, label: "Mild fluid deficit", note: "1-2 % loss. Acceptable, but top up before the next session." },
  { max: 3, label: "Moderate fluid deficit", note: "2-3 % loss. Endurance, pacing and heat tolerance start to suffer." },
  { max: Infinity, label: "Large fluid deficit", note: "Over 3 % loss. Drink more during exercise and rehydrate deliberately." },
];

/** Plausibility guards so obvious typos do not produce a confident-looking wrong answer. */
export const MIN_BODY_MASS_KG = 20;
export const MAX_BODY_MASS_KG = 250;
export const MAX_DURATION_MIN = 720; // 12 hours
export const MAX_PLAUSIBLE_SWEAT_RATE_L_PER_H = 4; // elite athletes in heat peak near 3-3.5 L/h

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function classifyDehydration(bodyMassLossPct) {
  const pct = isNum(bodyMassLossPct) ? Math.max(0, bodyMassLossPct) : 0;
  return DEHYDRATION_BANDS.find((band) => pct < band.max) || DEHYDRATION_BANDS[DEHYDRATION_BANDS.length - 1];
}

/**
 * @param {object} input
 * @param {number} input.preKg           body mass before exercise, kg
 * @param {number} input.postKg          body mass after exercise, towel-dried, kg
 * @param {number} input.fluidMl         fluid drunk during the session, ml
 * @param {number} input.urineMl         urine passed during the session, ml
 * @param {number} input.durationMin     exercise duration, minutes
 * @param {number} [input.sweatSodiumMmolPerL] sweat sodium concentration, mmol/L
 */
export function computeSweatRate({
  preKg,
  postKg,
  fluidMl,
  urineMl,
  durationMin,
  sweatSodiumMmolPerL = DEFAULT_SWEAT_SODIUM_MMOL_PER_L,
}) {
  const values = { preKg, postKg, fluidMl, urineMl, durationMin, sweatSodiumMmolPerL };
  for (const key of Object.keys(values)) {
    if (!isNum(values[key])) return { error: "Enter a valid number in every field." };
  }

  if (preKg < MIN_BODY_MASS_KG || preKg > MAX_BODY_MASS_KG) {
    return { error: `Starting weight should be between ${MIN_BODY_MASS_KG} and ${MAX_BODY_MASS_KG} kg.` };
  }
  if (postKg < MIN_BODY_MASS_KG || postKg > MAX_BODY_MASS_KG) {
    return { error: `Finishing weight should be between ${MIN_BODY_MASS_KG} and ${MAX_BODY_MASS_KG} kg.` };
  }
  if (fluidMl < 0 || urineMl < 0) {
    return { error: "Fluid and urine volumes cannot be negative." };
  }
  if (durationMin <= 0) {
    return { error: "Exercise duration must be greater than zero minutes." };
  }
  if (durationMin > MAX_DURATION_MIN) {
    return { error: `Use a session of ${MAX_DURATION_MIN / 60} hours or less for a reliable sweat rate.` };
  }
  if (
    sweatSodiumMmolPerL < SWEAT_SODIUM_MIN_MMOL_PER_L ||
    sweatSodiumMmolPerL > SWEAT_SODIUM_MAX_MMOL_PER_L
  ) {
    return {
      error: `Sweat sodium is normally ${SWEAT_SODIUM_MIN_MMOL_PER_L}-${SWEAT_SODIUM_MAX_MMOL_PER_L} mmol/L.`,
    };
  }

  const hours = durationMin / 60;
  const massChangeKg = preKg - postKg; // positive when weight was lost
  const fluidL = fluidMl / 1000;
  const urineL = urineMl / 1000;

  const sweatLossL = massChangeKg * KG_PER_LITRE_SWEAT + fluidL - urineL;

  if (!(sweatLossL > 0)) {
    return {
      error:
        "These figures show no net sweat loss. Check the two weights, and make sure the drink volume is what you actually finished.",
    };
  }

  const sweatRateLPerH = sweatLossL / hours;
  if (sweatRateLPerH > MAX_PLAUSIBLE_SWEAT_RATE_L_PER_H) {
    return {
      error: `That works out to over ${MAX_PLAUSIBLE_SWEAT_RATE_L_PER_H} L per hour, which is higher than almost any recorded sweat rate. Re-check the weights and the duration.`,
    };
  }

  const bodyMassLossPct = (massChangeKg / preKg) * 100;
  const netDeficitKg = Math.max(0, massChangeKg);

  const replacedPct = sweatLossL > 0 ? (fluidL / sweatLossL) * 100 : 0;
  const sodiumLossMg = sweatLossL * sweatSodiumMmolPerL * MG_SODIUM_PER_MMOL;

  return {
    sweatLossL,
    sweatRateLPerH,
    sweatRateMlPerH: sweatRateLPerH * 1000,
    hours,
    massChangeKg,
    bodyMassLossPct,
    replacedPct,
    drinkTargetMlPerHour: sweatRateLPerH * 1000,
    drinkTargetMlPer15Min: (sweatRateLPerH * 1000) / 4,
    rehydrationMinMl: netDeficitKg * REHYDRATION_MIN_ML_PER_KG,
    rehydrationMaxMl: netDeficitKg * REHYDRATION_FACTOR_ML_PER_KG,
    sodiumLossMg,
    sodiumLossPerHourMg: sodiumLossMg / hours,
    band: classifyDehydration(bodyMassLossPct),
  };
}
