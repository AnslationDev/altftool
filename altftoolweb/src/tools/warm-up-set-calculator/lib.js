/**
 * Warm-up ramp builder.
 *
 * The ramp follows the convention used across strength coaching: start at the
 * empty bar, climb in percentages of the TOP WORKING WEIGHT, and cut the reps as
 * the load rises so the warm-up primes the movement without producing fatigue.
 * Each rung is then rounded to a weight the bar can actually be loaded to,
 * because every plate goes on twice.
 */

/** Every plate is loaded on both sleeves, so the bar moves in 2 x smallest plate. */
export const DEFAULT_INCREMENT_KG = 2.5;
export const DEFAULT_INCREMENT_LB = 5;

export const MIN_WORKING_WEIGHT = 1;
export const MAX_WORKING_WEIGHT = 2000;

/** Rough seconds per rep used to estimate how long the ramp takes. */
export const SECONDS_PER_REP = 3;
/** Default rest between warm-up sets, in seconds. */
export const DEFAULT_REST_SEC = 90;

/**
 * Warm-up schemes. Percentages are of the top working weight, not of a 1RM,
 * and reps fall as the bar gets heavier.
 */
export const WARMUP_SCHEMES = [
  {
    id: "standard",
    label: "Standard strength ramp",
    note: "Four rungs to a top set of 3–5 reps. The everyday default.",
    steps: [
      { pct: 40, reps: 5 },
      { pct: 55, reps: 5 },
      { pct: 70, reps: 3 },
      { pct: 85, reps: 2 },
    ],
  },
  {
    id: "heavy-single",
    label: "Heavy single / max attempt",
    note: "Six rungs with singles near the top, for a 1RM or an opener.",
    steps: [
      { pct: 40, reps: 5 },
      { pct: 55, reps: 3 },
      { pct: 70, reps: 2 },
      { pct: 80, reps: 1 },
      { pct: 88, reps: 1 },
      { pct: 94, reps: 1 },
    ],
  },
  {
    id: "short",
    label: "Short ramp",
    note: "Three rungs for accessory lifts or a second exercise of the day.",
    steps: [
      { pct: 50, reps: 5 },
      { pct: 70, reps: 3 },
      { pct: 85, reps: 2 },
    ],
  },
  {
    id: "hypertrophy",
    label: "Hypertrophy ramp",
    note: "Higher warm-up reps ahead of a working set of 8–12.",
    steps: [
      { pct: 40, reps: 8 },
      { pct: 60, reps: 5 },
      { pct: 80, reps: 3 },
    ],
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function getScheme(schemeId) {
  return WARMUP_SCHEMES.find((scheme) => scheme.id === schemeId) ?? WARMUP_SCHEMES[0];
}

/** Round to the nearest loadable weight for a given bar increment. */
export function roundToIncrement(weight, increment) {
  if (!isNum(weight) || !isNum(increment) || increment <= 0) return null;
  return Math.round(weight / increment) * increment;
}

/**
 * Build the ramp.
 *
 * @param {{workingWeight:number, barWeight?:number, schemeId?:string,
 *          increment?:number, restSec?:number, topReps?:number}} input
 */
export function buildWarmUp({
  workingWeight,
  barWeight = 20,
  schemeId = "standard",
  increment = DEFAULT_INCREMENT_KG,
  restSec = DEFAULT_REST_SEC,
  topReps = 5,
} = {}) {
  if (!isNum(workingWeight)) return { error: "Enter your top working weight." };
  if (workingWeight < MIN_WORKING_WEIGHT || workingWeight > MAX_WORKING_WEIGHT) {
    return {
      error: `Working weight must be between ${MIN_WORKING_WEIGHT} and ${MAX_WORKING_WEIGHT}.`,
    };
  }
  if (!isNum(barWeight) || barWeight < 0) return { error: "Bar weight cannot be negative." };
  if (barWeight > workingWeight) {
    return { error: "The bar already weighs more than your working weight." };
  }
  if (!isNum(increment) || increment <= 0) {
    return { error: "The loading increment must be greater than zero." };
  }
  if (!isNum(restSec) || restSec < 0) return { error: "Rest cannot be negative." };
  if (!isNum(topReps) || topReps < 1) return { error: "The top set needs at least one rep." };

  const scheme = getScheme(schemeId);
  const sets = [];
  let skipped = 0;
  let previousWeight = null;

  for (const step of scheme.steps) {
    const raw = (workingWeight * step.pct) / 100;
    const rounded = roundToIncrement(raw, increment);
    // Never ask for less than the empty bar.
    const weight = Math.max(barWeight, rounded);
    if (previousWeight !== null && weight <= previousWeight) {
      skipped += 1;
      continue;
    }
    if (weight >= workingWeight) {
      skipped += 1;
      continue;
    }
    sets.push({
      percentage: step.pct,
      requested: raw,
      weight,
      reps: step.reps,
      isBarOnly: weight === barWeight && barWeight > rounded,
    });
    previousWeight = weight;
  }

  const workSet = { percentage: 100, requested: workingWeight, weight: workingWeight, reps: topReps, isWorkSet: true };
  const all = [...sets, workSet];

  const warmUpReps = sets.reduce((sum, set) => sum + set.reps, 0);
  const warmUpVolume = sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
  const workTimeSec = all.reduce((sum, set) => sum + set.reps * SECONDS_PER_REP, 0);
  // Rest is taken after every set except the last one before the work set.
  const restTimeSec = sets.length * restSec;

  return {
    scheme,
    sets,
    workSet,
    allSets: all,
    warmUpSetCount: sets.length,
    skippedSteps: skipped,
    warmUpReps,
    warmUpVolume,
    totalVolume: warmUpVolume + workSet.reps * workSet.weight,
    estimatedSeconds: workTimeSec + restTimeSec,
    estimatedMinutes: (workTimeSec + restTimeSec) / 60,
    workingWeight,
    barWeight,
    increment,
  };
}

/** Total tonnage of a list of {weight, reps} sets. */
export function tonnage(sets) {
  if (!Array.isArray(sets)) return 0;
  return sets.reduce(
    (sum, set) => (isNum(set?.weight) && isNum(set?.reps) ? sum + set.weight * set.reps : sum),
    0
  );
}
