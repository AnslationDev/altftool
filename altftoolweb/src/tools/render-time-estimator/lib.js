/**
 * Video export time estimator.
 *
 * There is no published standard for how long a render takes — it is a function of
 * the encoder, the machine and the effects graph. What there *is* is a stable
 * structure: export time scales linearly with timeline length and with pixel rate,
 * and multiplicatively with encoder cost, effects cost and machine speed. This
 * module makes every one of those factors explicit and shows its working:
 *
 *   renderSeconds = timelineSeconds
 *                 * BASE_REALTIME_FACTOR
 *                 * pixelRateFactor      (relative to 1920x1080 at 30 fps)
 *                 * encoderCost
 *                 * effectsFactor
 *                 / machineSpeedIndex
 *
 * The reference job that anchors the model is a 1920x1080 30 fps timeline with no
 * effects, exported to H.264 through a hardware encoder on a desktop with a
 * dedicated GPU. That job runs at roughly five times realtime, so its factor is
 * 0.20 — 10 minutes of timeline takes about 2 minutes.
 *
 * Every other number is a relative cost against that job. They are calibration
 * figures, not measurements of your machine, so the result is returned as a range.
 */

/** Export time of the reference job as a fraction of its own duration (5x realtime). */
export const BASE_REALTIME_FACTOR = 0.2;

/** Pixel rate of the reference job. */
export const REFERENCE_PIXEL_RATE = 1920 * 1080 * 30;

/** The estimate is reported as a band of plus or minus this fraction. */
export const UNCERTAINTY = 0.35;

export const MAX_TIMELINE_SECONDS = 360_000; // 100 hours
export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3600;
export const MINUTES_PER_DAY = 1440;

export const RESOLUTION_PRESETS = Object.freeze([
  { id: "8k", label: "8K UHD 7680 x 4320", width: 7680, height: 4320 },
  { id: "4k", label: "4K UHD 3840 x 2160", width: 3840, height: 2160 },
  { id: "1440p", label: "1440p 2560 x 1440", width: 2560, height: 1440 },
  { id: "1080p", label: "1080p 1920 x 1080", width: 1920, height: 1080 },
  { id: "720p", label: "720p 1280 x 720", width: 1280, height: 720 },
  { id: "vertical1080", label: "Vertical 1080 x 1920", width: 1080, height: 1920 },
]);

/**
 * Encoder cost relative to hardware H.264.
 * Hardware encoders (NVENC, Quick Sync, VideoToolbox, AMF) are near-fixed-cost;
 * software encoders trade a great deal of CPU time for compression efficiency,
 * and AV1 software encoding is famously the slowest of the mainstream options.
 */
export const OUTPUT_ENCODERS = Object.freeze([
  { id: "h264-hw", label: "H.264 — hardware encoder", cost: 1 },
  { id: "h265-hw", label: "H.265 / HEVC — hardware encoder", cost: 1.3 },
  { id: "prores", label: "Apple ProRes (intra-frame)", cost: 0.8 },
  { id: "dnxhr", label: "Avid DNxHR (intra-frame)", cost: 0.9 },
  { id: "h264-sw", label: "H.264 — software encoder (x264)", cost: 3.5 },
  { id: "h265-sw", label: "H.265 / HEVC — software encoder (x265)", cost: 6 },
  { id: "av1-sw", label: "AV1 — software encoder", cost: 12 },
]);

/**
 * Machine speed index, with a desktop carrying a dedicated GPU as 1.0.
 * Higher is faster; render time divides by this.
 */
export const MACHINE_TIERS = Object.freeze([
  { id: "entry-laptop", label: "Entry laptop, integrated graphics", index: 0.4 },
  { id: "mainstream-laptop", label: "Mainstream laptop or base Apple silicon", index: 0.8 },
  { id: "desktop-gpu", label: "Desktop with a dedicated GPU (reference)", index: 1 },
  { id: "apple-pro", label: "Apple silicon Pro or Max", index: 1.6 },
  { id: "workstation", label: "High-end workstation or dual GPU", index: 2.4 },
]);

/**
 * Effects cost. Each entry adds cost x coverage to the effects factor, where
 * coverage is the fraction of the timeline the effect actually runs on.
 * Ordered roughly by how expensive they are in practice.
 */
export const EFFECT_TYPES = Object.freeze([
  { id: "titles", label: "Titles and lower thirds", cost: 0.05 },
  { id: "transitions", label: "Cross-dissolves and transitions", cost: 0.05 },
  { id: "basic-grade", label: "Colour correction and LUTs", cost: 0.15 },
  { id: "speed-ramp", label: "Speed ramps (frame blending)", cost: 0.3 },
  { id: "motion-blur", label: "Added motion blur", cost: 0.6 },
  { id: "stabiliser", label: "Warp or gyro stabiliser", cost: 0.9 },
  { id: "noise-reduction", label: "Temporal noise reduction or grain", cost: 1.2 },
  { id: "composite", label: "Heavy compositing, keying or 3D", cost: 2 },
  { id: "optical-flow", label: "Optical-flow retiming", cost: 2.5 },
]);

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Combine hours, minutes and seconds into total seconds. */
export function toSeconds({ hours = 0, minutes = 0, seconds = 0 } = {}) {
  if (![hours, minutes, seconds].every(isFiniteNumber)) return NaN;
  return hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds;
}

