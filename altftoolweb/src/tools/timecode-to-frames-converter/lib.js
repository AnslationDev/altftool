/**
 * SMPTE timecode <-> frames <-> real time.
 *
 * Timecode counts frames in HH:MM:SS:FF using a whole-number frame count per
 * second — 30 labels per second at 29.97 fps, 24 at 23.976, and so on. Because the
 * NTSC-derived rates are 1000/1001 of their nominal value, non-drop-frame timecode
 * runs slow against the wall clock by exactly 3.6 seconds per hour at 29.97.
 *
 * Drop-frame timecode (SMPTE ST 12-1) fixes that by skipping frame *labels* — never
 * frames of picture. At 29.97 the labels :00 and :01 are skipped at the start of
 * every minute except minutes divisible by ten, which removes 108 labels an hour
 * and brings timecode back to within a few milliseconds of real time. At 59.94 four
 * labels are skipped instead. Drop frame applies only to the 29.97 family; 23.976
 * and 24 never use it.
 *
 * Frame number from drop-frame timecode:
 *   n = (nominal*3600*hh + nominal*60*mm + nominal*ss + ff)
 *       - drop * (totalMinutes - floor(totalMinutes / 10))
 */

export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3600;
export const MINUTES_PER_HOUR = 60;
/** Drop frame skips labels every minute except every tenth minute. */
export const DROP_EXEMPT_INTERVAL = 10;
/** SMPTE ST 12-1 caps timecode at 24 hours before it rolls over. */
export const HOURS_PER_DAY = 24;

/**
 * Supported frame rates. `exactNumerator/exactDenominator` is the true rate;
 * `nominal` is the whole number of frame labels timecode uses each second.
 */
export const FRAME_RATES = Object.freeze([
  { id: "23.976", label: "23.976 fps (24 / 1.001)", nominal: 24, num: 24000, den: 1001, dropCapable: false },
  { id: "24", label: "24 fps (cinema)", nominal: 24, num: 24, den: 1, dropCapable: false },
  { id: "25", label: "25 fps (PAL)", nominal: 25, num: 25, den: 1, dropCapable: false },
  { id: "29.97", label: "29.97 fps (NTSC)", nominal: 30, num: 30000, den: 1001, dropCapable: true },
  { id: "30", label: "30 fps", nominal: 30, num: 30, den: 1, dropCapable: false },
  { id: "47.952", label: "47.952 fps", nominal: 48, num: 48000, den: 1001, dropCapable: false },
  { id: "48", label: "48 fps", nominal: 48, num: 48, den: 1, dropCapable: false },
  { id: "50", label: "50 fps (PAL HFR)", nominal: 50, num: 50, den: 1, dropCapable: false },
  { id: "59.94", label: "59.94 fps (NTSC HFR)", nominal: 60, num: 60000, den: 1001, dropCapable: true },
  { id: "60", label: "60 fps", nominal: 60, num: 60, den: 1, dropCapable: false },
  { id: "119.88", label: "119.88 fps", nominal: 120, num: 120000, den: 1001, dropCapable: true },
  { id: "120", label: "120 fps", nominal: 120, num: 120, den: 1, dropCapable: false },
]);

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Look up a frame rate definition by id. */
export function getFrameRate(id) {
  return FRAME_RATES.find((rate) => rate.id === id) || null;
}

/** The true frame rate as a decimal, e.g. 29.97002997… */
export function exactFps(rate) {
  if (!rate) return NaN;
  return rate.num / rate.den;
}

/**
 * Number of frame labels dropped at each drop point.
 * SMPTE derives this as 6% of the nominal rate: 2 at 30, 4 at 60, 8 at 120.
 */
export function dropCount(rate) {
  if (!rate || !rate.dropCapable) return 0;
  return Math.round(rate.nominal * 0.066666);
}

