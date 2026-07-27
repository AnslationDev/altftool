/**
 * Food And Cafe Font Pairing — pair table, printed-menu minimum size and
 * leader-dot price alignment. Pure module: no React, no DOM, no clock.
 *
 * A menu is a print typography problem: it is read at arm's length, often in
 * low light, and every line has to align a dish name with a price. Both are
 * computed here from measurable inputs rather than guessed.
 */

const SERIF_FALLBACK = 'Georgia, "Times New Roman", "Iowan Old Style", serif';
const SANS_FALLBACK = 'system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif';

export const PAIRS = [
  {
    id: "playfair-karla",
    name: "Playfair Display + Karla",
    heading: { family: "Playfair Display", weight: 600, stack: `"Playfair Display", ${SERIF_FALLBACK}` },
    body: { family: "Karla", weight: 400, avgCharEm: 0.48, stack: `"Karla", ${SANS_FALLBACK}` },
    why: "Bistro-standard: an editorial serif for course headings with a compact grotesque for dish descriptions.",
  },
  {
    id: "lora-source",
    name: "Lora + Source Sans 3",
    heading: { family: "Lora", weight: 600, stack: `"Lora", ${SERIF_FALLBACK}` },
    body: { family: "Source Sans 3", weight: 400, avgCharEm: 0.47, stack: `"Source Sans 3", ${SANS_FALLBACK}` },
    why: "Lora's brushed serifs read as handmade without being twee; Source Sans 3 stays legible at 9 pt on a printed card.",
  },
  {
    id: "cormorant-jost",
    name: "Cormorant + Jost",
    heading: { family: "Cormorant", weight: 600, stack: `"Cormorant", ${SERIF_FALLBACK}` },
    body: { family: "Jost", weight: 400, avgCharEm: 0.46, stack: `"Jost", ${SANS_FALLBACK}` },
    why: "For fine dining. Cormorant is a display serif, so keep it above 18 pt and let Jost carry the small print.",
  },
  {
    id: "bitter-open",
    name: "Bitter + Open Sans",
    heading: { family: "Bitter", weight: 600, stack: `"Bitter", ${SERIF_FALLBACK}` },
    body: { family: "Open Sans", weight: 400, avgCharEm: 0.5, stack: `"Open Sans", ${SANS_FALLBACK}` },
    why: "A slab serif built for screens — the safest pick if the same menu has to work as a PDF, a board and a website.",
  },
  {
    id: "amatic-nunito",
    name: "Amatic SC + Nunito Sans",
    heading: { family: "Amatic SC", weight: 700, stack: `"Amatic SC", ${SANS_FALLBACK}` },
    body: { family: "Nunito Sans", weight: 400, avgCharEm: 0.48, stack: `"Nunito Sans", ${SANS_FALLBACK}` },
    why: "Chalkboard cafe energy. Amatic SC is condensed and light, so set it large and never use it for prices.",
  },
  {
    id: "frankruhl-assistant",
    name: "Frank Ruhl Libre + Assistant",
    heading: { family: "Frank Ruhl Libre", weight: 500, stack: `"Frank Ruhl Libre", ${SERIF_FALLBACK}` },
    body: { family: "Assistant", weight: 400, avgCharEm: 0.47, stack: `"Assistant", ${SANS_FALLBACK}` },
    why: "Both families cover Hebrew as well as Latin, which makes this the practical choice for a bilingual menu.",
  },
];

/** 1 pt = 1/72 inch = 25.4/72 mm. */
export const MM_PER_POINT = 25.4 / 72;
/** Cap height is close to 70% of the em in most text faces. */
export const CAP_HEIGHT_RATIO = 0.7;
/** Comfortable-reading ratio of character height to viewing distance. */
export const LEGIBILITY_RATIO = 200;

/**
 * Restaurant lighting is far below an office. Human contrast sensitivity falls
 * as luminance drops, so type has to grow to compensate. These multipliers are
 * design allowances, not photometric measurements.
 */
export const LIGHTING = [
  { id: "bright", label: "Bright daylight cafe", factor: 1 },
  { id: "normal", label: "Normal interior lighting", factor: 1.1 },
  { id: "dim", label: "Dim restaurant / candlelight", factor: 1.25 },
  { id: "very-dim", label: "Very dim bar", factor: 1.4 },
];

const isPositive = (value) => Number.isFinite(value) && value > 0;

/** Smallest comfortable body size on a printed menu, in points. */
export function menuMinimumSize({ readingDistanceMm, lightingFactor = 1 }) {
  if (!isPositive(readingDistanceMm)) return { error: "Reading distance must be greater than zero." };
  if (!isPositive(lightingFactor) || lightingFactor > 3) {
    return { error: "Lighting allowance must be between 0 and 3." };
  }
  const capHeightMm = (readingDistanceMm / LEGIBILITY_RATIO) * lightingFactor;
  const emMm = capHeightMm / CAP_HEIGHT_RATIO;
  const pt = emMm / MM_PER_POINT;
  return {
    capHeightMm: Math.round(capHeightMm * 100) / 100,
    emMm: Math.round(emMm * 100) / 100,
    pt: Math.round(pt * 10) / 10,
    px: Math.round((pt / 0.75) * 10) / 10, // 1 pt = 4/3 CSS px
  };
}

