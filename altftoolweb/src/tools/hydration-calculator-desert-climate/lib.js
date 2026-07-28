/**
 * Desert-climate hydration maths.
 *
 * Model = baseline maintenance water + heat/activity sweat loss + extra respiratory
 * loss caused by very dry air, then the sodium and potassium carried out in that sweat.
 * All figures are informational estimates, not clinical prescriptions.
 */

/**
 * Baseline total water requirement for healthy adults, 35 mL per kg of body mass
 * per day (the standard adult maintenance figure used alongside the US National
 * Academies Adequate Intake of 3.7 L/day for men and 2.7 L/day for women).
 */
export const BASELINE_ML_PER_KG_PER_DAY = 35;

/** Never report a baseline below this; very low body masses still need a floor. */
export const BASELINE_FLOOR_L = 1.2;

/**
 * The US National Academies estimate roughly 20% of total water intake comes from
 * food, so only ~80% of the baseline has to be drunk.
 */
export const FOOD_WATER_SHARE = 0.2;

/**
 * Reference sweat rates in litres per hour at the 20 C reference temperature and
 * 40% relative humidity. Scaled by heat and humidity factors below. Chosen to land
 * inside the 0.5-2.0 L/h range ACSM reports for exercise in the heat once scaled.
 */
export const INTENSITY_SWEAT_LPH = {
  rest: 0.08,
  light: 0.22,
  moderate: 0.45,
  heavy: 0.8,
};

export const INTENSITY_LABELS = {
  rest: "Resting in shade",
  light: "Light (slow walking, sightseeing)",
  moderate: "Moderate (hiking, steady work)",
  heavy: "Heavy (running, load carrying, manual labour)",
};

/** Temperature at which the reference sweat rates above were defined. */
export const REFERENCE_TEMP_C = 20;

/**
 * Sweat production rises roughly geometrically with air temperature; 5% per degree
 * above the reference reproduces the observed near-doubling of sweat rate between
 * 20 C and 35 C.
 */
export const HEAT_FACTOR_PER_DEGREE = 0.05;

/** Cap the heat exponent so absurd temperatures cannot produce runaway numbers. */
export const MAX_HEAT_DEGREES = 30;

/** Relative humidity the reference sweat rates assume. */
export const REFERENCE_HUMIDITY_PCT = 40;

/**
 * In humid air sweat drips off instead of evaporating, so more sweat is produced for
 * the same cooling; in dry air evaporation is efficient and less sweat is needed.
 * 0.4% per percentage point of relative humidity, clamped to a sane band.
 */
export const HUMIDITY_FACTOR_PER_PCT = 0.004;
export const HUMIDITY_FACTOR_MIN = 0.85;
export const HUMIDITY_FACTOR_MAX = 1.3;

/**
 * Extra respiratory and trans-epidermal water loss in very dry air. Up to 0.12 L/h at
 * 10% relative humidity or below, falling linearly to zero at 50% relative humidity.
 * This is the loss desert travellers miss, because it never appears as visible sweat.
 */
export const DRY_AIR_RESP_LOSS_LPH = 0.12;
export const DRY_AIR_RH_FLOOR_PCT = 10;
export const DRY_AIR_RH_CEILING_PCT = 50;

/** Resting loss already covered by the daily baseline, subtracted to avoid double counting. */
export const BASELINE_LOSS_ALLOWANCE_LPH = 0.05;

/**
 * Heat acclimatisation raises sweat volume (sweating starts earlier and runs faster)
 * but aldosterone conserves salt, cutting sweat sodium concentration by roughly half.
 */
export const ACCLIMATISED_SWEAT_VOLUME_FACTOR = 1.1;

/**
 * Sweat sodium concentration in mg per litre. ACSM reports a 200-2000 mg/L range;
 * 50 mmol/L (1150 mg/L) is a typical unacclimatised value, ~25 mmol/L once acclimatised.
 */
export const SWEAT_SODIUM_MG_PER_L_UNACCLIMATISED = 1150;
export const SWEAT_SODIUM_MG_PER_L_ACCLIMATISED = 575;

