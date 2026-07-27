/**
 * Heart rate zones for basketball conditioning.
 *
 * Basketball is a repeated-sprint sport played in short, dense bursts. Match
 * analysis studies report live-play heart rate averaging roughly 85-90% of
 * maximum, with players spending the majority of live time above 85%.
 *
 * Two extras are built in:
 *  - a shuttle/court drill planner with a heart-rate-guided recovery cue, so
 *    the next repetition starts when heart rate has dropped back to a set
 *    fraction of maximum rather than after an arbitrary rest;
 *  - one-minute heart rate recovery (HRR1), a standard cardiovascular marker.
 *    In the Cleveland Clinic cohort (Cole et al., New England Journal of
 *    Medicine, 1999) a fall of 12 beats per minute or less one minute after
 *    stopping exercise was classed as an abnormal response.
 */

/** Age-predicted maximum heart rate formulas. */
export const MAX_HR_FORMULAS = [
  {
    id: "tanaka",
    label: "Tanaka",
    expression: "208 − 0.7 × age",
    // Tanaka, Monahan & Seals (2001), meta-analysis of 351 studies.
    compute: (age) => 208 - 0.7 * age,
  },
  {
    id: "fox",
    label: "Fox",
    expression: "220 − age",
    // Fox, Naughton & Haskell (1971).
    compute: (age) => 220 - age,
  },
  {
    id: "gulati",
    label: "Gulati (women)",
    expression: "206 − 0.88 × age",
    // Gulati et al. (2010), derived from 5,437 women.
    compute: (age) => 206 - 0.88 * age,
  },
];

export const ZONE_METHODS = [
  { id: "pctmax", label: "% of maximum heart rate" },
  { id: "karvonen", label: "Karvonen (heart rate reserve)" },
];

/** Basketball conditioning zones as fractions of maximum heart rate. */
export const BASKETBALL_ZONES = [
  {
    id: 1,
    name: "Zone 1",
    title: "Recovery and skill",
    low: 0.5,
    high: 0.6,
    drill: "Form shooting, free throws, walk-through of sets",
    purpose: "Skill volume with no conditioning cost. Ideal the day after a game.",
  },
  {
    id: 2,
    name: "Zone 2",
    title: "Aerobic base",
    low: 0.6,
    high: 0.7,
    drill: "Continuous shooting circuits, ball-handling laps, easy 3-on-0 flow",
    purpose: "Builds the aerobic engine that clears lactate between possessions.",
  },
  {
    id: 3,
    name: "Zone 3",
    title: "Practice tempo",
    low: 0.7,
    high: 0.8,
    drill: "Half-court 5v5, shell drill, controlled scrimmage",
    purpose: "Standard practice intensity — enough load to hold technique together.",
  },
  {
    id: 4,
    name: "Zone 4",
    title: "Live game intensity",
    low: 0.8,
    high: 0.9,
    drill: "Full-court live 5v5, transition and press-break drills",
    purpose: "Where live play actually sits. Trains the ability to repeat efforts.",
  },
  {
    id: 5,
    name: "Zone 5",
    title: "Repeated sprint",
    low: 0.9,
    high: 1,
    drill: "Suicides and 17s, closeout series, defensive slide sets",
    purpose: "Top-end conditioning and lactate tolerance. Short exposures only.",
  },
];

/** Live-play heart rate reported for basketball, as fractions of maximum. */
export const GAME_INTENSITY_LOW = 0.85;
export const GAME_INTENSITY_HIGH = 0.9;

/** Default cue for starting the next repetition, as a fraction of maximum. */
export const DEFAULT_RECOVERY_FRACTION = 0.7;

/** Cole et al. (1999): a 1-minute recovery of 12 bpm or less is abnormal. */
export const HRR1_ABNORMAL_THRESHOLD = 12;

export const AGE_MIN = 10;
export const AGE_MAX = 100;
export const REST_HR_MIN = 30;
export const REST_HR_MAX = 120;
export const MAX_HR_MIN = 100;
export const MAX_HR_MAX = 230;
export const REPS_MIN = 1;
export const REPS_MAX = 30;
export const WORK_SEC_MIN = 5;
export const WORK_SEC_MAX = 300;
export const REST_SEC_MIN = 5;
export const REST_SEC_MAX = 600;

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Age-predicted maximum heart rate. */
export function estimateMaxHr(age, formulaId = "tanaka") {
  const formula = MAX_HR_FORMULAS.find((entry) => entry.id === formulaId);
  if (!formula || !isNumber(age) || age < AGE_MIN || age > AGE_MAX) return NaN;
  return formula.compute(age);
}

/** Heart rate for a fraction of intensity, by method. */
export function targetBpm(fraction, maxHr, restHr, method) {
  if (!isNumber(fraction) || !isNumber(maxHr)) return NaN;
  if (method === "karvonen") {
    if (!isNumber(restHr) || maxHr <= restHr) return NaN;
    return restHr + fraction * (maxHr - restHr);
  }
  return fraction * maxHr;
}

