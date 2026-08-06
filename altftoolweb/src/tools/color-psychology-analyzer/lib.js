/**
 * Colour psychology analyser — pure logic.
 *
 * Two independent things happen here:
 *  1. Colorimetry. sRGB -> HSL, and sRGB -> WCAG 2.1 relative luminance and
 *     contrast ratio. These are exact, standardised formulas.
 *  2. Psychology / culture lookup. Hue is bucketed into a named colour family
 *     and each family carries documented associations. These are editorial
 *     summaries of widely reported associations, not measurements.
 */

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** Default swatch: ALTFTool Teal-500, the product primary. */
export const DEFAULT_HEX = "#14B8A6";

/** The two reference colours every contrast check is measured against. */
export const WHITE_HEX = "#FFFFFF";
export const BLACK_HEX = "#000000";

/**
 * WCAG 2.1 relative-luminance coefficients (§ "relative luminance").
 * L = 0.2126 R + 0.7152 G + 0.0722 B on linearised channels.
 */
export const LUMINANCE_COEFFICIENTS = { r: 0.2126, g: 0.7152, b: 0.0722 };

/** WCAG 2.1 sRGB linearisation break point and constants. */
export const SRGB_LINEAR_THRESHOLD = 0.03928;
export const SRGB_LINEAR_DIVISOR = 12.92;
export const SRGB_GAMMA_OFFSET = 0.055;
export const SRGB_GAMMA_SCALE = 1.055;
export const SRGB_GAMMA_EXPONENT = 2.4;

/** WCAG contrast ratio flare constant: (L1 + 0.05) / (L2 + 0.05). */
export const CONTRAST_FLARE = 0.05;

/** WCAG 2.1 contrast minimums (SC 1.4.3 / 1.4.6 / 1.4.11). */
export const CONTRAST_AA_NORMAL = 4.5; // body text, AA
export const CONTRAST_AA_LARGE = 3.0; // >= 18.66px bold or 24px, AA
export const CONTRAST_AAA_NORMAL = 7.0; // body text, AAA
export const CONTRAST_NON_TEXT = 3.0; // SC 1.4.11 UI components

/** Below this HSL saturation a colour reads as neutral, not as a hue. */
export const ACHROMATIC_SATURATION_MAX = 10; // percent

/** HSL lightness cut-offs used to name a neutral. */
export const NEUTRAL_LIGHT_MIN = 80; // percent -> "white / off-white"
export const NEUTRAL_DARK_MAX = 20; // percent -> "black / near-black"

/**
 * Warm/cool split on the hue wheel. Hues from 60 to 240 degrees are the cool
 * half (greens, cyans, blues); the rest is warm. This is the standard
 * artist's-wheel division used in colour theory teaching.
 */
export const COOL_HUE_START = 60;
export const COOL_HUE_END = 240;

/**
 * Colour families keyed by hue range on the 0-360 wheel. Ranges follow the
 * conventional 12-part wheel grouping; red wraps past 360.
 *
 * Each range is half-open [from, to) and `to` is exactly the next family's
 * `from`, so every hue value — including the fractional degrees rgbToHsl
 * produces — falls in exactly one family with no gap and no overlap. See
 * familyForHue below, which matches with `h < to` rather than `h <= to`.
 */
