/**
 * Logo prompt generator.
 *
 * Two jobs, both deterministic:
 *  1. compose an image-generation prompt from mark type, shape language, palette
 *     strategy and motif;
 *  2. derive the reproduction constraints that decide whether the resulting mark
 *     can actually be used — minimum stroke weight, element budget, clear space
 *     and the pixel size needed for print.
 *
 * No React, no DOM, no clock.
 */

/** A raster feature narrower than one device pixel disappears. Everything below follows from this. */
export const MIN_FEATURE_PX = 1;

/**
 * A shape needs roughly 3 px of body plus a 1 px gap to stay separable from its
 * neighbour once anti-aliasing is applied, so budget 4 px per distinguishable element.
 */
export const PX_PER_ELEMENT = 4;

/** Past a dozen distinct elements a mark stops being a logo and becomes an illustration. */
export const MAX_ELEMENT_BUDGET = 12;

/** Common brand-guide convention: clear space equals half the mark's height on every side. */
export const CLEAR_SPACE_RATIO = 0.5;

/** Millimetres per inch, for the print-size conversion. */
export const MM_PER_INCH = 25.4;

/** Standard favicon raster sizes browsers still request. */
export const FAVICON_SIZES_PX = [16, 32, 48];

/** A wordmark longer than this cannot be read at favicon size; you need a lettermark too. */
export const MAX_FAVICON_WORDMARK_CHARS = 3;

/** Above this many characters a single-line wordmark starts breaking app-bar and card lockups. */
export const MAX_COMFORTABLE_WORDMARK_CHARS = 14;

export const MARK_TYPES = [
  {
    id: "wordmark",
    label: "Wordmark",
    phrase: "a wordmark logotype: the full brand name drawn as custom lettering, no separate symbol",
    whenToUse: "Short, distinctive names that need no explanation.",
    risk: "Illegible below about 24 px, so it always needs a companion lettermark.",
  },
  {
    id: "lettermark",
    label: "Lettermark / monogram",
    phrase: "a lettermark monogram built from the brand initials as a single locked-up glyph",
    whenToUse: "Long or multi-word names, and as the small-size fallback for a wordmark.",
    risk: "Initials alone say nothing about the business; it has to earn recognition.",
  },
  {
    id: "pictorial",
    label: "Pictorial mark",
    phrase: "a pictorial mark: one recognisable object reduced to its simplest silhouette",
    whenToUse: "When one concrete object genuinely stands for the business.",
    risk: "Ties the brand to that object forever — awkward if the product changes.",
  },
  {
    id: "abstract",
    label: "Abstract mark",
    phrase: "an abstract geometric mark, no literal object, built from intersecting simple forms",
    whenToUse: "Broad or technical businesses with no obvious literal symbol.",
    risk: "Meaning has to be built through repetition; it starts as decoration.",
  },
  {
    id: "combination",
    label: "Combination mark",
    phrase: "a combination mark: a compact symbol locked beside the brand name, both usable alone",
    whenToUse: "Most new brands — you get flexibility at both large and small sizes.",
    risk: "Two things to design well instead of one; the lockup needs its own rules.",
  },
  {
    id: "emblem",
    label: "Emblem / badge",
    phrase: "an emblem badge with the name enclosed inside a contained shield or roundel",
    whenToUse: "Heritage, hospitality, education, anything trading on tradition.",
    risk: "The enclosed text vanishes at small sizes and rarely survives as an app icon.",
  },
  {
    id: "mascot",
    label: "Mascot",
    phrase: "a mascot character with a single clear expression, drawn in flat shapes",
    whenToUse: "Consumer brands that want warmth and a recurring character.",
    risk: "Detail-heavy by nature, and expensive to keep consistent across uses.",
  },
];

export const SHAPE_LANGUAGES = [
  { id: "geometric", label: "Strict geometric", phrase: "constructed from perfect circles, squares and 45-degree angles on a visible grid" },
  { id: "rounded", label: "Rounded geometric", phrase: "geometric forms with generously rounded corners and even stroke terminals" },
  { id: "angular", label: "Angular", phrase: "sharp mitred corners, acute angles, forward lean" },
  { id: "organic", label: "Organic", phrase: "hand-modulated curves with varying stroke weight, nothing perfectly symmetrical" },
  { id: "linear", label: "Linear / monoline", phrase: "single continuous monoline stroke of constant weight" },
];