/** Seconds to a m:ss string. */
export function formatDuration(seconds) {
  if (!isNumber(seconds) || seconds < 0) return "—";
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

/**
 * One-minute heart rate recovery. Returned as its own block so a missing or
 * implausible entry never blanks the zone table.
 */
export function evaluateHrr1(peakBpm, oneMinuteBpm) {
  if (!isNumber(peakBpm) || !isNumber(oneMinuteBpm) || peakBpm <= 0 || oneMinuteBpm <= 0) {
    return { ok: false, message: "Enter the peak heart rate and the reading one minute later." };
  }
  if (peakBpm < MAX_HR_MIN || peakBpm > MAX_HR_MAX) {
    return { ok: false, message: `Peak heart rate should be between ${MAX_HR_MIN} and ${MAX_HR_MAX} bpm.` };
  }
  if (oneMinuteBpm > peakBpm) {
    return { ok: false, message: "The one-minute reading should be lower than the peak reading." };
  }
  const drop = peakBpm - oneMinuteBpm;
  return {
    ok: true,
    drop,
    abnormal: drop <= HRR1_ABNORMAL_THRESHOLD,
    threshold: HRR1_ABNORMAL_THRESHOLD,
  };
}

/**
 * @param {object} input
 * @param {number} [input.age]
 * @param {number} [input.restHr]
 * @param {string} [input.formulaId]
 * @param {string} [input.method] "pctmax" | "karvonen"
 * @param {number} [input.maxHrOverride]
 * @param {number} [input.reps] drill repetitions
 * @param {number} [input.workSeconds] seconds of work per repetition
 * @param {number} [input.restSeconds] seconds of rest between repetitions
 * @param {number} [input.recoveryFraction] restart cue as a fraction of maximum
 * @param {number} [input.peakBpm] optional, for the HRR1 block
 * @param {number} [input.oneMinuteBpm] optional, for the HRR1 block
 * @returns {object} result or { error }
 */
export function computeBasketballZones({
  age,
  restHr,
  formulaId = "tanaka",
  method = "pctmax",
  maxHrOverride,
  reps = 10,
  workSeconds = 30,
  restSeconds = 60,
  recoveryFraction = DEFAULT_RECOVERY_FRACTION,
  peakBpm,
  oneMinuteBpm,
} = {}) {
  const useOverride = isNumber(maxHrOverride) && maxHrOverride > 0;

  if (useOverride) {
    if (maxHrOverride < MAX_HR_MIN || maxHrOverride > MAX_HR_MAX) {
      return {
        error: `A measured maximum heart rate should be between ${MAX_HR_MIN} and ${MAX_HR_MAX} bpm.`,
      };
    }
  } else if (!isNumber(age) || age < AGE_MIN || age > AGE_MAX) {
    return {
      error: `Enter an age between ${AGE_MIN} and ${AGE_MAX}, or a maximum heart rate you have measured.`,
    };
  }

  const maxHr = useOverride ? maxHrOverride : estimateMaxHr(age, formulaId);
  if (!isNumber(maxHr) || maxHr <= 0) {
    return { error: "Could not work out a maximum heart rate from that input." };
  }

  if (method === "karvonen") {
    if (!isNumber(restHr) || restHr < REST_HR_MIN || restHr > REST_HR_MAX) {
      return {
        error: `Karvonen needs a resting heart rate between ${REST_HR_MIN} and ${REST_HR_MAX} bpm, taken before you get out of bed.`,
      };
    }
    if (restHr >= maxHr) {
      return { error: "Resting heart rate must be lower than maximum heart rate." };
    }
  }

  if (!isNumber(reps) || reps < REPS_MIN || reps > REPS_MAX) {
    return { error: `Repetitions should be between ${REPS_MIN} and ${REPS_MAX}.` };
  }
  if (!isNumber(workSeconds) || workSeconds < WORK_SEC_MIN || workSeconds > WORK_SEC_MAX) {
    return { error: `Work per repetition should be between ${WORK_SEC_MIN} and ${WORK_SEC_MAX} seconds.` };
  }
  if (!isNumber(restSeconds) || restSeconds < REST_SEC_MIN || restSeconds > REST_SEC_MAX) {
    return { error: `Rest between repetitions should be between ${REST_SEC_MIN} and ${REST_SEC_MAX} seconds.` };
  }
  if (!isNumber(recoveryFraction) || recoveryFraction < 0.4 || recoveryFraction > 0.9) {
    return { error: "The restart cue should be between 40% and 90% of maximum heart rate." };
  }

  const zones = BASKETBALL_ZONES.map((zone) => ({
    ...zone,
    lowBpm: Math.round(targetBpm(zone.low, maxHr, restHr, method)),
    highBpm: Math.round(targetBpm(zone.high, maxHr, restHr, method)),
  }));

  const totalWorkSeconds = reps * workSeconds;
  const totalRestSeconds = (reps - 1) * restSeconds;
  const totalSeconds = totalWorkSeconds + totalRestSeconds;

  const formula = MAX_HR_FORMULAS.find((entry) => entry.id === formulaId);

  return {
    maxHr,
    maxHrRounded: Math.round(maxHr),
    usedMeasuredMax: useOverride,
    formulaLabel: useOverride ? "Measured in a test" : formula ? formula.label : "",
    formulaExpression: useOverride ? "" : formula ? formula.expression : "",
    method,
    restHr: method === "karvonen" ? restHr : null,
    reserve: method === "karvonen" ? maxHr - restHr : null,
    zones,
    gameLowBpm: Math.round(targetBpm(GAME_INTENSITY_LOW, maxHr, restHr, method)),
    gameHighBpm: Math.round(targetBpm(GAME_INTENSITY_HIGH, maxHr, restHr, method)),
    drill: {
      reps,
      workSeconds,
      restSeconds,
      workRestRatio: workSeconds > 0 ? restSeconds / workSeconds : NaN,
      totalWorkSeconds,
      totalRestSeconds,
      totalSeconds,
      restartCueBpm: Math.round(targetBpm(recoveryFraction, maxHr, restHr, method)),
      recoveryPct: Math.round(recoveryFraction * 100),
    },
    hrr1: evaluateHrr1(peakBpm, oneMinuteBpm),
  };
}
