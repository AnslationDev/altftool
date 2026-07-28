/**
 * Eye breaks fitted around build and test waits — pure logic, no DOM.
 *
 * The rule being satisfied is 20-20-20: after at most 20 minutes of near work,
 * look about 20 feet (6.1 m) away for at least 20 seconds. Promoted by the
 * American Academy of Ophthalmology and the American Optometric Association
 * as the basic habit against digital eye strain.
 *
 * The twist for programmers is that a build, test run or deploy is already a
 * forced wait. If the wait is at least as long as the required break, it can
 * serve as the break — so the only prompts you need are the ones that fall
 * inside a long uninterrupted stretch of editing.
 */

/** Maximum near-work run before a break is due, in seconds (20 minutes). */
export const RULE_INTERVAL_SECONDS = 20 * 60;
/** Minimum break length, in seconds. */
export const MIN_BREAK_SECONDS = 20;
/** 20 feet in metres (1 foot = 0.3048 m exactly). */
export const BREAK_DISTANCE_METRES = 6.1;

export const LIMITS = {
  sessionMinutes: { min: 15, max: 480 },
  editMinutes: { min: 5, max: 120 },
  buildSeconds: { min: 5, max: 1800 },
};

/** Safety valve so a pathological input cannot build an unbounded array. */
export const MAX_PHASES = 600;

export const PHASE_KINDS = {
  EDIT: "edit",
  BUILD: "build",
  PROMPT: "prompt",
  DONE: "done",
};

