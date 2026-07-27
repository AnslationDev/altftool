/**
 * Wedding Font Pairing — script/serif pairings plus print legibility maths.
 * Pure module: no React, no DOM, no globals.
 */

/** The PostScript point is defined as exactly 1/72 inch, and 1 inch = 25.4 mm. */
export const MM_PER_INCH = 25.4;
export const PT_PER_INCH = 72;
export const MM_PER_PT = MM_PER_INCH / PT_PER_INCH; // 0.352777... mm

/**
 * Reference legibility threshold. The European Commission's "Guideline on the
 * readability of the labelling and package leaflet of medicinal products for
 * human use" (2009) asks for a minimum type size of 9 point measured in Times
 * New Roman, with an x-height of not less than 1.4 mm. It is a labelling rule,
 * not a stationery rule, but it is the clearest published number for "text an
 * adult can read comfortably on paper", so it is used here as a benchmark.
 */
export const X_HEIGHT_BENCHMARK_MM = 1.4;

/** Below this the text is decorative — readable only up close and in good light. */
export const X_HEIGHT_FLOOR_MM = 1;

/**
 * Representative x-height as a fraction of the em, by type classification.
 * Real families vary; the tool lets you override this per project.
 */
export const X_HEIGHT_RATIO = {
  formalScript: 0.32,
  casualScript: 0.4,
  oldstyleSerif: 0.44,
  transitionalSerif: 0.48,
  didoneSerif: 0.47,
  capsSerif: 0.46,
  humanistSans: 0.52,
  geometricSans: 0.5,
  grotesqueSans: 0.53,
};

/**
 * Representative average advance width of running lowercase text, in em.
 * Used only to estimate characters per line.
 */
export const AVG_CHAR_WIDTH_EM = {
  formalScript: 0.34,
  casualScript: 0.42,
  oldstyleSerif: 0.46,
  transitionalSerif: 0.49,
  didoneSerif: 0.46,
  capsSerif: 0.55,
  humanistSans: 0.5,
  geometricSans: 0.52,
  grotesqueSans: 0.5,
};

/** Bringhurst's readability band for continuous text, in characters per line. */
export const MEASURE_MIN_CPL = 45;
export const MEASURE_MAX_CPL = 75;

/**
 * Common invitation trim sizes. ISO A sizes are from ISO 216; the imperial
 * sizes are converted from inches at 25.4 mm to the inch.
 */
export const CARD_SIZES = [
  { id: "a6", label: "A6 (ISO 216)", widthMm: 105, heightMm: 148 },
  { id: "a5", label: "A5 (ISO 216)", widthMm: 148, heightMm: 210 },
  { id: "dl", label: "DL (ISO 216)", widthMm: 99, heightMm: 210 },
  { id: "5x7", label: '5 × 7 in', widthMm: 127, heightMm: 177.8 },
  { id: "4.5x6.25", label: '4.5 × 6.25 in', widthMm: 114.3, heightMm: 158.75 },
  { id: "square148", label: "Square 148 mm", widthMm: 148, heightMm: 148 },
];

/** CSS defines one inch as exactly 96 px, so 1pt = 96/72 = 4/3 CSS pixels. */
export const CSS_PX_PER_INCH = 96;

/** Print resolutions offset litho and digital presses normally ask for. */
export const PRINT_DPI_OPTIONS = [300, 350, 600];

