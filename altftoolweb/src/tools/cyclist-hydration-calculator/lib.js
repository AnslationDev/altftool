/**
 * Cycling hydration and fuelling plan.
 *
 * Sweat rate model
 * ----------------
 * Sweat rate on the bike is driven by metabolic heat production (riding
 * intensity), the heat and humidity you are shedding it into, and body surface
 * area. This module scales a reference rate measured for a 70 kg rider at 20 C,
 * 50% relative humidity, riding steady endurance pace:
 *
 *   sweat rate = BASE x intensity x (1 + 0.06 per C above 20)
 *                     x (1 + 0.005 per RH point above 50) x (mass/70)^(2/3)
 *
 * The result is clamped to the 0.3-2.5 L/h range reported for cyclists in the
 * ACSM Position Stand "Exercise and Fluid Replacement" (2007). A weigh-in is
 * still the only way to know your own rate exactly.
 *
 * Drinking plan
 * -------------
 *   - Replace sweat as it is lost, but never faster than the gut can take it
 *     (about 1.0 L/h for most riders) and never faster than you are sweating,
 *     because over-drinking is what causes exercise-associated hyponatraemia.
 *   - Aim to finish under 2% body-mass loss (ACSM).
 *   - After the ride, drink 1.5 L per kg still down (ACSM 125-150% of deficit).
 *
 * Carbohydrate
 * ------------
 * Duration bands from the ACSM/AND/DC joint position on Nutrition and Athletic
 * Performance (2016): nothing needed under an hour, ~30 g/h from 1-2 h, ~60 g/h
 * from 2-2.5 h, and up to 90 g/h beyond that — the last only with a glucose plus
 * fructose blend, since a single transportable sugar saturates near 60 g/h.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/* ------------------------------------------------------------ sweat model -- */

export const REFERENCE_MASS_KG = 70;
export const REFERENCE_TEMP_C = 20;
export const REFERENCE_HUMIDITY_PCT = 50;

/** Steady endurance pace, 70 kg rider, 20 C, 50% RH. */
export const BASE_SWEAT_RATE_L_PER_H = 0.75;

/** Sweat rate roughly doubles between 20 C and 32 C on the bike, which is about
 *  6% of the reference rate per degree C. */
export const TEMP_SENSITIVITY_PER_C = 0.06;

/** Humid air suppresses evaporation, so more sweat is secreted per unit of heat
 *  shed. Modelled at 0.5% of the reference rate per RH point above 50%. */
export const HUMIDITY_SENSITIVITY_PER_PCT = 0.005;

/** Heat production scales with body surface area, which goes as mass^(2/3). */
export const MASS_SCALING_EXPONENT = 2 / 3;

/** Relative metabolic cost of common ride types against steady endurance. */
export const RIDE_INTENSITIES = {
  recovery: { label: "Recovery / easy spin", factor: 0.65 },
  endurance: { label: "Endurance / zone 2", factor: 1 },
  tempo: { label: "Tempo / sportive pace", factor: 1.25 },
  race: { label: "Race / intervals", factor: 1.55 },
};

export const MIN_SWEAT_RATE_L_PER_H = 0.3;
export const MAX_SWEAT_RATE_L_PER_H = 2.5;

/* --------------------------------------------------------- drinking rules -- */

/** Practical gastric-emptying ceiling for fluid during cycling. */
export const MAX_GUT_INTAKE_L_PER_H = 1.0;

/** ACSM: keep body-mass loss under 2% during the ride. */
export const DEHYDRATION_THRESHOLD_PCT = 2;

/** ACSM post-exercise: 1.25-1.5 L per kg lost. 1.5 restores fully. */
export const REHYDRATION_FACTOR = 1.5;

/** Mean sweat sodium 50 mmol/L x 22.99 mg/mmol = 1150 mg per litre of sweat. */
export const SWEAT_SODIUM_MG_PER_L = 1150;

/** ACSM drink composition for prolonged exercise: sodium 20-30 mEq/L, i.e.
 *  460-690 mg/L. 300 mg/L is enough for short, cool rides. */
