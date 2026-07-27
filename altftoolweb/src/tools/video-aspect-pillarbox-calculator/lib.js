/**
 * Pillarbox / letterbox padding maths.
 *
 * Fitting content of aspect ratio Rc = contentW / contentH inside a frame of
 * ratio Rf = frameWidth / frameHeight without cropping (the "contain" / ffmpeg
 * `force_original_aspect_ratio=decrease` fit) gives:
 *
 *   Rc > Rf  -> content is wider than the frame, it touches the left and right
 *               edges. Scaled height = frameWidth / Rc, and the leftover height
 *               is split into two horizontal bars: LETTERBOX.
 *   Rc < Rf  -> content is narrower than the frame, it touches top and bottom.
 *               Scaled width = frameHeight * Rc, leftover width is split into
 *               two vertical bars: PILLARBOX.
 *   Rc = Rf  -> exact fit, no bars.
 *
 * Pure module: no React, no DOM, no clock.
 */

/**
 * 4:2:0 chroma subsampling (yuv420p, used by H.264/HEVC/VP9 in almost every
 * delivery profile) halves chroma resolution in both directions, so encoded
 * width and height must both be even. Scaled dimensions are floored to a
 * multiple of this before being handed to an encoder.
 */
export const CHROMA_ALIGNMENT = 2;

/** Upper sanity bound on a frame edge in pixels (well beyond 16K video). */
export const MAX_FRAME_PIXELS = 100000;

export const RATIO_PRESETS = [
  { label: "16:9 — HD / YouTube", w: 16, h: 9 },
  { label: "9:16 — Reels, Shorts, TikTok", w: 9, h: 16 },
  { label: "1:1 — square", w: 1, h: 1 },
  { label: "4:5 — Instagram portrait", w: 4, h: 5 },
  { label: "4:3 — SD / classic TV", w: 4, h: 3 },
  { label: "3:2 — 35mm stills", w: 3, h: 2 },
  { label: "1.85:1 — theatrical flat", w: 185, h: 100 },
  { label: "2.39:1 — anamorphic scope", w: 239, h: 100 },
  { label: "21:9 — ultrawide", w: 21, h: 9 },
];

export const FRAME_PRESETS = [
  { label: "1920 × 1080 — 1080p landscape", width: 1920, height: 1080 },
  { label: "1080 × 1920 — 1080p vertical", width: 1080, height: 1920 },
  { label: "3840 × 2160 — 4K UHD", width: 3840, height: 2160 },
  { label: "1280 × 720 — 720p", width: 1280, height: 720 },
  { label: "1080 × 1080 — square", width: 1080, height: 1080 },
  { label: "1080 × 1350 — 4:5 portrait", width: 1080, height: 1350 },
];

const isPositiveFinite = (value) => Number.isFinite(value) && value > 0;

/** Floor to a multiple of CHROMA_ALIGNMENT, never below one alignment step. */
function alignEncodable(value) {
  const aligned = Math.floor(value / CHROMA_ALIGNMENT) * CHROMA_ALIGNMENT;
  return Math.max(CHROMA_ALIGNMENT, aligned);
}

/** Floor to a multiple of CHROMA_ALIGNMENT, allowing zero (used for offsets). */
function alignOffset(value) {
  const aligned = Math.floor(value / CHROMA_ALIGNMENT) * CHROMA_ALIGNMENT;
  return Math.max(0, aligned);
}

/**
 * Parse "16:9", "16x9", "16/9" or "1.777" into a positive ratio number.
 * Returns null when the text is not a usable ratio.
 */
export function parseRatioText(text) {
  if (typeof text !== "string") return null;
  const cleaned = text.trim().toLowerCase().replace(/\s+/g, "");
  if (!cleaned) return null;
  const parts = cleaned.split(/[:x/]/);
  if (parts.length === 2) {
    const w = Number(parts[0]);
    const h = Number(parts[1]);
    if (!isPositiveFinite(w) || !isPositiveFinite(h)) return null;
    return w / h;
  }
  const single = Number(cleaned);
  return isPositiveFinite(single) ? single : null;
}

