/**
 * Stream overlay geometry.
 *
 * Two resolutions matter in OBS/Streamlabs style software:
 *   - the BASE (canvas) resolution, where you place and size sources, and
 *   - the OUTPUT (scaled) resolution that is actually encoded and sent out.
 *
 * Everything is laid out on the canvas, then multiplied by
 *     scale = outputWidth / canvasWidth
 * on the way to the encoder. An element sized as a percentage of canvas width
 * keeps the same relative size at any output resolution, which is why overlay
 * kits are specified in percentages rather than fixed pixels.
 */

/** Common stream canvas / output resolutions. */
export const RESOLUTION_PRESETS = [
  { id: "2160p", label: "3840 × 2160 (4K)", width: 3840, height: 2160 },
  { id: "1440p", label: "2560 × 1440 (1440p)", width: 2560, height: 1440 },
  { id: "1080p", label: "1920 × 1080 (1080p)", width: 1920, height: 1080 },
  { id: "900p", label: "1600 × 900 (900p)", width: 1600, height: 900 },
  { id: "720p", label: "1280 × 720 (720p)", width: 1280, height: 720 },
  { id: "vertical1080", label: "1080 × 1920 (vertical)", width: 1080, height: 1920 },
  { id: "vertical720", label: "720 × 1280 (vertical)", width: 720, height: 1280 },
];

/**
 * Typical overlay elements expressed as a share of canvas WIDTH plus the
 * element's own aspect ratio. These are the sizes overlay kits ship at; they
 * are conventions, not standards, so every field stays editable.
 */
export const ELEMENT_PRESETS = [
  { id: "facecam", label: "Facecam / webcam", widthPct: 25, aspectW: 16, aspectH: 9 },
  { id: "facecam-small", label: "Small corner cam", widthPct: 16, aspectW: 16, aspectH: 9 },
  { id: "chatbox", label: "Chat box", widthPct: 18, aspectW: 9, aspectH: 16 },
  { id: "alertbox", label: "Alert box", widthPct: 34, aspectW: 16, aspectH: 9 },
  { id: "lower-third", label: "Lower third banner", widthPct: 45, aspectW: 32, aspectH: 5 },
  { id: "starting-panel", label: "Starting-soon panel", widthPct: 60, aspectW: 16, aspectH: 9 },
];

/** The nine anchor positions an element can be pinned to inside the safe area. */
export const ANCHORS = [
  { id: "top-left", label: "Top left", h: "left", v: "top" },
  { id: "top-center", label: "Top centre", h: "center", v: "top" },
  { id: "top-right", label: "Top right", h: "right", v: "top" },
  { id: "middle-left", label: "Middle left", h: "left", v: "middle" },
  { id: "middle-center", label: "Centre", h: "center", v: "middle" },
  { id: "middle-right", label: "Middle right", h: "right", v: "middle" },
  { id: "bottom-left", label: "Bottom left", h: "left", v: "bottom" },
  { id: "bottom-center", label: "Bottom centre", h: "center", v: "bottom" },
  { id: "bottom-right", label: "Bottom right", h: "right", v: "bottom" },
];

/** Largest sensible canvas edge — guards typos like 19200. */
export const MAX_DIMENSION = 8192;
/** Aspect ratios closer than this are treated as identical (rounding slack). */
export const ASPECT_TOLERANCE = 0.005;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Greatest common divisor, used to print an aspect ratio in lowest terms. */
export function gcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y > 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/** "1920x1080" -> "16:9" */
export function aspectLabel(width, height) {
  if (!isNum(width) || !isNum(height) || width <= 0 || height <= 0) return "—";
  const g = gcd(width, height);
  return `${Math.round(width / g)}:${Math.round(height / g)}`;
}

/**
 * Convert a canvas-pixel rectangle into percentages of the canvas, so a
 * preview box can be drawn with plain CSS at any display size.
 */
export function rectToPercent({ x, y, width, height, canvasWidth, canvasHeight }) {
  if (!isNum(canvasWidth) || !isNum(canvasHeight) || canvasWidth <= 0 || canvasHeight <= 0) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }
  const clamp = (v) => Math.max(0, Math.min(100, v));
  return {
    left: clamp((x / canvasWidth) * 100),
    top: clamp((y / canvasHeight) * 100),
    width: clamp((width / canvasWidth) * 100),
    height: clamp((height / canvasHeight) * 100),
  };
}

/**
 * @param {object} input
 * @param {number} input.canvasWidth      Base canvas width in pixels.
 * @param {number} input.canvasHeight     Base canvas height in pixels.
 * @param {number} input.outputWidth      Encoded output width in pixels.
 * @param {number} input.outputHeight     Encoded output height in pixels.
 * @param {number} input.elementWidthPct  Element width as a % of canvas width.
 * @param {number} input.aspectW          Element aspect ratio numerator.
 * @param {number} input.aspectH          Element aspect ratio denominator.
 * @param {number} [input.safeMarginPct]  Edge margin as a % of the short edge.
 * @param {number} [input.sourceAssetWidth] Width of the artwork you already have.
 * @returns {object} sizes and positions, or { error }.
 */
