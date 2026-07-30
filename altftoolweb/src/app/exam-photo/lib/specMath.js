/**
 * Pure maths for the exam photo / signature spec pages.
 *
 * No React, no DOM, no canvas, no Date.now(). The one function that needs an
 * encoder takes it as a callback, so the search itself stays testable in node.
 *
 * The quality search is the same binary search that ships inside
 * src/tools/join-photo-and-signature/components/Main.jsx (compressToTargetKB):
 * seed at 0.85, accept immediately if the seed already lands inside the band,
 * otherwise bisect [0.05, 0.98] eight times keeping the highest quality whose
 * output is still at or under the ceiling. That function is declared inside the
 * component and is not exported, so it could not be imported; this is the same
 * algorithm lifted out into a callback form rather than a second, different one.
 */

/** Seed quality the join-photo-and-signature search starts from. */
export const SEED_QUALITY = 0.85;
/** Lower bound of the JPEG quality search (same as the source implementation). */
export const MIN_QUALITY = 0.05;
/** Upper bound of the JPEG quality search (same as the source implementation). */
export const MAX_QUALITY = 0.98;
/** Bisection steps. 8 steps narrows [0.05, 0.98] to about 0.004 of quality. */
export const SEARCH_ITERATIONS = 8;
/** Bytes per KB as every exam notice means it (binary kilobyte). */
export const BYTES_PER_KB = 1024;
/** Base64 encodes 3 bytes into 4 characters. */
export const BASE64_BYTES_PER_CHAR = 3 / 4;
/** Scan resolution used to turn a cm/mm box printed in a notice into pixels
 *  when the notice prints no pixel figure of its own. 100 DPI is the floor RRB
 *  CEN 08/2024 and the IBPS/SBI scanning annexures both specify. */
export const DEFAULT_SCAN_DPI = 100;
/** 1 inch = 25.4 mm, the definition used to turn a mm/cm box into pixels. */
export const MM_PER_INCH = 25.4;
/** Longest edge the tool will render when a notice prints no pixel size, so an
 *  unconstrained upload cannot produce an absurd canvas. */
export const MAX_FREE_EDGE_PX = 1600;

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Convert a physical box printed in a notice into pixels at a scan resolution.
 * Returns { error } rather than NaN for non-positive or absurd input.
 */
export function physicalToPixels({ width, height, unit = "cm", dpi = 100 } = {}) {
  if (!isFiniteNumber(width) || !isFiniteNumber(height) || width <= 0 || height <= 0) {
    return { error: "Physical size must be two positive numbers." };
  }
  if (!isFiniteNumber(dpi) || dpi <= 0) {
    return { error: "Scan resolution must be a positive number of dots per inch." };
  }
  const mmPerUnit = unit === "mm" ? 1 : unit === "cm" ? 10 : null;
  if (mmPerUnit === null) {
    return { error: `Unsupported unit "${unit}". Use "cm" or "mm".` };
  }
  const toPx = (value) => Math.round((value * mmPerUnit * dpi) / MM_PER_INCH);
  const pxWidth = toPx(width);
  const pxHeight = toPx(height);
  if (pxWidth < 1 || pxHeight < 1) {
    return { error: "That box is smaller than one pixel at the given resolution." };
  }
  return { width: pxWidth, height: pxHeight, dpi, source: "derived" };
}

/**
 * The canvas size the resizer should use for one asset in the preset table.
 * Order of preference: pixel figure printed in the notice, then a pixel figure
 * derived from the notice's cm/mm box, then the source image's own size capped
 * to MAX_FREE_EDGE_PX when the notice prints neither.
 */
