/**
 * Pelvic floor muscle training (PFMT) session builder — pure logic, no DOM.
 *
 * The programme shape follows the standard supervised PFMT prescription used in
 * continence physiotherapy: a set of maximal voluntary contractions, each held
 * for a fixed count and followed by at least an equal relaxation, repeated
 * several times a day for a minimum of three months.
 */

/**
 * NICE guideline NG123 (urinary incontinence and pelvic organ prolapse in
 * women, 2019) recommends a supervised programme of at least 8 contractions
 * performed 3 times per day, continued for at least 3 months.
 */
export const GUIDELINE_REPS_PER_SESSION = 8;
export const GUIDELINE_SESSIONS_PER_DAY = 3;
export const GUIDELINE_DAILY_CONTRACTIONS =
  GUIDELINE_REPS_PER_SESSION * GUIDELINE_SESSIONS_PER_DAY; // 24
/** "At least 3 months" of daily training, expressed in whole weeks. */
export const GUIDELINE_PROGRAMME_WEEKS = 12;

/**
 * Standard PFMT protocols build the hold from a short 2-3 second squeeze up to
 * a 10 second maximal hold; 10 seconds is the usual ceiling for the long-hold
 * component, so anything longer is treated as an endurance variation.
 */
export const TARGET_HOLD_SECONDS = 10;

/** Input bounds. Anything outside these is refused rather than clamped. */
export const LIMITS = {
  hold: { min: 1, max: 30 },
  rest: { min: 0, max: 60 },
  reps: { min: 1, max: 50 },
  sets: { min: 1, max: 10 },
  setRest: { min: 0, max: 300 },
  prep: { min: 0, max: 60 },
  sessionsPerDay: { min: 1, max: 6 },
};

/**
 * Progression ladder. Rest is kept at or above the hold length early on because
 * an incompletely relaxed pelvic floor cannot produce a full next contraction.
 */
export const LEVELS = [
  {
    id: "starter",
    name: "Starter",
    weeks: "Weeks 1-2",
    hold: 3,
    rest: 6,
    reps: 8,
    sets: 2,
    setRest: 60,
    note: "Short squeezes with double rest while you learn to isolate the muscle.",
  },
  {
    id: "building",
    name: "Building",
    weeks: "Weeks 3-6",
    hold: 5,
    rest: 5,
    reps: 10,
    sets: 3,
    setRest: 60,
    note: "Equal hold and rest — the classic 5-and-5 build-up.",
  },
  {
    id: "steady",
    name: "Steady",
    weeks: "Weeks 7-12",
    hold: 8,
    rest: 8,
    reps: 10,
    sets: 3,
    setRest: 45,
    note: "Approaching the 10 second target hold used in supervised programmes.",
  },
  {
    id: "maintenance",
    name: "Maintenance",
    weeks: "12 weeks and beyond",
    hold: 10,
    rest: 10,
    reps: 12,
    sets: 3,
    setRest: 45,
    note: "Full 10 second holds, kept up long term to hold on to the gains.",
  },
];