/** "Salty sweater" phenotype (visible salt crust, gritty taste) runs markedly higher. */
export const SALTY_SWEATER_FACTOR = 1.6;

/** Sweat potassium is far more stable, around 5 mmol/L which is ~195 mg/L. */
export const SWEAT_POTASSIUM_MG_PER_L = 195;

/**
 * Drinking faster than the gut can absorb risks dilutional hyponatraemia. US Army
 * heat-illness guidance caps intake at 1.5 L in any hour and 12 L in any day.
 */
export const MAX_SAFE_INTAKE_LPH = 1.5;
export const MAX_SAFE_INTAKE_L_PER_DAY = 12;

/** ACSM pre-hydration: 5-7 mL per kg of body mass about four hours before exposure. */
export const PRE_HYDRATION_ML_PER_KG_LOW = 5;
export const PRE_HYDRATION_ML_PER_KG_HIGH = 7;

/**
 * ACSM treats a loss of more than 2% of body mass as performance-impairing dehydration.
 * One kilogram of body-mass loss is approximately one litre of fluid.
 */
export const DEHYDRATION_ALARM_BODY_MASS_FRACTION = 0.02;

/** Drink in small amounts rather than in one go; four servings an hour = every 15 minutes. */
export const SERVINGS_PER_HOUR = 4;

/**
 * Sodium loss beyond which water alone is unsafe. 3500 mg is roughly triple a normal
 * day's dietary sodium and about the point at which sweat replacement needs salt.
 */
export const HIGH_SODIUM_LOSS_MG = 3500;

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {number} input.weightKg          body mass in kilograms
 * @param {number} input.ambientTempC      average air temperature during exposure, Celsius
 * @param {number} input.humidityPct       average relative humidity during exposure, 0-100
 * @param {number} input.exposureHours     hours spent in the desert conditions
 * @param {string} input.intensity         key of INTENSITY_SWEAT_LPH
 * @param {boolean} [input.acclimatised]   two or more weeks of daily heat exposure
 * @param {boolean} [input.saltySweater]   visible salt residue on skin or clothing
 */
