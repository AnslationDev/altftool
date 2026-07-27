/**
 * Instagram Post Size Generator
 *
 * Pure geometry for fitting one source image into each Instagram canvas size.
 * No DOM and no canvas here — the component does the drawing, this module
 * decides where every pixel lands.
 *
 * Canvas sizes are the dimensions Instagram actually serves feed media at:
 *   - Feed images are delivered at up to 1080 pixels wide.
 *   - 1:1 square is 1080 x 1080.
 *   - 4:5 portrait (1080 x 1350) is the tallest ratio the feed accepts, so it
 *     occupies the most vertical space of any feed post.
 *   - 1.91:1 landscape (1080 x 566) is the widest the feed accepts; anything
 *     wider is cropped back to it.
 *   - Stories and Reels use the full-screen 9:16 canvas, 1080 x 1920.
 * A source narrower than 320 pixels is below the width Instagram recommends and
 * will be visibly soft once upscaled.
 *
 * Fit modes are the standard two:
 *   cover   scale = max(targetW/sourceW, targetH/sourceH) — fills the frame and
 *           crops the overflow.
 *   contain scale = min(targetW/sourceW, targetH/sourceH) — shows the whole
 *           image and leaves bars.
 */

/** Instagram serves feed images at up to this width. */
export const MAX_FEED_WIDTH = 1080;

/** Below this source width the upload is noticeably soft. */
export const MIN_RECOMMENDED_WIDTH = 320;

/** Guard against absurd source dimensions. */
export const MAX_DIMENSION = 30000;

export const FIT_MODES = [
  { id: "cover", label: "Fill the frame (crop the overflow)" },
  { id: "contain", label: "Fit the whole image (add bars)" },
];

export const INSTAGRAM_PRESETS = [
  {
    id: "square",
    label: "Feed square",
    width: 1080,
    height: 1080,
    ratio: "1:1",
    note: "The safest default. A square post is never cropped in the profile grid.",
  },
  {
    id: "portrait",
    label: "Feed portrait",
    width: 1080,
    height: 1350,
    ratio: "4:5",
    note: "The tallest ratio the feed accepts, so it takes up the most screen height of any feed post.",
  },
  {
    id: "landscape",
    label: "Feed landscape",
    width: 1080,
    height: 566,
    ratio: "1.91:1",
    note: "The widest the feed accepts. Anything wider gets cropped back to this.",
  },
  {
    id: "story",
    label: "Story or Reel",
    width: 1080,
    height: 1920,
    ratio: "9:16",
    safeTop: 250,
    safeBottom: 250,
    note: "Meta's own Stories creative guidance keeps roughly 250 pixels clear at the top and bottom of this canvas for interface elements. Reels put more interface at the bottom, so keep captions higher than the guide suggests and check in the app.",
  },
  {
    id: "profile",
    label: "Profile picture",
    width: 320,
    height: 320,
    ratio: "1:1",
    circular: true,
    note: "Displayed as a circle, so keep the subject inside the circle inscribed in this square.",
  },
];

export function getPreset(id) {
  return INSTAGRAM_PRESETS.find((preset) => preset.id === id) || null;
}

function clamp01(value) {
  if (!Number.isFinite(value)) return 0.5;
  return Math.min(1, Math.max(0, value));
}

/**
 * Work out how a source image maps onto one target canvas.
 *
 * @param {object} input
 * @param {number} input.sourceWidth
 * @param {number} input.sourceHeight
 * @param {number} input.targetWidth
 * @param {number} input.targetHeight
 * @param {string} input.mode "cover" or "contain"
 * @param {number} input.focusX horizontal crop anchor, 0 left to 1 right
 * @param {number} input.focusY vertical crop anchor, 0 top to 1 bottom
 * @returns {object|{error:string}}
 */
