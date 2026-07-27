/**
 * SVG to Image — markup inspection, sizing maths and data-URI encoding.
 *
 * Rasterising happens on a canvas in the browser; everything that can be
 * decided from the markup alone lives here as pure functions: intrinsic size,
 * output size at a scale factor, canvas-area limits and script stripping.
 */

/**
 * CSS absolute length units in px (CSS Values and Units Level 4):
 * 1in = 96px, 1pt = 1/72in, 1pc = 1/6in, 1mm = 1/25.4in, 1cm = 1/2.54in, 1Q = 1/40cm.
 */
export const CSS_UNIT_PX = Object.freeze({
  px: 1,
  in: 96,
  pt: 96 / 72,
  pc: 16,
  mm: 96 / 25.4,
  cm: 96 / 2.54,
  q: 96 / 25.4 / 4,
  pxless: 1,
});

/**
 * An <svg> element with no width or height in an HTML document falls back to
 * the CSS default size for a replaced element: 300 x 150 px.
 */
export const DEFAULT_SVG_WIDTH = 300;
export const DEFAULT_SVG_HEIGHT = 150;

/**
 * Canvas area limit. Safari on iOS refuses to allocate a canvas larger than
 * 16,777,216 device pixels (4096 x 4096), the tightest of the mainstream
 * browser limits, so the tool refuses anything above it rather than silently
 * producing a blank PNG.
 */
export const MAX_CANVAS_PIXELS = 16777216;

/** Scale bounds offered by the UI. */
export const MIN_SCALE = 0.1;
export const MAX_SCALE = 16;

/** Bytes per pixel of an uncompressed RGBA bitmap — the canvas memory cost. */
export const BYTES_PER_PIXEL = 4;

