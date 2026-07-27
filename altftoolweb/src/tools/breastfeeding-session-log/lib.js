/**
 * Breastfeeding session log — daily totals, feed spacing and left/right balance.
 *
 * Everything here is arithmetic over a list of feeds recorded for ONE calendar day.
 * A feed is { clock: "HH:MM" (start time), side: "left" | "right" | "both",
 * minutes: duration at the breast }.
 *
 * Reference ranges used for the informational flags (they are guidance ranges, not
 * diagnostic thresholds):
 *  - The American Academy of Pediatrics / WHO describe on-demand feeding of roughly
 *    8-12 feeds in every 24 hours for a healthy newborn in the first weeks.
 *  - The same guidance advises not letting a newborn go much longer than about 4 hours
 *    between feeds while weight gain is being established.
 *  - Alternating the starting breast keeps supply even; a large minute imbalance between
 *    left and right is the usual early sign that one side is being skipped.
 *
 * Nothing in this module is medical advice. Feeding volumes, weight gain and jaundice
 * decisions belong to a paediatrician, midwife or lactation consultant.
 */

/** Guidance range: healthy newborns typically feed 8-12 times per 24 hours (AAP/WHO). */
export const MIN_TYPICAL_FEEDS_PER_DAY = 8;
export const MAX_TYPICAL_FEEDS_PER_DAY = 12;

/** Daytime gap beyond which newborn feeding guidance suggests waking to feed. */
export const LONG_GAP_HOURS = 4;
export const LONG_GAP_MINUTES = LONG_GAP_HOURS * 60;

/** A single session longer than this is almost certainly a typo, not a feed. */
export const MAX_SESSION_MINUTES = 120;
export const MIN_SESSION_MINUTES = 1;

/** Left/right minute shares further apart than this are flagged as uneven. */
export const SIDE_BALANCE_TOLERANCE_PERCENT = 20;

export const SIDES = ["left", "right", "both"];

export const MINUTES_PER_DAY = 1440;

/**
 * "HH:MM" -> minutes since midnight, or null when the string is not a valid clock time.
 * @param {string} clock
 * @returns {number|null}
 */
