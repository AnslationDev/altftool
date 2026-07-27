/**
 * Minimal Vibe Font Pairing — pair table, modular type scale and line-length
 * (measure) maths. Pure module: no React, no DOM, no clock.
 */

const SANS_FALLBACK = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/**
 * Six pairings built from open-licence families available on Google Fonts.
 * "Minimal" here means low stroke contrast, near-neutral proportions and a
 * heading face that differs from the body only in width or weight, not mood.
 */
export const PAIRS = [
  {
    id: "inter-plex",
    name: "Inter + IBM Plex Sans",
    heading: { family: "Inter", weight: 600, stack: `"Inter", ${SANS_FALLBACK}` },
    body: { family: "IBM Plex Sans", weight: 400, stack: `"IBM Plex Sans", ${SANS_FALLBACK}` },
    why: "Inter's tall x-height carries a heading at small sizes; Plex Sans adds slightly warmer body text without changing the temperature of the page.",
  },
  {
    id: "space-inter",
    name: "Space Grotesk + Inter",
    heading: { family: "Space Grotesk", weight: 500, stack: `"Space Grotesk", ${SANS_FALLBACK}` },
    body: { family: "Inter", weight: 400, stack: `"Inter", ${SANS_FALLBACK}` },
    why: "Space Grotesk's clipped terminals give headings a quiet technical edge while Inter keeps long copy completely neutral.",
  },
  {
    id: "dm-karla",
    name: "DM Sans + Karla",
    heading: { family: "DM Sans", weight: 700, stack: `"DM Sans", ${SANS_FALLBACK}` },
    body: { family: "Karla", weight: 400, stack: `"Karla", ${SANS_FALLBACK}` },
    why: "Geometric headings over a grotesque body. Karla's slightly squarer bowls stop the page reading as generic.",
  },
  {
    id: "work-source",
    name: "Work Sans + Source Sans 3",
    heading: { family: "Work Sans", weight: 600, stack: `"Work Sans", ${SANS_FALLBACK}` },
    body: { family: "Source Sans 3", weight: 400, stack: `"Source Sans 3", ${SANS_FALLBACK}` },
    why: "A workhorse combination for documentation and long-form pages; Source Sans 3 stays readable down to 14 px.",
  },
  {
    id: "manrope-inter",
    name: "Manrope + Inter",
    heading: { family: "Manrope", weight: 700, stack: `"Manrope", ${SANS_FALLBACK}` },
    body: { family: "Inter", weight: 400, stack: `"Inter", ${SANS_FALLBACK}` },
    why: "Manrope's semi-rounded joins soften a bold headline without becoming friendly; a common product-marketing pairing.",
  },
  {
    id: "archivo-public",
    name: "Archivo + Public Sans",
    heading: { family: "Archivo", weight: 600, stack: `"Archivo", ${SANS_FALLBACK}` },
    body: { family: "Public Sans", weight: 400, stack: `"Public Sans", ${SANS_FALLBACK}` },
    why: "Both descend from American gothic models, so they share skeletons — the pair looks intentional rather than accidental.",
  },
];

/** Classic modular-scale ratios used in typographic systems. */
export const RATIOS = [
  { id: "minor-second", label: "Minor second", value: 1.067 },
  { id: "major-second", label: "Major second", value: 1.125 },
  { id: "minor-third", label: "Minor third", value: 1.2 },
  { id: "major-third", label: "Major third", value: 1.25 },
  { id: "perfect-fourth", label: "Perfect fourth", value: 1.333 },
  { id: "augmented-fourth", label: "Augmented fourth", value: 1.414 },
  { id: "golden", label: "Golden ratio", value: 1.618 },
];

/**
 * Average advance width of running lowercase Latin text is close to half the
 * em in a humanist or neo-grotesque sans. Typographers use this 0.5em figure
 * to convert a target measure (characters per line) into a column width.
 */
export const AVG_CHAR_WIDTH_EM = 0.5;

/** Bringhurst's comfortable measure for a single-column text setting. */
export const MEASURE_MIN = 45;
export const MEASURE_IDEAL = 66;
export const MEASURE_MAX = 75;

/** WCAG 2.2 success criterion 1.4.12 asks for at least 1.5x line height in blocks of text. */
export const WCAG_MIN_LINE_HEIGHT = 1.5;