/**
 * Leader dots. Given a column width, the dish name and the price, work out the
 * space left in the middle and how many dot-plus-space units fit into it.
 */
export const LEADER_UNIT_EM = 0.5; // one dot plus one space
export const MIN_GAP_MM = 2; // clear space either side of the leader run

export function leaderDots({ columnWidthMm, fontSizePt, itemChars, priceChars, avgCharEm = 0.48 }) {
  if (!isPositive(columnWidthMm)) return { error: "Column width must be greater than zero." };
  if (!isPositive(fontSizePt)) return { error: "Font size must be greater than zero." };
  if (!isPositive(itemChars) || !isPositive(priceChars)) {
    return { error: "Dish name and price must each have at least one character." };
  }
  if (!isPositive(avgCharEm) || avgCharEm > 1.5) {
    return { error: "Average character width should be between 0 and 1.5 em." };
  }

  const emMm = fontSizePt * MM_PER_POINT;
  const itemMm = Math.floor(itemChars) * avgCharEm * emMm;
  const priceMm = Math.floor(priceChars) * avgCharEm * emMm;
  const availableMm = columnWidthMm - itemMm - priceMm - MIN_GAP_MM * 2;

  if (availableMm <= 0) {
    return {
      error: `The dish name and price already need ${Math.round((itemMm + priceMm) * 10) / 10} mm of a ${columnWidthMm} mm column. Widen the column or drop the type size.`,
    };
  }

  const unitMm = LEADER_UNIT_EM * emMm;
  return {
    itemMm: Math.round(itemMm * 100) / 100,
    priceMm: Math.round(priceMm * 100) / 100,
    availableMm: Math.round(availableMm * 100) / 100,
    unitMm: Math.round(unitMm * 100) / 100,
    dots: Math.floor(availableMm / unitMm),
  };
}

/** How many characters of a dish description fit on one line of the column? */
export function charsPerLine({ columnWidthMm, fontSizePt, avgCharEm = 0.48 }) {
  if (!isPositive(columnWidthMm)) return { error: "Column width must be greater than zero." };
  if (!isPositive(fontSizePt)) return { error: "Font size must be greater than zero." };
  if (!isPositive(avgCharEm) || avgCharEm > 1.5) {
    return { error: "Average character width should be between 0 and 1.5 em." };
  }
  const emMm = fontSizePt * MM_PER_POINT;
  const chars = columnWidthMm / (avgCharEm * emMm);
  let verdict = "comfortable";
  if (chars < 30) verdict = "narrow";
  else if (chars > 70) verdict = "wide";
  return { chars: Math.round(chars * 10) / 10, verdict };
}

export function buildFontUrl(pair) {
  if (!pair || !pair.heading || !pair.body) return { error: "Pick a font pair first." };
  const families = [
    `${pair.heading.family.replace(/ /g, "+")}:wght@${pair.heading.weight}`,
    `${pair.body.family.replace(/ /g, "+")}:wght@${pair.body.weight}`,
  ];
  return { url: `https://fonts.googleapis.com/css2?family=${families.join("&family=")}&display=swap` };
}

/** Everything the page needs. */
export function buildMenuReport({
  pairId,
  lightingId,
  readingDistanceMm,
  columnWidthMm,
  bodySizePt,
  itemChars,
  priceChars,
}) {
  const pair = PAIRS.find((item) => item.id === pairId);
  if (!pair) return { error: "Pick one of the food and cafe font pairs." };
  const lighting = LIGHTING.find((item) => item.id === lightingId);
  if (!lighting) return { error: "Pick a lighting condition." };
  if (!isPositive(bodySizePt) || bodySizePt > 72) {
    return { error: "Body size should be a positive value up to 72 pt." };
  }
  if (!isPositive(columnWidthMm) || columnWidthMm > 500) {
    return { error: "Column width should be a positive value up to 500 mm." };
  }

  const minimum = menuMinimumSize({ readingDistanceMm, lightingFactor: lighting.factor });
  if (minimum.error) return minimum;

  const line = charsPerLine({ columnWidthMm, fontSizePt: bodySizePt, avgCharEm: pair.body.avgCharEm });
  if (line.error) return line;

  const leaders = leaderDots({
    columnWidthMm,
    fontSizePt: bodySizePt,
    itemChars,
    priceChars,
    avgCharEm: pair.body.avgCharEm,
  });

  const passesMinimum = bodySizePt >= minimum.pt;

  const css = `:root {
  --font-heading: ${pair.heading.stack};
  --font-body: ${pair.body.stack};
}

.menu-section {
  font-family: var(--font-heading);
  font-weight: ${pair.heading.weight};
  font-size: ${Math.round(bodySizePt * 1.6 * 10) / 10}pt;
  letter-spacing: 0.02em;
}

.menu-item {
  font-family: var(--font-body);
  font-weight: ${pair.body.weight};
  font-size: ${bodySizePt}pt;
  line-height: 1.45;
  display: flex;
  align-items: baseline;
  gap: ${MIN_GAP_MM}mm;
}

.menu-item .leader {
  flex: 1;
  border-bottom: 1px dotted currentColor;
  transform: translateY(-0.25em);
}

.menu-item .price {
  font-variant-numeric: tabular-nums;
}`;

  const fontUrl = buildFontUrl(pair);

  return { pair, lighting, minimum, line, leaders, passesMinimum, css, fontUrl: fontUrl.url };
}
