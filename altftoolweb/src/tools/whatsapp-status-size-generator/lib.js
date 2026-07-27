/**
 * WhatsApp Status size generator — presets, screen-fit maths, safe zones and
 * video clip splitting. No React, no DOM, no side effects.
 */

/**
 * Enlargement ratio past which bicubic upsampling starts to look visibly soft.
 * Standard imaging rule of thumb: resampling much beyond 125% of the original
 * pixel dimensions stops adding real detail.
 */
export const UPSCALE_SOFT_LIMIT = 1.25;

/**
 * Conservative single-side canvas limit. Chrome and Firefox allow 16384 px per
 * side; Safari on iOS also caps total canvas area near 16.7 megapixels.
 */
export const MAX_CANVAS_SIDE = 16384;

/** Status is displayed on a full-screen 9:16 viewport; 1080x1920 matches it exactly. */
export const STATUS_SCREEN_WIDTH = 1080;
export const STATUS_SCREEN_HEIGHT = 1920;

/**
 * WhatsApp caps a single status video at 60 seconds; longer footage has to be
 * split into consecutive status posts.
 */
export const STATUS_VIDEO_MAX_SECONDS = 60;

/** Photos and videos sent through WhatsApp are capped at 16 MB. */
export const MAX_MEDIA_BYTES = 16 * 1024 * 1024;

/**
 * Approximate heights of WhatsApp's own overlays on a 1080x1920 status: the
 * contact name and progress bar at the top, the reply field at the bottom.
 * Measured from the app rather than published by WhatsApp, so treat them as
 * design guidance, not a hard specification.
 */
export const SAFE_ZONE_TOP_PX = 250;
export const SAFE_ZONE_BOTTOM_PX = 250;

/** Above this the whole-number ratio stops being readable, so decimals are used. */
export const MAX_READABLE_RATIO_TERM = 20;

export const PRESETS = [
  {
    id: "status-portrait",
    label: "Status — full screen",
    width: STATUS_SCREEN_WIDTH,
    height: STATUS_SCREEN_HEIGHT,
    safeZone: true,
    note: "9:16 edge to edge. The only shape that fills the status viewport with no bars at all.",
  },
  {
    id: "status-square",
    label: "Status — square artwork",
    width: 1080,
    height: 1080,
    safeZone: false,
    note: "1:1. Fits the screen width and sits between two background bars, which is fine for a logo card.",
  },
  {
    id: "status-landscape",
    label: "Status — landscape",
    width: 1920,
    height: 1080,
    safeZone: false,
    note: "16:9. Shows small in the middle of the screen with deep bars above and below.",
  },
  {
    id: "video-cover",
    label: "Video cover frame",
    width: STATUS_SCREEN_WIDTH,
    height: STATUS_SCREEN_HEIGHT,
    safeZone: true,
    note: "Match your video's first frame so the still and the clip line up when the status opens.",
  },
  {
    id: "profile-photo",
    label: "Profile photo",
    width: 640,
    height: 640,
    safeZone: false,
    note: "Square source displayed as a circle — keep the subject inside the inscribed circle.",
  },
];

export const FIT_MODES = [
  { id: "cover", label: "Fill — crop the overflow" },
  { id: "contain", label: "Fit — add background bars" },
  { id: "stretch", label: "Stretch — distort to fit" },
];

export const EXPORT_FORMATS = [
  { id: "image/jpeg", label: "JPEG", extension: "jpg", lossy: true },
  { id: "image/png", label: "PNG", extension: "png", lossy: false },
  { id: "image/webp", label: "WebP", extension: "webp", lossy: true },
];

export function greatestCommonDivisor(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y > 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}

/** "9:16" for tidy ratios, "1.91:1" once the whole-number terms get unwieldy. */
export function simplifyRatio(width, height) {
  const w = Math.round(Number(width));
  const h = Math.round(Number(height));
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return "";
  const divisor = greatestCommonDivisor(w, h);
  const a = w / divisor;
  const b = h / divisor;
  if (a <= MAX_READABLE_RATIO_TERM && b <= MAX_READABLE_RATIO_TERM) return `${a}:${b}`;
  if (w >= h) return `${(w / h).toFixed(2)}:1`;
  return `1:${(h / w).toFixed(2)}`;
}

