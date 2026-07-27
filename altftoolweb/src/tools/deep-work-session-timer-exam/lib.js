/**
 * Exam-style deep work session planning.
 *
 * The session is split the way a real written exam runs:
 *   1. Reading phase — CBSE board exams give 15 minutes of question-paper
 *      reading time before writing starts; that convention is the default.
 *   2. Solving phase — the main block, with pacing checkpoints at a fixed
 *      interval so you can compare progress against the clock.
 *   3. Review phase — a final buffer reserved for revision, the standard
 *      exam-technique advice of keeping the last 10-15 minutes for checking.
 *
 * All functions are pure; the UI owns the ticking clock and passes elapsed
 * seconds in.
 */

/** CBSE-style question paper reading time, minutes. */
export const DEFAULT_READING_MINUTES = 15;

/** Standard exam-technique review buffer at the end, minutes. */
export const DEFAULT_REVIEW_MINUTES = 15;

/** Default pacing checkpoint interval, minutes. */
export const DEFAULT_CHECKPOINT_MINUTES = 30;

/** Common exam durations, minutes. */
export const SESSION_PRESETS = [
  { id: "board-3h", label: "Board / JEE-style paper — 3 hours", minutes: 180 },
  { id: "neet", label: "NEET-style paper — 3 hours 20 minutes", minutes: 200 },
  { id: "upsc-2h", label: "UPSC CSAT-style paper — 2 hours", minutes: 120 },
  { id: "half", label: "Half paper — 90 minutes", minutes: 90 },
];

/** The solving phase must be at least this long for the plan to make sense. */
export const MIN_SOLVING_MINUTES = 10;

/** Cap on session length: nobody should deep-work longer than 6h in one block. */
export const MAX_SESSION_MINUTES = 360;

/**
 * Build the phase plan.
 * @returns {object} plan { totalMinutes, phases:[{id,label,startMinute,endMinute}], checkpoints:[minute] } or { error }.
 */
export function buildSessionPlan({
  totalMinutes,
  readingMinutes = DEFAULT_READING_MINUTES,
  reviewMinutes = DEFAULT_REVIEW_MINUTES,
  checkpointEveryMinutes = DEFAULT_CHECKPOINT_MINUTES,
}) {
  const total = Number(totalMinutes);
  const reading = Number(readingMinutes);
  const review = Number(reviewMinutes);
  const every = Number(checkpointEveryMinutes);

  if (!Number.isFinite(total) || total <= 0) {
    return { error: "Session length must be more than zero minutes." };
  }
  if (total > MAX_SESSION_MINUTES) {
    return { error: `Session length cannot exceed ${MAX_SESSION_MINUTES} minutes (6 hours).` };
  }
  if (!Number.isFinite(reading) || reading < 0) {
    return { error: "Reading time cannot be negative." };
  }
  if (!Number.isFinite(review) || review < 0) {
    return { error: "Review time cannot be negative." };
  }
  if (!Number.isFinite(every) || every <= 0) {
    return { error: "Checkpoint interval must be more than zero minutes." };
  }

  const solvingMinutes = total - reading - review;
  if (solvingMinutes < MIN_SOLVING_MINUTES) {
    return {
      error: `Reading plus review leaves only ${Math.max(0, solvingMinutes)} minutes to solve — keep at least ${MIN_SOLVING_MINUTES}.`,
    };
  }

  const solvingStart = reading;
  const solvingEnd = total - review;

  const phases = [];
  if (reading > 0) {
    phases.push({ id: "reading", label: "Read & plan", startMinute: 0, endMinute: reading });
  }
  phases.push({ id: "solving", label: "Deep work", startMinute: solvingStart, endMinute: solvingEnd });
  if (review > 0) {
    phases.push({ id: "review", label: "Review", startMinute: solvingEnd, endMinute: total });
  }

  // Checkpoints fall inside the solving phase only, at fixed intervals after it starts.
  const checkpoints = [];
  for (let m = solvingStart + every; m < solvingEnd; m += every) {
    checkpoints.push(m);
  }

  return { totalMinutes: total, phases, checkpoints, solvingMinutes };
}

/**
 * Where the session stands at a given elapsed time.
 * @param {object} input
 * @param {number} input.elapsedSeconds
 * @param {object} input.plan  A plan returned by buildSessionPlan.
 * @returns {object} status (never an error for a valid plan; elapsed is clamped).
 */
export function sessionStatus({ elapsedSeconds, plan }) {
  const totalSeconds = plan.totalMinutes * 60;
  const elapsed = Math.min(Math.max(0, Number(elapsedSeconds) || 0), totalSeconds);
  const finished = elapsed >= totalSeconds;

  const currentPhase = finished
    ? null
    : plan.phases.find(
        (p) => elapsed >= p.startMinute * 60 && elapsed < p.endMinute * 60,
      ) ?? plan.phases[plan.phases.length - 1];

  const nextCheckpointMinute = finished
    ? null
    : (plan.checkpoints.find((m) => m * 60 > elapsed) ?? null);

  return {
    finished,
    elapsedSeconds: elapsed,
    remainingSeconds: totalSeconds - elapsed,
    progressPercent: Math.round((elapsed / totalSeconds) * 1000) / 10,
    currentPhaseId: currentPhase ? currentPhase.id : null,
    currentPhaseLabel: currentPhase ? currentPhase.label : "Finished",
    phaseRemainingSeconds: currentPhase
      ? currentPhase.endMinute * 60 - elapsed
      : 0,
    nextCheckpointMinute,
    nextCheckpointInSeconds:
      nextCheckpointMinute === null ? null : nextCheckpointMinute * 60 - elapsed,
  };
}

/** Format seconds as h:mm:ss (or m:ss under an hour). */
export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`;
}