export const COLOR_FAMILIES = [
  {
    key: "red",
    label: "Red",
    from: 345,
    to: 15,
    emotions: ["urgency", "appetite", "passion", "alarm"],
    brand:
      "Grabs attention faster than any other hue, which is why it is the default for sale badges, clearance pricing and error states. Overuse reads as shouting.",
    industries: ["Food and beverage", "Entertainment", "Discount retail", "Sport"],
    cultures: [
      ["Western Europe / North America", "Danger, stop, passion, debt ('in the red')."],
      ["China", "Luck, prosperity and celebration — the colour of weddings and New Year."],
      ["India", "Purity and marriage; sindoor and bridal wear are red."],
      ["South Africa", "Mourning, tied to the colour on the national flag."],
    ],
    avoid: "Financial dashboards, where red already means loss.",
  },
  {
    key: "orange",
    label: "Orange",
    from: 15,
    to: 45,
    emotions: ["energy", "friendliness", "affordability", "playfulness"],
    brand:
      "Reads as approachable and good value. A common call-to-action colour because it is high-visibility without red's warning connotation.",
    industries: ["E-commerce", "Kids and education", "Fitness", "Budget travel"],
    cultures: [
      ["India", "Saffron is sacred in Hinduism and appears on the national flag."],
      ["Netherlands", "National colour, tied to the House of Orange."],
      ["United States", "Autumn, Halloween, and highway safety wear."],
      ["Middle East", "Associated with mourning and loss in parts of the region."],
    ],
    avoid: "Luxury positioning — orange rarely reads as premium.",
  },
  {
    key: "yellow",
    label: "Yellow",
    from: 45,
    to: 70,
    emotions: ["optimism", "caution", "clarity", "youth"],
    brand:
      "The most visible hue in daylight, which is why it is used for warning signage. On screen it needs a dark foreground: yellow rarely passes contrast against white.",
    industries: ["Logistics", "Retail signage", "Utilities", "Construction"],
    cultures: [
      ["China", "Historically imperial — yellow was reserved for the emperor."],
      ["Egypt", "Mourning colour."],
      ["Japan", "Courage and bravery."],
      ["Western Europe", "Caution, and in some contexts cowardice."],
    ],
    avoid: "Large text areas — the eye fatigues quickly on saturated yellow.",
  },
  {
    key: "green",
    label: "Green",
    from: 70,
    to: 165,
    emotions: ["growth", "safety", "health", "permission"],
    brand:
      "Carries the strongest 'go ahead' signal in interfaces and the strongest sustainability claim in marketing. Also the default for gains in finance.",
    industries: ["Health", "Sustainability", "Finance", "Agriculture"],
    cultures: [
      ["Islamic world", "Sacred colour of Islam; appears on many national flags."],
      ["Ireland", "National identity and good fortune."],
      ["China", "A green hat carries a specific idiom about infidelity — avoid it in headwear imagery."],
      ["Western Europe / North America", "Money, envy, and environmentalism."],
    ],
    avoid: "Pairing with red as the only difference between two states — the most common form of colour blindness cannot separate them.",
  },
  {
    key: "teal",
    label: "Teal / Cyan",
    from: 165,
    to: 195,
    emotions: ["calm", "clarity", "modernity", "trustworthy competence"],
    brand:
      "Sits between blue's authority and green's reassurance, which is why it dominates health-tech and fintech interfaces built after 2015.",
    industries: ["Health tech", "SaaS", "Fintech", "Wellness"],
    cultures: [
      ["Egypt (historic)", "Turquoise signified protection and rebirth."],
      ["Native American traditions", "Turquoise is a protective stone."],
      ["Persia / Central Asia", "Turquoise domes signal heaven and protection."],
      ["Western Europe / North America", "Reads as clean, clinical and contemporary."],
    ],
    avoid: "Heritage or luxury brands that need warmth — teal can read as sterile.",
  },
  {
    key: "blue",
    label: "Blue",
    from: 195,
    to: 256,
    emotions: ["trust", "stability", "competence", "distance"],
    brand:
      "The most used brand colour worldwide and one of the safer cross-cultural choices, though not a universal one: it reads as trust and calm almost everywhere, but is a traditional mourning colour in China and South Korea. The cost is that it is unmemorable.",
    industries: ["Banking", "Enterprise software", "Insurance", "Healthcare"],
    cultures: [
      ["Western Europe / North America", "Corporate trust, calm, and sadness ('feeling blue')."],
      ["Middle East", "Protection from the evil eye."],
      ["China", "Immortality and, in some contexts, mourning."],
      ["South Korea", "Traditionally a mourning colour."],
    ],
    avoid: "Food and appetite imagery — blue suppresses appetite cues.",
  },
  {
    key: "purple",
    label: "Purple",
    from: 256,
    to: 285,
    emotions: ["luxury", "creativity", "mystery", "spirituality"],
    brand:
      "Historically expensive to dye, so it still signals premium and craft. Rare enough in most categories that it differentiates immediately.",
    industries: ["Beauty", "Premium goods", "Creative tools", "Streaming"],
    cultures: [
      ["Roman / European history", "Tyrian purple was restricted to royalty by law."],
      ["Thailand", "Mourning colour worn by widows."],
      ["Brazil", "Associated with mourning and Lent."],
      ["Japan", "Historically the colour of the highest court rank."],
    ],
    avoid: "Hard-value or discount messaging — purple undercuts a cheapness claim.",
  },
  {
    key: "pink",
    label: "Pink / Magenta",
    from: 285,
    to: 345,
    emotions: ["warmth", "playfulness", "care", "modern femininity"],
    brand:
      "Highly memorable and increasingly gender-neutral in tech branding, though it still carries strong gendered coding in toys and personal care.",
    industries: ["Beauty", "Direct-to-consumer", "Dating", "Confectionery"],
    cultures: [
      ["Japan", "Cherry blossom — spring, transience; not strongly gendered."],
      ["Western Europe / North America", "Femininity, breast-cancer awareness."],
      ["Latin America", "Everyday architectural colour, not gender-coded."],
      ["Korea", "Trust and, in some readings, romance."],
    ],
    avoid: "Categories where the audience reads pink as a gender assumption.",
  },
];