export const WEDDING_PAIRINGS = [
  {
    id: "great-vibes-cinzel-cormorant",
    label: "Classic copperplate",
    script: {
      family: "Great Vibes",
      klass: "formalScript",
      weight: 400,
      google: "Great+Vibes",
      stack: '"Great Vibes", "Snell Roundhand", cursive',
    },
    accent: {
      family: "Cinzel",
      klass: "capsSerif",
      weight: 500,
      google: "Cinzel:wght@400;600",
      stack: "Cinzel, Trajan, Georgia, serif",
    },
    body: {
      family: "Cormorant Garamond",
      klass: "oldstyleSerif",
      weight: 400,
      google: "Cormorant+Garamond:ital,wght@0,400;0,600;1,400",
      stack: '"Cormorant Garamond", Garamond, Georgia, serif',
    },
    note: "The traditional engraved look. Cormorant Garamond has a small x-height, so print it a point or two larger than you would a workhorse serif.",
  },
  {
    id: "pinyon-cormorantsc-ebgaramond",
    label: "Engraved formal",
    script: {
      family: "Pinyon Script",
      klass: "formalScript",
      weight: 400,
      google: "Pinyon+Script",
      stack: '"Pinyon Script", "Apple Chancery", cursive',
    },
    accent: {
      family: "Cormorant SC",
      klass: "capsSerif",
      weight: 500,
      google: "Cormorant+SC:wght@400;600",
      stack: '"Cormorant SC", Garamond, Georgia, serif',
    },
    body: {
      family: "EB Garamond",
      klass: "oldstyleSerif",
      weight: 400,
      google: "EB+Garamond:ital,wght@0,400;0,600;1,400",
      stack: '"EB Garamond", Garamond, Georgia, serif',
    },
    note: "Pinyon Script has fine hairlines that can drop out in foil or letterpress. Ask your printer for a minimum stroke width before you commit.",
  },
  {
    id: "parisienne-josefin-lato",
    label: "Modern minimal",
    script: {
      family: "Parisienne",
      klass: "casualScript",
      weight: 400,
      google: "Parisienne",
      stack: "Parisienne, cursive",
    },
    accent: {
      family: "Josefin Sans",
      klass: "geometricSans",
      weight: 400,
      google: "Josefin+Sans:wght@300;400;600",
      stack: '"Josefin Sans", system-ui, sans-serif',
    },
    body: {
      family: "Lato",
      klass: "humanistSans",
      weight: 400,
      google: "Lato:ital,wght@0,400;0,700;1,400",
      stack: "Lato, system-ui, Arial, sans-serif",
    },
    note: "Josefin Sans sits on a very high waistline with a small x-height for a sans — set it in caps for names and dates rather than as running text.",
  },
  {
    id: "allura-cinzel-libre",
    label: "Garden formal",
    script: {
      family: "Allura",
      klass: "formalScript",
      weight: 400,
      google: "Allura",
      stack: "Allura, cursive",
    },
    accent: {
      family: "Cinzel",
      klass: "capsSerif",
      weight: 400,
      google: "Cinzel:wght@400;600",
      stack: "Cinzel, Georgia, serif",
    },
    body: {
      family: "Libre Baskerville",
      klass: "transitionalSerif",
      weight: 400,
      google: "Libre+Baskerville:ital,wght@0,400;0,700;1,400",
      stack: '"Libre Baskerville", Baskerville, Georgia, serif',
    },
    note: "Libre Baskerville has one of the largest x-heights of the Google serifs, so the details panel stays readable even at 9 pt.",
  },
  {
    id: "dancing-montserrat-nunito",
    label: "Relaxed celebration",
    script: {
      family: "Dancing Script",
      klass: "casualScript",
      weight: 600,
      google: "Dancing+Script:wght@400;600;700",
      stack: '"Dancing Script", cursive',
    },
    accent: {
      family: "Montserrat",
      klass: "geometricSans",
      weight: 500,
      google: "Montserrat:wght@400;500;700",
      stack: "Montserrat, system-ui, Arial, sans-serif",
    },
    body: {
      family: "Nunito Sans",
      klass: "humanistSans",
      weight: 400,
      google: "Nunito+Sans:ital,wght@0,400;0,600;1,400",
      stack: '"Nunito Sans", system-ui, Arial, sans-serif',
    },
    note: "Dancing Script keeps a large x-height for a script, which makes it the safest choice if guests will read the card at arm's length.",
  },
  {
    id: "italianno-marcellus-lora",
    label: "Romantic classic",
    script: {
      family: "Italianno",
      klass: "formalScript",
      weight: 400,
      google: "Italianno",
      stack: "Italianno, cursive",
    },
    accent: {
      family: "Marcellus",
      klass: "capsSerif",
      weight: 400,
      google: "Marcellus",
      stack: "Marcellus, Georgia, serif",
    },
    body: {
      family: "Lora",
      klass: "transitionalSerif",
      weight: 400,
      google: "Lora:ital,wght@0,400;0,600;1,400",
      stack: "Lora, Georgia, serif",
    },
    note: "Italianno is very light and very sloped — reserve it for the couple's names at 40 pt or more and never for addresses.",
  },
  {
    id: "sacramento-cormorant-karla",
    label: "Contemporary calligraphy",
    script: {
      family: "Sacramento",
      klass: "casualScript",
      weight: 400,
      google: "Sacramento",
      stack: "Sacramento, cursive",
    },
    accent: {
      family: "Cormorant Garamond",
      klass: "oldstyleSerif",
      weight: 600,
      google: "Cormorant+Garamond:wght@400;600",
      stack: '"Cormorant Garamond", Garamond, serif',
    },
    body: {
      family: "Karla",
      klass: "grotesqueSans",
      weight: 400,
      google: "Karla:ital,wght@0,400;0,600;1,400",
      stack: "Karla, Arial, sans-serif",
    },
    note: "A monoline script over a grotesque reads current rather than traditional. Karla's large x-height gives you room to drop the details to 8.5 pt if space is tight.",
  },
  {
    id: "tangerine-cinzeldec-crimson",
    label: "Ornate heritage",
    script: {
      family: "Tangerine",
      klass: "formalScript",
      weight: 700,
      google: "Tangerine:wght@400;700",
      stack: "Tangerine, cursive",
    },
    accent: {
      family: "Cinzel Decorative",
      klass: "capsSerif",
      weight: 400,
      google: "Cinzel+Decorative:wght@400;700",
      stack: '"Cinzel Decorative", Georgia, serif',
    },
    body: {
      family: "Crimson Text",
      klass: "oldstyleSerif",
      weight: 400,
      google: "Crimson+Text:ital,wght@0,400;0,600;1,400",
      stack: '"Crimson Text", Georgia, serif',
    },
    note: "Tangerine is drawn small on the em, so its optical size runs well below its point size — expect to set it 30-50% larger than a normal display face.",
  },
];

