/**
 * Cold Weather Hydration Calculator — pure calculation module.
 *
 * The model adds four physically separable water losses:
 *   1. Baseline daily water need (body-mass rule).
 *   2. EXTRA respiratory water loss caused by breathing cold, dry air harder
 *      than you would indoors at rest.
 *   3. Sweat produced under insulating layers during the activity.
 *   4. Cold-induced diuresis (extra urine produced in the cold).
 *
 * Respiratory loss is computed from real psychrometrics, not a rule of thumb:
 * exhaled air leaves the airway saturated at ~37 C, inhaled air carries only
 * whatever water the outdoor air holds, and the difference is lost water.
 */

/** Total-water adequate intake per kg of body mass, ml/kg/day.
 *  ~30-35 ml/kg/day is the standard adult clinical maintenance figure and lines
 *  up with the EFSA adequate intakes (2.5 L/day men, 2.0 L/day women). */
export const BASELINE_ML_PER_KG = 35;

/** Share of total water intake that normally arrives in food rather than drink.
 *  EFSA/IOM put water from food at roughly 20-30% of total water. */
export const FOOD_WATER_SHARE = 0.2;

/** Magnus-Tetens coefficients (WMO CIMO Guide) for saturation vapour pressure.
 *  Separate sets over liquid water and over ice; below 0 C the ice set is right. */
const MAGNUS_WATER = { a: 6.112, b: 17.62, c: 243.12 };
const MAGNUS_ICE = { a: 6.112, b: 22.46, c: 272.62 };

/** Absolute humidity constant: rho_v (g/m3) = 216.7 * e(hPa) / T(K).
 *  Derived from the ideal gas law with the molar mass of water vapour. */
const ABS_HUMIDITY_CONST = 216.7;

/** Exhaled air leaves the upper airway essentially saturated at core temperature. */
const EXPIRED_AIR_TEMP_C = 37;

/** Resting indoor minute ventilation, litres per minute. This much breathing is
 *  already paid for inside BASELINE_ML_PER_KG, so it is subtracted out. */
const REST_INDOOR_VENTILATION_LPM = 6;

/** Reference indoor air the baseline assumes you would otherwise be breathing. */
const INDOOR_REF_TEMP_C = 20;
const INDOOR_REF_RH = 40;

/** Cold-induced diuresis: peripheral vasoconstriction raises central volume and
 *  urine output rises in the cold. Applied only below COLD_DIURESIS_TEMP_C.
 *  25 ml/h is a deliberately conservative mid-range figure. */
export const COLD_DIURESIS_TEMP_C = 10;
export const COLD_DIURESIS_ML_PER_HOUR = 25;

/** Mean sodium concentration of sweat, mmol/L (population range ~20-80 mmol/L). */
export const SWEAT_SODIUM_MMOL_PER_L = 40;
/** Molar mass of sodium, mg per mmol. */
const SODIUM_MG_PER_MMOL = 23;

/** Sweat volume above which an electrolyte drink is worth using instead of water. */
export const ELECTROLYTE_SWEAT_THRESHOLD_ML = 1500;

/** Practical ceiling on drinking rate. Gastric emptying tops out near 1.0-1.2 L/h
 *  and sustained intake above ~0.8 L/h raises the risk of dilutional hyponatraemia. */
export const MAX_HOURLY_INTAKE_ML = 800;

/**
 * Activity levels. Minute ventilation figures are standard exercise-physiology
 * values; sweat rates are the lower cold-weather end of the usual ranges because
 * cold air suppresses sweating even though layers trap it.
 */
export const ACTIVITY_LEVELS = [
  {
    id: "still",
    label: "Standing around / spectating",
    ventilationLpm: 8,
    sweatLph: 0.1,
  },
  {
    id: "light",
    label: "Easy walking, light chores",
    ventilationLpm: 18,
    sweatLph: 0.25,
  },
  {
    id: "moderate",
    label: "Brisk hiking, shovelling snow, skating",
    ventilationLpm: 32,
    sweatLph: 0.55,
  },
  {
    id: "vigorous",
    label: "Running, ski touring, hard climbing",
    ventilationLpm: 60,
    sweatLph: 1.0,
  },
];

/** Saturation vapour pressure in hPa at temperature tC (Magnus-Tetens). */
export function saturationVapourPressure(tC) {
  const k = tC < 0 ? MAGNUS_ICE : MAGNUS_WATER;
  return k.a * Math.exp((k.b * tC) / (k.c + tC));
}

/** Absolute humidity in g of water per m3 of air. */
export function absoluteHumidity(tC, relativeHumidityPct) {
  const rh = Math.min(100, Math.max(0, relativeHumidityPct)) / 100;
  const e = saturationVapourPressure(tC) * rh;
  return (ABS_HUMIDITY_CONST * e) / (tC + 273.15);
}

/** Convert Fahrenheit to Celsius. */
export function fahrenheitToCelsius(f) {
  return ((f - 32) * 5) / 9;
}

function round(value, step = 1) {
  return Math.round(value / step) * step;
}