export const DRINK_SODIUM_MG_PER_L_SHORT = 300;
export const DRINK_SODIUM_MG_PER_L_LONG = 600;

/** Rides past this length are where a sodium-bearing drink starts to matter. */
export const LONG_RIDE_HOURS = 2;

/* ---------------------------------------------------------- carbohydrate -- */

/** minHours is inclusive; the first matching band from the top wins. */
export const CARB_BANDS = [
  { minHours: 2.5, gramsPerHour: 90, note: "Needs a glucose plus fructose blend to absorb this much." },
  { minHours: 2, gramsPerHour: 60, note: "A single sugar source still works at this rate." },
  { minHours: 1, gramsPerHour: 30, note: "One gel or one bar an hour covers this." },
  { minHours: 0, gramsPerHour: 0, note: "Under an hour, water is enough — no fuel needed." },
];

/* --------------------------------------------------------------- limits --- */

export const MIN_MASS_KG = 30;
export const MAX_MASS_KG = 250;
export const MIN_HOURS = 0.25;
export const MAX_HOURS = 24;
export const MIN_TEMP_C = -20;
export const MAX_TEMP_C = 55;
export const MIN_BOTTLE_ML = 250;
export const MAX_BOTTLE_ML = 2000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/**
 * Model sweat rate in litres per hour.
 *
 * @param {object} input
 * @returns {{ sweatRateLPerH: number, clamped: boolean } | { error: string }}
 */
export function estimateCyclingSweatRate({ bodyMassKg, tempC, humidityPct, intensity }) {
  if (!isNum(bodyMassKg) || bodyMassKg < MIN_MASS_KG || bodyMassKg > MAX_MASS_KG) {
    return { error: `Enter a rider weight between ${MIN_MASS_KG} and ${MAX_MASS_KG} kg.` };
  }
  if (!isNum(tempC) || tempC < MIN_TEMP_C || tempC > MAX_TEMP_C) {
    return { error: `Temperature should be between ${MIN_TEMP_C} and ${MAX_TEMP_C} C.` };
  }
  if (!isNum(humidityPct) || humidityPct < 0 || humidityPct > 100) {
    return { error: "Relative humidity should be between 0% and 100%." };
  }
  const meta = RIDE_INTENSITIES[intensity];
  if (!meta) return { error: "Choose a ride intensity." };

  const tempFactor = 1 + (tempC - REFERENCE_TEMP_C) * TEMP_SENSITIVITY_PER_C;
  const humidityFactor =
    1 + (humidityPct - REFERENCE_HUMIDITY_PCT) * HUMIDITY_SENSITIVITY_PER_PCT;
  const sizeFactor = Math.pow(bodyMassKg / REFERENCE_MASS_KG, MASS_SCALING_EXPONENT);

  const raw =
    BASE_SWEAT_RATE_L_PER_H *
    meta.factor *
    Math.max(0.25, tempFactor) *
    Math.max(0.8, humidityFactor) *
    sizeFactor;

  const sweatRateLPerH = clamp(raw, MIN_SWEAT_RATE_L_PER_H, MAX_SWEAT_RATE_L_PER_H);
  return { sweatRateLPerH, clamped: sweatRateLPerH !== raw };
}

/**
 * Carbohydrate target for a ride of this length.
 *
 * @param {number} hours
 * @returns {{ gramsPerHour: number, note: string }}
 */
export function carbTargetForHours(hours) {
  const safeHours = isNum(hours) && hours > 0 ? hours : 0;
  return CARB_BANDS.find((band) => safeHours >= band.minHours) ?? CARB_BANDS[CARB_BANDS.length - 1];
}

/**
 * Full ride plan: bottles per hour, refill stops, fuel and post-ride drink.
 *
 * @param {object} input
 * @param {number} input.bodyMassKg
 * @param {number} input.hours ride duration
 * @param {number} input.tempC
 * @param {number} input.humidityPct
 * @param {"recovery"|"endurance"|"tempo"|"race"} input.intensity
 * @param {number} input.bottleMl capacity of one bottle
 * @param {number} input.cages bottle cages carried on the bike
 * @param {number} [input.measuredSweatRateLPerH] overrides the model when > 0
 * @returns {object} plan, or { error }
 */