export function computeDesertHydration({
  weightKg,
  ambientTempC,
  humidityPct,
  exposureHours,
  intensity,
  acclimatised = false,
  saltySweater = false,
}) {
  if (
    !isFiniteNumber(weightKg) ||
    !isFiniteNumber(ambientTempC) ||
    !isFiniteNumber(humidityPct) ||
    !isFiniteNumber(exposureHours)
  ) {
    return { error: "Enter a number in every field." };
  }
  if (weightKg < 25 || weightKg > 250) {
    return { error: "Body weight should be between 25 kg and 250 kg." };
  }
  if (ambientTempC < -10 || ambientTempC > 60) {
    return { error: "Air temperature should be between -10 C and 60 C." };
  }
  if (humidityPct < 0 || humidityPct > 100) {
    return { error: "Relative humidity must be between 0% and 100%." };
  }
  if (exposureHours < 0 || exposureHours > 24) {
    return { error: "Exposure time must be between 0 and 24 hours." };
  }
  if (!Object.prototype.hasOwnProperty.call(INTENSITY_SWEAT_LPH, intensity)) {
    return { error: "Choose an activity level." };
  }

  const baselineTotalL = Math.max(
    BASELINE_FLOOR_L,
    (weightKg * BASELINE_ML_PER_KG_PER_DAY) / 1000,
  );
  const baselineDrinkL = baselineTotalL * (1 - FOOD_WATER_SHARE);

  const heatDegrees = clamp(ambientTempC - REFERENCE_TEMP_C, -MAX_HEAT_DEGREES, MAX_HEAT_DEGREES);
  const heatFactor = Math.pow(1 + HEAT_FACTOR_PER_DEGREE, heatDegrees);

  const humidityFactor = clamp(
    1 + HUMIDITY_FACTOR_PER_PCT * (humidityPct - REFERENCE_HUMIDITY_PCT),
    HUMIDITY_FACTOR_MIN,
    HUMIDITY_FACTOR_MAX,
  );

  const acclimatisationVolumeFactor = acclimatised ? ACCLIMATISED_SWEAT_VOLUME_FACTOR : 1;
  const sweatRateLph =
    INTENSITY_SWEAT_LPH[intensity] * heatFactor * humidityFactor * acclimatisationVolumeFactor;

  const dryAirSpan = DRY_AIR_RH_CEILING_PCT - DRY_AIR_RH_FLOOR_PCT;
  const dryAirShare = clamp((DRY_AIR_RH_CEILING_PCT - humidityPct) / dryAirSpan, 0, 1);
  const respLossLph = DRY_AIR_RESP_LOSS_LPH * dryAirShare;

  const replacementRateLph = Math.max(
    0,
    sweatRateLph + respLossLph - BASELINE_LOSS_ALLOWANCE_LPH,
  );

  const exposureLossL = replacementRateLph * exposureHours;
  const totalDrinkL = baselineDrinkL + exposureLossL;

  const sweatVolumeL = sweatRateLph * exposureHours;
  const sweatSodiumMgPerL =
    (acclimatised ? SWEAT_SODIUM_MG_PER_L_ACCLIMATISED : SWEAT_SODIUM_MG_PER_L_UNACCLIMATISED) *
    (saltySweater ? SALTY_SWEATER_FACTOR : 1);
  const sodiumMg = sweatVolumeL * sweatSodiumMgPerL;
  const potassiumMg = sweatVolumeL * SWEAT_POTASSIUM_MG_PER_L;

  const perServingMl = (replacementRateLph * 1000) / SERVINGS_PER_HOUR;
  const dehydrationAlarmL = weightKg * DEHYDRATION_ALARM_BODY_MASS_FRACTION;

  const warnings = [];
  if (replacementRateLph > MAX_SAFE_INTAKE_LPH) {
    warnings.push(
      `Replacement of ${replacementRateLph.toFixed(2)} L/h exceeds the ${MAX_SAFE_INTAKE_LPH} L/h ceiling the body can absorb. Cut the exposure, move to shade, or split the work across cooler hours instead of drinking faster.`,
    );
  }
  if (totalDrinkL > MAX_SAFE_INTAKE_L_PER_DAY) {
    warnings.push(
      `A day total above ${MAX_SAFE_INTAKE_L_PER_DAY} L is beyond normal heat-illness guidance. Treat this as a signal to shorten the exposure rather than a drinking target.`,
    );
  }
  if (sodiumMg > HIGH_SODIUM_LOSS_MG) {
    warnings.push(
      "Sodium losses this large cannot be covered by plain water. Use an electrolyte drink or salted food, otherwise you risk hyponatraemia from drinking water alone.",
    );
  }
  if (humidityPct <= 20 && ambientTempC >= 35) {
    warnings.push(
      "In air this dry sweat evaporates before you notice it, so thirst badly underestimates your losses. Drink to the schedule, not to thirst.",
    );
  }

  return {
    baselineTotalL,
    baselineDrinkL,
    heatFactor,
    humidityFactor,
    sweatRateLph,
    respLossLph,
    replacementRateLph,
    exposureLossL,
    totalDrinkL,
    sweatVolumeL,
    sweatSodiumMgPerL,
    sodiumMg,
    potassiumMg,
    perServingMl,
    servingsPerHour: SERVINGS_PER_HOUR,
    preHydrationMlLow: weightKg * PRE_HYDRATION_ML_PER_KG_LOW,
    preHydrationMlHigh: weightKg * PRE_HYDRATION_ML_PER_KG_HIGH,
    dehydrationAlarmL,
    warnings,
  };
}

/** Simple hourly drinking plan for the exposure window. */
export function buildDrinkingSchedule(replacementRateLph, exposureHours) {
  if (!isFiniteNumber(replacementRateLph) || !isFiniteNumber(exposureHours)) return [];
  if (replacementRateLph <= 0 || exposureHours <= 0) return [];
  const hours = Math.min(24, Math.ceil(exposureHours));
  const rows = [];
  let cumulative = 0;
  for (let hour = 1; hour <= hours; hour += 1) {
    const share = Math.min(1, exposureHours - (hour - 1));
    const litres = replacementRateLph * share;
    cumulative += litres;
    rows.push({ hour, litres, cumulative });
  }
  return rows;
}