/** Below this size, screen text stops being comfortable for continuous reading. */
export const MIN_BODY_SIZE_PX = 14;

const isPositive = (value) => Number.isFinite(value) && value > 0;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/**
 * Modular scale: each step multiplies the previous one by the ratio.
 * Returns sizes in px and rem (assuming a 16 px root, the CSS default).
 */
export const ROOT_FONT_SIZE_PX = 16;

export function buildTypeScale({ base, ratio, stepsUp = 5, stepsDown = 2 }) {
  if (!isPositive(base)) return { error: "Base font size must be greater than zero." };
  if (!isPositive(ratio) || ratio < 1 || ratio > 3) {
    return { error: "Scale ratio should be between 1 and 3 — 1.25 and 1.333 are the usual choices." };
  }
  const up = Math.min(10, Math.max(0, Math.round(stepsUp)));
  const down = Math.min(5, Math.max(0, Math.round(stepsDown)));

  const steps = [];
  for (let i = -down; i <= up; i += 1) {
    const px = base * Math.pow(ratio, i);
    steps.push({
      step: i,
      name: i === 0 ? "step-0 (body)" : `step-${i > 0 ? "+" : ""}${i}`,
      px: Math.round(px * 100) / 100,
      rem: Math.round((px / ROOT_FONT_SIZE_PX) * 1000) / 1000,
    });
  }
  return { steps, base, ratio };
}

/** Column width in px that produces a given measure at a given font size. */
export function measureToWidthPx({ fontSizePx, charsPerLine }) {
  if (!isPositive(fontSizePx)) return { error: "Font size must be greater than zero." };
  if (!isPositive(charsPerLine)) return { error: "Characters per line must be greater than zero." };
  return { widthPx: fontSizePx * AVG_CHAR_WIDTH_EM * charsPerLine };
}

/** Measure (characters per line) produced by a given column width. */
export function widthToMeasure({ fontSizePx, widthPx }) {
  if (!isPositive(fontSizePx)) return { error: "Font size must be greater than zero." };
  if (!isPositive(widthPx)) return { error: "Column width must be greater than zero." };
  const chars = widthPx / (fontSizePx * AVG_CHAR_WIDTH_EM);
  let verdict = "comfortable";
  let note = `About ${Math.round(chars)} characters per line — inside the 45-75 range that reads comfortably.`;
  if (chars < MEASURE_MIN) {
    verdict = "narrow";
    note = `About ${Math.round(chars)} characters per line. Under ${MEASURE_MIN} the eye returns too often and the rag gets ugly.`;
  } else if (chars > MEASURE_MAX) {
    verdict = "wide";
    note = `About ${Math.round(chars)} characters per line. Over ${MEASURE_MAX} readers lose their place returning to the next line.`;
  }
  return { chars, verdict, note };
}

/**
 * Line height recommendation.
 * Body copy starts at the WCAG 1.4.12 floor of 1.5 and opens up as the measure
 * gets longer, because a longer line needs more vertical separation to track.
 * Display sizes (32 px and above) tighten, since leading is proportionally
 * generous once the type is large.
 */
export const DISPLAY_SIZE_PX = 32;

export function recommendLineHeight({ fontSizePx, charsPerLine = MEASURE_IDEAL }) {
  if (!isPositive(fontSizePx)) return { error: "Font size must be greater than zero." };
  if (!isPositive(charsPerLine)) return { error: "Characters per line must be greater than zero." };

  if (fontSizePx >= DISPLAY_SIZE_PX) {
    const value = clamp(WCAG_MIN_LINE_HEIGHT - (fontSizePx - DISPLAY_SIZE_PX) * 0.006, 1.1, WCAG_MIN_LINE_HEIGHT);
    return {
      lineHeight: Math.round(value * 100) / 100,
      kind: "display",
      note: "Large type needs proportionally less leading; tighten as the size grows.",
    };
  }
  const value = clamp(WCAG_MIN_LINE_HEIGHT + (charsPerLine - 60) * 0.006, WCAG_MIN_LINE_HEIGHT, 1.8);
  return {
    lineHeight: Math.round(value * 100) / 100,
    kind: "body",
    note: `At least ${WCAG_MIN_LINE_HEIGHT} for blocks of text (WCAG 2.2, 1.4.12); longer lines need more.`,
  };
}

