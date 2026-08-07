/**
 * Timecode maths and FFmpeg command building for trimming a video.
 *
 * Rules implemented:
 *  - Timecodes follow the SMPTE-style HH:MM:SS.mmm form used by FFmpeg's -ss
 *    and -t options; a bare number is read as seconds, MM:SS and HH:MM:SS are
 *    also accepted.
 *  - Clip length = end - start (FFmpeg's -t takes a duration, not an end time).
 *  - Average bitrate = file size in bits / duration in seconds, so the output
 *    size of a stream copy is estimated as
 *        output bytes ≈ source bytes x (clip length / source length).
 *  - Stream copy (-c copy) cannot cut mid-GOP: FFmpeg moves the cut back to the
 *    nearest preceding keyframe, so the clip can start slightly early. A typical
 *    camera or phone recording places a keyframe every 2 seconds, which is the
 *    worst-case drift this tool warns about.
 */

/** Shortest clip worth producing. */
export const MIN_CLIP_SECONDS = 0.1;

/**
 * Typical keyframe (GOP) spacing in seconds for phone and camera recordings and
 * for most streaming encodes — the accuracy limit of a stream-copy cut.
 */
export const TYPICAL_KEYFRAME_INTERVAL_SECONDS = 2;

/** Bits in a byte — used for the bitrate conversion. */
export const BITS_PER_BYTE = 8;

/** Output modes offered. */
export const TRIM_MODES = {
  copy: "Fast (stream copy, no re-encode)",
  reencode: "Precise (re-encode with H.264)",
};

/** Constant Rate Factor bounds for x264 (0 = lossless, 51 = worst). */
export const MIN_CRF = 14;
export const MAX_CRF = 32;
export const DEFAULT_CRF = 23;

const round = (value, decimals = 3) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/**
 * Parse a timecode into seconds.
 * Accepts "12", "12.5", "1:23", "1:23.250", "01:02:03.5".
 * @returns {number|null} seconds, or null when the text is not a timecode.
 */
export function parseTimecode(input) {
  const text = String(input ?? "").trim();
  if (text === "") return null;
  if (!/^\d+(:\d{1,2}){0,2}(\.\d+)?$/.test(text)) return null;

  const parts = text.split(":");
  let seconds = 0;
  for (const part of parts) {
    const value = Number(part);
    if (!Number.isFinite(value)) return null;
    seconds = seconds * 60 + value;
  }
  return Number.isFinite(seconds) ? seconds : null;
}

/**
 * Format seconds as HH:MM:SS.mmm (the form FFmpeg accepts for -ss).
 */
export function formatTimecode(totalSeconds, withMillis = true) {
  const safe = round(Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0, 3);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n) => String(n).padStart(2, "0");
  const secText = withMillis
    ? seconds.toFixed(3).padStart(6, "0")
    : pad(Math.floor(seconds));
  return `${pad(hours)}:${pad(minutes)}:${secText}`;
}

/** Human file size using binary units (1 KiB = 1024 bytes), labelled KB/MB/GB. */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Validate a trim selection and describe the resulting clip.
 *
 * @param {object} input
 * @param {number|string} input.start  start time (seconds or timecode)
 * @param {number|string} input.end    end time (seconds or timecode)
 * @param {number} input.durationSeconds  length of the source video
 * @param {number} [input.sourceBytes]    size of the source file
 * @param {"copy"|"reencode"} [input.mode]
 * @returns {object} clip plan, or { error }.
 */
export function planTrim({ start, end, durationSeconds, sourceBytes = 0, mode = "copy" }) {
  const duration = typeof durationSeconds === "number" ? durationSeconds : parseTimecode(durationSeconds);
  if (duration === null || !Number.isFinite(duration) || duration <= 0) {
    return { error: "Load a video first so its length is known." };
  }
  if (!TRIM_MODES[mode]) return { error: "Pick a valid output mode." };

  const startSec = typeof start === "number" ? start : parseTimecode(start);
  const endSec = typeof end === "number" ? end : parseTimecode(end);
  if (startSec === null || endSec === null) {
    return { error: "Times must look like 12, 1:23 or 00:01:23.500." };
  }
  if (startSec < 0 || endSec < 0) return { error: "Times cannot be negative." };
  if (startSec >= duration) {
    return { error: `Start time is at or past the end of the video (${formatTimecode(duration)}).` };
  }

  const clampedEnd = Math.min(endSec, duration);
  // Rounded to millisecond precision first, so 10.1 - 10 counts as exactly 0.1
  // instead of failing the minimum by a floating-point hair.
  const clipDuration = round(clampedEnd - startSec);
  if (clipDuration < MIN_CLIP_SECONDS) {
    return {
      error: `The clip must be at least ${MIN_CLIP_SECONDS} seconds long — set an end time after the start time.`,
    };
  }

  const bytes = Number.isFinite(sourceBytes) && sourceBytes > 0 ? sourceBytes : 0;
  const averageBitrateBps = bytes > 0 ? (bytes * BITS_PER_BYTE) / duration : 0;
  const estimatedBytes = bytes > 0 ? bytes * (clipDuration / duration) : 0;

  return {
    startSeconds: round(startSec),
    endSeconds: round(clampedEnd),
    clipDuration: round(clipDuration),
    removedSeconds: round(duration - clipDuration),
    keptPercent: round((clipDuration / duration) * 100, 2),
    startTimecode: formatTimecode(startSec),
    endTimecode: formatTimecode(clampedEnd),
    clipTimecode: formatTimecode(clipDuration),
    durationSeconds: round(duration),
    endWasClamped: endSec > duration,
    averageBitrateKbps: averageBitrateBps > 0 ? Math.round(averageBitrateBps / 1000) : 0,
    estimatedBytes: Math.round(estimatedBytes),
    mode,
    // A stream copy can only cut on a keyframe, so the clip may start early.
    worstCaseDriftSeconds: mode === "copy" ? TYPICAL_KEYFRAME_INTERVAL_SECONDS : 0,
  };
}

/**
 * Build the FFmpeg argument list for the trim.
 *
 * -ss and -t are placed before -i so FFmpeg seeks the input rather than
 * decoding and discarding the leading frames, which is what makes the fast mode
 * fast. `-avoid_negative_ts make_zero` rebases timestamps so a copied clip
 * starts at zero and plays in every player.
 *
 * @returns {string[]|{error:string}}
 */
export function buildFfmpegArgs({
  plan,
  inputName = "input.mp4",
  outputName = "trimmed.mp4",
  keepAudio = true,
  crf = DEFAULT_CRF,
}) {
  if (!plan || plan.error) return { error: plan?.error || "Nothing to trim yet." };

  const args = [
    "-ss",
    formatTimecode(plan.startSeconds),
    "-t",
    plan.clipDuration.toFixed(3),
    "-i",
    inputName,
  ];

  if (plan.mode === "copy") {
    args.push("-map", "0");
    if (!keepAudio) args.push("-an");
    args.push("-c", "copy", "-avoid_negative_ts", "make_zero", outputName);
    return args;
  }

  const crfValue = Math.min(MAX_CRF, Math.max(MIN_CRF, Math.round(Number(crf) || DEFAULT_CRF)));
  args.push("-map", "0:v:0");
  if (keepAudio) args.push("-map", "0:a?");
  else args.push("-an");
  args.push(
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    String(crfValue),
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
  );
  if (keepAudio) args.push("-c:a", "aac", "-b:a", "128k");
  args.push(outputName);
  return args;
}
