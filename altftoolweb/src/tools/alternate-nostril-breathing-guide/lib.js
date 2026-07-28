/**
 * Nadi shodhana (alternate nostril breathing) pacing.
 *
 * Traditional structure of one round, as taught in hatha yoga texts and modern
 * yoga-therapy manuals:
 *   1. Close the RIGHT nostril with the thumb, inhale through the LEFT.
 *   2. (Optional) close both nostrils and retain the breath - antara kumbhaka.
 *   3. Release the thumb, close the LEFT with the ring finger, exhale RIGHT.
 *   4. Inhale through the RIGHT.
 *   5. (Optional) retain again.
 *   6. Release the ring finger, close the RIGHT, exhale LEFT.
 * One round therefore contains two complete breaths and always ends on a left
 * exhale, which is why round counts are given in rounds and not in breaths.
 *
 * Ratios: teaching sequences move from 1:1 (equal inhale and exhale, no
 * retention), through 1:2 (exhale twice the inhale), to the classical
 * 1:4:2 inhale : retention : exhale described in the Hatha Yoga Pradipika.
 * Retention is the part traditionally taught only under supervision.
 *
 * Nothing here is a treatment. Slow breathing at or below 10 breaths per minute
 * is what the research literature calls paced or slow breathing.
 */

export const MIN_BASE_COUNT = 2; // seconds per unit of the ratio
export const MAX_BASE_COUNT = 8;
export const DEFAULT_BASE_COUNT = 4;
export const MIN_ROUNDS = 1;
export const MAX_ROUNDS = 20;
export const DEFAULT_ROUNDS = 6;
export const SLOW_BREATHING_BPM = 10;

/** inhale : retention : exhale, expressed as multiples of the base count. */
export const RATIO_PRESETS = {
  equal: {
    key: "equal",
    label: "Equal breath 1:0:1",
    inhale: 1,
    retain: 0,
    exhale: 1,
    level: "Beginner",
    note: "No breath retention. The starting point for anyone new to the practice.",
  },
  extendedExhale: {
    key: "extendedExhale",
    label: "Extended exhale 1:0:2",
    inhale: 1,
    retain: 0,
    exhale: 2,
    level: "Beginner",
    note: "Exhale twice as long as the inhale, still without retention - the calmest ratio to start with.",
  },
  evenHold: {
    key: "evenHold",
    label: "Even with hold 1:1:1",
    inhale: 1,
    retain: 1,
    exhale: 1,
    level: "Intermediate",
    note: "Introduces a short retention of the same length as the inhale.",
  },
  classical: {
    key: "classical",
    label: "Classical 1:4:2",
    inhale: 1,
    retain: 4,
    exhale: 2,
    level: "Advanced",
    note: "The ratio described in the Hatha Yoga Pradipika. Traditionally learned with a teacher, not from a screen.",
  },
};

/** Hand position: right thumb closes the right nostril, ring finger closes the left. */
export const HAND_NOTE =
  "Use the right hand in Vishnu mudra: index and middle fingers folded to the palm, thumb on the right nostril, ring finger on the left.";

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;

function stepTemplates(hasRetention) {
  const steps = [
    {
      key: "inhale-left",
      phase: "inhale",
      label: "Inhale left",
      unit: "inhale",
      instruction: "Thumb closes the right nostril. Breathe in slowly through the left.",
    },
  ];
  if (hasRetention) {
    steps.push({
      key: "hold-1",
      phase: "retain",
      label: "Hold",
      unit: "retain",
      instruction: "Ring finger joins the thumb - both nostrils closed. Stay soft in the throat.",
    });
  }
  steps.push(
    {
      key: "exhale-right",
      phase: "exhale",
      label: "Exhale right",
      unit: "exhale",
      instruction: "Lift the thumb, ring finger closes the left. Breathe out through the right.",
    },
    {
      key: "inhale-right",
      phase: "inhale",
      label: "Inhale right",
      unit: "inhale",
      instruction: "Left stays closed. Breathe in through the right nostril.",
    },
  );
  if (hasRetention) {
    steps.push({
      key: "hold-2",
      phase: "retain",
      label: "Hold",
      unit: "retain",
      instruction: "Both nostrils closed again. Keep the face and shoulders relaxed.",
    });
  }
  steps.push({
    key: "exhale-left",
    phase: "exhale",
    label: "Exhale left",
    unit: "exhale",
    instruction: "Thumb closes the right, ring finger lifts. Breathe out through the left - round complete.",
  });
  return steps;
}

/**
 * Build one full practice session.
 *
 * @param {object} input
 * @param {number} input.rounds     number of complete rounds
 * @param {number} input.baseCount  seconds for one unit of the ratio
 * @param {string} input.preset     key of RATIO_PRESETS
 */
