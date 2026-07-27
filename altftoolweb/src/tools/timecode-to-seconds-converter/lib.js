/**
 * SMPTE timecode <-> seconds conversion.
 *
 * Two things make this less trivial than it looks:
 *  1. NTSC-family rates run 1000/1001 slow (23.976, 29.97, 59.94), so the frame
 *     LABELS advance at 24/30/60 per second while real time does not.
 *  2. Drop-frame timecode skips frame NUMBERS (never frames of picture) so that the
 *     29.97 label clock stays within ~2 frames of the wall clock over a day.
 * Drop-frame rule (SMPTE ST 12-1): at the start of every minute, drop the first two
 * frame numbers (four at 59.94) — except on every tenth minute.
 */

/** SMPTE timecode wraps back to zero after 24 hours. */
export const MAX_HOURS = 23;

/** The NTSC pulldown factor: colour NTSC runs at 1000/1001 of the nominal rate. */
export const NTSC_FACTOR = 1000 / 1001;

/**
 * Supported timecode rates.
 *  nominal   = frames labelled per second (what the FF field counts up to)
 *  exact     = real frames per second of playback
 *  dropFrames= frame numbers skipped at each drop minute (0 for non-drop)
 */
export const FRAME_RATES = [
  { key: "23.976", label: "23.976 fps (24 ÷ 1.001)", nominal: 24, exact: 24000 / 1001, dropFrames: 0 },
  { key: "24", label: "24 fps (film)", nominal: 24, exact: 24, dropFrames: 0 },
  { key: "25", label: "25 fps (PAL)", nominal: 25, exact: 25, dropFrames: 0 },
  { key: "29.97ndf", label: "29.97 fps non-drop", nominal: 30, exact: 30000 / 1001, dropFrames: 0 },
  { key: "29.97df", label: "29.97 fps drop-frame", nominal: 30, exact: 30000 / 1001, dropFrames: 2 },
  { key: "30", label: "30 fps", nominal: 30, exact: 30, dropFrames: 0 },
  { key: "47.952", label: "47.952 fps (48 ÷ 1.001)", nominal: 48, exact: 48000 / 1001, dropFrames: 0 },
  { key: "48", label: "48 fps", nominal: 48, exact: 48, dropFrames: 0 },
  { key: "50", label: "50 fps (PAL)", nominal: 50, exact: 50, dropFrames: 0 },
  { key: "59.94ndf", label: "59.94 fps non-drop", nominal: 60, exact: 60000 / 1001, dropFrames: 0 },
  { key: "59.94df", label: "59.94 fps drop-frame", nominal: 60, exact: 60000 / 1001, dropFrames: 4 },
  { key: "60", label: "60 fps", nominal: 60, exact: 60, dropFrames: 0 },
];

export const DEFAULT_RATE_KEY = "29.97df";

/** Look up a rate descriptor by key. */
export function getRate(key) {
  return FRAME_RATES.find((rate) => rate.key === key) || null;
}

function pad(value, width = 2) {
  return String(Math.abs(Math.trunc(value))).padStart(width, "0");
}

/** Frames in one 24-hour timecode day for this rate, after drops. */
function framesPerDay(rate) {
  // 1440 minutes a day, of which 144 are tenth minutes where nothing is dropped.
  return rate.nominal * 3600 * 24 - rate.dropFrames * (1440 - 144);
}

/**
 * Parse a timecode string. Accepts ":" or ";" or "." as separators and 2-4 fields,
 * read from the right: frames, seconds, minutes, hours.
 */
export function parseTimecode(text) {
  if (typeof text !== "string") return { error: "Enter a timecode such as 01:00:00:00." };
  const trimmed = text.trim();
  if (!trimmed) return { error: "Enter a timecode such as 01:00:00:00." };
  if (!/^\d{1,2}([:;.]\d{1,2}){1,3}$/.test(trimmed)) {
    return { error: "Use digits separated by colons, for example 00:01:30:12." };
  }

  const parts = trimmed.split(/[:;.]/).map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) {
    return { error: "Every field of the timecode must be a number." };
  }

  while (parts.length < 4) parts.unshift(0);
  const [hours, minutes, seconds, frames] = parts;

  return { hours, minutes, seconds, frames, usedDropSeparator: trimmed.includes(";") };
}

/**
 * Convert a timecode to its sequential frame number (frames elapsed since 00:00:00:00).
 */