const BYTE_UNITS = ["B", "KB", "MB", "GB"];

export function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return "—";
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < BYTE_UNITS.length - 1) {
    size /= 1024;
    unit += 1;
  }
  const decimals = unit === 0 || size >= 100 ? 0 : 1;
  return `${size.toFixed(decimals)} ${BYTE_UNITS[unit]}`;
}

/**
 * How a given image shape sits on the 9:16 status viewport. Status fits the
 * whole image on screen, so anything that is not 9:16 gains background bars.
 */
export function statusScreenFit({ width, height }) {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return { error: "Enter numeric image dimensions." };
  if (w <= 0 || h <= 0) return { error: "Image width and height must both be greater than zero." };

  const scale = Math.min(STATUS_SCREEN_WIDTH / w, STATUS_SCREEN_HEIGHT / h);
  const shownWidth = w * scale;
  const shownHeight = h * scale;
  const barVertical = Math.max(0, Math.round((STATUS_SCREEN_WIDTH - shownWidth) / 2));
  const barHorizontal = Math.max(0, Math.round((STATUS_SCREEN_HEIGHT - shownHeight) / 2));
  const coveragePercent =
    ((shownWidth * shownHeight) / (STATUS_SCREEN_WIDTH * STATUS_SCREEN_HEIGHT)) * 100;

  return {
    shownWidth: Math.round(shownWidth),
    shownHeight: Math.round(shownHeight),
    barVertical,
    barHorizontal,
    coveragePercent,
    fullBleed: barVertical === 0 && barHorizontal === 0,
  };
}

/**
 * The area of a 9:16 status that stays clear of WhatsApp's own overlays.
 * Returns { error } when the reserved margins leave nothing usable.
 */
export function safeArea({
  width = STATUS_SCREEN_WIDTH,
  height = STATUS_SCREEN_HEIGHT,
  top = SAFE_ZONE_TOP_PX,
  bottom = SAFE_ZONE_BOTTOM_PX,
}) {
  const w = Math.round(Number(width));
  const h = Math.round(Number(height));
  const t = Math.round(Number(top));
  const b = Math.round(Number(bottom));
  if (![w, h, t, b].every((value) => Number.isFinite(value))) {
    return { error: "Enter numeric dimensions and margins." };
  }
  if (w <= 0 || h <= 0) return { error: "Width and height must both be greater than zero." };
  if (t < 0 || b < 0) return { error: "Safe-zone margins cannot be negative." };
  if (t + b >= h) return { error: "The top and bottom margins leave no usable area — reduce them." };

  const safeHeight = h - t - b;
  return {
    width: w,
    height: safeHeight,
    top: t,
    bottom: b,
    coveragePercent: (safeHeight / h) * 100,
    topPercent: (t / h) * 100,
    bottomPercent: (b / h) * 100,
  };
}

/** How many consecutive status posts a video of this length has to be split into. */
export function statusVideoClips({ durationSeconds, maxSeconds = STATUS_VIDEO_MAX_SECONDS }) {
  const duration = Number(durationSeconds);
  const limit = Number(maxSeconds);
  if (!Number.isFinite(duration)) return { error: "Enter the video length in seconds." };
  if (!Number.isFinite(limit) || limit <= 0) return { error: "The clip limit must be greater than zero." };
  if (duration <= 0) return { error: "Video length must be greater than zero seconds." };

  const clips = Math.ceil(duration / limit);
  const remainder = duration - (clips - 1) * limit;
  return {
    clips,
    lastClipSeconds: remainder,
    fitsInOne: clips === 1,
    limit,
  };
}

/**
 * Work out how a source image maps onto a target status canvas.
 * Returns { error } for anything it cannot draw, never NaN or Infinity.
 */
