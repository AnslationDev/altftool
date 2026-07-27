/**
 * Email Newsletter Banner Maker — pure sizing, retina, contrast and dark-mode maths.
 * No React, no DOM. The page component paints the plan and prints the HTML snippet.
 */

/**
 * 600 CSS pixels is the long-standing safe content width for HTML email: it is
 * what the Outlook desktop rendering area and most template frameworks assume.
 * 560 leaves room for padding inside a 600 px table; 640 suits modern-only lists.
 */
export const EMAIL_CONTENT_WIDTHS = [
  { id: "w560", name: "560 px (inside 600 px table padding)", cssWidth: 560 },
  { id: "w600", name: "600 px (standard email width)", cssWidth: 600 },
  { id: "w640", name: "640 px (modern clients only)", cssWidth: 640 },
];

/** Banner proportions, expressed as width:height. */
export const BANNER_RATIOS = [
  { id: "r2", name: "2:1 (tall hero)", ratio: 2 },
  { id: "r3", name: "3:1 (standard header)", ratio: 3 },
  { id: "r4", name: "4:1 (slim strip)", ratio: 4 },
];

/**
 * Export at 2x and declare the 1x size in the width attribute. 3x is not worth
 * it in email: the file roughly doubles again for no visible gain at reading
 * distance, and several clients cap the decoded image size.
 */
export const RETINA_SCALES = [1, 2, 3];
export const DEFAULT_RETINA_SCALE = 2;

/** Gmail clips a message once the HTML part passes 102 KB and hides the rest behind "View entire message". */
export const GMAIL_CLIP_BYTES = 102 * 1024;

/** A newsletter header above this weight noticeably delays first paint on mobile data. */
export const HEADER_WEIGHT_BUDGET_BYTES = 200 * 1024;

/** Canvas colours the banner is pasted onto in the two client modes. */
export const LIGHT_CLIENT_BG = { h: 0, s: 0, l: 100 };
export const DARK_CLIENT_BG = { h: 220, s: 12, l: 11 };

/** WCAG 2.1 thresholds. */
export const WCAG_NORMAL_TEXT_RATIO = 4.5;
export const WCAG_LARGE_TEXT_RATIO = 3;

/**
 * A banner whose background sits within this contrast ratio of the client
 * canvas blends into the message instead of reading as a pasted slab.
 */
export const SEAMLESS_RATIO_LIMIT = 1.6;

/**
 * Relative luminance above which a banner background counts as "light".
 * 0.5 is the midpoint of the WCAG luminance scale; clients do not invert image
 * pixels, so anything above it stays bright inside a dark-mode message.
 */
export const BRIGHT_BANNER_LUMINANCE = 0.5;

