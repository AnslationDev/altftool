/**
 * Favicon legibility analysis.
 *
 * Everything here works on a flat RGBA byte array (the same layout as CanvasRenderingContext2D
 * ImageData.data): four bytes per pixel, row-major, top-left origin. The caller is responsible
 * for decoding the image; this module only does arithmetic.
 *
 * Contrast uses the WCAG 2.x definitions:
 *   relative luminance L = 0.2126 R + 0.7152 G + 0.0722 B  (linearised sRGB)
 *   contrast ratio      = (Llighter + 0.05) / (Ldarker + 0.05)
 * Source: WCAG 2.1, "Relative luminance" and "contrast ratio" definitions.
 */

/** WCAG 2.1 SC 1.4.11 Non-text Contrast: graphical objects need at least 3:1. */
export const MIN_GRAPHIC_CONTRAST = 3;

/** Alpha below this (out of 255) is treated as invisible, so it is excluded from colour stats. */
export const ALPHA_VISIBLE_THRESHOLD = 16;

/**
 * Heuristic, not a standard: if more than this share of the visible pixels fall below 3:1 against
 * a tab colour, the mark reads as washed out at 16 px even though parts of it still pass.
 */
export const WASHED_OUT_PIXEL_SHARE = 0.4;

/** Below this padding on any side the artwork touches the tab edge and looks cramped at 16 px. */
export const MIN_EDGE_PADDING_SHARE = 0.06;

/**
 * Above this share of visible pixels the icon is a deliberate full-bleed plate (a filled tile),
 * so touching the canvas edge is intentional and is not reported as a padding problem.
 */
export const FULL_BLEED_COVERAGE = 0.85;

/** Average saturation below this reads as effectively monochrome. 0 = grey, 1 = fully saturated. */
export const MONOCHROME_SATURATION = 0.12;

/**
 * Approximate browser tab-strip colours, sampled from default themes.
 * Stored as sRGB triples so no colour literal is needed anywhere in the source.
 */
export const TAB_BACKGROUNDS = [
  { id: "light", label: "Light tab strip", rgb: { r: 255, g: 255, b: 255 } },
  { id: "dark", label: "Dark tab strip", rgb: { r: 32, g: 33, b: 36 } },
];

/** Favicon sizes browsers actually rasterise to in the tab strip and the bookmarks bar. */
export const PREVIEW_SIZES = [16, 24, 32];

function clamp255(value) {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 255) return 255;
  return value;
}

function channelLuminance(byteValue) {
  const c = clamp255(byteValue) / 255;
  // WCAG 2.x sRGB linearisation.
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of an sRGB colour, 0 (black) to 1 (white). */
export function relativeLuminance({ r, g, b }) {
  return (
    0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
  );
}

/** WCAG contrast ratio between two sRGB colours, 1 to 21. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Source-over compositing of a straight-alpha colour onto an opaque background. */
export function compositeOver(color, alpha, background) {
  const a = clamp255(alpha) / 255;
  return {
    r: color.r * a + background.r * (1 - a),
    g: color.g * a + background.g * (1 - a),
    b: color.b * a + background.b * (1 - a),
  };
}

function saturationOf({ r, g, b }) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (!(max > 0)) return 0;
  return (max - min) / max;
}

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/**
 * Analyse a decoded favicon.
 * @param {{ data: ArrayLike<number>, width: number, height: number }} image
 * @returns {object} metrics, or { error } when the image cannot be judged.
 */
