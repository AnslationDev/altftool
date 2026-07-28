/**
 * Stair running / stair climbing energy cost.
 *
 * Two independent estimates are produced:
 *
 * 1. Metabolic (primary) — the ACSM definition that 1 MET equals a resting
 *    oxygen uptake of 3.5 mL O2 per kg per minute and 1 L of O2 yields ~5 kcal:
 *      kcal/min = MET x 3.5 x bodyMassKg / 200
 *    MET values are published rows of the 2011 Compendium of Physical
 *    Activities (Ainsworth et al., Med Sci Sports Exerc 43(8):1575-81).
 *
 * 2. Mechanical (cross-check) — the physical work done lifting your body mass
 *    through the total vertical rise, W = m x g x h joules, divided by the
 *    gross mechanical efficiency of stair climbing (~23% of the chemical energy
 *    used appears as external vertical work).
 */

/** 1 MET expressed as oxygen uptake, mL O2 per kg per minute (ACSM definition). */
export const MET_ML_O2_PER_KG_MIN = 3.5;

/** Divisor converting mL O2/kg/min into kcal/min (1 L O2 ~ 5 kcal => 1000/5). */
export const KCAL_CONVERSION_DIVISOR = 200;

/** Standard gravity, m/s^2 (CGPM definition). */
export const GRAVITY_M_S2 = 9.80665;

/** Joules in one kilocalorie (thermochemical). */
export const JOULES_PER_KCAL = 4184;

/**
 * Gross mechanical efficiency of stair ascent: roughly 23% of metabolic energy
 * becomes external vertical work, the rest is heat and non-vertical movement.
 * Reported range in stair-climbing ergometry is about 20-25%.
 */
export const STAIR_EFFICIENCY = 0.23;

/** Resting baseline used to convert gross calories to net. */
export const RESTING_MET = 1;

/** Ascent intensities, 2011 Compendium of Physical Activities. */
export const ASCENT_EFFORTS = [
  {
    id: "slow",
    label: "Walking up, slow pace",
    met: 4.0,
    defaultCadence: 50,
  },
  {
    id: "fast",
    label: "Walking up, fast pace",
    met: 8.8,
    defaultCadence: 80,
  },
  {
    id: "run",
    label: "Running up the stairs",
    met: 15.0,
    defaultCadence: 110,
  },
];

/** Descent options. Walking down stairs is 3.5 METs; riding the lift is standing quietly, 1.3 METs. */
export const DESCENT_MODES = [
  { id: "walk", label: "Walk back down", met: 3.5, usesCadence: true },
  { id: "lift", label: "Take the lift down", met: 1.3, usesCadence: false },
  { id: "none", label: "One-way climb only", met: 0, usesCadence: false },
];

/** Seconds a lift ride is assumed to take per flight when descending by lift. */
export const LIFT_SECONDS_PER_FLIGHT = 12;

/**
 * Common riser heights. Indian NBC residential risers are typically 15-17.5 cm;
 * the International Building Code caps commercial risers at 7 in (17.8 cm).
 */
export const TYPICAL_STEP_HEIGHT_CM = 17;

/** Steps in a typical residential or office flight (one storey is often two flights). */
export const TYPICAL_STEPS_PER_FLIGHT = 13;

