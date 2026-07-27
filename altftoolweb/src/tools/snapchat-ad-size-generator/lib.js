/**
 * Snapchat ad size generator — creative presets, safe-zone maths and pure
 * export maths. No React, no DOM, no side effects.
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

/** Snapchat's ad manager accepts still-image creative up to 5 MB. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** On-demand geofilters must be a PNG under 300 KB with real transparency. */
export const MAX_GEOFILTER_BYTES = 300 * 1024;

/**
 * Snapchat's creative guidance asks for 150 px clear at the top and bottom of a
 * 1080x1920 creative so headlines are not covered by the profile row or the
 * swipe-up call to action.
 */
export const SAFE_ZONE_TOP_PX = 150;
export const SAFE_ZONE_BOTTOM_PX = 150;

/** Above this the whole-number ratio stops being readable, so decimals are used. */
export const MAX_READABLE_RATIO_TERM = 20;

export const PRESETS = [
  {
    id: "single-image-ad",
    label: "Single image ad",
    width: 1080,
    height: 1920,
    maxBytes: MAX_IMAGE_BYTES,
    safeTop: SAFE_ZONE_TOP_PX,
    safeBottom: SAFE_ZONE_BOTTOM_PX,
    note: "9:16 full screen. The core Snap Ads format — the attachment call to action sits along the bottom edge.",
  },
  {
    id: "story-snap",
    label: "Story / organic snap",
    width: 1080,
    height: 1920,
    maxBytes: MAX_IMAGE_BYTES,
    safeTop: SAFE_ZONE_TOP_PX,
    safeBottom: SAFE_ZONE_BOTTOM_PX,
    note: "Same 9:16 canvas as an ad, used for posting to My Story or a Public Profile.",
  },
  {
    id: "story-ad-tile",
    label: "Story ad brand tile",
    width: 360,
    height: 600,
    maxBytes: MAX_IMAGE_BYTES,
    safeTop: 0,
    safeBottom: 0,
    note: "3:5 tile that represents a Story Ad in Discover. It carries the headline, so keep type large.",
  },
  {
    id: "collection-tile",
    label: "Collection ad product tile",
    width: 160,
    height: 160,
    maxBytes: MAX_IMAGE_BYTES,
    safeTop: 0,
    safeBottom: 0,
    note: "Square thumbnail shown in the four-tile strip under a collection ad. Crop tight on the product.",
  },
  {
    id: "geofilter",
    label: "On-demand geofilter",
    width: 1080,
    height: 2340,
    maxBytes: MAX_GEOFILTER_BYTES,
    safeTop: SAFE_ZONE_TOP_PX,
    safeBottom: SAFE_ZONE_BOTTOM_PX,
    note: "PNG with transparency, under 300 KB. Leave the middle of the frame clear so the photo behind it shows.",
  },
];

export const FIT_MODES = [
  { id: "cover", label: "Fill — crop the overflow" },
  { id: "contain", label: "Fit — add background bars" },
  { id: "stretch", label: "Stretch — distort to fit" },
];

export const EXPORT_FORMATS = [
  { id: "image/png", label: "PNG", extension: "png", lossy: false },
  { id: "image/jpeg", label: "JPEG", extension: "jpg", lossy: true },
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

/** "9:16" for tidy ratios, "1:2.17" once the whole-number terms get unwieldy. */
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
 * The rectangle inside a creative that stays clear of Snapchat's own UI.
 * Returns { error } when the reserved margins do not leave a usable area.
 */
export function safeArea({ width, height, top = SAFE_ZONE_TOP_PX, bottom = SAFE_ZONE_BOTTOM_PX }) {
  const w = Math.round(Number(width));
  const h = Math.round(Number(height));
  const t = Math.round(Number(top));
  const b = Math.round(Number(bottom));
  if (![w, h, t, b].every((value) => Number.isFinite(value))) {
    return { error: "Enter numeric creative dimensions and margins." };
  }
  if (w <= 0 || h <= 0) return { error: "Creative width and height must both be greater than zero." };
  if (t < 0 || b < 0) return { error: "Safe-zone margins cannot be negative." };
  if (t + b >= h) return { error: "The top and bottom margins leave no usable area — reduce them." };

  const safeHeight = h - t - b;
  return {
    width: w,
    height: safeHeight,
    top: t,
    bottom: b,
    // Fraction of the full creative that is safe for headlines and logos.
    coverage: (w * safeHeight) / (w * h),
    coveragePercent: (safeHeight / h) * 100,
    // Margins as percentages of the creative height, ready for CSS overlays.
    topPercent: (t / h) * 100,
    bottomPercent: (b / h) * 100,
  };
}

/**
 * Work out how a source image maps onto a target creative canvas.
 * Returns { error } for anything it cannot draw, never NaN or Infinity.
 */
export function planExport({
  sourceWidth,
  sourceHeight,
  targetWidth,
  targetHeight,
  fit = "cover",
  safeTop = SAFE_ZONE_TOP_PX,
  safeBottom = SAFE_ZONE_BOTTOM_PX,
}) {
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
    return { error: "Creative width and height must both be greater than zero." };
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
    safe: safeArea({ width: tw, height: th, top: safeTop, bottom: safeBottom }),
  };
}

/** Compare an actual exported blob size against the format's ceiling. */
export function weightCheck({ bytes, maxBytes = MAX_IMAGE_BYTES }) {
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
