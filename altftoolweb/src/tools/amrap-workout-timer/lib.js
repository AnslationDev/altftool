/**
 * AMRAP (As Many Rounds As Possible) scoring and pace maths.
 *
 * An AMRAP fixes the clock and lets the work float: you repeat a fixed round of
 * movements until the cap expires. The score is conventionally written
 * "R rounds + N reps", where N is the reps completed in the unfinished round and
 * is always fewer than the reps in one full round. Total reps is the tiebreaker
 * used to compare athletes whose round counts match.
 *
 * Pure module: no React, no DOM, no clock reads. Elapsed time is passed in.
 */

/** Shortest sensible AMRAP cap, in seconds. Below 60 s it is a sprint set, not an AMRAP. */
export const MIN_CAP_SECONDS = 60;

/** Longest cap accepted (2 hours) so a typo cannot describe an all-day session. */
export const MAX_CAP_SECONDS = 7200;

/** Longest get-ready countdown offered before the clock starts. */
export const MAX_PREP_SECONDS = 60;

/** Upper bound on reps in one round — guards against a mis-typed rep scheme. */
export const MAX_REPS_PER_ROUND = 1000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Seconds -> m:ss (h:mm:ss past an hour). Total function: never NaN. */
export function formatClock(totalSeconds) {
  const safe = isNum(totalSeconds) ? Math.max(0, Math.round(totalSeconds)) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/** Standard AMRAP score notation: "8 rounds + 5 reps". */
export function formatScore(rounds, extraReps) {
  const r = isNum(rounds) ? Math.max(0, Math.floor(rounds)) : 0;
  const e = isNum(extraReps) ? Math.max(0, Math.floor(extraReps)) : 0;
  const roundWord = r === 1 ? "round" : "rounds";
  if (e === 0) return `${r} ${roundWord}`;
  return `${r} ${roundWord} + ${e} ${e === 1 ? "rep" : "reps"}`;
}

/**
 * Validate the AMRAP setup and describe the clock.
 *
 * @param {object} input
 * @param {number} input.capSeconds     Length of the AMRAP window.
 * @param {number} input.repsPerRound   Total reps in one complete round.
 * @param {number} [input.prepSeconds]  Countdown before the cap starts.
 */
export function buildAmrapPlan({ capSeconds, repsPerRound, prepSeconds = 0 } = {}) {
  if (![capSeconds, repsPerRound, prepSeconds].every(isNum)) {
    return { error: "Enter a number in every field." };
  }
  if (capSeconds < MIN_CAP_SECONDS || capSeconds > MAX_CAP_SECONDS) {
    return {
      error: `Time cap must be between ${MIN_CAP_SECONDS / 60} and ${MAX_CAP_SECONDS / 60} minutes.`,
    };
  }
  if (repsPerRound < 1 || repsPerRound > MAX_REPS_PER_ROUND) {
    return { error: `Reps per round must be between 1 and ${MAX_REPS_PER_ROUND}.` };
  }
  if (prepSeconds < 0 || prepSeconds > MAX_PREP_SECONDS) {
    return { error: `Prep countdown must be between 0 and ${MAX_PREP_SECONDS} seconds.` };
  }

  const cap = Math.round(capSeconds);
  const reps = Math.round(repsPerRound);
  const prep = Math.round(prepSeconds);

  return {
    capSeconds: cap,
    repsPerRound: reps,
    prepSeconds: prep,
    totalSessionSeconds: prep + cap,
  };
}

/**
 * Score and project an AMRAP from work done so far.
 *
 * @param {object} input
 * @param {number} input.capSeconds       The full time cap.
 * @param {number} input.repsPerRound     Reps in one round.
 * @param {number} input.roundsCompleted  Whole rounds finished.
 * @param {number} input.extraReps        Reps into the unfinished round (< repsPerRound).
 * @param {number} input.elapsedSeconds   Working time used so far (excludes prep).
 */
export function scoreAmrap({
  capSeconds,
  repsPerRound,
  roundsCompleted,
  extraReps,
  elapsedSeconds,
} = {}) {
  if (
    ![capSeconds, repsPerRound, roundsCompleted, extraReps, elapsedSeconds].every(isNum)
  ) {
    return { error: "Enter a number in every field." };
  }
  if (capSeconds < MIN_CAP_SECONDS || capSeconds > MAX_CAP_SECONDS) {
    return {
      error: `Time cap must be between ${MIN_CAP_SECONDS / 60} and ${MAX_CAP_SECONDS / 60} minutes.`,
    };
  }
  if (repsPerRound < 1 || repsPerRound > MAX_REPS_PER_ROUND) {
    return { error: `Reps per round must be between 1 and ${MAX_REPS_PER_ROUND}.` };
  }
  if (roundsCompleted < 0) return { error: "Rounds completed cannot be negative." };
  if (extraReps < 0) return { error: "Extra reps cannot be negative." };
  if (extraReps >= repsPerRound) {
    return {
      error: `Extra reps must be fewer than ${Math.round(repsPerRound)} — a full round counts as a round.`,
    };
  }
  if (elapsedSeconds <= 0) {
    return { error: "Enter the working time used so far to see a pace." };
  }
  if (elapsedSeconds > capSeconds) {
    return { error: "Elapsed time cannot exceed the time cap." };
  }

  const cap = Math.round(capSeconds);
  const reps = Math.round(repsPerRound);
  const rounds = Math.floor(roundsCompleted);
  const extra = Math.floor(extraReps);
  const elapsed = elapsedSeconds;

  const totalReps = rounds * reps + extra;
  if (totalReps === 0) {
    return { error: "Log at least one rep to calculate a pace." };
  }

  // Rounds expressed as a fraction, so a part-finished round still counts toward pace.
  const roundEquivalents = totalReps / reps;
  const secondsPerRound = elapsed / roundEquivalents;
  const secondsPerRep = elapsed / totalReps;
  const repsPerMinute = (totalReps / elapsed) * 60;

  // Straight-line projection: hold the current pace for the whole cap.
  const projectedTotalReps = Math.floor(totalReps * (cap / elapsed));
  const projectedRounds = Math.floor(projectedTotalReps / reps);
  const projectedExtra = projectedTotalReps - projectedRounds * reps;

  const remainingSeconds = cap - elapsed;

  return {
    totalReps,
    roundsCompleted: rounds,
    extraReps: extra,
    score: formatScore(rounds, extra),
    roundEquivalents,
    secondsPerRound,
    secondsPerRep,
    repsPerMinute,
    projectedTotalReps,
    projectedRounds,
    projectedExtra,
    projectedScore: formatScore(projectedRounds, projectedExtra),
    remainingSeconds,
    remainingRoundsAtPace: secondsPerRound > 0 ? remainingSeconds / secondsPerRound : 0,
    percentOfCapUsed: (elapsed / cap) * 100,
  };
}

/**
 * Clock position for a running AMRAP. Pure — elapsed is supplied by the caller.
 *
 * @returns {{phase:"prep"|"work"|"done", secondsLeftInPhase:number, secondsLeftInCap:number}}
 */
export function amrapTimerState(plan, elapsedSeconds) {
  if (!plan || plan.error) {
    return { phase: "done", secondsLeftInPhase: 0, secondsLeftInCap: 0, workSeconds: 0 };
  }
  const elapsed = isNum(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
  const { prepSeconds, capSeconds } = plan;

  if (elapsed < prepSeconds) {
    return {
      phase: "prep",
      secondsLeftInPhase: prepSeconds - elapsed,
      secondsLeftInCap: capSeconds,
      workSeconds: 0,
    };
  }
  const workSeconds = Math.min(capSeconds, elapsed - prepSeconds);
  if (workSeconds >= capSeconds) {
    return { phase: "done", secondsLeftInPhase: 0, secondsLeftInCap: 0, workSeconds: capSeconds };
  }
  return {
    phase: "work",
    secondsLeftInPhase: capSeconds - workSeconds,
    secondsLeftInCap: capSeconds - workSeconds,
    workSeconds,
  };
}
