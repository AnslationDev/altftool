/**
 * Favicon legibility maths.
 *
 * Two independent measurements:
 *   1. Geometry - how thick a stroke and how tall a letter become once the
 *      logo is contained inside a 16, 32, 48 or 180 pixel square.
 *   2. Detail retention - how much edge energy survives the downscale, taken
 *      from raw RGBA pixel arrays the caller has already rasterised.
 *
 * Pure functions only: plain arrays in, plain objects out. No DOM, no React.
 */

/**
 * The sizes a favicon is actually rendered at:
 *   16  - classic browser tab and bookmark bar at 1x
 *   32  - browser tab on a 2x display, Windows taskbar and shortcut
 *   48  - Windows site icon stored inside a multi-resolution .ico
 *   180 - apple-touch-icon.png used by iOS for a home-screen shortcut
 */
export const FAVICON_SIZES = Object.freeze([16, 32, 48, 180]);

/**
 * A stroke thinner than one device pixel cannot be drawn solidly: the
 * rasteriser spreads it across neighbouring pixels and it fades to a grey
 * smear instead of a line.
 */
export const MIN_RENDERED_STROKE_PX = 1;

/** Below about 1.5 device pixels a stroke is drawn but reads as soft and washed out. */
export const COMFORTABLE_STROKE_PX = 1.5;

/**
 * Cap height below roughly 7 device pixels destroys the features that tell
 * letterforms apart, which is why favicons use a monogram or a mark rather
 * than a wordmark.
 */
export const MIN_LEGIBLE_GLYPH_PX = 7;

/** Edge energy retained after the downscale, as a share of the reference render. */
export const EDGE_RETENTION_GOOD = 0.6;
export const EDGE_RETENTION_RISK = 0.35;

/** The reference size the small renders are compared against. */
export const REFERENCE_SIZE = 256;

/**
 * WCAG 2.1 relative luminance for an sRGB colour.
 * L = 0.2126 R + 0.7152 G + 0.0722 B over linearised channels.
 */
export function relativeLuminance(r, g, b) {
  const channel = (value) => {
    const c = Math.min(255, Math.max(0, value)) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Composite one straight-alpha pixel over an opaque backdrop. */
function compositeChannel(value, alpha, backdrop) {
  return value * alpha + backdrop * (1 - alpha);
}

/**
 * Statistics for a rasterised RGBA image.
 *
 * @param {object} input
 * @param {ArrayLike<number>} input.data - RGBA bytes, 4 per pixel, row major.
 * @param {number} input.width
 * @param {number} input.height
 * @param {[number,number,number]} [input.backdrop] - what transparency sits on.
 * @returns {object} stats, or { error } when the array does not describe an image.
 */
export function imageStats({ data, width, height, backdrop = [255, 255, 255] } = {}) {
  const w = Math.floor(Number(width));
  const h = Math.floor(Number(height));
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return { error: "Image width and height must be positive whole numbers." };
  }
  if (!data || typeof data.length !== "number" || data.length < w * h * 4) {
    return { error: "Pixel data is shorter than the stated width and height." };
  }

  const pixels = w * h;
  const lum = new Float64Array(pixels);
  let opaqueCount = 0;
  let sum = 0;

  for (let i = 0; i < pixels; i += 1) {
    const o = i * 4;
    const alpha = data[o + 3] / 255;
    if (alpha >= 0.5) opaqueCount += 1;
    const value = relativeLuminance(
      compositeChannel(data[o], alpha, backdrop[0]),
      compositeChannel(data[o + 1], alpha, backdrop[1]),
      compositeChannel(data[o + 2], alpha, backdrop[2]),
    );
    lum[i] = value;
    sum += value;
  }

  const meanLuminance = sum / pixels;
  let variance = 0;
  for (let i = 0; i < pixels; i += 1) {
    const diff = lum[i] - meanLuminance;
    variance += diff * diff;
  }
  variance /= pixels;

  let edgeSum = 0;
  let edgeCount = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = y * w + x;
      if (x + 1 < w) {
        edgeSum += Math.abs(lum[i] - lum[i + 1]);
        edgeCount += 1;
      }
      if (y + 1 < h) {
        edgeSum += Math.abs(lum[i] - lum[i + w]);
        edgeCount += 1;
      }
    }
  }

  return {
    width: w,
    height: h,
    pixels,
    meanLuminance,
    luminanceStdDev: Math.sqrt(variance),
    edgeEnergy: edgeCount > 0 ? edgeSum / edgeCount : 0,
    opaqueShare: opaqueCount / pixels,
  };
}

