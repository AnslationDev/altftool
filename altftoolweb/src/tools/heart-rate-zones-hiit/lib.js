/**
 * Work and recovery heart rate targets for interval training formats.
 *
 * HIIT is defined by two numbers, not five zones: how hard the work interval
 * is, and how far heart rate is allowed to fall before the next one. The
 * presets here are the published protocols most sessions are copied from:
 *
 *  - 4 x 4 (Helgerud/Hoff "Norwegian" protocol): 4 minutes at 90-95% of
 *    maximum heart rate, 3 minutes active recovery around 70%.
 *  - Tabata: 20 seconds of work, 10 seconds rest, 8 rounds — 4 minutes total.
 *    The original 1996 protocol was performed at about 170% of VO2 max, which
 *    in heart rate terms means every round finishes near maximum.
 *  - Billat 30/30: 30 seconds at the velocity of VO2 max, 30 seconds easy.
 *  - Sprint interval training: 30 seconds all-out with 4 minutes of recovery,
 *    the Wingate-style format used in low-volume HIIT research.
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

/** Interval presets. Fractions are of maximum heart rate (or of reserve). */
export const HIIT_FORMATS = [
  {
    id: "4x4",
    label: "4 × 4 minutes (Norwegian)",
    reps: 4,
    workSeconds: 240,
    restSeconds: 180,
    workLow: 0.9,
    workHigh: 0.95,
    recoveryLow: 0.6,
    recoveryHigh: 0.7,
    note: "The best-studied aerobic interval format. Recovery is active, not standing still.",
  },
  {
    id: "tabata",
    label: "Tabata 20/10 × 8",
    reps: 8,
    workSeconds: 20,
    restSeconds: 10,
    workLow: 0.9,
    workHigh: 1.0,
    recoveryLow: 0.75,
    recoveryHigh: 0.9,
    note: "Four minutes total. Heart rate never falls far in 10 seconds, so it climbs all the way through.",
  },
  {
    id: "30-30",
    label: "30/30 (Billat)",
    reps: 12,
    workSeconds: 30,
    restSeconds: 30,
    workLow: 0.9,
    workHigh: 1.0,
    recoveryLow: 0.7,
    recoveryHigh: 0.8,
    note: "Short work with equally short recoveries accumulates a lot of time near VO2 max.",
  },
  {
    id: "sit",
    label: "Sprint intervals 30 s / 4 min",
    reps: 4,
    workSeconds: 30,
    restSeconds: 240,
    workLow: 0.9,
    workHigh: 1.0,
    recoveryLow: 0.55,
    recoveryHigh: 0.65,
    note: "All-out sprints with long recoveries. Judge these by output — heart rate lags badly.",
  },
  {
    id: "custom",
    label: "Custom interval",
    reps: 6,
    workSeconds: 60,
    restSeconds: 60,
    workLow: 0.85,
    workHigh: 0.95,
    recoveryLow: 0.6,
    recoveryHigh: 0.7,
    note: "Set your own repetitions, work and recovery.",
  },
];

/** Reference bands used to describe any interval session. */
export const HIIT_BANDS = [
  {
    id: "easy",
    name: "Easy recovery",
    low: 0.5,
    high: 0.6,
    use: "Warm-up, cool-down and long recoveries between all-out sprints.",
  },
  {
    id: "active",
    name: "Active recovery",
    low: 0.6,
    high: 0.7,
    use: "Between-rep target for 4 × 4 and most long-interval work.",
  },
  {
    id: "threshold",
    name: "Threshold",
    low: 0.8,
    high: 0.9,
    use: "Cruise intervals and the floor of a short-recovery session.",
  },
  {
    id: "work",
    name: "Interval work",
    low: 0.9,
    high: 0.95,
    use: "The target band for aerobic intervals of 2 to 5 minutes.",
  },
  {
    id: "maximal",
    name: "Maximal",
    low: 0.95,
    high: 1.0,
    use: "Final rounds of very short intervals. Not a target you hold on purpose.",
  },
];

export const AGE_MIN = 10;
export const AGE_MAX = 100;
export const REST_HR_MIN = 30;
export const REST_HR_MAX = 120;
export const MAX_HR_MIN = 100;
export const MAX_HR_MAX = 230;
export const REPS_MIN = 1;
export const REPS_MAX = 30;
export const WORK_SEC_MIN = 5;
export const WORK_SEC_MAX = 600;
export const REST_SEC_MIN = 5;
export const REST_SEC_MAX = 600;
export const WARMUP_MIN = 0;
export const WARMUP_MAX = 30;

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

export const SECONDS_PER_MINUTE = 60;

