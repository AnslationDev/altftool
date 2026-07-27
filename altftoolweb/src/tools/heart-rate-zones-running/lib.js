/**
 * Heart rate training zones for running, plus matching pace bands.
 *
 * Maximum heart rate is estimated from age with one of three published
 * regressions, then five zones are laid out either as a flat percentage of
 * maximum heart rate or with the Karvonen heart rate reserve method.
 *
 * The pace bands come from Joe Friel's run pace zones, which are expressed as a
 * percentage of functional threshold pace (the pace you can hold for roughly an
 * hour). A higher percentage means a slower pace, because pace is a duration.
 */

/** Age-predicted maximum heart rate formulas. */
export const MAX_HR_FORMULAS = [
  {
    id: "tanaka",
    label: "Tanaka",
    expression: "208 − 0.7 × age",
    // Tanaka, Monahan & Seals (2001) — meta-analysis of 351 studies, ~19,000 people.
    compute: (age) => 208 - 0.7 * age,
    note: "Tracks measured maximum heart rate better than 220 − age across the whole age range.",
  },
  {
    id: "fox",
    label: "Fox",
    expression: "220 − age",
    // Fox, Naughton & Haskell (1971) — the familiar rule of thumb.
    compute: (age) => 220 - age,
    note: "The famous rule of thumb. It overestimates in the young and underestimates in older runners.",
  },
  {
    id: "gulati",
    label: "Gulati (women)",
    expression: "206 − 0.88 × age",
    // Gulati et al. (2010) — derived from 5,437 women.
    compute: (age) => 206 - 0.88 * age,
    note: "Derived from women only; 220 − age was built largely on men and runs high for women.",
  },
];

/** Zone method: flat percentage of maximum HR, or Karvonen heart rate reserve. */
export const ZONE_METHODS = [
  { id: "pctmax", label: "% of maximum heart rate" },
  { id: "karvonen", label: "Karvonen (heart rate reserve)" },
];

/**
 * Five running zones. `low`/`high` are fractions of maximum heart rate (or of
 * heart rate reserve under Karvonen). `paceLow`/`paceHigh` are Joe Friel's run
 * pace zones as a multiple of threshold pace — larger multiple, slower pace.
 */
export const RUN_ZONES = [
  {
    id: 1,
    name: "Zone 1",
    title: "Recovery jog",
    low: 0.5,
    high: 0.6,
    paceFast: 1.29,
    paceSlow: 1.4,
    purpose: "Shakeout runs and the day after a hard session. Circulation without cost.",
    talk: "You can hold a full conversation, or sing.",
    session: "20–40 min easy",
  },
  {
    id: 2,
    name: "Zone 2",
    title: "Aerobic base",
    low: 0.6,
    high: 0.7,
    paceFast: 1.14,
    paceSlow: 1.29,
    purpose:
      "Where most weekly volume belongs. Builds capillaries, mitochondria and fat oxidation.",
    talk: "Full sentences, nose breathing still possible.",
    session: "40 min – 3 hours",
  },
  {
    id: 3,
    name: "Zone 3",
    title: "Steady / marathon effort",
    low: 0.7,
    high: 0.8,
    paceFast: 1.06,
    paceSlow: 1.14,
    purpose:
      "Marathon-specific work. Useful in blocks, but easy to overuse — it tires you without the threshold payoff.",
    talk: "Short sentences only.",
    session: "20–90 min",
  },
  {
    id: 4,
    name: "Zone 4",
    title: "Threshold / tempo",
    low: 0.8,
    high: 0.9,
    paceFast: 0.99,
    paceSlow: 1.06,
    purpose: "Raises the pace you can hold before lactate accumulates. Classic tempo and cruise intervals.",
    talk: "A few words at a time.",
    session: "20–40 min total, often 2 × 15 min",
  },
  {
    id: 5,
    name: "Zone 5",
    title: "VO2 max / speed",
    low: 0.9,
    high: 1,
    paceFast: 0.9,
    paceSlow: 0.99,
    purpose: "Pushes maximum oxygen uptake and running economy. Small doses only.",
    talk: "No talking.",
    session: "3–8 min of work, e.g. 6 × 800 m",
  },
];