export function timecodeToFrames({ timecode, rateKey } = {}) {
  const rate = getRate(rateKey);
  if (!rate) return { error: "Choose a frame rate from the list." };

  const parsed = parseTimecode(timecode);
  if (parsed.error) return { error: parsed.error };

  const { hours, minutes, seconds, frames } = parsed;

  if (hours > MAX_HOURS) {
    return { error: `SMPTE timecode wraps at 24 hours, so hours must be 00 to ${pad(MAX_HOURS)}.` };
  }
  if (minutes > 59) return { error: "Minutes must be 00 to 59." };
  if (seconds > 59) return { error: "Seconds must be 00 to 59." };
  if (frames > rate.nominal - 1) {
    return {
      error: `At ${rate.label} the frame field counts 00 to ${pad(rate.nominal - 1)}.`,
    };
  }
  if (rate.dropFrames > 0 && seconds === 0 && minutes % 10 !== 0 && frames < rate.dropFrames) {
    return {
      error: `Drop-frame skips frame numbers 00 to ${pad(rate.dropFrames - 1)} at the start of every minute except every tenth, so ${pad(hours)}:${pad(minutes)}:${pad(seconds)};${pad(frames)} never occurs.`,
    };
  }

  const totalMinutes = hours * 60 + minutes;
  const dropped = rate.dropFrames * (totalMinutes - Math.floor(totalMinutes / 10));
  const frameNumber =
    rate.nominal * 3600 * hours + rate.nominal * 60 * minutes + rate.nominal * seconds + frames - dropped;

  return { frameNumber, rate, hours, minutes, seconds, frames };
}

/** Convert a sequential frame number back to a timecode string. */
export function framesToTimecode(frameNumber, rateKey) {
  const rate = getRate(rateKey);
  if (!rate) return { error: "Choose a frame rate from the list." };
  if (!Number.isFinite(frameNumber)) return { error: "Frame count must be a number." };
  if (frameNumber < 0) return { error: "Frame count cannot be negative." };

  const perDay = framesPerDay(rate);
  const wrapped = Math.floor(frameNumber) % perDay;
  const wrappedDays = Math.floor(Math.floor(frameNumber) / perDay);

  let counted = wrapped;

  if (rate.dropFrames > 0) {
    // Re-insert the skipped frame numbers so the labels line up again.
    const framesPer10Minutes = rate.nominal * 600 - rate.dropFrames * 9;
    const framesPerMinute = rate.nominal * 60 - rate.dropFrames;
    const tenMinuteBlocks = Math.floor(wrapped / framesPer10Minutes);
    const remainder = wrapped % framesPer10Minutes;
    counted =
      wrapped +
      rate.dropFrames * 9 * tenMinuteBlocks +
      (remainder > rate.dropFrames
        ? rate.dropFrames * Math.floor((remainder - rate.dropFrames) / framesPerMinute)
        : 0);
  }

  const frames = counted % rate.nominal;
  const totalSeconds = Math.floor(counted / rate.nominal);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  const separator = rate.dropFrames > 0 ? ";" : ":";

  return {
    timecode: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${separator}${pad(frames)}`,
    hours,
    minutes,
    seconds,
    frames,
    wrappedDays,
  };
}

/** Format seconds as HH:MM:SS.mmm. */
export function formatClock(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "00:00:00.000";
  const whole = Math.floor(totalSeconds);
  const ms = Math.round((totalSeconds - whole) * 1000);
  const carry = ms === 1000 ? 1 : 0;
  return `${pad(Math.floor((whole + carry) / 3600))}:${pad(Math.floor((whole + carry) / 60) % 60)}:${pad(
    (whole + carry) % 60,
  )}.${String(carry ? 0 : ms).padStart(3, "0")}`;
}

/**
 * Timecode -> seconds. Returns both the true elapsed time (frames ÷ real fps)
 * and the "reading" time the digits imply (frames ÷ nominal fps).
 */
export function timecodeToSeconds({ timecode, rateKey } = {}) {
  const result = timecodeToFrames({ timecode, rateKey });
  if (result.error) return { error: result.error };

  const { frameNumber, rate } = result;
  const realSeconds = frameNumber / rate.exact;
  const nominalSeconds = frameNumber / rate.nominal;

  return {
    rateKey: rate.key,
    rateLabel: rate.label,
    isDropFrame: rate.dropFrames > 0,
    nominalFps: rate.nominal,
    exactFps: rate.exact,
    frameNumber,
    realSeconds,
    nominalSeconds,
    driftSeconds: realSeconds - nominalSeconds,
    realClock: formatClock(realSeconds),
    milliseconds: realSeconds * 1000,
    normalisedTimecode: framesToTimecode(frameNumber, rate.key).timecode,
  };
}

/** Seconds -> timecode, rounding to the nearest whole frame. */
export function secondsToTimecode({ seconds, rateKey } = {}) {
  const rate = getRate(rateKey);
  if (!rate) return { error: "Choose a frame rate from the list." };

  const value = Number(seconds);
  if (!Number.isFinite(value)) return { error: "Enter the duration in seconds as a number." };
  if (value < 0) return { error: "Duration cannot be negative." };

  const maxSeconds = framesPerDay(rate) / rate.exact;
  if (value > maxSeconds) {
    return { error: "That is longer than the 24-hour timecode day — split it into shorter clips." };
  }

  const frameNumber = Math.round(value * rate.exact);
  const converted = framesToTimecode(frameNumber, rate.key);
  if (converted.error) return { error: converted.error };

  const exactSeconds = frameNumber / rate.exact;

  return {
    rateKey: rate.key,
    rateLabel: rate.label,
    isDropFrame: rate.dropFrames > 0,
    frameNumber,
    timecode: converted.timecode,
    roundingErrorSeconds: exactSeconds - value,
    snappedSeconds: exactSeconds,
    realClock: formatClock(exactSeconds),
  };
}