export const PALETTE_STRATEGIES = [
  { id: "mono", label: "Single colour", phrase: "one solid colour on a plain background", printSafe: true },
  { id: "duotone", label: "Two colours", phrase: "two flat solid colours with a clear value difference between them", printSafe: true },
  { id: "accent", label: "Neutral plus accent", phrase: "a neutral dark form with one saturated accent shape", printSafe: true },
  { id: "gradient", label: "Gradient", phrase: "a smooth two-stop gradient across the mark", printSafe: false },
  { id: "full", label: "Multi-colour", phrase: "three or more flat colours in a balanced arrangement", printSafe: true },
];

export const STYLE_ERAS = [
  { id: "modernist", label: "Swiss modernist", phrase: "1960s Swiss modernist restraint, mathematical construction" },
  { id: "techmin", label: "Tech minimal", phrase: "contemporary tech minimalism, generous negative space, no ornament" },
  { id: "retro70", label: "Retro 1970s", phrase: "1970s corporate identity feel, chunky forms and tight counters" },
  { id: "handdrawn", label: "Hand-drawn", phrase: "hand-drawn with visible brush pressure, slightly irregular" },
  { id: "heraldic", label: "Heraldic", phrase: "heraldic construction with symmetry and a contained outline" },
];

export const CONSTRUCTIONS = [
  { id: "grid8", label: "8-point grid", phrase: "constructed on an 8-point grid with consistent stroke weights" },
  { id: "golden", label: "Golden-ratio circles", phrase: "constructed from overlapping circles in golden-ratio proportion" },
  { id: "square", label: "Square bounding box", phrase: "fitted to a square bounding box with equal optical margins" },
  { id: "free", label: "No construction grid", phrase: "" },
];

/** Negatives that stop image models producing an unusable "logo". */
export const BASE_NEGATIVES = [
  "photorealism",
  "3D bevel",
  "drop shadow",
  "mockup on a business card",
  "background scenery",
  "watermark",
  "multiple logo variations in one image",
  "lorem ipsum text",
];

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const byId = (list, id) => list.find((item) => item.id === id) || null;
const round = (value, dp = 2) => {
  const f = Math.pow(10, dp);
  return Math.round(value * f) / f;
};
const toFinite = (value) => {
  const n = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
};

/**
 * Reproduction constraints.
 * minStrokePct: a stroke must still be MIN_FEATURE_PX wide at the smallest size,
 *               so it must be at least MIN_FEATURE_PX / smallestPx of the mark's height.
 * maxElements:  smallestPx / PX_PER_ELEMENT, capped at MAX_ELEMENT_BUDGET.
 * printPx:      height in millimetres converted at the chosen dpi.
 */
export function computeLogoSpecs({ smallestPx, printHeightMm, dpi = 300, displayPx = 512 } = {}) {
  const small = toFinite(smallestPx);
  const mm = toFinite(printHeightMm);
  const res = toFinite(dpi);
  const display = toFinite(displayPx);

  if ([small, mm, res, display].some((n) => Number.isNaN(n))) {
    return { error: "Enter valid numbers for the smallest size, print height and resolution." };
  }
  if (small < MIN_FEATURE_PX) {
    return { error: `The smallest reproduction size must be at least ${MIN_FEATURE_PX} px.` };
  }
  if (mm <= 0) return { error: "Print height must be greater than zero millimetres." };
  if (res <= 0) return { error: "Print resolution must be greater than zero dpi." };
  if (display <= 0) return { error: "Reference display size must be greater than zero pixels." };

  const minStrokePct = round((MIN_FEATURE_PX / small) * 100, 2);
  const rawElements = Math.floor(small / PX_PER_ELEMENT);
  const maxElements = Math.max(1, Math.min(MAX_ELEMENT_BUDGET, rawElements));
  const clearSpacePx = round(display * CLEAR_SPACE_RATIO, 1);
  const printPx = Math.ceil((mm / MM_PER_INCH) * res);
  const minStrokePxAtDisplay = round((minStrokePct / 100) * display, 1);

  return {
    smallestPx: small,
    minStrokePct,
    minStrokePxAtDisplay,
    maxElements,
    elementBudgetCapped: rawElements > MAX_ELEMENT_BUDGET,
    clearSpacePx,
    printPx,
    printHeightMm: mm,
    dpi: res,
    displayPx: display,
    faviconSizes: FAVICON_SIZES_PX,
  };
}

/**
 * Compose the prompt and the technical brief.
 * `brand` is required; everything else has a sensible fallback.
 */
