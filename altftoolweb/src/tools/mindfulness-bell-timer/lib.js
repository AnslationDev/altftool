/**
 * Mindfulness bell timer.
 *
 * A "bell of mindfulness" is a practice from the Plum Village tradition of Thich
 * Nhat Hanh: whenever the bell sounds, you stop what you are doing, stay still
 * and follow three breaths before continuing. Two scheduling styles are used in
 * practice, and both are supported here:
 *   - Interval bells, at a fixed spacing, which suit formal sitting practice
 *     where the bell marks stages of a session.
 *   - Random bells within a minimum and maximum gap, which suit informal daily
 *     practice: because the bell cannot be anticipated, the pause is a genuine
 *     interruption rather than something you count down to.
 *
 * The random schedule is generated from a seed you pass in, so the same seed
 * always produces the same bells. Nothing in this module reads the clock or
 * calls Math.random - both would break purity and make the schedule untestable.
 */

export const MIN_SESSION_MINUTES = 1;
export const MAX_SESSION_MINUTES = 180;
export const MIN_INTERVAL_MINUTES = 0.5;
export const MAX_INTERVAL_MINUTES = 60;
export const MIN_GAP_MINUTES = 0.5;
export const MAX_GAP_MINUTES = 60;
/** A schedule longer than this many bells is almost certainly a mistake. */
export const MAX_BELLS = 500;

export const MODES = {
  interval: {
    key: "interval",
    label: "Fixed interval",
    note: "Evenly spaced pause bells; the closing bell (if enabled) may fall short of the next full interval. Predictable, which suits formal sitting practice.",
  },
  random: {
    key: "random",
    label: "Random gaps",
    note: "Unpredictable spacing inside a range you set, so the pause interrupts you rather than being anticipated.",
  },
};

/** Three breaths is the traditional length of the pause when the bell sounds. */
export const PAUSE_BREATHS = 3;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * mulberry32 - a small, well-known deterministic PRNG.
 * Same seed always yields the same stream, which keeps the schedule pure.
 */
