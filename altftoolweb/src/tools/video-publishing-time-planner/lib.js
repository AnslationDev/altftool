/**
 * Video publishing time planner.
 *
 * The model is deterministic clock arithmetic, not a prediction:
 *  1. A publish time is converted from the creator's local clock to UTC.
 *  2. For every audience segment the same instant is converted back to that
 *     segment's local clock.
 *  3. Each segment's local "viewing moment" (publish time + lead time) is
 *     scored against a prime window and a secondary window that YOU define.
 *  4. Scores are weighted by each segment's share of the audience and summed.
 *
 * Nothing here guesses platform behaviour — the windows and weights are inputs.
 */

/** Minutes in a civil day. */
export const MINUTES_PER_DAY = 1440;

/** Planner granularity: platforms schedule uploads to the quarter hour. */
export const SLOT_MINUTES = 15;

/** Number of candidate slots scanned = 1440 / 15. */
export const SLOTS_PER_DAY = MINUTES_PER_DAY / SLOT_MINUTES;

/**
 * Default evening prime window, 18:00-22:00 local. This is the after-work /
 * after-dinner block most creators target; override it with your own analytics.
 */
export const DEFAULT_PRIME_WINDOW = { startHour: 18, endHour: 22 };

/** Default secondary window, 12:00-14:00 local (lunch break viewing). */
export const DEFAULT_SECONDARY_WINDOW = { startHour: 12, endHour: 14 };

/** A viewer reached in the secondary window counts for 60% of a prime viewer. */
export const SECONDARY_WEIGHT = 0.6;

/**
 * Credit tapers linearly to zero across one hour on either side of a window,
 * so a slot 30 minutes early scores half instead of falling off a cliff.
 */
export const EDGE_TAPER_MINUTES = 60;

/**
 * Default lead time: publish 120 minutes before the prime window opens so the
 * video is already indexed, processed and surfaced when the window starts.
 */
export const DEFAULT_LEAD_MINUTES = 120;

/** Guard rail: a lead time beyond 12 hours is no longer the same viewing session. */
export const MAX_LEAD_MINUTES = 720;

/** Valid civil UTC offsets run from -12:00 (Baker Island) to +14:00 (Kiritimati). */
export const MIN_UTC_OFFSET_HOURS = -12;
export const MAX_UTC_OFFSET_HOURS = 14;

/**
 * Standard-time UTC offsets. Daylight saving is deliberately ignored — pick the
 * offset that matches the audience's clock on the day you publish.
 */
export const TIMEZONE_PRESETS = [
  { label: "India (IST)", offsetHours: 5.5 },
  { label: "UK (GMT)", offsetHours: 0 },
  { label: "US Eastern (EST)", offsetHours: -5 },
  { label: "US Central (CST)", offsetHours: -6 },
  { label: "US Pacific (PST)", offsetHours: -8 },
  { label: "Central Europe (CET)", offsetHours: 1 },
  { label: "Gulf (GST)", offsetHours: 4 },
  { label: "Singapore (SGT)", offsetHours: 8 },
  { label: "Japan (JST)", offsetHours: 9 },
  { label: "Australia East (AEST)", offsetHours: 10 },
  { label: "Brazil (BRT)", offsetHours: -3 },
  { label: "UTC", offsetHours: 0 },
];

/** How many ranked alternatives the planner returns. */
export const RANKED_SLOT_COUNT = 6;

const mod = (value, span) => ((value % span) + span) % span;