function round(value, decimals) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  const result = Math.round(value * factor) / factor;
  return result === 0 ? 0 : result;
}

/** Points to millimetres. */
export function ptToMm(pt) {
  if (!Number.isFinite(pt)) return 0;
  return pt * MM_PER_PT;
}

/** Points to device pixels at a given output resolution. */
export function ptToPx(pt, dpi) {
  if (!Number.isFinite(pt) || !(dpi > 0)) return 0;
  return (pt / PT_PER_INCH) * dpi;
}

/** Millimetres to device pixels at a given output resolution. */
export function mmToPx(mm, dpi) {
  if (!Number.isFinite(mm) || !(dpi > 0)) return 0;
  return (mm / MM_PER_INCH) * dpi;
}

/** Physical x-height in millimetres for a face set at a point size. */
export function xHeightMm({ sizePt, xHeightRatio }) {
  if (!(sizePt > 0) || !(xHeightRatio > 0)) return 0;
  return sizePt * xHeightRatio * MM_PER_PT;
}

/** Legibility verdict for a printed x-height. */
export function legibilityVerdict(mm) {
  if (!(mm > 0)) return { level: "danger", text: "No printable size." };
  if (mm >= X_HEIGHT_BENCHMARK_MM) {
    return {
      level: "ok",
      text: `At or above the ${X_HEIGHT_BENCHMARK_MM} mm x-height benchmark — comfortable for most adult readers in normal light.`,
    };
  }
  if (mm >= X_HEIGHT_FLOOR_MM) {
    return {
      level: "warn",
      text: `Below the ${X_HEIGHT_BENCHMARK_MM} mm benchmark. Readable up close, but older guests will struggle — raise the point size or pick a face with a larger x-height.`,
    };
  }
  return {
    level: "danger",
    text: `Under ${X_HEIGHT_FLOOR_MM} mm. Treat this as decoration, not information — never set a date, address or RSVP detail this small.`,
  };
}