/**
 * Main calculation.
 *
 * @param {object} input
 * @param {number} input.weightKg      body mass in kilograms
 * @param {number} input.tempC         outdoor air temperature in Celsius
 * @param {number} input.humidityPct   outdoor relative humidity, 0-100
 * @param {number} input.hoursOutdoors hours spent outside today
 * @param {string} input.activityId    one of ACTIVITY_LEVELS ids
 * @returns {object} result figures, or { error } when the input is unusable
 */
export function computeColdWeatherHydration({
  weightKg,
  tempC,
  humidityPct,
  hoursOutdoors,
  activityId,
} = {}) {
  const weight = Number(weightKg);
  const temp = Number(tempC);
  const rh = Number(humidityPct);
  const hours = Number(hoursOutdoors);

  if (![weight, temp, rh, hours].every((v) => Number.isFinite(v))) {
    return { error: "Enter a number in every field." };
  }
  if (weight <= 0) return { error: "Body weight must be greater than zero." };
  if (weight > 350) return { error: "Body weight looks too high — check the units." };
  if (temp < -60 || temp > 25) {
    return { error: "Use an outdoor temperature between -60 °C and 25 °C for cold-weather planning." };
  }
  if (rh < 0 || rh > 100) return { error: "Relative humidity must be between 0% and 100%." };
  if (hours < 0) return { error: "Hours outdoors cannot be negative." };
  if (hours > 16) return { error: "Enter 16 hours or fewer of outdoor exposure per day." };

  const activity =
    ACTIVITY_LEVELS.find((level) => level.id === activityId) || ACTIVITY_LEVELS[1];

  // 1. Baseline daily total water.
  const baselineMl = weight * BASELINE_ML_PER_KG;

  // 2. Respiratory water loss, in millilitres (1 g of water = 1 ml).
  const expiredDensity = absoluteHumidity(EXPIRED_AIR_TEMP_C, 100);
  const outdoorDensity = absoluteHumidity(temp, rh);
  const indoorDensity = absoluteHumidity(INDOOR_REF_TEMP_C, INDOOR_REF_RH);

  const outdoorVentM3PerHour = (activity.ventilationLpm * 60) / 1000;
  const indoorVentM3PerHour = (REST_INDOOR_VENTILATION_LPM * 60) / 1000;

  const respiratoryOutdoorMl =
    outdoorVentM3PerHour * (expiredDensity - outdoorDensity) * hours;
  const respiratoryIndoorMl =
    indoorVentM3PerHour * (expiredDensity - indoorDensity) * hours;
  const respiratoryExtraMl = Math.max(0, respiratoryOutdoorMl - respiratoryIndoorMl);

  // 3. Sweat trapped under layers.
  const sweatMl = activity.sweatLph * 1000 * hours;

  // 4. Cold-induced diuresis.
  const coldDiuresisMl =
    temp < COLD_DIURESIS_TEMP_C ? COLD_DIURESIS_ML_PER_HOUR * hours : 0;

  const totalWaterMl = baselineMl + respiratoryExtraMl + sweatMl + coldDiuresisMl;

  // Water from food only offsets the baseline; sweat and breath losses must be drunk.
  const foodWaterMl = baselineMl * FOOD_WATER_SHARE;
  const drinkMl = Math.max(0, totalWaterMl - foodWaterMl);

  // Suggested split between the outdoor session and the rest of the day.
  const duringSessionRawMl = respiratoryExtraMl + sweatMl + coldDiuresisMl;
  const hourlyDuringMl = hours > 0 ? duringSessionRawMl / hours : 0;
  const hourlyCapped = Math.min(hourlyDuringMl, MAX_HOURLY_INTAKE_ML);
  const duringSessionMl = hourlyCapped * hours;
  const restOfDayMl = Math.max(0, drinkMl - duringSessionMl);

  const sodiumLossMg = (sweatMl / 1000) * SWEAT_SODIUM_MMOL_PER_L * SODIUM_MG_PER_MMOL;

  return {
    baselineMl: round(baselineMl, 10),
    respiratoryExtraMl: round(respiratoryExtraMl, 5),
    sweatMl: round(sweatMl, 10),
    coldDiuresisMl: round(coldDiuresisMl, 5),
    totalWaterMl: round(totalWaterMl, 10),
    foodWaterMl: round(foodWaterMl, 10),
    drinkMl: round(drinkMl, 10),
    duringSessionMl: round(duringSessionMl, 10),
    restOfDayMl: round(restOfDayMl, 10),
    hourlyDuringMl: round(hourlyCapped, 10),
    hourlyCapReached: hourlyDuringMl > MAX_HOURLY_INTAKE_ML,
    outdoorAbsoluteHumidity: Math.round(outdoorDensity * 100) / 100,
    indoorAbsoluteHumidity: Math.round(indoorDensity * 100) / 100,
    needsElectrolytes: sweatMl >= ELECTROLYTE_SWEAT_THRESHOLD_ML,
    sodiumLossMg: Math.round(sodiumLossMg),
    activityLabel: activity.label,
    glasses250: Math.round(drinkMl / 250),
  };
}

export default computeColdWeatherHydration;
