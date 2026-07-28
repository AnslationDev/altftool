/**
 * Thumbnail timestamp planning and naming for video frame extraction.
 *
 * Extracting frames in a browser means seeking an HTMLVideoElement to a time,
 * waiting for the "seeked" event, and drawing the current frame to a canvas.
 * Everything that decides *which* times to seek to, what to call the resulting
 * files, and how big to draw them is arithmetic, and that arithmetic lives here.
 *
 * Even spacing rule
 * -----------------
 * For n thumbnails across a clip of duration D, the times used are
 *
 *   t_i = D · (i + 1) / (n + 1)      for i = 0 … n−1
 *
 * i.e. the clip is cut into n+1 equal segments and a frame is taken at each
 * internal boundary. This deliberately never lands on t = 0 or t = D, because
 * the first frame of a video is very often a black or fade-in frame and seeking
 * to exactly the duration lands past the last decodable frame on many files.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Ways to choose the timestamps. */
export const MODES = {
  even: { label: "Evenly spaced", hint: "Cut the clip into equal segments and grab one frame per boundary" },
  interval: { label: "Fixed interval", hint: "One frame every N seconds from the start offset" },
  single: { label: "Single frame", hint: "One frame at an exact timecode" },
};

/** Most thumbnails one run may produce. Each frame is a full-size canvas
 * readback, so a few hundred is already slow and memory-heavy in a browser. */
export const MAX_THUMBNAILS = 120;

/** Shortest interval allowed, in seconds. Below this the frames are usually
 * duplicates: most video is 24-60 fps, so 0.05 s is about two frames. */
export const MIN_INTERVAL_SECONDS = 0.05;

/** Longest clip accepted, in seconds (6 hours). */
export const MAX_DURATION_SECONDS = 6 * 60 * 60;

/** Output widths offered. Height always follows from the source aspect ratio. */
export const WIDTH_PRESETS = [320, 480, 640, 854, 1280, 1920];

/** Encoders a browser canvas can write to. */
export const OUTPUT_FORMATS = [
  { value: "image/jpeg", label: "JPEG", extension: "jpg" },
  { value: "image/png", label: "PNG", extension: "png" },
  { value: "image/webp", label: "WebP", extension: "webp" },
];

/** Seconds in a minute and in an hour, for timecode formatting. */
export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3600;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function round3(value) {
  return Math.round(value * 1000) / 1000;
}

/**
 * Seconds as HH:MM:SS.mmm.
 * @param {number} seconds
 * @returns {string}
 */
