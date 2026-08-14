/**
 * CPR compression pacing maths.
 *
 * THIS IS A PRACTICE AID, NOT A CLINICAL TOOL. In a real emergency call your
 * local emergency number first and follow the dispatcher's instructions.
 *
 * Rule sources — American Heart Association 2020 Guidelines for CPR and ECC
 * and the European Resuscitation Council 2021 Guidelines, which agree on:
 *  - a compression rate of 100 to 120 per minute;
 *  - adult compression depth of at least 5 cm and no more than 6 cm;
 *  - 30 compressions to 2 breaths for adults, and for children and infants
 *    with a single rescuer; 15:2 for children and infants with two rescuers;
 *  - continuous compressions with one breath every 6 seconds once an
 *    advanced airway is in place;
 *  - interruptions for ventilation kept under 10 seconds;
 *  - a chest compression fraction of at least 60%;
 *  - swapping the compressor about every 2 minutes to limit fatigue.
 */

export const GUIDELINE_RATE_MIN = 100;
export const GUIDELINE_RATE_MAX = 120;
export const MAX_VENTILATION_PAUSE_SECONDS = 10;
export const TARGET_COMPRESSION_FRACTION = 60;
export const DEFAULT_SWITCH_MINUTES = 2;

/** Absolute input limits — outside these the metronome would be meaningless. */
export const MIN_RATE = 60;
export const MAX_RATE = 200;

export const SCENARIOS = [
  {
    id: "adult",
    label: "Adult, one or two rescuers",
    compressions: 30,
    breaths: 2,
    continuous: false,
    depth: "At least 5 cm and no more than 6 cm",
    handPosition: "Heel of one hand on the lower half of the breastbone, second hand on top",
  },
  {
    id: "child-single",
    label: "Child, single rescuer",
    compressions: 30,
    breaths: 2,
    continuous: false,
    depth: "About one third of the chest depth, roughly 5 cm",
    handPosition: "One or two hands on the lower half of the breastbone",
  },
  {
    id: "child-two",
    label: "Child, two rescuers",
    compressions: 15,
    breaths: 2,
    continuous: false,
    depth: "About one third of the chest depth, roughly 5 cm",
    handPosition: "One or two hands on the lower half of the breastbone",
  },
  {
    id: "infant-single",
    label: "Infant, single rescuer",
    compressions: 30,
    breaths: 2,
    continuous: false,
    depth: "About one third of the chest depth, roughly 4 cm",
    handPosition: "Two fingers just below the nipple line",
  },
  {
    id: "infant-two",
    label: "Infant, two rescuers",
    compressions: 15,
    breaths: 2,
    continuous: false,
    depth: "About one third of the chest depth, roughly 4 cm",
    handPosition: "Two thumbs encircling the chest",
  },
  {
    id: "hands-only",
    label: "Hands-only adult CPR",
    compressions: 0,
    breaths: 0,
    continuous: true,
    breathEverySeconds: null,
    depth: "At least 5 cm and no more than 6 cm",
    handPosition: "Heel of one hand on the lower half of the breastbone, second hand on top",
  },
  {
    id: "advanced-airway",
    label: "Advanced airway in place",
    compressions: 0,
    breaths: 0,
    continuous: true,
    breathEverySeconds: 6,
    depth: "At least 5 cm and no more than 6 cm",
    handPosition: "Heel of one hand on the lower half of the breastbone, second hand on top",
  },
];

const round = (value, dp = 1) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

export function getScenario(id) {
  return SCENARIOS.find((item) => item.id === id) || SCENARIOS[0];
}

/**
 * Timing for one compression cycle at a given rate.
 *
 * @param {object} input
 * @param {number} input.bpm                compressions per minute
 * @param {string} input.scenarioId
 * @param {number} input.breathPauseSeconds pause used to deliver the breaths
 * @param {number} input.switchMinutes      how often the compressor swaps
 * @returns {object} timing, or { error }
 */
