/**
 * Accent wall colour suggestions from an existing wall colour.
 *
 * Three real, checkable pieces of colour science are used.
 *
 * 1. HUE HARMONY. The candidate accents are the standard colour-wheel
 *    relationships measured in HSL hue degrees: complementary (+180 deg),
 *    split-complementary (+150 / +210), analogous (+/-30), triadic (+/-120)
 *    and monochromatic (same hue, different saturation and lightness).
 *
 * 2. LIGHT REFLECTANCE VALUE (LRV). LRV is the CIE Y tristimulus value of the
 *    colour expressed as a percentage, which for sRGB is exactly the WCAG 2.x
 *    relative luminance x 100:
 *
 *      Y = 0.2126 R + 0.7152 G + 0.0722 B   (channels linearised from sRGB)
 *
 *    Paint manufacturers publish LRV on every chip, so the number this tool
 *    reports can be compared directly against a fan deck. The common trade
 *    guidance is that two colours need roughly 10 LRV points between them
 *    before the eye reads them as deliberately different rather than as a
 *    batch mismatch, which is the test applied to every suggestion.
 *
 * 3. WCAG CONTRAST RATIO. (Y1 + 0.05) / (Y2 + 0.05) with the lighter colour on
 *    top. It is used twice: accent against the base wall, and accent against
 *    white and near-black so the tool can say which trim or lettering colour
 *    stays legible on the accent wall.
 *
 * The orientation adjustment is a design convention rather than a standard:
 * in the northern hemisphere a north-facing room receives indirect skylight,
 * which is cool and blue-biased, so warm colours are nudged warmer and lifted
 * slightly; a south-facing room receives warm direct sun for most of the day
 * and can carry a cooler, deeper accent. Reverse north and south in the
 * southern hemisphere.
 */

/** Standard colour-wheel harmony angles, in HSL hue degrees. */
export const COMPLEMENTARY_ANGLE = 180;
export const SPLIT_COMPLEMENTARY_ANGLE = 30; // either side of the complement
export const ANALOGOUS_ANGLE = 30;
export const TRIADIC_ANGLE = 120;

/**
 * Minimum difference in Light Reflectance Value before two painted surfaces
 * read as intentionally different colours. Widely used trade rule of thumb.
 */
export const MIN_LRV_GAP = 10;

/**
 * LRV gap that reads as a confident accent without becoming a hard graphic
 * break. Used only to rank the suggestions, never to reject one.
 */
export const IDEAL_LRV_GAP = 25;

/** Ranking penalty applied to any candidate that fails the MIN_LRV_GAP test. */
export const FAILS_GAP_PENALTY = 0.5;

/** Below this LRV a wall absorbs most of the light that falls on it. */
export const LOW_LRV_THRESHOLD = 20;

/**
 * LRV at or above which the base wall is treated as a light wall with room to
 * take a darker accent. Roughly the midpoint of the paint LRV scale; below it
 * the accent is sent lighter instead, because a second dark colour on a dark
 * wall simply disappears. LRV is used rather than HSL lightness because HSL
 * lightness is not perceptual — mid-grey #888888 is HSL L 53 but only LRV 25.
 */
export const LIGHT_WALL_LRV = 45;

/**
 * Saturation below which the base is treated as a true neutral with no usable
 * hue, and this warm reference hue is substituted so the harmonies still
 * produce a colour rather than a default red.
 */
export const NEUTRAL_SATURATION = 4;
export const NEUTRAL_REFERENCE_HUE = 30;

/** A common warm off-white, used as the starting example wall colour. */
export const DEFAULT_BASE_HEX = "#E8E2D6";

/** Neutral pair used to test what lettering or trim survives on the accent. */
export const TRIM_WHITE = "#FFFFFF";
export const TRIM_NEAR_BLACK = "#1A1A1A";