/** Google Fonts request URL for one pair. */
export function buildFontUrl(pair) {
  if (!pair || !pair.heading || !pair.body) return { error: "Pick a font pair first." };
  const families = [];
  if (pair.heading.family === pair.body.family) {
    families.push(`${pair.heading.family.replace(/ /g, "+")}:wght@${pair.body.weight};${pair.heading.weight}`);
  } else {
    families.push(`${pair.heading.family.replace(/ /g, "+")}:wght@${pair.heading.weight}`);
    families.push(`${pair.body.family.replace(/ /g, "+")}:wght@${pair.body.weight}`);
  }
  return { url: `https://fonts.googleapis.com/css2?family=${families.join("&family=")}&display=swap` };
}

/** Ready-to-paste CSS for a pair, scale and measure. */
export function buildCss({ pair, base, ratio, charsPerLine }) {
  if (!pair) return { error: "Pick a font pair first." };
  const scale = buildTypeScale({ base, ratio });
  if (scale.error) return scale;
  const width = measureToWidthPx({ fontSizePx: base, charsPerLine });
  if (width.error) return width;

  const bodyLh = recommendLineHeight({ fontSizePx: base, charsPerLine });
  if (bodyLh.error) return bodyLh;

  const h1 = scale.steps.find((step) => step.step === 4) || scale.steps[scale.steps.length - 1];
  const h2 = scale.steps.find((step) => step.step === 3) || h1;
  const h3 = scale.steps.find((step) => step.step === 2) || h2;
  const h1Lh = recommendLineHeight({ fontSizePx: h1.px, charsPerLine });
  const h2Lh = recommendLineHeight({ fontSizePx: h2.px, charsPerLine });
  const h3Lh = recommendLineHeight({ fontSizePx: h3.px, charsPerLine });

  const vars = scale.steps
    .map((step) => `  --font-size-${step.step < 0 ? `n${Math.abs(step.step)}` : step.step}: ${step.rem}rem;`)
    .join("\n");

  const css = `:root {
  --font-heading: ${pair.heading.stack};
  --font-body: ${pair.body.stack};
${vars}
  --measure: ${Math.round(width.widthPx / ROOT_FONT_SIZE_PX * 1000) / 1000}rem; /* ~${Math.round(charsPerLine)} characters */
}

body {
  font-family: var(--font-body);
  font-size: var(--font-size-0);
  font-weight: ${pair.body.weight};
  line-height: ${bodyLh.lineHeight};
}

.prose { max-width: var(--measure); }

h1, h2, h3 {
  font-family: var(--font-heading);
  font-weight: ${pair.heading.weight};
  letter-spacing: -0.01em;
}

h1 { font-size: var(--font-size-4); line-height: ${h1Lh.lineHeight}; }
h2 { font-size: var(--font-size-3); line-height: ${h2Lh.lineHeight}; }
h3 { font-size: var(--font-size-2); line-height: ${h3Lh.lineHeight}; }`;

  return { css, scale, widthPx: width.widthPx, bodyLineHeight: bodyLh.lineHeight };
}

/** Everything the page renders, from one call. */
export function buildPairingReport({ pairId, base, ratio, charsPerLine }) {
  const pair = PAIRS.find((item) => item.id === pairId);
  if (!pair) return { error: "Pick one of the minimal font pairs." };
  if (!isPositive(base)) return { error: "Base font size must be greater than zero." };
  if (base < MIN_BODY_SIZE_PX) {
    return { error: `Body text below ${MIN_BODY_SIZE_PX} px is hard to read on screen — raise the base size.` };
  }
  if (base > 32) return { error: "A base body size above 32 px is a display size, not body copy." };

  const scale = buildTypeScale({ base, ratio });
  if (scale.error) return scale;
  const width = measureToWidthPx({ fontSizePx: base, charsPerLine });
  if (width.error) return width;
  const measure = widthToMeasure({ fontSizePx: base, widthPx: width.widthPx });
  if (measure.error) return measure;
  const lineHeight = recommendLineHeight({ fontSizePx: base, charsPerLine });
  if (lineHeight.error) return lineHeight;
  const css = buildCss({ pair, base, ratio, charsPerLine });
  if (css.error) return css;
  const fontUrl = buildFontUrl(pair);

  return { pair, scale, widthPx: width.widthPx, measure, lineHeight, css: css.css, fontUrl: fontUrl.url };
}