/**
 * How much of the reference render's edge detail survived the downscale.
 * @returns {{ ratio: number, comparable: boolean }}
 */
export function detailRetention(referenceStats, smallStats) {
  const ref = referenceStats && referenceStats.edgeEnergy;
  const small = smallStats && smallStats.edgeEnergy;
  if (!Number.isFinite(ref) || !Number.isFinite(small) || ref <= 0) {
    return { ratio: 0, comparable: false };
  }
  return { ratio: Math.max(0, Math.min(1, small / ref)), comparable: true };
}

function strokeVerdict(px) {
  if (px >= COMFORTABLE_STROKE_PX) return "reads";
  if (px >= MIN_RENDERED_STROKE_PX) return "at risk";
  return "lost";
}

function textVerdict(px) {
  if (px >= MIN_LEGIBLE_GLYPH_PX + 3) return "reads";
  if (px >= MIN_LEGIBLE_GLYPH_PX) return "at risk";
  return "lost";
}

function retentionVerdict(ratio) {
  if (ratio >= EDGE_RETENTION_GOOD) return "reads";
  if (ratio >= EDGE_RETENTION_RISK) return "at risk";
  return "lost";
}

const RANK = { reads: 0, "at risk": 1, lost: 2 };

function worstOf(verdicts) {
  return verdicts.reduce((worst, current) => (RANK[current] > RANK[worst] ? current : worst), "reads");
}

/**
 * Evaluate a logo at every favicon size.
 *
 * @param {object} input
 * @param {number} input.sourceWidth  - artwork width in pixels.
 * @param {number} input.sourceHeight - artwork height in pixels.
 * @param {number} input.thinnestStrokePx - thinnest line or gap in the artwork.
 * @param {number} [input.smallestTextHeightPx] - cap height of the smallest lettering; 0 if the mark has no text.
 * @param {number[]} [input.sizes]
 * @param {Record<number, number>} [input.retentionBySize] - measured edge retention per size.
 * @returns {object} report, or { error } for input that cannot be measured.
 */
