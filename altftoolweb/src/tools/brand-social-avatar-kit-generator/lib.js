/**
 * Social avatar kit planning.
 *
 * Geometry
 * --------
 * Every major platform crops a square profile picture to a circle. The largest
 * square that fits entirely inside a circle of diameter D has a side of
 * D / sqrt(2), so anything outside a centred square of 70.71% of the image
 * width is at risk of being clipped. The inset from each edge is therefore
 * D * (1 - 1/sqrt(2)) / 2 = 14.64% of the width.
 *
 * Sizes
 * -----
 * The sizes below are the square upload sizes each platform documents or
 * recommends. Platforms change these, so they are treated as targets to
 * export at, not guarantees — always keep the original square master.
 */

/** Side of the largest square that fits inside the inscribed circle, as a fraction of width. */
export const CIRCLE_SAFE_RATIO = 1 / Math.SQRT2;
/** Inset from each edge to that safe square, as a fraction of width. */
export const CIRCLE_SAFE_INSET = (1 - CIRCLE_SAFE_RATIO) / 2;
/** Below this ratio of source pixels to target pixels, upscaling is visible. */
export const UPSCALE_WARNING_RATIO = 1;
/** Enough source pixels to survive a retina display at the largest target. */
export const RETINA_MULTIPLIER = 2;