const SVG_ROOT_RE = /<svg[\s>]/i;
const SCRIPT_RE = /<script[\s\S]*?<\/script\s*>/gi;
const EVENT_ATTR_RE = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const EXTERNAL_REF_RE = /(?:href|xlink:href|src)\s*=\s*["']\s*(?:https?:)?\/\//i;
const FOREIGN_OBJECT_RE = /<foreignObject[\s>]/i;

/** Parse one SVG length such as "120", "12mm" or "3.5in" into px. */
export function parseLengthToPx(value) {
  const raw = String(value == null ? "" : value).trim().toLowerCase();
  if (raw === "") return null;
  const match = /^([+-]?\d*\.?\d+(?:e[+-]?\d+)?)\s*([a-z%]*)$/i.exec(raw);
  if (!match) return null;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return null;
  const unit = match[2] || "px";
  if (unit === "%" || unit === "em" || unit === "rem" || unit === "ex") return null;
  const factor = CSS_UNIT_PX[unit];
  if (!factor) return null;
  return amount * factor;
}

const attr = (markup, name) => {
  const re = new RegExp(`<svg[^>]*?\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i");
  const found = re.exec(markup);
  if (!found) return null;
  return found[1] !== undefined ? found[1] : found[2];
};

/**
 * Work out the intrinsic pixel size of an SVG.
 * Width/height attributes win; otherwise the viewBox is used; otherwise the
 * CSS replaced-element default of 300 x 150.
 */
export function parseSvgDimensions(markup) {
  const source = String(markup == null ? "" : markup);
  if (!SVG_ROOT_RE.test(source)) {
    return { error: "That does not look like SVG — the markup has no <svg> element." };
  }

  const widthAttr = parseLengthToPx(attr(source, "width"));
  const heightAttr = parseLengthToPx(attr(source, "height"));

  const viewBoxRaw = attr(source, "viewBox") || attr(source, "viewbox");
  let viewBox = null;
  if (viewBoxRaw) {
    const parts = viewBoxRaw.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n)) && parts[2] > 0 && parts[3] > 0) {
      viewBox = { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] };
    }
  }

  if (widthAttr && heightAttr && widthAttr > 0 && heightAttr > 0) {
    return { width: widthAttr, height: heightAttr, viewBox, source: "attributes" };
  }
  if (viewBox) {
    return { width: viewBox.width, height: viewBox.height, viewBox, source: "viewBox" };
  }
  if (widthAttr && widthAttr > 0) {
    return { width: widthAttr, height: DEFAULT_SVG_HEIGHT, viewBox, source: "width + default" };
  }
  return {
    width: DEFAULT_SVG_WIDTH,
    height: DEFAULT_SVG_HEIGHT,
    viewBox,
    source: "CSS default 300x150",
  };
}

/** Remove <script> blocks and inline on* handlers. Returns the cleaned markup. */
export function sanitizeSvg(markup) {
  const source = String(markup == null ? "" : markup);
  const withoutScripts = source.replace(SCRIPT_RE, "");
  const cleaned = withoutScripts.replace(EVENT_ATTR_RE, "");
  return {
    cleaned,
    removedScripts: (source.match(SCRIPT_RE) || []).length,
    removedHandlers: (withoutScripts.match(EVENT_ATTR_RE) || []).length,
  };
}

/** Non-fatal things about the markup that change what the PNG will look like. */
export function svgWarnings(markup) {
  const source = String(markup == null ? "" : markup);
  const warnings = [];
  if (SCRIPT_RE.test(source)) {
    warnings.push("A <script> block was found and has been stripped — canvas rasterising ignores scripts anyway.");
  }
  if (EXTERNAL_REF_RE.test(source)) {
    warnings.push("The SVG references an external URL. Canvas will refuse to export a tainted image, so inline or embed that asset first.");
  }
  if (FOREIGN_OBJECT_RE.test(source)) {
    warnings.push("<foreignObject> is not rasterised reliably across browsers — expect it to be missing from the PNG.");
  }
  if (/font-family\s*[:=]/i.test(source)) {
    warnings.push("Text uses a font-family. Fonts render with whatever the browser has locally — convert text to paths for an exact match.");
  }
  return warnings;
}

/**
 * Output size at a scale factor, clamped to the canvas-area limit.
 * @returns {{ width:number, height:number, pixels:number, bytes:number,
 *   scale:number, limited:boolean }|{ error:string }}
 */
export function computeOutputSize({ width, height, scale = 1 } = {}) {
  const w = Number(width);
  const h = Number(height);
  const s = Number(scale);
  if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(h) || h <= 0) {
    return { error: "The SVG has no usable width and height." };
  }
  if (!Number.isFinite(s) || s < MIN_SCALE || s > MAX_SCALE) {
    return { error: `Scale must be between ${MIN_SCALE} and ${MAX_SCALE}.` };
  }
  const outWidth = Math.max(1, Math.round(w * s));
  const outHeight = Math.max(1, Math.round(h * s));
  const pixels = outWidth * outHeight;
  if (pixels > MAX_CANVAS_PIXELS) {
    return {
      error: `${outWidth} x ${outHeight} is ${pixels.toLocaleString("en-IN")} pixels, over the ${MAX_CANVAS_PIXELS.toLocaleString("en-IN")} canvas limit. Lower the scale.`,
    };
  }
  return {
    width: outWidth,
    height: outHeight,
    pixels,
    bytes: pixels * BYTES_PER_PIXEL,
    scale: s,
    limited: false,
  };
}

/**
 * Encode SVG markup as a data URI. percent-encoding (not base64) is used
 * because it is smaller for text and avoids btoa's Latin-1 limitation.
 */
export function svgToDataUri(markup) {
  const source = String(markup == null ? "" : markup).trim();
  if (source === "") return { error: "Paste some SVG markup first." };
  const encoded = encodeURIComponent(source)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return {
    dataUri: `data:image/svg+xml;charset=utf-8,${encoded}`,
    characters: encoded.length + 33,
  };
}

/** Human-readable byte size. */
export function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return "—";
  if (value < 1024) return `${Math.round(value)} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Full analysis of a paste: validity, intrinsic size, output size and data URI.
 * @returns {object|{ error:string }}
 */
export function analyzeSvg(markup, { scale = 1 } = {}) {
  const source = String(markup == null ? "" : markup).trim();
  if (source === "") return { error: "Paste some SVG markup to convert." };
  if (!SVG_ROOT_RE.test(source)) {
    return { error: "That does not look like SVG — the markup has no <svg> element." };
  }
  if (!/<\/svg\s*>/i.test(source)) {
    return { error: "The <svg> element is never closed — paste the whole file." };
  }

  const dimensions = parseSvgDimensions(source);
  if (dimensions.error) return { error: dimensions.error };

  const output = computeOutputSize({
    width: dimensions.width,
    height: dimensions.height,
    scale,
  });
  if (output.error) return { error: output.error };

  const sanitized = sanitizeSvg(source);
  const uri = svgToDataUri(sanitized.cleaned);
  if (uri.error) return { error: uri.error };

  return {
    intrinsicWidth: Math.round(dimensions.width * 100) / 100,
    intrinsicHeight: Math.round(dimensions.height * 100) / 100,
    dimensionSource: dimensions.source,
    hasViewBox: Boolean(dimensions.viewBox),
    aspectRatio: Math.round((dimensions.width / dimensions.height) * 1000) / 1000,
    outputWidth: output.width,
    outputHeight: output.height,
    pixels: output.pixels,
    canvasBytes: output.bytes,
    scale: output.scale,
    markupCharacters: source.length,
    removedScripts: sanitized.removedScripts,
    removedHandlers: sanitized.removedHandlers,
    cleanedMarkup: sanitized.cleaned,
    dataUri: uri.dataUri,
    warnings: svgWarnings(source),
  };
}
