/**
 * Eye rest plus chromatic adaptation resets for colour-critical work.
 * Pure logic, no DOM.
 *
 * Two separate problems are being scheduled:
 *
 * 1. Eye strain. The 20-20-20 rule: after at most 20 minutes of near work,
 *    look about 20 feet (6.1 m) away for at least 20 seconds.
 * 2. Colour judgement. The visual system adapts to whatever it has been
 *    looking at — a saturated hero image, a warm brand palette, a coloured
 *    desktop wallpaper — and most of that shift happens within the first
 *    minute. Judging a colour straight after staring at a strong cast gives a
 *    biased answer, so colourists and print operators reset the eye on a
 *    neutral field before the decision.
 *
 * ISO 3664, the standard for viewing conditions in graphic technology and
 * photography, is built on the same idea: a fixed D50 (5000 K) white point and
 * a plain, matte, neutral grey surround, with nothing strongly coloured in the
 * field of view.
 */

/** Eye rule constants. */
export const EYE_RULE_SECONDS = 20 * 60;
export const EYE_BREAK_SECONDS = 20;
export const EYE_BREAK_DISTANCE_METRES = 6.1;

/**
 * Adaptation is largely settled inside a minute, so 60 seconds on a neutral
 * field is the usual working default before a critical colour call.
 */
export const DEFAULT_RESET_SECONDS = 60;

export const LIMITS = {
  sessionMinutes: { min: 15, max: 480 },
  checkIntervalMinutes: { min: 5, max: 120 },
  resetSeconds: { min: 10, max: 300 },
  decisionSeconds: { min: 10, max: 600 },
};

export const MAX_PHASES = 600;

export const PHASE_KINDS = {
  WORK: "work",
  EYE_BREAK: "eyeBreak",
  RESET: "reset",
  DECISION: "decision",
  DONE: "done",
};

