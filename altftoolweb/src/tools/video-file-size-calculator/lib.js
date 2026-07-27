/**
 * Video export file size.
 *
 * The size of a finished file is fixed by its total data rate and its duration:
 *
 *     bits  = (videoBitrate_kbps + audioBitrate_kbps) * 1000 * durationSeconds
 *     bytes = bits / 8
 *
 * Everything else here is about arriving at a defensible bitrate. Two approaches
 * are supported:
 *
 * 1. Bits per pixel. A long-GOP codec's data rate scales with the pixel rate:
 *    bitrate = width * height * fps * bpp. Around 0.10 bits per pixel is the
 *    familiar "good H.264" setting — at 1920x1080p30 that is 6.2 Mb/s, in the same
 *    region as YouTube's published 8 Mb/s recommendation for 1080p30 SDR uploads.
 *    Newer codecs are applied as a bitrate multiplier against H.264: HEVC is
 *    generally cited at roughly half the bitrate for equal quality, and AV1 at
 *    roughly 30% below HEVC again.
 *
 * 2. Fixed-rate intra codecs. Apple publishes target data rates for ProRes at
 *    1920x1080 29.97 fps; the family scales with pixel rate, so those figures are
 *    stored as the reference point and scaled.
 */

export const BITS_PER_BYTE = 8;
export const BITS_PER_KILOBIT = 1000;

/** SI units — what file managers, drives and platform limits use. */
export const BYTES_PER_MB = 1_000_000;
export const BYTES_PER_GB = 1_000_000_000;
/** Binary units — what Windows Explorer labels "MB". */
export const BYTES_PER_MIB = 1_048_576;
export const BYTES_PER_GIB = 1_073_741_824;

export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3600;
export const MAX_DURATION_SECONDS = 1_000_000; // ~11.5 days
export const MAX_BITRATE_KBPS = 10_000_000; // 10 Gb/s

/** Common frame sizes. */
export const RESOLUTION_PRESETS = Object.freeze([
  { id: "8k", label: "8K UHD 7680 x 4320", width: 7680, height: 4320 },
  { id: "4k", label: "4K UHD 3840 x 2160", width: 3840, height: 2160 },
  { id: "dci4k", label: "DCI 4K 4096 x 2160", width: 4096, height: 2160 },
  { id: "1440p", label: "1440p 2560 x 1440", width: 2560, height: 1440 },
  { id: "1080p", label: "1080p 1920 x 1080", width: 1920, height: 1080 },
  { id: "720p", label: "720p 1280 x 720", width: 1280, height: 720 },
  { id: "480p", label: "480p 854 x 480", width: 854, height: 480 },
  { id: "vertical1080", label: "Vertical 1080 x 1920", width: 1080, height: 1920 },
]);

/** Bits per pixel per frame for H.264, by intended quality. */
export const QUALITY_BPP = Object.freeze([
  { id: "draft", label: "Draft / preview", bpp: 0.05 },
  { id: "web", label: "Web delivery", bpp: 0.08 },
  { id: "standard", label: "Good quality (default)", bpp: 0.1 },
  { id: "high", label: "High quality upload", bpp: 0.15 },
  { id: "mastering", label: "Near-mastering", bpp: 0.25 },
]);

/** Apple's published ProRes target data rate at 1920x1080, 29.97 fps, in kb/s. */
const PRORES_REFERENCE_PIXEL_RATE = 1920 * 1080 * 29.97;

