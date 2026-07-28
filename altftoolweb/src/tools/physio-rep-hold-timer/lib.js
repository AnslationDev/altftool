/**
 * Physio rep and hold timer — pure logic.
 *
 * A rehab prescription is normally written as sets x reps with a tempo: how
 * many seconds to lift (concentric), how long to hold at the end position
 * (isometric), and how many seconds to lower (eccentric), plus rest between
 * reps and between sets. From those six numbers every other figure follows.
 *
 *   rep time            = concentric + hold + eccentric + rest between reps
 *   working time in set = reps x rep time - one rest between reps
 *   session time        = sets x working time + (sets - 1) x rest between sets
 *   time under tension  = sets x reps x (concentric + hold + eccentric)
 *
 * Phase lookup is analytical rather than a pre-built array, so it stays exact
 * for long sessions. Nothing here reads the clock — elapsed time is an input.
 */

export const MAX_SETS = 20;
export const MAX_REPS = 100;
export const MAX_PHASE_SECONDS = 300;
export const MAX_REST_SECONDS = 600;

export const PHASE_LABELS = {
  concentric: "Lift",
  hold: "Hold",
  eccentric: "Lower",
  "rest-rep": "Reset",
  "rest-set": "Rest between sets",
  done: "Finished",
};

/**
 * Prescriptions taken from published rehabilitation protocols. Each note names
 * the protocol so the numbers can be checked against the source.
 */
export const PRESETS = [
  {
    id: "isometric-tendon",
    label: "Isometric tendinopathy holds",
    sets: 5,
    reps: 1,
    concentric: 3,
    hold: 45,
    eccentric: 3,
    restRep: 0,
    restSet: 120,
    note: "Five 45-second isometric holds at about 70% of a maximal contraction, 2 minutes between holds — the loading pattern used in isometric tendinopathy research.",
  },
  {
    id: "alfredson",
    label: "Eccentric heel drops (Alfredson)",
    sets: 3,
    reps: 15,
    concentric: 2,
    hold: 0,
    eccentric: 3,
    restRep: 1,
    restSet: 60,
    note: "The Alfredson protocol for Achilles tendinopathy: 3 sets of 15 slow eccentric heel drops, performed twice a day.",
  },
  {
    id: "hsr",
    label: "Heavy slow resistance",
    sets: 4,
    reps: 8,
    concentric: 3,
    hold: 0,
    eccentric: 3,
    restRep: 2,
    restSet: 120,
    note: "Heavy slow resistance training uses a 3-second lift and a 3-second lower, three times a week, with load progressed from a 15RM towards a 6RM.",
  },
  {
    id: "quad-set",
    label: "Quad sets (post-op knee)",
    sets: 3,
    reps: 10,
    concentric: 2,
    hold: 5,
    eccentric: 2,
    restRep: 3,
    restSet: 30,
    note: "Static quadriceps contractions held for about 5 seconds, a standard early-stage knee rehab drill.",
  },
  {
    id: "glute-bridge",
    label: "Glute bridge with hold",
    sets: 3,
    reps: 10,
    concentric: 2,
    hold: 5,
    eccentric: 3,
    restRep: 2,
    restSet: 60,
    note: "Bridge up over 2 seconds, hold 5, lower over 3 — a common hip and lumbar rehab progression.",
  },
  {
    id: "plank",
    label: "Plank holds",
    sets: 3,
    reps: 1,
    concentric: 2,
    hold: 30,
    eccentric: 2,
    restRep: 0,
    restSet: 60,
    note: "Three 30-second holds with a minute of rest between them.",
  },
  {
    id: "rotator-cuff",
    label: "Rotator cuff endurance",
    sets: 3,
    reps: 15,
    concentric: 2,
    hold: 2,
    eccentric: 3,
    restRep: 1,
    restSet: 60,
    note: "Higher-repetition, low-load shoulder work with a short end-range hold.",
  },
];

/** Seconds to "M:SS" or "H:MM:SS". */
export function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Turn a prescription into all its derived timings.
 *
 * @param {object} input
 * @param {number} input.sets
 * @param {number} input.reps
 * @param {number} input.concentricSeconds
 * @param {number} input.holdSeconds
 * @param {number} input.eccentricSeconds
 * @param {number} input.restRepSeconds
 * @param {number} input.restSetSeconds
 * @param {number} [input.sessionsPerDay]
 * @param {number} [input.daysPerWeek]
 * @returns {object|{error: string}}
 */
