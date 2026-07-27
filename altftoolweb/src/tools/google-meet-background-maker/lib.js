/**
 * Google Meet Background Maker — pure sizing, blur and edge-keying maths.
 * No React, no DOM. The page component paints the plan this module returns.
 */

/**
 * Google Meet custom background image requirements.
 * Meet accepts JPG and PNG, asks for at least 1280x720 px, works best at
 * 1920x1080 in 16:9, and rejects uploads above 16 MB.
 */
export const MEET_BACKGROUND_SPEC = {
  aspectW: 16,
  aspectH: 9,
  recommended: { width: 1920, height: 1080 },
  minimum: { width: 1280, height: 720 },
  maxUploadBytes: 16 * 1024 * 1024,
};

export const EXPORT_PRESETS = [
  { id: "hd", name: "1920 x 1080 (Meet recommended)", width: 1920, height: 1080 },
  { id: "hd720", name: "1280 x 720 (Meet minimum)", width: 1280, height: 720 },
  { id: "qhd", name: "2560 x 1440 (high-DPI displays)", width: 2560, height: 1440 },
];

/**
 * Browser-side selfie segmentation (the MediaPipe-style model Meet uses to cut
 * you out of your real room) runs on a small fixed-size input: 256x144 for the
 * landscape variant. Anything finer than one mask cell cannot be represented in
 * the mask, which is where halo and flicker on the silhouette come from.
 */
export const SEGMENTATION_MASK = { width: 256, height: 144 };

/**
 * Nyquist: a detail has to span at least two samples to be represented, so a
 * background feature must be blurred across two mask cells to stop aliasing on
 * the cut-out edge.
 */
export const NYQUIST_SAMPLES = 2;

/** Background patterns, with the spatial-detail weight used by the keying score. */
export const TEXTURES = [
  { id: "flat", name: "Flat colour", complexity: 0 },
  { id: "gradient", name: "Soft gradient", complexity: 0.15 },
  { id: "orbs", name: "Blurred orbs", complexity: 0.35 },
  { id: "dots", name: "Dot grid", complexity: 0.6 },
  { id: "stripes", name: "Diagonal stripes", complexity: 0.9 },
];

/** Weights of the edge-keying heuristic. They sum to 1. */
export const KEYING_WEIGHTS = { blur: 0.45, contrast: 0.35, texture: 0.2 };

/** Band edges of the keying score, from clean cut-out to visible halo. */
export const KEYING_BANDS = [
  { min: 80, label: "Clean edges", tone: "success" },
  { min: 60, label: "Usable", tone: "warn" },
  { min: 0, label: "Halo risk", tone: "danger" },
];

/** Share of frame width the subject's silhouette sweeps through on a webcam. */
export const SUBJECT_BAND_SHARE = 0.44;

export const THEMES = [
  { id: "office", name: "Warm office", from: { h: 28, s: 32, l: 88 }, to: { h: 24, s: 26, l: 66 }, ink: { h: 24, s: 30, l: 16 } },
  { id: "navy", name: "Deep navy", from: { h: 220, s: 44, l: 16 }, to: { h: 214, s: 40, l: 30 }, ink: { h: 0, s: 0, l: 100 } },
  { id: "sage", name: "Sage studio", from: { h: 150, s: 22, l: 76 }, to: { h: 156, s: 20, l: 54 }, ink: { h: 155, s: 30, l: 12 } },
  { id: "graphite", name: "Graphite", from: { h: 0, s: 0, l: 20 }, to: { h: 0, s: 0, l: 34 }, ink: { h: 0, s: 0, l: 100 } },
  { id: "blush", name: "Blush", from: { h: 348, s: 44, l: 88 }, to: { h: 342, s: 36, l: 70 }, ink: { h: 340, s: 32, l: 16 } },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** HSL -> [r, g, b] in 0-255. */
export function hslToRgb({ h, s, l }) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const sat = clamp(Number(s), 0, 100) / 100;
  const lig = clamp(Number(l), 0, 100) / 100;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  const seg = Math.floor(hue / 60) % 6;
  const table = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][seg];
  return table.map((channel) => Math.round((channel + m) * 255));
}