export const CODECS = Object.freeze([
  {
    id: "h264",
    label: "H.264 / AVC",
    kind: "bpp",
    bitrateFactor: 1,
    note: "The compatibility baseline. Bits-per-pixel figures on this page are calibrated to it.",
  },
  {
    id: "h265",
    label: "H.265 / HEVC",
    kind: "bpp",
    bitrateFactor: 0.5,
    note: "Commonly cited at about half the bitrate of H.264 for equivalent quality.",
  },
  {
    id: "vp9",
    label: "VP9",
    kind: "bpp",
    bitrateFactor: 0.55,
    note: "Broadly comparable with HEVC; the codec YouTube transcodes much of its catalogue into.",
  },
  {
    id: "av1",
    label: "AV1",
    kind: "bpp",
    bitrateFactor: 0.35,
    note: "About 30% below HEVC again, at a much higher encoding cost.",
  },
  {
    id: "prores422",
    label: "Apple ProRes 422",
    kind: "fixed",
    referenceKbps: 147_000,
    note: "Apple's published target data rate is 147 Mb/s at 1920x1080 29.97; it scales with pixel rate.",
  },
  {
    id: "prores422hq",
    label: "Apple ProRes 422 HQ",
    kind: "fixed",
    referenceKbps: 220_000,
    note: "Apple's published target data rate is 220 Mb/s at 1920x1080 29.97.",
  },
  {
    id: "prores4444",
    label: "Apple ProRes 4444",
    kind: "fixed",
    referenceKbps: 330_000,
    note: "Apple's published target data rate is 330 Mb/s at 1920x1080 29.97, alpha channel excluded.",
  },
]);

/** YouTube's published recommended video bitrates for SDR uploads, in kb/s. */
export const YOUTUBE_RECOMMENDED_KBPS = Object.freeze([
  { label: "2160p (4K) 60 fps", kbps: 68_000 },
  { label: "2160p (4K) 30 fps", kbps: 45_000 },
  { label: "1440p 60 fps", kbps: 24_000 },
  { label: "1440p 30 fps", kbps: 16_000 },
  { label: "1080p 60 fps", kbps: 12_000 },
  { label: "1080p 30 fps", kbps: 8_000 },
  { label: "720p 60 fps", kbps: 7_500 },
  { label: "720p 30 fps", kbps: 5_000 },
  { label: "480p", kbps: 2_500 },
  { label: "360p", kbps: 1_000 },
]);

/** YouTube's recommended stereo AAC audio bitrate for uploads, in kb/s. */
export const YOUTUBE_STEREO_AUDIO_KBPS = 384;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Combine hours, minutes and seconds into total seconds. */
export function toSeconds({ hours = 0, minutes = 0, seconds = 0 } = {}) {
  if (![hours, minutes, seconds].every(isFiniteNumber)) return NaN;
  return hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds;
}

