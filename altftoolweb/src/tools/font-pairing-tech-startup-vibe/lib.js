/**
 * Tech Startup Font Pairing — data, UI type-scale maths and slide legibility.
 * Pure module: no React, no DOM, no globals.
 */

/** Modular-scale ratios from musical intervals (Bringhurst / modularscale.com). */
export const TYPE_SCALE_RATIOS = [
  { id: "minor-second", label: "Minor second", ratio: 1.067 },
  { id: "major-second", label: "Major second", ratio: 1.125 },
  { id: "minor-third", label: "Minor third", ratio: 1.2 },
  { id: "major-third", label: "Major third", ratio: 1.25 },
  { id: "perfect-fourth", label: "Perfect fourth", ratio: 1.3333 },
];

/**
 * Average advance width of running lowercase Latin text, in em, by
 * classification. Approximations used only to estimate characters per line.
 * Monospace is the exact case: most mono faces ship a 600/1000 advance.
 */
export const AVG_CHAR_WIDTH_EM = {
  humanistSans: 0.5,
  grotesqueSans: 0.5,
  geometricSans: 0.52,
  monospace: 0.6,
};

/** Bringhurst's readability band for continuous text, in characters per line. */
export const MEASURE_MIN_CPL = 45;
export const MEASURE_IDEAL_CPL = 66;
export const MEASURE_MAX_CPL = 75;

/** Practical UI leading heuristic, anchored at 1.5 for the 66-character ideal. */
const LEADING_AT_IDEAL_MEASURE = 1.5;
const LEADING_PER_EXTRA_CHAR = 0.004;
const LEADING_MIN = 1.35;
const LEADING_MAX = 1.7;

/** Practical display-leading heuristic: 1.4 at 16px, tightening with size. */
const HEADING_LEADING_AT_16PX = 1.4;
const HEADING_LEADING_SLOPE_PER_PX = 0.0075;
const HEADING_LEADING_MIN = 1.0;

/** rem values assume the browser default root size of 16px. */
export const ROOT_FONT_PX = 16;

export const SCALE_STEPS = [-1, 0, 1, 2, 3, 4, 5];

/**
 * ISO 9241-303 recommends a character height subtending roughly 20-22 minutes
 * of arc at the viewer's eye for comfortable reading; about 16 arcmin is the
 * practical legibility floor. We size for 20 arcmin.
 */
export const COMFORT_ARCMIN = 20;

/**
 * Cap height of a typical sans-serif face, as a fraction of the em.
 * Real values run about 0.68-0.73 em; 0.70 is used as the representative value.
 */
export const CAP_HEIGHT_RATIO = 0.7;

/** Standard 16:9 presentation artboard height in pixels for a 1920px width. */
export const SLIDE_ASPECT = 16 / 9;

