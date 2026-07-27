/**
 * Storage planning for a proxy editing workflow.
 *
 * Four things occupy disk on an edit, and they behave differently:
 *
 * 1. Camera originals — footage hours x acquisition data rate. Exact arithmetic.
 * 2. Proxies — the same hours at the proxy codec's data rate. Because a codec's
 *    data rate tracks its pixel rate, a proxy at half linear resolution has a
 *    quarter of the pixels and therefore roughly a quarter of the data rate. Apple
 *    publishes ProRes target rates at 1920x1080 29.97 (Proxy 45 Mb/s, LT 102 Mb/s),
 *    which is the reference point those rates are scaled from here.
 * 3. Render previews — timeline length x preview codec rate, not footage length.
 *    A three-minute sequence generates three minutes of previews however much
 *    footage was shot.
 * 4. Media cache — peak files, thumbnails and indexes, which scale with the volume
 *    of source media. Expressed as a percentage of originals because no NLE
 *    publishes a rate for it.
 *
 * Backups multiply the originals only. Proxies, previews and cache are all
 * regenerable from the originals, so copying them wastes archive space.
 *
 * Drive sizes are SI: 1 TB is 1,000 GB, which is how drives are sold.
 */

export const BITS_PER_BYTE = 8;
export const SECONDS_PER_HOUR = 3600;
export const SECONDS_PER_MINUTE = 60;
export const BYTES_PER_GB = 1_000_000_000;
export const GB_PER_TB = 1000;

/** Apple's published ProRes reference frame: 1920 x 1080 at 29.97 fps. */
export const REFERENCE_PIXEL_RATE = 1920 * 1080 * 29.97;

export const MAX_FOOTAGE_HOURS = 10_000;
export const MAX_TIMELINE_MINUTES = 100_000;
export const MAX_MBPS = 100_000;
export const MAX_COPIES = 10;

/** Working drives lose performance when close to full; keep this much free. */
export const DEFAULT_HEADROOM_PERCENT = 20;

export const RESOLUTION_PRESETS = Object.freeze([
  { id: "8k", label: "8K UHD 7680 x 4320", width: 7680, height: 4320 },
  { id: "6k", label: "6K 6144 x 3456", width: 6144, height: 3456 },
  { id: "4k", label: "4K UHD 3840 x 2160", width: 3840, height: 2160 },
  { id: "dci4k", label: "DCI 4K 4096 x 2160", width: 4096, height: 2160 },
  { id: "1440p", label: "1440p 2560 x 1440", width: 2560, height: 1440 },
  { id: "1080p", label: "1080p 1920 x 1080", width: 1920, height: 1080 },
]);

/** Common acquisition data rates, in megabits per second. */
export const CAMERA_RATE_PRESETS = Object.freeze([
  { id: "h264-100", label: "Mirrorless H.264, 100 Mb/s", mbps: 100 },
  { id: "h265-150", label: "H.265 10-bit, 150 Mb/s", mbps: 150 },
  { id: "allintra-400", label: "All-Intra, 400 Mb/s", mbps: 400 },
  { id: "prores422hq-1080", label: "ProRes 422 HQ 1080p, 220 Mb/s", mbps: 220 },
  { id: "prores422hq-4k", label: "ProRes 422 HQ 4K, 880 Mb/s", mbps: 880 },
]);

/**
 * Proxy codecs, given as the data rate at the 1920x1080 29.97 reference frame.
 * The rate is scaled by the proxy's own pixel rate.
 */
export const PROXY_CODECS = Object.freeze([
  { id: "prores-proxy", label: "ProRes Proxy", referenceMbps: 45 },
  { id: "prores-lt", label: "ProRes LT", referenceMbps: 102 },
  { id: "prores-422", label: "ProRes 422", referenceMbps: 147 },
  { id: "h264-proxy", label: "H.264 proxy (typical)", referenceMbps: 15 },
]);

