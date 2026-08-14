/**
 * Timelapse interval, frame count, clip length and storage.
 *
 * A timelapse is fully described by three numbers, any two of which fix the third:
 *
 *     shots        = realDurationSeconds / intervalSeconds
 *     clipSeconds  = shots / playbackFps
 *     speedUp      = realDurationSeconds / clipSeconds = intervalSeconds * playbackFps
 *
 * That last identity is the useful one on location: at 24 fps a 2 second interval
 * always compresses time by 48x, whatever the shoot length. Storage is then simply
 * shots multiplied by the size of one file.
 *
 * The one physical constraint is that an interval must be longer than the exposure
 * plus the time the camera needs to write the file, or the intervalometer will skip
 * cycles. Long-exposure work is where this bites.
 */

export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3600;

/** Memory cards are labelled in SI units, so 1 GB is 1000 MB. */
export const MB_PER_GB = 1000;

export const MIN_INTERVAL_SECONDS = 0.1;
export const MAX_INTERVAL_SECONDS = 3600;
export const MIN_FPS = 1;
export const MAX_FPS = 240;
export const MAX_REAL_DURATION_SECONDS = 2_592_000; // 30 days
export const MAX_SHOTS = 1_000_000;

/**
 * Time a camera needs after the exposure closes before it can start the next frame.
 * A conservative allowance covering buffer write and mirror/shutter reset.
 */
export const DEFAULT_WRITE_OVERHEAD_SECONDS = 1;

/** Interval starting points that suit common subjects. */
export const SUBJECT_PRESETS = Object.freeze([
  { id: "people", label: "People and street traffic", intervalSeconds: 1 },
  { id: "fast-clouds", label: "Fast-moving clouds", intervalSeconds: 2 },
  { id: "slow-clouds", label: "Slow clouds and shadows", intervalSeconds: 5 },
  { id: "sunset", label: "Sunset or sunrise", intervalSeconds: 4 },
  { id: "stars", label: "Stars and night sky", intervalSeconds: 25 },
  { id: "construction", label: "Construction over days", intervalSeconds: 300 },
  { id: "plants", label: "Plant growth", intervalSeconds: 900 },
]);

/** Typical single-file sizes, for a first pass at storage. */
export const FILE_SIZE_PRESETS = Object.freeze([
  { id: "jpeg-24", label: "JPEG, 24 MP fine", megabytes: 8 },
  { id: "raw-24", label: "RAW, 24 MP", megabytes: 25 },
  { id: "raw-45", label: "RAW, 45 MP", megabytes: 55 },
  { id: "raw-61", label: "RAW, 61 MP", megabytes: 75 },
]);

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Combine hours, minutes and seconds into total seconds. */
export function toSeconds({ hours = 0, minutes = 0, seconds = 0 } = {}) {
  if (![hours, minutes, seconds].every(isFiniteNumber)) return NaN;
  return hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds;
}