export const TECH_PAIRINGS = [
  {
    id: "space-grotesk-inter",
    label: "Developer platform",
    heading: {
      family: "Space Grotesk",
      klass: "grotesqueSans",
      weight: 700,
      google: "Space+Grotesk:wght@500;700",
      stack: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
    },
    body: {
      family: "Inter",
      klass: "grotesqueSans",
      weight: 400,
      google: "Inter:wght@400;500;600",
      stack: "Inter, system-ui, -apple-system, Arial, sans-serif",
    },
    mono: {
      family: "Space Mono",
      klass: "monospace",
      weight: 400,
      google: "Space+Mono:wght@400;700",
      stack: '"Space Mono", ui-monospace, "SF Mono", Menlo, monospace',
    },
    note: "Space Grotesk's clipped terminals give headings a technical edge while Inter stays invisible in dense UI. Space Mono is loud — keep it for code blocks and labels, not tables.",
  },
  {
    id: "outfit-inter",
    label: "Clean SaaS",
    heading: {
      family: "Outfit",
      klass: "geometricSans",
      weight: 600,
      google: "Outfit:wght@500;600;700",
      stack: "Outfit, system-ui, Arial, sans-serif",
    },
    body: {
      family: "Inter",
      klass: "grotesqueSans",
      weight: 400,
      google: "Inter:wght@400;500;600",
      stack: "Inter, system-ui, -apple-system, Arial, sans-serif",
    },
    mono: {
      family: "JetBrains Mono",
      klass: "monospace",
      weight: 400,
      google: "JetBrains+Mono:wght@400;700",
      stack: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
    },
    note: "Outfit is a pure geometric with near-circular bowls, so it needs tight tracking at display sizes. JetBrains Mono has a taller x-height than most mono faces and holds up at 12–13px.",
  },
  {
    id: "manrope-duo",
    label: "Single family",
    heading: {
      family: "Manrope",
      klass: "grotesqueSans",
      weight: 800,
      google: "Manrope:wght@400;600;800",
      stack: "Manrope, system-ui, Arial, sans-serif",
    },
    body: {
      family: "Manrope",
      klass: "grotesqueSans",
      weight: 400,
      google: "Manrope:wght@400;600;800",
      stack: "Manrope, system-ui, Arial, sans-serif",
    },
    mono: {
      family: "IBM Plex Mono",
      klass: "monospace",
      weight: 400,
      google: "IBM+Plex+Mono:wght@400;600",
      stack: '"IBM Plex Mono", ui-monospace, Menlo, monospace',
    },
    note: "One variable family carrying both roles on weight contrast alone. Cheapest option for performance — a single font file covers headings and body.",
  },
  {
    id: "sora-plex",
    label: "AI product",
    heading: {
      family: "Sora",
      klass: "geometricSans",
      weight: 600,
      google: "Sora:wght@400;600;700",
      stack: "Sora, system-ui, Arial, sans-serif",
    },
    body: {
      family: "IBM Plex Sans",
      klass: "humanistSans",
      weight: 400,
      google: "IBM+Plex+Sans:ital,wght@0,400;0,600;1,400",
      stack: '"IBM Plex Sans", system-ui, Arial, sans-serif',
    },
    mono: {
      family: "IBM Plex Mono",
      klass: "monospace",
      weight: 400,
      google: "IBM+Plex+Mono:wght@400;600",
      stack: '"IBM Plex Mono", ui-monospace, Menlo, monospace',
    },
    note: "IBM Plex Sans and IBM Plex Mono share skeletons, so numbers line up between prose and code. Sora adds the display personality Plex deliberately avoids.",
  },
  {
    id: "jakarta-inter",
    label: "Fintech-adjacent",
    heading: {
      family: "Plus Jakarta Sans",
      klass: "geometricSans",
      weight: 700,
      google: "Plus+Jakarta+Sans:wght@500;700;800",
      stack: '"Plus Jakarta Sans", system-ui, Arial, sans-serif',
    },
    body: {
      family: "Inter",
      klass: "grotesqueSans",
      weight: 400,
      google: "Inter:wght@400;500;600",
      stack: "Inter, system-ui, -apple-system, Arial, sans-serif",
    },
    mono: {
      family: "JetBrains Mono",
      klass: "monospace",
      weight: 400,
      google: "JetBrains+Mono:wght@400;700",
      stack: '"JetBrains Mono", ui-monospace, Menlo, monospace',
    },
    note: "Plus Jakarta Sans has open apertures that survive small marketing type. Inter ships tabular figures via font-variant-numeric, useful for dashboards.",
  },
  {
    id: "poppins-inter",
    label: "Consumer app",
    heading: {
      family: "Poppins",
      klass: "geometricSans",
      widthEm: 0.56,
      weight: 600,
      google: "Poppins:wght@500;600;700",
      stack: "Poppins, system-ui, Arial, sans-serif",
    },
    body: {
      family: "Inter",
      klass: "grotesqueSans",
      weight: 400,
      google: "Inter:wght@400;500;600",
      stack: "Inter, system-ui, -apple-system, Arial, sans-serif",
    },
    mono: {
      family: "Roboto Mono",
      klass: "monospace",
      weight: 400,
      google: "Roboto+Mono:wght@400;500",
      stack: '"Roboto Mono", ui-monospace, Menlo, monospace',
    },
    note: "Poppins is monolinear, single-storey and unusually wide, so headlines run long — budget more line breaks than the character estimate suggests for the body face.",
  },
  {
    id: "figtree-source",
    label: "Friendly B2B",
    heading: {
      family: "Figtree",
      klass: "geometricSans",
      weight: 700,
      google: "Figtree:wght@500;700;800",
      stack: "Figtree, system-ui, Arial, sans-serif",
    },
    body: {
      family: "Source Sans 3",
      klass: "humanistSans",
      weight: 400,
      google: "Source+Sans+3:ital,wght@0,400;0,600;1,400",
      stack: '"Source Sans 3", system-ui, Arial, sans-serif',
    },
    mono: {
      family: "JetBrains Mono",
      klass: "monospace",
      weight: 400,
      google: "JetBrains+Mono:wght@400;700",
      stack: '"JetBrains Mono", ui-monospace, Menlo, monospace',
    },
    note: "Source Sans 3 is one of the most economical text faces on Google Fonts, so long help-centre pages set shorter than they do in Inter at the same size.",
  },
  {
    id: "bricolage-public",
    label: "Bold launch",
    heading: {
      family: "Bricolage Grotesque",
      klass: "grotesqueSans",
      weight: 700,
      google: "Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800",
      stack: '"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif',
    },
    body: {
      family: "Public Sans",
      klass: "grotesqueSans",
      weight: 400,
      google: "Public+Sans:ital,wght@0,400;0,600;1,400",
      stack: '"Public Sans", system-ui, Arial, sans-serif',
    },
    mono: {
      family: "Space Mono",
      klass: "monospace",
      weight: 400,
      google: "Space+Mono:wght@400;700",
      stack: '"Space Mono", ui-monospace, Menlo, monospace',
    },
    note: "Bricolage Grotesque carries optical-size and width axes, so the same family works from a 12px eyebrow to a 96px hero without redrawing weight relationships.",
  },
];