export function seededRandom(seed) {
  let state = (Number.isFinite(seed) ? Math.floor(seed) : 0) >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build the bell schedule for one session.
 *
 * @param {object} input
 * @param {number} input.minutes          session length in minutes
 * @param {string} input.mode             "interval" or "random"
 * @param {number} input.intervalMinutes  spacing for interval mode
 * @param {number} input.minGapMinutes    smallest gap for random mode
 * @param {number} input.maxGapMinutes    largest gap for random mode
 * @param {boolean} input.startBell       ring at the very start
 * @param {boolean} input.endBell         ring at the very end
 * @param {number} input.seed             seed for the random schedule
 */
export function buildBellSchedule({
  minutes = 20,
  mode = "interval",
  intervalMinutes = 5,
  minGapMinutes = 2,
  maxGapMinutes = 7,
  startBell = true,
  endBell = true,
  seed = 1,
} = {}) {
  const modeSpec = MODES[mode];
  if (!modeSpec) return { error: "Choose either fixed interval or random gaps." };
  if (!isNum(minutes)) return { error: "Enter the session length as a number." };
  if (minutes < MIN_SESSION_MINUTES || minutes > MAX_SESSION_MINUTES) {
    return { error: `Session length should be between ${MIN_SESSION_MINUTES} and ${MAX_SESSION_MINUTES} minutes.` };
  }
  const totalSeconds = Math.round(minutes * 60);

  const times = [];

  if (mode === "interval") {
    if (!isNum(intervalMinutes)) return { error: "Enter the interval as a number." };
    if (intervalMinutes < MIN_INTERVAL_MINUTES || intervalMinutes > MAX_INTERVAL_MINUTES) {
      return { error: `The interval should be between ${MIN_INTERVAL_MINUTES} and ${MAX_INTERVAL_MINUTES} minutes.` };
    }
    if (intervalMinutes > minutes) {
      return { error: "The interval is longer than the session, so no bell would ever ring." };
    }
    const gap = Math.round(intervalMinutes * 60);
    if (totalSeconds / gap > MAX_BELLS) {
      return { error: `That would ring more than ${MAX_BELLS} bells. Lengthen the interval.` };
    }
    for (let t = gap; t < totalSeconds; t += gap) times.push(t);
  } else {
    if (!isNum(minGapMinutes) || !isNum(maxGapMinutes)) {
      return { error: "Enter the smallest and largest gap as numbers." };
    }
    if (minGapMinutes < MIN_GAP_MINUTES || maxGapMinutes > MAX_GAP_MINUTES) {
      return { error: `Gaps should be between ${MIN_GAP_MINUTES} and ${MAX_GAP_MINUTES} minutes.` };
    }
    if (minGapMinutes > maxGapMinutes) {
      return { error: "The smallest gap has to be shorter than the largest gap." };
    }
    if (minGapMinutes > minutes) {
      return { error: "The smallest gap is longer than the session, so no bell would ever ring." };
    }
    if (totalSeconds / (minGapMinutes * 60) > MAX_BELLS) {
      return { error: `That would ring more than ${MAX_BELLS} bells. Widen the smallest gap.` };
    }
    const next = seededRandom(seed);
    const minSeconds = minGapMinutes * 60;
    const spanSeconds = (maxGapMinutes - minGapMinutes) * 60;
    let t = 0;
    let guard = 0;
    while (guard < MAX_BELLS) {
      guard += 1;
      t += minSeconds + next() * spanSeconds;
      const rounded = Math.round(t);
      if (rounded >= totalSeconds) break;
      times.push(rounded);
    }
  }

  const bells = [];
  if (startBell) bells.push({ at: 0, kind: "start", label: "Opening bell" });
  times.forEach((at, index) => bells.push({ at, kind: "pause", label: `Bell ${index + 1}` }));
  if (endBell) bells.push({ at: totalSeconds, kind: "end", label: "Closing bell" });

  const gaps = [];
  for (let i = 1; i < bells.length; i += 1) gaps.push(bells[i].at - bells[i - 1].at);
  const averageGapSeconds = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : totalSeconds;

  return {
    mode,
    modeLabel: modeSpec.label,
    modeNote: modeSpec.note,
    minutes,
    totalSeconds,
    bells,
    pauseBellCount: times.length,
    totalBellCount: bells.length,
    averageGapSeconds: round1(averageGapSeconds),
    shortestGapSeconds: gaps.length > 0 ? Math.min(...gaps) : 0,
    longestGapSeconds: gaps.length > 0 ? Math.max(...gaps) : 0,
    startBell: Boolean(startBell),
    endBell: Boolean(endBell),
    seed,
    pauseBreaths: PAUSE_BREATHS,
  };
}

/**
 * State of the session at a given elapsed time.
 *
 * @param {number} elapsedSeconds seconds since start
 * @param {object} schedule       result of buildBellSchedule
 */
export function bellStateAtTime(elapsedSeconds, schedule) {
  if (!schedule || schedule.error) return { error: schedule ? schedule.error : "No schedule." };
  const elapsed = isNum(elapsedSeconds) && elapsedSeconds > 0 ? elapsedSeconds : 0;
  const done = elapsed >= schedule.totalSeconds;

  let rung = 0;
  for (let i = 0; i < schedule.bells.length; i += 1) {
    if (schedule.bells[i].at <= elapsed) rung += 1;
    else break;
  }
  const nextBell = schedule.bells[rung] || null;
  const lastBell = rung > 0 ? schedule.bells[rung - 1] : null;

  return {
    done,
    elapsed: round1(elapsed),
    remainingSeconds: Math.max(0, round1(schedule.totalSeconds - elapsed)),
    rungCount: rung,
    lastBellLabel: lastBell ? lastBell.label : null,
    lastBellAt: lastBell ? lastBell.at : null,
    nextBellLabel: nextBell ? nextBell.label : null,
    nextBellAt: nextBell ? nextBell.at : null,
    secondsToNext: nextBell ? Math.max(0, round1(nextBell.at - elapsed)) : null,
    progress: schedule.totalSeconds > 0 ? Math.min(1, elapsed / schedule.totalSeconds) : 0,
  };
}

/** mm:ss for a non-negative number of seconds. */
export function formatClock(seconds) {
  if (!isNum(seconds) || seconds < 0) return "0:00";
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
