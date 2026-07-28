/**
 * Panic breathing pacer.
 *
 * Why an extended exhale: heart rate rises during inhalation and falls during
 * exhalation (respiratory sinus arrhythmia), so lengthening the exhale relative
 * to the inhale increases vagal - parasympathetic - influence. Slow-breathing
 * research puts the "resonance" rate that maximises heart-rate variability at
 * roughly 4.5-6.5 breaths per minute for most adults, commonly rounded to 6
 * (Lehrer & Gevirtz, Front Psychol 2014).
 *
 * Why the rate ramps down instead of dropping straight to 6: in acute anxiety
 * breathing is often 20-30 breaths a minute, and being told to breathe at 6
 * immediately is usually impossible. Pace-matching - starting near the current
 * rate and slowing gradually - is standard practice in breathing retraining for
 * panic and hyperventilation.
 *
 * Why NOT "take a deep breath": over-breathing during panic lowers arterial CO2
 * (hypocapnia), which produces the tingling, dizziness and chest tightness that
 * make panic worse. The aim here is slower and smaller breaths, through the
 * nose where possible - not bigger ones.
 *
 * Nothing in this module is a treatment. It contains no clock reads: elapsed
 * time is always passed in.
 */

/** Normal resting adult respiratory rate is about 12-20 breaths per minute. */
export const NORMAL_RESTING_BPM_LOW = 12;
export const NORMAL_RESTING_BPM_HIGH = 20;
/** Rate that maximises heart-rate variability for most adults. */
export const RESONANCE_BPM = 6;

export const MIN_START_BPM = 6;
export const MAX_START_BPM = 30;
export const MIN_TARGET_BPM = 4;
export const MAX_TARGET_BPM = 12;
export const MIN_MINUTES = 1;
export const MAX_MINUTES = 15;

export const DEFAULT_START_BPM = 18;
export const DEFAULT_TARGET_BPM = 6;
export const DEFAULT_MINUTES = 3;

/**
 * Breathing shapes, expressed as ratio parts of one breath cycle.
 * The chosen breathing rate decides how long the cycle is; the ratio decides
 * how that time is divided.
 */
export const PATTERNS = {
  settle: {
    key: "settle",
    label: "Settle 4:6",
    parts: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 },
    note: "Exhale half again as long as the inhale. The easiest place to start when breathing is fast.",
  },
  longExhale: {
    key: "longExhale",
    label: "Long exhale 4:8",
    parts: { inhale: 4, holdIn: 0, exhale: 8, holdOut: 0 },
    note: "Exhale twice the inhale - the strongest downshift, but only once the breath is under control.",
  },
  even: {
    key: "even",
    label: "Even 5:5",
    parts: { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 },
    note: "Equal in and out. Useful if a long exhale feels like running out of air.",
  },
  box: {
    key: "box",
    label: "Box 4:2:6:2",
    parts: { inhale: 4, holdIn: 2, exhale: 6, holdOut: 2 },
    note: "Short pauses at the top and bottom. Skip this one if breath holds make you anxious.",
  },
};

export const PHASE_LABELS = {
  inhale: "Breathe in",
  holdIn: "Hold",
  exhale: "Breathe out",
  holdOut: "Rest",
};

export const PHASE_INSTRUCTIONS = {
  inhale: "Small, quiet breath in through the nose. Do not fill your lungs.",
  holdIn: "Pause. Shoulders down, jaw loose.",
  exhale: "Long, slow breath out through pursed lips. Let it empty.",
  holdOut: "Rest here. There is no hurry to breathe in.",
};

const PHASE_ORDER = ["inhale", "holdIn", "exhale", "holdOut"];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Build a paced session that ramps from the starting rate down to the target rate.
 *
 * @param {object} input
 * @param {string} input.pattern   key of PATTERNS
 * @param {number} input.startBpm  breaths per minute you are breathing now
 * @param {number} input.targetBpm breaths per minute to end at
 * @param {number} input.minutes   approximate session length
 */
