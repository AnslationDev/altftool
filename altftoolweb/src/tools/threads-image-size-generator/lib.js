/**
 * Threads image size generator — preset table, supported aspect-ratio rule and
 * pure export maths. No React, no DOM, no side effects.
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

/**
 * Threads, like Instagram, serves feed images at 1080 px wide. Uploading wider
 * only means the server downsamples; uploading narrower means it upscales.
 */
export const RECOMMENDED_WIDTH_PX = 1080;

/**
 * Narrowest supported shape: 4:5 portrait (width divided by height = 0.8).
 * Anything taller is centre-cropped to 4:5 in the feed.
 */
export const MIN_SUPPORTED_ASPECT = 1080 / 1350;

/**
 * Widest supported shape: 1.91:1 landscape, the same link-preview ratio used
 * across Meta surfaces. Anything wider is centre-cropped to 1.91:1.
 */
export const MAX_SUPPORTED_ASPECT = 1.91;

/** A Threads post can carry up to 20 media items in one carousel. */
export const MAX_CAROUSEL_ITEMS = 20;

/** Above this the whole-number ratio stops being readable, so decimals are used. */
export const MAX_READABLE_RATIO_TERM = 20;

export const PRESETS = [
  {
    id: "portrait",
    label: "Portrait post",
    width: 1080,
    height: 1350,
    note: "4:5 — the tallest shape Threads shows uncropped, and the one that takes the most feed height.",
  },
  {
    id: "square",
    label: "Square post",
    width: 1080,
    height: 1080,
    note: "1:1. Safe for carousels because every slide keeps the same shape as you swipe.",
  },
  {
    id: "landscape",
    label: "Landscape post",
    width: 1080,
    height: 566,
    note: "1.91:1 — the widest supported shape, matching the standard link-preview ratio.",
  },
  {
    id: "vertical-video-frame",
    label: "Vertical video frame",
    width: 1080,
    height: 1920,
    note: "9:16 for video. As a still image this gets centre-cropped to 4:5 in the feed.",
  },
  {
    id: "profile",
    label: "Profile photo",
    width: 400,
    height: 400,
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

/** "4:5" for tidy ratios, "1.91:1" once the whole-number terms get unwieldy. */
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
 * Does this shape survive the feed untouched, and if not what does Threads
 * crop it to? Aspect here means width divided by height.
 */
export function ratioCompliance({ width, height }) {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return { error: "Enter numeric image dimensions." };
  if (w <= 0 || h <= 0) return { error: "Image width and height must both be greater than zero." };

  const aspect = w / h;

  if (aspect < MIN_SUPPORTED_ASPECT) {
    // Too tall: full width is kept and the height is cut back to 4:5.
    const keptHeight = w / MIN_SUPPORTED_ASPECT;
    return {
      aspect,
      supported: false,
      croppedTo: { width: Math.round(w), height: Math.round(keptHeight), label: "4:5" },
      visiblePercent: (keptHeight / h) * 100,
      message: `Taller than 4:5, so the feed keeps a centred 4:5 slice — about ${((keptHeight / h) * 100).toFixed(0)}% of the height.`,
    };
  }

  if (aspect > MAX_SUPPORTED_ASPECT) {
    // Too wide: full height is kept and the width is cut back to 1.91:1.
    const keptWidth = h * MAX_SUPPORTED_ASPECT;
    return {
      aspect,
      supported: false,
      croppedTo: { width: Math.round(keptWidth), height: Math.round(h), label: "1.91:1" },
      visiblePercent: (keptWidth / w) * 100,
      message: `Wider than 1.91:1, so the feed keeps a centred 1.91:1 slice — about ${((keptWidth / w) * 100).toFixed(0)}% of the width.`,
    };
  }

  return {
    aspect,
    supported: true,
    croppedTo: { width: Math.round(w), height: Math.round(h), label: simplifyRatio(w, h) },
    visiblePercent: 100,
    message: "Inside the supported 1.91:1 to 4:5 range — Threads shows the whole frame.",
  };
}

/**
 * Work out how a source image maps onto a target post canvas.
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
    return { error: "Post width and height must both be greater than zero." };
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
    compliance: ratioCompliance({ width: tw, height: th }),
  };
}

/** Total pixel budget for a carousel of identical slides. */
export function carouselPlan({ slides, width, height }) {
  const count = Math.round(Number(slides));
  const w = Number(width);
  const h = Number(height);
  if (![count, w, h].every((value) => Number.isFinite(value))) {
    return { error: "Enter a numeric slide count and slide size." };
  }
  if (count < 1) return { error: "A carousel needs at least one slide." };
  if (w <= 0 || h <= 0) return { error: "Slide width and height must both be greater than zero." };
  if (count > MAX_CAROUSEL_ITEMS) {
    return { error: `Threads accepts up to ${MAX_CAROUSEL_ITEMS} media items in one post.` };
  }
  return {
    slides: count,
    slideMegapixels: (w * h) / 1e6,
    totalMegapixels: (count * w * h) / 1e6,
    remainingSlots: MAX_CAROUSEL_ITEMS - count,
  };
}