export function buildNadiSession({
  rounds = DEFAULT_ROUNDS,
  baseCount = DEFAULT_BASE_COUNT,
  preset = "extendedExhale",
} = {}) {
  if (!isNum(rounds) || !isNum(baseCount)) {
    return { error: "Enter the number of rounds and the count length as numbers." };
  }
  const ratio = RATIO_PRESETS[preset];
  if (!ratio) return { error: "Choose one of the listed breathing ratios." };
  const roundCount = Math.round(rounds);
  if (roundCount < MIN_ROUNDS || roundCount > MAX_ROUNDS) {
    return { error: `Practise between ${MIN_ROUNDS} and ${MAX_ROUNDS} rounds in one sitting.` };
  }
  if (baseCount < MIN_BASE_COUNT || baseCount > MAX_BASE_COUNT) {
    return { error: `One count should last between ${MIN_BASE_COUNT} and ${MAX_BASE_COUNT} seconds.` };
  }

  const unitSeconds = {
    inhale: round1(ratio.inhale * baseCount),
    retain: round1(ratio.retain * baseCount),
    exhale: round1(ratio.exhale * baseCount),
  };
  const hasRetention = unitSeconds.retain > 0;
  const steps = stepTemplates(hasRetention).map((step) => ({
    ...step,
    seconds: unitSeconds[step.unit],
  }));

  const roundSeconds = round1(steps.reduce((sum, step) => sum + step.seconds, 0));
  const totalSeconds = round1(roundSeconds * roundCount);
  // Each round is two complete breaths (one through each nostril).
  const breathsPerRound = 2;
  const breathsPerMinute = round1((breathsPerRound * 60) / roundSeconds);
  const longestHold = unitSeconds.retain;

  return {
    rounds: roundCount,
    baseCount,
    ratioKey: ratio.key,
    ratioLabel: ratio.label,
    ratioLevel: ratio.level,
    ratioNote: ratio.note,
    hasRetention,
    steps,
    stepsPerRound: steps.length,
    unitSeconds,
    roundSeconds,
    totalSeconds,
    breathsPerRound,
    totalBreaths: breathsPerRound * roundCount,
    breathsPerMinute,
    isSlowBreathing: breathsPerMinute <= SLOW_BREATHING_BPM,
    longestHold,
    handNote: HAND_NOTE,
  };
}

/** Which step of which round the session is on at a given elapsed time. */
export function stepAtTime(elapsedSeconds, session) {
  if (!session || session.error) return { error: session ? session.error : "No session." };
  const first = session.steps[0];
  if (!isNum(elapsedSeconds) || elapsedSeconds <= 0) {
    return {
      done: false,
      roundNumber: 1,
      stepIndex: 0,
      stepKey: first.key,
      stepLabel: first.label,
      phase: first.phase,
      instruction: first.instruction,
      stepSeconds: first.seconds,
      stepElapsed: 0,
      stepRemaining: first.seconds,
      stepProgress: 0,
      overallProgress: 0,
      remainingSeconds: session.totalSeconds,
    };
  }
  if (elapsedSeconds >= session.totalSeconds) {
    return {
      done: true,
      roundNumber: session.rounds,
      stepIndex: session.steps.length - 1,
      stepKey: "done",
      stepLabel: "Finished",
      phase: "done",
      instruction: "Lower the hand and let the breath find its own rhythm for a few moments.",
      stepSeconds: 0,
      stepElapsed: 0,
      stepRemaining: 0,
      stepProgress: 1,
      overallProgress: 1,
      remainingSeconds: 0,
    };
  }

  const roundIndex = Math.floor(elapsedSeconds / session.roundSeconds);
  let within = elapsedSeconds - roundIndex * session.roundSeconds;
  let stepIndex = session.steps.length - 1;
  for (let i = 0; i < session.steps.length; i += 1) {
    if (within < session.steps[i].seconds) {
      stepIndex = i;
      break;
    }
    within -= session.steps[i].seconds;
  }
  const step = session.steps[stepIndex];
  const stepElapsed = Math.min(within, step.seconds);

  return {
    done: false,
    roundNumber: roundIndex + 1,
    stepIndex,
    stepKey: step.key,
    stepLabel: step.label,
    phase: step.phase,
    instruction: step.instruction,
    stepSeconds: step.seconds,
    stepElapsed: round1(stepElapsed),
    stepRemaining: Math.max(0, round1(step.seconds - stepElapsed)),
    stepProgress: step.seconds > 0 ? stepElapsed / step.seconds : 0,
    overallProgress: session.totalSeconds > 0 ? elapsedSeconds / session.totalSeconds : 0,
    remainingSeconds: Math.max(0, round1(session.totalSeconds - elapsedSeconds)),
  };
}

/** mm:ss for a non-negative number of seconds. */
export function formatClock(seconds) {
  if (!isNum(seconds) || seconds < 0) return "0:00";
  const whole = Math.ceil(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