export function formatTimecode(seconds) {
  if (!isNum(seconds) || seconds < 0) return "00:00:00.000";
  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const wholeSeconds = Math.floor(seconds % SECONDS_PER_MINUTE);
  const millis = Math.round((seconds - Math.floor(seconds)) * 1000);
  const safeMillis = millis === 1000 ? 999 : millis;
  return (
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(wholeSeconds).padStart(2, "0")}.` +
    `${String(safeMillis).padStart(3, "0")}`
  );
}

/**
 * Parse "SS", "MM:SS" or "HH:MM:SS" with optional decimal seconds.
 * @param {string} text
 * @returns {number|null} seconds, or null when the text is not a timecode
 */
export function parseTimecode(text) {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(":");
  if (parts.length > 3) return null;
  let total = 0;
  for (const part of parts) {
    if (!/^\d*\.?\d+$/.test(part)) return null;
    total = total * SECONDS_PER_MINUTE + Number(part);
  }
  return Number.isFinite(total) ? round3(total) : null;
}

/**
 * Thumbnail dimensions for a target width, keeping the source aspect ratio.
 *
 * @param {number} sourceWidth
 * @param {number} sourceHeight
 * @param {number} targetWidth
 * @returns {{ width: number, height: number } | { error: string }}
 */
export function computeThumbnailSize(sourceWidth, sourceHeight, targetWidth) {
  if (!isNum(sourceWidth) || !isNum(sourceHeight) || sourceWidth < 1 || sourceHeight < 1) {
    return { error: "The video has no readable width or height yet." };
  }
  if (!isNum(targetWidth) || targetWidth < 1) {
    return { error: "Choose an output width of at least 1 pixel." };
  }
  // Never enlarge: a thumbnail wider than the source only wastes bytes.
  const width = Math.min(Math.round(targetWidth), Math.round(sourceWidth));
  const height = Math.max(1, Math.round((width * sourceHeight) / sourceWidth));
  return { width, height };
}

/**
 * Work out the list of times to seek to.
 *
 * @param {object} options
 * @param {number} options.duration       clip length in seconds
 * @param {"even"|"interval"|"single"} options.mode
 * @param {number} [options.count]        number of frames, for "even"
 * @param {number} [options.interval]     seconds between frames, for "interval"
 * @param {number} [options.startOffset]  where to begin, seconds
 * @param {number} [options.at]           exact time, for "single"
 * @returns {{ timestamps: number[], mode: string, count: number } | { error: string }}
 */
export function planTimestamps({
  duration,
  mode = "even",
  count = 6,
  interval = 10,
  startOffset = 0,
  at = 0,
} = {}) {
  if (!MODES[mode]) return { error: "Choose evenly spaced, fixed interval or single frame." };
  if (!isNum(duration)) return { error: "The video duration could not be read yet." };
  if (duration <= 0) return { error: "This video reports a duration of zero, so no frame can be taken." };
  if (duration > MAX_DURATION_SECONDS) {
    return { error: `This tool handles clips up to ${MAX_DURATION_SECONDS / SECONDS_PER_HOUR} hours long.` };
  }
  if (!isNum(startOffset) || startOffset < 0) {
    return { error: "The start offset must be zero or more seconds." };
  }
  if (startOffset >= duration) {
    return { error: `The start offset is past the end of this ${formatTimecode(duration)} clip.` };
  }

  if (mode === "single") {
    if (!isNum(at) || at < 0) return { error: "Enter the timecode of the frame you want." };
    if (at >= duration) {
      return { error: `That timecode is past the end of this ${formatTimecode(duration)} clip.` };
    }
    return { timestamps: [round3(at)], mode, count: 1 };
  }

  if (mode === "interval") {
    if (!isNum(interval)) return { error: "Enter the interval in seconds." };
    if (interval < MIN_INTERVAL_SECONDS) {
      return { error: `Use an interval of at least ${MIN_INTERVAL_SECONDS} seconds.` };
    }
    const span = duration - startOffset;
    const frames = Math.floor(span / interval) + 1;
    if (frames > MAX_THUMBNAILS) {
      return {
        error: `That interval would produce ${frames} thumbnails. Keep it to ${MAX_THUMBNAILS} or fewer by raising the interval.`,
      };
    }
    const timestamps = [];
    for (let i = 0; i < frames; i += 1) {
      const time = startOffset + i * interval;
      if (time >= duration) break;
      timestamps.push(round3(time));
    }
    if (timestamps.length === 0) {
      return { error: "No frame falls inside the clip with those settings." };
    }
    return { timestamps, mode, count: timestamps.length };
  }

  // mode === "even"
  if (!isNum(count)) return { error: "Enter how many thumbnails you want." };
  const wanted = Math.floor(count);
  if (wanted < 1) return { error: "Ask for at least one thumbnail." };
  if (wanted > MAX_THUMBNAILS) {
    return { error: `Ask for ${MAX_THUMBNAILS} thumbnails or fewer.` };
  }
  const span = duration - startOffset;
  const timestamps = [];
  for (let i = 0; i < wanted; i += 1) {
    timestamps.push(round3(startOffset + (span * (i + 1)) / (wanted + 1)));
  }
  return { timestamps, mode, count: timestamps.length };
}

/**
 * File name for one extracted frame.
 *
 * @param {string} videoName original file name
 * @param {number} index zero-based position in the batch
 * @param {number} seconds timestamp of the frame
 * @param {string} extension "jpg", "png" or "webp"
 * @returns {string}
 */
export function thumbnailFileName(videoName, index, seconds, extension) {
  const base = (typeof videoName === "string" && videoName.trim() ? videoName.trim() : "video").replace(
    /\.[^.]+$/,
    "",
  );
  const safeBase = base.replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "") || "video";
  const position = String(Math.max(1, Math.floor(index) + 1)).padStart(3, "0");
  const stamp = formatTimecode(isNum(seconds) ? seconds : 0).replace(/[:.]/g, "-");
  const ext = typeof extension === "string" && extension ? extension : "jpg";
  return `${safeBase}-${position}-${stamp}.${ext}`;
}

/**
 * Byte count as a short human string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!isNum(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}