export const AGE_MIN = 10;
export const AGE_MAX = 100;
export const REST_HR_MIN = 30;
export const REST_HR_MAX = 120;
export const MAX_HR_MIN = 100;
export const MAX_HR_MAX = 230;
/** Threshold pace sanity limits in seconds per kilometre or mile. */
export const PACE_SEC_MIN = 120;
export const PACE_SEC_MAX = 900;

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Age-predicted maximum heart rate. Returns NaN for unusable input. */
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

/** Seconds to a m:ss pace string. */
export function formatPace(seconds) {
  if (!isNumber(seconds) || seconds <= 0) return "—";
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

/** Minutes + seconds fields to total seconds. */
export function paceToSeconds(minutes, seconds) {
  const m = isNumber(minutes) ? minutes : NaN;
  const s = isNumber(seconds) ? seconds : 0;
  if (!isNumber(m)) return NaN;
  return m * 60 + s;
}

/**
 * @param {object} input
 * @param {number} input.age
 * @param {number} [input.restHr] required for Karvonen
 * @param {string} [input.formulaId]
 * @param {string} [input.method] "pctmax" | "karvonen"
 * @param {number} [input.maxHrOverride] a measured maximum heart rate
 * @param {number} [input.thresholdPaceSec] threshold pace, seconds per km or mile
 * @returns {object} result or { error }
 */
export function computeRunningZones({
  age,
  restHr,
  formulaId = "tanaka",
  method = "pctmax",
  maxHrOverride,
  thresholdPaceSec,
} = {}) {
  const useOverride = isNumber(maxHrOverride) && maxHrOverride > 0;

  if (useOverride) {
    if (maxHrOverride < MAX_HR_MIN || maxHrOverride > MAX_HR_MAX) {
      return {
        error: `A measured maximum heart rate should be between ${MAX_HR_MIN} and ${MAX_HR_MAX} bpm.`,
      };
    }
  } else if (!isNumber(age) || age < AGE_MIN || age > AGE_MAX) {
    return { error: `Enter an age between ${AGE_MIN} and ${AGE_MAX}, or a measured maximum heart rate.` };
  }

  const maxHr = useOverride ? maxHrOverride : estimateMaxHr(age, formulaId);
  if (!isNumber(maxHr) || maxHr <= 0) {
    return { error: "Could not work out a maximum heart rate from that input." };
  }

  if (method === "karvonen") {
    if (!isNumber(restHr) || restHr < REST_HR_MIN || restHr > REST_HR_MAX) {
      return {
        error: `Karvonen needs a resting heart rate between ${REST_HR_MIN} and ${REST_HR_MAX} bpm — measure it before getting out of bed.`,
      };
    }
    if (restHr >= maxHr) {
      return { error: "Resting heart rate must be lower than maximum heart rate." };
    }
  }

  let paceOk = false;
  if (isNumber(thresholdPaceSec) && thresholdPaceSec > 0) {
    if (thresholdPaceSec < PACE_SEC_MIN || thresholdPaceSec > PACE_SEC_MAX) {
      return {
        error: `Threshold pace should be between ${formatPace(PACE_SEC_MIN)} and ${formatPace(
          PACE_SEC_MAX,
        )} per unit of distance.`,
      };
    }
    paceOk = true;
  }

  const zones = RUN_ZONES.map((zone) => ({
    ...zone,
    lowBpm: Math.round(targetBpm(zone.low, maxHr, restHr, method)),
    highBpm: Math.round(targetBpm(zone.high, maxHr, restHr, method)),
    fastPaceSec: paceOk ? thresholdPaceSec * zone.paceFast : NaN,
    slowPaceSec: paceOk ? thresholdPaceSec * zone.paceSlow : NaN,
  }));

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
    paceOk,
    thresholdPaceSec: paceOk ? thresholdPaceSec : NaN,
    zones,
  };
}