export const THEMES = [
  { id: "ink", name: "Ink", bg: { h: 222, s: 40, l: 16 }, ink: { h: 0, s: 0, l: 100 }, accent: { h: 172, s: 66, l: 46 } },
  { id: "teal", name: "Teal", bg: { h: 174, s: 62, l: 24 }, ink: { h: 0, s: 0, l: 100 }, accent: { h: 46, s: 92, l: 62 } },
  { id: "cream", name: "Cream", bg: { h: 40, s: 46, l: 92 }, ink: { h: 28, s: 40, l: 16 }, accent: { h: 12, s: 74, l: 48 } },
  { id: "midgrey", name: "Mid grey", bg: { h: 220, s: 8, l: 46 }, ink: { h: 0, s: 0, l: 100 }, accent: { h: 200, s: 80, l: 70 } },
  { id: "plum", name: "Plum", bg: { h: 300, s: 36, l: 22 }, ink: { h: 0, s: 0, l: 100 }, accent: { h: 330, s: 76, l: 68 } },
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

/** Greedy word wrap with an injected width measurer, so the function stays pure. */
export function wrapText(text, maxWidth, measure) {
  const words = String(text ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (!(maxWidth > 0) || typeof measure !== "function") return [words.join(" ")];
  const lines = [];
  let current = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${current} ${words[i]}`;
    if (measure(candidate) <= maxWidth) current = candidate;
    else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

/** Shrink-to-fit headline sizing. */
export function fitHeadline({ text, maxWidth, maxHeight, startSize, minSize, lineHeightRatio, measureAt }) {
  const start = Number(startSize);
  const floor = Number(minSize);
  if (!(start > 0) || !(floor > 0) || typeof measureAt !== "function") {
    return { fontSize: Number.isFinite(start) ? Math.max(0, start) : 0, lines: [String(text ?? "")] };
  }
  let sizeValue = start;
  let lines = [];
  while (sizeValue >= floor) {
    lines = wrapText(text, maxWidth, (candidate) => measureAt(candidate, sizeValue));
    const blockHeight = lines.length * sizeValue * lineHeightRatio;
    const widest = lines.reduce((max, line) => Math.max(max, measureAt(line, sizeValue)), 0);
    if (blockHeight <= maxHeight && widest <= maxWidth) break;
    sizeValue -= 1;
  }
  return { fontSize: Math.max(floor, sizeValue), lines };
}

/**
 * Retina export sizing: draw at scale x the CSS size, declare the CSS size in
 * the width attribute so the client downsamples rather than upscales.
 */
export function computeRetinaExport({ cssWidth, cssHeight, scale = DEFAULT_RETINA_SCALE }) {
  const w = Number(cssWidth);
  const h = Number(cssHeight);
  const k = Number(scale);
  if (!(w > 0) || !(h > 0)) return { error: "Banner width and height must be greater than zero." };
  if (!(k >= 1)) return { error: "Pixel-density scale must be 1 or more." };
  return {
    cssWidth: Math.round(w),
    cssHeight: Math.round(h),
    scale: k,
    exportWidth: Math.round(w * k),
    exportHeight: Math.round(h * k),
    pixelCount: Math.round(w * k) * Math.round(h * k),
  };
}

/**
 * How the banner sits on a light and on a dark client canvas.
 * Email clients do not invert image pixels, so a light banner stays light on a
 * dark background; the seam ratio says how much it will read as a pasted slab.
 */
export function assessDarkMode(bannerBg) {
  if (!bannerBg || typeof bannerBg !== "object") return { error: "Provide the banner background colour." };
  const bg = hslToRgb(bannerBg);
  const luminance = relativeLuminance(bg);
  const lightSeam = contrastRatio(bg, hslToRgb(LIGHT_CLIENT_BG));
  const darkSeam = contrastRatio(bg, hslToRgb(DARK_CLIENT_BG));
  const brightOnDark = luminance > BRIGHT_BANNER_LUMINANCE && darkSeam > SEAMLESS_RATIO_LIMIT;

  let verdict;
  if (brightOnDark) {
    verdict = `Light background glares as a bright slab in dark-mode clients (${darkSeam.toFixed(2)}:1 against the dark canvas). Use a mid-tone or dark background instead.`;
  } else if (darkSeam <= SEAMLESS_RATIO_LIMIT) {
    verdict = "Blends into a dark-mode client and reads as a deliberate dark hero on a light one.";
  } else {
    verdict = "Sits as a distinct block on both canvases — normal for a mid-tone hero, just keep the padding consistent.";
  }

  return {
    luminance,
    lightSeam,
    darkSeam,
    darkModeSafe: !brightOnDark,
    seamlessOnDark: darkSeam <= SEAMLESS_RATIO_LIMIT,
    verdict,
  };
}

/** The <img> markup that makes a 2x export render sharply and scale on mobile. */
export function buildImgTag({ exportWidth, cssWidth, cssHeight, alt, fileName }) {
  const w = Number(cssWidth);
  const h = Number(cssHeight);
  if (!(w > 0) || !(h > 0)) return { error: "Banner width and height must be greater than zero." };
  const altText = String(alt ?? "").trim();
  const src = String(fileName ?? "banner.png").trim() || "banner.png";
  const html = [
    `<img src="https://your-cdn.example.com/${src}"`,
    `     width="${Math.round(w)}" height="${Math.round(h)}"`,
    `     alt="${altText.replace(/"/g, "&quot;")}"`,
    `     style="display:block;width:100%;max-width:${Math.round(w)}px;height:auto;border:0;outline:none;text-decoration:none;" />`,
  ].join("\n");
  return {
    html,
    bytes: new TextEncoder().encode(html).length,
    naturalWidth: Math.round(Number(exportWidth) || w),
    altMissing: altText.length === 0,
  };
}

