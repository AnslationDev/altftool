/**
 * Brutalist Font Pairing — grotesk + monospace pairs, character-grid maths and
 * edge-to-edge headline sizing.
 * Pure module: no React, no DOM, no globals.
 */

/**
 * In CSS the ch unit is the advance width of the "0" glyph in the current
 * font. Because a monospaced face gives every glyph the same advance, a run of
 * N characters is exactly N ch wide — which is what makes a character grid
 * possible. Almost every monospaced family ships a 600/1000-unit advance,
 * so 0.6em is the default here, but it is editable per face.
 */
export const DEFAULT_MONO_ADVANCE_EM = 0.6;

/**
 * Average advance of uppercase display text, in em, for a heavy grotesk. Caps
 * are wider than lowercase; this is an approximation used to size a headline to
 * a container, not a measured metric.
 */
export const DEFAULT_DISPLAY_ADVANCE_EM = 0.62;

/**
 * Practical tracking heuristic (a house rule, not a standard): display type
 * needs progressively tighter tracking as it grows, because the sidebearings
 * drawn for text sizes become visible gaps. Zero at 24px, tightening by
 * 0.0004em per pixel, never past -0.05em.
 */
const TRACKING_NEUTRAL_PX = 24;
const TRACKING_PER_PX = 0.0004;
const TRACKING_FLOOR_EM = -0.05;

/** Sizes below this are text, not display — leave the tracking alone. */
export const DISPLAY_THRESHOLD_PX = 24;