/** Minimum HSL lightness allowed for the accent, by room size. */
export const ROOM_SIZES = [
  { id: "small", label: "Small (under 10 m²)", minL: 24, note: "A very dark accent shrinks a small room; keep some light bouncing off it." },
  { id: "medium", label: "Medium (10–20 m²)", minL: 16, note: "Most residential rooms sit here and can carry a mid-depth accent." },
  { id: "large", label: "Large (over 20 m²)", minL: 9, note: "A large room can take a genuinely deep accent without closing in." },
];

/**
 * Orientation adjustments. hueTarget is the hue the accent is nudged toward,
 * hueShift how many degrees, satShift and lightShift are absolute HSL points.
 */
export const ORIENTATIONS = [
  { id: "north", label: "North-facing (cool, indirect light)", hueTarget: 35, hueShift: 10, satShift: 6, lightShift: 4, note: "Cool indirect light drains warmth, so the accent is warmed and lifted slightly." },
  { id: "east", label: "East-facing (warm mornings)", hueTarget: 35, hueShift: 5, satShift: 2, lightShift: 2, note: "Warm early, flat later — a small warm bias keeps the wall consistent all day." },
  { id: "south", label: "South-facing (warm, direct sun)", hueTarget: 215, hueShift: 10, satShift: -4, lightShift: -3, note: "Long hours of warm direct sun let a cooler, deeper accent sit comfortably." },
  { id: "west", label: "West-facing (warm evenings)", hueTarget: 215, hueShift: 5, satShift: -2, lightShift: -2, note: "Flat mornings, strong warm evenings — a slight cool bias stops it going orange at dusk." },
  { id: "unknown", label: "Not sure / no daylight", hueTarget: 0, hueShift: 0, satShift: 0, lightShift: 0, note: "Judged on the colour wheel alone. Check a sample on the wall before committing." },
];

/**
 * Candidate accents. hueOffset is the wheel angle, satMul scales the base
 * saturation, depth scales the distance the accent travels from the base
 * lightness (lower = further away), weight is a residential-design preference
 * used only to break ties when ranking.
 */