export function planExport({ sourceWidth, sourceHeight, targetWidth, targetHeight, fit = "cover" }) {
  const sw = Number(sourceWidth);
  const sh = Number(sourceHeight);
  const tw = Math.round(Number(targetWidth));
  const th = Math.round(Number(targetHeight));

  if (![sw, sh, tw, th].every((value) => Number.isFinite(value))) {
    return { error: "Enter numeric width and height values." };
  }
  if (sw <= 0 || sh <= 0) {
    return { error: "Source width and height must both be greater than zero." };
  }
  if (tw <= 0 || th <= 0) {
    return { error: "Canvas width and height must both be greater than zero." };
  }
  if (Math.max(sw, sh, tw, th) > MAX_CANVAS_SIDE) {
    return { error: `Keep every dimension at or below ${MAX_CANVAS_SIDE} px — browsers cannot reliably draw a larger canvas.` };
  }

  const mode = FIT_MODES.some((item) => item.id === fit) ? fit : "cover";
  const scaleX = tw / sw;
  const scaleY = th / sh;

  let scale;
  let drawWidth;
  let drawHeight;
  if (mode === "stretch") {
    // Non-uniform: the geometric mean keeps the quality note meaningful.
    scale = Math.sqrt(scaleX * scaleY);
    drawWidth = tw;
    drawHeight = th;
  } else {
    scale = mode === "cover" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
    drawWidth = sw * scale;
    drawHeight = sh * scale;
  }

  const drawX = (tw - drawWidth) / 2;
  const drawY = (th - drawHeight) / 2;
  const drawnArea = drawWidth * drawHeight;
  const targetArea = tw * th;

  const croppedPercent =
    mode === "cover" && drawnArea > 0 ? Math.max(0, (1 - targetArea / drawnArea) * 100) : 0;
  const barWidth = mode === "contain" ? Math.max(0, Math.round(drawX)) : 0;
  const barHeight = mode === "contain" ? Math.max(0, Math.round(drawY)) : 0;

  const scalePercent = scale * 100;
  let quality;
  if (scale <= 1) {
    quality = { level: "good", message: "Downscaling only — every exported pixel comes from real image data." };
  } else if (scale <= UPSCALE_SOFT_LIMIT) {
    quality = {
      level: "ok",
      message: `Enlarged to ${scalePercent.toFixed(0)}% — under the ${Math.round(UPSCALE_SOFT_LIMIT * 100)}% mark, so softening should stay invisible.`,
    };
  } else {
    quality = {
      level: "warn",
      message: `Enlarged to ${scalePercent.toFixed(0)}% — expect visible softness. Start from a source of at least ${tw}x${th} px.`,
    };
  }

  return {
    fit: mode,
    source: { width: sw, height: sh, ratio: simplifyRatio(sw, sh) },
    target: {
      width: tw,
      height: th,
      ratio: simplifyRatio(tw, th),
      megapixels: targetArea / 1e6,
    },
    draw: { x: drawX, y: drawY, width: drawWidth, height: drawHeight },
    // The same rectangle expressed as percentages of the target, ready for CSS.
    preview: {
      leftPercent: (drawX / tw) * 100,
      topPercent: (drawY / th) * 100,
      widthPercent: (drawWidth / tw) * 100,
      heightPercent: (drawHeight / th) * 100,
    },
    scale,
    scalePercent,
    upscaled: scale > 1,
    croppedPercent,
    bars: { horizontal: barHeight, vertical: barWidth },
    distorted: mode === "stretch" && Math.abs(scaleX - scaleY) > 1e-9,
    quality,
    screen: statusScreenFit({ width: tw, height: th }),
    safe: safeArea({ width: tw, height: th }),
  };
}

/** Compare an actual exported blob size against the 16 MB media ceiling. */
export function weightCheck({ bytes, maxBytes = MAX_MEDIA_BYTES }) {
  const size = Number(bytes);
  const limit = Number(maxBytes);
  if (!Number.isFinite(size) || size < 0) return { error: "File size must be zero or more bytes." };
  if (!Number.isFinite(limit) || limit <= 0) return { error: "The size limit must be greater than zero." };
  return {
    bytes: size,
    limit,
    percentOfLimit: (size / limit) * 100,
    ok: size <= limit,
    label: `${formatBytes(size)} of the ${formatBytes(limit)} limit`,
  };
}
