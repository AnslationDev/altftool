/**
 * Logo-against-background legibility maths.
 *
 * Everything here is built on the WCAG 2.1 relative luminance and contrast
 * ratio definitions. Pure functions only: no DOM, no React, no Date.now().
 */

/**
 * WCAG 2.1 SC 1.4.11 Non-text Contrast: graphical objects needed to understand
 * the content must reach 3:1 against adjacent colour. A logo placed on a
 * surface is the case this tool measures.
 */
export const NON_TEXT_MIN_RATIO = 3;

/** WCAG 2.1 SC 1.4.3 Contrast (Minimum) for body text. */
export const TEXT_AA_MIN_RATIO = 4.5;

/** SC 1.4.3 for large text: 18pt, or 14pt bold (about 24px / 18.66px bold). */
export const LARGE_TEXT_AA_MIN_RATIO = 3;

/** SC 1.4.6 Contrast (Enhanced), AAA level for body text. */
export const TEXT_AAA_MIN_RATIO = 7;

/** The highest ratio sRGB allows: pure white against pure black. */
export const MAX_RATIO = 21;

/**
 * Reference surfaces to test against. Stored as RGB triples so no colour
 * literal is hard-coded into markup.
 */
export const STANDARD_BACKGROUNDS = Object.freeze([
  { id: "white", name: "Paper white", rgb: [255, 255, 255] },
  { id: "surface", name: "Light surface", rgb: [244, 244, 245] },
  { id: "lightgrey", name: "Light grey", rgb: [212, 212, 216] },
  { id: "midgrey", name: "Mid grey", rgb: [113, 113, 122] },
  { id: "slate", name: "Dark slate", rgb: [39, 39, 42] },
  { id: "black", name: "Pure black", rgb: [0, 0, 0] },
]);

/** Scrim colours normally laid over a photo behind a logo. */
export const SCRIM_BLACK = Object.freeze([0, 0, 0]);
export const SCRIM_WHITE = Object.freeze([255, 255, 255]);

const clamp255 = (value) => Math.min(255, Math.max(0, value));

/**
 * WCAG 2.1 relative luminance of an sRGB colour.
 * L = 0.2126 R + 0.7152 G + 0.0722 B over linearised channels.
 */