export function resolveTargetPixels(asset, source = {}, dpi = 100) {
  if (!asset || typeof asset !== "object") {
    return { error: "No asset was selected." };
  }
  if (asset.pixels && isFiniteNumber(asset.pixels.width) && isFiniteNumber(asset.pixels.height)) {
    return { width: asset.pixels.width, height: asset.pixels.height, source: "stated" };
  }
  if (isFiniteNumber(asset.longEdgePx) && asset.longEdgePx > 0) {
    const srcW = source.width;
    const srcH = source.height;
    if (!isFiniteNumber(srcW) || !isFiniteNumber(srcH) || srcW <= 0 || srcH <= 0) {
      return { width: null, height: null, source: "long-edge" };
    }
    const scale = asset.longEdgePx / Math.max(srcW, srcH);
    return {
      width: Math.max(1, Math.round(srcW * scale)),
      height: Math.max(1, Math.round(srcH * scale)),
      source: "long-edge",
    };
  }
  if (asset.physical) {
    const derived = physicalToPixels({ ...asset.physical, dpi });
    if (derived.error) return derived;
    return derived;
  }
  const srcWidth = source.width;
  const srcHeight = source.height;
  if (!isFiniteNumber(srcWidth) || !isFiniteNumber(srcHeight) || srcWidth <= 0 || srcHeight <= 0) {
    return { width: null, height: null, source: "unconstrained" };
  }
  const longest = Math.max(srcWidth, srcHeight);
  const scale = longest > MAX_FREE_EDGE_PX ? MAX_FREE_EDGE_PX / longest : 1;
  return {
    width: Math.max(1, Math.round(srcWidth * scale)),
    height: Math.max(1, Math.round(srcHeight * scale)),
    source: "unconstrained",
  };
}

/**
 * Letterbox the source inside the target box without cropping or distorting it.
 */
export function fitContain({ srcWidth, srcHeight, boxWidth, boxHeight } = {}) {
  const values = [srcWidth, srcHeight, boxWidth, boxHeight];
  if (values.some((value) => !isFiniteNumber(value) || value <= 0)) {
    return { error: "Image and target box must both have a positive width and height." };
  }
  const scale = Math.min(boxWidth / srcWidth, boxHeight / srcHeight);
  const width = Math.max(1, Math.round(srcWidth * scale));
  const height = Math.max(1, Math.round(srcHeight * scale));
  return {
    width,
    height,
    offsetX: Math.round((boxWidth - width) / 2),
    offsetY: Math.round((boxHeight - height) / 2),
    scale,
  };
}

/** Size in KB of a base64 data URL, using the same 3/4 ratio as the source tool. */
export function dataUrlSizeKB(dataUrl) {
  if (typeof dataUrl !== "string" || !dataUrl.includes(",")) {
    return { error: "That is not an encoded image." };
  }
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  if (!base64.length) return { error: "The encoder returned an empty image." };
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const bytes = base64.length * BASE64_BYTES_PER_CHAR - padding;
  return { sizeKB: Math.round(bytes / BYTES_PER_KB), bytes: Math.round(bytes) };
}

/**
 * Binary search for the JPEG quality whose encoded size lands inside [minKB, maxKB].
 * `encode` is `(quality: number) => dataUrl: string`.
 */
export function searchQualityForTargetKB({ encode, minKB, maxKB, iterations = SEARCH_ITERATIONS } = {}) {
  if (typeof encode !== "function") {
    return { error: "No encoder was supplied." };
  }
  if (!isFiniteNumber(minKB) || !isFiniteNumber(maxKB) || minKB < 0 || maxKB <= 0) {
    return { error: "The KB target must be two positive numbers." };
  }
  if (minKB > maxKB) {
    return { error: "The smallest allowed size cannot be larger than the largest allowed size." };
  }
  if (!isFiniteNumber(iterations) || iterations < 1 || iterations > 32) {
    return { error: "Search steps must be between 1 and 32." };
  }

  const measure = (quality) => {
    const dataUrl = encode(quality);
    const measured = dataUrlSizeKB(dataUrl);
    if (measured.error) return { error: measured.error };
    return { dataUrl, sizeKB: measured.sizeKB, quality };
  };

  const seed = measure(SEED_QUALITY);
  if (seed.error) return seed;
  if (seed.sizeKB <= maxKB && seed.sizeKB >= minKB) {
    return { ...seed, withinTarget: true, underMinimum: false, steps: 1 };
  }

  let low = MIN_QUALITY;
  let high = MAX_QUALITY;
  let best = seed;
  let steps = 1;

  for (let i = 0; i < iterations; i += 1) {
    const mid = (low + high) / 2;
    const attempt = measure(mid);
    if (attempt.error) return attempt;
    steps += 1;
    if (attempt.sizeKB <= maxKB) {
      best = attempt;
      low = mid;
    } else {
      high = mid;
    }
  }

  if (best.sizeKB > maxKB) {
    // Even the lowest quality in the band is still over the ceiling.
    const floor = measure(MIN_QUALITY);
    if (floor.error) return floor;
    steps += 1;
    best = floor;
  }

  return {
    ...best,
    withinTarget: best.sizeKB <= maxKB && best.sizeKB >= minKB,
    underMinimum: best.sizeKB < minKB,
    steps,
  };
}