export function analyzeFavicon(image) {
  if (!image || !image.data) return { error: "No image data to analyse." };
  const width = Number(image.width);
  const height = Number(image.height);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    return { error: "Image width and height must be whole numbers greater than zero." };
  }
  const { data } = image;
  if (data.length !== width * height * 4) {
    return { error: "Pixel data length does not match the stated width and height." };
  }

  let visible = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumAlpha = 0;
  let sumSaturation = 0;
  const luminances = [];
  const lowContrast = {};
  for (const bg of TAB_BACKGROUNDS) lowContrast[bg.id] = 0;

  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3];
      sumAlpha += alpha;
      if (alpha < ALPHA_VISIBLE_THRESHOLD) continue;
      const color = { r: data[i], g: data[i + 1], b: data[i + 2] };
      visible += 1;
      sumR += color.r;
      sumG += color.g;
      sumB += color.b;
      sumSaturation += saturationOf(color);
      luminances.push(relativeLuminance(color));
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      for (const bg of TAB_BACKGROUNDS) {
        const flattened = compositeOver(color, alpha, bg.rgb);
        if (contrastRatio(flattened, bg.rgb) < MIN_GRAPHIC_CONTRAST) lowContrast[bg.id] += 1;
      }
    }
  }

  const totalPixels = width * height;
  if (visible === 0) {
    return { error: "Every pixel is transparent — there is nothing for a browser to draw." };
  }

  const average = { r: sumR / visible, g: sumG / visible, b: sumB / visible };
  const averageLuminance = relativeLuminance(average);
  const meanLuminance = luminances.reduce((sum, value) => sum + value, 0) / visible;
  const variance =
    luminances.reduce((sum, value) => sum + (value - meanLuminance) ** 2, 0) / visible;
  const luminanceSpread = Math.sqrt(variance);
  const saturation = sumSaturation / visible;

  const backgrounds = TAB_BACKGROUNDS.map((bg) => {
    const flatAverage = compositeOver(average, 255, bg.rgb);
    const ratio = contrastRatio(flatAverage, bg.rgb);
    const share = lowContrast[bg.id] / visible;
    return {
      id: bg.id,
      label: bg.label,
      rgb: bg.rgb,
      contrast: round(ratio, 2),
      lowContrastShare: round(share, 4),
      pass: ratio >= MIN_GRAPHIC_CONTRAST && share <= WASHED_OUT_PIXEL_SHARE,
    };
  });

  const padding = {
    left: left / width,
    right: (width - 1 - right) / width,
    top: top / height,
    bottom: (height - 1 - bottom) / height,
  };
  const minPadding = Math.min(padding.left, padding.right, padding.top, padding.bottom);
  const coverage = visible / totalPixels;
  const fullBleed = coverage >= FULL_BLEED_COVERAGE;
  const edgeTight = !fullBleed && minPadding < MIN_EDGE_PADDING_SHARE;

  const notes = [];
  for (const bg of backgrounds) {
    if (!bg.pass) {
      notes.push(
        `On the ${bg.label.toLowerCase()} the artwork averages ${bg.contrast}:1 and ${Math.round(
          bg.lowContrastShare * 100,
        )}% of its visible pixels sit under ${MIN_GRAPHIC_CONTRAST}:1. Add an outline, a contrasting plate behind the mark, or ship a second icon behind a prefers-color-scheme media query.`,
      );
    }
  }
  if (edgeTight) {
    notes.push(
      "The artwork runs into the edge of the canvas without filling it. Browsers add no margin of their own, so leave roughly 1-2 px of clear space on a 16 px icon.",
    );
  }
  if (saturation < MONOCHROME_SATURATION) {
    notes.push(
      "The icon is already close to monochrome, which is ideal for a Safari pinned-tab mask but leaves little room to distinguish it from grey UI chrome.",
    );
  }
  if (luminanceSpread < 0.02 && saturation >= MONOCHROME_SATURATION) {
    notes.push(
      "Detail is carried by hue rather than by brightness. Safari's pinned-tab mask flattens the icon to one colour, so those shapes will merge — supply a dedicated single-colour SVG mask.",
    );
  }
  if (width < 32 || height < 32) {
    notes.push(
      "Source artwork is smaller than 32 x 32. Ship at least 32 x 32 (and ideally a 180 x 180 apple-touch-icon) so high-DPI tabs are not upscaled.",
    );
  }

  return {
    width,
    height,
    totalPixels,
    visiblePixels: visible,
    transparentShare: round(1 - visible / totalPixels, 4),
    averageAlpha: round(sumAlpha / totalPixels, 2),
    averageColor: {
      r: Math.round(average.r),
      g: Math.round(average.g),
      b: Math.round(average.b),
    },
    averageLuminance: round(averageLuminance, 4),
    luminanceSpread: round(luminanceSpread, 4),
    saturation: round(saturation, 4),
    backgrounds,
    bounds: { left, right, top, bottom },
    padding: {
      left: round(padding.left, 4),
      right: round(padding.right, 4),
      top: round(padding.top, 4),
      bottom: round(padding.bottom, 4),
      min: round(minPadding, 4),
    },
    coverage: round(coverage, 4),
    fullBleed,
    edgeTight,
    monochromeFriendly: saturation < MONOCHROME_SATURATION || luminanceSpread >= 0.02,
    notes,
    verdict: backgrounds.every((bg) => bg.pass) && !edgeTight ? "pass" : "review",
  };
}

/**
 * A deterministic 32 x 32 sample favicon so the tool shows a real reading before any upload:
 * a rounded teal square with a white ring cut into it.
 */
export function sampleFaviconPixels(size = 32) {
  const s = Math.max(8, Math.floor(size));
  const data = new Uint8ClampedArray(s * s * 4);
  const radius = s * 0.22;
  const center = (s - 1) / 2;
  const ringOuter = s * 0.3;
  const ringInner = s * 0.17;
  for (let y = 0; y < s; y += 1) {
    for (let x = 0; x < s; x += 1) {
      const i = (y * s + x) * 4;
      // Rounded-rectangle test: distance to the inner rect inset by the corner radius.
      const dx = Math.max(radius - x, 0, x - (s - 1 - radius));
      const dy = Math.max(radius - y, 0, y - (s - 1 - radius));
      const inside = Math.hypot(dx, dy) <= radius;
      if (!inside) continue;
      const dist = Math.hypot(x - center, y - center);
      const isRing = dist <= ringOuter && dist >= ringInner;
      // Brand teal (20, 184, 166) plate, white ring.
      data[i] = isRing ? 255 : 20;
      data[i + 1] = isRing ? 255 : 184;
      data[i + 2] = isRing ? 255 : 166;
      data[i + 3] = 255;
    }
  }
  return { data, width: s, height: s };
}

/** Plain-text report for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [
    "Favicon dark mode check",
    `Source: ${result.width} x ${result.height} px, ${Math.round(result.transparentShare * 100)}% transparent`,
    `Average colour: r ${result.averageColor.r}, g ${result.averageColor.g}, b ${result.averageColor.b}`,
  ];
  for (const bg of result.backgrounds) {
    lines.push(
      `${bg.label}: ${bg.contrast}:1 average, ${Math.round(bg.lowContrastShare * 100)}% of pixels below ${MIN_GRAPHIC_CONTRAST}:1 — ${bg.pass ? "OK" : "needs work"}`,
    );
  }
  lines.push(`Smallest edge padding: ${Math.round(result.padding.min * 100)}% of the canvas`);
  for (const note of result.notes) lines.push(`- ${note}`);
  return lines.join("\n");
}