/** Full banner plan: layout geometry, contrast, retina sizing and warnings. */
export function buildBannerPlan({
  widthId = "w600",
  ratioId = "r3",
  scale = DEFAULT_RETINA_SCALE,
  themeId = "ink",
  headline = "",
  kicker = "",
  cta = "",
  alt = "",
} = {}) {
  const widthPreset = EMAIL_CONTENT_WIDTHS.find((entry) => entry.id === widthId) ?? EMAIL_CONTENT_WIDTHS[1];
  const ratioPreset = BANNER_RATIOS.find((entry) => entry.id === ratioId) ?? BANNER_RATIOS[1];
  const theme = THEMES.find((entry) => entry.id === themeId) ?? THEMES[0];

  if (!String(headline).trim()) {
    return { error: "Enter a headline so there is something to lay out." };
  }

  const cssWidth = widthPreset.cssWidth;
  const cssHeight = Math.round(cssWidth / ratioPreset.ratio);
  const retina = computeRetinaExport({ cssWidth, cssHeight, scale });
  if (retina.error) return { error: retina.error };

  // Padding is 6% of the banner width, which keeps type clear of the rounded
  // corners some clients apply and of the table cell border.
  const padding = Math.round(retina.exportWidth * 0.06);
  const column = retina.exportWidth - padding * 2;

  const headlineStart = Math.round(retina.exportHeight * 0.26);
  const headlineMin = Math.round(retina.exportHeight * 0.12);
  const kickerFont = Math.round(retina.exportHeight * 0.09);
  const ctaFont = Math.round(retina.exportHeight * 0.1);

  const textContrast = contrastRatio(hslToRgb(theme.ink), hslToRgb(theme.bg));
  const accentContrast = contrastRatio(hslToRgb(theme.accent), hslToRgb(theme.bg));
  const darkMode = assessDarkMode(theme.bg);
  if (darkMode.error) return { error: darkMode.error };

  const tag = buildImgTag({
    exportWidth: retina.exportWidth,
    cssWidth,
    cssHeight,
    alt,
    fileName: "newsletter-banner.png",
  });
  if (tag.error) return { error: tag.error };

  const warnings = [];
  if (textContrast < WCAG_LARGE_TEXT_RATIO) {
    warnings.push(
      `Headline contrast is ${textContrast.toFixed(2)}:1 — below the ${WCAG_LARGE_TEXT_RATIO}:1 WCAG asks for on large text.`,
    );
  }
  if (String(cta).trim() && accentContrast < WCAG_NORMAL_TEXT_RATIO) {
    warnings.push(
      `Accent text contrast is ${accentContrast.toFixed(2)}:1 — below the ${WCAG_NORMAL_TEXT_RATIO}:1 needed for small text.`,
    );
  }
  if (!darkMode.darkModeSafe) warnings.push(darkMode.verdict);
  if (tag.altMissing) {
    warnings.push("No alt text. Many clients block images by default, so the header would render as an empty box.");
  }
  if (Number(scale) > 2) {
    warnings.push("3x doubles the file weight again for no visible gain at email reading distance; 2x is the usual ceiling.");
  }

  return {
    widthPreset,
    ratioPreset,
    theme,
    cssWidth,
    cssHeight,
    retina,
    padding,
    column,
    headline: {
      text: String(headline).trim(),
      startSize: headlineStart,
      minSize: headlineMin,
      lineHeightRatio: 1.12,
      maxWidth: column,
      maxHeight: retina.exportHeight * 0.5,
    },
    kicker: { text: String(kicker).trim(), fontSize: kickerFont },
    cta: { text: String(cta).trim(), fontSize: ctaFont },
    textContrast,
    accentContrast,
    darkMode,
    imgTag: tag,
    warnings,
  };
}

/** Weight verdict for the exported image plus the Gmail clipping context. */
export function checkWeight({ bytes, htmlBytes = 0 }) {
  const size = Number(bytes);
  const html = Number(htmlBytes);
  if (!(size >= 0)) return { error: "File size must be zero or more." };
  if (!(html >= 0)) return { error: "HTML size must be zero or more." };
  return {
    bytes: size,
    withinBudget: size <= HEADER_WEIGHT_BUDGET_BYTES,
    budget: HEADER_WEIGHT_BUDGET_BYTES,
    htmlBytes: html,
    gmailHeadroomBytes: GMAIL_CLIP_BYTES - html,
    note:
      size <= HEADER_WEIGHT_BUDGET_BYTES
        ? `Within the ${Math.round(HEADER_WEIGHT_BUDGET_BYTES / 1024)} KB header budget.`
        : `Over the ${Math.round(HEADER_WEIGHT_BUDGET_BYTES / 1024)} KB header budget — export as JPEG or drop to 1.5x.`,
  };
}
