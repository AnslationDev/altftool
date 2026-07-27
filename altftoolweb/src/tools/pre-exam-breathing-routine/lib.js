/**
 * Pre-exam paced breathing.
 *
 * Patterns encoded, with their conventional sources:
 *  - Box breathing 4-4-4-4: inhale 4 s, hold 4 s, exhale 4 s, hold 4 s.
 *    Widely taught for acute stress control (popularised by US Navy SEAL
 *    training material).
 *  - 4-7-8 breathing: inhale 4 s, hold 7 s, exhale 8 s, as described by
 *    Dr Andrew Weil, derived from pranayama practice.
 *  - Extended exhale 4-6: inhale 4 s, exhale 6 s. Slow breathing at roughly
 *    6 breaths/min with a longer exhale increases vagal (parasympathetic)
 *    activity — see reviews of slow-paced breathing such as Zaccaro et al.,
 *    Frontiers in Human Neuroscience, 2018.
 *
 * All timing maths is pure: elapsed time is always passed in as an argument.
 */

export const BREATHING_PATTERNS = [
  {
    id: "box",
    label: "Box breathing (4-4-4-4)",
    source: "Tactical breathing taught in US military stress training",
    note: "Even sides make it easy to keep count when adrenaline is high.",
    defaultRounds: 6,
    phases: [
      { label: "Inhale", seconds: 4, action: "grow" },
      { label: "Hold", seconds: 4, action: "steady" },
      { label: "Exhale", seconds: 4, action: "shrink" },
      { label: "Hold", seconds: 4, action: "steady" },
    ],
  },
  {
    id: "478",
    label: "4-7-8 breathing",
    source: "Dr Andrew Weil's relaxing breath, based on pranayama",
    note: "The long 8-second exhale is the calming part; keep it unforced.",
    defaultRounds: 4,
    phases: [
      { label: "Inhale", seconds: 4, action: "grow" },
      { label: "Hold", seconds: 7, action: "steady" },
      { label: "Exhale", seconds: 8, action: "shrink" },
    ],
  },
  {
    id: "extended-exhale",
    label: "Extended exhale (4-6)",
    source: "Slow-paced breathing (~6 breaths/min) per Zaccaro et al., 2018",
    note: "Simplest pattern — good if holds feel uncomfortable.",
    defaultRounds: 8,
    phases: [
      { label: "Inhale", seconds: 4, action: "grow" },
      { label: "Exhale", seconds: 6, action: "shrink" },
    ],
  },
];

export const MIN_ROUNDS = 1;
export const MAX_ROUNDS = 20;

/** Seconds in one full round of a pattern. */
export function roundSeconds(pattern) {
  return pattern.phases.reduce((sum, phase) => sum + phase.seconds, 0);
}

/**
 * Build a full session timeline for a pattern.
 *
 * @param {object} input
 * @param {string} input.patternId  One of BREATHING_PATTERNS ids.
 * @param {number} input.rounds     Number of rounds (1-20).
 * @returns {{pattern, rounds, totalSeconds, secondsPerRound, steps}|{error:string}}
 *   steps: [{round, label, seconds, action, startsAt}]
 */
export function buildBreathingSession({ patternId, rounds }) {
  const pattern = BREATHING_PATTERNS.find((p) => p.id === patternId);
  if (!pattern) return { error: "Choose a breathing pattern." };

  const n = Number(rounds);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < MIN_ROUNDS) {
    return { error: "Rounds must be a whole number of at least 1." };
  }
  if (n > MAX_ROUNDS) {
    return { error: `Keep it to ${MAX_ROUNDS} rounds or fewer — a few calm minutes is enough.` };
  }

  const steps = [];
  let clock = 0;
  for (let round = 1; round <= n; round += 1) {
    for (const phase of pattern.phases) {
      steps.push({ round, label: phase.label, seconds: phase.seconds, action: phase.action, startsAt: clock });
      clock += phase.seconds;
    }
  }

  return {
    pattern: {
      id: pattern.id,
      label: pattern.label,
      source: pattern.source,
      note: pattern.note,
    },
    rounds: n,
    secondsPerRound: roundSeconds(pattern),
    totalSeconds: clock,
    steps,
  };
}

/**
 * Locate the active step for a given elapsed second count.
 * @returns {{step, stepIndex, secondsIntoStep, secondsLeftInStep, done:boolean}|null}
 *   null for invalid input; done:true once elapsed passes the session end.
 */
export function phaseAt(session, elapsedSeconds) {
  if (!session || session.error || !Array.isArray(session.steps)) return null;
  const elapsed = Number(elapsedSeconds);
  if (!Number.isFinite(elapsed) || elapsed < 0) return null;
  if (elapsed >= session.totalSeconds) {
    return { step: null, stepIndex: -1, secondsIntoStep: 0, secondsLeftInStep: 0, done: true };
  }
  for (let i = 0; i < session.steps.length; i += 1) {
    const step = session.steps[i];
    if (elapsed < step.startsAt + step.seconds) {
      const into = elapsed - step.startsAt;
      return {
        step,
        stepIndex: i,
        secondsIntoStep: into,
        secondsLeftInStep: step.seconds - into,
        done: false,
      };
    }
  }
  return { step: null, stepIndex: -1, secondsIntoStep: 0, secondsLeftInStep: 0, done: true };
}

/** Format whole seconds as m:ss (never NaN). */
export function formatSeconds(totalSeconds) {
  const value = Number(totalSeconds);
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const mins = Math.floor(value / 60);
  const secs = Math.floor(value % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