/** Typical wait lengths, for the quick-pick buttons. */
export const BUILD_PRESETS = [
  { id: "unitTest", name: "Unit test run", seconds: 15 },
  { id: "incremental", name: "Incremental build", seconds: 45 },
  { id: "fullBuild", name: "Full build", seconds: 180 },
  { id: "ci", name: "CI pipeline or deploy", seconds: 600 },
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
 * Build the session schedule and its statistics.
 *
 * @returns {{error:string}|object}
 */
export function buildCoderPlan({ sessionMinutes = 240, editMinutes = 25, buildSeconds = 90 } = {}) {
  const problem =
    checkRange(sessionMinutes, LIMITS.sessionMinutes, "Session length (minutes)") ||
    checkRange(editMinutes, LIMITS.editMinutes, "Editing between builds (minutes)") ||
    checkRange(buildSeconds, LIMITS.buildSeconds, "Build or test wait (seconds)");
  if (problem) return { error: problem };

  const sessionSeconds = Math.round(sessionMinutes * 60);
  const editSeconds = Math.round(editMinutes * 60);
  const waitSeconds = Math.round(buildSeconds);

  // A wait only counts as an eye break if it is at least as long as the break
  // the rule asks for; anything shorter is just a pause in screen time.
  const waitQualifies = waitSeconds >= MIN_BREAK_SECONDS;

  const phases = [];
  let clock = 0;
  let sinceBreak = 0;
  let cycle = 1;

  while (clock < sessionSeconds && phases.length < MAX_PHASES) {
    let editLeft = editSeconds;
    while (editLeft > 0 && clock < sessionSeconds && phases.length < MAX_PHASES) {
      const room = RULE_INTERVAL_SECONDS - sinceBreak;
      if (room <= 0) {
        phases.push({
          kind: PHASE_KINDS.PROMPT,
          label: "Eye break",
          hint: `Twenty minutes of editing done. Look about ${BREAK_DISTANCE_METRES} m away and blink properly.`,
          seconds: MIN_BREAK_SECONDS,
          cycle,
        });
        clock += MIN_BREAK_SECONDS;
        sinceBreak = 0;
        continue;
      }
      const chunk = Math.min(editLeft, room);
      phases.push({
        kind: PHASE_KINDS.EDIT,
        label: "Writing code",
        hint: "Near work. Keep the editor at arm's length and blink fully now and then.",
        seconds: chunk,
        cycle,
      });
      clock += chunk;
      sinceBreak += chunk;
      editLeft -= chunk;
      if (editLeft > 0 && phases.length < MAX_PHASES) {
        phases.push({
          kind: PHASE_KINDS.PROMPT,
          label: "Eye break",
          hint: `Twenty minutes of editing done. Look about ${BREAK_DISTANCE_METRES} m away and blink properly.`,
          seconds: MIN_BREAK_SECONDS,
          cycle,
        });
        clock += MIN_BREAK_SECONDS;
        sinceBreak = 0;
      }
    }

    if (clock >= sessionSeconds || phases.length >= MAX_PHASES) break;

    phases.push({
      kind: PHASE_KINDS.BUILD,
      label: waitQualifies ? "Build running — eyes off" : "Build running",
      hint: waitQualifies
        ? `The wait is long enough to count as your break. Look ${BREAK_DISTANCE_METRES} m away until it finishes.`
        : `Under ${MIN_BREAK_SECONDS} seconds, so this wait does not count as a break — the near-work clock keeps running.`,
      seconds: waitSeconds,
      cycle,
      qualifies: waitQualifies,
    });
    clock += waitSeconds;
    sinceBreak = waitQualifies ? 0 : sinceBreak + waitSeconds;
    cycle += 1;
  }

  // Trim the schedule to exactly the requested session length.
  const trimmed = [];
  let used = 0;
  for (const phase of phases) {
    if (used >= sessionSeconds) break;
    const room = sessionSeconds - used;
    const seconds = Math.min(phase.seconds, room);
    trimmed.push({ ...phase, seconds });
    used += seconds;
  }

  const totalSeconds = used;
  const builds = trimmed.filter((phase) => phase.kind === PHASE_KINDS.BUILD).length;
  const prompts = trimmed.filter((phase) => phase.kind === PHASE_KINDS.PROMPT).length;
  const editTotal = trimmed
    .filter((phase) => phase.kind === PHASE_KINDS.EDIT)
    .reduce((sum, phase) => sum + phase.seconds, 0);
  const waitTotal = trimmed
    .filter((phase) => phase.kind === PHASE_KINDS.BUILD)
    .reduce((sum, phase) => sum + phase.seconds, 0);
  const promptTotal = prompts * MIN_BREAK_SECONDS;

  // Longest run of uninterrupted near work in the finished schedule.
  let longestRun = 0;
  let run = 0;
  for (const phase of trimmed) {
    if (phase.kind === PHASE_KINDS.PROMPT || (phase.kind === PHASE_KINDS.BUILD && waitQualifies)) {
      run = 0;
    } else {
      run += phase.seconds;
      if (run > longestRun) longestRun = run;
    }
  }

  const ruleRequiredBreaks = Math.floor(totalSeconds / RULE_INTERVAL_SECONDS);
  const breaksFromBuilds = waitQualifies ? builds : 0;
  const coveragePercent =
    ruleRequiredBreaks > 0
      ? Math.min(100, Math.round((breaksFromBuilds / ruleRequiredBreaks) * 100))
      : 100;

  return {
    phases: trimmed,
    totalSeconds,
    editSeconds,
    waitSeconds,
    waitQualifies,
    builds,
    prompts,
    editTotal,
    waitTotal,
    promptTotal,
    eyeRestSeconds: promptTotal + (waitQualifies ? waitTotal : 0),
    ruleRequiredBreaks,
    breaksFromBuilds,
    breaksScheduled: prompts + breaksFromBuilds,
    coveragePercent,
    longestRunSeconds: longestRun,
    longestRunMinutes: Math.round((longestRun / 60) * 10) / 10,
    withinRule: longestRun <= RULE_INTERVAL_SECONDS,
    buildsPerHour: totalSeconds > 0 ? Math.round((builds / (totalSeconds / 3600)) * 10) / 10 : 0,
    truncated: phases.length >= MAX_PHASES,
  };
}

/** Which phase is running at `elapsedSeconds`. */
export function phaseAt(phases, elapsedSeconds) {
  const list = Array.isArray(phases) ? phases : [];
  const total = list.reduce((sum, phase) => sum + (isNum(phase.seconds) ? phase.seconds : 0), 0);
  const t = isNum(elapsedSeconds) && elapsedSeconds > 0 ? elapsedSeconds : 0;

  if (list.length === 0) {
    return { index: -1, phase: null, remaining: 0, overallProgress: 0, done: true, breaksTaken: 0 };
  }
  if (t >= total) {
    return {
      index: list.length,
      phase: {
        kind: PHASE_KINDS.DONE,
        label: "Session finished",
        hint: "Step away from the screen properly before the next block.",
        seconds: 0,
        cycle: 0,
      },
      remaining: 0,
      overallProgress: 1,
      done: true,
      breaksTaken: list.filter(
        (phase) => phase.kind === PHASE_KINDS.PROMPT || (phase.kind === PHASE_KINDS.BUILD && phase.qualifies),
      ).length,
    };
  }

  let cursor = 0;
  let breaksTaken = 0;
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
        breaksTaken,
      };
    }
    if (phase.kind === PHASE_KINDS.PROMPT || (phase.kind === PHASE_KINDS.BUILD && phase.qualifies)) {
      breaksTaken += 1;
    }
    cursor += length;
  }

  return { index: list.length, phase: null, remaining: 0, overallProgress: 1, done: true, breaksTaken };
}