export function buildPacer({
  pattern = "settle",
  startBpm = DEFAULT_START_BPM,
  targetBpm = DEFAULT_TARGET_BPM,
  minutes = DEFAULT_MINUTES,
} = {}) {
  const shape = PATTERNS[pattern];
  if (!shape) return { error: "Choose one of the listed breathing patterns." };
  if (!isNum(startBpm) || !isNum(targetBpm) || !isNum(minutes)) {
    return { error: "Enter the breathing rates and the session length as numbers." };
  }
  if (startBpm < MIN_START_BPM || startBpm > MAX_START_BPM) {
    return { error: `Your current rate should be between ${MIN_START_BPM} and ${MAX_START_BPM} breaths per minute.` };
  }
  if (targetBpm < MIN_TARGET_BPM || targetBpm > MAX_TARGET_BPM) {
    return { error: `The target rate should be between ${MIN_TARGET_BPM} and ${MAX_TARGET_BPM} breaths per minute.` };
  }
  if (targetBpm > startBpm) {
    return { error: "The target rate has to be the same as or slower than your current rate." };
  }
  if (minutes < MIN_MINUTES || minutes > MAX_MINUTES) {
    return { error: `Choose a session between ${MIN_MINUTES} and ${MAX_MINUTES} minutes.` };
  }

  const partsTotal = PHASE_ORDER.reduce((sum, key) => sum + shape.parts[key], 0);
  if (!(partsTotal > 0)) return { error: "That breathing pattern has no length." };

  // How long n ramped breaths actually take. Slower breaths take longer than the
  // arithmetic mean suggests, so the first estimate is refined until it settles.
  const secondsForCount = (count) => {
    let seconds = 0;
    for (let i = 0; i < count; i += 1) {
      const progress = count === 1 ? 1 : i / (count - 1);
      const bpm = round2(startBpm + (targetBpm - startBpm) * progress);
      seconds += 60 / bpm;
    }
    return seconds;
  };

  const requestedSeconds = minutes * 60;
  const averageBpm = (startBpm + targetBpm) / 2;
  let cycleCount = Math.max(1, Math.round(minutes * averageBpm));
  for (let pass = 0; pass < 8; pass += 1) {
    const seconds = secondsForCount(cycleCount);
    if (!(seconds > 0)) break;
    const next = Math.max(1, Math.round((cycleCount * requestedSeconds) / seconds));
    if (next === cycleCount) break;
    cycleCount = next;
  }

  const cycles = [];
  let offset = 0;
  for (let i = 0; i < cycleCount; i += 1) {
    const progress = cycleCount === 1 ? 1 : i / (cycleCount - 1);
    const bpm = round2(startBpm + (targetBpm - startBpm) * progress);
    const cycleSeconds = round2(60 / bpm);
    const phases = PHASE_ORDER.filter((key) => shape.parts[key] > 0).map((key) => ({
      key,
      label: PHASE_LABELS[key],
      instruction: PHASE_INSTRUCTIONS[key],
      seconds: round2((shape.parts[key] / partsTotal) * cycleSeconds),
    }));
    const actualSeconds = round2(phases.reduce((sum, phase) => sum + phase.seconds, 0));
    cycles.push({ index: i, bpm, cycleSeconds: actualSeconds, phases, offset: round2(offset) });
    offset = round2(offset + actualSeconds);
  }

  const totalSeconds = offset;
  const firstCycle = cycles[0];
  const lastCycle = cycles[cycles.length - 1];

  return {
    patternKey: shape.key,
    patternLabel: shape.label,
    patternNote: shape.note,
    parts: shape.parts,
    startBpm,
    targetBpm,
    requestedMinutes: minutes,
    cycles,
    cycleCount,
    totalSeconds,
    totalMinutes: round1(totalSeconds / 60),
    firstCycleSeconds: firstCycle.cycleSeconds,
    lastCycleSeconds: lastCycle.cycleSeconds,
    firstExhaleSeconds: (firstCycle.phases.find((p) => p.key === "exhale") || { seconds: 0 }).seconds,
    lastExhaleSeconds: (lastCycle.phases.find((p) => p.key === "exhale") || { seconds: 0 }).seconds,
    exhaleShare: Math.round((shape.parts.exhale / partsTotal) * 100),
    hasHold: shape.parts.holdIn > 0 || shape.parts.holdOut > 0,
    reachesResonance: targetBpm <= RESONANCE_BPM + 0.5,
    startsAboveNormal: startBpm > NORMAL_RESTING_BPM_HIGH,
  };
}