export function evaluateFavicon({
  sourceWidth,
  sourceHeight,
  thinnestStrokePx,
  smallestTextHeightPx = 0,
  sizes = FAVICON_SIZES,
  retentionBySize = null,
} = {}) {
  const w = Number(sourceWidth);
  const h = Number(sourceHeight);
  const stroke = Number(thinnestStrokePx);
  const text = Number(smallestTextHeightPx);

  if (![w, h, stroke, text].every((value) => Number.isFinite(value))) {
    return { error: "Enter a number in every measurement field." };
  }
  if (w <= 0 || h <= 0) return { error: "Artwork width and height must be greater than zero." };
  if (stroke <= 0) return { error: "Thinnest stroke must be greater than zero pixels." };
  if (text < 0) return { error: "Text height cannot be negative." };
  const longEdge = Math.max(w, h);
  if (stroke > longEdge) {
    return { error: "The thinnest stroke cannot be wider than the artwork itself." };
  }
  if (text > longEdge) {
    return { error: "Text height cannot be taller than the artwork itself." };
  }
  const sizeList = (Array.isArray(sizes) ? sizes : [])
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);
  if (sizeList.length === 0) return { error: "Pick at least one favicon size to test." };

  const hasText = text > 0;
  const rows = sizeList.map((size) => {
    // Favicons contain the whole mark inside a square, so the long edge sets the scale.
    const scale = size / longEdge;
    const renderedStroke = stroke * scale;
    const renderedText = hasText ? text * scale : 0;
    const sVerdict = strokeVerdict(renderedStroke);
    const tVerdict = hasText ? textVerdict(renderedText) : null;

    const measured = retentionBySize && Number.isFinite(Number(retentionBySize[size]))
      ? Math.max(0, Math.min(1, Number(retentionBySize[size])))
      : null;
    const rVerdict = measured === null ? null : retentionVerdict(measured);

    const verdicts = [sVerdict];
    if (tVerdict) verdicts.push(tVerdict);
    if (rVerdict) verdicts.push(rVerdict);

    return {
      size,
      scale,
      renderedStroke,
      renderedText,
      strokeVerdict: sVerdict,
      textVerdict: tVerdict,
      retention: measured,
      retentionVerdict: rVerdict,
      verdict: worstOf(verdicts),
    };
  });

  const passing = rows.filter((row) => row.verdict === "reads");
  const smallestReadable = passing.length > 0 ? Math.min(...passing.map((row) => row.size)) : null;

  // Smallest artwork stroke that would clear the comfortable threshold at the
  // smallest requested size.
  const smallestSize = Math.min(...sizeList);
  const requiredStrokeAtSource = (COMFORTABLE_STROKE_PX * longEdge) / smallestSize;
  const maxTextAtSource = (MIN_LEGIBLE_GLYPH_PX * longEdge) / smallestSize;

  const aspectRatio = w / h;
  const isSquare = Math.abs(aspectRatio - 1) < 0.01;

  const issues = [];
  if (!isSquare) {
    issues.push({
      level: "warning",
      message: `Artwork is ${aspectRatio > 1 ? "wider" : "taller"} than it is square (${w} x ${h}). A favicon is a square, so the mark is scaled to its long edge and loses ${Math.round(Math.abs(1 - Math.min(w, h) / longEdge) * 100)}% of the box on the short axis.`,
    });
  }
  if (rows.some((row) => row.strokeVerdict === "lost")) {
    issues.push({
      level: "error",
      message: `The thinnest stroke drops below one device pixel at ${rows.filter((row) => row.strokeVerdict === "lost").map((row) => `${row.size}px`).join(", ")}. Thicken it to at least ${requiredStrokeAtSource.toFixed(0)}px in the artwork or ship a simplified mark for the small sizes.`,
    });
  }
  if (hasText && rows.some((row) => row.textVerdict === "lost")) {
    issues.push({
      level: "error",
      message: `Lettering falls under ${MIN_LEGIBLE_GLYPH_PX}px of cap height at ${rows.filter((row) => row.textVerdict === "lost").map((row) => `${row.size}px`).join(", ")}. Replace the wordmark with a monogram: text only survives ${smallestSize}px if it is at least ${maxTextAtSource.toFixed(0)}px tall in the artwork.`,
    });
  }
  if (rows.some((row) => row.retentionVerdict === "lost")) {
    issues.push({
      level: "error",
      message: "The downscaled render keeps less than a third of the original edge detail - the shapes are merging into a blur.",
    });
  } else if (rows.some((row) => row.retentionVerdict === "at risk")) {
    issues.push({
      level: "warning",
      message: "Edge detail is thinning noticeably at the small sizes. Compare the previews side by side before shipping.",
    });
  }
  if (smallestReadable === null) {
    issues.push({
      level: "error",
      message: "The mark does not read cleanly at any of the selected sizes. It needs a dedicated small-size variant.",
    });
  } else if (smallestReadable > Math.min(...sizeList)) {
    issues.push({
      level: "warning",
      message: `The mark only holds together from ${smallestReadable}px upward. Draw a simplified version for anything smaller.`,
    });
  }

  const status = issues.some((issue) => issue.level === "error")
    ? "error"
    : issues.some((issue) => issue.level === "warning")
      ? "warning"
      : "ok";

  return {
    rows,
    smallestReadable,
    requiredStrokeAtSource,
    maxTextAtSource,
    longEdge,
    aspectRatio,
    isSquare,
    hasText,
    issues,
    status,
  };
}