/** Square profile-picture upload sizes recommended by each platform. */
export const AVATAR_SPECS = [
  { key: "x", label: "X (Twitter)", size: 400, shape: "circle", note: "400 x 400 upload, shown as a circle in timelines." },
  { key: "instagram", label: "Instagram", size: 320, shape: "circle", note: "320 x 320 upload; displayed at 110 px on profiles." },
  { key: "facebook", label: "Facebook page", size: 320, shape: "circle", note: "320 x 320 minimum; displayed at 170 px on desktop." },
  { key: "linkedin", label: "LinkedIn", size: 400, shape: "rounded", note: "400 x 400 minimum for a personal profile photo." },
  { key: "youtube", label: "YouTube", size: 800, shape: "circle", note: "800 x 800 recommended; displayed at 98 px on the channel page." },
  { key: "tiktok", label: "TikTok", size: 200, shape: "circle", note: "200 x 200 minimum for a profile photo." },
  { key: "whatsapp", label: "WhatsApp", size: 192, shape: "circle", note: "192 x 192 is the size WhatsApp stores for a profile photo." },
  { key: "discord", label: "Discord", size: 512, shape: "circle", note: "128 x 128 minimum; 512 gives a clean result on every surface." },
  { key: "slack", label: "Slack", size: 512, shape: "rounded", note: "512 x 512 upload, displayed as a rounded square." },
  { key: "github", label: "GitHub", size: 500, shape: "rounded", note: "500 x 500 recommended for an organisation or user avatar." },
  { key: "pinterest", label: "Pinterest", size: 280, shape: "circle", note: "280 x 280 upload; displayed at 165 px on a profile." },
  { key: "favicon", label: "Favicon / app icon", size: 512, shape: "square", note: "512 x 512 is the size a PWA manifest and app stores expect." },
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Safe-zone geometry for a square canvas of the given side.
 * @param {number} size - canvas side in pixels
 * @returns {{ side:number, inset:number, radius:number }|{error:string}}
 */
export function computeSafeZone(size) {
  const s = Number(size);
  if (!isFiniteNumber(s) || s <= 0) return { error: "Canvas size must be greater than zero." };
  return {
    side: s * CIRCLE_SAFE_RATIO,
    inset: s * CIRCLE_SAFE_INSET,
    radius: s / 2,
  };
}

/**
 * Work out the square region of the source image to draw, given a zoom factor
 * and a pan offset in the range -1 (hard left/top) to 1 (hard right/bottom).
 *
 * @returns {{ sx:number, sy:number, size:number }|{error:string}}
 */
export function computeCrop({ sourceWidth, sourceHeight, zoom = 1, offsetX = 0, offsetY = 0 } = {}) {
  const w = Number(sourceWidth);
  const h = Number(sourceHeight);
  if (!isFiniteNumber(w) || !isFiniteNumber(h) || w <= 0 || h <= 0) {
    return { error: "Source image has no usable width or height." };
  }
  const z = Number(zoom);
  if (!isFiniteNumber(z) || z < 1 || z > 8) {
    return { error: "Zoom must be between 1x and 8x." };
  }
  const ox = isFiniteNumber(Number(offsetX)) ? Math.min(1, Math.max(-1, Number(offsetX))) : 0;
  const oy = isFiniteNumber(Number(offsetY)) ? Math.min(1, Math.max(-1, Number(offsetY))) : 0;

  const size = Math.min(w, h) / z;
  const slackX = (w - size) / 2;
  const slackY = (h - size) / 2;
  const sx = Math.min(Math.max(slackX + ox * slackX, 0), w - size);
  const sy = Math.min(Math.max(slackY + oy * slackY, 0), h - size);

  return { sx, sy, size };
}

/**
 * Build the export plan for the selected platforms.
 *
 * @param {object} input
 * @param {number} input.sourceWidth
 * @param {number} input.sourceHeight
 * @param {string[]} input.selected - AVATAR_SPECS keys
 * @param {number} [input.zoom]
 * @returns {object} plan or { error }
 */
export function planAvatarKit({ sourceWidth, sourceHeight, selected = [], zoom = 1 } = {}) {
  const w = Number(sourceWidth);
  const h = Number(sourceHeight);
  if (!isFiniteNumber(w) || !isFiniteNumber(h) || w <= 0 || h <= 0) {
    return { error: "Load a source image before building the kit." };
  }
  const specs = AVATAR_SPECS.filter((spec) => selected.includes(spec.key));
  if (specs.length === 0) return { error: "Select at least one platform to export for." };

  const crop = computeCrop({ sourceWidth: w, sourceHeight: h, zoom });
  if (crop.error) return { error: crop.error };

  const cropSide = crop.size;
  const largest = specs.reduce((max, spec) => Math.max(max, spec.size), 0);

  const rows = specs.map((spec) => {
    const ratio = cropSide / spec.size;
    const scalePercent = ratio * 100;
    let quality = "Downscaled from a larger master";
    if (ratio < UPSCALE_WARNING_RATIO) quality = "Upscaled — will look soft";
    else if (ratio < RETINA_MULTIPLIER) quality = "Exact fit, no headroom for retina";
    return {
      ...spec,
      cropSide: Math.round(cropSide),
      ratio,
      scalePercent,
      upscaled: ratio < UPSCALE_WARNING_RATIO,
      quality,
      filename: `avatar-${spec.key}-${spec.size}x${spec.size}.png`,
      safe: computeSafeZone(spec.size),
    };
  });

  const recommendedSource = Math.ceil(largest * RETINA_MULTIPLIER);
  const upscaledCount = rows.filter((row) => row.upscaled).length;

  return {
    rows,
    cropSide: Math.round(cropSide),
    sourceWidth: Math.round(w),
    sourceHeight: Math.round(h),
    isSquareSource: Math.abs(w - h) <= 1,
    largest,
    recommendedSource,
    upscaledCount,
    safeInsetPercent: CIRCLE_SAFE_INSET * 100,
    safeSidePercent: CIRCLE_SAFE_RATIO * 100,
    summary:
      upscaledCount === 0
        ? `All ${rows.length} exports come from a large enough master.`
        : `${upscaledCount} of ${rows.length} exports need upscaling from a ${Math.round(cropSide)} px crop.`,
  };
}

/** Human-readable list of the platform keys selected by default. */
export const DEFAULT_SELECTION = ["x", "instagram", "linkedin", "youtube", "discord", "favicon"];
