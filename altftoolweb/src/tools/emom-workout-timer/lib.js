/**
 * EMOM (Every Minute On the Minute) planning maths.
 *
 * An EMOM prescribes a fixed interval (classically 60 seconds — hence the name).
 * At the top of every interval you start the prescribed reps; whatever time is
 * left inside that interval is your rest. Variants keep the same structure with
 * a different interval: E2MOM = 120 s, E90 = 90 s, E30 = 30 s.
 *
 * Pure module: no React, no DOM, no clock reads. Elapsed time is always passed in.
 */

/** Classic EMOM interval, in seconds — the "minute" in every-minute-on-the-minute. */
export const DEFAULT_INTERVAL_SECONDS = 60;

/** Shortest interval this planner accepts. Below ~20 s an interval stops being an
 *  EMOM and becomes a continuous set, because transition time swallows the rest. */
export const MIN_INTERVAL_SECONDS = 10;

/** Longest interval accepted (E10MOM). Beyond 10 minutes it is no longer interval work. */
export const MAX_INTERVAL_SECONDS = 600;

/** Upper bound on rounds so a plan cannot describe a multi-hour session by typo. */
export const MAX_ROUNDS = 200;

/** Longest prep/get-ready countdown offered before round 1. */
export const MAX_PREP_SECONDS = 60;

/**
 * Common coaching guidance for EMOM programming: the work inside each interval
 * should finish with roughly a third of the interval left, so the effort stays
 * repeatable. Above this share of the interval the EMOM is flagged as too dense.
 */
export const RECOMMENDED_MAX_WORK_SHARE = 0.7;

