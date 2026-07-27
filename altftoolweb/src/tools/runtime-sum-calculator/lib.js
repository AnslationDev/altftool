/**
 * Runtime addition for edit lists.
 *
 * Durations arrive in whatever format the source used — a stopwatch reading (1:30),
 * a full clock (00:02:15), plain seconds (90), unit shorthand (1m 30s) or SMPTE
 * timecode with a frame field (00:00:10:12). Every format is normalised to seconds
 * before anything is added, so the total never depends on the notation.
 */

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/** Frame rates a duration list realistically uses. */
export const MIN_FPS = 1;
export const MAX_FPS = 240;
export const DEFAULT_FPS = 25;

/** Upper bound on any single clip: 24 hours, the SMPTE timecode day. */
export const MAX_CLIP_SECONDS = 24 * SECONDS_PER_HOUR;

/**
 * Common target slot lengths. These are industry conventions, not regulations —
 * always confirm the delivery spec with the broadcaster or platform.
 */
export const TARGET_PRESETS = [
  { label: "15 s spot", seconds: 15 },
  { label: "30 s spot", seconds: 30 },
  { label: "60 s spot", seconds: 60 },
  { label: "3 min music video", seconds: 180 },
  { label: "10 min explainer", seconds: 600 },
  { label: "22 min (half-hour slot)", seconds: 22 * SECONDS_PER_MINUTE },
  { label: "44 min (hour slot)", seconds: 44 * SECONDS_PER_MINUTE },
  { label: "90 min feature", seconds: 90 * SECONDS_PER_MINUTE },
];

function pad(value, width = 2) {
  return String(Math.trunc(Math.abs(value))).padStart(width, "0");
}

/** HH:MM:SS.mmm for any non-negative number of seconds. */
export function formatClock(totalSeconds, withMillis = true) {
  if (!Number.isFinite(totalSeconds)) return withMillis ? "00:00:00.000" : "00:00:00";
  const sign = totalSeconds < 0 ? "-" : "";
  const absolute = Math.abs(totalSeconds);
  const whole = Math.floor(absolute);
  const millis = Math.round((absolute - whole) * 1000);
  const carry = millis === 1000 ? 1 : 0;
  const adjusted = whole + carry;
  const base = `${sign}${pad(adjusted / SECONDS_PER_HOUR)}:${pad(
    (adjusted / SECONDS_PER_MINUTE) % SECONDS_PER_MINUTE,
  )}:${pad(adjusted % SECONDS_PER_MINUTE)}`;
  if (!withMillis) return base;
  return `${base}.${String(carry ? 0 : millis).padStart(3, "0")}`;
}

/** Compact reading: "6:10" under an hour, "1:06:10" above it. */
export function formatShort(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return "0:00";
  const sign = totalSeconds < 0 ? "-" : "";
  const whole = Math.round(Math.abs(totalSeconds));
  const hours = Math.floor(whole / SECONDS_PER_HOUR);
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE) % SECONDS_PER_MINUTE;
  const seconds = whole % SECONDS_PER_MINUTE;
  if (hours > 0) return `${sign}${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${sign}${minutes}:${pad(seconds)}`;
}

/**
 * Parse one duration into seconds.
 * @param {string} text  "90", "1:30", "00:02:15", "00:00:10:12", "1m 30s", "2h"
 * @param {number} fps   frame rate, used only when a frame field is present
 */
export function parseDuration(text, fps = DEFAULT_FPS) {
  if (typeof text !== "string") return { error: "Each duration must be text." };
  const raw = text.trim().replace(/;/g, ":");
  if (!raw) return { error: "Empty line." };

  const rate = Number(fps);
  if (!Number.isFinite(rate) || rate < MIN_FPS || rate > MAX_FPS) {
    return { error: `Frame rate must be between ${MIN_FPS} and ${MAX_FPS} fps.` };
  }

  // 1) Plain seconds.
  if (/^\d+(\.\d+)?$/.test(raw)) {
    const seconds = Number(raw);
    if (seconds > MAX_CLIP_SECONDS) return { error: "A single clip cannot exceed 24 hours." };
    return { seconds, format: "seconds" };
  }

  // 2) Colon notation: mm:ss, hh:mm:ss or hh:mm:ss:ff.
  if (raw.includes(":")) {
    const parts = raw.split(":");
    if (parts.length < 2 || parts.length > 4) {
      return { error: "Use mm:ss, hh:mm:ss or hh:mm:ss:ff." };
    }
    const numbers = parts.map((part) => Number(part));
    if (numbers.some((value) => !Number.isFinite(value) || value < 0)) {
      return { error: "Every field must be a non-negative number." };
    }

    let seconds = 0;
    let format = "clock";

    if (parts.length === 2) {
      const [minutes, secs] = numbers;
      if (secs >= 60) return { error: "Seconds must be under 60 in mm:ss." };
      seconds = minutes * SECONDS_PER_MINUTE + secs;
    } else {
      const [hours, minutes, secs, frames] = numbers;
      if (minutes >= 60) return { error: "Minutes must be under 60." };
      if (secs >= 60) return { error: "Seconds must be under 60." };
      seconds = hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + secs;
      if (parts.length === 4) {
        if (!Number.isInteger(frames) || frames >= rate) {
          return { error: `The frame field must be a whole number under ${Math.ceil(rate)}.` };
        }
        seconds += frames / rate;
        format = "timecode";
      }
    }

    if (seconds > MAX_CLIP_SECONDS) return { error: "A single clip cannot exceed 24 hours." };
    return { seconds, format };
  }

  // 3) Unit shorthand: 1h 2m 3s (any subset, in that order).
  const unit = raw.match(
    /^(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+(?:\.\d+)?)\s*m(?!s))?\s*(?:(\d+(?:\.\d+)?)\s*s)?$/i,
  );
  if (unit && (unit[1] || unit[2] || unit[3])) {
    const seconds =
      Number(unit[1] || 0) * SECONDS_PER_HOUR +
      Number(unit[2] || 0) * SECONDS_PER_MINUTE +
      Number(unit[3] || 0);
    if (seconds > MAX_CLIP_SECONDS) return { error: "A single clip cannot exceed 24 hours." };
    return { seconds, format: "units" };
  }

  return { error: `"${text.trim()}" is not a duration this tool recognises.` };
}