/** Linear scale of the proxy relative to the original frame. */
export const PROXY_SCALES = Object.freeze([
  { id: "full", label: "Full resolution", scale: 1 },
  { id: "half", label: "Half (1/4 the pixels)", scale: 0.5 },
  { id: "quarter", label: "Quarter (1/16 the pixels)", scale: 0.25 },
]);

/** Render preview codec rates at the same 1080p29.97 reference. */
export const PREVIEW_CODECS = Object.freeze([
  { id: "none", label: "No render previews", referenceMbps: 0 },
  { id: "prores-proxy", label: "ProRes Proxy previews", referenceMbps: 45 },
  { id: "prores-422", label: "ProRes 422 previews", referenceMbps: 147 },
  { id: "prores-422hq", label: "ProRes 422 HQ previews", referenceMbps: 220 },
]);

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Gigabytes occupied by `seconds` of media at `mbps` megabits per second. */
export function gigabytesFor(seconds, mbps) {
  if (!isFiniteNumber(seconds) || !isFiniteNumber(mbps)) return NaN;
  if (seconds <= 0 || mbps <= 0) return 0;
  return (mbps * 1_000_000 * seconds) / BITS_PER_BYTE / BYTES_PER_GB;
}

/** A reference-frame data rate rescaled to an arbitrary pixel rate. */
export function scaleRateToPixelRate(referenceMbps, pixelRate) {
  if (!isFiniteNumber(referenceMbps) || !isFiniteNumber(pixelRate)) return NaN;
  if (referenceMbps <= 0 || pixelRate <= 0) return 0;
  return (referenceMbps * pixelRate) / REFERENCE_PIXEL_RATE;
}

/**
 * Size a whole proxy workflow.
 *
 * @param {object} input
 * @param {number} input.footageHours     total recorded material
 * @param {number} input.cameraMbps       acquisition data rate
 * @param {number} input.width
 * @param {number} input.height
 * @param {number} input.fps
 * @param {boolean} [input.useProxies]
 * @param {string} [input.proxyCodecId]
 * @param {number} [input.proxyScale]     linear scale, 0-1
 * @param {number} [input.timelineMinutes] finished sequence length
 * @param {string} [input.previewCodecId]
 * @param {number} [input.cachePercent]   media cache as a share of originals
 * @param {number} [input.copies]         total copies of the originals (3-2-1 means 3)
 * @param {number} [input.headroomPercent] free space to leave on the working drive
 * @returns {object} a full storage breakdown in GB, or { error }
 */