/** Split total seconds back into h/m/s parts. */
export function fromSeconds(totalSeconds) {
  if (!isFiniteNumber(totalSeconds) || totalSeconds < 0) return { hours: 0, minutes: 0, seconds: 0 };
  const whole = Math.floor(totalSeconds);
  return {
    hours: Math.floor(whole / SECONDS_PER_HOUR),
    minutes: Math.floor((whole % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    seconds: whole % SECONDS_PER_MINUTE,
  };
}

/**
 * File size from data rate and duration.
 *
 * @param {object} input
 * @param {number} input.videoBitrateKbps
 * @param {number} input.audioBitrateKbps
 * @param {number} input.durationSeconds
 * @returns {object} sizes in SI and binary units, or { error }
 */
export function computeFileSize({
  videoBitrateKbps,
  audioBitrateKbps = 0,
  durationSeconds,
} = {}) {
  if (!isFiniteNumber(videoBitrateKbps) || videoBitrateKbps < 0) {
    return { error: "Enter a video bitrate of zero or more in kb/s." };
  }
  if (!isFiniteNumber(audioBitrateKbps) || audioBitrateKbps < 0) {
    return { error: "Enter an audio bitrate of zero or more in kb/s." };
  }
  const totalBitrateKbps = videoBitrateKbps + audioBitrateKbps;
  if (totalBitrateKbps <= 0) {
    return { error: "Total bitrate must be greater than zero." };
  }
  if (totalBitrateKbps > MAX_BITRATE_KBPS) {
    return { error: "Total bitrate is above 10 Gb/s — check the units, kb/s is expected." };
  }
  if (!isFiniteNumber(durationSeconds) || durationSeconds <= 0) {
    return { error: "Enter a duration greater than zero." };
  }
  if (durationSeconds > MAX_DURATION_SECONDS) {
    return { error: "Duration must be under 1,000,000 seconds." };
  }

  const totalBits = totalBitrateKbps * BITS_PER_KILOBIT * durationSeconds;
  const bytes = totalBits / BITS_PER_BYTE;
  const bytesPerSecond = bytes / durationSeconds;

  return {
    durationSeconds,
    videoBitrateKbps,
    audioBitrateKbps,
    totalBitrateKbps,
    totalBitrateMbps: totalBitrateKbps / 1000,
    totalBits,
    bytes,
    megabytes: bytes / BYTES_PER_MB,
    gigabytes: bytes / BYTES_PER_GB,
    mebibytes: bytes / BYTES_PER_MIB,
    gibibytes: bytes / BYTES_PER_GIB,
    megabytesPerMinute: (bytesPerSecond * SECONDS_PER_MINUTE) / BYTES_PER_MB,
    gigabytesPerHour: (bytesPerSecond * SECONDS_PER_HOUR) / BYTES_PER_GB,
    audioShareOfSize: audioBitrateKbps / totalBitrateKbps,
  };
}

/**
 * Suggest a video bitrate from frame size, frame rate and codec.
 *
 * @param {object} input
 * @param {number} input.width
 * @param {number} input.height
 * @param {number} input.fps
 * @param {string} input.codecId
 * @param {number} input.bpp   bits per pixel for the H.264 reference; ignored by fixed-rate codecs
 * @returns {object} { bitrateKbps, ... } or { error }
 */
export function suggestBitrateKbps({ width, height, fps, codecId = "h264", bpp = 0.1 } = {}) {
  const codec = CODECS.find((item) => item.id === codecId);
  if (!codec) return { error: "Choose a codec." };
  if (!isFiniteNumber(width) || width <= 0 || !isFiniteNumber(height) || height <= 0) {
    return { error: "Frame width and height must both be greater than zero." };
  }
  if (width > 16_384 || height > 16_384) {
    return { error: "Frame dimensions above 16384 px are not supported." };
  }
  if (!isFiniteNumber(fps) || fps <= 0 || fps > 1000) {
    return { error: "Frame rate must be between 0 and 1000 fps." };
  }

  const pixelRate = width * height * fps;

  if (codec.kind === "fixed") {
    const bitrateKbps = (codec.referenceKbps * pixelRate) / PRORES_REFERENCE_PIXEL_RATE;
    return {
      codecId: codec.id,
      codecLabel: codec.label,
      method: "fixed-rate",
      pixelRate,
      bitrateKbps,
      effectiveBpp: (bitrateKbps * BITS_PER_KILOBIT) / pixelRate,
      note: codec.note,
    };
  }

  if (!isFiniteNumber(bpp) || bpp <= 0 || bpp > 5) {
    return { error: "Bits per pixel must be between 0 and 5." };
  }

  const h264Bps = pixelRate * bpp;
  const bitrateKbps = (h264Bps * codec.bitrateFactor) / BITS_PER_KILOBIT;

  return {
    codecId: codec.id,
    codecLabel: codec.label,
    method: "bits-per-pixel",
    pixelRate,
    bpp,
    bitrateFactor: codec.bitrateFactor,
    bitrateKbps,
    effectiveBpp: bpp * codec.bitrateFactor,
    note: codec.note,
  };
}

/** How long a given amount of free space lasts at a data rate. */
export function recordingTimeSeconds({ freeSpaceGb, totalBitrateKbps } = {}) {
  if (!isFiniteNumber(freeSpaceGb) || freeSpaceGb <= 0) return NaN;
  if (!isFiniteNumber(totalBitrateKbps) || totalBitrateKbps <= 0) return NaN;
  const bytes = freeSpaceGb * BYTES_PER_GB;
  const bytesPerSecond = (totalBitrateKbps * BITS_PER_KILOBIT) / BITS_PER_BYTE;
  return bytes / bytesPerSecond;
}

/** Human duration string from seconds, e.g. "1 h 12 m 30 s". */
export function formatDuration(totalSeconds) {
  if (!isFiniteNumber(totalSeconds) || totalSeconds < 0) return "—";
  const { hours, minutes, seconds } = fromSeconds(totalSeconds);
  const parts = [];
  if (hours > 0) parts.push(`${hours} h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes} m`);
  parts.push(`${seconds} s`);
  return parts.join(" ");
}
