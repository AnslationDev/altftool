/**
 * How long a daily step target takes.
 *
 * Time = steps / cadence. Distance = steps x step length, where step length is
 * estimated from stature with the coefficients used throughout the pedometer
 * literature. Intensity is read off the cadence thresholds published by
 * Tudor-Locke et al. and cross-checked against the Compendium walking METs.
 */

/** Step-length coefficients: step length ~ 0.415 x height (male), 0.413 x height (female). */
export const STEP_LENGTH_COEFF = {
  male: 0.415,
  female: 0.413,
};

/** Average of the two, used when the user prefers not to specify. */
export const STEP_LENGTH_COEFF_AVERAGE = (STEP_LENGTH_COEFF.male + STEP_LENGTH_COEFF.female) / 2;

export const MIN_HEIGHT_CM = 100;
export const MAX_HEIGHT_CM = 250;

/** Sustained walking cadence sits well inside this band; above it you are running. */
export const MIN_CADENCE = 20;
export const MAX_CADENCE = 250;

/** The 10,000-step figure comes from 1960s Japanese pedometer marketing, not a clinical trial. */
export const DEFAULT_STEP_TARGET = 10000;
export const MAX_STEP_TARGET = 200000;

/** International mile = 1609.344 m exactly. */
export const METRES_PER_MILE = 1609.344;

/**
 * Cadence-based intensity thresholds for adults (Tudor-Locke et al., 2018,
 * "How fast is fast enough?"): 100 steps/min approximates 3 METs (moderate)
 * and 130 steps/min approximates 6 METs (vigorous).
 */
export const CADENCE_BANDS = [
  { min: 130, label: "Vigorous", note: "About 6 METs — one minute here counts as two moderate minutes." },
  { min: 100, label: "Moderate", note: "At or above 100 steps/min, the usual brisk-walking benchmark." },
  { min: 0, label: "Light", note: "Below 100 steps/min: useful movement, but below the moderate-intensity line." },
];

/** Compendium of Physical Activities 2011, level walking on a firm surface: mph -> MET. */
export const WALK_MET_TABLE = [
  { mph: 2.0, met: 2.8 },
  { mph: 2.5, met: 3.0 },
  { mph: 3.0, met: 3.5 },
  { mph: 3.5, met: 4.3 },
  { mph: 4.0, met: 5.0 },
  { mph: 4.5, met: 7.0 },
  { mph: 5.0, met: 8.3 },
];

/** Compendium value for strolling slower than 2 mph. */
export const STROLL_MET = 2.0;

/** ACSM shortcut: kcal/min = MET x 3.5 x kg / 200. */
export const MET_KCAL_FACTOR = 3.5 / 200;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function metForSpeedMph(mph) {
  if (!isNum(mph) || mph <= 0) return STROLL_MET;
  const first = WALK_MET_TABLE[0];
  const last = WALK_MET_TABLE[WALK_MET_TABLE.length - 1];
  if (mph < first.mph) return STROLL_MET;
  if (mph >= last.mph) return last.met;
  for (let i = 0; i < WALK_MET_TABLE.length - 1; i += 1) {
    const a = WALK_MET_TABLE[i];
    const b = WALK_MET_TABLE[i + 1];
    if (mph >= a.mph && mph < b.mph) {
      return a.met + ((mph - a.mph) / (b.mph - a.mph)) * (b.met - a.met);
    }
  }
  return last.met;
}

export function bandForCadence(cadence) {
  return CADENCE_BANDS.find((band) => cadence >= band.min) ?? CADENCE_BANDS[CADENCE_BANDS.length - 1];
}

/** Minutes -> "1 h 31 min" style text. Pure string formatting. */
export function formatMinutes(totalMinutes) {
  if (!isNum(totalMinutes) || totalMinutes < 0) return "—";
  const rounded = Math.round(totalMinutes);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function stepLengthMetres({ heightCm, sex = "average" } = {}) {
  if (!isNum(heightCm)) return NaN;
  const coeff =
    sex === "male"
      ? STEP_LENGTH_COEFF.male
      : sex === "female"
        ? STEP_LENGTH_COEFF.female
        : STEP_LENGTH_COEFF_AVERAGE;
  return (heightCm * coeff) / 100;
}

/**
 * @param {object} input
 * @param {number} input.stepTarget      steps to reach in a day
 * @param {number} input.cadence         walking cadence in steps per minute
 * @param {number} input.heightCm        stature, for step length
 * @param {"male"|"female"|"average"} input.sex
 * @param {number} input.incidentalSteps steps already taken without a dedicated walk
 * @param {number} input.sessions        number of dedicated walks the remainder is split over
 * @param {number} input.weightKg        body mass, used only for the calorie estimate
 */
export function estimateStepTime({
  stepTarget = DEFAULT_STEP_TARGET,
  cadence,
  heightCm,
  sex = "average",
  incidentalSteps = 0,
  sessions = 1,
  weightKg = 0,
} = {}) {
  if (![stepTarget, cadence, heightCm, incidentalSteps, sessions, weightKg].every(isNum)) {
    return { error: "Enter a number in every field." };
  }
  if (stepTarget <= 0) return { error: "Step target must be greater than zero." };
  if (stepTarget > MAX_STEP_TARGET) {
    return { error: `Step target should be ${MAX_STEP_TARGET.toLocaleString("en-US")} or fewer.` };
  }
  if (cadence < MIN_CADENCE || cadence > MAX_CADENCE) {
    return { error: `Cadence should be between ${MIN_CADENCE} and ${MAX_CADENCE} steps per minute.` };
  }
  if (heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) {
    return { error: `Height should be between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM} cm.` };
  }
  if (incidentalSteps < 0) return { error: "Steps already taken cannot be negative." };
  if (!(sessions >= 1)) return { error: "Split the walk over at least one session." };
  if (weightKg < 0) return { error: "Body weight cannot be negative." };

  const stepM = stepLengthMetres({ heightCm, sex });
  const totalMinutes = stepTarget / cadence;
  const totalDistanceM = stepTarget * stepM;
  const speedKmh = (stepM * cadence * 60) / 1000;
  const speedMph = (speedKmh * 1000) / METRES_PER_MILE;
  const met = metForSpeedMph(speedMph);
  const band = bandForCadence(cadence);

  const remainingSteps = Math.max(0, stepTarget - incidentalSteps);
  const remainingMinutes = remainingSteps / cadence;
  const wholeSessions = Math.floor(sessions);
  const perSessionSteps = wholeSessions > 0 ? remainingSteps / wholeSessions : 0;
  const perSessionMinutes = wholeSessions > 0 ? remainingMinutes / wholeSessions : 0;

  const kcal = weightKg > 0 ? met * MET_KCAL_FACTOR * weightKg * totalMinutes : 0;
  const remainingKcal = weightKg > 0 ? met * MET_KCAL_FACTOR * weightKg * remainingMinutes : 0;

  return {
    stepTarget,
    cadence,
    stepLengthM: stepM,
    totalMinutes,
    totalDistanceKm: totalDistanceM / 1000,
    totalDistanceMiles: totalDistanceM / METRES_PER_MILE,
    speedKmh,
    speedMph,
    met,
    bandLabel: band.label,
    bandNote: band.note,
    kcal,
    hasWeight: weightKg > 0,
    incidentalSteps,
    remainingSteps,
    remainingMinutes,
    remainingKcal,
    goalAlreadyMet: remainingSteps === 0,
    sessions: wholeSessions,
    perSessionSteps,
    perSessionMinutes,
  };
}
