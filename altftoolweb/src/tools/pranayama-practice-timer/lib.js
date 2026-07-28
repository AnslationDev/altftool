/**
 * Pranayama phase pacing.
 *
 * Every pattern is stored as a ratio of the four phases of one breath:
 *   puraka  (inhale) : antara kumbhaka (hold in) : rechaka (exhale) : bahya kumbhaka (hold out)
 * Multiplying the ratio by a unit length in seconds gives the actual phase
 * lengths, which is exactly how these practices are taught — the ratio is fixed
 * and the unit grows as capacity improves.
 *
 * Informational pacing support only. Breath retention is not appropriate for
 * everyone; see the notes on each pattern.
 */

export const PHASE_KEYS = ["inhale", "holdIn", "exhale", "holdOut"];

export const PHASE_LABELS = {
  inhale: "Inhale",
  holdIn: "Hold in",
  exhale: "Exhale",
  holdOut: "Hold out",
};

/** Ratio patterns. `ratio` is [inhale, holdIn, exhale, holdOut]. */
export const PATTERNS = [
  {
    id: "sama-vritti",
    name: "Sama Vritti (equal breathing)",
    ratio: [1, 0, 1, 0],
    defaultUnit: 4,
    note: "Equal in, equal out. The safest starting point — no retention at all.",
  },
  {
    id: "extended-exhale",
    name: "Extended exhale (1:2)",
    ratio: [1, 0, 2, 0],
    defaultUnit: 4,
    note: "A longer exhale than inhale. The pattern most often used to settle the nervous system.",
  },
  {
    id: "box",
    name: "Box breathing (samavritti with holds)",
    ratio: [1, 1, 1, 1],
    defaultUnit: 4,
    note: "Equal inhale, hold, exhale, hold. Widely taught for focus under pressure.",
  },
  {
    id: "nadi-shodhana",
    name: "Nadi Shodhana / Anulom Vilom",
    ratio: [1, 0, 2, 0],
    defaultUnit: 4,
    note: "Alternate nostril breathing: inhale left, exhale right, inhale right, exhale left.",
  },
  {
    id: "ujjayi",
    name: "Ujjayi (ocean breath)",
    ratio: [2, 0, 3, 0],
    defaultUnit: 2,
    note: "Soft constriction at the throat gives an audible, even breath. No retention.",
  },
  {
    id: "bhramari",
    name: "Bhramari (humming bee)",
    ratio: [1, 0, 2, 0],
    defaultUnit: 4,
    note: "Inhale quietly, hum steadily through the whole exhale with the ears lightly closed.",
  },
  {
    id: "four-seven-eight",
    name: "4-7-8 relaxing breath",
    ratio: [4, 7, 8, 0],
    defaultUnit: 1,
    note: "Popularised by Dr Andrew Weil, usually taught as four cycles at a time.",
  },
  {
    id: "classic-1-4-2",
    name: "Classic yogic ratio 1:4:2",
    ratio: [1, 4, 2, 0],
    defaultUnit: 3,
    note: "The traditional puraka:kumbhaka:rechaka ratio. Long retention — only with teacher guidance.",
  },
];

/** Guard rails on the unit length, in seconds. */
export const MIN_UNIT_SECONDS = 0.5;
export const MAX_UNIT_SECONDS = 20;
/** No single phase should exceed this in a self-guided practice, in seconds. */
export const MAX_PHASE_SECONDS = 60;
export const MAX_SESSION_MINUTES = 120;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Look up a pattern by id. */
export function getPattern(id) {
  return PATTERNS.find((pattern) => pattern.id === id) || null;
}

/**
 * Turn a pattern plus a unit length into concrete phase seconds.
 *
 * @param {object} input
 * @param {string} [input.patternId]
 * @param {number} input.unitSeconds
 * @param {number[]} [input.customRatio]  Overrides the pattern ratio.
 * @returns {object} result or { error }
 */
