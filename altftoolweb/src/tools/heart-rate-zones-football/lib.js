/**
 * Heart rate zones for football (soccer), plus an aerobic interval planner.
 *
 * Football is intermittent: players spend most of a match well above an
 * endurance runner's steady state, punctuated by walking and jogging. Reviews
 * of match heart rate data (Bangsbo; Stolen et al.) put the mean match
 * intensity at roughly 85% of maximum heart rate, equivalent to about 70% of
 * VO2 max, with long stretches above 85%.
 *
 * The interval planner implements the Helgerud/Hoff aerobic interval protocol
 * used in football research: 4 x 4 minutes at 90-95% of maximum heart rate,
 * separated by 3 minutes of active recovery at around 70%.
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

/** Football training zones as fractions of maximum heart rate. */
export const FOOTBALL_ZONES = [
  {
    id: 1,
    name: "Zone 1",
    title: "Regeneration",
    low: 0.5,
    high: 0.65,
    drill: "Day-after-match jog, mobility, walking possession drills",
    purpose: "Clears the legs without adding load. Used the day after a match.",
  },
  {
    id: 2,
    name: "Zone 2",
    title: "Extensive aerobic",
    low: 0.65,
    high: 0.75,
    drill: "Large-pitch possession (8v8 and up), technical circuits",
    purpose: "Builds the aerobic base that lets you repeat sprints late in a game.",
  },
  {
    id: 3,
    name: "Zone 3",
    title: "Match average",
    low: 0.75,
    high: 0.85,
    drill: "6v6 to 8v8 small-sided games, pattern play at tempo",
    purpose: "Where a match actually averages out. Long possession games sit here.",
  },
  {
    id: 4,
    name: "Zone 4",
    title: "Aerobic power",
    low: 0.85,
    high: 0.92,
    drill: "4v4 small-sided games, 4 × 4 min runs, high-tempo pressing drills",
    purpose: "The zone that lifts VO2 max. 4v4 games reliably hold players here.",
  },
  {
    id: 5,
    name: "Zone 5",
    title: "Speed and repeated sprint",
    low: 0.92,
    high: 1,
    drill: "Repeated 20–40 m sprints, shuttle sets, 1v1 duels",
    purpose: "Sprint quality and lactate tolerance. Short exposures, long rests.",
  },
];

/** Reviewed match data puts mean football match intensity near this fraction. */
export const MATCH_MEAN_FRACTION = 0.85;
/** Corresponding oxygen uptake, roughly 70% of VO2 max. */
export const MATCH_MEAN_VO2_PCT = 70;

/** Helgerud/Hoff aerobic interval protocol defaults. */
export const INTERVAL_PROTOCOL = {
  reps: 4,
  workMinutes: 4,
  recoveryMinutes: 3,
  workLow: 0.9,
  workHigh: 0.95,
  recoveryTarget: 0.7,
};

export const AGE_MIN = 10;
export const AGE_MAX = 100;
export const REST_HR_MIN = 30;
export const REST_HR_MAX = 120;
export const MAX_HR_MIN = 100;
export const MAX_HR_MAX = 230;
export const REPS_MIN = 1;
export const REPS_MAX = 12;
export const WORK_MIN = 0.5;
export const WORK_MAX = 10;
export const RECOVERY_MIN = 0.5;
export const RECOVERY_MAX = 8;

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

/**
 * @param {object} input
 * @param {number} [input.age]
 * @param {number} [input.restHr]
 * @param {string} [input.formulaId]
 * @param {string} [input.method] "pctmax" | "karvonen"
 * @param {number} [input.maxHrOverride]
 * @param {number} [input.reps] interval repetitions
 * @param {number} [input.workMinutes] minutes per work interval
 * @param {number} [input.recoveryMinutes] minutes of active recovery between reps
 * @returns {object} result or { error }
 */
export function computeFootballZones({
  age,
  restHr,
  formulaId = "tanaka",
  method = "pctmax",
  maxHrOverride,
  reps = INTERVAL_PROTOCOL.reps,
  workMinutes = INTERVAL_PROTOCOL.workMinutes,
  recoveryMinutes = INTERVAL_PROTOCOL.recoveryMinutes,
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
    return { error: `Interval repetitions should be between ${REPS_MIN} and ${REPS_MAX}.` };
  }
  if (!isNumber(workMinutes) || workMinutes < WORK_MIN || workMinutes > WORK_MAX) {
    return { error: `Work intervals should be between ${WORK_MIN} and ${WORK_MAX} minutes.` };
  }
  if (
    !isNumber(recoveryMinutes) ||
    recoveryMinutes < RECOVERY_MIN ||
    recoveryMinutes > RECOVERY_MAX
  ) {
    return {
      error: `Active recovery should be between ${RECOVERY_MIN} and ${RECOVERY_MAX} minutes.`,
    };
  }

  const zones = FOOTBALL_ZONES.map((zone) => ({
    ...zone,
    lowBpm: Math.round(targetBpm(zone.low, maxHr, restHr, method)),
    highBpm: Math.round(targetBpm(zone.high, maxHr, restHr, method)),
  }));

  const totalWorkMinutes = reps * workMinutes;
  const totalRecoveryMinutes = (reps - 1) * recoveryMinutes;
  const totalSessionMinutes = totalWorkMinutes + totalRecoveryMinutes;

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
    matchMeanBpm: Math.round(targetBpm(MATCH_MEAN_FRACTION, maxHr, restHr, method)),
    matchMeanPct: Math.round(MATCH_MEAN_FRACTION * 100),
    matchMeanVo2Pct: MATCH_MEAN_VO2_PCT,
    interval: {
      reps,
      workMinutes,
      recoveryMinutes,
      workLowBpm: Math.round(targetBpm(INTERVAL_PROTOCOL.workLow, maxHr, restHr, method)),
      workHighBpm: Math.round(targetBpm(INTERVAL_PROTOCOL.workHigh, maxHr, restHr, method)),
      recoveryBpm: Math.round(targetBpm(INTERVAL_PROTOCOL.recoveryTarget, maxHr, restHr, method)),
      totalWorkMinutes,
      totalRecoveryMinutes,
      totalSessionMinutes,
    },
  };
}