function round(value, decimals) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  const result = Math.round(value * factor) / factor;
  return result === 0 ? 0 : result;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function charWidthEm(face) {
  if (!face) return 0.5;
  if (Number.isFinite(face.widthEm) && face.widthEm > 0) return face.widthEm;
  return AVG_CHAR_WIDTH_EM[face.klass] ?? 0.5;
}

/** Snap a pixel value to the nearest multiple of the baseline grid. */
export function snapToGrid(value, grid) {
  if (!(grid > 0) || !Number.isFinite(value)) return value;
  return Math.max(grid, Math.round(value / grid) * grid);
}

/**
 * Snap a leading value to the baseline grid so line boxes stack cleanly.
 * Rounds to the nearest grid multiple but never lets the line box fall below
 * one em, the point at which ascenders and descenders of adjacent lines
 * physically collide.
 */
const MIN_LEADING_RATIO = 1;

export function snapLeading(leadingPx, fontSizePx, grid) {
  if (!(grid > 0) || !Number.isFinite(leadingPx) || !(fontSizePx > 0)) return leadingPx;
  const snapped = Math.round(leadingPx / grid) * grid;
  const floor = Math.ceil((fontSizePx * MIN_LEADING_RATIO) / grid) * grid;
  return Math.max(grid, snapped, floor);
}

export function charactersPerLine({ columnPx, fontSizePx, widthEm }) {
  if (!(columnPx > 0) || !(fontSizePx > 0) || !(widthEm > 0)) return 0;
  return columnPx / (fontSizePx * widthEm);
}

export function recommendBodyLineHeight(cpl) {
  if (!(cpl > 0)) return LEADING_AT_IDEAL_MEASURE;
  const raw =
    LEADING_AT_IDEAL_MEASURE + (cpl - MEASURE_IDEAL_CPL) * LEADING_PER_EXTRA_CHAR;
  return round(clamp(raw, LEADING_MIN, LEADING_MAX), 2);
}

export function recommendHeadingLineHeight(fontSizePx) {
  if (!(fontSizePx > 0)) return HEADING_LEADING_AT_16PX;
  const raw =
    HEADING_LEADING_AT_16PX - (fontSizePx - ROOT_FONT_PX) * HEADING_LEADING_SLOPE_PER_PX;
  return round(Math.max(raw, HEADING_LEADING_MIN), 2);
}

export function measureVerdict(cpl) {
  if (!(cpl > 0)) return { level: "danger", text: "No usable content width." };
  if (cpl < MEASURE_MIN_CPL) {
    return {
      level: "warn",
      text: `Under ${MEASURE_MIN_CPL} characters per line — fine for a card or sidebar, too narrow for docs or marketing prose.`,
    };
  }
  if (cpl > MEASURE_MAX_CPL) {
    return {
      level: "warn",
      text: `Over ${MEASURE_MAX_CPL} characters per line — cap the text container so long paragraphs stay readable.`,
    };
  }
  return {
    level: "ok",
    text: `Inside the ${MEASURE_MIN_CPL}-${MEASURE_MAX_CPL} character band for continuous text.`,
  };
}

