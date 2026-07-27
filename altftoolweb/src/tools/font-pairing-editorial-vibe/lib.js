/**
 * Editorial Vibe Font Pairing — data and typographic maths.
 * Pure module: no React, no DOM, no globals. Same input -> same output.
 */

/**
 * Modular-scale ratios taken from musical intervals. This is the scale system
 * described in Robert Bringhurst, "The Elements of Typographic Style", and
 * popularised by modularscale.com. Each step multiplies the previous size.
 */
export const TYPE_SCALE_RATIOS = [
  { id: "minor-third", label: "Minor third", ratio: 1.2 },
  { id: "major-third", label: "Major third", ratio: 1.25 },
  { id: "perfect-fourth", label: "Perfect fourth", ratio: 1.3333 },
  { id: "augmented-fourth", label: "Augmented fourth", ratio: 1.4142 },
  { id: "perfect-fifth", label: "Perfect fifth", ratio: 1.5 },
  { id: "golden", label: "Golden ratio", ratio: 1.618 },
];

/**
 * Average advance width of running lowercase Latin text, in em.
 * Used only to estimate characters per line — these are per-classification
 * approximations, not exported font metrics. Monospaced faces are the one
 * exact case: almost all of them ship a 600/1000-unit fixed advance = 0.6em.
 */
export const AVG_CHAR_WIDTH_EM = {
  oldstyleSerif: 0.48,
  transitionalSerif: 0.49,
  didoneSerif: 0.46,
  slabSerif: 0.52,
  humanistSans: 0.5,
  grotesqueSans: 0.5,
  geometricSans: 0.52,
  condensedSans: 0.42,
  monospace: 0.6,
};

/**
 * Bringhurst's guideline for a single column of continuous text:
 * 45-75 characters per line, with 66 as the classic target.
 */
export const MEASURE_MIN_CPL = 45;
export const MEASURE_IDEAL_CPL = 66;
export const MEASURE_MAX_CPL = 75;

/**
 * Practical leading heuristic (a house rule, not a published standard):
 * a longer line needs a larger vertical step so the eye can find the next
 * line. Anchored at 1.5 for the 66-character ideal measure.
 */
const LEADING_AT_IDEAL_MEASURE = 1.5;
const LEADING_PER_EXTRA_CHAR = 0.004;
const LEADING_MIN = 1.35;
const LEADING_MAX = 1.75;

/**
 * Practical display-leading heuristic: optical leading tightens as type grows.
 * 1.4 at 16px, falling 0.0075 per extra pixel, never below 1.0.
 */
const HEADING_LEADING_AT_16PX = 1.4;
const HEADING_LEADING_SLOPE_PER_PX = 0.0075;
const HEADING_LEADING_MIN = 1.0;

/** CSS rem values in this tool assume the browser default root size of 16px. */
export const ROOT_FONT_PX = 16;

/** Steps of the scale that get rendered, relative to the body size. */
export const SCALE_STEPS = [-1, 0, 1, 2, 3, 4, 5];