export function buildRepPlan({
  sets,
  reps,
  concentricSeconds,
  holdSeconds,
  eccentricSeconds,
  restRepSeconds,
  restSetSeconds,
  sessionsPerDay = 1,
  daysPerWeek = 7,
}) {
  const numbers = {
    sets: Number(sets),
    reps: Number(reps),
    concentric: Number(concentricSeconds),
    hold: Number(holdSeconds),
    eccentric: Number(eccentricSeconds),
    restRep: Number(restRepSeconds),
    restSet: Number(restSetSeconds),
  };

  if (Object.values(numbers).some((value) => !Number.isFinite(value))) {
    return { error: "Every field needs a number." };
  }
  if (Object.values(numbers).some((value) => value < 0)) {
    return { error: "Times and counts cannot be negative." };
  }
  if (!Number.isInteger(numbers.sets) || numbers.sets < 1 || numbers.sets > MAX_SETS) {
    return { error: `Sets should be a whole number from 1 to ${MAX_SETS}.` };
  }
  if (!Number.isInteger(numbers.reps) || numbers.reps < 1 || numbers.reps > MAX_REPS) {
    return { error: `Reps should be a whole number from 1 to ${MAX_REPS}.` };
  }
  if ([numbers.concentric, numbers.hold, numbers.eccentric].some((value) => value > MAX_PHASE_SECONDS)) {
    return { error: `Lift, hold and lower must each be ${MAX_PHASE_SECONDS} seconds or less.` };
  }
  if (numbers.restRep > MAX_REST_SECONDS || numbers.restSet > MAX_REST_SECONDS) {
    return { error: `Rest periods must be ${MAX_REST_SECONDS} seconds or less.` };
  }

  const workSeconds = numbers.concentric + numbers.hold + numbers.eccentric;
  if (workSeconds <= 0) {
    return { error: "Lift, hold and lower cannot all be zero — a rep needs some duration." };
  }

  const repSeconds = workSeconds + numbers.restRep;
  const setSeconds = numbers.reps * repSeconds - numbers.restRep;
  const totalSeconds = numbers.sets * setSeconds + (numbers.sets - 1) * numbers.restSet;
  const tutPerSet = numbers.reps * workSeconds;
  const totalTut = numbers.sets * tutPerSet;

  const perDay = Number(sessionsPerDay);
  const perWeek = Number(daysPerWeek);
  if (!Number.isFinite(perDay) || perDay < 1 || perDay > 10) {
    return { error: "Sessions per day should be between 1 and 10." };
  }
  if (!Number.isFinite(perWeek) || perWeek < 1 || perWeek > 7) {
    return { error: "Days per week should be between 1 and 7." };
  }

  return {
    ...numbers,
    workSeconds,
    repSeconds,
    setSeconds,
    totalSeconds,
    tutPerSet,
    totalTut,
    totalReps: numbers.sets * numbers.reps,
    sessionsPerDay: perDay,
    daysPerWeek: perWeek,
    weeklySeconds: Math.round(totalSeconds * perDay * perWeek),
    weeklyReps: numbers.sets * numbers.reps * perDay * perWeek,
    restShareOfSessionPct:
      totalSeconds > 0 ? Math.round(((totalSeconds - totalTut) / totalSeconds) * 100) : 0,
  };
}

/**
 * Where the session is at a given elapsed time.
 *
 * @param {number} elapsedSeconds
 * @param {object} plan - the object returned by buildRepPlan
 * @returns {{phase: string, phaseLabel: string, remainingSeconds: number, phaseSeconds: number,
 *            setNumber: number, repNumber: number, done: boolean, progressPct: number,
 *            sessionProgressPct: number}}
 */
export function phaseAt(elapsedSeconds, plan) {
  const idle = {
    phase: "done",
    phaseLabel: PHASE_LABELS.done,
    remainingSeconds: 0,
    phaseSeconds: 0,
    setNumber: 0,
    repNumber: 0,
    done: true,
    progressPct: 100,
    sessionProgressPct: 100,
  };
  if (!plan || plan.error || !(plan.repSeconds > 0)) return idle;

  const t = Math.max(0, Number(elapsedSeconds) || 0);
  const sessionProgressPct =
    plan.totalSeconds > 0 ? Math.min(100, Math.round((t / plan.totalSeconds) * 100)) : 100;

  if (t >= plan.totalSeconds) return { ...idle, sessionProgressPct: 100 };

  const cycleSeconds = plan.setSeconds + plan.restSet;
  let setIndex = cycleSeconds > 0 ? Math.floor(t / cycleSeconds) : 0;
  if (setIndex > plan.sets - 1) setIndex = plan.sets - 1;
  const timeInSet = t - setIndex * cycleSeconds;

  const make = (phase, phaseSeconds, elapsedInPhase, repNumber) => ({
    phase,
    phaseLabel: PHASE_LABELS[phase],
    phaseSeconds,
    remainingSeconds: Math.max(0, Math.ceil(phaseSeconds - elapsedInPhase)),
    setNumber: setIndex + 1,
    repNumber,
    done: false,
    progressPct: phaseSeconds > 0 ? Math.min(100, Math.round((elapsedInPhase / phaseSeconds) * 100)) : 100,
    sessionProgressPct,
  });

  if (timeInSet >= plan.setSeconds) {
    return make("rest-set", plan.restSet, timeInSet - plan.setSeconds, plan.reps);
  }

  const repIndex = Math.min(plan.reps - 1, Math.floor(timeInSet / plan.repSeconds));
  const timeInRep = timeInSet - repIndex * plan.repSeconds;
  const repNumber = repIndex + 1;

  if (timeInRep < plan.concentric) {
    return make("concentric", plan.concentric, timeInRep, repNumber);
  }
  if (timeInRep < plan.concentric + plan.hold) {
    return make("hold", plan.hold, timeInRep - plan.concentric, repNumber);
  }
  if (timeInRep < plan.workSeconds) {
    return make("eccentric", plan.eccentric, timeInRep - plan.concentric - plan.hold, repNumber);
  }
  return make("rest-rep", plan.restRep, timeInRep - plan.workSeconds, repNumber);
}