/** Viewing-condition notes drawn from the ISO 3664 approach. */
export const VIEWING_NOTES = [
  "Keep one fixed white point and stay on it. ISO 3664 uses D50 (5000 K) for print appraisal; screen-only teams usually standardise on D65. Switching back and forth mid-session is what ruins consistency.",
  "Surround the screen with plain, matte, neutral grey — not white, not a colour. A saturated wallpaper or a bright wall behind the monitor shifts every judgement you make.",
  "Get strong colour out of your field of view: a red mug, a bright jumper, a coloured desk lamp shade all bias adaptation.",
  "Keep ambient light steady and modest for screen work. Daylight through a window changes colour temperature through the day and will move your calls with it.",
  "Judge colour early in a block, not at the end of one. Fatigued eyes and an adapted white point both push in the same wrong direction.",
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function checkRange(value, bounds, label) {
  if (!isNum(value)) return `${label} must be a number.`;
  if (value < bounds.min) return `${label} cannot be below ${bounds.min}.`;
  if (value > bounds.max) return `${label} cannot be above ${bounds.max}.`;
  return null;
}

/** Seconds -> m:ss (h:mm:ss past an hour). Never NaN. */
export function formatClock(totalSeconds) {
  const safe = isNum(totalSeconds) && totalSeconds > 0 ? Math.round(totalSeconds) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/**
 * @param {object} input
 * @param {number} input.sessionMinutes total working session
 * @param {number} input.checkIntervalMinutes how often a colour decision comes up
 * @param {number} input.resetSeconds time on a neutral field before the decision
 * @param {number} input.decisionSeconds how long the colour judgement itself takes
 * @param {boolean} input.resetAtDistance true if the neutral field you use is far away
 * @returns {{error:string}|object}
 */
export function buildDesignerPlan({
  sessionMinutes = 180,
  checkIntervalMinutes = 30,
  resetSeconds = DEFAULT_RESET_SECONDS,
  decisionSeconds = 120,
  resetAtDistance = false,
} = {}) {
  const problem =
    checkRange(sessionMinutes, LIMITS.sessionMinutes, "Session length (minutes)") ||
    checkRange(checkIntervalMinutes, LIMITS.checkIntervalMinutes, "Time between colour decisions (minutes)") ||
    checkRange(resetSeconds, LIMITS.resetSeconds, "Neutral reset (seconds)") ||
    checkRange(decisionSeconds, LIMITS.decisionSeconds, "Colour decision (seconds)");
  if (problem) return { error: problem };

  const sessionSeconds = Math.round(sessionMinutes * 60);
  const workSeconds = Math.round(checkIntervalMinutes * 60);
  const reset = Math.round(resetSeconds);
  const decision = Math.round(decisionSeconds);

  // A reset only stops the near-work clock if the neutral field you use is far
  // enough away to relax accommodation; a grey card on the desk is still near.
  const resetCountsAsEyeBreak = Boolean(resetAtDistance) && reset >= EYE_BREAK_SECONDS;

  const phases = [];
  let clock = 0;
  let sinceBreak = 0;
  let round = 1;

  while (clock < sessionSeconds && phases.length < MAX_PHASES) {
    let workLeft = workSeconds;
    while (workLeft > 0 && clock < sessionSeconds && phases.length < MAX_PHASES) {
      const room = EYE_RULE_SECONDS - sinceBreak;
      if (room <= 0) {
        phases.push({
          kind: PHASE_KINDS.EYE_BREAK,
          label: "Eye break",
          hint: `Twenty minutes of near work done. Look about ${EYE_BREAK_DISTANCE_METRES} m away and blink fully.`,
          seconds: EYE_BREAK_SECONDS,
          round,
        });
        clock += EYE_BREAK_SECONDS;
        sinceBreak = 0;
        continue;
      }
      const chunk = Math.min(workLeft, room);
      phases.push({
        kind: PHASE_KINDS.WORK,
        label: "Design work",
        hint: "Near work at the screen. Nothing strongly coloured should be sitting beside the canvas.",
        seconds: chunk,
        round,
      });
      clock += chunk;
      sinceBreak += chunk;
      workLeft -= chunk;
      if (workLeft > 0 && phases.length < MAX_PHASES) {
        phases.push({
          kind: PHASE_KINDS.EYE_BREAK,
          label: "Eye break",
          hint: `Twenty minutes of near work done. Look about ${EYE_BREAK_DISTANCE_METRES} m away and blink fully.`,
          seconds: EYE_BREAK_SECONDS,
          round,
        });
        clock += EYE_BREAK_SECONDS;
        sinceBreak = 0;
      }
    }

    if (clock >= sessionSeconds || phases.length >= MAX_PHASES) break;

    phases.push({
      kind: PHASE_KINDS.RESET,
      label: "Neutral reset",
      hint: resetCountsAsEyeBreak
        ? "Look at a distant plain grey or neutral surface. This doubles as your eye break."
        : "Fill the screen with mid grey, or look at a neutral card, and let your white point settle before you judge anything.",
      seconds: reset,
      round,
    });
    clock += reset;
    sinceBreak = resetCountsAsEyeBreak ? 0 : sinceBreak + reset;

    if (clock >= sessionSeconds || phases.length >= MAX_PHASES) break;

    phases.push({
      kind: PHASE_KINDS.DECISION,
      label: `Colour decision ${round}`,
      hint: "Make the call now, while your eye is neutral. Do not second-guess it ten minutes later on adapted eyes.",
      seconds: decision,
      round,
    });
    clock += decision;
    sinceBreak += decision;
    round += 1;
  }

  // Trim to exactly the requested session length.
  const trimmed = [];
  let used = 0;
  for (const phase of phases) {
    if (used >= sessionSeconds) break;
    const seconds = Math.min(phase.seconds, sessionSeconds - used);
    trimmed.push({ ...phase, seconds });
    used += seconds;
  }

  const totalSeconds = used;
  const count = (kind) => trimmed.filter((phase) => phase.kind === kind).length;
  const sum = (kind) =>
    trimmed.filter((phase) => phase.kind === kind).reduce((acc, phase) => acc + phase.seconds, 0);

  const eyeBreaks = count(PHASE_KINDS.EYE_BREAK);
  const resets = count(PHASE_KINDS.RESET);
  const decisions = count(PHASE_KINDS.DECISION);
  const workTotal = sum(PHASE_KINDS.WORK);
  const resetTotal = sum(PHASE_KINDS.RESET);
  const decisionTotal = sum(PHASE_KINDS.DECISION);
  const eyeBreakTotal = sum(PHASE_KINDS.EYE_BREAK);

  let longestRun = 0;
  let run = 0;
  for (const phase of trimmed) {
    const isBreak =
      phase.kind === PHASE_KINDS.EYE_BREAK ||
      (phase.kind === PHASE_KINDS.RESET && resetCountsAsEyeBreak);
    if (isBreak) {
      run = 0;
    } else {
      run += phase.seconds;
      if (run > longestRun) longestRun = run;
    }
  }

  const hours = totalSeconds / 3600;

  return {
    phases: trimmed,
    totalSeconds,
    workSeconds,
    resetSeconds: reset,
    decisionSeconds: decision,
    resetCountsAsEyeBreak,
    eyeBreaks,
    resets,
    decisions,
    workTotal,
    resetTotal,
    decisionTotal,
    eyeBreakTotal,
    totalEyeRestSeconds: eyeBreakTotal + (resetCountsAsEyeBreak ? resetTotal : 0),
    decisionsPerHour: hours > 0 ? Math.round((decisions / hours) * 10) / 10 : 0,
    overheadPercent:
      totalSeconds > 0 ? Math.round(((resetTotal + eyeBreakTotal) / totalSeconds) * 1000) / 10 : 0,
    longestRunSeconds: longestRun,
    longestRunMinutes: Math.round((longestRun / 60) * 10) / 10,
    withinEyeRule: longestRun <= EYE_RULE_SECONDS,
    resetLongEnough: reset >= DEFAULT_RESET_SECONDS,
    truncated: phases.length >= MAX_PHASES,
  };
}

/** Which phase is running at `elapsedSeconds`. */
export function phaseAt(phases, elapsedSeconds) {
  const list = Array.isArray(phases) ? phases : [];
  const total = list.reduce((sum, phase) => sum + (isNum(phase.seconds) ? phase.seconds : 0), 0);
  const t = isNum(elapsedSeconds) && elapsedSeconds > 0 ? elapsedSeconds : 0;

  if (list.length === 0) {
    return { index: -1, phase: null, remaining: 0, overallProgress: 0, done: true, decisionsMade: 0 };
  }
  if (t >= total) {
    return {
      index: list.length,
      phase: {
        kind: PHASE_KINDS.DONE,
        label: "Session finished",
        hint: "Do not sign off colour on tired eyes — sleep on anything borderline and look again cold.",
        seconds: 0,
        round: 0,
      },
      remaining: 0,
      overallProgress: 1,
      done: true,
      decisionsMade: list.filter((phase) => phase.kind === PHASE_KINDS.DECISION).length,
    };
  }

  let cursor = 0;
  let decisionsMade = 0;
  for (let index = 0; index < list.length; index += 1) {
    const phase = list[index];
    const length = isNum(phase.seconds) ? phase.seconds : 0;
    if (t < cursor + length) {
      return {
        index,
        phase,
        remaining: Math.max(0, cursor + length - t),
        overallProgress: total > 0 ? t / total : 1,
        done: false,
        decisionsMade,
      };
    }
    if (phase.kind === PHASE_KINDS.DECISION) decisionsMade += 1;
    cursor += length;
  }

  return { index: list.length, phase: null, remaining: 0, overallProgress: 1, done: true, decisionsMade };
}