/** Parse "HH:MM:SS:FF" or "HH:MM:SS;FF" into parts. Returns null if malformed. */
export function parseTimecode(text) {
  if (typeof text !== "string") return null;
  const match = text.trim().match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})[:;.](\d{1,3})$/);
  if (!match) return null;
  const [, hours, minutes, seconds, frames] = match;
  return {
    hours: Number(hours),
    minutes: Number(minutes),
    seconds: Number(seconds),
    frames: Number(frames),
    separator: text.includes(";") ? ";" : ":",
  };
}

/** Format parts as a timecode string; drop-frame conventionally uses a semicolon. */
export function formatTimecode({ hours, minutes, seconds, frames }, dropFrame = false, pad = 2) {
  const two = (value) => String(value).padStart(2, "0");
  const framePart = String(frames).padStart(pad, "0");
  return `${two(hours)}:${two(minutes)}:${two(seconds)}${dropFrame ? ";" : ":"}${framePart}`;
}

/**
 * Whether a set of timecode parts is a label that drop-frame actually skips.
 * At 29.97, :00 and :01 of every minute not divisible by 10 do not exist.
 */
export function isDroppedLabel({ minutes, seconds, frames }, rate) {
  const drop = dropCount(rate);
  if (drop === 0) return false;
  return seconds === 0 && minutes % DROP_EXEMPT_INTERVAL !== 0 && frames < drop;
}

/** Validate timecode parts against a frame rate. Returns an error string or null. */
export function validateTimecodeParts(parts, rate, dropFrame) {
  if (!parts) return "Enter timecode as HH:MM:SS:FF.";
  const { hours, minutes, seconds, frames } = parts;
  if (hours >= HOURS_PER_DAY) return "Timecode rolls over at 24 hours — hours must be 00 to 23.";
  if (minutes >= MINUTES_PER_HOUR) return "Minutes must be 00 to 59.";
  if (seconds >= SECONDS_PER_MINUTE) return "Seconds must be 00 to 59.";
  if (frames >= rate.nominal) {
    return `At ${rate.label} the frame field runs 00 to ${String(rate.nominal - 1).padStart(2, "0")}.`;
  }
  if (dropFrame && isDroppedLabel(parts, rate)) {
    const drop = dropCount(rate);
    return `That label does not exist in drop frame — the first ${drop} frames of each minute are skipped except every tenth minute.`;
  }
  return null;
}

/** Timecode parts to an absolute frame number. */
export function partsToFrames(parts, rate, dropFrame) {
  const { hours, minutes, seconds, frames } = parts;
  const nominal = rate.nominal;
  const base = nominal * SECONDS_PER_HOUR * hours + nominal * SECONDS_PER_MINUTE * minutes + nominal * seconds + frames;
  if (!dropFrame) return base;
  const drop = dropCount(rate);
  const totalMinutes = MINUTES_PER_HOUR * hours + minutes;
  return base - drop * (totalMinutes - Math.floor(totalMinutes / DROP_EXEMPT_INTERVAL));
}