/**
 * Add up a list of durations.
 * @param {string[]} lines            one duration per entry; blank entries are ignored
 * @param {object}   options
 * @param {number}   options.fps      frame rate for timecode entries
 * @param {number}   options.gapSeconds  padding inserted between consecutive clips
 * @param {number}   options.targetSeconds  slot length to compare against (0 = no target)
 */
export function sumRuntimes(lines, { fps = DEFAULT_FPS, gapSeconds = 0, targetSeconds = 0 } = {}) {
  if (!Array.isArray(lines)) return { error: "The clip list must be an array of durations." };

  const rate = Number(fps);
  const gap = Number(gapSeconds);
  const target = Number(targetSeconds);

  if (!Number.isFinite(rate) || rate < MIN_FPS || rate > MAX_FPS) {
    return { error: `Frame rate must be between ${MIN_FPS} and ${MAX_FPS} fps.` };
  }
  if (!Number.isFinite(gap) || gap < 0 || gap > 600) {
    return { error: "Gap between clips must be between 0 and 600 seconds." };
  }
  if (!Number.isFinite(target) || target < 0 || target > MAX_CLIP_SECONDS) {
    return { error: "Target length must be between 0 and 24 hours." };
  }

  const items = [];
  for (const line of lines) {
    const text = typeof line === "string" ? line.trim() : "";
    if (!text) continue;
    const parsed = parseDuration(text, rate);
    items.push({
      input: text,
      seconds: parsed.error ? null : parsed.seconds,
      format: parsed.format || null,
      error: parsed.error || null,
    });
  }

  const valid = items.filter((item) => item.error === null);
  const invalid = items.filter((item) => item.error !== null);

  if (items.length === 0) {
    return { isEmpty: true, items: [], invalid: [], validCount: 0, invalidCount: 0 };
  }
  if (valid.length === 0) {
    return { error: "None of the lines could be read as a duration.", items, invalid };
  }

  const clipSeconds = valid.reduce((sum, item) => sum + item.seconds, 0);
  const gapCount = Math.max(0, valid.length - 1);
  const gapTotal = gapCount * gap;
  const totalSeconds = clipSeconds + gapTotal;

  const durations = valid.map((item) => item.seconds);
  const longest = valid.reduce((best, item) => (item.seconds > best.seconds ? item : best), valid[0]);
  const shortest = valid.reduce((best, item) => (item.seconds < best.seconds ? item : best), valid[0]);

  const sorted = [...durations].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;

  // Running in-points, so each clip's start on the timeline is visible.
  let cursor = 0;
  const timeline = valid.map((item, index) => {
    const start = cursor;
    cursor += item.seconds + (index < valid.length - 1 ? gap : 0);
    return { ...item, start, end: start + item.seconds };
  });

  const difference = target > 0 ? totalSeconds - target : 0;

  return {
    isEmpty: false,
    items,
    invalid,
    timeline,
    validCount: valid.length,
    invalidCount: invalid.length,
    clipSeconds,
    gapCount,
    gapTotal,
    totalSeconds,
    totalFrames: Math.round(totalSeconds * rate),
    totalMinutes: totalSeconds / SECONDS_PER_MINUTE,
    averageSeconds: clipSeconds / valid.length,
    medianSeconds: median,
    longest,
    shortest,
    hasTarget: target > 0,
    targetSeconds: target,
    differenceSeconds: difference,
    percentOfTarget: target > 0 ? (totalSeconds / target) * 100 : 0,
    verdict:
      target > 0
        ? Math.abs(difference) < 0.5
          ? "on target"
          : difference > 0
            ? "over"
            : "under"
        : "no target set",
  };
}