/** Which breath and which phase the session is on at a given elapsed time. */
export function positionAtTime(elapsedSeconds, pacer) {
  if (!pacer || pacer.error) return { error: pacer ? pacer.error : "No session." };
  const first = pacer.cycles[0];
  if (!isNum(elapsedSeconds) || elapsedSeconds <= 0) {
    return {
      done: false,
      cycleNumber: 1,
      bpm: first.bpm,
      phaseKey: first.phases[0].key,
      phaseLabel: first.phases[0].label,
      instruction: first.phases[0].instruction,
      phaseSeconds: first.phases[0].seconds,
      phaseRemaining: first.phases[0].seconds,
      phaseProgress: 0,
      overallProgress: 0,
      remainingSeconds: pacer.totalSeconds,
    };
  }
  if (elapsedSeconds >= pacer.totalSeconds) {
    return {
      done: true,
      cycleNumber: pacer.cycleCount,
      bpm: pacer.cycles[pacer.cycleCount - 1].bpm,
      phaseKey: "done",
      phaseLabel: "Finished",
      instruction: "Let the breath go back to its own rhythm. Look around the room and name what you see.",
      phaseSeconds: 0,
      phaseRemaining: 0,
      phaseProgress: 1,
      overallProgress: 1,
      remainingSeconds: 0,
    };
  }

  // Cycles have different lengths, so walk the offsets rather than dividing.
  let cycle = pacer.cycles[pacer.cycles.length - 1];
  for (let i = 0; i < pacer.cycles.length; i += 1) {
    const candidate = pacer.cycles[i];
    if (elapsedSeconds < candidate.offset + candidate.cycleSeconds) {
      cycle = candidate;
      break;
    }
  }
  let within = elapsedSeconds - cycle.offset;
  let phase = cycle.phases[cycle.phases.length - 1];
  for (let i = 0; i < cycle.phases.length; i += 1) {
    if (within < cycle.phases[i].seconds) {
      phase = cycle.phases[i];
      break;
    }
    within -= cycle.phases[i].seconds;
  }
  const phaseElapsed = Math.min(Math.max(0, within), phase.seconds);

  return {
    done: false,
    cycleNumber: cycle.index + 1,
    bpm: cycle.bpm,
    phaseKey: phase.key,
    phaseLabel: phase.label,
    instruction: phase.instruction,
    phaseSeconds: phase.seconds,
    phaseElapsed: round1(phaseElapsed),
    phaseRemaining: Math.max(0, round1(phase.seconds - phaseElapsed)),
    phaseProgress: phase.seconds > 0 ? phaseElapsed / phase.seconds : 0,
    overallProgress: pacer.totalSeconds > 0 ? elapsedSeconds / pacer.totalSeconds : 0,
    remainingSeconds: Math.max(0, round1(pacer.totalSeconds - elapsedSeconds)),
  };
}

/** mm:ss for a non-negative number of seconds. */
export function formatClock(seconds) {
  if (!isNum(seconds) || seconds < 0) return "0:00";
  const whole = Math.ceil(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

/** Grounding steps to run alongside the breathing, in order. */
export const GROUNDING_STEPS = [
  "Put both feet flat on the floor and feel the contact.",
  "Unclench the jaw and drop the shoulders away from the ears.",
  "Name five things you can see, without moving your head much.",
  "Name three sounds you can hear right now.",
  "Remind yourself: this feeling peaks and then falls. It always has.",
];