/** "HH:MM" -> minutes past local midnight, or null when unparseable. */
export function parseClock(text) {
  const match = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(String(text ?? ""));
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Minutes past midnight -> "HH:MM" on a 24-hour clock. */
export function formatClock(minutes) {
  if (!Number.isFinite(minutes)) return "--:--";
  const wrapped = mod(Math.round(minutes), MINUTES_PER_DAY);
  const hh = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const mm = String(wrapped % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** 5.5 -> "UTC+05:30", -8 -> "UTC-08:00". */
export function formatOffset(offsetHours) {
  if (!Number.isFinite(offsetHours)) return "UTC";
  const total = Math.round(offsetHours * 60);
  const sign = total < 0 ? "-" : "+";
  const abs = Math.abs(total);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${hh}:${mm}`;
}

/**
 * Shortest distance in minutes from a clock minute to a window [start, end),
 * measured on the 24-hour circle. Returns 0 when the minute is inside.
 * Handles windows that wrap past midnight (e.g. 22:00-02:00).
 */
export function distanceToWindow(minute, startMinute, endMinute) {
  const span = mod(endMinute - startMinute, MINUTES_PER_DAY);
  if (span === 0) return MINUTES_PER_DAY; // empty window: nothing is inside it
  const rel = mod(minute - startMinute, MINUTES_PER_DAY);
  if (rel < span) return 0;
  const afterEnd = rel - span;
  const beforeStart = MINUTES_PER_DAY - rel;
  return Math.min(afterEnd, beforeStart);
}

/**
 * Quality of a single local viewing moment: 1 inside prime, SECONDARY_WEIGHT
 * inside secondary, tapering linearly to 0 across EDGE_TAPER_MINUTES outside.
 */
export function slotQuality(viewMinute, prime, secondary) {
  const dPrime = distanceToWindow(viewMinute, prime.startMinute, prime.endMinute);
  const dSecondary = distanceToWindow(viewMinute, secondary.startMinute, secondary.endMinute);
  const wPrime = dPrime === 0 ? 1 : Math.max(0, 1 - dPrime / EDGE_TAPER_MINUTES);
  const wSecondary =
    dSecondary === 0
      ? SECONDARY_WEIGHT
      : SECONDARY_WEIGHT * Math.max(0, 1 - dSecondary / EDGE_TAPER_MINUTES);
  return Math.max(wPrime, wSecondary);
}

function toWindow(startHour, endHour) {
  return {
    startMinute: mod(Math.round(startHour * 60), MINUTES_PER_DAY),
    endMinute: mod(Math.round(endHour * 60), MINUTES_PER_DAY),
  };
}

/**
 * Audience-weighted score (0-100) for publishing at a given UTC minute.
 * segments must already be normalised so shares sum to 1.
 */
export function scoreUtcMinute(utcMinute, segments, leadMinutes, prime, secondary) {
  let total = 0;
  for (const segment of segments) {
    const localMinute = mod(utcMinute + segment.offsetMinutes, MINUTES_PER_DAY);
    const viewMinute = mod(localMinute + leadMinutes, MINUTES_PER_DAY);
    total += segment.share * slotQuality(viewMinute, prime, secondary);
  }
  return total * 100;
}

/**
 * Main entry point.
 *
 * @param {object} input
 * @param {number} input.baseOffsetHours   creator's own UTC offset
 * @param {string} input.publishLocal      candidate publish time "HH:MM" on the creator's clock
 * @param {Array}  input.segments          [{ name, offsetHours, share }] share in percent
 * @param {number} [input.leadMinutes]     minutes between publishing and the target viewing moment
 * @param {number} [input.primeStartHour]  local prime window start (0-24)
 * @param {number} [input.primeEndHour]    local prime window end (0-24)
 * @param {number} [input.secondaryStartHour]
 * @param {number} [input.secondaryEndHour]
 * @returns {object} plan, or { error } when the input cannot produce a real answer
 */
export function planPublishTime({
  baseOffsetHours,
  publishLocal,
  segments,
  leadMinutes = DEFAULT_LEAD_MINUTES,
  primeStartHour = DEFAULT_PRIME_WINDOW.startHour,
  primeEndHour = DEFAULT_PRIME_WINDOW.endHour,
  secondaryStartHour = DEFAULT_SECONDARY_WINDOW.startHour,
  secondaryEndHour = DEFAULT_SECONDARY_WINDOW.endHour,
} = {}) {
  if (!Number.isFinite(baseOffsetHours)) {
    return { error: "Choose the timezone your channel schedules in." };
  }
  if (baseOffsetHours < MIN_UTC_OFFSET_HOURS || baseOffsetHours > MAX_UTC_OFFSET_HOURS) {
    return { error: "UTC offsets must be between -12:00 and +14:00." };
  }

  const publishMinute = parseClock(publishLocal);
  if (publishMinute === null) {
    return { error: "Enter the publish time as HH:MM on a 24-hour clock, for example 18:30." };
  }

  if (!Number.isFinite(leadMinutes) || leadMinutes < 0 || leadMinutes > MAX_LEAD_MINUTES) {
    return { error: "Lead time must be between 0 and 720 minutes (12 hours)." };
  }

  const hours = [primeStartHour, primeEndHour, secondaryStartHour, secondaryEndHour];
  if (hours.some((h) => !Number.isFinite(h) || h < 0 || h > 24)) {
    return { error: "Window hours must be between 0 and 24." };
  }
  if (mod(Math.round(primeEndHour * 60) - Math.round(primeStartHour * 60), MINUTES_PER_DAY) === 0) {
    return { error: "The prime window needs a start and end that differ." };
  }

  if (!Array.isArray(segments) || segments.length === 0) {
    return { error: "Add at least one audience timezone." };
  }
  if (segments.length > 12) {
    return { error: "Keep the plan to 12 audience timezones or fewer." };
  }

  const cleaned = [];
  for (const segment of segments) {
    const offsetHours = Number(segment?.offsetHours);
    const share = Number(segment?.share);
    if (!Number.isFinite(offsetHours)) {
      return { error: "Every audience row needs a valid UTC offset." };
    }
    if (offsetHours < MIN_UTC_OFFSET_HOURS || offsetHours > MAX_UTC_OFFSET_HOURS) {
      return { error: "UTC offsets must be between -12:00 and +14:00." };
    }
    if (!Number.isFinite(share) || share < 0) {
      return { error: "Audience shares must be zero or a positive percentage." };
    }
    cleaned.push({
      name: String(segment?.name ?? "").trim() || formatOffset(offsetHours),
      offsetHours,
      offsetMinutes: Math.round(offsetHours * 60),
      rawShare: share,
    });
  }

  const shareTotal = cleaned.reduce((sum, segment) => sum + segment.rawShare, 0);
  if (!(shareTotal > 0)) {
    return { error: "At least one audience timezone needs a share above zero." };
  }

  const normalised = cleaned.map((segment) => ({
    ...segment,
    share: segment.rawShare / shareTotal,
  }));

  const prime = toWindow(primeStartHour, primeEndHour);
  const secondary = toWindow(secondaryStartHour, secondaryEndHour);
  const baseOffsetMinutes = Math.round(baseOffsetHours * 60);
  const chosenUtcMinute = mod(publishMinute - baseOffsetMinutes, MINUTES_PER_DAY);

  const allSlots = [];
  for (let slot = 0; slot < SLOTS_PER_DAY; slot += 1) {
    const utcMinute = slot * SLOT_MINUTES;
    allSlots.push({
      utcMinute,
      baseLocalMinute: mod(utcMinute + baseOffsetMinutes, MINUTES_PER_DAY),
      score: scoreUtcMinute(utcMinute, normalised, leadMinutes, prime, secondary),
    });
  }

  const sorted = [...allSlots].sort((a, b) => b.score - a.score || a.utcMinute - b.utcMinute);
  const best = sorted[0];
  const chosenScore = scoreUtcMinute(chosenUtcMinute, normalised, leadMinutes, prime, secondary);
  const betterSlots = allSlots.filter((slot) => slot.score > chosenScore + 1e-9).length;

  const segmentRows = normalised.map((segment) => {
    const shifted = chosenUtcMinute + segment.offsetMinutes;
    const localMinute = mod(shifted, MINUTES_PER_DAY);
    const viewMinute = mod(localMinute + leadMinutes, MINUTES_PER_DAY);
    return {
      name: segment.name,
      offsetHours: segment.offsetHours,
      offsetLabel: formatOffset(segment.offsetHours),
      sharePct: segment.share * 100,
      localClock: formatClock(localMinute),
      viewClock: formatClock(viewMinute),
      dayShift: Math.floor(shifted / MINUTES_PER_DAY),
      qualityPct: slotQuality(viewMinute, prime, secondary) * 100,
    };
  });

  return {
    chosen: {
      localClock: formatClock(publishMinute),
      utcClock: formatClock(chosenUtcMinute),
      score: chosenScore,
      rank: betterSlots + 1,
    },
    best: {
      localClock: formatClock(best.baseLocalMinute),
      utcClock: formatClock(best.utcMinute),
      score: best.score,
    },
    ranked: sorted.slice(0, RANKED_SLOT_COUNT).map((slot, index) => ({
      rank: index + 1,
      localClock: formatClock(slot.baseLocalMinute),
      utcClock: formatClock(slot.utcMinute),
      score: slot.score,
    })),
    segments: segmentRows,
    totalSlots: SLOTS_PER_DAY,
    shareTotalEntered: shareTotal,
    baseOffsetLabel: formatOffset(baseOffsetHours),
    leadMinutes,
  };
}