export function computeFit({
  sourceWidth = 0,
  sourceHeight = 0,
  targetWidth = 0,
  targetHeight = 0,
  mode = "cover",
  focusX = 0.5,
  focusY = 0.5,
} = {}) {
  const sw = Number(sourceWidth);
  const sh = Number(sourceHeight);
  const tw = Number(targetWidth);
  const th = Number(targetHeight);

  if (![sw, sh, tw, th].every(Number.isFinite)) {
    return { error: "Every dimension must be a number." };
  }
  if (sw <= 0 || sh <= 0) return { error: "The source image has no width or height." };
  if (tw <= 0 || th <= 0) return { error: "The target canvas has no width or height." };
  if (sw > MAX_DIMENSION || sh > MAX_DIMENSION) {
    return { error: `Source images above ${MAX_DIMENSION} pixels on a side are not supported.` };
  }
  if (!FIT_MODES.some((item) => item.id === mode)) {
    return { error: "Pick either fill or fit." };
  }

  const fx = clamp01(Number(focusX));
  const fy = clamp01(Number(focusY));

  const scaleX = tw / sw;
  const scaleY = th / sh;
  const scale = mode === "cover" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);

  const drawWidth = sw * scale;
  const drawHeight = sh * scale;

  // Anchor the overflow (cover) or the empty space (contain) by the focus
  // point. The `|| 0` collapses negative zero so it never renders as "-0".
  const offsetX = (tw - drawWidth) * fx || 0;
  const offsetY = (th - drawHeight) * fy || 0;

  // The rectangle of the SOURCE image that ends up visible, in source pixels.
  const visibleWidth = Math.min(sw, tw / scale);
  const visibleHeight = Math.min(sh, th / scale);
  const cropLeft = (sw - visibleWidth) * fx || 0;
  const cropTop = (sh - visibleHeight) * fy || 0;

  const sourceArea = sw * sh;
  const visibleArea = visibleWidth * visibleHeight;
  const croppedAreaPercent = sourceArea > 0 ? (1 - visibleArea / sourceArea) * 100 : 0;

  const upscaled = scale > 1;
  // How many source pixels are available per output pixel, as a percentage.
  const effectiveResolutionPercent = (visibleWidth / tw) * 100;

  const letterboxed = mode === "contain" && (drawWidth < tw - 0.5 || drawHeight < th - 0.5);
  const barWidth = Math.max(0, (tw - drawWidth) / 2);
  const barHeight = Math.max(0, (th - drawHeight) / 2);

  const warnings = [];
  if (upscaled) {
    warnings.push(
      `The source is smaller than this canvas and is being enlarged ${(scale).toFixed(2)}x, which will look soft.`,
    );
  }
  if (sw < MIN_RECOMMENDED_WIDTH) {
    warnings.push(
      `The source is only ${Math.round(sw)} pixels wide, below the ${MIN_RECOMMENDED_WIDTH} pixel minimum Instagram recommends.`,
    );
  }
  if (croppedAreaPercent >= 40) {
    warnings.push(
      `${Math.round(croppedAreaPercent)}% of the original image is cropped away at this ratio. Move the crop anchor or use fit instead of fill.`,
    );
  }

  return {
    scale,
    drawWidth,
    drawHeight,
    offsetX,
    offsetY,
    cropLeft,
    cropTop,
    cropWidth: visibleWidth,
    cropHeight: visibleHeight,
    croppedAreaPercent,
    upscaled,
    effectiveResolutionPercent,
    letterboxed,
    barWidth,
    barHeight,
    // Normalised for CSS preview: multiples of the target box.
    drawWidthRatio: drawWidth / tw,
    drawHeightRatio: drawHeight / th,
    offsetXRatio: offsetX / tw,
    offsetYRatio: offsetY / th,
    outputPixels: tw * th,
    warnings,
  };
}

/**
 * Plan the whole export batch.
 *
 * @param {object} input
 * @param {number} input.sourceWidth
 * @param {number} input.sourceHeight
 * @param {string[]} input.presetIds
 * @param {string} input.mode
 * @param {number} input.focusX
 * @param {number} input.focusY
 * @returns {{items:Array,totalPixels:number,totalMegapixels:number,
 *   worstCropPercent:number,anyUpscaled:boolean,sourceMegapixels:number}|{error:string}}
 */
export function planBatch({
  sourceWidth = 0,
  sourceHeight = 0,
  presetIds = [],
  mode = "cover",
  focusX = 0.5,
  focusY = 0.5,
} = {}) {
  if (!Array.isArray(presetIds) || presetIds.length === 0) {
    return { error: "Select at least one Instagram size to export." };
  }

  const items = [];
  for (const id of presetIds) {
    const preset = getPreset(id);
    if (!preset) return { error: `Unknown Instagram size: ${id}.` };

    const fit = computeFit({
      sourceWidth,
      sourceHeight,
      targetWidth: preset.width,
      targetHeight: preset.height,
      mode,
      focusX,
      focusY,
    });
    if (fit.error) return { error: fit.error };

    items.push({ preset, fit });
  }

  const totalPixels = items.reduce((total, item) => total + item.fit.outputPixels, 0);
  const worstCropPercent = items.reduce(
    (worst, item) => Math.max(worst, item.fit.croppedAreaPercent),
    0,
  );

  return {
    items,
    totalPixels,
    totalMegapixels: totalPixels / 1e6,
    sourceMegapixels: (Number(sourceWidth) * Number(sourceHeight)) / 1e6,
    worstCropPercent,
    anyUpscaled: items.some((item) => item.fit.upscaled),
  };
}
