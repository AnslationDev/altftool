/**
 * Contraction timing maths.
 *
 * Two quantities matter and they are measured differently:
 *   duration  = start of a contraction to the end of the SAME contraction
 *   frequency = start of one contraction to the start of the NEXT one
 * Frequency is measured start-to-start, not from the end of one to the start of
 * the next, which is the mistake that makes contractions look further apart than
 * they are.
 *
 * The pattern test implemented here is the familiar "5-1-1" rule: contractions
 * about 5 minutes apart, each lasting about 1 minute, sustained for 1 hour.
 * Maternity units vary - many use 4-1-1 or 3-1-1, and anyone with a previous
 * caesarean, a preterm gestation or a fast previous labour is told to call much
 * earlier - so the rule is a selectable input, not a verdict.
 */

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60000;

/** Common call-the-unit patterns: [interval between starts, minimum duration, how long the pattern must hold]. */
export const RULES = [
  {
    id: "5-1-1",
    label: "5-1-1 (common first-baby guidance)",
    intervalMinutes: 5,
    durationSeconds: 60,
    sustainedMinutes: 60,
  },
  {
    id: "4-1-1",
    label: "4-1-1 (used by many units)",
    intervalMinutes: 4,
    durationSeconds: 60,
    sustainedMinutes: 60,
  },
  {
    id: "3-1-1",
    label: "3-1-1 (later, often for a second or later baby)",
    intervalMinutes: 3,
    durationSeconds: 60,
    sustainedMinutes: 60,
  },
];

export const DEFAULT_RULE_ID = "5-1-1";

/** Intervals within this fraction of the mean count as a regular pattern. */
export const REGULARITY_TOLERANCE = 0.25;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

export function getRule(ruleId) {
  return RULES.find((rule) => rule.id === ruleId) ?? RULES[0];
}

/** 95 seconds -> "1m 35s". */
export function formatSeconds(seconds) {
  if (!isFiniteNumber(seconds) || seconds < 0) return "0s";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}

/** 5.5 -> "5m 30s". */
export function formatMinutes(minutes) {
  if (!isFiniteNumber(minutes) || minutes < 0) return "0m";
  return formatSeconds(minutes * 60);
}

/**
 * @param {object} input
 * @param {Array<{start:number,end:number|null}>} input.contractions epoch ms; end null while one is running
 * @param {number} input.nowMs   the moment being evaluated, epoch ms
 * @param {string} input.ruleId  which pattern rule to test against
 */