export function relativeLuminance(rgb) {
  if (!Array.isArray(rgb) || rgb.length < 3) return 0;
  const channel = (value) => {
    const c = clamp255(Number(value) || 0) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

/** WCAG 2.1 contrast ratio: (lighter + 0.05) / (darker + 0.05). */
export function contrastFromLuminance(la, lb) {
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG 2.1 contrast ratio between two sRGB colours. */
export function contrastRatio(rgbA, rgbB) {
  return contrastFromLuminance(relativeLuminance(rgbA), relativeLuminance(rgbB));
}

/** Parse #rgb, #rrggbb or a bare 3/6 digit hex string. Returns null if invalid. */
export function hexToRgb(input) {
  if (typeof input !== "string") return null;
  const cleaned = input.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) return null;
  if (cleaned.length === 3) {
    return [0, 1, 2].map((i) => parseInt(cleaned[i] + cleaned[i], 16));
  }
  if (cleaned.length === 6) {
    return [0, 2, 4].map((i) => parseInt(cleaned.slice(i, i + 2), 16));
  }
  return null;
}

/** Format an RGB triple as a lowercase 6-digit hex string with a leading hash. */
export function rgbToHex(rgb) {
  if (!Array.isArray(rgb) || rgb.length < 3) return "";
  const hex = rgb
    .slice(0, 3)
    .map((value) => Math.round(clamp255(Number(value) || 0)).toString(16).padStart(2, "0"))
    .join("");
  return String.fromCharCode(35) + hex;
}

/** Composite an opaque scrim colour over a background at a given alpha. */
export function compositeOver(backgroundRgb, scrimRgb, alpha) {
  const a = Math.min(1, Math.max(0, Number(alpha) || 0));
  return [0, 1, 2].map((i) => backgroundRgb[i] * (1 - a) + scrimRgb[i] * a);
}

/**
 * Smallest scrim opacity that lifts the logo to the target contrast ratio.
 *
 * Contrast is monotonic in alpha for a scrim that moves the background away
 * from the logo's luminance, so a bisection converges quickly and exactly.
 *
 * @returns {{ opacity: number, achievable: boolean, ratio: number }}
 */
export function requiredScrimOpacity({
  logoRgb,
  backgroundRgb,
  scrimRgb = SCRIM_BLACK,
  targetRatio = NON_TEXT_MIN_RATIO,
  steps = 40,
} = {}) {
  if (!Array.isArray(logoRgb) || !Array.isArray(backgroundRgb) || !Array.isArray(scrimRgb)) {
    return { opacity: 0, achievable: false, ratio: 0 };
  }
  const target = Number(targetRatio);
  if (!Number.isFinite(target) || target < 1) {
    return { opacity: 0, achievable: false, ratio: 0 };
  }
  const logoL = relativeLuminance(logoRgb);
  const ratioAt = (alpha) => contrastFromLuminance(logoL, relativeLuminance(compositeOver(backgroundRgb, scrimRgb, alpha)));

  if (ratioAt(0) >= target) return { opacity: 0, achievable: true, ratio: ratioAt(0) };
  if (ratioAt(1) < target) return { opacity: 1, achievable: false, ratio: ratioAt(1) };

  let low = 0;
  let high = 1;
  for (let i = 0; i < steps; i += 1) {
    const mid = (low + high) / 2;
    if (ratioAt(mid) >= target) high = mid;
    else low = mid;
  }
  return { opacity: high, achievable: true, ratio: ratioAt(high) };
}

function gradeRatio(ratio) {
  if (ratio >= TEXT_AAA_MIN_RATIO) return "AAA text";
  if (ratio >= TEXT_AA_MIN_RATIO) return "AA text";
  if (ratio >= NON_TEXT_MIN_RATIO) return "AA graphics";
  return "fails";
}

/**
 * Test a logo colour against a list of background colours.
 *
 * @param {object} input
 * @param {string} input.logoHex
 * @param {Array<{id:string,name:string,rgb:number[]}>} [input.backgrounds]
 * @param {number} [input.targetRatio]
 * @returns {object} report, or { error } for unusable input.
 */
export function testLogoOnBackgrounds({
  logoHex = "",
  backgrounds = STANDARD_BACKGROUNDS,
  targetRatio = NON_TEXT_MIN_RATIO,
} = {}) {
  const logoRgb = hexToRgb(logoHex);
  if (!logoRgb) {
    return { error: "Enter the logo colour as a 3 or 6 digit hex value, for example 14b8a6." };
  }
  const target = Number(targetRatio);
  if (!Number.isFinite(target) || target < 1 || target > MAX_RATIO) {
    return { error: `Target contrast ratio must be between 1 and ${MAX_RATIO}.` };
  }
  const list = Array.isArray(backgrounds) ? backgrounds.filter((bg) => Array.isArray(bg?.rgb)) : [];
  if (list.length === 0) {
    return { error: "Add at least one background colour to test against." };
  }

  const logoLuminance = relativeLuminance(logoRgb);

  const rows = list.map((bg) => {
    const ratio = contrastRatio(logoRgb, bg.rgb);
    const passes = ratio >= target;
    let scrim;
    let scrimIsDark;
    if (passes) {
      scrim = { opacity: 0, achievable: true, ratio };
      scrimIsDark = relativeLuminance(bg.rgb) > logoLuminance;
    } else {
      // The ceiling a scrim can ever reach against this logo is set by how far
      // the logo sits from each extreme (black vs white) — not by which side of
      // the logo the untouched background happens to be on. Try both and keep
      // whichever one actually gets there (or gets closest, if neither does).
      const black = requiredScrimOpacity({
        logoRgb,
        backgroundRgb: bg.rgb,
        scrimRgb: SCRIM_BLACK,
        targetRatio: target,
      });
      const white = requiredScrimOpacity({
        logoRgb,
        backgroundRgb: bg.rgb,
        scrimRgb: SCRIM_WHITE,
        targetRatio: target,
      });
      if (black.achievable && white.achievable) {
        scrimIsDark = black.opacity <= white.opacity;
      } else if (black.achievable) {
        scrimIsDark = true;
      } else if (white.achievable) {
        scrimIsDark = false;
      } else {
        scrimIsDark = black.ratio >= white.ratio;
      }
      scrim = scrimIsDark ? black : white;
    }
    return {
      id: bg.id,
      name: bg.name,
      rgb: bg.rgb,
      hex: rgbToHex(bg.rgb),
      luminance: relativeLuminance(bg.rgb),
      ratio,
      passes,
      grade: gradeRatio(ratio),
      scrimOpacity: scrim.opacity,
      scrimAchievable: scrim.achievable,
      scrimIsDark,
      ratioWithScrim: scrim.ratio,
    };
  });

  const failing = rows.filter((row) => !row.passes);
  const ratios = rows.map((row) => row.ratio);
  const worstRatio = Math.min(...ratios);
  const bestRatio = Math.max(...ratios);
  const worstRow = rows.find((row) => row.ratio === worstRatio) || null;

  const issues = [];
  if (failing.length === rows.length) {
    issues.push({
      level: "error",
      message: `The logo colour misses ${target}:1 on every surface tested. It needs a lighter or darker variant, not just a scrim.`,
    });
  } else if (failing.length > 0) {
    issues.push({
      level: "warning",
      message: `Fails ${target}:1 on ${failing.map((row) => row.name.toLowerCase()).join(", ")}. Ship an alternate colourway or place a scrim behind the mark on those surfaces.`,
    });
  }
  if (failing.some((row) => !row.scrimAchievable)) {
    issues.push({
      level: "error",
      message: "On at least one surface even a fully opaque scrim cannot reach the target - the scrim colour is too close to the logo colour.",
    });
  }
  if (worstRatio < 1.5) {
    issues.push({
      level: "error",
      message: `Worst case is ${worstRatio.toFixed(2)}:1 on ${worstRow ? worstRow.name.toLowerCase() : "one surface"}, which is close to invisible.`,
    });
  }
  if (bestRatio < TEXT_AA_MIN_RATIO) {
    issues.push({
      level: "info",
      message: `Best case is ${bestRatio.toFixed(2)}:1, so any lettering inside the mark stays below the ${TEXT_AA_MIN_RATIO}:1 body-text threshold on every surface tested.`,
    });
  }

  const status = issues.some((issue) => issue.level === "error")
    ? "error"
    : issues.some((issue) => issue.level === "warning")
      ? "warning"
      : "ok";

  return {
    logoRgb,
    logoHex: rgbToHex(logoRgb),
    logoLuminance,
    target,
    rows,
    passCount: rows.length - failing.length,
    failCount: failing.length,
    worstRatio,
    bestRatio,
    worstRow,
    issues,
    status,
  };
}

/** Number of buckets in the luminance histogram used for photo analysis. */
export const HISTOGRAM_BUCKETS = 256;

/**
 * Luminance profile of a photograph, plus how much of it fails against a logo
 * colour. Works from a raw RGBA array so it stays free of the DOM.
 *
 * @param {object} input
 * @param {ArrayLike<number>} input.data - RGBA bytes, 4 per pixel.
 * @param {number} input.width
 * @param {number} input.height
 * @param {number[]} input.logoRgb
 * @param {number} [input.targetRatio]
 * @returns {object} profile, or { error }.
 */
export function photoContrastProfile({
  data,
  width,
  height,
  logoRgb,
  targetRatio = NON_TEXT_MIN_RATIO,
} = {}) {
  const w = Math.floor(Number(width));
  const h = Math.floor(Number(height));
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return { error: "Image width and height must be positive whole numbers." };
  }
  if (!data || typeof data.length !== "number" || data.length < w * h * 4) {
    return { error: "Pixel data is shorter than the stated width and height." };
  }
  if (!Array.isArray(logoRgb) || logoRgb.length < 3) {
    return { error: "A logo colour is needed before a photo can be scored." };
  }
  const target = Number(targetRatio);
  if (!Number.isFinite(target) || target < 1) {
    return { error: "Target contrast ratio must be at least 1." };
  }

  // Luminance for every 8-bit grey level, so each pixel is one table lookup.
  const levelLuminance = new Float64Array(HISTOGRAM_BUCKETS);
  for (let i = 0; i < HISTOGRAM_BUCKETS; i += 1) {
    levelLuminance[i] = relativeLuminance([i, i, i]);
  }

  const pixels = w * h;
  const histogram = new Float64Array(HISTOGRAM_BUCKETS);
  let sumL = 0;
  let minL = 1;
  let maxL = 0;

  for (let i = 0; i < pixels; i += 1) {
    const o = i * 4;
    const l = relativeLuminance([data[o], data[o + 1], data[o + 2]]);
    sumL += l;
    if (l < minL) minL = l;
    if (l > maxL) maxL = l;
    // Bucket by the grey level whose luminance is closest, using the inverse
    // of the sRGB transfer function rather than a linear split.
    const encoded = l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055;
    const bucket = Math.min(HISTOGRAM_BUCKETS - 1, Math.max(0, Math.round(encoded * (HISTOGRAM_BUCKETS - 1))));
    histogram[bucket] += 1;
  }

  const logoL = relativeLuminance(logoRgb);
  let failing = 0;
  let worstRatio = MAX_RATIO;
  for (let i = 0; i < HISTOGRAM_BUCKETS; i += 1) {
    const count = histogram[i];
    if (count === 0) continue;
    const ratio = contrastFromLuminance(logoL, levelLuminance[i]);
    if (ratio < target) failing += count;
    if (ratio < worstRatio) worstRatio = ratio;
  }

  const percentile = (fraction) => {
    const wanted = fraction * pixels;
    let running = 0;
    for (let i = 0; i < HISTOGRAM_BUCKETS; i += 1) {
      running += histogram[i];
      if (running >= wanted) return levelLuminance[i];
    }
    return levelLuminance[HISTOGRAM_BUCKETS - 1];
  };

  const p05 = percentile(0.05);
  const p95 = percentile(0.95);

  return {
    pixels,
    meanLuminance: sumL / pixels,
    minLuminance: minL,
    maxLuminance: maxL,
    p05Luminance: p05,
    p95Luminance: p95,
    ratioAtP05: contrastFromLuminance(logoL, p05),
    ratioAtP95: contrastFromLuminance(logoL, p95),
    worstRatio,
    failingShare: failing / pixels,
    passingShare: 1 - failing / pixels,
    target,
  };
}