/** CSS hsl() string for canvas fillStyle. */
export function hslCss({ h, s, l }, alpha = 1) {
  const a = clamp(Number(alpha), 0, 1);
  const base = `hsl(${((Number(h) % 360) + 360) % 360} ${clamp(Number(s), 0, 100)}% ${clamp(Number(l), 0, 100)}%`;
  return a >= 1 ? `${base})` : `${base} / ${a})`;
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance([r, g, b]) {
  const lin = [r, g, b].map((raw) => {
    const c = clamp(Number(raw), 0, 255) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** WCAG 2.1 contrast ratio. */
export function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Linear RGB-space interpolation between two HSL stops at position t (0-1). */
export function sampleGradientRgb(from, to, t) {
  const a = hslToRgb(from);
  const b = hslToRgb(to);
  const k = clamp(Number(t) || 0, 0, 1);
  return a.map((channel, index) => Math.round(channel + (b[index] - channel) * k));
}

/**
 * One segmentation-mask cell expressed in export pixels, plus the blur radius
 * needed to push background detail below what the mask can resolve.
 */
export function computeMaskDetail({ width, height }) {
  const w = Number(width);
  const h = Number(height);
  if (!(w > 0) || !(h > 0)) return { error: "Background dimensions must be greater than zero." };
  const featureWidthPx = w / SEGMENTATION_MASK.width;
  const featureHeightPx = h / SEGMENTATION_MASK.height;
  return {
    featureWidthPx,
    featureHeightPx,
    recommendedBlurPx: Math.round(featureWidthPx * NYQUIST_SAMPLES * 10) / 10,
  };
}

/**
 * Edge-keying index (0-100). A transparent weighted heuristic, not a Google
 * metric: how far the blur goes toward the mask-resolution target, how calm the
 * background contrast is behind the silhouette, and how busy the pattern is.
 */
export function computeKeyingScore({ blurPx, recommendedBlurPx, bandContrast, textureComplexity }) {
  const blur = Number(blurPx);
  const target = Number(recommendedBlurPx);
  const contrast = Number(bandContrast);
  const complexity = Number(textureComplexity);
  if (!(target > 0)) return { error: "Recommended blur must be greater than zero." };
  if (!(blur >= 0) || !(contrast >= 1) || !(complexity >= 0)) {
    return { error: "Blur, contrast and complexity must be zero or more." };
  }

  const blurAdequacy = clamp(blur / target, 0, 1);
  // A contrast ratio of 1 across the silhouette band is perfectly calm; 7:1 or
  // more is a hard light-to-dark edge that the mask will visibly tear on.
  const contrastCalm = clamp(1 - (contrast - 1) / 6, 0, 1);
  const textureCalm = clamp(1 - complexity, 0, 1);
  const score = Math.round(
    100 * (KEYING_WEIGHTS.blur * blurAdequacy + KEYING_WEIGHTS.contrast * contrastCalm + KEYING_WEIGHTS.texture * textureCalm),
  );
  const band = KEYING_BANDS.find((entry) => score >= entry.min) ?? KEYING_BANDS[KEYING_BANDS.length - 1];
  return { score, band, blurAdequacy, contrastCalm, textureCalm };
}

/** Full plan: sizing, blur, keying score and text placement. */
export function buildMeetPlan({
  width = MEET_BACKGROUND_SPEC.recommended.width,
  height = MEET_BACKGROUND_SPEC.recommended.height,
  themeId = "office",
  textureId = "gradient",
  blurPx = null,
  caption = "",
  captionSide = "right",
} = {}) {
  const w = Math.round(Number(width));
  const h = Math.round(Number(height));
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return { error: "Enter a background width and height greater than zero." };
  }
  if (w < MEET_BACKGROUND_SPEC.minimum.width || h < MEET_BACKGROUND_SPEC.minimum.height) {
    return {
      error: `Google Meet needs at least ${MEET_BACKGROUND_SPEC.minimum.width}x${MEET_BACKGROUND_SPEC.minimum.height} px.`,
    };
  }

  const theme = THEMES.find((entry) => entry.id === themeId) ?? THEMES[0];
  const texture = TEXTURES.find((entry) => entry.id === textureId) ?? TEXTURES[1];
  const detail = computeMaskDetail({ width: w, height: h });
  if (detail.error) return { error: detail.error };

  const blur = blurPx === null || blurPx === undefined ? detail.recommendedBlurPx : Number(blurPx);
  if (!(blur >= 0)) return { error: "Blur radius cannot be negative." };
  if (blur > w / 4) return { error: "A blur wider than a quarter of the frame erases the artwork." };

  // Silhouette band: the middle SUBJECT_BAND_SHARE of the frame width, which is
  // where the cut-out edge lands on a normally framed webcam.
  const bandStart = (1 - SUBJECT_BAND_SHARE) / 2;
  const bandEnd = bandStart + SUBJECT_BAND_SHARE;
  const bandContrast = contrastRatio(
    sampleGradientRgb(theme.from, theme.to, bandStart),
    sampleGradientRgb(theme.from, theme.to, bandEnd),
  );

  const keying = computeKeyingScore({
    blurPx: blur,
    recommendedBlurPx: detail.recommendedBlurPx,
    bandContrast,
    textureComplexity: texture.complexity,
  });
  if (keying.error) return { error: keying.error };

  const margin = Math.round(Math.min(w, h) * 0.06);
  const captionText = String(caption).trim();
  const captionFont = Math.round(h * 0.045);
  const captionContrast = contrastRatio(hslToRgb(theme.ink), hslToRgb(theme.to));

  const warnings = [];
  if (blur < detail.recommendedBlurPx) {
    warnings.push(
      `Blur is ${blur} px; ${detail.recommendedBlurPx} px is the radius that pushes detail below one ${SEGMENTATION_MASK.width}x${SEGMENTATION_MASK.height} mask cell, so edges may shimmer.`,
    );
  }
  if (texture.complexity >= 0.6) {
    warnings.push(`${texture.name} adds hard repeating edges right where the cut-out line falls — expect visible halo.`);
  }
  if (captionText && captionContrast < 4.5) {
    warnings.push(`Caption contrast is ${captionContrast.toFixed(2)}:1, below the 4.5:1 WCAG asks for on normal text.`);
  }
  if (Math.abs(w / h - MEET_BACKGROUND_SPEC.aspectW / MEET_BACKGROUND_SPEC.aspectH) > 0.01) {
    warnings.push("Aspect ratio is not 16:9, so Meet will crop the image to fit your camera frame.");
  }

  return {
    width: w,
    height: h,
    theme,
    texture,
    blurPx: blur,
    detail,
    bandContrast,
    bandStart,
    bandEnd,
    keying,
    margin,
    caption: captionText,
    captionFont,
    captionSide: captionSide === "left" ? "left" : "right",
    captionContrast,
    aspect: `${(w / h).toFixed(2)}:1`,
    warnings,
  };
}

/** Check an exported file against Meet's upload limits. */
export function checkUpload({ width, height, bytes }) {
  const w = Number(width);
  const h = Number(height);
  const size = Number(bytes);
  if (!(w > 0) || !(h > 0)) return { error: "Export dimensions must be positive." };
  if (!(size >= 0)) return { error: "File size must be zero or more." };
  const checks = [
    {
      label: `At least ${MEET_BACKGROUND_SPEC.minimum.width}x${MEET_BACKGROUND_SPEC.minimum.height} px`,
      pass: w >= MEET_BACKGROUND_SPEC.minimum.width && h >= MEET_BACKGROUND_SPEC.minimum.height,
    },
    {
      label: "16:9 aspect ratio",
      pass: Math.abs(w / h - MEET_BACKGROUND_SPEC.aspectW / MEET_BACKGROUND_SPEC.aspectH) < 0.01,
    },
    {
      label: `Under the ${Math.round(MEET_BACKGROUND_SPEC.maxUploadBytes / (1024 * 1024))} MB upload limit`,
      pass: size <= MEET_BACKGROUND_SPEC.maxUploadBytes,
    },
  ];
  return { checks, ready: checks.every((check) => check.pass) };
}