export function summariseContractions({ contractions, nowMs, ruleId = DEFAULT_RULE_ID } = {}) {
  if (!Array.isArray(contractions)) {
    return { error: "Contractions must be a list of timed entries." };
  }
  if (!isFiniteNumber(nowMs)) {
    return { error: "The current time is missing." };
  }
  for (const item of contractions) {
    if (!item || !isFiniteNumber(item.start)) {
      return { error: "One of the contractions has no start time." };
    }
    if (item.end !== null && item.end !== undefined && !isFiniteNumber(item.end)) {
      return { error: "One of the contractions has an invalid end time." };
    }
    if (isFiniteNumber(item.end) && item.end < item.start) {
      return { error: "A contraction cannot end before it starts." };
    }
  }

  const rule = getRule(ruleId);
  const ordered = [...contractions].sort((a, b) => a.start - b.start);
  const finished = ordered.filter((item) => isFiniteNumber(item.end));

  const durationsSeconds = finished.map((item) => (item.end - item.start) / MS_PER_SECOND);
  const intervalsMinutes = [];
  for (let i = 1; i < ordered.length; i += 1) {
    intervalsMinutes.push((ordered[i].start - ordered[i - 1].start) / MS_PER_MINUTE);
  }

  const averageDurationSeconds = durationsSeconds.length ? mean(durationsSeconds) : null;
  const averageIntervalMinutes = intervalsMinutes.length ? mean(intervalsMinutes) : null;

  // The rule asks for a pattern that has HELD, so walk backwards from the most
  // recent finished contraction and keep every one that still satisfies both the
  // duration and the gap to the contraction after it. The run breaks at the first
  // contraction that was too short or too far apart.
  let runStartIndex = finished.length;
  for (let i = finished.length - 1; i >= 0; i -= 1) {
    const durationSeconds = (finished[i].end - finished[i].start) / MS_PER_SECOND;
    if (durationSeconds < rule.durationSeconds) break;
    if (i < finished.length - 1) {
      const gapMinutes = (finished[i + 1].start - finished[i].start) / MS_PER_MINUTE;
      if (gapMinutes > rule.intervalMinutes) break;
    }
    runStartIndex = i;
  }

  const run = finished.slice(runStartIndex);
  const recentDurations = run.map((item) => (item.end - item.start) / MS_PER_SECOND);
  const recentIntervals = [];
  for (let i = 1; i < run.length; i += 1) {
    recentIntervals.push((run[i].start - run[i - 1].start) / MS_PER_MINUTE);
  }

  const recentAverageDurationSeconds = recentDurations.length ? mean(recentDurations) : null;
  const recentAverageIntervalMinutes = recentIntervals.length ? mean(recentIntervals) : null;

  const patternMinutes =
    run.length >= 2 ? (run[run.length - 1].start - run[0].start) / MS_PER_MINUTE : 0;

  const intervalOk =
    recentAverageIntervalMinutes !== null && recentAverageIntervalMinutes <= rule.intervalMinutes;
  const durationOk =
    recentAverageDurationSeconds !== null && recentAverageDurationSeconds >= rule.durationSeconds;
  const sustainedOk = patternMinutes >= rule.sustainedMinutes;
  const ruleMet = intervalOk && durationOk && sustainedOk;
  const recent = run;

  // Regular = every recent interval sits within the tolerance band around the mean.
  const regular =
    recentIntervals.length >= 2 &&
    recentAverageIntervalMinutes > 0 &&
    recentIntervals.every(
      (value) =>
        Math.abs(value - recentAverageIntervalMinutes) <=
        REGULARITY_TOLERANCE * recentAverageIntervalMinutes,
    );

  // Trend across the whole session: are the gaps shortening?
  let trend = "not enough data";
  if (intervalsMinutes.length >= 4) {
    const half = Math.floor(intervalsMinutes.length / 2);
    const early = mean(intervalsMinutes.slice(0, half));
    const late = mean(intervalsMinutes.slice(intervalsMinutes.length - half));
    if (late < early * 0.9) trend = "getting closer together";
    else if (late > early * 1.1) trend = "spacing out";
    else trend = "holding steady";
  }

  const currentIsRunning = ordered.some((item) => !isFiniteNumber(item.end));
  const runningSinceMs = currentIsRunning
    ? nowMs - ordered.filter((item) => !isFiniteNumber(item.end))[0].start
    : null;

  const sinceLastStartMinutes = ordered.length
    ? (nowMs - ordered[ordered.length - 1].start) / MS_PER_MINUTE
    : null;

  return {
    rule,
    total: ordered.length,
    finished: finished.length,
    averageDurationSeconds,
    averageIntervalMinutes,
    recentCount: recent.length,
    recentAverageDurationSeconds,
    recentAverageIntervalMinutes,
    patternMinutes,
    intervalOk,
    durationOk,
    sustainedOk,
    ruleMet,
    regular,
    trend,
    currentIsRunning,
    runningSeconds: runningSinceMs === null ? null : runningSinceMs / MS_PER_SECOND,
    sinceLastStartMinutes,
    rows: ordered.map((item, index) => ({
      index,
      number: index + 1,
      start: item.start,
      end: isFiniteNumber(item.end) ? item.end : null,
      durationSeconds: isFiniteNumber(item.end) ? (item.end - item.start) / MS_PER_SECOND : null,
      intervalMinutes:
        index === 0 ? null : (item.start - ordered[index - 1].start) / MS_PER_MINUTE,
    })),
  };
}