export function measureVerdict(cpl) {
  if (!(cpl > 0)) return { level: "danger", text: "No usable text width." };
  if (cpl < MEASURE_MIN_CPL) {
    return {
      level: "warn",
      text: `Under ${MEASURE_MIN_CPL} characters per line — normal for a centred invitation, where short lines are set deliberately.`,
    };
  }
  if (cpl > MEASURE_MAX_CPL) {
    return {
      level: "warn",
      text: `Over ${MEASURE_MAX_CPL} characters per line — widen the margins or raise the size so the details panel does not read as a paragraph.`,
    };
  }
  return { level: "ok", text: `Inside the ${MEASURE_MIN_CPL}-${MEASURE_MAX_CPL} character band.` };
}

/**
 * Full invitation typography calculation.
 * Returns { error } for any invalid input instead of a bad number.
 */
export function computeWeddingType({
  pairingId,
  cardId,
  marginMm,
  bodyPt,
  namesPt,
  accentPt,
  dpi,
  xHeightOverride,
}) {
  const pairing = WEDDING_PAIRINGS.find((item) => item.id === pairingId);
  if (!pairing) return { error: "Choose one of the listed pairings." };

  const card = CARD_SIZES.find((item) => item.id === cardId);
  if (!card) return { error: "Choose one of the listed card sizes." };

  const margin = Number(marginMm);
  const body = Number(bodyPt);
  const names = Number(namesPt);
  const accent = Number(accentPt);
  const resolution = Number(dpi);
  const override = Number(xHeightOverride);

  if (![margin, body, names, accent, resolution].every((n) => Number.isFinite(n))) {
    return { error: "Enter a number in every field." };
  }
  if (margin < 0) return { error: "Margin cannot be negative." };
  if (margin * 2 >= card.widthMm) {
    return { error: "Margins are wider than the card — reduce the margin." };
  }
  if (body < 4 || body > 40) return { error: "Details size should be between 4 pt and 40 pt." };
  if (names < 8 || names > 200) return { error: "Names size should be between 8 pt and 200 pt." };
  if (accent < 4 || accent > 120) return { error: "Accent size should be between 4 pt and 120 pt." };
  if (!PRINT_DPI_OPTIONS.includes(resolution)) {
    return { error: `Print resolution should be one of ${PRINT_DPI_OPTIONS.join(", ")} dpi.` };
  }

  const bodyRatio =
    Number.isFinite(override) && override > 0
      ? override
      : (X_HEIGHT_RATIO[pairing.body.klass] ?? 0.5);
  if (bodyRatio < 0.2 || bodyRatio > 0.7) {
    return { error: "x-height ratio should be between 0.20 and 0.70 of the em." };
  }

  const textWidthMm = card.widthMm - margin * 2;
  const textHeightMm = card.heightMm - margin * 2;
  if (!(textWidthMm > 0) || !(textHeightMm > 0)) {
    return { error: "Margins leave no printable area — reduce the margin." };
  }

  const bodyXHeight = xHeightMm({ sizePt: body, xHeightRatio: bodyRatio });
  const scriptRatio = X_HEIGHT_RATIO[pairing.script.klass] ?? 0.35;
  const namesXHeight = xHeightMm({ sizePt: names, xHeightRatio: scriptRatio });
  const accentRatio = X_HEIGHT_RATIO[pairing.accent.klass] ?? 0.48;
  const accentXHeight = xHeightMm({ sizePt: accent, xHeightRatio: accentRatio });

  const bodyWidthEm = AVG_CHAR_WIDTH_EM[pairing.body.klass] ?? 0.5;
  const bodyAdvanceMm = body * bodyWidthEm * MM_PER_PT;
  const cpl = bodyAdvanceMm > 0 ? textWidthMm / bodyAdvanceMm : 0;

  /** Point size needed to reach the benchmark x-height with this face. */
  const bodyPtForBenchmark = X_HEIGHT_BENCHMARK_MM / (bodyRatio * MM_PER_PT);

  return {
    pairing,
    card,
    marginMm: margin,
    dpi: resolution,
    textWidthMm: round(textWidthMm, 1),
    textHeightMm: round(textHeightMm, 1),
    bodyPt: body,
    namesPt: names,
    accentPt: accent,
    bodyXHeightRatio: round(bodyRatio, 3),
    bodyXHeightMm: round(bodyXHeight, 2),
    namesXHeightMm: round(namesXHeight, 2),
    accentXHeightMm: round(accentXHeight, 2),
    bodyPtForBenchmark: round(bodyPtForBenchmark, 1),
    legibility: legibilityVerdict(bodyXHeight),
    charsPerLine: round(cpl, 1),
    measure: measureVerdict(cpl),
    canvasWidthPx: Math.round(mmToPx(card.widthMm, resolution)),
    canvasHeightPx: Math.round(mmToPx(card.heightMm, resolution)),
    bodyPx: round(ptToPx(body, resolution), 1),
    namesPx: round(ptToPx(names, resolution), 1),
    accentPx: round(ptToPx(accent, resolution), 1),
    bodyMm: round(ptToMm(body), 2),
    namesMm: round(ptToMm(names), 2),
    // Actual-size on-screen equivalents, for the preview panel.
    previewBodyPx: round(ptToPx(body, CSS_PX_PER_INCH), 2),
    previewNamesPx: round(ptToPx(names, CSS_PX_PER_INCH), 2),
    previewAccentPx: round(ptToPx(accent, CSS_PX_PER_INCH), 2),
    previewWidthPx: round(mmToPx(textWidthMm, CSS_PX_PER_INCH), 1),
    previewCardWidthPx: round(mmToPx(card.widthMm, CSS_PX_PER_INCH), 1),
  };
}