/** Named neutrals used when saturation is below ACHROMATIC_SATURATION_MAX. */
export const NEUTRAL_FAMILY = {
  key: "neutral",
  label: "Neutral",
  emotions: ["restraint", "seriousness", "timelessness"],
  brand:
    "Neutrals carry no hue signal, so they defer entirely to typography, spacing and imagery. That is why editorial and luxury brands lean on them.",
  industries: ["Fashion", "Publishing", "Architecture", "Professional services"],
  cultures: [
    ["Western Europe / North America", "Black is formal and mournful; white is weddings and clinical cleanliness."],
    ["China / India / Japan", "White is the traditional colour of mourning."],
    ["Global interfaces", "Grey reads as disabled or inactive — do not use it for live content."],
  ],
  avoid: "Using grey for anything interactive; users read grey as switched off.",
};

/** Harmony offsets in degrees on the HSL hue wheel. */
export const HARMONY_OFFSETS = {
  complementary: [180],
  analogous: [-30, 30],
  triadic: [120, 240],
  splitComplementary: [150, 210],
};

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/* ------------------------------------------------------------------ */
/* Colorimetry                                                         */
/* ------------------------------------------------------------------ */

/** Parse #rgb or #rrggbb into { r, g, b } (0-255), or { error }. */
export function parseHex(input) {
  const raw = String(input == null ? "" : input).trim();
  if (!raw) return { error: "Enter a colour, for example #14B8A6." };
  const match = HEX_RE.exec(raw);
  if (!match) {
    return { error: "That is not a hex colour. Use 3 or 6 hex digits, like #14B8A6." };
  }
  let body = match[1];
  if (body.length === 3) body = body.split("").map((ch) => ch + ch).join("");
  return {
    r: parseInt(body.slice(0, 2), 16),
    g: parseInt(body.slice(2, 4), 16),
    b: parseInt(body.slice(4, 6), 16),
  };
}

