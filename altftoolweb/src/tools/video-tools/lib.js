/**
 * Video Tools — the arithmetic behind every video spec sheet.
 *
 * Every figure here comes from a definition, not a rule of thumb:
 *
 *   bitrate (bit/s)   = file size in bits / duration in seconds
 *   file size (bytes) = (video kbit/s + audio kbit/s) x 1000 / 8 x seconds
 *   bits per pixel    = bitrate / (width x height x frames per second)
 *   total frames      = duration x frames per second
 *   aspect ratio      = width : height reduced by their greatest common divisor
 *   SMPTE timecode    = HH:MM:SS:FF, FF = frame index inside the current second
 *
 * Units: 1 kbit/s = 1000 bit/s and 1 MB = 1,000,000 bytes (SI decimal). This is
 * the convention used by ffmpeg, by every streaming bitrate ladder, and by the
 * upload-size limits published by video platforms, so mixing in 1024-based
 * "MiB" here would silently inflate every answer by 4.9%.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** SI decimal megabyte. 1 MB = 1,000,000 bytes. */
export const BYTES_PER_MB = 1_000_000;

/** SI decimal kilobit. 1 kbit = 1000 bits. */
export const BITS_PER_KBIT = 1000;

/** Bits in one byte. */
export const BITS_PER_BYTE = 8;

/** Longest clip this tool will reason about: 24 hours, in seconds. */
export const MAX_DURATION_SECONDS = 24 * 60 * 60;

/** Frame-rate sanity bounds. 1000 fps covers high-speed camera footage. */
export const MIN_FPS = 1;
export const MAX_FPS = 1000;

/** Pixel-dimension sanity bound: 16384 is the largest side most decoders accept. */
export const MAX_DIMENSION = 16384;

/** Common delivery aspect ratios, as width/height decimals. */
export const ASPECT_PRESETS = [
  { id: "16:9", label: "16:9 landscape (YouTube, TV)", ratio: 16 / 9 },
  { id: "9:16", label: "9:16 vertical (Reels, Shorts, TikTok)", ratio: 9 / 16 },
  { id: "1:1", label: "1:1 square (feed post)", ratio: 1 },
  { id: "4:5", label: "4:5 portrait (Instagram feed)", ratio: 4 / 5 },
  { id: "4:3", label: "4:3 classic", ratio: 4 / 3 },
  { id: "21:9", label: "21:9 cinemascope", ratio: 21 / 9 },
];

/**
 * Reference video bitrates, in kbit/s, for H.264 at standard frame rates.
 * Source: YouTube's published recommended upload encoding settings
 * (SDR, standard frame rate 24-30 fps vs high frame rate 48-60 fps).
 */
export const H264_REFERENCE_BITRATES = [
  { label: "2160p (4K)", height: 2160, standardKbps: 35000, highFpsKbps: 53000 },
  { label: "1440p (2K)", height: 1440, standardKbps: 16000, highFpsKbps: 24000 },
  { label: "1080p", height: 1080, standardKbps: 8000, highFpsKbps: 12000 },
  { label: "720p", height: 720, standardKbps: 5000, highFpsKbps: 7500 },
  { label: "480p", height: 480, standardKbps: 2500, highFpsKbps: 4000 },
  { label: "360p", height: 360, standardKbps: 1000, highFpsKbps: 1500 },
];

/** YouTube treats 48 fps and above as "high frame rate" for bitrate guidance. */
export const HIGH_FRAME_RATE_THRESHOLD = 48;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function gcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/**
 * Reduce a pixel size to its lowest-terms aspect ratio, e.g. 1920x1080 -> "16:9".
 * Sizes that do not reduce to small integers (e.g. 1080x1350) still reduce
 * exactly; the decimal is returned alongside so the UI can show both.
 *
 * @param {number} width
 * @param {number} height
 * @returns {{ ratioLabel: string, ratioDecimal: number } | { error: string }}
 */
export function reduceAspect(width, height) {
  if (!isNum(width) || !isNum(height)) return { error: "Enter the width and height in pixels." };
  if (width <= 0 || height <= 0) return { error: "Width and height must be greater than zero." };
  const w = Math.round(width);
  const h = Math.round(height);
  const g = gcd(w, h);
  return { ratioLabel: `${w / g}:${h / g}`, ratioDecimal: w / h };
}

/**
 * Convert seconds into SMPTE-style HH:MM:SS:FF timecode at a given frame rate.
 * FF is the zero-based frame index inside the current second, so at 25 fps the
 * last frame of second 3 is 00:00:03:24.
 *
 * @param {number} seconds
 * @param {number} fps
 * @returns {{ timecode: string, clock: string, frameIndex: number } | { error: string }}
 */
