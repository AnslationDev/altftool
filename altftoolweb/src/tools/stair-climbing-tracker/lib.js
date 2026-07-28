/**
 * Stair climbing tracker maths.
 *
 * Calories come from the physics of lifting body mass through a vertical
 * height, divided by the net mechanical efficiency of stair climbing — this
 * is the same approach exercise physiology texts use and it needs no
 * device-specific fudge factor.
 */

/** Fitbit and Apple Health both define one "floor"/"flight" as 10 feet of elevation gain. */
export const FEET_PER_FLIGHT = 10;

/** International foot, exactly 0.3048 m (NIST SP 811). */
export const METRES_PER_FOOT = 0.3048;

/** One flight in metres: 10 ft x 0.3048 = 3.048 m. */
export const METRES_PER_FLIGHT = FEET_PER_FLIGHT * METRES_PER_FOOT;

/** Typical stair riser used by trackers: 7 in = 17.78 cm. IBC 1011.5.2 caps a riser at 7.75 in (19.7 cm). */
export const DEFAULT_STEP_RISE_CM = 17.8;

/** Riser sanity band: shallow public stairs ~10 cm, steep ship ladders ~30 cm. */
export const MIN_STEP_RISE_CM = 10;
export const MAX_STEP_RISE_CM = 30;

/** Standard gravity, 9.80665 m/s^2 (CGPM 1901 / NIST SP 811). */
export const GRAVITY_MS2 = 9.80665;

/**
 * Net mechanical efficiency of concentric stair ascent is about 23%:
 * roughly a quarter of the metabolic energy becomes vertical work,
 * the rest becomes heat. (Classic ergonomics value, ~0.20-0.25.)
 */
export const CLIMB_EFFICIENCY = 0.23;

/**
 * Descending is eccentric work and costs roughly one third of the energy
 * of ascending the same height (commonly cited ascent:descent ratio ~3:1).
 */
export const DESCENT_ENERGY_FACTOR = 1 / 3;

/** Thermochemical kilocalorie = 4184 J. */
export const JOULES_PER_KCAL = 4184;

/**
 * 1 MET = 3.5 mL O2 / kg / min. Energy equivalent of oxygen ~5 kcal per litre,
 * which gives the standard ACSM shortcut kcal/min = MET x 3.5 x kg / 200.
 */
export const MET_KCAL_FACTOR = 3.5 / 200;

/** Fitbit's out-of-the-box daily target is 10 floors. */
export const DEFAULT_DAILY_FLIGHT_GOAL = 10;

export const MAX_STEPS = 100000;
export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 300;

/**
 * Intensity bands for the gross MET value, from the ACSM / Compendium of
 * Physical Activities convention: <3 light, 3-5.9 moderate, >=6 vigorous.
 */
export const MET_BANDS = [
  { max: 3, label: "Light", note: "Below the moderate-intensity threshold." },
  { max: 6, label: "Moderate", note: "Counts toward moderate-intensity activity minutes." },
  { max: Infinity, label: "Vigorous", note: "Vigorous: one minute counts as two moderate minutes." },
];

function bandForMet(met) {
  return MET_BANDS.find((band) => met < band.max) ?? MET_BANDS[MET_BANDS.length - 1];
}

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {number} input.stepsClimbed  number of individual stair steps ascended
 * @param {number} input.stepRiseCm    height of one step in centimetres
 * @param {number} input.weightKg      body mass in kilograms
 * @param {boolean} input.includeDescent whether the same stairs were walked back down
 * @param {number} input.minutes       total active minutes (0 = unknown, skips intensity)
 * @param {number} input.flightGoal    daily floor target to measure progress against
 */
export function computeStairClimb({
  stepsClimbed,
  stepRiseCm = DEFAULT_STEP_RISE_CM,
  weightKg,
  includeDescent = false,
  minutes = 0,
  flightGoal = DEFAULT_DAILY_FLIGHT_GOAL,
} = {}) {
  if (![stepsClimbed, stepRiseCm, weightKg, minutes, flightGoal].every(isNum)) {
    return { error: "Enter a number in every field." };
  }
  if (stepsClimbed <= 0) {
    return { error: "Enter at least one stair step climbed." };
  }
  if (stepsClimbed > MAX_STEPS) {
    return { error: `Log ${MAX_STEPS.toLocaleString("en-US")} steps or fewer in one session.` };
  }
  if (stepRiseCm < MIN_STEP_RISE_CM || stepRiseCm > MAX_STEP_RISE_CM) {
    return {
      error: `Step rise should be between ${MIN_STEP_RISE_CM} and ${MAX_STEP_RISE_CM} cm (a typical stair is ${DEFAULT_STEP_RISE_CM} cm).`,
    };
  }
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.` };
  }
  if (minutes < 0) {
    return { error: "Duration cannot be negative." };
  }
  if (flightGoal <= 0) {
    return { error: "Daily floor goal must be greater than zero." };
  }

  const elevationM = (stepsClimbed * stepRiseCm) / 100;
  const elevationFt = elevationM / METRES_PER_FOOT;
  const flights = elevationFt / FEET_PER_FLIGHT;

  const workJoules = weightKg * GRAVITY_MS2 * elevationM;
  const climbKcal = workJoules / CLIMB_EFFICIENCY / JOULES_PER_KCAL;
  const descentKcal = includeDescent ? climbKcal * DESCENT_ENERGY_FACTOR : 0;
  const netKcal = climbKcal + descentKcal;

  const restingKcalPerMin = MET_KCAL_FACTOR * weightKg; // 1 MET
  const hasDuration = minutes > 0;
  const kcalPerMin = hasDuration ? netKcal / minutes : 0;
  const grossKcal = hasDuration ? netKcal + restingKcalPerMin * minutes : netKcal;
  const grossMet = hasDuration ? kcalPerMin / restingKcalPerMin + 1 : 0;
  const stepsPerMin = hasDuration ? stepsClimbed / minutes : 0;
  const band = hasDuration ? bandForMet(grossMet) : null;

  const goalPercent = (flights / flightGoal) * 100;

  return {
    elevationM,
    elevationFt,
    flights,
    stepsClimbed,
    climbKcal,
    descentKcal,
    netKcal,
    grossKcal,
    hasDuration,
    kcalPerMin,
    grossMet,
    stepsPerMin,
    intensityLabel: band ? band.label : null,
    intensityNote: band ? band.note : null,
    goalPercent,
    goalFlightsRemaining: Math.max(0, flightGoal - flights),
    flightGoal,
  };
}

/**
 * How many stair steps are needed to reach a floor goal, at a given riser.
 * Useful for "how many steps is 10 floors?".
 */
export function stepsForFlights({ flights, stepRiseCm = DEFAULT_STEP_RISE_CM } = {}) {
  if (!isNum(flights) || !isNum(stepRiseCm)) return { error: "Enter a number in every field." };
  if (flights <= 0) return { error: "Floor target must be greater than zero." };
  if (stepRiseCm < MIN_STEP_RISE_CM || stepRiseCm > MAX_STEP_RISE_CM) {
    return { error: `Step rise should be between ${MIN_STEP_RISE_CM} and ${MAX_STEP_RISE_CM} cm.` };
  }
  const metres = flights * METRES_PER_FLIGHT;
  return { steps: (metres * 100) / stepRiseCm, metres };
}