/** Format 0-255 channels back to an uppercase #rrggbb string. */
export function toHex({ r, g, b }) {
  const clamp = (n) => Math.min(255, Math.max(0, Math.round(Number(n) || 0)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/** sRGB (0-255) -> HSL with h in degrees, s and l in percent. */
export function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (delta !== 0) {
    // Guard: denominator is zero only when l is exactly 0 or 1, and delta is
    // then 0 as well, so this branch cannot divide by zero.
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
    else h = 60 * ((rn - gn) / delta + 4);
  }
  if (h < 0) h += 360;
  return {
    h: Math.round(h * 10) / 10,
    s: Math.round(s * 1000) / 10,
    l: Math.round(l * 1000) / 10,
  };
}

/** HSL (degrees, percent, percent) -> sRGB 0-255. */
export function hslToRgb({ h, s, l }) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const sat = Math.min(100, Math.max(0, Number(s))) / 100;
  const lum = Math.min(100, Math.max(0, Number(l))) / 100;
  const c = (1 - Math.abs(2 * lum - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lum - c / 2;
  let rgb;
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
  };
}

/** WCAG 2.1 relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance({ r, g, b }) {
  const channel = (value) => {
    const c = Math.min(255, Math.max(0, Number(value) || 0)) / 255;
    return c <= SRGB_LINEAR_THRESHOLD
      ? c / SRGB_LINEAR_DIVISOR
      : Math.pow((c + SRGB_GAMMA_OFFSET) / SRGB_GAMMA_SCALE, SRGB_GAMMA_EXPONENT);
  };
  return (
    LUMINANCE_COEFFICIENTS.r * channel(r) +
    LUMINANCE_COEFFICIENTS.g * channel(g) +
    LUMINANCE_COEFFICIENTS.b * channel(b)
  );
}

/** WCAG 2.1 contrast ratio between two sRGB colours, from 1 to 21. */
export function contrastRatio(rgbA, rgbB) {
  const la = relativeLuminance(rgbA);
  const lb = relativeLuminance(rgbB);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  const ratio = (lighter + CONTRAST_FLARE) / (darker + CONTRAST_FLARE);
  return Math.round(ratio * 100) / 100;
}

/* ------------------------------------------------------------------ */
/* Classification                                                      */
/* ------------------------------------------------------------------ */

/**
 * Return the colour family for a hue in degrees. Handles the red wrap.
 * Ranges are half-open [from, to) — see the comment on COLOR_FAMILIES — so
 * every hue, including the fractional degrees rgbToHsl produces, matches
 * exactly one family. There is deliberately no fallback to COLOR_FAMILIES[0]:
 * the ranges are contiguous and exhaustive over 0-360, so reaching the end of
 * the loop would mean a boundary was edited to leave a gap.
 */
export function familyForHue(hue) {
  const h = ((Number(hue) % 360) + 360) % 360;
  for (const family of COLOR_FAMILIES) {
    if (family.from <= family.to) {
      if (h >= family.from && h < family.to) return family;
    } else if (h >= family.from || h < family.to) {
      // wrapping range (red)
      return family;
    }
  }
  // Unreachable if COLOR_FAMILIES stays contiguous; fail loud rather than
  // silently mislabel a colour as red.
  throw new Error(`familyForHue: no family covers hue ${h}`);
}

/** "Warm" or "Cool" using the standard 60-240 degree split. */
export function temperatureForHue(hue) {
  const h = ((Number(hue) % 360) + 360) % 360;
  return h >= COOL_HUE_START && h <= COOL_HUE_END ? "Cool" : "Warm";
}

/** Human name for a low-saturation colour, based on lightness. */
export function neutralName(lightness) {
  if (lightness >= NEUTRAL_LIGHT_MIN) return "White / off-white";
  if (lightness <= NEUTRAL_DARK_MAX) return "Black / near-black";
  return "Grey";
}

/** Rotate a colour's hue by an offset and return the hex. */
export function rotateHue(hex, offsetDegrees) {
  const rgb = parseHex(hex);
  if (rgb.error) return rgb;
  const hsl = rgbToHsl(rgb);
  return toHex(hslToRgb({ h: hsl.h + Number(offsetDegrees), s: hsl.s, l: hsl.l }));
}

/* ------------------------------------------------------------------ */
/* Main analysis                                                       */
/* ------------------------------------------------------------------ */

const WHITE = { r: 255, g: 255, b: 255 };
const BLACK = { r: 0, g: 0, b: 0 };

/**
 * Full analysis of one colour.
 * Returns { error } for anything that is not a valid hex colour.
 */
export function analyzeColor(input) {
  const rgb = parseHex(input);
  if (rgb.error) return { error: rgb.error };

  const hex = toHex(rgb);
  const hsl = rgbToHsl(rgb);
  const isNeutral = hsl.s < ACHROMATIC_SATURATION_MAX;
  const family = isNeutral ? NEUTRAL_FAMILY : familyForHue(hsl.h);
  const luminance = relativeLuminance(rgb);
  const onWhite = contrastRatio(rgb, WHITE);
  const onBlack = contrastRatio(rgb, BLACK);
  const bestTextOn = onBlack >= onWhite ? "black" : "white";
  const bestTextRatio = Math.max(onBlack, onWhite);

  const harmonies = {};
  for (const [name, offsets] of Object.entries(HARMONY_OFFSETS)) {
    harmonies[name] = offsets.map((offset) => rotateHue(hex, offset));
  }

  return {
    hex,
    rgb,
    hsl,
    isNeutral,
    familyKey: family.key,
    familyLabel: isNeutral ? neutralName(hsl.l) : family.label,
    temperature: isNeutral ? "Neutral" : temperatureForHue(hsl.h),
    emotions: family.emotions,
    brandNote: family.brand,
    industries: family.industries || [],
    cultures: family.cultures,
    avoid: family.avoid,
    luminance: Math.round(luminance * 10000) / 10000,
    contrastOnWhite: onWhite,
    contrastOnBlack: onBlack,
    bestTextOn,
    bestTextRatio,
    // WCAG verdicts for this colour used as a background behind black/white text
    passesAaBodyText: bestTextRatio >= CONTRAST_AA_NORMAL,
    passesAaLargeText: bestTextRatio >= CONTRAST_AA_LARGE,
    passesAaaBodyText: bestTextRatio >= CONTRAST_AAA_NORMAL,
    // WCAG verdicts for this colour used as an icon/border on a white page
    usableAsUiOnWhite: onWhite >= CONTRAST_NON_TEXT,
    harmonies,
  };
}

/**
 * Compare a foreground colour against a background colour and report every
 * WCAG 2.1 threshold it clears.
 */
export function analyzePair(foreground, background) {
  const fg = parseHex(foreground);
  if (fg.error) return { error: `Foreground: ${fg.error}` };
  const bg = parseHex(background);
  if (bg.error) return { error: `Background: ${bg.error}` };

  const ratio = contrastRatio(fg, bg);
  return {
    foreground: toHex(fg),
    background: toHex(bg),
    ratio,
    aaBody: ratio >= CONTRAST_AA_NORMAL,
    aaLarge: ratio >= CONTRAST_AA_LARGE,
    aaaBody: ratio >= CONTRAST_AAA_NORMAL,
    nonText: ratio >= CONTRAST_NON_TEXT,
    verdict:
      ratio >= CONTRAST_AAA_NORMAL
        ? "Passes AAA for body text"
        : ratio >= CONTRAST_AA_NORMAL
          ? "Passes AA for body text"
          : ratio >= CONTRAST_AA_LARGE
            ? "Large text only — fails AA for body text"
            : "Fails WCAG AA at every text size",
  };
}