export const EDITORIAL_PAIRINGS = [
  {
    id: "playfair-source-sans",
    label: "Masthead classic",
    heading: {
      family: "Playfair Display",
      klass: "didoneSerif",
      weight: 700,
      google: "Playfair+Display:wght@400;700;900",
      stack: '"Playfair Display", "Times New Roman", Georgia, serif',
    },
    body: {
      family: "Source Sans 3",
      klass: "humanistSans",
      weight: 400,
      google: "Source+Sans+3:ital,wght@0,400;0,600;1,400",
      stack: '"Source Sans 3", "Helvetica Neue", Arial, sans-serif',
    },
    note: "High-contrast Didone headline over a neutral humanist sans. The thin hairlines want large sizes — set the headline at step 4 or above or the contrast disappears.",
  },
  {
    id: "libre-baskerville-franklin",
    label: "Long-read serif",
    heading: {
      family: "Libre Franklin",
      klass: "grotesqueSans",
      weight: 800,
      google: "Libre+Franklin:wght@400;700;800",
      stack: '"Libre Franklin", "Helvetica Neue", Arial, sans-serif',
    },
    body: {
      family: "Libre Baskerville",
      klass: "transitionalSerif",
      weight: 400,
      google: "Libre+Baskerville:ital,wght@0,400;0,700;1,400",
      stack: '"Libre Baskerville", Baskerville, Georgia, serif',
    },
    note: "Inverted pairing: sans headline, serif text. Libre Baskerville has a large x-height and was drawn for screens, so it holds up at 17-19px.",
  },
  {
    id: "bodoni-lora",
    label: "Fashion feature",
    heading: {
      family: "Bodoni Moda",
      klass: "didoneSerif",
      weight: 700,
      google: "Bodoni+Moda:ital,wght@0,400;0,700;1,400",
      stack: '"Bodoni Moda", Didot, "Times New Roman", serif',
    },
    body: {
      family: "Lora",
      klass: "transitionalSerif",
      weight: 400,
      google: "Lora:ital,wght@0,400;0,600;1,400",
      stack: "Lora, Georgia, serif",
    },
    note: "Two serifs held apart by contrast, not by classification. Bodoni Moda is an optical-size variable family, so it stays readable when you push it large.",
  },
  {
    id: "newsreader-public-sans",
    label: "News desk",
    heading: {
      family: "Newsreader",
      klass: "oldstyleSerif",
      weight: 600,
      google: "Newsreader:ital,wght@0,400;0,600;1,400",
      stack: "Newsreader, Georgia, serif",
    },
    body: {
      family: "Public Sans",
      klass: "grotesqueSans",
      weight: 400,
      google: "Public+Sans:ital,wght@0,400;0,600;1,400",
      stack: '"Public Sans", "Helvetica Neue", Arial, sans-serif',
    },
    note: "Newsreader was drawn for screen news headlines and keeps its colour at small sizes, so decks and standfirsts can share the headline face.",
  },
  {
    id: "frank-ruhl-karla",
    label: "Culture section",
    heading: {
      family: "Frank Ruhl Libre",
      klass: "transitionalSerif",
      weight: 700,
      google: "Frank+Ruhl+Libre:wght@400;700;900",
      stack: '"Frank Ruhl Libre", Georgia, serif',
    },
    body: {
      family: "Karla",
      klass: "grotesqueSans",
      weight: 400,
      google: "Karla:ital,wght@0,400;0,600;1,400",
      stack: "Karla, Arial, sans-serif",
    },
    note: "Frank Ruhl Libre covers Latin and Hebrew from one family, useful for bilingual mastheads. Karla's slightly quirky grotesque keeps the body from feeling corporate.",
  },
  {
    id: "spectral-inter",
    label: "Essay",
    heading: {
      family: "Spectral",
      klass: "oldstyleSerif",
      weight: 600,
      google: "Spectral:ital,wght@0,400;0,600;1,400",
      stack: "Spectral, Georgia, serif",
    },
    body: {
      family: "Inter",
      klass: "grotesqueSans",
      weight: 400,
      google: "Inter:wght@400;500;700",
      stack: "Inter, system-ui, -apple-system, Arial, sans-serif",
    },
    note: "Spectral was commissioned for screen reading and has a generous x-height. Inter's tall x-height matches it, so switching between the two does not look like a size change.",
  },
  {
    id: "cormorant-proza",
    label: "Slow journalism",
    heading: {
      family: "Cormorant Garamond",
      klass: "oldstyleSerif",
      widthEm: 0.44,
      weight: 600,
      google: "Cormorant+Garamond:ital,wght@0,400;0,600;1,400",
      stack: '"Cormorant Garamond", Garamond, Georgia, serif',
    },
    body: {
      family: "Proza Libre",
      klass: "humanistSans",
      weight: 400,
      google: "Proza+Libre:ital,wght@0,400;0,600;1,400",
      stack: '"Proza Libre", "Helvetica Neue", Arial, sans-serif',
    },
    note: "Cormorant Garamond is narrow with a small x-height and fine strokes — treat it as display only, from about step 3 upward, and never as body copy.",
  },
  {
    id: "zilla-source-serif",
    label: "Investigative",
    heading: {
      family: "Zilla Slab",
      klass: "slabSerif",
      weight: 700,
      google: "Zilla+Slab:ital,wght@0,400;0,700;1,400",
      stack: '"Zilla Slab", Rockwell, Georgia, serif',
    },
    body: {
      family: "Source Serif 4",
      klass: "transitionalSerif",
      weight: 400,
      google: "Source+Serif+4:ital,wght@0,400;0,600;1,400",
      stack: '"Source Serif 4", "Source Serif Pro", Georgia, serif',
    },
    note: "Slab headline plus a text serif reads as reportage rather than lifestyle. Zilla Slab's flat terminals stay solid in reversed-out white-on-dark decks.",
  },
];

