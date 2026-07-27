/**
 * GIF file size estimator.
 *
 * The container overhead is exact — it comes straight from the GIF89a specification:
 *   6   bytes  header, "GIF89a"
 *   7   bytes  logical screen descriptor
 *   3 x 2^n    global colour table, n = bits per pixel (a palette is always rounded up
 *              to a power of two, 2 to 256 entries)
 *   19  bytes  Netscape application extension, the block that makes a GIF loop
 *   8   bytes  graphic control extension, per frame (delay and transparency)
 *   10  bytes  image descriptor, per frame
 *   1   byte   LZW minimum code size, per frame
 *   1   byte   per 255 bytes of image data, the sub-block length prefix
 *   1   byte   per frame block terminator
 *   1   byte   trailer
 *
 * The pixel data cannot be exact, because GIF uses LZW and how well LZW does depends
 * entirely on the picture. Raw indexed data is width x height x bitsPerPixel / 8 bytes
 * per frame; this tool multiplies that by a compression ratio chosen from the kind of
 * content, and by the fraction of the frame that actually changes, because encoders
 * only store the changed rectangle of each frame after the first. Treat the output as
 * a budgeting estimate with a stated range, not a measurement.
 */

/* ------------------------------------------------------------------ spec constants */

export const GIF_HEADER_BYTES = 6;
export const LOGICAL_SCREEN_DESCRIPTOR_BYTES = 7;
export const NETSCAPE_LOOP_EXTENSION_BYTES = 19;
export const GRAPHIC_CONTROL_EXTENSION_BYTES = 8;
export const IMAGE_DESCRIPTOR_BYTES = 10;
export const LZW_MIN_CODE_SIZE_BYTES = 1;
export const BLOCK_TERMINATOR_BYTES = 1;
export const TRAILER_BYTES = 1;

/** A GIF data sub-block carries at most 255 bytes and is prefixed by a length byte. */
export const SUB_BLOCK_MAX_DATA = 255;

/** GIF indexes into a palette of at most 256 colours. */
export const MAX_PALETTE_COLOURS = 256;
export const MIN_PALETTE_COLOURS = 2;

/** The estimate carries this much uncertainty either side, from LZW's content sensitivity. */
export const ESTIMATE_TOLERANCE = 0.4;

/* ------------------------------------------------------------------ content profiles */

/**
 * Typical LZW output as a fraction of the raw indexed bytes. Flat, hard-edged material
 * has long runs of identical indices and compresses hard; photographic material has
 * almost none and barely compresses at all. These are working figures for budgeting.
 */
export const CONTENT_PROFILES = [
  { id: "flat", label: "Flat graphics, UI or screen recording", ratio: 0.18 },
  { id: "mixed", label: "Illustration with text and gradients", ratio: 0.32 },
  { id: "video", label: "Video footage", ratio: 0.62 },
  { id: "noisy", label: "Grainy, filmic or heavily textured video", ratio: 0.85 },
];

/**
 * Fraction of each frame that changes, which is all an optimising encoder has to store
 * after the first frame.
 */
export const MOTION_PROFILES = [
  { id: "static", label: "Mostly still, a small area moves", changed: 0.15 },
  { id: "moderate", label: "Moderate movement", changed: 0.4 },
  { id: "busy", label: "Busy — most of the frame changes", changed: 0.85 },
  { id: "full", label: "Full frame changes, or no optimisation", changed: 1 },
];

/** Dithering trades banding for high-frequency noise, which defeats LZW's run matching. */
export const DITHER_PENALTY = 1.35;

/** Common upload ceilings people are budgeting against, in bytes. */
export const SIZE_BUDGETS = [
  { id: "email", label: "Email-friendly", bytes: 1 * 1024 * 1024 },
  { id: "slack", label: "Chat inline preview", bytes: 2 * 1024 * 1024 },
  { id: "web", label: "Web page hero", bytes: 5 * 1024 * 1024 },
  { id: "docs", label: "Documentation embed", bytes: 8 * 1024 * 1024 },
  { id: "large", label: "Large upload", bytes: 15 * 1024 * 1024 },
];

const isPositive = (value) => Number.isFinite(value) && value > 0;

export function findContentProfile(id) {
  return CONTENT_PROFILES.find((profile) => profile.id === id) || CONTENT_PROFILES[1];
}

export function findMotionProfile(id) {
  return MOTION_PROFILES.find((profile) => profile.id === id) || MOTION_PROFILES[1];
}

/** Bits per pixel for a palette: the palette is rounded up to a power of two, 1 to 8 bits. */
export function paletteBits(colours) {
  const count = Math.round(Number(colours));
  if (!Number.isFinite(count) || count < 1) return null;
  return Math.min(8, Math.max(1, Math.ceil(Math.log2(Math.max(2, count)))));
}

/** Global colour table size in bytes: three bytes per entry, 2^bits entries. */
export function colourTableBytes(colours) {
  const bits = paletteBits(colours);
  if (bits === null) return null;
  return 3 * Math.pow(2, bits);
}

/** Data bytes plus the one-byte length prefix each 255-byte sub-block carries. */
export function withSubBlockOverhead(dataBytes) {
  const bytes = Math.max(0, Math.ceil(Number(dataBytes) || 0));
  return bytes + Math.ceil(bytes / SUB_BLOCK_MAX_DATA);
}