export const BRUTALIST_PAIRINGS = [
  {
    id: "concrete-slab",
    label: "Concrete slab",
    display: {
      family: "Archivo Black",
      weight: 400,
      advanceEm: 0.66,
      google: "Archivo+Black",
      stack: '"Archivo Black", "Helvetica Neue", Impact, sans-serif',
    },
    mono: {
      family: "IBM Plex Mono",
      weight: 400,
      advanceEm: 0.6,
      google: "IBM+Plex+Mono:ital,wght@0,400;0,600;1,400",
      stack: '"IBM Plex Mono", ui-monospace, Menlo, monospace',
    },
    note: "Archivo Black is one weight only and very wide, so a five-word headline will not fit a phone. Split the headline across lines rather than shrinking it.",
  },
  {
    id: "poster-shout",
    label: "Poster shout",
    display: {
      family: "Anton",
      weight: 400,
      advanceEm: 0.45,
      google: "Anton",
      stack: "Anton, Impact, sans-serif",
    },
    mono: {
      family: "Space Mono",
      weight: 400,
      advanceEm: 0.6,
      google: "Space+Mono:ital,wght@0,400;0,700;1,400",
      stack: '"Space Mono", ui-monospace, Menlo, monospace',
    },
    note: "Anton is extremely condensed, so it packs long headlines into narrow columns — but its counters close up under about 20px. Display only.",
  },
  {
    id: "systems-print",
    label: "Systems print",
    display: {
      family: "Chivo",
      weight: 900,
      advanceEm: 0.58,
      google: "Chivo:ital,wght@0,400;0,700;0,900;1,400",
      stack: "Chivo, Arial, sans-serif",
    },
    mono: {
      family: "Chivo Mono",
      weight: 400,
      advanceEm: 0.6,
      google: "Chivo+Mono:ital,wght@0,400;0,700;1,400",
      stack: '"Chivo Mono", ui-monospace, Menlo, monospace',
    },
    note: "Chivo and Chivo Mono share a skeleton, so a caption set in the mono lines up optically with the grotesk above it. The cleanest option if you want one designer's voice throughout.",
  },
  {
    id: "swiss-brut",
    label: "Swiss brut",
    display: {
      family: "Inter Tight",
      weight: 800,
      advanceEm: 0.55,
      google: "Inter+Tight:ital,wght@0,400;0,700;0,800;1,400",
      stack: '"Inter Tight", Inter, system-ui, Arial, sans-serif',
    },
    mono: {
      family: "Roboto Mono",
      weight: 400,
      advanceEm: 0.6,
      google: "Roboto+Mono:ital,wght@0,400;0,600;1,400",
      stack: '"Roboto Mono", ui-monospace, Menlo, monospace',
    },
    note: "Inter Tight is drawn with narrower sidebearings than Inter specifically for display use, so it needs less negative tracking than a text grotesk pushed large.",
  },
  {
    id: "wide-load",
    label: "Wide load",
    display: {
      family: "Unbounded",
      weight: 700,
      advanceEm: 0.72,
      google: "Unbounded:wght@400;700;900",
      stack: "Unbounded, Impact, sans-serif",
    },
    mono: {
      family: "Fira Code",
      weight: 400,
      advanceEm: 0.6,
      google: "Fira+Code:wght@400;600",
      stack: '"Fira Code", ui-monospace, Menlo, monospace',
    },
    note: "Unbounded is unusually wide, so a headline eats horizontal space fast. Fira Code carries programming ligatures — switch them off with font-variant-ligatures: none for prose.",
  },
  {
    id: "terminal",
    label: "Terminal",
    display: {
      family: "Familjen Grotesk",
      weight: 700,
      advanceEm: 0.55,
      google: "Familjen+Grotesk:ital,wght@0,400;0,700;1,400",
      stack: '"Familjen Grotesk", "Helvetica Neue", Arial, sans-serif',
    },
    mono: {
      family: "Martian Mono",
      weight: 400,
      advanceEm: 0.7,
      google: "Martian+Mono:wght@400;700",
      stack: '"Martian Mono", ui-monospace, Menlo, monospace',
    },
    note: "Martian Mono is a deliberately wide monospace — its advance is closer to 0.7em than the usual 0.6em, so the character grid is coarser than you expect. Check the advance field if the grid looks off.",
  },
  {
    id: "editorial-brut",
    label: "Editorial brut",
    display: {
      family: "Syne",
      weight: 800,
      advanceEm: 0.6,
      google: "Syne:wght@400;700;800",
      stack: "Syne, Arial, sans-serif",
    },
    mono: {
      family: "DM Mono",
      weight: 400,
      advanceEm: 0.6,
      google: "DM+Mono:ital,wght@0,400;0,500;1,400",
      stack: '"DM Mono", ui-monospace, Menlo, monospace',
    },
    note: "Syne's heavy weights distort the letterforms on purpose — the wider the weight, the stranger the shapes. Use it at one or two sizes only, never as a full scale.",
  },
  {
    id: "stencil-grid",
    label: "Stencil grid",
    display: {
      family: "Oswald",
      weight: 700,
      advanceEm: 0.47,
      google: "Oswald:wght@400;600;700",
      stack: "Oswald, "
        + '"Helvetica Neue Condensed", Impact, sans-serif',
    },
    mono: {
      family: "Azeret Mono",
      weight: 400,
      advanceEm: 0.6,
      google: "Azeret+Mono:ital,wght@0,400;0,600;1,400",
      stack: '"Azeret Mono", ui-monospace, Menlo, monospace',
    },
    note: "Oswald is condensed with flat sides, which makes it read as signage. Azeret Mono is squarish enough to match it without the pair looking like two unrelated projects.",
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

/** Width of one monospace column, in pixels. This is the CSS ch unit. */
export function monoColumnPx({ fontSizePx, advanceEm }) {
  if (!(fontSizePx > 0) || !(advanceEm > 0)) return 0;
  return fontSizePx * advanceEm;
}

/** Whole monospace columns that fit in a container. */
export function columnsThatFit({ containerPx, fontSizePx, advanceEm }) {
  const column = monoColumnPx({ fontSizePx, advanceEm });
  if (!(column > 0) || !(containerPx > 0)) return 0;
  return Math.floor(containerPx / column);
}

/**
 * Font size at which a string of `characters` glyphs spans `containerPx`.
 * width = characters * fontSize * advanceEm, so fontSize = width / (n * advance).
 */
export function fillSizePx({ containerPx, characters, advanceEm }) {
  if (!(containerPx > 0) || !(characters > 0) || !(advanceEm > 0)) return 0;
  return containerPx / (characters * advanceEm);
}

/** Recommended tracking in em for display type at a given pixel size. */
export function recommendTrackingEm(fontSizePx) {
  if (!(fontSizePx > 0) || fontSizePx <= TRACKING_NEUTRAL_PX) return 0;
  const raw = -(fontSizePx - TRACKING_NEUTRAL_PX) * TRACKING_PER_PX;
  return round(clamp(raw, TRACKING_FLOOR_EM, 0), 4);
}

/** Count the glyphs that occupy horizontal space in a headline. */
export function headlineLength(text) {
  if (typeof text !== "string") return 0;
  return text.trim().length;
}

/**
 * Full brutalist layout calculation.
 * Returns { error } for any invalid input instead of a bad number.
 */
export function computeBrutalistLayout({
  pairingId,
  containerPx,
  monoPx,
  monoAdvanceEm,
  displayAdvanceEm,
  headline,
}) {
  const pairing = BRUTALIST_PAIRINGS.find((item) => item.id === pairingId);
  if (!pairing) return { error: "Choose one of the listed pairings." };

  const container = Number(containerPx);
  const mono = Number(monoPx);
  const monoAdvance = Number(monoAdvanceEm);
  const displayAdvance = Number(displayAdvanceEm);

  if (![container, mono, monoAdvance, displayAdvance].every((n) => Number.isFinite(n))) {
    return { error: "Enter a number in every field." };
  }
  if (container < 240 || container > 3840) {
    return { error: "Container width should be between 240px and 3840px." };
  }
  if (mono < 8 || mono > 40) {
    return { error: "Monospace size should be between 8px and 40px." };
  }
  if (monoAdvance < 0.3 || monoAdvance > 1.2) {
    return { error: "Monospace advance should be between 0.30em and 1.20em." };
  }
  if (displayAdvance < 0.3 || displayAdvance > 1.2) {
    return { error: "Display advance should be between 0.30em and 1.20em." };
  }

  const characters = headlineLength(headline);
  if (characters < 1) {
    return { error: "Type a headline — an empty string has no width to fit." };
  }
  if (characters > 200) {
    return { error: "Keep the headline under 200 characters; longer than that it is a paragraph." };
  }

  const column = monoColumnPx({ fontSizePx: mono, advanceEm: monoAdvance });
  const columns = columnsThatFit({
    containerPx: container,
    fontSizePx: mono,
    advanceEm: monoAdvance,
  });
  const gridWidthPx = columns * column;
  const leftoverPx = container - gridWidthPx;

  const fillPx = fillSizePx({ containerPx: container, characters, advanceEm: displayAdvance });
  const trackingEm = recommendTrackingEm(fillPx);
  // Tracking adds (n - 1) gaps, so the drawn width shifts once tracking is applied.
  const trackedWidthPx = characters * fillPx * displayAdvance + (characters - 1) * trackingEm * fillPx;
  const correctedFillPx =
    characters * displayAdvance + (characters - 1) * trackingEm > 0
      ? container / (characters * displayAdvance + (characters - 1) * trackingEm)
      : fillPx;

  return {
    pairing,
    containerPx: container,
    monoPx: mono,
    monoAdvanceEm: monoAdvance,
    displayAdvanceEm: displayAdvance,
    headline: String(headline).trim(),
    characters,
    columnPx: round(column, 3),
    columns,
    gridWidthPx: round(gridWidthPx, 1),
    leftoverPx: round(leftoverPx, 1),
    fillPx: round(fillPx, 1),
    trackingEm,
    trackedWidthPx: round(trackedWidthPx, 1),
    correctedFillPx: round(correctedFillPx, 1),
    isDisplay: fillPx >= DISPLAY_THRESHOLD_PX,
    // A grid row of N columns expressed in the CSS ch unit, which needs no maths
    // in the stylesheet because 1ch is exactly one column in a monospaced face.
    gridCh: columns,
  };
}

export function googleFontsHref(pairing) {
  if (!pairing) return "";
  const families = [pairing.display.google, pairing.mono.google]
    .filter(Boolean)
    .map((value) => `family=${value}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export function buildCss(result) {
  if (!result || result.error) return "";
  const { pairing } = result;
  return [
    `@import url("${googleFontsHref(pairing)}");`,
    "",
    ":root {",
    `  --font-display: ${pairing.display.stack};`,
    `  --font-mono: ${pairing.mono.stack};`,
    `  --grid-columns: ${result.columns};`,
    "}",
    "",
    ".brut-headline {",
    "  font-family: var(--font-display);",
    `  font-weight: ${pairing.display.weight};`,
    `  font-size: ${result.correctedFillPx}px;`,
    `  letter-spacing: ${result.trackingEm}em;`,
    "  line-height: 0.95;",
    "  text-transform: uppercase;",
    "}",
    "",
    ".brut-mono {",
    "  font-family: var(--font-mono);",
    `  font-weight: ${pairing.mono.weight};`,
    `  font-size: ${result.monoPx}px;`,
    "  line-height: 1.5;",
    `  max-width: ${result.columns}ch;`,
    "}",
    "",
    "/* One monospace column is exactly 1ch, so rules can be written in columns. */",
    ".brut-rule { width: var(--grid-columns) ch; border-top: 2px solid currentColor; }",
  ].join("\n");
}

export function buildSummary(result) {
  if (!result || result.error) return "";
  return [
    "Brutalist Font Pairing",
    `${result.pairing.label}: ${result.pairing.display.family} + ${result.pairing.mono.family}`,
    `Container: ${result.containerPx}px`,
    `Headline: ${result.characters} characters`,
    `Edge-to-edge size: ${result.fillPx}px before tracking, ${result.correctedFillPx}px after ${result.trackingEm}em tracking`,
    `Monospace: ${result.monoPx}px at ${result.monoAdvanceEm}em advance = ${result.columnPx}px per column`,
    `Character grid: ${result.columns} columns (${result.gridWidthPx}px), ${result.leftoverPx}px left over`,
  ].join("\n");
}