/** Round to a fixed number of decimals without ever returning -0 or NaN. */
function round(value, decimals) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  const result = Math.round(value * factor) / factor;
  return result === 0 ? 0 : result;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Average glyph advance for a face, in em. Falls back to 0.5em. */
export function charWidthEm(face) {
  if (!face) return 0.5;
  if (Number.isFinite(face.widthEm) && face.widthEm > 0) return face.widthEm;
  return AVG_CHAR_WIDTH_EM[face.klass] ?? 0.5;
}

/** Estimated characters per line for a column of given width. */
export function charactersPerLine({ columnPx, fontSizePx, widthEm }) {
  if (!(columnPx > 0) || !(fontSizePx > 0) || !(widthEm > 0)) return 0;
  return columnPx / (fontSizePx * widthEm);
}

/** Unitless body line-height for a given measure, in characters per line. */
export function recommendBodyLineHeight(cpl) {
  if (!(cpl > 0)) return LEADING_AT_IDEAL_MEASURE;
  const raw =
    LEADING_AT_IDEAL_MEASURE + (cpl - MEASURE_IDEAL_CPL) * LEADING_PER_EXTRA_CHAR;
  return round(clamp(raw, LEADING_MIN, LEADING_MAX), 2);
}

/** Unitless line-height for display type at a given pixel size. */
export function recommendHeadingLineHeight(fontSizePx) {
  if (!(fontSizePx > 0)) return HEADING_LEADING_AT_16PX;
  const raw =
    HEADING_LEADING_AT_16PX - (fontSizePx - ROOT_FONT_PX) * HEADING_LEADING_SLOPE_PER_PX;
  return round(Math.max(raw, HEADING_LEADING_MIN), 2);
}

/** Verdict for a measure against the 45-75 character guideline. */
export function measureVerdict(cpl) {
  if (!(cpl > 0)) return { level: "danger", text: "No usable column width." };
  if (cpl < MEASURE_MIN_CPL) {
    return {
      level: "warn",
      text: `Too narrow — under ${MEASURE_MIN_CPL} characters the eye jumps lines too often. Widen the column or drop the body size.`,
    };
  }
  if (cpl > MEASURE_MAX_CPL) {
    return {
      level: "warn",
      text: `Too wide — over ${MEASURE_MAX_CPL} characters readers lose their place returning to the left margin. Narrow the column or raise the body size.`,
    };
  }
  return {
    level: "ok",
    text: `Inside the ${MEASURE_MIN_CPL}-${MEASURE_MAX_CPL} character band for continuous text.`,
  };
}

/**
 * Full editorial layout calculation.
 * Returns { error } for any invalid input instead of a bad number.
 */
