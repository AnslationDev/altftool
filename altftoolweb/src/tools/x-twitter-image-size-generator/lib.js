/**
 * X (Twitter) image size generator — preset table and pure export maths.
 * No React, no DOM, no side effects.
 */

/**
 * Enlargement ratio past which bicubic upsampling starts to look visibly soft.
 * Long-standing prepress/imaging rule of thumb: resampling much beyond 125% of
 * the original pixel dimensions no longer adds real detail.
 */
export const UPSCALE_SOFT_LIMIT = 1.25;

/**
 * Conservative single-side canvas limit. Chrome and Firefox allow 16384 px per
 * side; Safari on iOS additionally caps total canvas area near 16.7 megapixels,
 * so anything larger than this is not safe to render in a browser.
 */
export const MAX_CANVAS_SIDE = 16384;

/** X accepts still-photo uploads up to 5 MB in the web composer. */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** Animated GIF uploads are allowed up to 15 MB on the web composer. */
export const MAX_GIF_BYTES = 15 * 1024 * 1024;

/**
 * The circular profile avatar sits over the lower-left corner of a 1500x500
 * header. Roughly this many pixels of the header's left edge are covered on
 * desktop, so keep logos and text out of that square.
 */
export const HEADER_AVATAR_SAFE_PX = 250;

/**
 * A simplified ratio is only readable while both terms stay small. Above this
 * the ratio is shown in decimal form instead (for example 1.91:1).
 */
export const MAX_READABLE_RATIO_TERM = 20;

export const PRESETS = [
  {
    id: "post-landscape",
    label: "Post image — landscape",
    width: 1600,
    height: 900,
    note: "16:9. The standard single in-stream photo size; the timeline preview crops wider images to this shape.",
  },
  {
    id: "post-square",
    label: "Post image — square",
    width: 1200,
    height: 1200,
    note: "1:1. Reliable for quote cards and multi-image posts where each tile is cropped square.",
  },
  {
    id: "post-portrait",
    label: "Post image — portrait",
    width: 1080,
    height: 1350,
    note: "4:5. The tallest shape shown without the timeline trimming the top and bottom.",
  },
  {
    id: "summary-large",
    label: "Link card — large image",
    width: 1200,
    height: 628,
    note: "For twitter:card=summary_large_image. Roughly 1.91:1; the card is rejected below 300x157 px.",
  },
  {
    id: "summary-small",
    label: "Link card — small square",
    width: 1200,
    height: 1200,
    note: "For twitter:card=summary. Square thumbnail, minimum 144x144 px.",
  },
  {
    id: "header",
    label: "Profile header / banner",
    width: 1500,
    height: 500,
    note: "3:1. The avatar covers the lower-left corner and the sides are trimmed on narrow screens.",
  },
  {
    id: "avatar",
    label: "Profile photo",
    width: 400,
    height: 400,
    note: "Square source, displayed as a circle — keep the subject inside the inscribed circle.",
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

/** "16:9" for tidy ratios, "1.91:1" once the whole-number terms get unwieldy. */
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
 * Work out how a source image maps onto a target canvas.
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
    return { error: "Target width and height must both be greater than zero." };
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
    // Non-uniform: report the geometric mean so the quality note still means something.
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
  };
}

/** Compare an actual exported blob size against a platform ceiling. */
export function weightCheck({ bytes, maxBytes = MAX_PHOTO_BYTES }) {
  const size = Number(bytes);
  const limit = Number(maxBytes);
  if (!Number.isFinite(size) || size < 0) return { error: "File size must be zero or more bytes." };
  if (!Number.isFinite(limit) || limit <= 0) return { error: "The size limit must be greater than zero." };
  const percentOfLimit = (size / limit) * 100;
  return {
    bytes: size,
    limit,
    percentOfLimit,
    ok: size <= limit,
    label: `${formatBytes(size)} of the ${formatBytes(limit)} limit`,
  };
}