/** Descriptive bands for how hard an EMOM interval is packed. */
export const DENSITY_BANDS = [
  { max: 0.35, label: "Light", note: "Plenty of rest — good for skill work, technique or warm-ups." },
  { max: 0.55, label: "Moderate", note: "Balanced work and rest — the classic conditioning EMOM." },
  { max: 0.7, label: "Hard", note: "Little rest left. Sustainable only for short blocks or trained athletes." },
  { max: 1, label: "Very hard", note: "Under 30% of the interval is rest — expect the last rounds to break down." },
  { max: Infinity, label: "Overloaded", note: "Work spills past the interval. Cut reps, slow the pace or lengthen the interval." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Seconds -> m:ss (or h:mm:ss past an hour). Total function: never NaN. */
export function formatClock(totalSeconds) {
  const safe = isNum(totalSeconds) ? Math.max(0, Math.round(totalSeconds)) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/** Pick the density band for a work share (workPerRound / interval). */
export function densityBand(workShare) {
  const share = isNum(workShare) ? workShare : 0;
  return DENSITY_BANDS.find((band) => share <= band.max) ?? DENSITY_BANDS[DENSITY_BANDS.length - 1];
}

/**
 * Build a full EMOM plan.
 *
 * @param {object} input
 * @param {number} input.intervalSeconds  Length of one interval.
 * @param {number} input.rounds           Number of intervals.
 * @param {number} input.repsPerRound     Reps prescribed each interval.
 * @param {number} input.secondsPerRep    Your realistic pace per rep, in seconds.
 * @param {number} [input.prepSeconds=0]  Countdown before round 1.
 * @returns {object} plan, or { error } when the input cannot make a real session.
 */
export function buildEmomPlan({
  intervalSeconds,
  rounds,
  repsPerRound,
  secondsPerRep,
  prepSeconds = 0,
} = {}) {
  if (![intervalSeconds, rounds, repsPerRound, secondsPerRep, prepSeconds].every(isNum)) {
    return { error: "Enter a number in every field." };
  }
  if (intervalSeconds < MIN_INTERVAL_SECONDS || intervalSeconds > MAX_INTERVAL_SECONDS) {
    return {
      error: `Interval must be between ${MIN_INTERVAL_SECONDS} and ${MAX_INTERVAL_SECONDS} seconds.`,
    };
  }
  if (rounds < 1 || rounds > MAX_ROUNDS) {
    return { error: `Rounds must be between 1 and ${MAX_ROUNDS}.` };
  }
  if (repsPerRound < 1) return { error: "Reps per round must be at least 1." };
  if (secondsPerRep <= 0) return { error: "Seconds per rep must be greater than zero." };
  if (prepSeconds < 0 || prepSeconds > MAX_PREP_SECONDS) {
    return { error: `Prep countdown must be between 0 and ${MAX_PREP_SECONDS} seconds.` };
  }

  const interval = Math.round(intervalSeconds);
  const totalRounds = Math.round(rounds);
  const reps = Math.round(repsPerRound);
  const prep = Math.round(prepSeconds);

  const workPerRoundSeconds = reps * secondsPerRep;
  const restPerRoundSeconds = interval - workPerRoundSeconds;
  const workShare = workPerRoundSeconds / interval;
  const band = densityBand(workShare);

  const totalReps = reps * totalRounds;
  const totalWorkSeconds = workPerRoundSeconds * totalRounds;
  const totalRestSeconds = Math.max(0, restPerRoundSeconds) * totalRounds;
  const totalSessionSeconds = prep + interval * totalRounds;

  const schedule = [];
  for (let index = 0; index < totalRounds; index += 1) {
    const startSeconds = prep + index * interval;
    schedule.push({
      round: index + 1,
      startSeconds,
      endSeconds: startSeconds + interval,
      cumulativeReps: reps * (index + 1),
    });
  }

  return {
    intervalSeconds: interval,
    rounds: totalRounds,
    repsPerRound: reps,
    prepSeconds: prep,
    workPerRoundSeconds,
    restPerRoundSeconds,
    workShare,
    overrunSeconds: Math.max(0, -restPerRoundSeconds),
    sustainable: workShare <= RECOMMENDED_MAX_WORK_SHARE,
    densityLabel: band.label,
    densityNote: band.note,
    totalReps,
    totalWorkSeconds,
    totalRestSeconds,
    totalSessionSeconds,
    repsPerMinute: (reps / interval) * 60,
    schedule,
  };
}

/**
 * Where a runner is at a given elapsed time. Pure — elapsed comes from the caller.
 *
 * @returns {{phase:"prep"|"work"|"rest"|"done", round:number, secondsIntoRound:number,
 *            secondsLeftInRound:number, secondsLeftInPhase:number, repsDone:number,
 *            secondsLeftInSession:number}}
 */
export function emomTimerState(plan, elapsedSeconds) {
  const blank = {
    phase: "done",
    round: 0,
    secondsIntoRound: 0,
    secondsLeftInRound: 0,
    secondsLeftInPhase: 0,
    repsDone: 0,
    secondsLeftInSession: 0,
  };
  if (!plan || plan.error) return blank;

  const elapsed = isNum(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
  const { prepSeconds, intervalSeconds, rounds, repsPerRound, workPerRoundSeconds } = plan;
  const sessionLength = prepSeconds + intervalSeconds * rounds;
  const secondsLeftInSession = Math.max(0, sessionLength - elapsed);

  if (elapsed < prepSeconds) {
    return {
      phase: "prep",
      round: 0,
      secondsIntoRound: 0,
      secondsLeftInRound: intervalSeconds,
      secondsLeftInPhase: prepSeconds - elapsed,
      repsDone: 0,
      secondsLeftInSession,
    };
  }

  const intoRounds = elapsed - prepSeconds;
  if (intoRounds >= intervalSeconds * rounds) {
    return { ...blank, round: rounds, repsDone: repsPerRound * rounds };
  }

  const index = Math.floor(intoRounds / intervalSeconds);
  const secondsIntoRound = intoRounds - index * intervalSeconds;
  const working = secondsIntoRound < workPerRoundSeconds;

  return {
    phase: working ? "work" : "rest",
    round: index + 1,
    secondsIntoRound,
    secondsLeftInRound: intervalSeconds - secondsIntoRound,
    secondsLeftInPhase: working
      ? Math.min(workPerRoundSeconds - secondsIntoRound, intervalSeconds - secondsIntoRound)
      : intervalSeconds - secondsIntoRound,
    repsDone: repsPerRound * index,
    secondsLeftInSession,
  };
}