/** Effects multiplier from a list of { id, coverage } where coverage is 0-1. */
export function effectsFactor(effects = []) {
  if (!Array.isArray(effects)) return { error: "Effects must be a list." };
  let factor = 1;
  const breakdown = [];
  for (const entry of effects) {
    const spec = EFFECT_TYPES.find((item) => item.id === entry?.id);
    if (!spec) return { error: `Unknown effect: ${entry?.id}.` };
    const coverage = entry.coverage;
    if (!isFiniteNumber(coverage) || coverage < 0 || coverage > 1) {
      return { error: `Coverage for "${spec.label}" must be between 0% and 100%.` };
    }
    const contribution = spec.cost * coverage;
    factor += contribution;
    if (contribution > 0) {
      breakdown.push({ id: spec.id, label: spec.label, coverage, contribution });
    }
  }
  return { factor, breakdown };
}

/**
 * Estimate export time.
 *
 * @param {object} input
 * @param {number} input.timelineSeconds
 * @param {number} input.width
 * @param {number} input.height
 * @param {number} input.fps
 * @param {string} input.encoderId
 * @param {string} input.machineId
 * @param {Array<{id:string, coverage:number}>} [input.effects]
 * @returns {object} render time, band and factor breakdown, or { error }
 */
export function estimateRenderTime({
  timelineSeconds,
  width,
  height,
  fps,
  encoderId,
  machineId,
  effects = [],
} = {}) {
  if (!isFiniteNumber(timelineSeconds) || timelineSeconds <= 0) {
    return { error: "Enter a timeline length greater than zero." };
  }
  if (timelineSeconds > MAX_TIMELINE_SECONDS) {
    return { error: "Timeline length must be under 100 hours." };
  }
  if (!isFiniteNumber(width) || width <= 0 || !isFiniteNumber(height) || height <= 0) {
    return { error: "Frame width and height must both be greater than zero." };
  }
  if (!isFiniteNumber(fps) || fps <= 0 || fps > 1000) {
    return { error: "Frame rate must be between 0 and 1000 fps." };
  }
  const encoder = OUTPUT_ENCODERS.find((item) => item.id === encoderId);
  if (!encoder) return { error: "Choose an output codec." };
  const machine = MACHINE_TIERS.find((item) => item.id === machineId);
  if (!machine) return { error: "Choose a hardware class." };

  const effectsResult = effectsFactor(effects);
  if (effectsResult.error) return { error: effectsResult.error };

  const pixelRate = width * height * fps;
  const pixelRateFactor = pixelRate / REFERENCE_PIXEL_RATE;

  const renderSeconds =
    (timelineSeconds *
      BASE_REALTIME_FACTOR *
      pixelRateFactor *
      encoder.cost *
      effectsResult.factor) /
    machine.index;

  if (!Number.isFinite(renderSeconds) || renderSeconds <= 0) {
    return { error: "Those settings do not produce a usable estimate." };
  }

  return {
    timelineSeconds,
    pixelRate,
    pixelRateFactor,
    encoder: { id: encoder.id, label: encoder.label, cost: encoder.cost },
    machine: { id: machine.id, label: machine.label, index: machine.index },
    effectsFactor: effectsResult.factor,
    effectsBreakdown: effectsResult.breakdown,
    renderSeconds,
    lowSeconds: renderSeconds * (1 - UNCERTAINTY),
    highSeconds: renderSeconds * (1 + UNCERTAINTY),
    realtimeRatio: renderSeconds / timelineSeconds,
    fasterThanRealtime: renderSeconds < timelineSeconds,
    secondsOfTimelinePerMinute: (timelineSeconds / renderSeconds) * SECONDS_PER_MINUTE,
  };
}

/** Human duration from seconds, e.g. "1 h 12 m". */
export function formatDuration(totalSeconds) {
  if (!isFiniteNumber(totalSeconds) || totalSeconds < 0) return "—";
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / SECONDS_PER_HOUR);
  const minutes = Math.floor((rounded % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = rounded % SECONDS_PER_MINUTE;
  if (hours > 0) return `${hours} h ${minutes} m`;
  if (minutes > 0) return `${minutes} m ${seconds} s`;
  return `${seconds} s`;
}

/**
 * Add a number of seconds to a "HH:MM" clock time.
 * Pure — the start time is an argument, never read from the system clock.
 * Returns { time: "HH:MM", dayOffset } where dayOffset counts midnights crossed.
 */
export function addSecondsToClock(startTime, seconds) {
  if (typeof startTime !== "string" || !/^\d{1,2}:\d{2}$/.test(startTime)) return null;
  if (!isFiniteNumber(seconds) || seconds < 0) return null;
  const [rawHours, rawMinutes] = startTime.split(":").map(Number);
  if (rawHours > 23 || rawMinutes > 59) return null;

  const totalMinutes = rawHours * 60 + rawMinutes + Math.round(seconds / SECONDS_PER_MINUTE);
  const dayOffset = Math.floor(totalMinutes / MINUTES_PER_DAY);
  const minuteOfDay = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = String(Math.floor(minuteOfDay / 60)).padStart(2, "0");
  const minutes = String(minuteOfDay % 60).padStart(2, "0");
  return { time: `${hours}:${minutes}`, dayOffset };
}
