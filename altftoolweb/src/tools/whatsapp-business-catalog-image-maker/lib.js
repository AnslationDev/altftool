/**
 * WhatsApp Business Catalog Image Maker — pure sizing, legibility and geometry maths.
 * No React, no DOM. The page component paints the plan this module returns.
 */

/**
 * WhatsApp Business catalogue image requirements.
 * Product photos have to be at least 500x500 pixels, are shown in a square
 * tile, and the uploaded file must stay under 5 MB in JPG or PNG.
 * 1024x1024 is the practical target: it survives a 3x phone screen without
 * getting anywhere near the file cap.
 */
export const WHATSAPP_CATALOG_SPEC = {
  aspect: 1,
  minPx: 500,
  recommendedPx: 1024,
  maxUploadBytes: 5 * 1024 * 1024,
};

export const EXPORT_SIZES = [500, 800, 1024, 1600];

/**
 * Catalogue grid geometry on a typical phone.
 * 390 points is the logical width of a modern 6.1-inch handset, the catalogue
 * shows two product tiles per row, and there is a gutter either side and
 * between them.
 */
export const PHONE_WIDTH_PT = 390;
export const CATALOG_COLUMNS = 2;
export const CATALOG_GUTTER_PT = 12;

/** Smallest comfortable UI text size in points; below this a burned-in label stops being readable. */
export const MIN_READABLE_PT = 11;

/**
 * WhatsApp rounds the corners of catalogue tiles. A corner radius of r cuts the
 * corner back by r - r/sqrt(2) along the diagonal, which is how far content has
 * to be inset to survive the rounding.
 */
export const TILE_CORNER_RADIUS_SHARE = 0.06;
export const CORNER_INSET_FACTOR = 1 - 1 / Math.SQRT2;

/** WCAG 2.1 thresholds used for the burned-in label and price badge. */
export const WCAG_NORMAL_TEXT_RATIO = 4.5;
export const WCAG_LARGE_TEXT_RATIO = 3;

/** Average advance width of a bold sans-serif glyph as a share of the font size. */
export const AVG_GLYPH_WIDTH_RATIO = 0.55;

export const BADGE_POSITIONS = [
  { id: "bottom-left", name: "Bottom left", xShare: 0, yShare: 1 },
  { id: "bottom-right", name: "Bottom right", xShare: 1, yShare: 1 },
  { id: "top-left", name: "Top left", xShare: 0, yShare: 0 },
  { id: "top-right", name: "Top right", xShare: 1, yShare: 0 },
];