export function secondsToTimecode(seconds, fps) {
  if (!isNum(seconds) || seconds < 0) return { error: "Enter a duration of zero seconds or more." };
  if (!isNum(fps) || fps < MIN_FPS || fps > MAX_FPS) {
    return { error: `Frame rate must be between ${MIN_FPS} and ${MAX_FPS} fps.` };
  }
  const totalFrames = Math.round(seconds * fps);
  const wholeSeconds = Math.floor(totalFrames / fps);
  const frameIndex = totalFrames - wholeSeconds * fps;
  const hh = Math.floor(wholeSeconds / 3600);
  const mm = Math.floor((wholeSeconds % 3600) / 60);
  const ss = wholeSeconds % 60;
  const pad = (n, size = 2) => String(Math.round(n)).padStart(size, "0");
  return {
    timecode: `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(frameIndex)}`,
    clock: `${pad(hh)}:${pad(mm)}:${pad(ss)}`,
    frameIndex: Math.round(frameIndex),
  };
}

/**
 * Parse "90", "1:30" or "00:01:30" into seconds.
 *
 * @param {string} text
 * @returns {{ seconds: number } | { error: string }}
 */
export function parseDuration(text) {
  const raw = String(text ?? "").trim();
  if (raw === "") return { error: "Enter the clip duration." };
  const parts = raw.split(":");
  if (parts.length > 3) return { error: "Use seconds, MM:SS or HH:MM:SS." };
  let seconds = 0;
  for (const part of parts) {
    const value = Number(part.trim());
    if (!isNum(value) || value < 0) return { error: "Use seconds, MM:SS or HH:MM:SS." };
    seconds = seconds * 60 + value;
  }
  if (seconds <= 0) return { error: "Duration must be greater than zero." };
  if (seconds > MAX_DURATION_SECONDS) return { error: "Keep the duration under 24 hours." };
  return { seconds };
}

/**
 * Full spec sheet for a clip whose size, length and picture are known.
 *
 * @param {{ durationSeconds: number, width: number, height: number,
 *           fps: number, fileSizeMB: number }} input
 */
export function analyzeVideo({ durationSeconds, width, height, fps, fileSizeMB }) {
  if (!isNum(durationSeconds) || durationSeconds <= 0) {
    return { error: "Duration must be greater than zero seconds." };
  }
  if (durationSeconds > MAX_DURATION_SECONDS) return { error: "Keep the duration under 24 hours." };
  if (!isNum(width) || !isNum(height) || width <= 0 || height <= 0) {
    return { error: "Enter the frame width and height in pixels." };
  }
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    return { error: `Width and height must each be ${MAX_DIMENSION} pixels or less.` };
  }
  if (!isNum(fps) || fps < MIN_FPS || fps > MAX_FPS) {
    return { error: `Frame rate must be between ${MIN_FPS} and ${MAX_FPS} fps.` };
  }
  if (!isNum(fileSizeMB) || fileSizeMB <= 0) {
    return { error: "File size must be greater than zero MB." };
  }

  const aspect = reduceAspect(width, height);
  if (aspect.error) return aspect;

  const sizeBits = fileSizeMB * BYTES_PER_MB * BITS_PER_BYTE;
  const bitrateKbps = sizeBits / durationSeconds / BITS_PER_KBIT;
  const pixelsPerSecond = width * height * fps;
  const bitsPerPixel = (bitrateKbps * BITS_PER_KBIT) / pixelsPerSecond;
  const totalFrames = Math.round(durationSeconds * fps);
  const tc = secondsToTimecode(durationSeconds, fps);

  return {
    durationSeconds,
    ratioLabel: aspect.ratioLabel,
    ratioDecimal: aspect.ratioDecimal,
    orientation: width > height ? "Landscape" : width < height ? "Portrait" : "Square",
    megapixels: (width * height) / 1_000_000,
    totalFrames,
    timecode: tc.error ? "" : tc.timecode,
    bitrateKbps,
    bitrateMbps: bitrateKbps / 1000,
    bitsPerPixel,
    mbPerMinute: (fileSizeMB / durationSeconds) * 60,
    fileSizeMB,
  };
}

/**
 * Size a transcode: given a duration and target bitrates, how big is the file?
 *
 * @param {{ durationSeconds: number, videoKbps: number, audioKbps: number }} input
 */
export function estimateSize({ durationSeconds, videoKbps, audioKbps }) {
  if (!isNum(durationSeconds) || durationSeconds <= 0) {
    return { error: "Duration must be greater than zero seconds." };
  }
  if (durationSeconds > MAX_DURATION_SECONDS) return { error: "Keep the duration under 24 hours." };
  if (!isNum(videoKbps) || videoKbps <= 0) return { error: "Video bitrate must be greater than zero." };
  if (!isNum(audioKbps) || audioKbps < 0) return { error: "Audio bitrate cannot be negative." };
  const totalKbps = videoKbps + audioKbps;
  const bytes = (totalKbps * BITS_PER_KBIT * durationSeconds) / BITS_PER_BYTE;
  return { totalKbps, bytes, sizeMB: bytes / BYTES_PER_MB };
}