/** Bytes as KB / MB using binary units, which is what file managers report. */
export function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return "—";
  if (value < 1024) return `${Math.round(value)} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Estimate the size of a GIF.
 *
 * @param {object} input
 * @param {number} input.width pixels
 * @param {number} input.height pixels
 * @param {number} input.frames total frames including the first
 * @param {number} input.colours palette entries, 2 to 256
 * @param {string} [input.contentId] CONTENT_PROFILES id
 * @param {string} [input.motionId] MOTION_PROFILES id
 * @param {boolean} [input.dithered]
 * @param {number} [input.fps] used only to report the playback duration
 * @returns {object} estimate, or { error }
 */
export function estimateGifSize(input = {}) {
  const width = Math.round(Number(input.width));
  const height = Math.round(Number(input.height));
  const frames = Math.round(Number(input.frames));
  const colours = Math.round(Number(input.colours));

  if (!isPositive(width) || !isPositive(height)) return { error: "Width and height must both be greater than zero." };
  if (width > 20000 || height > 20000) return { error: "GIF stores dimensions in 16 bits, so each side has to be under 65,536 pixels — and anything over 20,000 is not a GIF anyone can play." };
  if (!Number.isFinite(frames) || frames < 1) return { error: "A GIF needs at least one frame." };
  if (frames > 20000) return { error: "Over 20,000 frames is beyond what browsers will decode. Split the animation or cut the frame rate." };
  if (!Number.isFinite(colours) || colours < MIN_PALETTE_COLOURS) return { error: `A GIF palette needs at least ${MIN_PALETTE_COLOURS} colours.` };
  if (colours > MAX_PALETTE_COLOURS) return { error: `GIF is limited to ${MAX_PALETTE_COLOURS} colours per palette. Reduce the palette or use a video format.` };

  const content = findContentProfile(input.contentId);
  const motion = findMotionProfile(input.motionId);
  const dithered = Boolean(input.dithered);

  const bits = paletteBits(colours);
  const gct = colourTableBytes(colours);
  const pixels = width * height;
  const rawFrameBytes = (pixels * bits) / 8;

  const compression = content.ratio * (dithered ? DITHER_PENALTY : 1);

  const firstFrameData = rawFrameBytes * compression;
  const laterFrameData = rawFrameBytes * motion.changed * compression;

  const perFrameOverhead =
    GRAPHIC_CONTROL_EXTENSION_BYTES + IMAGE_DESCRIPTOR_BYTES + LZW_MIN_CODE_SIZE_BYTES + BLOCK_TERMINATOR_BYTES;

  const containerBytes =
    GIF_HEADER_BYTES + LOGICAL_SCREEN_DESCRIPTOR_BYTES + gct + NETSCAPE_LOOP_EXTENSION_BYTES + TRAILER_BYTES;

  const firstFrameBytes = perFrameOverhead + withSubBlockOverhead(firstFrameData);
  const laterFrameBytes = perFrameOverhead + withSubBlockOverhead(laterFrameData);

  const totalBytes = containerBytes + firstFrameBytes + Math.max(0, frames - 1) * laterFrameBytes;

  const fps = Number(input.fps);
  const durationSeconds = isPositive(fps) ? frames / fps : null;

  return {
    width,
    height,
    frames,
    colours,
    bitsPerPixel: bits,
    paletteEntries: Math.pow(2, bits),
    content,
    motion,
    dithered,
    pixels,
    rawFrameBytes,
    rawTotalBytes: rawFrameBytes * frames,
    compressionRatio: compression,
    containerBytes,
    colourTableBytes: gct,
    perFrameOverhead,
    firstFrameBytes,
    laterFrameBytes,
    totalBytes,
    lowEstimate: totalBytes * (1 - ESTIMATE_TOLERANCE),
    highEstimate: totalBytes * (1 + ESTIMATE_TOLERANCE),
    bytesPerFrame: totalBytes / frames,
    durationSeconds,
  };
}

/**
 * How many frames fit inside a size budget at the given settings.
 * Solves budget = container + firstFrame + (n - 1) x laterFrame for n.
 *
 * @returns {number|null} whole frames, or null when the settings are unusable
 */
export function framesWithinBudget({ budgetBytes, ...settings }) {
  const budget = Number(budgetBytes);
  if (!isPositive(budget)) return null;
  const single = estimateGifSize({ ...settings, frames: 1 });
  if (single.error) return null;
  const remaining = budget - single.totalBytes;
  if (remaining < 0) return 0;
  if (!isPositive(single.laterFrameBytes)) return null;
  return 1 + Math.floor(remaining / single.laterFrameBytes);
}

/**
 * The largest width that fits a budget, keeping the aspect ratio, by scaling down and
 * re-estimating. Returns the width in whole pixels, or null when even 1px will not fit.
 */
export function widthWithinBudget({ budgetBytes, width, height, ...settings }) {
  const budget = Number(budgetBytes);
  const w = Math.round(Number(width));
  const h = Math.round(Number(height));
  if (!isPositive(budget) || !isPositive(w) || !isPositive(h)) return null;

  const aspect = h / w;
  let low = 1;
  let high = w;
  let best = null;

  // Size grows monotonically with width, so a binary search is exact to the pixel.
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const estimate = estimateGifSize({ ...settings, width: mid, height: Math.max(1, Math.round(mid * aspect)) });
    if (estimate.error) {
      high = mid - 1;
      continue;
    }
    if (estimate.totalBytes <= budget) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return best;
}