export const THEMES = [
  { id: "paper", name: "Paper", bg: { h: 40, s: 34, l: 95 }, ink: { h: 24, s: 30, l: 14 }, accent: { h: 142, s: 62, l: 26 } },
  { id: "charcoal", name: "Charcoal", bg: { h: 220, s: 12, l: 14 }, ink: { h: 0, s: 0, l: 100 }, accent: { h: 142, s: 66, l: 48 } },
  { id: "mint", name: "Mint", bg: { h: 158, s: 40, l: 92 }, ink: { h: 162, s: 44, l: 14 }, accent: { h: 162, s: 62, l: 24 } },
  { id: "sand", name: "Sand", bg: { h: 32, s: 44, l: 86 }, ink: { h: 26, s: 46, l: 16 }, accent: { h: 14, s: 72, l: 32 } },
  { id: "sky", name: "Sky", bg: { h: 202, s: 56, l: 92 }, ink: { h: 214, s: 48, l: 16 }, accent: { h: 214, s: 72, l: 32 } },
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

/** Width of one catalogue tile in points on a given phone width. */
export function computeTileWidthPt({
  phoneWidthPt = PHONE_WIDTH_PT,
  columns = CATALOG_COLUMNS,
  gutterPt = CATALOG_GUTTER_PT,
} = {}) {
  const width = Number(phoneWidthPt);
  const cols = Math.round(Number(columns));
  const gutter = Number(gutterPt);
  if (!(width > 0)) return { error: "Phone width must be greater than zero." };
  if (!(cols >= 1)) return { error: "There must be at least one column." };
  if (!(gutter >= 0)) return { error: "Gutter cannot be negative." };
  const tile = (width - gutter * (cols + 1)) / cols;
  if (!(tile > 0)) return { error: "Gutters leave no room for a tile at this phone width." };
  return { tilePt: tile, phoneWidthPt: width, columns: cols, gutterPt: gutter };
}

/**
 * Smallest burned-in text size, in export pixels, that still reads in the
 * catalogue grid. The tile shows the image at tilePt / exportPx scale, so solve
 * fontPx * scale = MIN_READABLE_PT.
 */
export function minLegibleFontPx({ exportPx, tilePt }) {
  const px = Number(exportPx);
  const tile = Number(tilePt);
  if (!(px > 0) || !(tile > 0)) return { error: "Export size and tile width must be greater than zero." };
  return (MIN_READABLE_PT * px) / tile;
}

/** How many characters fit on one line at a given font size and column width. */
export function charBudget({ columnPx, fontPx }) {
  const column = Number(columnPx);
  const font = Number(fontPx);
  if (!(column > 0) || !(font > 0)) return { error: "Column width and font size must be greater than zero." };
  // Nudge by a tiny epsilon so an exact fit is not lost to binary rounding.
  return Math.floor(column / (font * AVG_GLYPH_WIDTH_RATIO) + 1e-9);
}

/** Inset needed so content survives the tile's rounded corners. */
export function cornerSafeInset({ sizePx, radiusShare = TILE_CORNER_RADIUS_SHARE }) {
  const size = Number(sizePx);
  const share = Number(radiusShare);
  if (!(size > 0)) return { error: "Image size must be greater than zero." };
  if (!(share >= 0) || share > 0.5) return { error: "Corner radius share must be between 0 and 0.5." };
  const radius = size * share;
  return { radius, inset: radius * CORNER_INSET_FACTOR };
}

/** Full catalogue image plan. */
export function buildCatalogPlan({
  size = WHATSAPP_CATALOG_SPEC.recommendedPx,
  themeId = "paper",
  productName = "",
  price = "",
  badgeText = "",
  badgePosition = "bottom-left",
  phoneWidthPt = PHONE_WIDTH_PT,
} = {}) {
  const px = Math.round(Number(size));
  if (!Number.isFinite(px) || px <= 0) return { error: "Choose an export size greater than zero." };
  if (px < WHATSAPP_CATALOG_SPEC.minPx) {
    return { error: `WhatsApp needs catalogue images of at least ${WHATSAPP_CATALOG_SPEC.minPx}x${WHATSAPP_CATALOG_SPEC.minPx} px.` };
  }
  if (!String(productName).trim()) return { error: "Enter a product name to lay out the tile." };

  const theme = THEMES.find((entry) => entry.id === themeId) ?? THEMES[0];
  const tile = computeTileWidthPt({ phoneWidthPt });
  if (tile.error) return { error: tile.error };

  const minFont = minLegibleFontPx({ exportPx: px, tilePt: tile.tilePt });
  if (minFont.error) return { error: minFont.error };

  const corner = cornerSafeInset({ sizePx: px });
  if (corner.error) return { error: corner.error };

  // Outer margin is 7% of the edge, always at least the corner inset so nothing
  // is clipped by the rounded tile.
  const margin = Math.round(Math.max(px * 0.07, corner.inset));
  const column = px - margin * 2;

  const nameFont = Math.max(Math.ceil(minFont), Math.round(px * 0.062));
  const priceFont = Math.round(nameFont * 1.35);
  const badgeFont = Math.max(Math.round(minFont * 0.85), Math.round(px * 0.036));

  const nameBudget = charBudget({ columnPx: column, fontPx: nameFont });
  if (nameBudget.error) return { error: nameBudget.error };

  const anchor = BADGE_POSITIONS.find((entry) => entry.id === badgePosition) ?? BADGE_POSITIONS[0];
  const badgeLabel = String(badgeText).trim();
  const badgePadding = Math.round(badgeFont * 0.7);
  const badgeWidth = badgeLabel
    ? Math.round(badgeLabel.length * badgeFont * AVG_GLYPH_WIDTH_RATIO + badgePadding * 2)
    : 0;
  const badgeHeight = badgeLabel ? Math.round(badgeFont + badgePadding * 1.4) : 0;
  const badge = badgeLabel
    ? {
        text: badgeLabel,
        fontSize: badgeFont,
        padding: badgePadding,
        width: badgeWidth,
        height: badgeHeight,
        x: anchor.xShare === 0 ? margin : px - margin - badgeWidth,
        y: anchor.yShare === 0 ? margin : px - margin - badgeHeight,
      }
    : null;

  const nameContrast = contrastRatio(hslToRgb(theme.ink), hslToRgb(theme.bg));
  const badgeContrast = contrastRatio(hslToRgb(theme.bg), hslToRgb(theme.accent));

  const warnings = [];
  const name = String(productName).trim();
  if (name.length > nameBudget) {
    warnings.push(
      `The product name is ${name.length} characters; only about ${nameBudget} fit on one line at ${nameFont} px, so it will wrap.`,
    );
  }
  if (nameFont < minFont) {
    warnings.push(
      `Text below ${Math.round(minFont)} px stops being readable once the catalogue shrinks the image to a ${Math.round(tile.tilePt)} pt tile.`,
    );
  }
  if (nameContrast < WCAG_NORMAL_TEXT_RATIO) {
    warnings.push(`Product name contrast is ${nameContrast.toFixed(2)}:1, below the ${WCAG_NORMAL_TEXT_RATIO}:1 WCAG asks for.`);
  }
  if (badge && badgeContrast < WCAG_NORMAL_TEXT_RATIO) {
    warnings.push(`Badge contrast is ${badgeContrast.toFixed(2)}:1, below the ${WCAG_NORMAL_TEXT_RATIO}:1 WCAG asks for.`);
  }
  if (px < WHATSAPP_CATALOG_SPEC.recommendedPx) {
    warnings.push(
      `${px} px clears the ${WHATSAPP_CATALOG_SPEC.minPx} px minimum but softens on a 3x screen — ${WHATSAPP_CATALOG_SPEC.recommendedPx} px is the safer target.`,
    );
  }

  return {
    size: px,
    theme,
    tile,
    minFont,
    corner,
    margin,
    column,
    name: { text: name, fontSize: nameFont, budget: nameBudget, lineHeightRatio: 1.14 },
    price: { text: String(price).trim(), fontSize: priceFont },
    badge,
    nameContrast,
    badgeContrast,
    warnings,
  };
}

/** Check an exported file against the catalogue upload rules. */
export function checkCatalogImage({ width, height, bytes }) {
  const w = Number(width);
  const h = Number(height);
  const size = Number(bytes);
  if (!(w > 0) || !(h > 0)) return { error: "Export dimensions must be positive." };
  if (!(size >= 0)) return { error: "File size must be zero or more." };
  const checks = [
    { label: "Square 1:1 tile", pass: w === h },
    { label: `At least ${WHATSAPP_CATALOG_SPEC.minPx} px per side`, pass: Math.min(w, h) >= WHATSAPP_CATALOG_SPEC.minPx },
    {
      label: `Under the ${Math.round(WHATSAPP_CATALOG_SPEC.maxUploadBytes / (1024 * 1024))} MB file limit`,
      pass: size <= WHATSAPP_CATALOG_SPEC.maxUploadBytes,
    },
  ];
  return { checks, ready: checks.every((check) => check.pass) };
}