/**
 * @param {object} input
 * @param {number} [input.age]
 * @param {number} [input.restHr]
 * @param {string} [input.formulaId]
 * @param {string} [input.method] "pctmax" | "karvonen"
 * @param {number} [input.maxHrOverride]
 * @param {string} [input.formatId] one of HIIT_FORMATS
 * @param {number} [input.reps] overrides the preset repetitions
 * @param {number} [input.workSeconds] custom format only
 * @param {number} [input.restSeconds] custom format only
 * @param {number} [input.warmupMinutes]
 * @param {number} [input.cooldownMinutes]
 * @returns {object} result or { error }
 */
export function computeHiitPlan({
  age,
  restHr,
  formulaId = "tanaka",
  method = "pctmax",
  maxHrOverride,
  formatId = "4x4",
  reps,
  workSeconds,
  restSeconds,
  warmupMinutes = 10,
  cooldownMinutes = 5,
} = {}) {
  const format = HIIT_FORMATS.find((entry) => entry.id === formatId);
  if (!format) return { error: "Choose an interval format." };

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

  const isCustom = format.id === "custom";
  const useReps = isNumber(reps) ? reps : format.reps;
  const useWork = isCustom && isNumber(workSeconds) ? workSeconds : format.workSeconds;
  const useRest = isCustom && isNumber(restSeconds) ? restSeconds : format.restSeconds;

  if (useReps < REPS_MIN || useReps > REPS_MAX) {
    return { error: `Repetitions should be between ${REPS_MIN} and ${REPS_MAX}.` };
  }
  if (useWork < WORK_SEC_MIN || useWork > WORK_SEC_MAX) {
    return { error: `Work intervals should be between ${WORK_SEC_MIN} and ${WORK_SEC_MAX} seconds.` };
  }
  if (useRest < REST_SEC_MIN || useRest > REST_SEC_MAX) {
    return { error: `Recovery should be between ${REST_SEC_MIN} and ${REST_SEC_MAX} seconds.` };
  }
  if (
    !isNumber(warmupMinutes) ||
    warmupMinutes < WARMUP_MIN ||
    warmupMinutes > WARMUP_MAX ||
    !isNumber(cooldownMinutes) ||
    cooldownMinutes < WARMUP_MIN ||
    cooldownMinutes > WARMUP_MAX
  ) {
    return {
      error: `Warm-up and cool-down should each be between ${WARMUP_MIN} and ${WARMUP_MAX} minutes.`,
    };
  }

  const totalWorkSeconds = useReps * useWork;
  const totalRestSeconds = (useReps - 1) * useRest;
  const intervalSeconds = totalWorkSeconds + totalRestSeconds;
  const warmSeconds = (warmupMinutes + cooldownMinutes) * SECONDS_PER_MINUTE;

  const bands = HIIT_BANDS.map((band) => ({
    ...band,
    lowBpm: Math.round(targetBpm(band.low, maxHr, restHr, method)),
    highBpm: Math.round(targetBpm(band.high, maxHr, restHr, method)),
  }));

  const comparison = HIIT_FORMATS.filter((entry) => entry.id !== "custom").map((entry) => {
    const work = entry.reps * entry.workSeconds;
    const rest = (entry.reps - 1) * entry.restSeconds;
    return {
      id: entry.id,
      label: entry.label,
      reps: entry.reps,
      workSeconds: entry.workSeconds,
      restSeconds: entry.restSeconds,
      totalWorkSeconds: work,
      totalSeconds: work + rest,
      workLowBpm: Math.round(targetBpm(entry.workLow, maxHr, restHr, method)),
      workHighBpm: Math.round(targetBpm(entry.workHigh, maxHr, restHr, method)),
    };
  });

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
    formatId: format.id,
    formatLabel: format.label,
    formatNote: format.note,
    isCustom,
    reps: useReps,
    workSeconds: useWork,
    restSeconds: useRest,
    workLowBpm: Math.round(targetBpm(format.workLow, maxHr, restHr, method)),
    workHighBpm: Math.round(targetBpm(format.workHigh, maxHr, restHr, method)),
    recoveryLowBpm: Math.round(targetBpm(format.recoveryLow, maxHr, restHr, method)),
    recoveryHighBpm: Math.round(targetBpm(format.recoveryHigh, maxHr, restHr, method)),
    workRestRatio: useWork > 0 ? useRest / useWork : NaN,
    totalWorkSeconds,
    totalRestSeconds,
    intervalSeconds,
    warmupMinutes,
    cooldownMinutes,
    totalSessionSeconds: intervalSeconds + warmSeconds,
    bands,
    comparison,
  };
}
