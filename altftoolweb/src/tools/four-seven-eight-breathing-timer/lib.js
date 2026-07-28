/**
 * 4-7-8 breathing timer maths.
 *
 * The 4-7-8 pattern was popularised by Dr Andrew Weil and is adapted from
 * pranayama practice. The published instructions are:
 *   - Exhale fully through the mouth first.
 *   - Inhale quietly through the nose for a count of 4.
 *   - Hold the breath for a count of 7.
 *   - Exhale audibly through the mouth for a count of 8.
 *   - That is one breath. Repeat for a total of 4 breaths, twice a day, and do
 *     not exceed 8 breaths per session in the first month of practice.
 * One full cycle is therefore 4 + 7 + 8 = 19 counts.
 *
 * A "count" is a self-paced beat; one second per count is the usual starting
 * pace, which puts the breathing rate at 60 / 19 = about 3.2 breaths per minute.
 * Slow-breathing research generally treats anything at or under 10 breaths per
 * minute as paced/slow breathing, so every valid setting here qualifies.
 */

export const PHASE_COUNTS = { inhale: 4, hold: 7, exhale: 8 };
export const COUNTS_PER_CYCLE = PHASE_COUNTS.inhale + PHASE_COUNTS.hold + PHASE_COUNTS.exhale; // 19

export const PHASES = [
  {
    key: "inhale",
    label: "Inhale",
    counts: PHASE_COUNTS.inhale,
    instruction: "Breathe in quietly through your nose.",
  },
  {
    key: "hold",
    label: "Hold",
    counts: PHASE_COUNTS.hold,
    instruction: "Hold the breath. Keep the jaw and shoulders loose.",
  },
  {
    key: "exhale",
    label: "Exhale",
    counts: PHASE_COUNTS.exhale,
    instruction: "Breathe out through the mouth with a soft whoosh.",
  },
];

/** Weil's own guidance: four breaths per session, no more than eight while learning. */
export const RECOMMENDED_CYCLES = 4;
export const BEGINNER_MAX_CYCLES = 8;
export const MIN_CYCLES = 1;
export const MAX_CYCLES = 12;

/** Seconds per count. 1.0 s is the standard pace; slower is allowed once practised. */
export const MIN_SECONDS_PER_COUNT = 0.5;
export const MAX_SECONDS_PER_COUNT = 2;
export const DEFAULT_SECONDS_PER_COUNT = 1;

/** Breathing at or below this rate is what the literature calls slow / paced breathing. */
export const SLOW_BREATHING_BPM = 10;

const round1 = (value) => Math.round(value * 10) / 10;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Build the full timeline for a session.
 *
 * @param {object} input
 * @param {number} input.cycles          number of 4-7-8 breaths
 * @param {number} input.secondsPerCount seconds each count lasts
 * @returns {object} session plan, or { error }
 */
export function buildSession({ cycles = RECOMMENDED_CYCLES, secondsPerCount = DEFAULT_SECONDS_PER_COUNT } = {}) {
  if (!isNum(cycles) || !isNum(secondsPerCount)) {
    return { error: "Enter the number of breaths and the pace as numbers." };
  }
  const cycleCount = Math.round(cycles);
  if (cycleCount < MIN_CYCLES || cycleCount > MAX_CYCLES) {
    return { error: `Choose between ${MIN_CYCLES} and ${MAX_CYCLES} breaths in one session.` };
  }
  if (secondsPerCount < MIN_SECONDS_PER_COUNT || secondsPerCount > MAX_SECONDS_PER_COUNT) {
    return {
      error: `A count should last between ${MIN_SECONDS_PER_COUNT} and ${MAX_SECONDS_PER_COUNT} seconds.`,
    };
  }

  const phases = PHASES.map((phase) => ({
    ...phase,
    seconds: round1(phase.counts * secondsPerCount),
  }));
  const cycleSeconds = round1(COUNTS_PER_CYCLE * secondsPerCount);
  const totalSeconds = round1(cycleSeconds * cycleCount);
  const breathsPerMinute = round1(60 / cycleSeconds);
  const longestPhase = phases.reduce((a, b) => (b.seconds > a.seconds ? b : a), phases[0]);

  return {
    cycles: cycleCount,
    secondsPerCount,
    phases,
    cycleSeconds,
    totalSeconds,
    breathsPerMinute,
    isSlowBreathing: breathsPerMinute <= SLOW_BREATHING_BPM,
    holdSeconds: phases[1].seconds,
    exhaleSeconds: phases[2].seconds,
    longestPhaseLabel: longestPhase.label,
    aboveBeginnerLimit: cycleCount > BEGINNER_MAX_CYCLES,
  };
}

/**
 * Where a session is at a given elapsed time.
 *
 * @param {number} elapsedSeconds seconds since the session started
 * @param {object} session        the object returned by buildSession
 */
export function phaseAtTime(elapsedSeconds, session) {
  if (!session || session.error) return { error: session ? session.error : "No session." };
  if (!isNum(elapsedSeconds) || elapsedSeconds < 0) {
    return {
      done: false,
      cycleIndex: 0,
      cycleNumber: 1,
      phaseKey: session.phases[0].key,
      phaseLabel: session.phases[0].label,
      instruction: session.phases[0].instruction,
      phaseElapsed: 0,
      phaseSeconds: session.phases[0].seconds,
      phaseRemaining: session.phases[0].seconds,
      phaseProgress: 0,
      overallProgress: 0,
      remainingSeconds: session.totalSeconds,
    };
  }
  if (elapsedSeconds >= session.totalSeconds) {
    const last = session.phases[session.phases.length - 1];
    return {
      done: true,
      cycleIndex: session.cycles - 1,
      cycleNumber: session.cycles,
      phaseKey: "done",
      phaseLabel: "Finished",
      instruction: "Session complete. Let your breathing return to its own rhythm.",
      phaseElapsed: last.seconds,
      phaseSeconds: last.seconds,
      phaseRemaining: 0,
      phaseProgress: 1,
      overallProgress: 1,
      remainingSeconds: 0,
    };
  }

  const cycleIndex = Math.floor(elapsedSeconds / session.cycleSeconds);
  let within = elapsedSeconds - cycleIndex * session.cycleSeconds;
  let current = session.phases[session.phases.length - 1];
  for (let i = 0; i < session.phases.length; i += 1) {
    const phase = session.phases[i];
    if (within < phase.seconds) {
      current = phase;
      break;
    }
    within -= phase.seconds;
  }
  const phaseElapsed = Math.min(within, current.seconds);

  return {
    done: false,
    cycleIndex,
    cycleNumber: cycleIndex + 1,
    phaseKey: current.key,
    phaseLabel: current.label,
    instruction: current.instruction,
    phaseElapsed: round1(phaseElapsed),
    phaseSeconds: current.seconds,
    phaseRemaining: Math.max(0, round1(current.seconds - phaseElapsed)),
    phaseProgress: current.seconds > 0 ? phaseElapsed / current.seconds : 0,
    overallProgress: session.totalSeconds > 0 ? elapsedSeconds / session.totalSeconds : 0,
    remainingSeconds: Math.max(0, round1(session.totalSeconds - elapsedSeconds)),
  };
}

/** mm:ss for a non-negative number of seconds. */
export function formatClock(seconds) {
  if (!isNum(seconds) || seconds < 0) return "0:00";
  const whole = Math.ceil(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
