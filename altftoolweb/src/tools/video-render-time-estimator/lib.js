/**
 * Render / export time estimation.
 *
 * The model works in pixels rather than in vague "speed multipliers", because
 * encode and decode work scale with the number of pixels pushed through the
 * pipeline:
 *
 *   pixels to process = width x height x frame rate x timeline seconds
 *   render seconds    = pixels / machine throughput x codec x effects x source
 *
 * Machine throughput is expressed in pixels per second and calibrated so that a
 * mid-range desktop with a modern GPU exports a plain 1080p30 H.264 timeline at
 * about 3x real time — the figure most editing benchmarks land on. Every other
 * multiplier is a cost relative to that baseline. These are planning estimates,
 * not benchmark results: an actual export depends on your specific CPU, GPU
 * media engine, disk speed and NLE.
 */

/** 1080p30 is the reference workload: 1920 x 1080 x 30 = 62,208,000 px/s. */
export const REFERENCE_PIXELS_PER_SECOND = 1920 * 1080 * 30;

/**
 * Machine classes. `pixelsPerSecond` is sustained throughput on the baseline
 * codec, given as a multiple of the 1080p30 reference so the calibration is
 * visible rather than buried in a magic number.
 */
export const MACHINE_CLASSES = [
  {
    id: "laptop-igpu",
    name: "Laptop, integrated graphics",
    realtimeAt1080p30: 1,
  },
  {
    id: "laptop-dgpu",
    name: "Laptop with dedicated GPU / base Apple silicon",
    realtimeAt1080p30: 2,
  },
  {
    id: "desktop-mid",
    name: "Desktop, mid-range GPU",
    realtimeAt1080p30: 3,
  },
  {
    id: "desktop-high",
    name: "Desktop, current high-end GPU",
    realtimeAt1080p30: 6,
  },
  {
    id: "workstation",
    name: "Workstation / Apple silicon Max or Ultra",
    realtimeAt1080p30: 10,
  },
].map((machine) => ({
  ...machine,
  pixelsPerSecond: machine.realtimeAt1080p30 * REFERENCE_PIXELS_PER_SECOND,
}));

/**
 * Codec cost relative to hardware-accelerated H.264. Hardware encoders (NVENC,
 * Quick Sync, Apple Media Engine, AMF) are fixed-function and roughly an order
 * of magnitude faster than the same codec run on CPU. Intra-frame mastering
 * codecs are cheap to compute but write far more data to disk.
 */
export const CODECS = [
  { id: "h264-hw", name: "H.264 — hardware encoder", cost: 1 },
  { id: "h265-hw", name: "H.265 / HEVC — hardware encoder", cost: 1.3 },
  { id: "av1-hw", name: "AV1 — hardware encoder", cost: 1.6 },
  { id: "prores-422", name: "ProRes 422 / 422 HQ", cost: 0.8 },
  { id: "prores-4444", name: "ProRes 4444", cost: 1.4 },
  { id: "dnxhr-hq", name: "DNxHR HQ", cost: 0.9 },
  { id: "h264-cpu", name: "H.264 — CPU encoder (x264, slow preset)", cost: 6 },
  { id: "h265-cpu", name: "H.265 — CPU encoder (x265)", cost: 12 },
  { id: "av1-cpu", name: "AV1 — CPU encoder (SVT-AV1 / libaom)", cost: 25 },
];

/** How much work the timeline itself adds on top of plain transcoding. */
export const EFFECTS_LOADS = [
  { id: "cuts", name: "Cuts only, no effects", cost: 1 },
  { id: "light", name: "Light grade, titles, transitions", cost: 1.4 },
  { id: "heavy", name: "Heavy grade, several layers, masks", cost: 2.2 },
  {
    id: "extreme",
    name: "Motion graphics, stabilisation, noise reduction",
    cost: 4,
  },
];

/** Decode cost of the source media before any of the above happens. */
export const SOURCE_FORMATS = [
  { id: "intra", name: "ProRes / DNx / intra-frame source", cost: 1 },
  { id: "longgop", name: "Camera H.264 or H.265 long-GOP", cost: 1.3 },
  { id: "10bit-longgop", name: "10-bit 4:2:2 long-GOP (mirrorless / cinema)", cost: 1.6 },
  { id: "raw", name: "RAW needing debayer (BRAW, R3D, CinemaDNG)", cost: 2.5 },
];