/** Greatest common divisor of two positive integers, for tidy ratio labels. */
function gcd(a, b) {
  let x = Math.round(Math.abs(a));
  let y = Math.round(Math.abs(b));
  while (y > 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/** "1920 × 1080" -> "16:9" when both sides are integers, else a decimal label. */
export function simplifyRatio(width, height) {
  if (!isPositiveFinite(width) || !isPositiveFinite(height)) return "—";
  if (Number.isInteger(width) && Number.isInteger(height)) {
    const g = gcd(width, height);
    return `${width / g}:${height / g}`;
  }
  return `${(width / height).toFixed(3)}:1`;
}

/**
 * Compute the padding needed to place content of ratio contentW:contentH
 * inside a frameWidth × frameHeight pixel frame without cropping.
 *
 * @returns {object} either { error } or the full geometry.
 */
export function computePillarbox({ contentW, contentH, frameWidth, frameHeight }) {
  const cw = Number(contentW);
  const ch = Number(contentH);
  const fw = Number(frameWidth);
  const fh = Number(frameHeight);

  if ([cw, ch, fw, fh].some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (!isPositiveFinite(cw) || !isPositiveFinite(ch)) {
    return { error: "Content ratio sides must both be greater than zero." };
  }
  if (!isPositiveFinite(fw) || !isPositiveFinite(fh)) {
    return { error: "Frame width and height must both be greater than zero." };
  }
  if (fw > MAX_FRAME_PIXELS || fh > MAX_FRAME_PIXELS) {
    return { error: `Frame edges must be ${MAX_FRAME_PIXELS} px or smaller.` };
  }
  if (cw / ch > MAX_FRAME_PIXELS || ch / cw > MAX_FRAME_PIXELS) {
    return { error: "That content ratio is too extreme to place in a frame." };
  }

  const contentRatio = cw / ch;
  const frameRatio = fw / fh;

  let scaledWidth;
  let scaledHeight;
  let barType;
  let fitBy;

  if (contentRatio > frameRatio) {
    // Wider than the frame: limited by width, bars run across the top and bottom.
    fitBy = "width";
    barType = "letterbox";
    scaledWidth = fw;
    scaledHeight = fw / contentRatio;
  } else if (contentRatio < frameRatio) {
    // Narrower than the frame: limited by height, bars run down the sides.
    fitBy = "height";
    barType = "pillarbox";
    scaledHeight = fh;
    scaledWidth = fh * contentRatio;
  } else {
    fitBy = "exact";
    barType = "none";
    scaledWidth = fw;
    scaledHeight = fh;
  }

  const barEach = barType === "letterbox" ? (fh - scaledHeight) / 2 : (fw - scaledWidth) / 2;
  const barTotal = barEach * 2;

  const renderWidth = Math.min(alignEncodable(scaledWidth), Math.floor(fw));
  const renderHeight = Math.min(alignEncodable(scaledHeight), Math.floor(fh));
  const offsetX = alignOffset((Math.floor(fw) - renderWidth) / 2);
  const offsetY = alignOffset((Math.floor(fh) - renderHeight) / 2);

  const frameArea = fw * fh;
  const contentArea = scaledWidth * scaledHeight;
  const contentAreaPct = (contentArea / frameArea) * 100;

  return {
    contentRatio,
    frameRatio,
    contentRatioLabel: simplifyRatio(cw, ch),
    frameRatioLabel: simplifyRatio(fw, fh),
    frameWidth: fw,
    frameHeight: fh,
    fitBy,
    barType,
    scaledWidth,
    scaledHeight,
    renderWidth,
    renderHeight,
    offsetX,
    offsetY,
    barEach,
    barTotal,
    barEachPct: (barEach / (barType === "letterbox" ? fh : fw)) * 100,
    contentAreaPct,
    barAreaPct: 100 - contentAreaPct,
    widthUsedPct: (scaledWidth / fw) * 100,
    heightUsedPct: (scaledHeight / fh) * 100,
    ffmpegFilter: `scale=${renderWidth}:${renderHeight}:flags=lanczos,pad=${Math.floor(fw)}:${Math.floor(fh)}:${offsetX}:${offsetY}:color=black`,
  };
}