/**
 * Check an encoded result against one row of the preset table.
 * Returns a list of pass/fail checks so the page can show exactly which rule
 * a file breaks, instead of a bare "invalid".
 */
export function auditAgainstSpec({ sizeKB, width, height, asset, target } = {}) {
  if (!asset || typeof asset !== "object") {
    return { error: "No asset was selected." };
  }
  if (!isFiniteNumber(sizeKB) || sizeKB < 0) {
    return { error: "No encoded file size to check yet." };
  }
  const checks = [];

  const hasCeiling = isFiniteNumber(asset.maxKB);
  const hasFloor = isFiniteNumber(asset.minKB);
  if (hasCeiling) {
    checks.push({
      id: "max-kb",
      label: `At or under ${asset.maxKB} KB`,
      ok: sizeKB <= asset.maxKB,
      detail: `File is ${sizeKB} KB.`,
    });
  }
  if (hasFloor) {
    checks.push({
      id: "min-kb",
      label: `At or over ${asset.minKB} KB`,
      ok: sizeKB >= asset.minKB,
      detail:
        sizeKB >= asset.minKB
          ? `File is ${sizeKB} KB.`
          : `File is ${sizeKB} KB, which is ${asset.minKB - sizeKB} KB under the floor the notice sets.`,
    });
  }

  if (target && isFiniteNumber(target.width) && isFiniteNumber(target.height)) {
    const matches = width === target.width && height === target.height;
    checks.push({
      id: "pixels",
      label: `${target.width} x ${target.height} px`,
      ok: matches,
      detail: matches
        ? "Canvas matches the size in the notice."
        : `Canvas is ${width} x ${height} px.`,
    });
  }

  return { checks, ok: checks.every((check) => check.ok) };
}

/** Dimension phrase only, built from the table. Never invents a figure. */
export function describeDimensions(asset, target) {
  if (!asset || typeof asset !== "object") return "";
  if (target && isFiniteNumber(target.width) && isFiniteNumber(target.height)) {
    if (target.source === "derived" && asset.physical) {
      return `${target.width} x ${target.height} px, derived from the ${asset.physical.width} x ${asset.physical.height} ${asset.physical.unit} box in the notice at ${target.dpi} DPI`;
    }
    // A floor is not a target. RRB NTPC prints 140 x 60 px as a minimum, and
    // a cell that drops the qualifier tells a candidate to hit it exactly.
    return `${asset.pixelsAreMinimum ? "at least " : ""}${target.width} x ${target.height} px`;
  }
  if (asset.statedPixels) return asset.statedPixels;
  if (isFiniteNumber(asset.longEdgePx)) return `${asset.longEdgePx} px on the long edge`;
  if (asset.physical) {
    return `${asset.physical.width} x ${asset.physical.height} ${asset.physical.unit}`;
  }
  return "the file's own pixel size, because the notice prints none";
}

/** One-line human description of an asset's target, built from the table only. */
export function describeTarget(asset, target) {
  if (!asset || typeof asset !== "object") return "";
  const parts = [];
  if (asset.format) parts.push(asset.format);
  if (isFiniteNumber(asset.minKB) && isFiniteNumber(asset.maxKB)) {
    parts.push(`${asset.minKB} to ${asset.maxKB} KB`);
  }
  if (target && isFiniteNumber(target.width) && isFiniteNumber(target.height)) {
    const suffix = target.source === "derived" ? " (derived)" : "";
    const floor = asset.pixelsAreMinimum ? "at least " : "";
    parts.push(`${floor}${target.width} x ${target.height} px${suffix}`);
  } else if (asset.statedPixels) {
    parts.push(asset.statedPixels);
  } else if (asset.physical) {
    parts.push(`${asset.physical.width} x ${asset.physical.height} ${asset.physical.unit}`);
  }
  return parts.join(" - ");
}

/** dd Mon yyyy, from an ISO date, without pulling in a date library. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatIsoDate(iso) {
  if (typeof iso !== "string") return "";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, year, month, day] = match;
  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex > 11) return "";
  return `${Number(day)} ${MONTHS[monthIndex]} ${year}`;
}