/**
 * Smallest comfortable slide font size for a room.
 * A character of height h at distance d subtends angle t where h = 2*d*tan(t/2).
 * We solve for h at COMFORT_ARCMIN, convert that cap height into slide pixels,
 * then divide by CAP_HEIGHT_RATIO to get a font size.
 */
export function slideMinimumFontPx({ viewingDistanceM, screenHeightM, slideHeightPx }) {
  const d = Number(viewingDistanceM);
  const h = Number(screenHeightM);
  const px = Number(slideHeightPx);
  if (!(d > 0) || !(h > 0) || !(px > 0)) return null;
  const halfAngleRad = (COMFORT_ARCMIN / 60 / 2) * (Math.PI / 180);
  const capHeightM = 2 * d * Math.tan(halfAngleRad);
  const capHeightPx = (capHeightM / h) * px;
  return capHeightPx / CAP_HEIGHT_RATIO;
}

/**
 * Full calculation. Returns { error } for any invalid input.
 */
export function computeTechType({
  pairingId,
  ratioId,
  basePx,
  gridPx,
  contentWidthPx,
  headingStep,
  slideWidthPx,
  viewingDistanceM,
  screenHeightM,
}) {
  const pairing = TECH_PAIRINGS.find((item) => item.id === pairingId);
  if (!pairing) return { error: "Choose one of the listed pairings." };

  const scale = TYPE_SCALE_RATIOS.find((item) => item.id === ratioId);
  if (!scale) return { error: "Choose one of the listed scale ratios." };

  const base = Number(basePx);
  const grid = Number(gridPx);
  const width = Number(contentWidthPx);
  const step = Number(headingStep);
  const slideW = Number(slideWidthPx);
  const distance = Number(viewingDistanceM);
  const screenH = Number(screenHeightM);

  if (![base, grid, width, step, slideW, distance, screenH].every((n) => Number.isFinite(n))) {
    return { error: "Enter a number in every field." };
  }
  if (base < 10 || base > 32) return { error: "UI body size should be between 10px and 32px." };
  if (!Number.isInteger(grid) || grid < 1 || grid > 16) {
    return { error: "Baseline grid should be a whole number of pixels between 1 and 16." };
  }
  if (width < 200 || width > 2400) {
    return { error: "Text container width should be between 200px and 2400px." };
  }
  if (!Number.isInteger(step) || step < 1 || step > 6) {
    return { error: "Headline step should be a whole number between 1 and 6." };
  }
  if (slideW < 640 || slideW > 7680) {
    return { error: "Slide width should be between 640px and 7680px." };
  }
  if (distance <= 0 || distance > 60) {
    return { error: "Viewing distance should be between 0 and 60 metres." };
  }
  if (screenH <= 0 || screenH > 12) {
    return { error: "Screen height should be between 0 and 12 metres." };
  }

  const bodyWidthEm = charWidthEm(pairing.body);
  const cpl = charactersPerLine({ columnPx: width, fontSizePx: base, widthEm: bodyWidthEm });
  const bodyLineHeight = recommendBodyLineHeight(cpl);
  const bodyLeadingPx = snapLeading(base * bodyLineHeight, base, grid);
  const bodySnappedLineHeight = round(bodyLeadingPx / base, 3);

  const steps = SCALE_STEPS.map((n) => {
    const raw = base * scale.ratio ** n;
    const snapped = snapToGrid(raw, grid);
    const targetLh = n <= 0 ? bodyLineHeight : recommendHeadingLineHeight(snapped);
    const leadingPx = snapLeading(snapped * targetLh, snapped, grid);
    return {
      step: n,
      rawPx: round(raw, 1),
      px: round(snapped, 1),
      rem: round(snapped / ROOT_FONT_PX, 3),
      leadingPx: round(leadingPx, 1),
      lineHeight: round(leadingPx / snapped, 3),
      driftPx: round(snapped - raw, 1),
      role:
        n < 0 ? "Caption / label" : n === 0 ? "Body" : n >= 4 ? "Hero" : "Heading",
    };
  });

  // Snapping a small ratio onto a coarse grid can collapse two steps onto the
  // same pixel size, which destroys the hierarchy. Flag it rather than hide it.
  const collisions = steps.filter(
    (row, index) => index > 0 && row.px === steps[index - 1].px,
  ).length;

  const headingRow = steps.find((row) => row.step === step) ?? steps[steps.length - 1];

  const slideHeightPx = slideW / SLIDE_ASPECT;
  const minSlidePx = slideMinimumFontPx({
    viewingDistanceM: distance,
    screenHeightM: screenH,
    slideHeightPx,
  });
  const slideScale = slideW / width;
  const bodyOnSlidePx = base * slideScale;

  return {
    pairing,
    scale,
    basePx: base,
    gridPx: grid,
    contentWidthPx: width,
    charsPerLine: round(cpl, 1),
    verdict: measureVerdict(cpl),
    bodyLineHeight: bodySnappedLineHeight,
    bodyLeadingPx: round(bodyLeadingPx, 1),
    idealContainerPx: round(base * bodyWidthEm * MEASURE_IDEAL_CPL, 0),
    headingStep: step,
    headingPx: headingRow.px,
    headingRem: headingRow.rem,
    headingLineHeight: headingRow.lineHeight,
    headingLeadingPx: headingRow.leadingPx,
    steps,
    collisions,
    gridWarning:
      collisions > 0
        ? `${collisions} step${collisions > 1 ? "s" : ""} collapsed onto the same pixel size after snapping — use a smaller grid or a larger ratio.`
        : "",
    slideWidthPx: slideW,
    slideHeightPx: round(slideHeightPx, 0),
    slideScale: round(slideScale, 2),
    bodyOnSlidePx: round(bodyOnSlidePx, 0),
    minSlidePx: round(minSlidePx ?? 0, 0),
    slideOk: Number.isFinite(minSlidePx) && bodyOnSlidePx >= minSlidePx,
  };
}