export function googleFontsHref(pairing) {
  if (!pairing) return "";
  const seen = new Set();
  const families = [pairing.script.google, pairing.accent.google, pairing.body.google]
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
  const { pairing } = result;
  return [
    `@import url("${googleFontsHref(pairing)}");`,
    "",
    "/* Point sizes are for print. On screen, 1pt = 1.333px at 96 dpi. */",
    ":root {",
    `  --font-names: ${pairing.script.stack};`,
    `  --font-accent: ${pairing.accent.stack};`,
    `  --font-details: ${pairing.body.stack};`,
    "}",
    "",
    ".invite-names {",
    "  font-family: var(--font-names);",
    `  font-weight: ${pairing.script.weight};`,
    `  font-size: ${result.namesPt}pt;`,
    "  line-height: 1.1;",
    "}",
    "",
    ".invite-accent {",
    "  font-family: var(--font-accent);",
    `  font-weight: ${pairing.accent.weight};`,
    `  font-size: ${result.accentPt}pt;`,
    "  letter-spacing: 0.08em;",
    "  text-transform: uppercase;",
    "}",
    "",
    ".invite-details {",
    "  font-family: var(--font-details);",
    `  font-weight: ${pairing.body.weight};`,
    `  font-size: ${result.bodyPt}pt;`,
    "  line-height: 1.5;",
    `  max-width: ${result.textWidthMm}mm;`,
    "}",
  ].join("\n");
}

export function buildSummary(result) {
  if (!result || result.error) return "";
  return [
    "Wedding Font Pairing",
    `Names: ${result.pairing.script.family} at ${result.namesPt}pt (x-height ${result.namesXHeightMm} mm)`,
    `Accent: ${result.pairing.accent.family} at ${result.accentPt}pt (x-height ${result.accentXHeightMm} mm)`,
    `Details: ${result.pairing.body.family} at ${result.bodyPt}pt (x-height ${result.bodyXHeightMm} mm)`,
    `Legibility: ${result.legibility.text}`,
    `Card: ${result.card.label} — ${result.card.widthMm} x ${result.card.heightMm} mm, ${result.marginMm} mm margins`,
    `Text block: ${result.textWidthMm} x ${result.textHeightMm} mm, about ${result.charsPerLine} characters per line`,
    `Artwork at ${result.dpi} dpi: ${result.canvasWidthPx} x ${result.canvasHeightPx} px`,
    `To reach the ${X_HEIGHT_BENCHMARK_MM} mm benchmark this face needs about ${result.bodyPtForBenchmark}pt`,
  ].join("\n");
}
