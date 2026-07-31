/**
 * Fintech Font Pairing — pair table plus tabular-figure column maths.
 * Pure module: no React, no DOM, no clock.
 *
 * The typographic problem in a finance interface is not taste, it is column
 * alignment. With `font-variant-numeric: tabular-nums` every digit gets the
 * same advance width, so a money column's width is fully predictable from the
 * number of digits, the grouping separators and the currency symbol.
 */

const SANS_FALLBACK = 'system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif';
const MONO_FALLBACK = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

/**
 * `digitAdvanceEm` is the tabular figure width as a share of the em. Most
 * neo-grotesque UI faces sit near 0.6em; monospaced faces are wider still.
 * Measure your own build if you need sub-pixel accuracy.
 */
export const PAIRS = [
  {
    id: "inter-inter",
    name: "Inter (display + text)",
    heading: { family: "Inter", weight: 600, stack: `"Inter", ${SANS_FALLBACK}` },
    body: { family: "Inter", weight: 400, stack: `"Inter", ${SANS_FALLBACK}` },
    figures: { family: "Inter", digitAdvanceEm: 0.6, tabular: true },
    why: "One family, two weights. Inter ships true tabular figures and a slashed-zero stylistic set, which is why so many banking interfaces land on it.",
  },
  {
    id: "plex-plex",
    name: "IBM Plex Sans + IBM Plex Mono",
    heading: { family: "IBM Plex Sans", weight: 600, stack: `"IBM Plex Sans", ${SANS_FALLBACK}` },
    body: { family: "IBM Plex Sans", weight: 400, stack: `"IBM Plex Sans", ${SANS_FALLBACK}` },
    figures: { family: "IBM Plex Mono", digitAdvanceEm: 0.6, tabular: true },
    why: "Plex Mono for account numbers and reference IDs, Plex Sans for everything else — the two were drawn together so the pair never clashes.",
  },
  {
    id: "manrope-inter",
    name: "Manrope + Inter",
    heading: { family: "Manrope", weight: 700, stack: `"Manrope", ${SANS_FALLBACK}` },
    body: { family: "Inter", weight: 400, stack: `"Inter", ${SANS_FALLBACK}` },
    figures: { family: "Inter", digitAdvanceEm: 0.6, tabular: true },
    why: "Manrope gives marketing headlines a distinct voice while Inter keeps the product surfaces neutral and dense.",
  },
  {
    id: "space-inter-jet",
    name: "Space Grotesk + Inter + JetBrains Mono",
    heading: { family: "Space Grotesk", weight: 600, stack: `"Space Grotesk", ${SANS_FALLBACK}` },
    body: { family: "Inter", weight: 400, stack: `"Inter", ${SANS_FALLBACK}` },
    figures: { family: "JetBrains Mono", digitAdvanceEm: 0.6, tabular: true },
    why: "A crypto and developer-facing combination: technical headings, neutral copy, unmistakable monospaced hashes and addresses.",
  },
  {
    id: "archivo-roboto",
    name: "Archivo + Roboto + Roboto Mono",
    heading: { family: "Archivo", weight: 700, stack: `"Archivo", ${SANS_FALLBACK}` },
    body: { family: "Roboto", weight: 400, stack: `"Roboto", ${SANS_FALLBACK}` },
    figures: { family: "Roboto Mono", digitAdvanceEm: 0.6, tabular: true },
    why: "Archivo's tighter apertures give statements and dashboards a newsprint authority; Roboto Mono keeps ledgers aligned.",
  },
  {
    id: "figtree-source",
    name: "Figtree + Source Sans 3",
    heading: { family: "Figtree", weight: 700, stack: `"Figtree", ${SANS_FALLBACK}` },
    body: { family: "Source Sans 3", weight: 400, stack: `"Source Sans 3", ${SANS_FALLBACK}` },
    figures: { family: "Source Sans 3", digitAdvanceEm: 0.55, tabular: true },
    why: "The friendliest option here — for consumer savings and payments apps that want approachable rather than institutional.",
  },
];