export function googleFontsHref(pairing) {
  if (!pairing) return "";
  const seen = new Set();
  const families = [pairing.heading.google, pairing.body.google, pairing.mono.google]
    .filter((value) => {
      if (!value || seen.has(value)) return false;
      seen.add(value);
      return true;
    })
    .map((value) => `family=${value}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export function buildCss(result) {
  if (!result || result.error) return "";
  const { pairing, gridPx } = result;
  const lines = [
    `@import url("${googleFontsHref(pairing)}");`,
    "",
    ":root {",
    `  --font-display: ${pairing.heading.stack};`,
    `  --font-ui: ${pairing.body.stack};`,
    `  --font-mono: ${pairing.mono.stack};`,
    `  --grid: ${gridPx}px;`,
    `  --measure: ${round(result.idealContainerPx / ROOT_FONT_PX, 2)}rem;`,
    "}",
    "",
    "body {",
    "  font-family: var(--font-ui);",
    `  font-size: ${round(result.basePx / ROOT_FONT_PX, 3)}rem;`,
    `  line-height: ${result.bodyLineHeight};`,
    "}",
    "",
    ".numeric {",
    "  font-family: var(--font-mono);",
    "  font-variant-numeric: tabular-nums;",
    "}",
    "",
  ];
  const headingRows = result.steps
    .filter((row) => row.step > 0 && row.step <= result.headingStep)
    .sort((a, b) => b.step - a.step);
  headingRows.forEach((row, index) => {
    lines.push(
      `h${index + 1} { font-family: var(--font-display); font-weight: ${pairing.heading.weight}; font-size: ${row.rem}rem; line-height: ${row.lineHeight}; }`,
    );
  });
  return lines.join("\n");
}

export function buildSummary(result) {
  if (!result || result.error) return "";
  return [
    "Tech Startup Font Pairing",
    `Display: ${result.pairing.heading.family} ${result.pairing.heading.weight}`,
    `UI text: ${result.pairing.body.family} ${result.pairing.body.weight}`,
    `Numbers / code: ${result.pairing.mono.family}`,
    `Scale: ${result.scale.label} (${result.scale.ratio}) on a ${result.gridPx}px baseline grid`,
    `Body: ${result.basePx}px, line-height ${result.bodyLineHeight} (${result.bodyLeadingPx}px)`,
    `Headline (step ${result.headingStep}): ${result.headingPx}px / ${result.headingRem}rem, line-height ${result.headingLineHeight}`,
    `Measure: ${result.charsPerLine} characters per line — ${result.verdict.text}`,
    `Slide check: body scales to ${result.bodyOnSlidePx}px on a ${result.slideWidthPx}x${result.slideHeightPx} artboard; ${result.minSlidePx}px is the comfortable minimum for that room.`,
  ].join("\n");
}
