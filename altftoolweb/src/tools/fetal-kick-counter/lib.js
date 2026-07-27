/**
 * Fetal movement ("kick count") session maths.
 *
 * The counting method implemented here is the Cardiff "count to ten" method:
 * while lying on your side after a meal, count distinct movements — kicks,
 * rolls, flutters, jabs — and note how long it takes to reach ten. Reaching ten
 * movements within two hours is the usual reassurance threshold.
 *
 * Important: there is no "normal number" of movements. What matters clinically
 * is a change from YOUR baby's own pattern. This module reports timings; it does
 * not diagnose anything.
 */

/** Cardiff count-to-ten target. */
export const TARGET_KICKS = 10;

/** Reassurance window for reaching the target, in minutes. */
export const WINDOW_MINUTES = 120;

/** Kick counting is usually advised from about 28 weeks, once movements are established. */
export const COUNTING_FROM_WEEK = 28;

/** Movements should be felt right up to and during labour - they do not slow down at the end. */
export const MS_PER_MINUTE = 60000;

export const STATUS = {
  reached: "reached",
  reachedSlow: "reached-slow",
  counting: "counting",
  windowPassed: "window-passed",
};

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** 95 -> "1h 35m"; 45 -> "45m". */
export function formatMinutes(minutes) {
  if (!isFiniteNumber(minutes) || minutes < 0) return "0m";
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

/** Timestamp (ms) -> "HH:MM" in the given offset-free local reading. */
export function formatClockFromMs(ms, toLocaleTimeString) {
  if (!isFiniteNumber(ms)) return "--:--";
  if (typeof toLocaleTimeString === "function") return toLocaleTimeString(ms);
  const date = new Date(ms);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * @param {object} input
 * @param {number} input.startedAt      session start, epoch ms
 * @param {number} input.nowMs          the moment you are evaluating at, epoch ms
 * @param {number[]} input.kickTimes     epoch ms of each recorded movement
 * @param {number} [input.targetKicks]  defaults to 10
 * @param {number} [input.windowMinutes] defaults to 120
 */
export function summariseSession({
  startedAt,
  nowMs,
  kickTimes,
  targetKicks = TARGET_KICKS,
  windowMinutes = WINDOW_MINUTES,
} = {}) {
  if (!isFiniteNumber(startedAt) || !isFiniteNumber(nowMs)) {
    return { error: "Start the session before reading a summary." };
  }
  if (nowMs < startedAt) {
    return { error: "The current time is before the session start time." };
  }
  if (!Array.isArray(kickTimes)) {
    return { error: "Recorded movements must be a list of times." };
  }
  if (kickTimes.some((value) => !isFiniteNumber(value))) {
    return { error: "One of the recorded movements has an invalid time." };
  }
  if (!isFiniteNumber(targetKicks) || targetKicks < 1) {
    return { error: "The movement target must be at least 1." };
  }
  if (!isFiniteNumber(windowMinutes) || windowMinutes <= 0) {
    return { error: "The counting window must be longer than zero minutes." };
  }

  const target = Math.round(targetKicks);
  const ordered = [...kickTimes].sort((a, b) => a - b);
  const count = ordered.length;
  const elapsedMinutes = (nowMs - startedAt) / MS_PER_MINUTE;

  const targetHitAt = count >= target ? ordered[target - 1] : null;
  const minutesToTarget = targetHitAt === null ? null : (targetHitAt - startedAt) / MS_PER_MINUTE;

  // Average gap between the session start and the movements recorded so far.
  const averageIntervalMinutes = count > 0 ? elapsedMinutes / count : null;

  // Straight-line projection only; it assumes the current rate continues.
  const projectedMinutesToTarget =
    count > 0 && count < target && elapsedMinutes > 0
      ? (elapsedMinutes / count) * target
      : null;

  const lastKickMinutesAgo =
    count > 0 ? (nowMs - ordered[count - 1]) / MS_PER_MINUTE : null;

  let status;
  if (minutesToTarget !== null) {
    status = minutesToTarget <= windowMinutes ? STATUS.reached : STATUS.reachedSlow;
  } else if (elapsedMinutes > windowMinutes) {
    status = STATUS.windowPassed;
  } else {
    status = STATUS.counting;
  }

  const message = {
    [STATUS.reached]: `${target} movements counted in ${formatMinutes(minutesToTarget ?? 0)} — inside the ${formatMinutes(windowMinutes)} window.`,
    [STATUS.reachedSlow]: `${target} movements counted, but it took ${formatMinutes(minutesToTarget ?? 0)}, longer than the ${formatMinutes(windowMinutes)} window. Mention this to your midwife today.`,
    [STATUS.counting]: `${count} of ${target} movements so far, ${formatMinutes(elapsedMinutes)} into the session.`,
    [STATUS.windowPassed]: `Only ${count} of ${target} movements after ${formatMinutes(elapsedMinutes)}. Contact your midwife or maternity unit now — do not wait until tomorrow.`,
  }[status];

  return {
    count,
    target,
    elapsedMinutes,
    windowMinutes,
    minutesToTarget,
    targetHitAt,
    averageIntervalMinutes,
    projectedMinutesToTarget,
    lastKickMinutesAgo,
    remaining: Math.max(0, target - count),
    progressPercent: Math.min(100, (count / target) * 100),
    windowPercent: Math.min(100, (elapsedMinutes / windowMinutes) * 100),
    status,
    reassuring: status === STATUS.reached,
    needsCall: status === STATUS.windowPassed,
    message,
    firstKickAt: count > 0 ? ordered[0] : null,
    lastKickAt: count > 0 ? ordered[count - 1] : null,
  };
}

/**
 * Roll finished sessions up into a daily view.
 * @param {Array<{minutesToTarget:number|null,count:number,elapsedMinutes:number}>} sessions
 */
export function summariseHistory(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return { sessions: 0, totalKicks: 0, averageMinutesToTarget: null, fastest: null, slowest: null };
  }

  const completed = sessions.filter((item) => isFiniteNumber(item?.minutesToTarget));
  const totalKicks = sessions.reduce(
    (sum, item) => sum + (isFiniteNumber(item?.count) ? item.count : 0),
    0,
  );

  if (completed.length === 0) {
    return { sessions: sessions.length, totalKicks, averageMinutesToTarget: null, fastest: null, slowest: null };
  }

  const times = completed.map((item) => item.minutesToTarget);
  const sum = times.reduce((a, b) => a + b, 0);

  return {
    sessions: sessions.length,
    totalKicks,
    averageMinutesToTarget: sum / times.length,
    fastest: Math.min(...times),
    slowest: Math.max(...times),
  };
}