/** Comma and period advance widths as a share of the em in a typical UI sans. */
export const SEPARATOR_ADVANCE_EM = 0.28;
/** Currency symbols vary; the rupee, dollar and euro glyphs are close to a digit width. */
export const SYMBOL_ADVANCE_EM = 0.6;
/** A thin gap between the symbol and the first digit. */
export const SYMBOL_GAP_EM = 0.16;

export const GROUPING = [
  { id: "international", label: "International (1,234,567)" },
  { id: "indian", label: "Indian lakh/crore (12,34,567)" },
  { id: "none", label: "No separators (1234567)" },
];

/** Currency symbol modelled by each grouping option's preview sample. */
export const GROUPING_SYMBOL = {
  international: "$",
  indian: "₹",
  none: "$",
};

const isPositive = (value) => Number.isFinite(value) && value > 0;

/**
 * Number of grouping separators in an integer of `digits` digits.
 * International: a comma every three digits from the right.
 * Indian: the last three digits, then groups of two.
 */
export function separatorCount({ digits, grouping }) {
  if (!Number.isFinite(digits) || digits < 1 || digits > 30) {
    return { error: "Digit count must be between 1 and 30." };
  }
  const n = Math.floor(digits);
  if (grouping === "none") return { count: 0 };
  if (grouping === "indian") return { count: n <= 3 ? 0 : Math.ceil((n - 3) / 2) };
  if (grouping === "international") return { count: Math.floor((n - 1) / 3) };
  return { error: "Grouping must be international, indian or none." };
}

/** Format an integer with the chosen grouping, for the sample rendering. */
export function groupDigits({ digits, grouping }) {
  const check = separatorCount({ digits, grouping });
  if (check.error) return check;
  const n = Math.floor(digits);
  // Use a repeating 1234567890 pattern so every digit slot is visible.
  let raw = "";
  for (let i = 0; i < n; i += 1) raw += String((i + 1) % 10);

  if (grouping === "none") return { text: raw };
  if (grouping === "international") {
    return { text: raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",") };
  }
  if (n <= 3) return { text: raw };
  const last3 = raw.slice(-3);
  let rest = raw.slice(0, -3);
  const parts = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest.length) parts.unshift(rest);
  return { text: `${parts.join(",")},${last3}` };
}

/**
 * Width of a money column with tabular figures.
 * width = symbol + gap + digits x digitAdvance + separators x separatorAdvance
 *         + decimal point + decimal digits
 */
export function moneyColumnWidth({
  integerDigits,
  decimals = 2,
  grouping = "international",
  fontSizePx,
  digitAdvanceEm = 0.6,
  showSymbol = true,
}) {
  if (!isPositive(fontSizePx)) return { error: "Font size must be greater than zero." };
  if (!isPositive(digitAdvanceEm) || digitAdvanceEm > 2) {
    return { error: "Digit advance should be between 0 and 2 em." };
  }
  if (!Number.isFinite(decimals) || decimals < 0 || decimals > 8) {
    return { error: "Decimal places must be between 0 and 8." };
  }
  const seps = separatorCount({ digits: integerDigits, grouping });
  if (seps.error) return seps;

  const digitCount = Math.floor(integerDigits) + Math.floor(decimals);
  const separatorGlyphs = seps.count + (decimals > 0 ? 1 : 0); // grouping commas plus the decimal point
  const symbolEm = showSymbol ? SYMBOL_ADVANCE_EM + SYMBOL_GAP_EM : 0;

  const widthEm = digitCount * digitAdvanceEm + separatorGlyphs * SEPARATOR_ADVANCE_EM + symbolEm;
  return {
    widthEm: Math.round(widthEm * 1000) / 1000,
    widthPx: Math.round(widthEm * fontSizePx * 100) / 100,
    widthCh: Math.round((widthEm / digitAdvanceEm) * 100) / 100,
    digitCount,
    separatorCount: seps.count,
  };
}