export function buildLogoPrompt({
  brand = "",
  industry = "",
  markTypeId = "combination",
  shapeId = "geometric",
  paletteId = "accent",
  styleId = "techmin",
  constructionId = "grid8",
  motif = "",
  negativeSpaceTrick = false,
  smallestPx = 32,
  printHeightMm = 10,
  dpi = 300,
} = {}) {
  const name = clean(brand);
  if (!name) {
    return { error: "Enter the brand name — the mark type and lockup rules both depend on it." };
  }
  if (name.length > 60) {
    return { error: "That brand name is too long to letter as a logo. Keep it under 60 characters." };
  }

  const mark = byId(MARK_TYPES, markTypeId) || MARK_TYPES[4];
  const shape = byId(SHAPE_LANGUAGES, shapeId) || SHAPE_LANGUAGES[0];
  const palette = byId(PALETTE_STRATEGIES, paletteId) || PALETTE_STRATEGIES[2];
  const style = byId(STYLE_ERAS, styleId) || STYLE_ERAS[1];
  const construction = byId(CONSTRUCTIONS, constructionId) || CONSTRUCTIONS[0];

  const specs = computeLogoSpecs({ smallestPx, printHeightMm, dpi });
  if (specs.error) return { error: specs.error };

  const sector = clean(industry);
  const motifText = clean(motif);
  const showsName = ["wordmark", "lettermark", "combination", "emblem"].includes(mark.id);

  const parts = [
    `Flat vector logo for "${name}"`,
    sector ? `a ${sector} brand` : "",
    mark.phrase,
    motifText ? `built around ${motifText}` : "",
    shape.phrase,
    palette.phrase,
    style.phrase,
    construction.phrase,
    negativeSpaceTrick ? "with a second form hidden in the negative space" : "",
    "centred on a plain flat background, no mockup, no shadow, no 3D",
    `readable as a solid silhouette down to ${specs.smallestPx} px`,
  ].filter((part) => clean(part).length > 0);

  const prompt = parts.map(clean).join(", ");

  const negatives = new Set(BASE_NEGATIVES);
  if (!showsName) negatives.add("any lettering or text");
  if (palette.id !== "gradient") negatives.add("gradient");
  if (mark.id !== "mascot") negatives.add("cartoon character");
  const negativePrompt = Array.from(negatives).join(", ");

  const technicalBrief = [
    `Minimum stroke weight: ${specs.minStrokePct}% of the mark's height, so nothing thinner than about ${specs.minStrokePxAtDisplay} px in a ${specs.displayPx} px artboard.`,
    `Element budget: at most ${specs.maxElements} distinguishable shapes${specs.elementBudgetCapped ? " (capped — more than that stops reading as a logo)" : ""}.`,
    `Clear space: ${specs.clearSpacePx} px on every side at a ${specs.displayPx} px mark, i.e. half the mark height.`,
    `Print: at ${specs.printHeightMm} mm tall and ${specs.dpi} dpi the raster needs to be at least ${specs.printPx} px high — supply vector artwork instead where you can.`,
    `Test it flattened to solid black, reversed to white, and rendered at ${specs.faviconSizes.join(", ")} px.`,
  ];

  const warnings = [];
  if (mark.id === "wordmark" && name.length > MAX_FAVICON_WORDMARK_CHARS) {
    warnings.push(
      `A ${name.length}-character wordmark cannot be read at ${specs.smallestPx} px. Design a lettermark from the first ${MAX_FAVICON_WORDMARK_CHARS} characters as the small-size version.`
    );
  }
  if (showsName && name.length > MAX_COMFORTABLE_WORDMARK_CHARS) {
    warnings.push(
      `"${name}" is ${name.length} characters. Past about ${MAX_COMFORTABLE_WORDMARK_CHARS} the single-line lockup gets too wide for app bars and cards — plan a stacked version.`
    );
  }
  if (!palette.printSafe) {
    warnings.push(
      "Gradients shift unpredictably in spot-colour print, embroidery and single-colour stamps. Draw a one-colour version at the same time."
    );
  }
  if ((mark.id === "mascot" || mark.id === "emblem") && specs.smallestPx <= 32) {
    warnings.push(
      `${mark.label} marks carry too much detail for ${specs.smallestPx} px. Either raise the smallest size or plan a simplified icon-only variant.`
    );
  }
  if (showsName) {
    warnings.push(
      "Diffusion models garble lettering. Generate the symbol only, then set the brand name in real type in a vector editor."
    );
  }
  if (specs.maxElements <= 4) {
    warnings.push(
      `At ${specs.smallestPx} px you have room for about ${specs.maxElements} shapes. Anything more complex will turn to mush.`
    );
  }

  return {
    prompt,
    negativePrompt,
    technicalBrief,
    warnings,
    specs,
    mark: { id: mark.id, label: mark.label, whenToUse: mark.whenToUse, risk: mark.risk },
    showsName,
    charCount: name.length,
  };
}
