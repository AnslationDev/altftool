/**
 * Tabata interval maths.
 *
 * The protocol comes from Izumi Tabata's 1996 study on Japanese speed skaters:
 * 20 seconds of all-out work at roughly 170% of VO2max, 10 seconds of rest,
 * repeated 8 times — exactly 4 minutes of total work time. Everything else here
 * (longer work blocks, extra rounds, multiple sets) is a variation on that shape.
 *
 * Pure module: no React, no DOM, no clock reads. Elapsed time is passed in.
 */

/** Work seconds in the original Tabata protocol (Tabata et al., 1996). */
export const TABATA_WORK_SECONDS = 20;

/** Rest seconds in the original protocol — a 2:1 work-to-rest ratio. */
export const TABATA_REST_SECONDS = 10;

/** Rounds in one classic Tabata set: 8 x 30 s = 4 minutes. */
export const TABATA_ROUNDS = 8;

/** Bounds that keep a "Tabata-style" block recognisable rather than a typo. */
export const MIN_PHASE_SECONDS = 5;
export const MAX_PHASE_SECONDS = 300;
export const MAX_ROUNDS = 60;
export const MAX_SETS = 20;
export const MAX_PREP_SECONDS = 60;
export const MAX_SET_REST_SECONDS = 600;

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

/** Work-to-rest ratio as a readable string, e.g. "2:1". */
export function ratioLabel(workSeconds, restSeconds) {
  if (!isNum(workSeconds) || !isNum(restSeconds) || restSeconds <= 0 || workSeconds <= 0) {
    return "—";
  }
  const ratio = workSeconds / restSeconds;
  return `${Math.round(ratio * 100) / 100}:1`;
}

/**
 * Build a Tabata (or Tabata-style) session.
 *
 * @param {object} input
 * @param {number} input.workSeconds        Work block length.
 * @param {number} input.restSeconds        Rest block length.
 * @param {number} input.rounds             Work/rest cycles per set.
 * @param {number} [input.sets=1]           Number of sets.
 * @param {number} [input.setRestSeconds=0] Rest between sets.
 * @param {number} [input.prepSeconds=0]    Countdown before round 1.
 */
export function buildTabataPlan({
  workSeconds,
  restSeconds,
  rounds,
  sets = 1,
  setRestSeconds = 0,
  prepSeconds = 0,
} = {}) {
  const values = [workSeconds, restSeconds, rounds, sets, setRestSeconds, prepSeconds];
  if (!values.every(isNum)) return { error: "Enter a number in every field." };

  if (workSeconds < MIN_PHASE_SECONDS || workSeconds > MAX_PHASE_SECONDS) {
    return { error: `Work block must be between ${MIN_PHASE_SECONDS} and ${MAX_PHASE_SECONDS} seconds.` };
  }
  if (restSeconds < 0 || restSeconds > MAX_PHASE_SECONDS) {
    return { error: `Rest block must be between 0 and ${MAX_PHASE_SECONDS} seconds.` };
  }
  if (rounds < 1 || rounds > MAX_ROUNDS) {
    return { error: `Rounds per set must be between 1 and ${MAX_ROUNDS}.` };
  }
  if (sets < 1 || sets > MAX_SETS) return { error: `Sets must be between 1 and ${MAX_SETS}.` };
  if (setRestSeconds < 0 || setRestSeconds > MAX_SET_REST_SECONDS) {
    return { error: `Rest between sets must be between 0 and ${MAX_SET_REST_SECONDS} seconds.` };
  }
  if (prepSeconds < 0 || prepSeconds > MAX_PREP_SECONDS) {
    return { error: `Prep countdown must be between 0 and ${MAX_PREP_SECONDS} seconds.` };
  }

  const work = Math.round(workSeconds);
  const rest = Math.round(restSeconds);
  const totalRounds = Math.round(rounds);
  const totalSets = Math.round(sets);
  const setRest = Math.round(setRestSeconds);
  const prep = Math.round(prepSeconds);

  const cycleSeconds = work + rest;
  const setSeconds = cycleSeconds * totalRounds;
  const totalWorkSeconds = work * totalRounds * totalSets;
  const totalRestSeconds = rest * totalRounds * totalSets + setRest * (totalSets - 1);
  const totalSessionSeconds = prep + setSeconds * totalSets + setRest * (totalSets - 1);

  const isClassic =
    work === TABATA_WORK_SECONDS &&
    rest === TABATA_REST_SECONDS &&
    totalRounds === TABATA_ROUNDS;

  return {
    workSeconds: work,
    restSeconds: rest,
    rounds: totalRounds,
    sets: totalSets,
    setRestSeconds: setRest,
    prepSeconds: prep,
    cycleSeconds,
    setSeconds,
    totalRounds: totalRounds * totalSets,
    totalWorkSeconds,
    totalRestSeconds,
    totalSessionSeconds,
    workShare: totalSessionSeconds > 0 ? totalWorkSeconds / (totalSessionSeconds - prep) : 0,
    ratio: ratioLabel(work, rest),
    isClassic,
  };
}

