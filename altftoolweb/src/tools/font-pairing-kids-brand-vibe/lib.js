/**
 * Kids Brand Font Pairing — pair table plus a minimum-size calculation based on
 * visual angle. Pure module: no React, no DOM, no clock.
 *
 * Legibility is a function of how large a letter appears on the retina, not of
 * its size on the page. The signage convention is that a character is
 * comfortably readable when its height is at least 1/200 of the viewing
 * distance. Young readers have less practice resolving letterforms, so this
 * tool tightens that ratio for early readers.
 */

const ROUND_FALLBACK = '"Trebuchet MS", Verdana, system-ui, -apple-system, sans-serif';
const SANS_FALLBACK = 'system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif';

/**
 * `xHeightRatio` is the x-height as a share of the em, which is what actually
 * governs perceived size. Rounded children's faces sit high, near 0.52-0.56.
 */
export const PAIRS = [
  {
    id: "baloo-nunito",
    name: "Baloo 2 + Nunito",
    heading: { family: "Baloo 2", weight: 700, stack: `"Baloo 2", ${ROUND_FALLBACK}` },
    body: { family: "Nunito", weight: 400, xHeightRatio: 0.49, stack: `"Nunito", ${ROUND_FALLBACK}` },
    why: "Baloo 2 is chunky and warm without becoming a cartoon; Nunito's rounded terminals carry the same feeling into readable body text.",
  },
  {
    id: "fredoka-quicksand",
    name: "Fredoka + Quicksand",
    heading: { family: "Fredoka", weight: 600, stack: `"Fredoka", ${ROUND_FALLBACK}` },
    body: { family: "Quicksand", weight: 500, xHeightRatio: 0.51, stack: `"Quicksand", ${ROUND_FALLBACK}` },
    why: "Both are geometric and rounded, so the pair feels like one family. Quicksand needs weight 500 or more to hold up at small sizes.",
  },
  {
    id: "chewy-nunito-sans",
    name: "Chewy + Nunito Sans",
    heading: { family: "Chewy", weight: 400, stack: `"Chewy", ${ROUND_FALLBACK}` },
    body: { family: "Nunito Sans", weight: 400, xHeightRatio: 0.49, stack: `"Nunito Sans", ${SANS_FALLBACK}` },
    why: "Chewy is a single-weight display face — use it for a logo or a section title only, never for a paragraph.",
  },
  {
    id: "bubblegum-rubik",
    name: "Bubblegum Sans + Rubik",
    heading: { family: "Bubblegum Sans", weight: 400, stack: `"Bubblegum Sans", ${ROUND_FALLBACK}` },
    body: { family: "Rubik", weight: 400, xHeightRatio: 0.52, stack: `"Rubik", ${SANS_FALLBACK}` },
    why: "Bubblegum Sans brings the playfulness; Rubik's slightly rounded corners keep the body text from feeling corporate.",
  },
  {
    id: "luckiest-poppins",
    name: "Luckiest Guy + Poppins",
    heading: { family: "Luckiest Guy", weight: 400, stack: `"Luckiest Guy", ${ROUND_FALLBACK}` },
    body: { family: "Poppins", weight: 400, xHeightRatio: 0.55, stack: `"Poppins", ${SANS_FALLBACK}` },
    why: "Comic-poster energy for packaging and event titles. Poppins' tall x-height keeps supporting copy legible next to it.",
  },
  {
    id: "comicneue-opensans",
    name: "Comic Neue + Open Sans",
    heading: { family: "Comic Neue", weight: 700, stack: `"Comic Neue", ${ROUND_FALLBACK}` },
    body: { family: "Open Sans", weight: 400, xHeightRatio: 0.535, stack: `"Open Sans", ${SANS_FALLBACK}` },
    why: "The most conservative option: informal letterforms with unambiguous shapes, which suits worksheets and learning material.",
  },
];

/** Comfortable-reading ratio of character height to viewing distance. */
export const ADULT_HEIGHT_RATIO = 200; // height = distance / 200
export const EARLY_READER_HEIGHT_RATIO = 150; // more generous for readers under eight
export const EARLY_READER_MAX_AGE = 8;

/** A CSS reference pixel is 1/96 inch, so one CSS px is 25.4/96 mm. */
export const MM_PER_CSS_PX = 25.4 / 96;

/** Typical viewing distances in millimetres. */
export const CONTEXTS = [
  { id: "book", label: "Picture book / worksheet", distanceMm: 300 },
  { id: "tablet", label: "Tablet on a lap", distanceMm: 400 },
  { id: "laptop", label: "Laptop screen", distanceMm: 550 },
  { id: "tv", label: "TV across a room", distanceMm: 2500 },
  { id: "poster", label: "Classroom poster", distanceMm: 3000 },
];

/** Lowest weight that still holds together in a rounded face at small sizes. */
export const MIN_BODY_WEIGHT = 400;

const isPositive = (value) => Number.isFinite(value) && value > 0;

/**
 * Minimum font size for comfortable reading at a given distance and reader age.
 * The ratio gives a required x-height; dividing by the face's x-height ratio
 * turns that into a font size.
 */