export function computeOverlayLayout({
  canvasWidth,
  canvasHeight,
  outputWidth,
  outputHeight,
  elementWidthPct,
  aspectW,
  aspectH,
  safeMarginPct = 5,
  sourceAssetWidth = 0,
} = {}) {
  const nums = [
    canvasWidth,
    canvasHeight,
    outputWidth,
    outputHeight,
    elementWidthPct,
    aspectW,
    aspectH,
    safeMarginPct,
    sourceAssetWidth,
  ];
  if (!nums.every(isNum)) return { error: "Enter a number in every field." };
  if (canvasWidth <= 0 || canvasHeight <= 0 || outputWidth <= 0 || outputHeight <= 0) {
    return { error: "Canvas and output resolutions must be greater than zero." };
  }
  if ([canvasWidth, canvasHeight, outputWidth, outputHeight].some((v) => v > MAX_DIMENSION)) {
    return { error: `No edge can exceed ${MAX_DIMENSION} pixels.` };
  }
  if (aspectW <= 0 || aspectH <= 0) {
    return { error: "Element aspect ratio must use two positive numbers." };
  }
  if (elementWidthPct <= 0 || elementWidthPct > 100) {
    return { error: "Element width must be between 0% and 100% of the canvas width." };
  }
  if (safeMarginPct < 0 || safeMarginPct >= 50) {
    return { error: "Safe margin must be between 0% and 49% of the short edge." };
  }
  if (sourceAssetWidth < 0) return { error: "Source artwork width cannot be negative." };

  const scaleX = outputWidth / canvasWidth;
  const scaleY = outputHeight / canvasHeight;
  const canvasAspect = canvasWidth / canvasHeight;
  const outputAspect = outputWidth / outputHeight;
  const aspectMatch = Math.abs(canvasAspect - outputAspect) <= ASPECT_TOLERANCE;

  const elementCanvasWidth = Math.round((canvasWidth * elementWidthPct) / 100);
  const elementCanvasHeight = Math.round((elementCanvasWidth * aspectH) / aspectW);
  const elementOutputWidth = Math.round(elementCanvasWidth * scaleX);
  const elementOutputHeight = Math.round(elementCanvasHeight * scaleY);

  // Margin is taken off the SHORT edge so it looks even on 16:9 and 9:16 alike.
  const shortEdge = Math.min(canvasWidth, canvasHeight);
  const margin = Math.round((shortEdge * safeMarginPct) / 100);

  const freeWidth = canvasWidth - 2 * margin;
  const freeHeight = canvasHeight - 2 * margin;

  const positions = ANCHORS.map((anchor) => {
    let x;
    if (anchor.h === "left") x = margin;
    else if (anchor.h === "right") x = canvasWidth - margin - elementCanvasWidth;
    else x = Math.round((canvasWidth - elementCanvasWidth) / 2);

    let y;
    if (anchor.v === "top") y = margin;
    else if (anchor.v === "bottom") y = canvasHeight - margin - elementCanvasHeight;
    else y = Math.round((canvasHeight - elementCanvasHeight) / 2);

    return { id: anchor.id, label: anchor.label, x, y };
  });

  // Artwork should be authored at least at canvas size; 2x keeps it crisp if
  // the canvas is later raised (e.g. 1080p project reused at 1440p).
  const exportWidth1x = elementCanvasWidth;
  const exportWidth2x = elementCanvasWidth * 2;
  const assetScalePct =
    sourceAssetWidth > 0 ? (elementCanvasWidth / sourceAssetWidth) * 100 : 0;

  const warnings = [];
  if (!aspectMatch) {
    warnings.push(
      `Canvas is ${aspectLabel(canvasWidth, canvasHeight)} but output is ${aspectLabel(outputWidth, outputHeight)} — the picture will be stretched or bar-boxed.`,
    );
  }
  if (scaleX > 1 || scaleY > 1) {
    warnings.push("Output is larger than the canvas, so everything is being upscaled and will look soft.");
  }
  if (elementCanvasWidth > freeWidth) {
    warnings.push("The element is wider than the safe area — reduce its width or the margin.");
  }
  if (elementCanvasHeight > freeHeight) {
    warnings.push("The element is taller than the safe area — reduce its width or the margin.");
  }
  if (sourceAssetWidth > 0 && assetScalePct > 100) {
    warnings.push(
      `Your artwork is only ${Math.round(sourceAssetWidth)}px wide and would be stretched to ${Math.round(assetScalePct)}% — export it larger.`,
    );
  }

  return {
    scaleX,
    scaleY,
    canvasAspect,
    outputAspect,
    canvasAspectLabel: aspectLabel(canvasWidth, canvasHeight),
    outputAspectLabel: aspectLabel(outputWidth, outputHeight),
    aspectMatch,
    elementCanvasWidth,
    elementCanvasHeight,
    elementOutputWidth,
    elementOutputHeight,
    elementCanvasAreaPct:
      (elementCanvasWidth * elementCanvasHeight * 100) / (canvasWidth * canvasHeight),
    margin,
    freeWidth,
    freeHeight,
    positions,
    exportWidth1x,
    exportWidth2x,
    exportHeight1x: elementCanvasHeight,
    exportHeight2x: elementCanvasHeight * 2,
    assetScalePct,
    warnings,
  };
}