export function parseClock(clock) {
  if (typeof clock !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(clock.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const mins = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(mins)) return null;
  if (hours < 0 || hours > 23 || mins < 0 || mins > 59) return null;
  return hours * 60 + mins;
}

/** Minutes since midnight -> "HH:MM". Values are wrapped into a single day. */
export function formatClock(minutes) {
  if (!Number.isFinite(minutes)) return "--:--";
  const wrapped = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** 195 -> "3h 15m", 45 -> "45m". */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  const total = Math.round(minutes);
  const sign = total < 0 ? "-" : "";
  const abs = Math.abs(total);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  if (hours === 0) return `${sign}${mins}m`;
  if (mins === 0) return `${sign}${hours}h`;
  return `${sign}${hours}h ${mins}m`;
}

/**
 * Summarise one day of feeds.
 *
 * @param {object} input
 * @param {Array<{id?: string, clock: string, side: string, minutes: number}>} input.entries
 * @returns {object} summary, or { error } when an entry is unusable.
 */
export function summariseFeedLog({ entries } = {}) {
  if (!Array.isArray(entries)) {
    return { error: "No feed log to summarise yet." };
  }

  const parsed = [];
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i] || {};
    const startMin = parseClock(entry.clock);
    if (startMin === null) {
      return { error: `Feed ${i + 1} needs a start time between 00:00 and 23:59.` };
    }
    const minutes = Number(entry.minutes);
    if (!Number.isFinite(minutes)) {
      return { error: `Feed ${i + 1} needs a duration in minutes.` };
    }
    if (minutes < MIN_SESSION_MINUTES || minutes > MAX_SESSION_MINUTES) {
      return {
        error: `Feed ${i + 1} must last between ${MIN_SESSION_MINUTES} and ${MAX_SESSION_MINUTES} minutes.`,
      };
    }
    const side = String(entry.side || "").toLowerCase();
    if (!SIDES.includes(side)) {
      return { error: `Feed ${i + 1} needs a side: left, right or both.` };
    }
    parsed.push({ id: entry.id, startMin, minutes, side });
  }

  const count = parsed.length;
  if (count === 0) {
    return {
      empty: true,
      count: 0,
      totalMinutes: 0,
      averageMinutes: null,
      leftMinutes: 0,
      rightMinutes: 0,
      bothMinutes: 0,
      leftCount: 0,
      rightCount: 0,
      bothCount: 0,
      leftShare: null,
      rightShare: null,
      balanced: null,
      gaps: [],
      averageGapMin: null,
      longestGapMin: null,
      longestGapFrom: null,
      longestGapTo: null,
      longGapCount: 0,
      overnightGapMin: null,
      longestStretchMin: null,
      nextFeedClock: null,
      firstClock: null,
      lastClock: null,
      frequencyStatus: "below",
    };
  }

  const sorted = [...parsed].sort((a, b) => a.startMin - b.startMin);

  let totalMinutes = 0;
  let leftMinutes = 0;
  let rightMinutes = 0;
  let bothMinutes = 0;
  let leftCount = 0;
  let rightCount = 0;
  let bothCount = 0;

  for (const feed of sorted) {
    totalMinutes += feed.minutes;
    if (feed.side === "left") {
      leftMinutes += feed.minutes;
      leftCount += 1;
    } else if (feed.side === "right") {
      rightMinutes += feed.minutes;
      rightCount += 1;
    } else {
      bothMinutes += feed.minutes;
      bothCount += 1;
    }
  }

  const singleSideMinutes = leftMinutes + rightMinutes;
  const leftShare = singleSideMinutes > 0 ? (leftMinutes / singleSideMinutes) * 100 : null;
  const rightShare = leftShare === null ? null : 100 - leftShare;
  const balanced =
    leftShare === null ? null : Math.abs(leftShare - rightShare) <= SIDE_BALANCE_TOLERANCE_PERCENT;

  const gaps = [];
  for (let i = 1; i < sorted.length; i += 1) {
    gaps.push({
      fromClock: formatClock(sorted[i - 1].startMin),
      toClock: formatClock(sorted[i].startMin),
      gapMin: sorted[i].startMin - sorted[i - 1].startMin,
    });
  }

  const averageGapMin =
    gaps.length > 0 ? gaps.reduce((sum, gap) => sum + gap.gapMin, 0) / gaps.length : null;

  let longestGap = null;
  for (const gap of gaps) {
    if (longestGap === null || gap.gapMin > longestGap.gapMin) longestGap = gap;
  }

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const overnightGapMin =
    count >= 2 ? first.startMin + MINUTES_PER_DAY - last.startMin : null;

  const longGapCount = gaps.filter((gap) => gap.gapMin > LONG_GAP_MINUTES).length;

  const stretchCandidates = [];
  if (longestGap) stretchCandidates.push(longestGap.gapMin);
  if (overnightGapMin !== null) stretchCandidates.push(overnightGapMin);
  const longestStretchMin = stretchCandidates.length ? Math.max(...stretchCandidates) : null;

  const nextFeedClock =
    averageGapMin === null ? null : formatClock(last.startMin + averageGapMin);

  let frequencyStatus = "typical";
  if (count < MIN_TYPICAL_FEEDS_PER_DAY) frequencyStatus = "below";
  else if (count > MAX_TYPICAL_FEEDS_PER_DAY) frequencyStatus = "above";

  return {
    empty: false,
    count,
    totalMinutes,
    averageMinutes: totalMinutes / count,
    leftMinutes,
    rightMinutes,
    bothMinutes,
    leftCount,
    rightCount,
    bothCount,
    leftShare,
    rightShare,
    balanced,
    gaps,
    averageGapMin,
    longestGapMin: longestGap ? longestGap.gapMin : null,
    longestGapFrom: longestGap ? longestGap.fromClock : null,
    longestGapTo: longestGap ? longestGap.toClock : null,
    longGapCount,
    overnightGapMin,
    longestStretchMin,
    nextFeedClock,
    firstClock: formatClock(first.startMin),
    lastClock: formatClock(last.startMin),
    frequencyStatus,
    sorted: sorted.map((feed) => ({
      id: feed.id,
      clock: formatClock(feed.startMin),
      side: feed.side,
      minutes: feed.minutes,
    })),
  };
}