/**
 * Where the session is at a given elapsed time. Pure — elapsed comes from the caller.
 *
 * @returns {{phase:"prep"|"work"|"rest"|"set-rest"|"done", round:number, set:number,
 *            secondsLeftInPhase:number, secondsLeftInSession:number, roundsDone:number}}
 */
export function tabataTimerState(plan, elapsedSeconds) {
  const blank = {
    phase: "done",
    round: 0,
    set: 0,
    secondsLeftInPhase: 0,
    secondsLeftInSession: 0,
    roundsDone: 0,
  };
  if (!plan || plan.error) return blank;

  const elapsed = isNum(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
  const {
    prepSeconds,
    workSeconds,
    restSeconds,
    rounds,
    sets,
    setRestSeconds,
    cycleSeconds,
    setSeconds,
    totalSessionSeconds,
  } = plan;

  const secondsLeftInSession = Math.max(0, totalSessionSeconds - elapsed);

  if (elapsed < prepSeconds) {
    return {
      phase: "prep",
      round: 0,
      set: 1,
      secondsLeftInPhase: prepSeconds - elapsed,
      secondsLeftInSession,
      roundsDone: 0,
    };
  }

  let t = elapsed - prepSeconds;
  for (let set = 1; set <= sets; set += 1) {
    if (t < setSeconds) {
      const index = Math.floor(t / cycleSeconds);
      const intoCycle = t - index * cycleSeconds;
      const working = intoCycle < workSeconds;
      return {
        phase: working ? "work" : "rest",
        round: index + 1,
        set,
        secondsLeftInPhase: working ? workSeconds - intoCycle : cycleSeconds - intoCycle,
        secondsLeftInSession,
        roundsDone: (set - 1) * rounds + index,
      };
    }
    t -= setSeconds;
    if (set < sets) {
      if (t < setRestSeconds) {
        return {
          phase: "set-rest",
          round: rounds,
          set,
          secondsLeftInPhase: setRestSeconds - t,
          secondsLeftInSession,
          roundsDone: set * rounds,
        };
      }
      t -= setRestSeconds;
    }
  }

  return { ...blank, round: rounds, set: sets, roundsDone: rounds * sets };
}

/** Flat list of every phase, for a printable session table. */
export function tabataSchedule(plan) {
  if (!plan || plan.error) return [];
  const rows = [];
  let cursor = plan.prepSeconds;
  for (let set = 1; set <= plan.sets; set += 1) {
    for (let round = 1; round <= plan.rounds; round += 1) {
      rows.push({
        key: `s${set}r${round}w`,
        set,
        round,
        phase: "Work",
        seconds: plan.workSeconds,
        startSeconds: cursor,
      });
      cursor += plan.workSeconds;
      if (plan.restSeconds > 0) {
        rows.push({
          key: `s${set}r${round}r`,
          set,
          round,
          phase: "Rest",
          seconds: plan.restSeconds,
          startSeconds: cursor,
        });
        cursor += plan.restSeconds;
      }
    }
    if (set < plan.sets && plan.setRestSeconds > 0) {
      rows.push({
        key: `s${set}break`,
        set,
        round: 0,
        phase: "Set break",
        seconds: plan.setRestSeconds,
        startSeconds: cursor,
      });
      cursor += plan.setRestSeconds;
    }
  }
  return rows;
}
