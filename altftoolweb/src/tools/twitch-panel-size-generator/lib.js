/**
 * Twitch channel art size generator — preset table, panel-height rule and pure
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

/** Twitch renders every channel panel in a fixed 320 px wide column. */
export const PANEL_WIDTH_PX = 320;

/** A panel taller than 300 px is cut down when Twitch displays it. */
export const PANEL_MAX_HEIGHT_PX = 300;

/** Panel image uploads are capped at 2.9 MB. */
export const MAX_PANEL_BYTES = Math.round(2.9 * 1024 * 1024);

/** Profile picture, profile banner and offline video banner uploads: 10 MB. */
export const MAX_PROFILE_BYTES = 10 * 1024 * 1024;

/** Each subscriber badge PNG must be 25 KB or smaller. */
export const MAX_BADGE_BYTES = 25 * 1024;

/** Each emote PNG must be 1 MB or smaller. */
export const MAX_EMOTE_BYTES = 1024 * 1024;

/** Twitch asks for subscriber badges as a three-size set. */
export const BADGE_SIZES = [18, 36, 72];

/** Twitch asks for emotes as a three-size set. */
export const EMOTE_SIZES = [28, 56, 112];

/** Above this the whole-number ratio stops being readable, so decimals are used. */
export const MAX_READABLE_RATIO_TERM = 20;

export const PRESETS = [
  {
    id: "panel",
    label: "Channel panel",
    width: PANEL_WIDTH_PX,
    height: 100,
    maxBytes: MAX_PANEL_BYTES,
    note: "Panels always display 320 px wide. 100 px tall is the common button-style panel height.",
  },
  {
    id: "panel-tall",
    label: "Tall panel",
    width: PANEL_WIDTH_PX,
    height: PANEL_MAX_HEIGHT_PX,
    maxBytes: MAX_PANEL_BYTES,
    note: "300 px is the tallest a panel can be before Twitch trims it — good for rules or schedule art.",
  },
  {
    id: "offline",
    label: "Offline video banner",
    width: 1920,
    height: 1080,
    maxBytes: MAX_PROFILE_BYTES,
    note: "16:9 art shown in the player when you are not live. Keep text away from the very bottom where controls appear.",
  },
  {
    id: "profile-banner",
    label: "Profile banner",
    width: 1200,
    height: 480,
    maxBytes: MAX_PROFILE_BYTES,
    note: "5:2 header across the top of your channel page; the sides crop first on narrow windows.",
  },
  {
    id: "profile-picture",
    label: "Profile picture",
    width: 256,
    height: 256,
    maxBytes: MAX_PROFILE_BYTES,
    note: "Square source displayed as a circle — keep the subject inside the inscribed circle.",
  },
  {
    id: "badge",
    label: "Subscriber badge (largest)",
    width: 72,
    height: 72,
    maxBytes: MAX_BADGE_BYTES,
    note: "Upload the set at 18, 36 and 72 px. At 18 px only a bold silhouette survives, so design for the small size first.",
  },
  {
    id: "emote",
    label: "Emote (largest)",
    width: 112,
    height: 112,
    maxBytes: MAX_EMOTE_BYTES,
    note: "Upload the set at 28, 56 and 112 px, transparent PNG. Chat mostly shows the 28 px version.",
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

/** "16:9" for tidy ratios, "2.50:1" once the whole-number terms get unwieldy. */
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
 * A panel is always shown 320 px wide, so its height is decided by the source
 * aspect ratio and then clamped to the 300 px display ceiling.
 */
export function panelHeight({ sourceWidth, sourceHeight }) {
  const sw = Number(sourceWidth);
  const sh = Number(sourceHeight);
  if (!Number.isFinite(sw) || !Number.isFinite(sh)) {
    return { error: "Enter numeric source dimensions." };
  }
  if (sw <= 0 || sh <= 0) {
    return { error: "Source width and height must both be greater than zero." };
  }
  const naturalHeight = Math.round((PANEL_WIDTH_PX * sh) / sw);
  const clampedHeight = Math.min(naturalHeight, PANEL_MAX_HEIGHT_PX);
  return {
    width: PANEL_WIDTH_PX,
    naturalHeight,
    height: clampedHeight,
    clamped: naturalHeight > PANEL_MAX_HEIGHT_PX,
    // How much of a too-tall panel would be lost, as a percentage.
    lostPercent: naturalHeight > 0 ? Math.max(0, (1 - clampedHeight / naturalHeight) * 100) : 0,
  };
}

/** The full set of sizes Twitch expects for badges or emotes. */
export function requiredSizeSet(kind) {
  if (kind === "badge") return BADGE_SIZES.map((size) => ({ width: size, height: size }));
  if (kind === "emote") return EMOTE_SIZES.map((size) => ({ width: size, height: size }));
  return [];
}

/**
 * Work out how a source image maps onto a target Twitch asset canvas.
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
    return { error: "Asset width and height must both be greater than zero." };
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
  };
}

/** Compare an actual exported blob size against the asset's ceiling. */
export function weightCheck({ bytes, maxBytes = MAX_PANEL_BYTES }) {
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