/** Absolute frame number back to timecode parts. */
export function framesToParts(frameNumber, rate, dropFrame) {
  const nominal = rate.nominal;
  let n = Math.round(frameNumber);

  if (dropFrame) {
    const drop = dropCount(rate);
    const framesPer10Minutes = Math.round(exactFps(rate) * 600);
    const framesPerMinute = nominal * SECONDS_PER_MINUTE - drop;
    const tenMinuteBlocks = Math.floor(n / framesPer10Minutes);
    const remainder = n % framesPer10Minutes;
    if (remainder > drop) {
      n += drop * 9 * tenMinuteBlocks + drop * Math.floor((remainder - drop) / framesPerMinute);
    } else {
      n += drop * 9 * tenMinuteBlocks;
    }
  }

  const frames = n % nominal;
  const totalSeconds = Math.floor(n / nominal);
  return {
    hours: Math.floor(totalSeconds / SECONDS_PER_HOUR),
    minutes: Math.floor(totalSeconds / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR,
    seconds: totalSeconds % SECONDS_PER_MINUTE,
    frames,
  };
}

/** Real elapsed seconds for a frame count at the true rate. */
export function framesToRealSeconds(frameNumber, rate) {
  if (!isFiniteNumber(frameNumber) || !rate) return NaN;
  return (frameNumber * rate.den) / rate.num;
}

/** Frame count for a number of real seconds, rounded to the nearest whole frame. */
export function realSecondsToFrames(realSeconds, rate) {
  if (!isFiniteNumber(realSeconds) || !rate) return NaN;
  return Math.round((realSeconds * rate.num) / rate.den);
}

/** Real seconds as HH:MM:SS.mmm. */
export function formatRealClock(totalSeconds) {
  if (!isFiniteNumber(totalSeconds) || totalSeconds < 0) return "—";
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  const two = (value) => String(value).padStart(2, "0");
  return `${two(hours)}:${two(minutes)}:${seconds.toFixed(3).padStart(6, "0")}`;
}

/**
 * Convert from any one of timecode, frame count or real seconds.
 *
 * @param {object} input
 * @param {"timecode"|"frames"|"seconds"} input.mode
 * @param {string|number} input.value
 * @param {string} input.fpsId
 * @param {boolean} [input.dropFrame]
 * @returns {object} every representation, or { error }
 */
export function convertTimecode({ mode, value, fpsId, dropFrame = false } = {}) {
  const rate = getFrameRate(fpsId);
  if (!rate) return { error: "Choose a frame rate." };
  const useDrop = Boolean(dropFrame) && rate.dropCapable;
  if (dropFrame && !rate.dropCapable) {
    return { error: `Drop frame does not apply at ${rate.label} — it only exists for the 29.97 family.` };
  }

  const maxFrames = Math.round(exactFps(rate) * SECONDS_PER_HOUR * HOURS_PER_DAY);
  let frameNumber;

  if (mode === "timecode") {
    const parts = parseTimecode(value);
    const invalid = validateTimecodeParts(parts, rate, useDrop);
    if (invalid) return { error: invalid };
    frameNumber = partsToFrames(parts, rate, useDrop);
  } else if (mode === "frames") {
    const numeric = typeof value === "number" ? value : Number(String(value).trim());
    if (!isFiniteNumber(numeric)) return { error: "Enter a whole number of frames." };
    if (numeric < 0) return { error: "Frame count cannot be negative." };
    if (!Number.isInteger(numeric)) return { error: "Frame count must be a whole number." };
    frameNumber = numeric;
  } else if (mode === "seconds") {
    const numeric = typeof value === "number" ? value : Number(String(value).trim());
    if (!isFiniteNumber(numeric)) return { error: "Enter a duration in seconds." };
    if (numeric < 0) return { error: "Duration cannot be negative." };
    frameNumber = realSecondsToFrames(numeric, rate);
  } else {
    return { error: "Choose what you are converting from." };
  }

  if (frameNumber > maxFrames) {
    return { error: "Timecode rolls over at 24 hours — that value is past the limit." };
  }

  const ndfParts = framesToParts(frameNumber, rate, false);
  const dfParts = rate.dropCapable ? framesToParts(frameNumber, rate, true) : null;
  const realSeconds = framesToRealSeconds(frameNumber, rate);
  const ndfNominalSeconds = frameNumber / rate.nominal;

  return {
    rate,
    dropFrame: useDrop,
    frameNumber,
    realSeconds,
    realClock: formatRealClock(realSeconds),
    nonDropTimecode: formatTimecode(ndfParts, false),
    dropTimecode: dfParts ? formatTimecode(dfParts, true) : null,
    activeTimecode: formatTimecode(useDrop ? dfParts : ndfParts, useDrop),
    parts: useDrop ? dfParts : ndfParts,
    exactFps: exactFps(rate),
    nominalFps: rate.nominal,
    /** How far non-drop timecode has drifted from the wall clock at this point. */
    nonDropDriftSeconds: realSeconds - ndfNominalSeconds,
    framesPerSecondLabel: rate.nominal,
    dropPerHour: dropCount(rate) * (MINUTES_PER_HOUR - MINUTES_PER_HOUR / DROP_EXEMPT_INTERVAL),
  };
}
