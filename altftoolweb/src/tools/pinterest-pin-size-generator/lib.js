/**
 * Pinterest pin size generator — preset table, feed-truncation rule and pure
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

/** Pinterest accepts still-image pin uploads up to 20 MB. */
export const MAX_PIN_BYTES = 20 * 1024 * 1024;

/** Pinterest's recommended pin shape is 2:3 — height is 1.5x the width. */
export const RECOMMENDED_ASPECT = 1.5;

/**
 * Pins taller than roughly 1:2.1 are cut off in the home feed with the rest
 * hidden behind a tap, so 2.1 is the practical ceiling for a "long" pin.
 */
export const MAX_FEED_ASPECT = 2.1;

/** Above this the whole-number ratio stops being readable, so decimals are used. */
export const MAX_READABLE_RATIO_TERM = 20;

export const PRESETS = [
  {
    id: "standard",
    label: "Standard pin",
    width: 1000,
    height: 1500,
    note: "2:3 — the shape Pinterest recommends and the only one guaranteed to show in full in the feed.",
  },
  {
    id: "square",
    label: "Square pin",
    width: 1000,
    height: 1000,
    note: "1:1. Useful for product shots reused from other channels, though it occupies less feed height.",
  },
  {
    id: "long",
    label: "Long / infographic pin",
    width: 1000,
    height: 2100,
    note: "1:2.1 — the tallest pin that still displays without the feed cutting the bottom off.",
  },
  {
    id: "idea",
    label: "Idea pin / video pin",
    width: 1080,
    height: 1920,
    note: "9:16 full-screen format. Keep headlines away from the top and bottom where the UI overlays sit.",
  },
  {
    id: "board-cover",
    label: "Board cover",
    width: 1000,
    height: 1000,
    note: "Cropped to a square thumbnail, so centre the subject and avoid edge-to-edge text.",
  },
  {
    id: "profile",
    label: "Profile photo",
    width: 800,
    height: 800,
    note: "Square source displayed as a circle — keep the subject inside the inscribed circle.",
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

/** "2:3" for tidy ratios, "1:2.10" once the whole-number terms get unwieldy. */
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
 * How a pin of the given shape behaves in the Pinterest home feed.
 * Aspect here means height divided by width.
 */
export function feedFit({ width, height }) {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return { error: "Enter numeric pin dimensions." };
  if (w <= 0 || h <= 0) return { error: "Pin width and height must both be greater than zero." };

  const aspect = h / w;
  const truncated = aspect > MAX_FEED_ASPECT;
  const visibleFraction = truncated ? MAX_FEED_ASPECT / aspect : 1;

  let verdict;
  if (Math.abs(aspect - RECOMMENDED_ASPECT) < 0.01) {
    verdict = { level: "good", message: "Exactly the recommended 2:3 shape — shown in full everywhere." };
  } else if (aspect < 1) {
    verdict = {
      level: "warn",
      message: "Landscape pins take up little vertical space in the feed, so they are scrolled past faster than a 2:3 pin.",
    };
  } else if (!truncated) {
    verdict = {
      level: "ok",
      message: `Taller than wide at ${aspect.toFixed(2)}:1 and still under the ${MAX_FEED_ASPECT}:1 feed ceiling, so nothing is cut off.`,
    };
  } else {
    verdict = {
      level: "warn",
      message: `At ${aspect.toFixed(2)}:1 the feed shows only about ${(visibleFraction * 100).toFixed(0)}% of the pin before cutting it off.`,
    };
  }

  return {
    aspect,
    recommendedAspect: RECOMMENDED_ASPECT,
    truncated,
    visibleFraction,
    visiblePercent: visibleFraction * 100,
    // Height that would have matched the recommended 2:3 shape at this width.
    recommendedHeight: Math.round(w * RECOMMENDED_ASPECT),
    verdict,
  };
}

/**
 * Work out how a source image maps onto a target pin canvas.
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
    return { error: "Pin width and height must both be greater than zero." };
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
    feed: feedFit({ width: tw, height: th }),
  };
}

/** Compare an actual exported blob size against Pinterest's upload ceiling. */
export function weightCheck({ bytes, maxBytes = MAX_PIN_BYTES }) {
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