export const LIMITS = {
  weightKg: { min: 20, max: 300 },
  flights: { min: 1, max: 500 },
  stepsPerFlight: { min: 2, max: 100 },
  stepHeightCm: { min: 5, max: 40 },
  cadence: { min: 10, max: 400 },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** kcal burned at a given MET for a given mass and duration in minutes. */
export function kcalFromMet(met, weightKg, minutes) {
  if (!isNum(met) || !isNum(weightKg) || !isNum(minutes)) return 0;
  if (met <= 0 || weightKg <= 0 || minutes <= 0) return 0;
  return (met * MET_ML_O2_PER_KG_MIN * weightKg * minutes) / KCAL_CONVERSION_DIVISOR;
}

/**
 * Compute a stair session.
 * @returns {{error:string}|object} plain result object, never NaN or Infinity.
 */
export function computeStairSession({
  weightKg,
  flights,
  stepsPerFlight,
  stepHeightCm,
  ascentEffort = "run",
  cadence,
  descentMode = "walk",
  descentCadence,
} = {}) {
  const required = { weightKg, flights, stepsPerFlight, stepHeightCm, cadence };
  for (const key of Object.keys(required)) {
    if (!isNum(required[key])) return { error: "Enter a valid number in every field." };
  }

  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return {
      error: `Body weight should be between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.`,
    };
  }
  if (flights < LIMITS.flights.min || flights > LIMITS.flights.max) {
    return {
      error: `Flights climbed should be between ${LIMITS.flights.min} and ${LIMITS.flights.max}.`,
    };
  }
  if (
    stepsPerFlight < LIMITS.stepsPerFlight.min ||
    stepsPerFlight > LIMITS.stepsPerFlight.max
  ) {
    return {
      error: `Steps per flight should be between ${LIMITS.stepsPerFlight.min} and ${LIMITS.stepsPerFlight.max}.`,
    };
  }
  if (
    stepHeightCm < LIMITS.stepHeightCm.min ||
    stepHeightCm > LIMITS.stepHeightCm.max
  ) {
    return {
      error: `Step height should be between ${LIMITS.stepHeightCm.min} and ${LIMITS.stepHeightCm.max} cm.`,
    };
  }
  if (cadence < LIMITS.cadence.min || cadence > LIMITS.cadence.max) {
    return {
      error: `Climbing cadence should be between ${LIMITS.cadence.min} and ${LIMITS.cadence.max} steps per minute.`,
    };
  }

  const effort =
    ASCENT_EFFORTS.find((item) => item.id === ascentEffort) || ASCENT_EFFORTS[2];
  const descent = DESCENT_MODES.find((item) => item.id === descentMode) || DESCENT_MODES[0];

  const downCadence = isNum(descentCadence) && descentCadence > 0 ? descentCadence : cadence;
  if (descent.usesCadence && (downCadence < LIMITS.cadence.min || downCadence > LIMITS.cadence.max)) {
    return {
      error: `Descent cadence should be between ${LIMITS.cadence.min} and ${LIMITS.cadence.max} steps per minute.`,
    };
  }

  const totalSteps = flights * stepsPerFlight;
  const stepHeightM = stepHeightCm / 100;
  const verticalMetres = totalSteps * stepHeightM;

  const ascentMinutes = totalSteps / cadence;
  let descentMinutes = 0;
  if (descent.id === "walk") descentMinutes = totalSteps / downCadence;
  else if (descent.id === "lift") descentMinutes = (flights * LIFT_SECONDS_PER_FLIGHT) / 60;

  const sessionMinutes = ascentMinutes + descentMinutes;

  const ascentKcal = kcalFromMet(effort.met, weightKg, ascentMinutes);
  const descentKcal = kcalFromMet(descent.met, weightKg, descentMinutes);
  const grossKcal = ascentKcal + descentKcal;
  const restingKcal = kcalFromMet(RESTING_MET, weightKg, sessionMinutes);
  const netKcal = Math.max(0, grossKcal - restingKcal);

  const mechanicalJoules = weightKg * GRAVITY_M_S2 * verticalMetres;
  const mechanicalKcal = mechanicalJoules / JOULES_PER_KCAL;
  const workBasedKcal = mechanicalKcal / STAIR_EFFICIENCY;

  const kcalPerFlight = flights > 0 ? ascentKcal / flights : 0;
  const kcalPerStep = totalSteps > 0 ? ascentKcal / totalSteps : 0;
  const flightsPerMinute = ascentMinutes > 0 ? flights / ascentMinutes : 0;
  const ascentShare = grossKcal > 0 ? (ascentKcal / grossKcal) * 100 : 0;

  return {
    effortLabel: effort.label,
    met: effort.met,
    descentLabel: descent.label,
    descentMet: descent.met,
    totalSteps,
    verticalMetres,
    ascentMinutes,
    descentMinutes,
    sessionMinutes,
    ascentKcal,
    descentKcal,
    grossKcal,
    netKcal,
    restingKcal,
    mechanicalJoules,
    mechanicalKcal,
    workBasedKcal,
    kcalPerFlight,
    kcalPerStep,
    flightsPerMinute,
    ascentShare,
    descentShare: 100 - ascentShare,
  };
}

/** How many flights (at the same settings) it takes to reach a calorie target. */
export function flightsForTarget({ kcalPerFlight, targetKcal } = {}) {
  if (!isNum(kcalPerFlight) || !isNum(targetKcal)) return null;
  if (kcalPerFlight <= 0 || targetKcal <= 0) return null;
  return targetKcal / kcalPerFlight;
}
