/**
 * Dumbbell <-> barbell load conversion.
 *
 * There is no exact formula: two dumbbells and a barbell are different tools.
 * Dumbbells load each limb independently, travel through a longer range of
 * motion and demand far more stabilisation, so the combined weight of a pair is
 * reliably LESS than the barbell load you handle on the same movement.
 *
 * This module uses a published-style conversion factor per exercise:
 *
 *     factor = (weight of dumbbell pair, both hands) / (total barbell load incl. bar)
 *
 * Each exercise carries a mid factor and a low/high band, because the true
 * figure depends on your stabiliser strength, grip and range of motion. Treat
 * the output as a starting load to test, not a prediction of your max.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Common bar weights in kilograms. */
export const BARS = [
  { id: "olympic", label: "Olympic men's bar (20 kg)", weightKg: 20 },
  { id: "womens", label: "Olympic women's bar (15 kg)", weightKg: 15 },
  { id: "training", label: "Training / standard bar (10 kg)", weightKg: 10 },
  { id: "ez", label: "EZ-curl bar (7.5 kg typical)", weightKg: 7.5 },
];

/**
 * Conversion factors (dumbbell pair total / barbell total).
 * Mid values sit inside the ranges commonly used by strength coaches; the wider
 * the stabilisation demand of the lift, the lower the factor.
 */
export const EXERCISES = [
  {
    id: "bench",
    label: "Flat bench press",
    mid: 0.75,
    low: 0.7,
    high: 0.8,
    note: "Dumbbells drop the load most on pressing because each arm stabilises its own path.",
  },
  {
    id: "incline",
    label: "Incline bench press",
    mid: 0.75,
    low: 0.7,
    high: 0.8,
    note: "Same stabilisation penalty as flat bench, with a slightly longer press path.",
  },
  {
    id: "ohp",
    label: "Overhead / shoulder press",
    mid: 0.75,
    low: 0.7,
    high: 0.8,
    note: "Seated versions sit at the top of the band; standing pressing at the bottom.",
  },
  {
    id: "row",
    label: "Bent-over row",
    mid: 0.8,
    low: 0.75,
    high: 0.85,
    note: "Single-arm supported rows can exceed this because the torso is braced.",
  },
  {
    id: "rdl",
    label: "Romanian deadlift",
    mid: 0.85,
    low: 0.8,
    high: 0.9,
    note: "Grip usually becomes the limit before the hamstrings do — use straps to test honestly.",
  },
  {
    id: "curl",
    label: "Biceps curl",
    mid: 0.8,
    low: 0.75,
    high: 0.85,
    note: "Compared against an EZ or straight bar curl of the same style.",
  },
  {
    id: "lunge",
    label: "Lunge / split squat",
    mid: 0.7,
    low: 0.6,
    high: 0.75,
    note: "Balance and grip cap dumbbell versions well below back-loaded barbell work.",
  },
  {
    id: "squat",
    label: "Squat (back squat vs dumbbells)",
    mid: 0.6,
    low: 0.5,
    high: 0.65,
    note: "The weakest equivalence on this list — dumbbells cannot load a squat the way a bar can.",
  },
];

/** Smallest dumbbell step commonly stocked, in kilograms. */
export const DUMBBELL_STEPS_KG = [1, 2, 2.5, 5];

/** Sanity bound: heavier than any commercial dumbbell or realistic gym barbell load. */
export const MAX_LOAD_KG = 500;

/** 1 kilogram in pounds, for the unit toggle. */
export const LB_PER_KG = 2.2046226218;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Round to the nearest step (e.g. nearest 2.5 kg dumbbell). Never returns NaN. */
export function roundToStep(value, step) {
  if (!isNum(value) || !isNum(step) || step <= 0) return 0;
  return Math.round(value / step) * step;
}

/** Look up an exercise definition by id; falls back to bench press. */
export function findExercise(id) {
  return EXERCISES.find((exercise) => exercise.id === id) ?? EXERCISES[0];
}

