/**
 * Breathing Pacer with Tones — pure pacing maths.
 * No React, no JSX, no DOM. Elapsed time is always passed in as an argument.
 */

export const PHASE_ORDER = ["inhale", "holdIn", "exhale", "holdOut"];

export const PHASE_LABELS = {
  inhale: "Breathe in",
  holdIn: "Hold",
  exhale: "Breathe out",
  holdOut: "Hold",
};

/** Limits that keep a pattern physically breathable. */
export const LIMITS = {
  inhale: { min: 1, max: 20 },
  holdIn: { min: 0, max: 30 },
  exhale: { min: 1, max: 30 },
  holdOut: { min: 0, max: 30 },
  minutes: { min: 1, max: 60 },
};

/** A single breath cycle longer than this is not a pacing exercise any more. */
export const MAX_CYCLE_SECONDS = 90;

/**
 * Named patterns in common use. Numbers are seconds for
 * inhale - hold - exhale - hold.
 */
export const PRESETS = [
  {
    id: "box",
    label: "Box 4-4-4-4",
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    blurb: "Equal four-count square. Widely taught for steadying nerves before a demanding task.",
  },
  {
    id: "weil",
    label: "Relaxing breath 4-7-8",
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    blurb: "Popularised by Dr Andrew Weil; the long exhale is the point, so keep the 1:2 in-to-out ratio.",
  },
  {
    id: "coherent",
    label: "Coherent 5.5-5.5",
    inhale: 5.5,
    holdIn: 0,
    exhale: 5.5,
    holdOut: 0,
    blurb: "About 5.5 breaths per minute — the resonance rate used in heart-rate-variability training.",
  },
  {
    id: "equal",
    label: "Equal 4-4",
    inhale: 4,
    holdIn: 0,
    exhale: 4,
    holdOut: 0,
    blurb: "Simple even breathing at 7.5 breaths per minute. A good starting point.",
  },
  {
    id: "extended",
    label: "Extended exhale 4-6",
    inhale: 4,
    holdIn: 0,
    exhale: 6,
    holdOut: 0,
    blurb: "Exhale longer than the inhale, the pattern most often linked with a calming response.",
  },
];

/**
 * Guide tones, in hertz, from 12-tone equal temperament with A4 = 440 Hz.
 * The inhale glides up, the exhale glides back down, holds get a soft marker.
 */
export const TONES = {
  inhale: { from: 261.63, to: 392.0 }, // C4 -> G4
  exhale: { from: 392.0, to: 261.63 }, // G4 -> C4
  holdIn: { from: 329.63, to: 329.63 }, // E4 marker
  holdOut: { from: 261.63, to: 261.63 }, // C4 marker
};

/** Longest a hold marker tone plays, so a 30-second hold is not a 30-second beep. */
export const HOLD_TONE_SECONDS = 0.35;

const SECONDS_PER_MINUTE = 60;

function checkRange(value, key, label) {
  const { min, max } = LIMITS[key];
  if (!Number.isFinite(value)) return `${label} must be a number.`;
  if (value < min || value > max) return `${label} must be between ${min} and ${max} seconds.`;
  return null;
}

/**
 * Build a breathing session from a four-part pattern.
 *
 * @returns {{error:string}|{phases:Array,cycleSeconds:number,breathsPerMinute:number,cycles:number,totalSeconds:number,ratio:string,inhaleShare:number,exhaleShare:number}}
 */