export function computeCycle({ patternId, unitSeconds, customRatio } = {}) {
  const ratio = customRatio || getPattern(patternId)?.ratio;
  if (!Array.isArray(ratio) || ratio.length !== 4) {
    return { error: "Choose a breathing pattern." };
  }
  if (!isNum(unitSeconds)) return { error: "The count length must be a number of seconds." };
  if (unitSeconds < MIN_UNIT_SECONDS || unitSeconds > MAX_UNIT_SECONDS) {
    return {
      error: `Count length should be between ${MIN_UNIT_SECONDS} and ${MAX_UNIT_SECONDS} seconds.`,
    };
  }
  if (ratio.some((part) => !isNum(part) || part < 0)) {
    return { error: "Ratio parts must be zero or positive numbers." };
  }

  const seconds = ratio.map((part) => part * unitSeconds);
  const cycleSeconds = seconds.reduce((sum, value) => sum + value, 0);

  if (cycleSeconds <= 0) {
    return { error: "At least one phase must have a length greater than zero." };
  }
  if (seconds.some((value) => value > MAX_PHASE_SECONDS)) {
    return {
      error: `A single phase longer than ${MAX_PHASE_SECONDS} seconds is beyond self-guided practice — shorten the count.`,
    };
  }

  const phases = PHASE_KEYS.map((key, index) => ({
    key,
    label: PHASE_LABELS[key],
    seconds: seconds[index],
    ratio: ratio[index],
  })).filter((phase) => phase.seconds > 0);

  let offset = 0;
  const timeline = phases.map((phase) => {
    const entry = { ...phase, startsAt: offset, endsAt: offset + phase.seconds };
    offset += phase.seconds;
    return entry;
  });

  const inhaleSeconds = seconds[0];
  const holdSeconds = seconds[1] + seconds[3];
  const exhaleSeconds = seconds[2];

  return {
    ratio,
    unitSeconds,
    seconds,
    phases,
    timeline,
    cycleSeconds,
    breathsPerMinute: 60 / cycleSeconds,
    inhaleSeconds,
    exhaleSeconds,
    holdSeconds,
    retentionShare: holdSeconds / cycleSeconds,
    exhaleLongerThanInhale: exhaleSeconds > inhaleSeconds,
  };
}

/**
 * Fit whole breath cycles into a session length.
 *
 * @param {object} input
 * @param {number} input.cycleSeconds
 * @param {number} input.minutes
 * @returns {object} result or { error }
 */
export function planSession({ cycleSeconds, minutes } = {}) {
  if (!isNum(cycleSeconds) || cycleSeconds <= 0) {
    return { error: "Work out the cycle length before planning a session." };
  }
  if (!isNum(minutes) || minutes <= 0) {
    return { error: "Session length must be more than zero minutes." };
  }
  if (minutes > MAX_SESSION_MINUTES) {
    return { error: `Sessions longer than ${MAX_SESSION_MINUTES} minutes are outside this planner.` };
  }

  const targetSeconds = minutes * 60;
  const rounds = Math.floor(targetSeconds / cycleSeconds);
  const usedSeconds = rounds * cycleSeconds;

  return {
    targetSeconds,
    rounds,
    usedSeconds,
    leftoverSeconds: targetSeconds - usedSeconds,
    coveragePercent: targetSeconds > 0 ? (usedSeconds / targetSeconds) * 100 : 0,
  };
}

/**
 * Which phase are we in, and how far through it, at a given elapsed time?
 * Pure — the elapsed time is supplied by the caller, never read from the clock here.
 *
 * @param {object[]} timeline  From computeCycle().timeline
 * @param {number} cycleSeconds
 * @param {number} elapsedSeconds
 * @returns {object} { round, phase, phaseIndex, secondsIntoPhase, secondsLeftInPhase, progress }
 */
export function phaseAtElapsed(timeline, cycleSeconds, elapsedSeconds) {
  if (!Array.isArray(timeline) || timeline.length === 0 || !isNum(cycleSeconds) || cycleSeconds <= 0) {
    return null;
  }
  if (!isNum(elapsedSeconds) || elapsedSeconds < 0) return null;

  const round = Math.floor(elapsedSeconds / cycleSeconds) + 1;
  const within = elapsedSeconds % cycleSeconds;
  let index = timeline.findIndex((phase) => within < phase.endsAt);
  if (index < 0) index = timeline.length - 1;
  const phase = timeline[index];
  const secondsIntoPhase = within - phase.startsAt;

  return {
    round,
    phase,
    phaseIndex: index,
    secondsIntoPhase,
    secondsLeftInPhase: Math.max(0, phase.seconds - secondsIntoPhase),
    progress: phase.seconds > 0 ? secondsIntoPhase / phase.seconds : 0,
  };
}

/** Format seconds as m:ss. */
export function formatDuration(totalSeconds) {
  if (!isNum(totalSeconds) || totalSeconds < 0) return "—";
  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