export function computeEditorialType({
  pairingId,
  ratioId,
  basePx,
  containerPx,
  columns,
  gutterPx,
  headingStep,
}) {
  const pairing = EDITORIAL_PAIRINGS.find((item) => item.id === pairingId);
  if (!pairing) return { error: "Choose one of the listed pairings." };

  const scale = TYPE_SCALE_RATIOS.find((item) => item.id === ratioId);
  if (!scale) return { error: "Choose one of the listed scale ratios." };

  const base = Number(basePx);
  const container = Number(containerPx);
  const cols = Number(columns);
  const gutter = Number(gutterPx);
  const step = Number(headingStep);

  if (![base, container, cols, gutter, step].every((n) => Number.isFinite(n))) {
    return { error: "Enter a number in every field." };
  }
  if (base < 10 || base > 36) {
    return { error: "Body size should be between 10px and 36px." };
  }
  if (container < 240 || container > 2400) {
    return { error: "Content width should be between 240px and 2400px." };
  }
  if (!Number.isInteger(cols) || cols < 1 || cols > 6) {
    return { error: "Use a whole number of columns between 1 and 6." };
  }
  if (gutter < 0 || gutter > 240) {
    return { error: "Gutter should be between 0px and 240px." };
  }
  if (!Number.isInteger(step) || step < 1 || step > 6) {
    return { error: "Headline step should be a whole number between 1 and 6." };
  }

  const totalGutter = gutter * (cols - 1);
  if (totalGutter >= container) {
    return {
      error: "Gutters use up the whole width — reduce the gutter or the column count.",
    };
  }

  const columnPx = (container - totalGutter) / cols;
  const bodyWidthEm = charWidthEm(pairing.body);
  const cpl = charactersPerLine({ columnPx, fontSizePx: base, widthEm: bodyWidthEm });
  const bodyLineHeight = recommendBodyLineHeight(cpl);

  const headingPx = base * scale.ratio ** step;
  const headingLineHeight = recommendHeadingLineHeight(headingPx);

  const steps = SCALE_STEPS.map((n) => {
    const px = base * scale.ratio ** n;
    return {
      step: n,
      px: round(px, 1),
      rem: round(px / ROOT_FONT_PX, 3),
      lineHeight: n <= 0 ? bodyLineHeight : recommendHeadingLineHeight(px),
      role:
        n < 0 ? "Caption / credit" : n === 0 ? "Body" : n >= 4 ? "Display" : "Subhead",
    };
  });

  /** Width in px needed to hit the ideal 66-character measure at this size. */
  const idealColumnPx = base * bodyWidthEm * MEASURE_IDEAL_CPL;

  return {
    pairing,
    scale,
    basePx: base,
    columnPx: round(columnPx, 1),
    columns: cols,
    gutterPx: gutter,
    charsPerLine: round(cpl, 1),
    bodyLineHeight,
    bodyLeadingPx: round(base * bodyLineHeight, 1),
    headingPx: round(headingPx, 1),
    headingRem: round(headingPx / ROOT_FONT_PX, 3),
    headingLineHeight,
    headingStep: step,
    idealColumnPx: round(idealColumnPx, 0),
    idealColumnRem: round(idealColumnPx / ROOT_FONT_PX, 2),
    verdict: measureVerdict(cpl),
    steps,
  };
}

/** Google Fonts stylesheet URL for a pairing. Pure string building. */
export function googleFontsHref(pairing) {
  if (!pairing) return "";
  const families = [pairing.heading.google, pairing.body.google]
    .filter(Boolean)
    .map((value) => `family=${value}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/** Copy-ready CSS for the calculated pairing. */
export function buildCss(result) {
  if (!result || result.error) return "";
  const { pairing, basePx, bodyLineHeight, headingRem, headingLineHeight } = result;
  return [
    `@import url("${googleFontsHref(pairing)}");`,
    "",
    ":root {",
    `  --font-heading: ${pairing.heading.stack};`,
    `  --font-body: ${pairing.body.stack};`,
    `  --measure: ${result.idealColumnRem}rem; /* ${MEASURE_IDEAL_CPL} characters */`,
    "}",
    "",
    "body {",
    "  font-family: var(--font-body);",
    `  font-size: ${round(basePx / ROOT_FONT_PX, 3)}rem;`,
    `  font-weight: ${pairing.body.weight};`,
    `  line-height: ${bodyLineHeight};`,
    "}",
    "",
    "p {",
    "  max-width: var(--measure);",
    "}",
    "",
    "h1 {",
    "  font-family: var(--font-heading);",
    `  font-size: ${headingRem}rem;`,
    `  font-weight: ${pairing.heading.weight};`,
    `  line-height: ${headingLineHeight};`,
    "}",
    "",
    ...result.steps
      .filter((item) => item.step > 0 && item.step < result.headingStep)
      .reverse()
      .map(
        (item, index) =>
          `h${index + 2} { font-family: var(--font-heading); font-size: ${item.rem}rem; line-height: ${item.lineHeight}; }`,
      ),
  ].join("\n");
}

/** Plain-text summary for the copy button. */
export function buildSummary(result) {
  if (!result || result.error) return "";
  return [
    "Editorial Vibe Font Pairing",
    `Headings: ${result.pairing.heading.family} ${result.pairing.heading.weight}`,
    `Body: ${result.pairing.body.family} ${result.pairing.body.weight}`,
    `Scale: ${result.scale.label} (${result.scale.ratio})`,
    `Body size: ${result.basePx}px / line-height ${result.bodyLineHeight} (${result.bodyLeadingPx}px)`,
    `Headline: ${result.headingPx}px at step ${result.headingStep} / line-height ${result.headingLineHeight}`,
    `Column width: ${result.columnPx}px across ${result.columns} column(s)`,
    `Measure: ${result.charsPerLine} characters per line — ${result.verdict.text}`,
    `Ideal ${MEASURE_IDEAL_CPL}-character column at this size: ${result.idealColumnPx}px`,
  ].join("\n");
}