/** Common timeline resolutions. */
export const RESOLUTIONS = [
  { id: "720p", name: "1280 x 720 (HD)", width: 1280, height: 720 },
  { id: "1080p", name: "1920 x 1080 (Full HD)", width: 1920, height: 1080 },
  { id: "1440p", name: "2560 x 1440 (QHD)", width: 2560, height: 1440 },
  { id: "2k", name: "2048 x 1080 (DCI 2K)", width: 2048, height: 1080 },
  { id: "4k-uhd", name: "3840 x 2160 (4K UHD)", width: 3840, height: 2160 },
  { id: "4k-dci", name: "4096 x 2160 (DCI 4K)", width: 4096, height: 2160 },
  { id: "6k", name: "6144 x 3240 (6K)", width: 6144, height: 3240 },
  { id: "8k", name: "7680 x 4320 (8K UHD)", width: 7680, height: 4320 },
  { id: "vertical", name: "1080 x 1920 (vertical / Reels)", width: 1080, height: 1920 },
];

export const MAX_FPS = 480;
export const MAX_TIMELINE_MINUTES = 24 * 60;

const byId = (list, id) => list.find((item) => item.id === id) || null;

/**
 * Estimate export time.
 *
 * @param {object} input
 * @param {number} input.timelineMinutes  length of the sequence in minutes
 * @param {number} input.width            output width in pixels
 * @param {number} input.height           output height in pixels
 * @param {number} input.fps              output frame rate
 * @param {string} input.machine          MACHINE_CLASSES id
 * @param {string} input.codec            CODECS id
 * @param {string} input.effects          EFFECTS_LOADS id
 * @param {string} input.source           SOURCE_FORMATS id
 * @param {number} input.passes           encoding passes (1 or 2)
 * @returns {object} render seconds and the multipliers behind it, or { error }
 */
export function estimateRenderTime({
  timelineMinutes,
  width,
  height,
  fps,
  machine = "desktop-mid",
  codec = "h264-hw",
  effects = "cuts",
  source = "longgop",
  passes = 1,
} = {}) {
  const minutes = Number(timelineMinutes);
  const w = Number(width);
  const h = Number(height);
  const rate = Number(fps);
  const passCount = Number(passes);

  if (![minutes, w, h, rate, passCount].every((value) => Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }

  const machineInfo = byId(MACHINE_CLASSES, machine);
  const codecInfo = byId(CODECS, codec);
  const effectsInfo = byId(EFFECTS_LOADS, effects);
  const sourceInfo = byId(SOURCE_FORMATS, source);
  if (!machineInfo) return { error: "Choose a machine class from the list." };
  if (!codecInfo) return { error: "Choose an export codec from the list." };
  if (!effectsInfo) return { error: "Choose an effects load from the list." };
  if (!sourceInfo) return { error: "Choose a source format from the list." };

  if (minutes <= 0) return { error: "Timeline length must be greater than zero." };
  if (minutes > MAX_TIMELINE_MINUTES) {
    return { error: "Timeline length should be 24 hours or less." };
  }
  if (w <= 0 || h <= 0) return { error: "Frame width and height must be greater than zero." };
  if (w > 16384 || h > 16384) return { error: "Frame size should be 16384 pixels or less per side." };
  if (rate <= 0 || rate > MAX_FPS) {
    return { error: `Frame rate should be between 1 and ${MAX_FPS} fps.` };
  }
  if (passCount < 1 || passCount > 2) return { error: "Encoding passes must be 1 or 2." };

  const timelineSeconds = minutes * 60;
  const framePixels = w * h;
  const totalFrames = timelineSeconds * rate;
  const totalPixels = framePixels * totalFrames;

  const workMultiplier = codecInfo.cost * effectsInfo.cost * sourceInfo.cost * passCount;
  const renderSeconds = (totalPixels / machineInfo.pixelsPerSecond) * workMultiplier;

  if (!Number.isFinite(renderSeconds) || renderSeconds <= 0) {
    return { error: "Those settings do not produce a usable estimate." };
  }

  return {
    timelineSeconds,
    totalFrames,
    totalPixels,
    framePixels,
    megapixelsPerFrame: framePixels / 1e6,
    renderSeconds,
    realtimeFactor: timelineSeconds / renderSeconds,
    minutesPerTimelineMinute: renderSeconds / 60 / minutes,
    framesPerSecond: totalFrames / renderSeconds,
    workMultiplier,
    machine: machineInfo,
    codec: codecInfo,
    effects: effectsInfo,
    source: sourceInfo,
    passes: passCount,
  };
}

/** Same timeline on every machine class, for the comparison table. */
export function compareMachines(input = {}) {
  return MACHINE_CLASSES.map((machineInfo) => {
    const result = estimateRenderTime({ ...input, machine: machineInfo.id });
    return {
      id: machineInfo.id,
      name: machineInfo.name,
      realtimeAt1080p30: machineInfo.realtimeAt1080p30,
      renderSeconds: result.error ? null : result.renderSeconds,
      error: result.error || null,
    };
  });
}

/** Format a duration in seconds as a compact human string. Never returns NaN. */
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 1) return "under 1 second";
  const total = Math.round(seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (secs && days === 0) parts.push(`${secs}s`);
  return parts.length ? parts.join(" ") : "0s";
}