export function computeRidePlan({
  bodyMassKg,
  hours,
  tempC,
  humidityPct,
  intensity,
  bottleMl,
  cages,
  measuredSweatRateLPerH,
}) {
  if (!isNum(bodyMassKg) || bodyMassKg < MIN_MASS_KG || bodyMassKg > MAX_MASS_KG) {
    return { error: `Enter a rider weight between ${MIN_MASS_KG} and ${MAX_MASS_KG} kg.` };
  }
  if (!isNum(hours) || hours < MIN_HOURS || hours > MAX_HOURS) {
    return { error: `Ride length should be between ${MIN_HOURS} and ${MAX_HOURS} hours.` };
  }
  if (!isNum(bottleMl) || bottleMl < MIN_BOTTLE_ML || bottleMl > MAX_BOTTLE_ML) {
    return { error: `Bottle size should be between ${MIN_BOTTLE_ML} and ${MAX_BOTTLE_ML} ml.` };
  }
  if (!isNum(cages) || cages < 1 || cages > 6) {
    return { error: "Enter between 1 and 6 bottle cages." };
  }

  let sweatRateLPerH;
  let sweatSource;
  let clamped = false;

  if (isNum(measuredSweatRateLPerH) && measuredSweatRateLPerH > 0) {
    if (measuredSweatRateLPerH > MAX_SWEAT_RATE_L_PER_H) {
      return { error: `A sustained sweat rate above ${MAX_SWEAT_RATE_L_PER_H} L/h is outside the measured human range — re-check the figure.` };
    }
    sweatRateLPerH = measuredSweatRateLPerH;
    sweatSource = "measured";
  } else {
    const modelled = estimateCyclingSweatRate({ bodyMassKg, tempC, humidityPct, intensity });
    if (modelled.error) return modelled;
    sweatRateLPerH = modelled.sweatRateLPerH;
    clamped = modelled.clamped;
    sweatSource = "estimated";
  }

  const sweatLossMl = sweatRateLPerH * hours * 1000;

  // Never drink faster than you sweat, and never faster than the gut accepts.
  const intakeLPerH = Math.min(sweatRateLPerH, MAX_GUT_INTAKE_L_PER_H);
  const totalIntakeMl = intakeLPerH * hours * 1000;

  const bottlesPerHour = (intakeLPerH * 1000) / bottleMl;
  const bottlesNeeded = Math.ceil(totalIntakeMl / bottleMl);
  const refillStops = Math.max(0, Math.ceil(bottlesNeeded / cages) - 1);

  const deficitMl = Math.max(0, sweatLossMl - totalIntakeMl);
  const deficitPct = (deficitMl / 1000 / bodyMassKg) * 100;
  const unreplacedPct = (sweatLossMl / 1000 / bodyMassKg) * 100;

  const carb = carbTargetForHours(hours);
  const sodiumPerLitre =
    hours >= LONG_RIDE_HOURS ? DRINK_SODIUM_MG_PER_L_LONG : DRINK_SODIUM_MG_PER_L_SHORT;

  return {
    sweatRateLPerH,
    sweatSource,
    clamped,
    sweatLossMl,
    sweatLossL: sweatLossMl / 1000,
    intakeLPerH,
    intakeMlPerH: intakeLPerH * 1000,
    totalIntakeMl,
    bottleMl,
    bottlesPerHour,
    bottlesNeeded,
    refillStops,
    deficitMl,
    deficitPct,
    unreplacedPct,
    exceedsThreshold: deficitPct > DEHYDRATION_THRESHOLD_PCT,
    postRideMl: deficitMl * REHYDRATION_FACTOR,
    carbGramsPerHour: carb.gramsPerHour,
    carbGramsTotal: carb.gramsPerHour * hours,
    carbNote: carb.note,
    sodiumLostMg: (sweatLossMl / 1000) * SWEAT_SODIUM_MG_PER_L,
    drinkSodiumMgPerL: sodiumPerLitre,
    drinkSodiumMgTotal: (totalIntakeMl / 1000) * sodiumPerLitre,
  };
}
