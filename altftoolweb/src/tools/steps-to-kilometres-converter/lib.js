/**
 * Step count to distance conversion.
 *
 * Distance is simply steps x step length, so the whole problem is getting the
 * step length right. Three methods are supported:
 *
 *  1. From height. The conventional walking estimate is
 *       step length = 0.415 x height (men)
 *       step length = 0.413 x height (women)
 *     These proportions come from gait studies and are the figures most
 *     pedometer instructions use. They describe comfortable walking; step
 *     length grows with speed, so a run covers more ground per step.
 *  2. Measured. Walk a known distance, count the steps, and divide. This beats
 *     any height formula because it captures your own gait.
 *  3. Entered directly, if you already know your step length.
 *
 * A STEP is one foot strike; a STRIDE is two steps, one full gait cycle. Mixing
 * the two is the most common source of a doubled or halved answer, so both are
 * reported.
 *
 * Energy is estimated with MET values from the Compendium of Physical
 * Activities and the standard relation kcal = MET x bodyweight(kg) x hours.
 */

/** Exact metres in one international mile. */
export const METRES_PER_MILE = 1609.344;

/** Height-to-step-length proportions for comfortable walking. */
export const HEIGHT_FACTORS = Object.freeze({ male: 0.415, female: 0.413 });

/** Walking speeds and their Compendium of Physical Activities MET values. */
export const WALK_PACES = Object.freeze([
  { key: "slow", label: "Slow stroll — 3.2 km/h", kmh: 3.2, met: 2.8 },
  { key: "moderate", label: "Moderate — 4.8 km/h", kmh: 4.8, met: 3.5 },
  { key: "brisk", label: "Brisk — 5.6 km/h", kmh: 5.6, met: 4.3 },
  { key: "fast", label: "Fast — 6.4 km/h", kmh: 6.4, met: 5.0 },
]);

/** Input bounds. */
export const LIMITS = Object.freeze({
  stepsMax: 200000,
  heightCmMin: 100,
  heightCmMax: 250,
  stepLengthCmMin: 20,
  stepLengthCmMax: 150,
  measuredDistanceMMax: 1000,
  weightKgMin: 20,
  weightKgMax: 300,
});

/** A commonly quoted daily target, used for the reference table. */
export const REFERENCE_STEP_COUNTS = Object.freeze([1000, 5000, 7500, 10000, 15000]);

export function paceByKey(key) {
  return WALK_PACES.find((pace) => pace.key === key) || null;
}

/**
 * Resolve a step length in centimetres from whichever method was chosen.
 * @returns {{stepLengthCm:number,source:string}|{error:string}}
 */
export function resolveStepLength({ method, sex, heightCm, stepLengthCm, measuredDistanceM, measuredSteps }) {
  if (method === "height") {
    const factor = HEIGHT_FACTORS[sex];
    if (!Number.isFinite(factor)) return { error: "Choose which height proportion to use." };
    const height = Number(heightCm);
    if (!Number.isFinite(height)) return { error: "Enter your height in centimetres." };
    if (height < LIMITS.heightCmMin || height > LIMITS.heightCmMax) {
      return { error: `Enter a height between ${LIMITS.heightCmMin} and ${LIMITS.heightCmMax} cm.` };
    }
    return {
      stepLengthCm: height * factor,
      source: `${factor} x your height, the conventional walking estimate`,
    };
  }

  if (method === "known") {
    const length = Number(stepLengthCm);
    if (!Number.isFinite(length)) return { error: "Enter your step length in centimetres." };
    if (length < LIMITS.stepLengthCmMin || length > LIMITS.stepLengthCmMax) {
      return { error: `A step length between ${LIMITS.stepLengthCmMin} and ${LIMITS.stepLengthCmMax} cm is plausible — check the figure.` };
    }
    return { stepLengthCm: length, source: "the step length you entered" };
  }

  if (method === "measured") {
    const distance = Number(measuredDistanceM);
    const steps = Number(measuredSteps);
    if (!Number.isFinite(distance) || !Number.isFinite(steps)) {
      return { error: "Enter both the distance you walked and the steps it took." };
    }
    if (distance <= 0) return { error: "The measured distance must be more than zero." };
    if (distance > LIMITS.measuredDistanceMMax) {
      return { error: `Measure over ${LIMITS.measuredDistanceMMax} metres or less.` };
    }
    if (steps <= 0) return { error: "The measured step count must be more than zero." };
    const lengthCm = (distance * 100) / steps;
    if (lengthCm < LIMITS.stepLengthCmMin || lengthCm > LIMITS.stepLengthCmMax) {
      return { error: `That works out to ${lengthCm.toFixed(1)} cm per step, which is outside the plausible range — recheck the distance and the count.` };
    }
    return { stepLengthCm: lengthCm, source: `${distance} m walked in ${steps} steps` };
  }

  return { error: "Choose how to work out your step length." };
}

/**
 * Convert a step count into distance, with optional time and energy figures.
 *
 * @param {object} input
 * @param {number} input.steps
 * @param {string} input.method       "height" | "known" | "measured".
 * @param {string} [input.sex]        "male" | "female" (height method).
 * @param {number} [input.heightCm]
 * @param {number} [input.stepLengthCm]
 * @param {number} [input.measuredDistanceM]
 * @param {number} [input.measuredSteps]
 * @param {string} [input.pace]       Walking pace key for time and energy.
 * @param {number} [input.weightKg]   Bodyweight for the energy estimate.
 * @returns {object|{error:string}}
 */
export function stepsToDistance(input) {
  const { steps, pace, weightKg } = input || {};

  const stepCount = Number(steps);
  if (!Number.isFinite(stepCount)) return { error: "Enter a step count." };
  if (stepCount < 0) return { error: "Step count cannot be negative." };
  if (stepCount > LIMITS.stepsMax) return { error: `Enter ${LIMITS.stepsMax} steps or fewer.` };

  const resolved = resolveStepLength(input || {});
  if (resolved.error) return { error: resolved.error };

  const stepLengthCm = resolved.stepLengthCm;
  const stepLengthM = stepLengthCm / 100;
  const metres = stepCount * stepLengthM;
  const kilometres = metres / 1000;
  const miles = metres / METRES_PER_MILE;

  const stepsPerKm = 1000 / stepLengthM;
  const stepsPerMile = METRES_PER_MILE / stepLengthM;

  let effort = null;
  const selectedPace = paceByKey(pace);
  if (selectedPace) {
    const hours = kilometres / selectedPace.kmh;
    const weight = Number(weightKg);
    const hasWeight = Number.isFinite(weight) && weight >= LIMITS.weightKgMin && weight <= LIMITS.weightKgMax;
    effort = {
      pace: selectedPace,
      hours,
      minutes: hours * 60,
      kcal: hasWeight ? selectedPace.met * weight * hours : null,
      weightUsed: hasWeight ? weight : null,
    };
  }

  const reference = REFERENCE_STEP_COUNTS.map((count) => ({
    steps: count,
    kilometres: (count * stepLengthM) / 1000,
    miles: (count * stepLengthM) / METRES_PER_MILE,
  }));

  return {
    steps: stepCount,
    stepLengthCm,
    strideLengthCm: stepLengthCm * 2,
    stepLengthSource: resolved.source,
    metres,
    kilometres,
    miles,
    stepsPerKm,
    stepsPerMile,
    effort,
    reference,
  };
}