export function minimumReadableSize({ distanceMm, readerAge, xHeightRatio }) {
  if (!isPositive(distanceMm)) return { error: "Viewing distance must be greater than zero." };
  if (!isPositive(readerAge) || readerAge > 18) {
    return { error: "Reader age should be between 1 and 18 for this calculation." };
  }
  if (!isPositive(xHeightRatio) || xHeightRatio >= 1) {
    return { error: "x-height ratio must be between 0 and 1." };
  }

  const ratio = readerAge < EARLY_READER_MAX_AGE ? EARLY_READER_HEIGHT_RATIO : ADULT_HEIGHT_RATIO;
  const xHeightMm = distanceMm / ratio;
  const xHeightPx = xHeightMm / MM_PER_CSS_PX;
  const fontSizePx = xHeightPx / xHeightRatio;

  return {
    ratioUsed: ratio,
    xHeightMm: Math.round(xHeightMm * 100) / 100,
    xHeightPx: Math.round(xHeightPx * 100) / 100,
    fontSizePx: Math.round(fontSizePx * 10) / 10,
    fontSizePt: Math.round((fontSizePx * 0.75) * 10) / 10, // 1 pt = 4/3 CSS px
  };
}

/** Does the size you have chosen clear the minimum? */
export function checkSize({ chosenPx, minimumPx }) {
  if (!isPositive(chosenPx)) return { error: "Chosen font size must be greater than zero." };
  if (!isPositive(minimumPx)) return { error: "Minimum font size must be greater than zero." };
  const headroom = chosenPx / minimumPx;
  if (headroom < 1) {
    return {
      headroom,
      pass: false,
      note: `Too small — raise it to at least ${Math.ceil(minimumPx)} px for this distance and reader age.`,
    };
  }
  if (headroom < 1.15) {
    return { headroom, pass: true, note: "Just clears the minimum. Comfortable, but leave no less headroom than this." };
  }
  return { headroom, pass: true, note: `Comfortable — ${Math.round((headroom - 1) * 100)}% above the minimum.` };
}

/**
 * Rounded display faces need a little extra word spacing for early readers,
 * because tightly-set words blur into one shape before word recognition is
 * automatic. Reading research on beginner readers supports wider spacing;
 * a practical starting point is one and a quarter of the default word space.
 */
export const EARLY_READER_WORD_SPACING_EM = 0.16;
export const EARLY_READER_LETTER_SPACING_EM = 0.02;
export const EARLY_READER_LINE_HEIGHT = 1.7;
export const STANDARD_LINE_HEIGHT = 1.5;

export function spacingAdvice({ readerAge }) {
  if (!isPositive(readerAge) || readerAge > 18) {
    return { error: "Reader age should be between 1 and 18 for this calculation." };
  }
  const early = readerAge < EARLY_READER_MAX_AGE;
  return {
    early,
    letterSpacingEm: early ? EARLY_READER_LETTER_SPACING_EM : 0,
    wordSpacingEm: early ? EARLY_READER_WORD_SPACING_EM : 0,
    lineHeight: early ? EARLY_READER_LINE_HEIGHT : STANDARD_LINE_HEIGHT,
    note: early
      ? "Beginner readers decode letter by letter, so open the letter, word and line spacing."
      : "Standard spacing is fine once word recognition is automatic; keep line height at 1.5 or above.",
  };
}

export function buildFontUrl(pair) {
  if (!pair || !pair.heading || !pair.body) return { error: "Pick a font pair first." };
  const families = [
    `${pair.heading.family.replace(/ /g, "+")}:wght@${pair.heading.weight}`,
    `${pair.body.family.replace(/ /g, "+")}:wght@${pair.body.weight}`,
  ];
  return { url: `https://fonts.googleapis.com/css2?family=${families.join("&family=")}&display=swap` };
}

export const ROOT_FONT_SIZE_PX = 16;

/** Everything the page needs, from one call. */
export function buildKidsReport({ pairId, contextId, readerAge, bodySizePx, headingScale = 2 }) {
  const pair = PAIRS.find((item) => item.id === pairId);
  if (!pair) return { error: "Pick one of the kids brand font pairs." };
  const context = CONTEXTS.find((item) => item.id === contextId);
  if (!context) return { error: "Pick a reading context." };
  if (!isPositive(bodySizePx) || bodySizePx > 200) {
    return { error: "Body size should be a positive value up to 200 px." };
  }
  if (!isPositive(headingScale) || headingScale < 1 || headingScale > 6) {
    return { error: "Heading multiplier should be between 1 and 6." };
  }

  const minimum = minimumReadableSize({
    distanceMm: context.distanceMm,
    readerAge,
    xHeightRatio: pair.body.xHeightRatio,
  });
  if (minimum.error) return minimum;

  const check = checkSize({ chosenPx: bodySizePx, minimumPx: minimum.fontSizePx });
  if (check.error) return check;

  const spacing = spacingAdvice({ readerAge });
  if (spacing.error) return spacing;

  const headingPx = Math.round(bodySizePx * headingScale * 10) / 10;

  const css = `:root {
  --font-heading: ${pair.heading.stack};
  --font-body: ${pair.body.stack};
}

h1, h2, h3 {
  font-family: var(--font-heading);
  font-weight: ${pair.heading.weight};
  font-size: ${Math.round((headingPx / ROOT_FONT_SIZE_PX) * 1000) / 1000}rem;
  line-height: 1.15;
}

body {
  font-family: var(--font-body);
  font-weight: ${pair.body.weight};
  font-size: ${Math.round((bodySizePx / ROOT_FONT_SIZE_PX) * 1000) / 1000}rem;
  line-height: ${spacing.lineHeight};
  letter-spacing: ${spacing.letterSpacingEm}em;
  word-spacing: ${spacing.wordSpacingEm}em;
}`;

  const fontUrl = buildFontUrl(pair);

  return { pair, context, minimum, check, spacing, headingPx, css, fontUrl: fontUrl.url };
}