/**
 * Reverse of estimateSize: the video bitrate that lands on a target file size.
 * Audio is subtracted first because it is usually fixed by the codec preset.
 *
 * @param {{ durationSeconds: number, targetSizeMB: number, audioKbps: number }} input
 */
export function bitrateForTargetSize({ durationSeconds, targetSizeMB, audioKbps }) {
  if (!isNum(durationSeconds) || durationSeconds <= 0) {
    return { error: "Duration must be greater than zero seconds." };
  }
  if (!isNum(targetSizeMB) || targetSizeMB <= 0) {
    return { error: "Target size must be greater than zero MB." };
  }
  if (!isNum(audioKbps) || audioKbps < 0) return { error: "Audio bitrate cannot be negative." };
  const totalKbps = (targetSizeMB * BYTES_PER_MB * BITS_PER_BYTE) / durationSeconds / BITS_PER_KBIT;
  const videoKbps = totalKbps - audioKbps;
  if (videoKbps <= 0) {
    return {
      error: `Audio alone at ${audioKbps} kbit/s already fills the ${targetSizeMB} MB budget — lower the audio bitrate or raise the target size.`,
    };
  }
  return { totalKbps, videoKbps };
}

/**
 * Fit a source frame inside a target aspect ratio without cropping, and report
 * the letterbox (top/bottom) or pillarbox (left/right) bars that result.
 *
 * @param {{ width: number, height: number, targetRatio: number }} input
 */
export function fitToAspect({ width, height, targetRatio }) {
  if (!isNum(width) || !isNum(height) || width <= 0 || height <= 0) {
    return { error: "Enter the frame width and height in pixels." };
  }
  if (!isNum(targetRatio) || targetRatio <= 0) return { error: "Choose a target aspect ratio." };
  const sourceRatio = width / height;
  // Keep the longest side of the source; the canvas grows on the other axis.
  let canvasWidth;
  let canvasHeight;
  if (sourceRatio > targetRatio) {
    canvasWidth = width;
    canvasHeight = width / targetRatio;
  } else {
    canvasHeight = height;
    canvasWidth = height * targetRatio;
  }
  canvasWidth = Math.round(canvasWidth);
  canvasHeight = Math.round(canvasHeight);
  const barWidth = Math.max(0, Math.round((canvasWidth - width) / 2));
  const barHeight = Math.max(0, Math.round((canvasHeight - height) / 2));
  const barArea = canvasWidth * canvasHeight - width * height;
  return {
    canvasWidth,
    canvasHeight,
    barWidth,
    barHeight,
    barType: barWidth > 0 ? "Pillarbox (side bars)" : barHeight > 0 ? "Letterbox (top and bottom bars)" : "Exact fit — no bars",
    barSharePercent: canvasWidth * canvasHeight > 0 ? (barArea / (canvasWidth * canvasHeight)) * 100 : 0,
  };
}

/**
 * Compare a measured bitrate against YouTube's published H.264 upload
 * recommendation for the nearest resolution tier.
 *
 * @param {{ height: number, fps: number, bitrateKbps: number }} input
 */
export function compareToReference({ height, fps, bitrateKbps }) {
  if (!isNum(height) || height <= 0) return { error: "Enter the frame height in pixels." };
  if (!isNum(fps) || fps < MIN_FPS || fps > MAX_FPS) {
    return { error: `Frame rate must be between ${MIN_FPS} and ${MAX_FPS} fps.` };
  }
  if (!isNum(bitrateKbps) || bitrateKbps <= 0) return { error: "Bitrate must be greater than zero." };
  let tier = H264_REFERENCE_BITRATES[H264_REFERENCE_BITRATES.length - 1];
  let smallestGap = Infinity;
  for (const row of H264_REFERENCE_BITRATES) {
    const gap = Math.abs(row.height - height);
    if (gap < smallestGap) {
      smallestGap = gap;
      tier = row;
    }
  }
  const highFps = fps >= HIGH_FRAME_RATE_THRESHOLD;
  const recommendedKbps = highFps ? tier.highFpsKbps : tier.standardKbps;
  const ratio = bitrateKbps / recommendedKbps;
  return {
    tierLabel: tier.label,
    highFps,
    recommendedKbps,
    ratio,
    verdict:
      ratio < 0.5
        ? "Well below the reference — expect visible blocking on motion."
        : ratio < 0.85
          ? "Below the reference — fine for talking heads, tight for action."
          : ratio <= 1.5
            ? "In line with the reference for this resolution."
            : "Above the reference — you can cut the bitrate with little visible loss.",
  };
}