/**
 * Proportional figures shift by up to this fraction of an em between digits
 * (a "1" is much narrower than a "0"), which is what makes a right-aligned
 * column of proportional numerals look ragged as values change.
 */
export const PROPORTIONAL_JITTER_EM = 0.25;

export function proportionalJitter({ digitCount, fontSizePx }) {
  if (!Number.isFinite(digitCount) || digitCount < 1) {
    return { error: "Digit count must be at least 1." };
  }
  if (!isPositive(fontSizePx)) return { error: "Font size must be greater than zero." };
  const worstCaseEm = Math.floor(digitCount) * PROPORTIONAL_JITTER_EM;
  return {
    worstCaseEm: Math.round(worstCaseEm * 1000) / 1000,
    worstCasePx: Math.round(worstCaseEm * fontSizePx * 100) / 100,
  };
}

export function buildFontUrl(pair) {
  if (!pair || !pair.heading || !pair.body) return { error: "Pick a font pair first." };
  const wanted = new Map();
  const add = (family, weight) => {
    const current = wanted.get(family) || new Set();
    current.add(weight);
    wanted.set(family, current);
  };
  add(pair.heading.family, pair.heading.weight);
  add(pair.body.family, pair.body.weight);
  if (pair.figures && pair.figures.family) add(pair.figures.family, 400);

  const families = [...wanted.entries()].map(
    ([family, weights]) => `${family.replace(/ /g, "+")}:wght@${[...weights].sort((a, b) => a - b).join(";")}`,
  );
  return { url: `https://fonts.googleapis.com/css2?family=${families.join("&family=")}&display=swap` };
}

export const ROOT_FONT_SIZE_PX = 16;

/** Everything the page needs. */
export function buildFintechReport({ pairId, integerDigits, decimals, grouping, fontSizePx, showSymbol = true }) {
  const pair = PAIRS.find((item) => item.id === pairId);
  if (!pair) return { error: "Pick one of the fintech font pairs." };
  if (!isPositive(fontSizePx) || fontSizePx < 10 || fontSizePx > 72) {
    return { error: "Figure size should be between 10 px and 72 px." };
  }

  const column = moneyColumnWidth({
    integerDigits,
    decimals,
    grouping,
    fontSizePx,
    digitAdvanceEm: pair.figures.digitAdvanceEm,
    showSymbol,
  });
  if (column.error) return column;

  const jitter = proportionalJitter({ digitCount: column.digitCount, fontSizePx });
  if (jitter.error) return jitter;

  const sample = groupDigits({ digits: integerDigits, grouping });
  if (sample.error) return sample;
  const currencySymbol = GROUPING_SYMBOL[grouping] || "$";
  const sampleText = `${showSymbol ? currencySymbol : ""}${sample.text}${
    decimals > 0 ? `.${"0".repeat(Math.floor(decimals))}` : ""
  }`;

  const fontUrlResult = buildFontUrl(pair);
  if (fontUrlResult.error) return fontUrlResult;
  const fontUrl = fontUrlResult.url;

  const css = `@import url('${fontUrl}');

:root {
  --font-heading: ${pair.heading.stack};
  --font-body: ${pair.body.stack};
  --font-figures: ${pair.figures.family === pair.body.family ? pair.body.stack : `"${pair.figures.family}", ${MONO_FALLBACK}`};
  --money-column: ${Math.round((column.widthPx / ROOT_FONT_SIZE_PX) * 1000) / 1000}rem;
}

h1, h2, h3 {
  font-family: var(--font-heading);
  font-weight: ${pair.heading.weight};
}

body {
  font-family: var(--font-body);
  font-weight: ${pair.body.weight};
}

.amount {
  font-family: var(--font-figures);
  font-variant-numeric: tabular-nums slashed-zero;
  font-feature-settings: "tnum" 1, "zero" 1;
  min-width: var(--money-column);
  text-align: right;
  font-size: ${Math.round((fontSizePx / ROOT_FONT_SIZE_PX) * 1000) / 1000}rem;
}`;

  return { pair, column, jitter, sampleText, css, fontUrl };
}