export function computeCprTiming({
  bpm,
  scenarioId = "adult",
  breathPauseSeconds = 6,
  switchMinutes = DEFAULT_SWITCH_MINUTES,
} = {}) {
  const rate = Number(bpm);
  const pause = Number(breathPauseSeconds);
  const switchMins = Number(switchMinutes);

  if (!Number.isFinite(rate)) return { error: "Enter the compression rate as a number." };
  if (rate < MIN_RATE || rate > MAX_RATE) {
    return { error: `Enter a compression rate between ${MIN_RATE} and ${MAX_RATE} per minute.` };
  }
  if (!Number.isFinite(pause) || pause < 0 || pause > 30) {
    return { error: "Enter a ventilation pause between 0 and 30 seconds." };
  }
  if (!Number.isFinite(switchMins) || switchMins < 1 || switchMins > 10) {
    return { error: "Enter a rescuer switch interval between 1 and 10 minutes." };
  }

  const scenario = getScenario(scenarioId);
  const intervalMs = 60000 / rate;
  const switchSeconds = switchMins * 60;

  let compressionsPerCycle;
  let compressionPhaseSeconds;
  let breathPause;

  if (scenario.continuous) {
    compressionsPerCycle = Math.max(1, Math.round(rate * switchMins));
    compressionPhaseSeconds = switchSeconds;
    breathPause = 0;
  } else {
    compressionsPerCycle = scenario.compressions;
    compressionPhaseSeconds = (compressionsPerCycle * 60) / rate;
    breathPause = pause;
  }

  const cycleSeconds = compressionPhaseSeconds + breathPause;
  const compressionFraction = cycleSeconds > 0 ? (compressionPhaseSeconds / cycleSeconds) * 100 : 0;
  const cyclesPerSwitch = cycleSeconds > 0 ? switchSeconds / cycleSeconds : 0;
  const compressionsPerSwitch = Math.floor(cyclesPerSwitch) * compressionsPerCycle;

  const warnings = [];
  if (rate < GUIDELINE_RATE_MIN || rate > GUIDELINE_RATE_MAX) {
    warnings.push(
      `Guidelines put the compression rate between ${GUIDELINE_RATE_MIN} and ${GUIDELINE_RATE_MAX} per minute; ${Math.round(rate)} is outside that range.`,
    );
  }
  if (!scenario.continuous && breathPause > MAX_VENTILATION_PAUSE_SECONDS) {
    warnings.push(
      `Interruptions for ventilation should stay under ${MAX_VENTILATION_PAUSE_SECONDS} seconds — this pause is ${round(breathPause)} seconds.`,
    );
  }
  if (compressionFraction < TARGET_COMPRESSION_FRACTION) {
    warnings.push(
      `Only ${round(compressionFraction)}% of the cycle is spent compressing; the target chest compression fraction is at least ${TARGET_COMPRESSION_FRACTION}%.`,
    );
  }

  return {
    bpm: Math.round(rate),
    scenarioId: scenario.id,
    scenarioLabel: scenario.label,
    continuous: scenario.continuous,
    depth: scenario.depth,
    handPosition: scenario.handPosition,
    breathEverySeconds: scenario.breathEverySeconds ?? null,
    intervalMs: round(intervalMs, 2),
    compressionsPerCycle,
    compressionPhaseSeconds: round(compressionPhaseSeconds, 2),
    breathPauseSeconds: round(breathPause, 2),
    cycleSeconds: round(cycleSeconds, 2),
    compressionFraction: round(compressionFraction),
    switchMinutes: switchMins,
    switchSeconds,
    cyclesPerSwitch: Math.floor(cyclesPerSwitch),
    compressionsPerSwitch,
    warnings,
  };
}

/**
 * Where you are in the cycle at a given elapsed time. Pure — the UI passes in
 * its own clock reading.
 *
 * @param {number} elapsedSeconds  seconds since the metronome started
 * @param {object} timing          the object returned by computeCprTiming
 * @returns {object|null}
 */
export function cprPhaseAt(elapsedSeconds, timing) {
  const elapsed = Number(elapsedSeconds);
  if (!timing || timing.error || !Number.isFinite(elapsed) || elapsed < 0) return null;
  if (!(timing.cycleSeconds > 0) || !(timing.intervalMs > 0)) return null;

  const cycleIndex = Math.floor(elapsed / timing.cycleSeconds);
  const withinCycle = elapsed - cycleIndex * timing.cycleSeconds;
  const compressing = withinCycle < timing.compressionPhaseSeconds;

  const compressionIndexInCycle = compressing
    ? Math.min(
        timing.compressionsPerCycle - 1,
        Math.floor(withinCycle / (timing.intervalMs / 1000)),
      )
    : timing.compressionsPerCycle - 1;

  const totalCompressions = compressing
    ? cycleIndex * timing.compressionsPerCycle + compressionIndexInCycle + 1
    : (cycleIndex + 1) * timing.compressionsPerCycle;

  const breathSecondsLeft = compressing
    ? 0
    : Math.max(0, timing.cycleSeconds - withinCycle);

  const sessionMetrics = cprSessionMetricsAt(elapsed, timing, totalCompressions);

  return {
    cycleIndex,
    cycleNumber: cycleIndex + 1,
    phase: compressing ? "compress" : "breathe",
    compressionInCycle: compressionIndexInCycle + 1,
    totalCompressions,
    breathSecondsLeft: round(breathSecondsLeft, 1),
    ...sessionMetrics,
  };
}

/**
 * Metrics that belong to the complete practice session rather than the current
 * pacing segment. The UI starts a new segment when BPM or cycle timing changes,
 * but keeps passing the same monotonic session elapsed time here so the rescuer
 * swap countdown and measured rate do not restart with every edit.
 */
export function cprSessionMetricsAt(sessionElapsedSeconds, timing, totalCompressions) {
  const elapsed = Number(sessionElapsedSeconds);
  const total = Number(totalCompressions);
  if (
    !timing ||
    timing.error ||
    !Number.isFinite(elapsed) ||
    elapsed < 0 ||
    !Number.isFinite(total) ||
    total < 0
  ) {
    return null;
  }

  const switchElapsed = timing.switchSeconds > 0 ? elapsed % timing.switchSeconds : 0;
  return {
    secondsToSwitch: round(Math.max(0, timing.switchSeconds - switchElapsed), 1),
    // Below ~1s of data the ratio is dominated by rounding noise (e.g. 1 compression
    // over 0.05s reads as 1200/min) — withhold the figure until it means something.
    averageRate: elapsed >= 1 ? round((total / elapsed) * 60) : null,
  };
}