export function planProxyStorage({
  footageHours,
  cameraMbps,
  width,
  height,
  fps,
  useProxies = true,
  proxyCodecId = "prores-proxy",
  proxyScale = 0.5,
  timelineMinutes = 0,
  previewCodecId = "none",
  cachePercent = 5,
  copies = 2,
  headroomPercent = DEFAULT_HEADROOM_PERCENT,
} = {}) {
  if (!isFiniteNumber(footageHours) || footageHours <= 0) {
    return { error: "Enter how many hours of footage the project has." };
  }
  if (footageHours > MAX_FOOTAGE_HOURS) {
    return { error: "Footage hours must be under 10,000." };
  }
  if (!isFiniteNumber(cameraMbps) || cameraMbps <= 0 || cameraMbps > MAX_MBPS) {
    return { error: "Camera data rate must be between 0 and 100,000 Mb/s." };
  }
  if (!isFiniteNumber(width) || width <= 0 || !isFiniteNumber(height) || height <= 0) {
    return { error: "Frame width and height must both be greater than zero." };
  }
  if (!isFiniteNumber(fps) || fps <= 0 || fps > 1000) {
    return { error: "Frame rate must be between 0 and 1000 fps." };
  }
  if (!isFiniteNumber(timelineMinutes) || timelineMinutes < 0 || timelineMinutes > MAX_TIMELINE_MINUTES) {
    return { error: "Timeline length must be between 0 and 100,000 minutes." };
  }
  if (!isFiniteNumber(cachePercent) || cachePercent < 0 || cachePercent > 100) {
    return { error: "Media cache allowance must be between 0% and 100% of the originals." };
  }
  if (!isFiniteNumber(copies) || copies < 1 || copies > MAX_COPIES || !Number.isInteger(copies)) {
    return { error: `Number of copies must be a whole number between 1 and ${MAX_COPIES}.` };
  }
  if (!isFiniteNumber(headroomPercent) || headroomPercent < 0 || headroomPercent >= 100) {
    return { error: "Drive headroom must be between 0% and 99%." };
  }

  const proxyCodec = PROXY_CODECS.find((item) => item.id === proxyCodecId);
  if (useProxies && !proxyCodec) return { error: "Choose a proxy codec." };
  const previewCodec = PREVIEW_CODECS.find((item) => item.id === previewCodecId);
  if (!previewCodec) return { error: "Choose a render preview codec." };
  if (useProxies && (!isFiniteNumber(proxyScale) || proxyScale <= 0 || proxyScale > 1)) {
    return { error: "Proxy scale must be between 0 and 1." };
  }

  const footageSeconds = footageHours * SECONDS_PER_HOUR;
  const timelineSeconds = timelineMinutes * SECONDS_PER_MINUTE;
  const sourcePixelRate = width * height * fps;

  const originalsGb = gigabytesFor(footageSeconds, cameraMbps);

  let proxyMbps = 0;
  let proxyWidth = 0;
  let proxyHeight = 0;
  if (useProxies) {
    proxyWidth = Math.round(width * proxyScale);
    proxyHeight = Math.round(height * proxyScale);
    const proxyPixelRate = sourcePixelRate * proxyScale * proxyScale;
    proxyMbps = scaleRateToPixelRate(proxyCodec.referenceMbps, proxyPixelRate);
  }
  const proxiesGb = gigabytesFor(footageSeconds, proxyMbps);

  const previewMbps = scaleRateToPixelRate(previewCodec.referenceMbps, sourcePixelRate);
  const previewsGb = gigabytesFor(timelineSeconds, previewMbps);

  const cacheGb = originalsGb * (cachePercent / 100);

  const workingDriveGb = originalsGb + proxiesGb + previewsGb + cacheGb;
  const extraCopies = copies - 1;
  const archiveGb = originalsGb * extraCopies;
  const totalGb = workingDriveGb + archiveGb;
  const recommendedWorkingDriveGb = workingDriveGb / (1 - headroomPercent / 100);

  const breakdown = [
    { id: "originals", label: "Camera originals", gigabytes: originalsGb, mbps: cameraMbps },
    { id: "proxies", label: "Proxies", gigabytes: proxiesGb, mbps: proxyMbps },
    { id: "previews", label: "Render previews", gigabytes: previewsGb, mbps: previewMbps },
    { id: "cache", label: "Media cache", gigabytes: cacheGb, mbps: 0 },
  ]
    .filter((row) => row.gigabytes > 0)
    .map((row) => ({ ...row, share: workingDriveGb > 0 ? row.gigabytes / workingDriveGb : 0 }));

  return {
    footageHours,
    footageSeconds,
    timelineMinutes,
    sourcePixelRate,
    originalsGb,
    proxiesGb,
    proxyMbps,
    proxyWidth,
    proxyHeight,
    proxySavingRatio: originalsGb > 0 ? 1 - proxiesGb / originalsGb : 0,
    previewsGb,
    previewMbps,
    cacheGb,
    workingDriveGb,
    archiveGb,
    totalGb,
    totalTb: totalGb / GB_PER_TB,
    recommendedWorkingDriveGb,
    recommendedWorkingDriveTb: recommendedWorkingDriveGb / GB_PER_TB,
    copies,
    gigabytesPerFootageHour: originalsGb / footageHours,
    breakdown,
  };
}

/** Format a size in GB, switching to TB once it passes a terabyte. */
export function formatSize(gigabytes) {
  if (!isFiniteNumber(gigabytes) || gigabytes < 0) return "—";
  if (gigabytes >= GB_PER_TB) return `${(gigabytes / GB_PER_TB).toFixed(2)} TB`;
  return `${gigabytes.toFixed(1)} GB`;
}
