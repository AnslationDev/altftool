/**
 * Discord asset size generator — preset table, circular-crop geometry and pure
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

/** A custom server emoji must be 256 KB or smaller. */
export const MAX_EMOJI_BYTES = 256 * 1024;

/** A custom server sticker must be 512 KB or smaller. */
export const MAX_STICKER_BYTES = 512 * 1024;

/**
 * The largest square that fits inside a circle of diameter d has side d/sqrt(2).
 * Discord renders server icons and avatars as circles, so artwork that must not
 * be clipped has to sit inside that square.
 */
export const CIRCLE_SAFE_FACTOR = Math.SQRT1_2;

/** Above this the whole-number ratio stops being readable, so decimals are used. */
export const MAX_READABLE_RATIO_TERM = 20;

export const PRESETS = [
  {
    id: "server-banner",
    label: "Server banner",
    width: 960,
    height: 540,
    maxBytes: null,
    circular: false,
    note: "16:9 banner across the top of the channel list. Unlocked at server boost Level 2.",
  },
  {
    id: "invite-splash",
    label: "Invite splash",
    width: 1920,
    height: 1080,
    maxBytes: null,
    circular: false,
    note: "The full-bleed background behind an invite link. Unlocked at server boost Level 1.",
  },
  {
    id: "server-icon",
    label: "Server icon",
    width: 512,
    height: 512,
    maxBytes: null,
    circular: true,
    note: "Square source shown as a circle in the server rail — the corners are always clipped.",
  },
  {
    id: "profile-banner",
    label: "Profile banner",
    width: 600,
    height: 240,
    maxBytes: null,
    circular: false,
    note: "5:2 strip behind your profile card. The avatar circle overlaps the lower left.",
  },
  {
    id: "avatar",
    label: "Avatar",
    width: 512,
    height: 512,
    maxBytes: null,
    circular: true,
    note: "Uploaded square, displayed as a circle at sizes down to 16 px in the member list.",
  },
  {
    id: "event-cover",
    label: "Event cover",
    width: 800,
    height: 320,
    maxBytes: null,
    circular: false,
    note: "5:2 header on a scheduled event. Keep the title text out of the artwork itself.",
  },
  {
    id: "emoji",
    label: "Custom emoji",
    width: 128,
    height: 128,
    maxBytes: MAX_EMOJI_BYTES,
    circular: false,
    note: "Transparent PNG, 256 KB or less. Displayed around 32 px in chat, so drop fine detail.",
  },
  {
    id: "sticker",
    label: "Custom sticker",
    width: 320,
    height: 320,
    maxBytes: MAX_STICKER_BYTES,
    circular: false,
    note: "Transparent PNG or APNG, 512 KB or less. Shown much larger than an emoji.",
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
 * The largest square that survives a circular crop, for icons and avatars.
 * Returns { error } for anything that is not a positive diameter.
 */
export function circleSafeSquare({ diameter }) {
  const d = Number(diameter);
  if (!Number.isFinite(d)) return { error: "Enter a numeric icon size." };
  if (d <= 0) return { error: "Icon size must be greater than zero." };

  const side = Math.floor(d * CIRCLE_SAFE_FACTOR);
  const inset = Math.round((d - side) / 2);
  return {
    diameter: d,
    side,
    inset,
    // Share of the square canvas that survives the circular mask.
    circleAreaPercent: (Math.PI / 4) * 100,
    insetPercent: (inset / d) * 100,
  };
}

/**
 * Work out how a source image maps onto a target Discord asset canvas.
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

/** Compare an actual exported blob size against an asset ceiling, if one exists. */
export function weightCheck({ bytes, maxBytes }) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size < 0) return { error: "File size must be zero or more bytes." };
  if (maxBytes === null || maxBytes === undefined) {
    return { bytes: size, limit: null, ok: true, label: formatBytes(size) };
  }
  const limit = Number(maxBytes);
  if (!Number.isFinite(limit) || limit <= 0) return { error: "The size limit must be greater than zero." };
  return {
    bytes: size,
    limit,
    percentOfLimit: (size / limit) * 100,
    ok: size <= limit,
    label: `${formatBytes(size)} of the ${formatBytes(limit)} limit`,
  };
}