export function buildPattern({
  inhale = 4,
  holdIn = 4,
  exhale = 4,
  holdOut = 4,
  minutes = 5,
} = {}) {
  const values = {
    inhale: Number(inhale),
    holdIn: Number(holdIn),
    exhale: Number(exhale),
    holdOut: Number(holdOut),
  };
  const sessionMinutes = Number(minutes);

  const problems = [
    checkRange(values.inhale, "inhale", "Inhale"),
    checkRange(values.holdIn, "holdIn", "Hold after inhale"),
    checkRange(values.exhale, "exhale", "Exhale"),
    checkRange(values.holdOut, "holdOut", "Hold after exhale"),
  ].filter(Boolean);
  if (problems.length > 0) return { error: problems[0] };

  if (!Number.isFinite(sessionMinutes)) return { error: "Session length must be a number." };
  if (sessionMinutes < LIMITS.minutes.min || sessionMinutes > LIMITS.minutes.max) {
    return { error: `Session length must be between ${LIMITS.minutes.min} and ${LIMITS.minutes.max} minutes.` };
  }

  const cycleSeconds = values.inhale + values.holdIn + values.exhale + values.holdOut;
  if (cycleSeconds > MAX_CYCLE_SECONDS) {
    return { error: `One breath would take ${cycleSeconds} seconds — keep the whole cycle under ${MAX_CYCLE_SECONDS}.` };
  }

  const sessionSeconds = sessionMinutes * SECONDS_PER_MINUTE;
  const cycles = Math.max(1, Math.floor(sessionSeconds / cycleSeconds));
  const totalSeconds = cycles * cycleSeconds;

  const phases = [];
  let cursor = 0;
  for (const name of PHASE_ORDER) {
    const duration = values[name];
    if (duration <= 0) continue;
    phases.push({
      name,
      label: PHASE_LABELS[name],
      seconds: duration,
      startSeconds: cursor,
      endSeconds: cursor + duration,
    });
    cursor += duration;
  }

  return {
    phases,
    values,
    cycleSeconds,
    breathsPerMinute: SECONDS_PER_MINUTE / cycleSeconds,
    cycles,
    totalSeconds,
    ratio: PHASE_ORDER.map((name) => values[name]).join("-"),
    inhaleShare: (values.inhale / cycleSeconds) * 100,
    exhaleShare: (values.exhale / cycleSeconds) * 100,
    exhaleLongerThanInhale: values.exhale > values.inhale,
  };
}

/**
 * Where the session is after `elapsedSeconds`.
 * Boundaries belong to the phase that is starting.
 */
export function stateAt(pattern, elapsedSeconds) {
  if (!pattern || pattern.error || !Array.isArray(pattern.phases) || pattern.phases.length === 0) {
    return { error: "No breathing pattern to run." };
  }
  const t = Number(elapsedSeconds);
  if (!Number.isFinite(t) || t < 0) return { error: "Elapsed time must be zero or more seconds." };

  if (t >= pattern.totalSeconds) {
    const last = pattern.phases[pattern.phases.length - 1];
    return {
      finished: true,
      phase: last,
      cycleNumber: pattern.cycles,
      phaseRemaining: 0,
      phaseProgress: 1,
      sessionRemaining: 0,
      sessionProgress: 1,
    };
  }

  const cycleIndex = Math.floor(t / pattern.cycleSeconds);
  const intoCycle = t - cycleIndex * pattern.cycleSeconds;
  const phase = pattern.phases.find((item) => intoCycle < item.endSeconds) || pattern.phases[0];
  const intoPhase = intoCycle - phase.startSeconds;

  return {
    finished: false,
    phase,
    cycleNumber: cycleIndex + 1,
    phaseRemaining: Math.max(0, phase.endSeconds - intoCycle),
    phaseProgress: phase.seconds > 0 ? Math.min(1, intoPhase / phase.seconds) : 1,
    sessionRemaining: Math.max(0, pattern.totalSeconds - t),
    sessionProgress: pattern.totalSeconds > 0 ? Math.min(1, t / pattern.totalSeconds) : 1,
  };
}

/**
 * Lung "fullness" from 0 (empty) to 1 (full) for the visual pacer:
 * rises through the inhale, stays full through the hold, falls through the exhale.
 */
export function expansionAt(state) {
  if (!state || state.error) return 0;
  if (state.finished) return 0;
  const { phase, phaseProgress } = state;
  if (phase.name === "inhale") return phaseProgress;
  if (phase.name === "holdIn") return 1;
  if (phase.name === "exhale") return 1 - phaseProgress;
  return 0;
}

/** Seconds -> "MM:SS". */
export function formatClock(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return "00:00";
  const whole = Math.floor(value);
  const minutes = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/** Round to one decimal for display without dragging float noise along. */
export function oneDecimal(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return (Math.round(num * 10) / 10).toString();
}