/** Human duration string from seconds. */
export function formatDuration(totalSeconds) {
  if (!isFiniteNumber(totalSeconds) || totalSeconds < 0) return "—";
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / SECONDS_PER_HOUR);
  const minutes = Math.floor((rounded % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = rounded % SECONDS_PER_MINUTE;
  const parts = [];
  if (hours > 0) parts.push(`${hours} h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes} m`);
  parts.push(`${seconds} s`);
  return parts.join(" ");
}

/**
 * Full timelapse plan.
 *
 * @param {object} input
 * @param {number} input.realDurationSeconds  how long the camera is shooting for
 * @param {number} input.intervalSeconds      gap between frames
 * @param {number} input.playbackFps          frame rate of the finished clip
 * @param {number} [input.fileMegabytes]      size of one captured file
 * @param {number} [input.cardGigabytes]      free space available
 * @param {number} [input.exposureSeconds]    shutter time per frame
 * @param {number} [input.writeOverheadSeconds]
 * @returns {object} plan, or { error }
 */
export function planTimelapse({
  realDurationSeconds,
  intervalSeconds,
  playbackFps,
  fileMegabytes = 0,
  cardGigabytes = 0,
  exposureSeconds = 0,
  writeOverheadSeconds = DEFAULT_WRITE_OVERHEAD_SECONDS,
} = {}) {
  if (!isFiniteNumber(realDurationSeconds) || realDurationSeconds <= 0) {
    return { error: "Enter how long you will be shooting for." };
  }
  if (realDurationSeconds > MAX_REAL_DURATION_SECONDS) {
    return { error: "Shooting time must be under 30 days." };
  }
  if (
    !isFiniteNumber(intervalSeconds) ||
    intervalSeconds < MIN_INTERVAL_SECONDS ||
    intervalSeconds > MAX_INTERVAL_SECONDS
  ) {
    return {
      error: `Interval must be between ${MIN_INTERVAL_SECONDS} and ${MAX_INTERVAL_SECONDS} seconds.`,
    };
  }
  if (!isFiniteNumber(playbackFps) || playbackFps < MIN_FPS || playbackFps > MAX_FPS) {
    return { error: `Playback frame rate must be between ${MIN_FPS} and ${MAX_FPS} fps.` };
  }
  if (!isFiniteNumber(fileMegabytes) || fileMegabytes < 0) {
    return { error: "File size cannot be negative." };
  }
  if (!isFiniteNumber(cardGigabytes) || cardGigabytes < 0) {
    return { error: "Card capacity cannot be negative." };
  }
  if (!isFiniteNumber(exposureSeconds) || exposureSeconds < 0) {
    return { error: "Exposure time cannot be negative." };
  }

  const shots = Math.floor(realDurationSeconds / intervalSeconds);
  if (shots < 1) {
    return { error: "The interval is longer than the shoot — you would not capture a single frame." };
  }
  if (shots > MAX_SHOTS) {
    return { error: "That combination needs over a million frames. Lengthen the interval." };
  }

  const clipSeconds = shots / playbackFps;
  const speedUpFactor = intervalSeconds * playbackFps;
  const totalMegabytes = shots * fileMegabytes;
  const totalGigabytes = totalMegabytes / MB_PER_GB;

  const cardMegabytes = cardGigabytes * MB_PER_GB;
  const shotsCardHolds = fileMegabytes > 0 ? Math.floor(cardMegabytes / fileMegabytes) : Infinity;
  const cardCoversSeconds = Number.isFinite(shotsCardHolds)
    ? shotsCardHolds * intervalSeconds
    : Infinity;

  const minimumInterval = exposureSeconds + writeOverheadSeconds;
  const intervalTooShort = exposureSeconds > 0 && intervalSeconds < minimumInterval;

  const warnings = [];
  if (intervalTooShort) {
    warnings.push(
      `An interval of ${intervalSeconds} s is shorter than a ${exposureSeconds} s exposure plus about ${writeOverheadSeconds} s to write the file. Use at least ${minimumInterval.toFixed(1)} s or the camera will skip frames.`,
    );
  }
  if (cardGigabytes > 0 && fileMegabytes > 0 && totalMegabytes > cardMegabytes) {
    warnings.push(
      `This sequence needs ${totalGigabytes.toFixed(1)} GB but only ${cardGigabytes} GB is free — the card fills after about ${formatDuration(cardCoversSeconds)} of shooting.`,
    );
  }
  if (clipSeconds < 3) {
    warnings.push(
      `The finished clip is only ${clipSeconds.toFixed(1)} s. Shorten the interval or shoot for longer if you need a usable shot.`,
    );
  }

  return {
    realDurationSeconds,
    intervalSeconds,
    playbackFps,
    shots,
    clipSeconds,
    speedUpFactor,
    totalMegabytes,
    totalGigabytes,
    megabytesPerClipSecond: clipSeconds > 0 ? totalMegabytes / clipSeconds : 0,
    shotsCardHolds,
    cardCoversSeconds,
    cardFits: cardGigabytes <= 0 || fileMegabytes <= 0 || totalMegabytes <= cardMegabytes,
    minimumInterval,
    intervalTooShort,
    warnings,
  };
}