/** Look up a bar by id; falls back to the 20 kg Olympic bar. */
export function findBar(id) {
  return BARS.find((bar) => bar.id === id) ?? BARS[0];
}

/**
 * Convert a barbell load to the equivalent dumbbell pair.
 *
 * @param {object} input
 * @param {number} input.barbellTotalKg Total on the bar, bar weight included.
 * @param {string} input.exerciseId
 * @param {number} [input.stepKg=2.5]   Dumbbell increment available to you.
 */
export function barbellToDumbbell({ barbellTotalKg, exerciseId, stepKg = 2.5 } = {}) {
  if (!isNum(barbellTotalKg) || !isNum(stepKg)) {
    return { error: "Enter a weight in kilograms." };
  }
  if (barbellTotalKg <= 0) return { error: "Barbell load must be greater than zero." };
  if (barbellTotalKg > MAX_LOAD_KG) {
    return { error: `Barbell load above ${MAX_LOAD_KG} kg is outside this tool's range.` };
  }
  if (stepKg <= 0) return { error: "Dumbbell increment must be greater than zero." };

  const exercise = findExercise(exerciseId);
  const pairTotalKg = barbellTotalKg * exercise.mid;
  const eachKg = pairTotalKg / 2;

  return {
    direction: "barbell-to-dumbbell",
    exercise,
    barbellTotalKg,
    pairTotalKg,
    eachKg,
    eachRoundedKg: roundToStep(eachKg, stepKg),
    eachLowKg: (barbellTotalKg * exercise.low) / 2,
    eachHighKg: (barbellTotalKg * exercise.high) / 2,
    factor: exercise.mid,
    stepKg,
  };
}

/**
 * Convert a dumbbell pair to the equivalent barbell load.
 *
 * @param {object} input
 * @param {number} input.dumbbellEachKg Weight of ONE dumbbell.
 * @param {string} input.exerciseId
 * @param {string} [input.barId="olympic"]
 * @param {number} [input.plateStepKg=1.25] Smallest plate you own (per side rounding).
 */
export function dumbbellToBarbell({
  dumbbellEachKg,
  exerciseId,
  barId = "olympic",
  plateStepKg = 1.25,
} = {}) {
  if (!isNum(dumbbellEachKg) || !isNum(plateStepKg)) {
    return { error: "Enter a weight in kilograms." };
  }
  if (dumbbellEachKg <= 0) return { error: "Dumbbell weight must be greater than zero." };
  if (dumbbellEachKg > MAX_LOAD_KG) {
    return { error: `Dumbbell weight above ${MAX_LOAD_KG} kg is outside this tool's range.` };
  }
  if (plateStepKg <= 0) return { error: "Plate increment must be greater than zero." };

  const exercise = findExercise(exerciseId);
  const bar = findBar(barId);
  const pairTotalKg = dumbbellEachKg * 2;
  const barbellTotalKg = pairTotalKg / exercise.mid;
  const plateLoadKg = barbellTotalKg - bar.weightKg;

  return {
    direction: "dumbbell-to-barbell",
    exercise,
    bar,
    pairTotalKg,
    dumbbellEachKg,
    barbellTotalKg,
    barbellLowKg: pairTotalKg / exercise.high,
    barbellHighKg: pairTotalKg / exercise.low,
    plateLoadKg,
    perSideKg: plateLoadKg / 2,
    perSideRoundedKg: plateLoadKg > 0 ? roundToStep(plateLoadKg / 2, plateStepKg) : 0,
    barTooHeavy: plateLoadKg <= 0,
    factor: exercise.mid,
    plateStepKg,
  };
}

/** Kilograms -> pounds, for the display toggle. Never returns NaN. */
export function kgToLb(kg) {
  return isNum(kg) ? kg * LB_PER_KG : 0;
}