export const PHASE_KINDS = {
  PREP: "prep",
  HOLD: "hold",
  RELEASE: "release",
  SET_REST: "setRest",
  DONE: "done",
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function checkRange(value, bounds, label, { integer = false } = {}) {
  if (!isNum(value)) return `${label} must be a number.`;
  if (integer && !Number.isInteger(value)) return `${label} must be a whole number.`;
  if (value < bounds.min) return `${label} cannot be below ${bounds.min}.`;
  if (value > bounds.max) return `${label} cannot be above ${bounds.max}.`;
  return null;
}

/** Seconds -> m:ss (or h:mm:ss past an hour). Never returns NaN. */
export function formatClock(totalSeconds) {
  const safe = isNum(totalSeconds) && totalSeconds > 0 ? Math.round(totalSeconds) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/**
 * Build a full timed session.
 *
 * @returns {{error:string}|{phases:Array,totalSeconds:number,...}}
 */
export function buildKegelPlan({
  hold,
  rest,
  reps,
  sets,
  setRest = 60,
  prep = 5,
  sessionsPerDay = GUIDELINE_SESSIONS_PER_DAY,
} = {}) {
  const problems = [
    checkRange(hold, LIMITS.hold, "Hold length (seconds)"),
    checkRange(rest, LIMITS.rest, "Release length (seconds)"),
    checkRange(reps, LIMITS.reps, "Repetitions per set", { integer: true }),
    checkRange(sets, LIMITS.sets, "Sets per session", { integer: true }),
    checkRange(setRest, LIMITS.setRest, "Rest between sets (seconds)"),
    checkRange(prep, LIMITS.prep, "Get-ready countdown (seconds)"),
    checkRange(sessionsPerDay, LIMITS.sessionsPerDay, "Sessions per day", { integer: true }),
  ].filter(Boolean);

  if (problems.length > 0) return { error: problems[0] };

  const wholeReps = Math.round(reps);
  const wholeSets = Math.round(sets);
  const wholeSessions = Math.round(sessionsPerDay);

  const phases = [];
  if (prep > 0) {
    phases.push({
      kind: PHASE_KINDS.PREP,
      label: "Get ready",
      hint: "Sit or lie comfortably. Breathe out, then lift and squeeze on the cue.",
      seconds: prep,
      set: 0,
      rep: 0,
    });
  }

  for (let set = 1; set <= wholeSets; set += 1) {
    for (let rep = 1; rep <= wholeReps; rep += 1) {
      phases.push({
        kind: PHASE_KINDS.HOLD,
        label: "Squeeze and lift",
        hint: "Keep breathing. Do not clench the buttocks or thighs.",
        seconds: hold,
        set,
        rep,
      });
      if (rest > 0) {
        phases.push({
          kind: PHASE_KINDS.RELEASE,
          label: "Release fully",
          hint: "Let go completely — a full relaxation is part of the exercise.",
          seconds: rest,
          set,
          rep,
        });
      }
    }
    if (set < wholeSets && setRest > 0) {
      phases.push({
        kind: PHASE_KINDS.SET_REST,
        label: `Rest before set ${set + 1}`,
        hint: "Longer break. Shake out, then reset your position.",
        seconds: setRest,
        set,
        rep: 0,
      });
    }
  }

  const contractionSeconds = wholeSets * wholeReps * hold;
  const relaxationSeconds = wholeSets * wholeReps * rest;
  const setRestSeconds = Math.max(0, wholeSets - 1) * setRest;
  const totalSeconds = prep + contractionSeconds + relaxationSeconds + setRestSeconds;

  const repsPerSession = wholeSets * wholeReps;
  const dailyContractions = repsPerSession * wholeSessions;
  const weeklyContractions = dailyContractions * 7;
  const programmeContractions = weeklyContractions * GUIDELINE_PROGRAMME_WEEKS;
  const dailySeconds = totalSeconds * wholeSessions;

  const meetsGuideline =
    repsPerSession >= GUIDELINE_REPS_PER_SESSION &&
    dailyContractions >= GUIDELINE_DAILY_CONTRACTIONS;

  const guidelineGap = Math.max(0, GUIDELINE_DAILY_CONTRACTIONS - dailyContractions);

  return {
    phases,
    totalSeconds,
    contractionSeconds,
    relaxationSeconds,
    setRestSeconds,
    prepSeconds: prep,
    repsPerSession,
    dailyContractions,
    weeklyContractions,
    programmeContractions,
    dailySeconds,
    meetsGuideline,
    guidelineGap,
    restToHoldRatio: hold > 0 ? rest / hold : 0,
    holdAtTarget: hold >= TARGET_HOLD_SECONDS,
    sets: wholeSets,
    reps: wholeReps,
    sessionsPerDay: wholeSessions,
    hold,
    rest,
  };
}

/**
 * Which phase is running at `elapsedSeconds`, and how much of it is left.
 * Returns a `done` phase once the session is over. Never returns NaN.
 */
export function phaseAt(phases, elapsedSeconds) {
  const list = Array.isArray(phases) ? phases : [];
  const total = list.reduce((sum, phase) => sum + (isNum(phase.seconds) ? phase.seconds : 0), 0);
  const t = isNum(elapsedSeconds) && elapsedSeconds > 0 ? elapsedSeconds : 0;

  if (list.length === 0) {
    return { index: -1, phase: null, remaining: 0, phaseProgress: 0, overallProgress: 0, done: true };
  }

  let cursor = 0;
  for (let index = 0; index < list.length; index += 1) {
    const phase = list[index];
    const length = isNum(phase.seconds) ? phase.seconds : 0;
    if (t < cursor + length || index === list.length - 1) {
      const into = Math.min(Math.max(t - cursor, 0), length);
      const finished = t >= total;
      return {
        index: finished ? list.length : index,
        phase: finished
          ? { kind: PHASE_KINDS.DONE, label: "Session complete", hint: "Well done — come back for your next session.", seconds: 0, set: 0, rep: 0 }
          : phase,
        remaining: finished ? 0 : Math.max(0, length - into),
        phaseProgress: length > 0 ? into / length : 1,
        overallProgress: total > 0 ? Math.min(1, t / total) : 1,
        done: finished,
      };
    }
    cursor += length;
  }

  return { index: list.length, phase: null, remaining: 0, phaseProgress: 1, overallProgress: 1, done: true };
}