export const HARMONIES = [
  { id: "split-a", label: "Split-complementary (warm side)", hueOffset: COMPLEMENTARY_ANGLE - SPLIT_COMPLEMENTARY_ANGLE, satMul: 1.05, depth: 0.72, weight: 0.3, note: "The safest strong accent: complementary energy without the vibration of a true opposite." },
  { id: "split-b", label: "Split-complementary (cool side)", hueOffset: COMPLEMENTARY_ANGLE + SPLIT_COMPLEMENTARY_ANGLE, satMul: 1.05, depth: 0.72, weight: 0.28, note: "The other half of the split pair. Try both on the wall — daylight decides between them." },
  { id: "complementary", label: "Complementary", hueOffset: COMPLEMENTARY_ANGLE, satMul: 1.1, depth: 0.68, weight: 0.22, note: "Maximum hue contrast. Powerful on one wall, exhausting on four." },
  { id: "mono-deep", label: "Monochromatic deep", hueOffset: 0, satMul: 1.35, depth: 0.5, weight: 0.26, note: "Same hue, far more depth. The lowest-risk accent and the easiest to live with." },
  { id: "analogous-warm", label: "Analogous (one step warm)", hueOffset: -ANALOGOUS_ANGLE, satMul: 1.15, depth: 0.65, weight: 0.2, note: "A quiet shift along the wheel — reads as a richer version of the room, not a new colour." },
  { id: "analogous-cool", label: "Analogous (one step cool)", hueOffset: ANALOGOUS_ANGLE, satMul: 1.15, depth: 0.65, weight: 0.18, note: "The neighbouring hue on the other side. Good behind a bed or sofa." },
  { id: "triadic", label: "Triadic", hueOffset: TRIADIC_ANGLE, satMul: 1.0, depth: 0.62, weight: 0.14, note: "A third of the wheel away. Lively, and best kept to one wall with restrained furnishings." },
  { id: "neutral-anchor", label: "Near-neutral anchor", hueOffset: 0, satMul: 0.28, depth: 0.42, weight: 0.24, note: "A greyed, deeply knocked-back version of the wall hue. Works when the room already has strong textiles or art." },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/**
 * Parse #rgb, #rrggbb or a bare 3/6 digit hex into {r,g,b} 0-255.
 * Returns null when the string is not a colour.
 */
export function parseHex(input) {
  if (typeof input !== "string") return null;
  const raw = input.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{3}$/.test(raw) && !/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** {r,g,b} 0-255 back to an uppercase #rrggbb string. */
export function rgbToHex({ r, g, b }) {
  const part = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

/** {r,g,b} 0-255 to {h:0-360, s:0-100, l:0-100}. */
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
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
    else h = 60 * ((rn - gn) / delta + 4);
  }
  if (h < 0) h += 360;
  return { h, s: s * 100, l: l * 100 };
}

/** {h,s,l} back to {r,g,b} 0-255. */
export function hslToRgb({ h, s, l }) {
  const hh = ((h % 360) + 360) % 360;
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;
  let rgb;
  if (hh < 60) rgb = [c, x, 0];
  else if (hh < 120) rgb = [x, c, 0];
  else if (hh < 180) rgb = [0, c, x];
  else if (hh < 240) rgb = [0, x, c];
  else if (hh < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
  };
}

/**
 * WCAG 2.x relative luminance of an sRGB colour, 0-1. This is the CIE Y
 * tristimulus value, so Y x 100 is the Light Reflectance Value paint
 * manufacturers print on the chip.
 */
export function relativeLuminance({ r, g, b }) {
  const channel = (v) => {
    const c = clamp(v, 0, 255) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Light Reflectance Value, 0-100. */
export function lrv(rgb) {
  return relativeLuminance(rgb) * 100;
}

/** WCAG contrast ratio between two {r,g,b} colours, 1 to 21. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

/** Rotate `h` toward `target` by at most `amount` degrees, the short way round. */
export function shiftHueToward(h, target, amount) {
  if (!amount) return ((h % 360) + 360) % 360;
  const diff = (((target - h) % 360) + 540) % 360 - 180;
  const step = Math.sign(diff) * Math.min(Math.abs(amount), Math.abs(diff));
  return ((h + step) % 360 + 360) % 360;
}

/**
 * Build the accent suggestions for an existing wall colour.
 *
 * @param {object} input
 * @param {string} input.baseHex        existing wall colour, e.g. "#E8E2D6"
 * @param {string} [input.orientation]  one of ORIENTATIONS ids
 * @param {string} [input.roomSize]     one of ROOM_SIZES ids
 * @returns {object} { error } or the full suggestion set
 */
export function suggestAccentWall({ baseHex, orientation = "unknown", roomSize = "medium" } = {}) {
  const baseRgb = parseHex(baseHex);
  if (!baseRgb) {
    return { error: "Enter the existing wall colour as a hex value such as #E8E2D6." };
  }

  const facing = ORIENTATIONS.find((o) => o.id === orientation) || ORIENTATIONS[ORIENTATIONS.length - 1];
  const size = ROOM_SIZES.find((r) => r.id === roomSize) || ROOM_SIZES[1];

  const baseHsl = rgbToHsl(baseRgb);
  const baseLrv = lrv(baseRgb);
  const baseIsLight = baseLrv >= LIGHT_WALL_LRV;
  const isNeutralBase = baseHsl.s < NEUTRAL_SATURATION;
  const referenceHue = isNeutralBase ? NEUTRAL_REFERENCE_HUE : baseHsl.h;

  const suggestions = HARMONIES.map((harmony) => {
    // Hue: wheel harmony, then the daylight nudge.
    const wheelHue = referenceHue + harmony.hueOffset;
    const hue = shiftHueToward(wheelHue, facing.hueTarget, facing.hueShift);

    // Saturation: an accent that is merely darker reads as a dirty mark, so
    // saturation is scaled up (or, for the neutral anchor, deliberately down),
    // then floored so a grey base wall still yields a usable colour.
    const satFloor = harmony.satMul < 1 ? 0 : 12;
    const saturation = clamp(Math.max(baseHsl.s * harmony.satMul, satFloor), 0, 100);

    // Lightness: move away from the base wall. A light wall gets a darker
    // accent; a wall that is already dark gets a lighter one, because a second
    // dark colour would simply disappear.
    const rawL = baseIsLight
      ? baseHsl.l * harmony.depth
      : 100 - (100 - baseHsl.l) * harmony.depth;
    const lightness = clamp(rawL + facing.lightShift, size.minL, 92);

    const rgb = hslToRgb({ h: hue, s: saturation, l: lightness });
    const hex = rgbToHex(rgb);
    const accentLrv = lrv(rgb);
    const lrvGap = Math.abs(accentLrv - baseLrv);
    const ratioToBase = contrastRatio(rgb, baseRgb);

    const whiteRatio = contrastRatio(rgb, parseHex(TRIM_WHITE));
    const blackRatio = contrastRatio(rgb, parseHex(TRIM_NEAR_BLACK));
    const trimHex = whiteRatio >= blackRatio ? TRIM_WHITE : TRIM_NEAR_BLACK;
    const trimRatio = Math.max(whiteRatio, blackRatio);

    // Rank: closeness to the ideal LRV gap, plus a small design preference,
    // minus a flat penalty for anything that fails the 10-point gap test so a
    // candidate nobody would read as an accent can never come out on top.
    const readsAsAccent = lrvGap >= MIN_LRV_GAP;
    const gapScore = clamp(1 - Math.abs(lrvGap - IDEAL_LRV_GAP) / 100, 0, 1);
    const score = gapScore + harmony.weight - (readsAsAccent ? 0 : FAILS_GAP_PENALTY);

    return {
      id: harmony.id,
      label: harmony.label,
      note: harmony.note,
      hex,
      rgb,
      hue: round(hue, 1),
      saturation: round(saturation, 1),
      lightness: round(lightness, 1),
      lrv: round(accentLrv, 1),
      lrvGap: round(lrvGap, 1),
      contrastWithBase: round(ratioToBase, 2),
      readsAsAccent,
      trimHex,
      trimIsWhite: trimHex === TRIM_WHITE,
      trimContrast: round(trimRatio, 2),
      trimPassesAA: trimRatio >= 4.5,
      absorbsLight: accentLrv < LOW_LRV_THRESHOLD,
      score: round(score, 4),
    };
  });

  const ranked = [...suggestions].sort((a, b) => b.score - a.score);
  const topPick = ranked[0];

  const warnings = [];
  if (isNeutralBase) {
    warnings.push(
      `The existing wall is a true neutral (saturation under ${NEUTRAL_SATURATION}%), so there is no hue to build a harmony from. The suggestions below are built from a warm reference hue of ${NEUTRAL_REFERENCE_HUE}° — with a neutral base almost any accent works, so choose on mood rather than on the wheel.`,
    );
  }
  if (topPick && topPick.absorbsLight && roomSize === "small") {
    warnings.push(
      `The strongest match has an LRV of ${topPick.lrv}, below ${LOW_LRV_THRESHOLD}, which absorbs most of the light hitting it. In a small room, add a lighter option from the list or plan extra lighting.`,
    );
  }
  if (suggestions.every((s) => !s.readsAsAccent)) {
    warnings.push(
      `No suggestion clears ${MIN_LRV_GAP} LRV points from the existing wall, so any of these risks looking like a touch-up rather than a choice. Try a deeper or lighter base reference.`,
    );
  }

  return {
    baseHex: rgbToHex(baseRgb),
    baseRgb,
    baseHue: round(baseHsl.h, 1),
    baseSaturation: round(baseHsl.s, 1),
    baseLightness: round(baseHsl.l, 1),
    baseLrv: round(baseLrv, 1),
    baseIsLight,
    direction: baseIsLight ? "darker" : "lighter",
    orientationId: facing.id,
    orientationLabel: facing.label,
    orientationNote: facing.note,
    roomSizeId: size.id,
    roomSizeLabel: size.label,
    roomSizeNote: size.note,
    suggestions,
    ranked,
    topPick,
    warnings,
  };
}
