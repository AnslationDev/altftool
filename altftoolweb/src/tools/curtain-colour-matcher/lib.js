/**
 * Matching curtain colour to wall paint and upholstery.
 *
 * The decision is driven by two measurable quantities and one geometric one.
 *
 * LIGHT REFLECTANCE VALUE (LRV). LRV is the CIE Y tristimulus value as a
 * percentage, which for sRGB is exactly the WCAG 2.x relative luminance x 100:
 *
 *   Y = 0.2126 R + 0.7152 G + 0.0722 B   (channels linearised from sRGB)
 *
 * Curtains are read against the wall behind them, so the LRV gap between the
 * two decides what the window does in the room. Under about 10 points the
 * curtain merges into the wall and the room reads as one continuous, larger
 * surface; from roughly 10 to 30 points the window is defined but quiet; above
 * 30 points the window becomes the focal point of the room.
 *
 * HUE DISTANCE. The shortest angular distance between two HSL hues, 0-180
 * degrees. It classifies the relationship between the wall and the upholstery
 * and therefore how much freedom the curtain has: two colours already sitting
 * 45-100 degrees apart are the hardest pairing to add a third colour to, so the
 * curtain is best kept close to one of them or knocked back to a neutral.
 *
 * CIRCULAR HUE MEAN. To find a hue that bridges the wall and the upholstery,
 * the two hues are treated as unit vectors, averaged, and converted back with
 * atan2. This is the correct mean on a circle: the plain arithmetic mean of
 * 350 and 10 degrees is 180 (cyan), while the circular mean is 0 (red).
 *
 * Fade and solar behaviour are physical: dyes fade faster under direct UV, and
 * the loss is most visible in dark, heavily saturated fabrics because the same
 * absolute pigment loss is a larger proportional change. Light-coloured fabric
 * also reflects more of the incoming solar radiation back out through the
 * glass, so it reduces summer heat gain more than a dark lining of the same
 * weight.
 */

/** Below this LRV gap the curtain merges into the wall behind it. */
export const BLEND_LRV_GAP = 10;

/** At or above this LRV gap the window becomes the focal point of the room. */
export const FOCAL_LRV_GAP = 30;

/** Reference hues for the two neutral options, in HSL degrees. */
export const WARM_NEUTRAL_HUE = 35;
export const COOL_NEUTRAL_HUE = 210;

/** Saturation used for the neutral options — enough to avoid a dead grey. */
export const NEUTRAL_SATURATION = 9;

/** HSL lightness of the deep grounding option. */
export const GROUNDING_LIGHTNESS = 24;

/** LRV below which a fabric absorbs most of the light falling on it. */
export const DARK_FABRIC_LRV = 25;

/** HSL saturation above which fading is visually obvious as it happens. */
export const FADE_PRONE_SATURATION = 40;

/** Hue-distance bands, in degrees, describing the wall/upholstery pairing. */
export const HUE_BANDS = [
  { max: 15, id: "same", label: "same hue family", advice: "The room is already tonal. Curtains can sit anywhere on that hue without risk." },
  { max: 45, id: "analogous", label: "analogous", advice: "Neighbouring hues. A curtain drawn from either one, or from the hue between them, will settle in easily." },
  { max: 100, id: "discordant", label: "awkward interval", advice: "The hardest pairing to add a third colour to. Keep the curtain close to one of the two, or take it to a near-neutral." },
  { max: 150, id: "triadic", label: "triadic", advice: "A wide, lively interval. A quiet curtain stops the room becoming a colour puzzle." },
  { max: 181, id: "complementary", label: "complementary", advice: "Opposites. The curtain should not introduce a fourth hue — repeat one of the two or go neutral." },
];

/** Window sun exposure, used for fade and solar-gain notes. */
export const EXPOSURES = [
  { id: "low", label: "Little direct sun (north-facing or shaded)", uv: 0, note: "Almost no direct UV, so fading is slow and dark, saturated fabrics are safe." },
  { id: "moderate", label: "Some direct sun (east-facing)", uv: 1, note: "Morning sun only. Moderate fade risk over several years." },
  { id: "high", label: "Strong direct sun (south or west-facing)", uv: 2, note: "Hours of direct sun. Expect visible fading on dark, saturated fabric and consider a lined curtain." },
];

/** What the person wants the curtains to do in the room. */
export const GOALS = [
  { id: "recede", label: "Disappear — make the room feel bigger", target: 5 },
  { id: "define", label: "Frame the window quietly", target: 18 },
  { id: "feature", label: "Be a feature", target: 38 },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** Parse #rgb / #rrggbb (with or without the hash) into {r,g,b} 0-255, or null. */
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

export function rgbToHex({ r, g, b }) {
  const part = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

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

/** WCAG 2.x relative luminance, 0-1. Equals CIE Y, so Y x 100 is the LRV. */
export function relativeLuminance({ r, g, b }) {
  const channel = (v) => {
    const c = clamp(v, 0, 255) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function lrv(rgb) {
  return relativeLuminance(rgb) * 100;
}

export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Shortest angular distance between two hues, 0-180 degrees. */
export function hueDistance(a, b) {
  const diff = Math.abs((((a - b) % 360) + 360) % 360);
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Circular mean of two hues. Unit vectors are averaged and converted back with
 * atan2, so 350 deg and 10 deg average to 0 deg rather than 180 deg. When the
 * two hues are exactly opposite the mean is undefined, so the midpoint one
 * quarter-turn from the first hue is returned instead.
 */
export function meanHue(a, b) {
  const rad = Math.PI / 180;
  const x = Math.cos(a * rad) + Math.cos(b * rad);
  const y = Math.sin(a * rad) + Math.sin(b * rad);
  if (Math.abs(x) < 1e-9 && Math.abs(y) < 1e-9) return ((a + 90) % 360 + 360) % 360;
  const deg = Math.atan2(y, x) / rad;
  return ((deg % 360) + 360) % 360;
}

/** Classify an LRV gap into what the window will do in the room. */
export function gapEffect(gap) {
  if (gap < BLEND_LRV_GAP) return "Recedes into the wall — the room reads as one larger surface";
  if (gap < FOCAL_LRV_GAP) return "Frames the window quietly without taking over";
  return "Becomes the focal point of the room";
}

/**
 * Suggest curtain colours for a given wall and upholstery.
 *
 * @param {object} input
 * @param {string} input.wallHex        wall paint colour
 * @param {string} input.upholsteryHex  sofa / main soft furnishing colour
 * @param {string} [input.goal]         one of GOALS ids
 * @param {string} [input.exposure]     one of EXPOSURES ids
 * @returns {object} { error } or the suggestion set
 */
export function matchCurtains({
  wallHex,
  upholsteryHex,
  goal = "define",
  exposure = "moderate",
} = {}) {
  const wallRgb = parseHex(wallHex);
  if (!wallRgb) return { error: "Enter the wall colour as a hex value such as #EDE7DC." };
  const sofaRgb = parseHex(upholsteryHex);
  if (!sofaRgb) return { error: "Enter the upholstery colour as a hex value such as #4A5D6B." };

  const chosenGoal = GOALS.find((g) => g.id === goal) || GOALS[1];
  const sun = EXPOSURES.find((e) => e.id === exposure) || EXPOSURES[1];

  const wallHsl = rgbToHsl(wallRgb);
  const sofaHsl = rgbToHsl(sofaRgb);
  const wallLrv = lrv(wallRgb);
  const sofaLrv = lrv(sofaRgb);

  const distance = hueDistance(wallHsl.h, sofaHsl.h);
  const band = HUE_BANDS.find((b) => distance < b.max) || HUE_BANDS[HUE_BANDS.length - 1];
  const bridgeHue = meanHue(wallHsl.h, sofaHsl.h);

  // The curtain moves away from the wall by the LRV the goal asks for. On a
  // light wall it goes darker; on a dark wall there is no room to go darker,
  // so it goes lighter instead.
  const wallIsLight = wallLrv >= 45;
  const step = chosenGoal.target;

  const build = (id, label, hue, saturation, lightness, note) => {
    const rgb = hslToRgb({ h: hue, s: saturation, l: lightness });
    const l = lrv(rgb);
    const gapWall = Math.abs(l - wallLrv);
    const gapSofa = Math.abs(l - sofaLrv);
    return {
      id,
      label,
      note,
      hex: rgbToHex(rgb),
      hue: round(((hue % 360) + 360) % 360, 1),
      saturation: round(clamp(saturation, 0, 100), 1),
      lightness: round(clamp(lightness, 0, 100), 1),
      lrv: round(l, 1),
      lrvGapWall: round(gapWall, 1),
      lrvGapUpholstery: round(gapSofa, 1),
      contrastWithWall: round(contrastRatio(rgb, wallRgb), 2),
      contrastWithUpholstery: round(contrastRatio(rgb, sofaRgb), 2),
      effect: gapEffect(gapWall),
      matchesGoal: Math.abs(gapWall - step) <= 12,
      fadeRisk: sun.uv === 2 && l < DARK_FABRIC_LRV && rgbToHsl(rgb).s > FADE_PRONE_SATURATION,
      isDark: l < DARK_FABRIC_LRV,
    };
  };

  // Lightness offset that lands roughly on the requested LRV move. HSL
  // lightness and LRV are not linear in each other, so the offset is applied in
  // HSL and the resulting LRV is measured, never assumed.
  const shift = wallIsLight ? -(step * 0.85) : step * 0.85;

  const suggestions = [
    build(
      "tone-on-tone",
      "Tone-on-tone with the wall",
      wallHsl.h,
      clamp(wallHsl.s * 1.15, 0, 100),
      clamp(wallHsl.l + shift, 6, 95),
      "The same hue as the wall, moved in depth only. The most forgiving option and the one that makes a small room read largest.",
    ),
    build(
      "wall-echo-soft",
      "Softer echo of the wall",
      wallHsl.h,
      clamp(wallHsl.s * 0.55, 0, 100),
      clamp(wallHsl.l + shift * 0.55, 6, 95),
      "A quieter, greyer relative of the wall colour. Good when the room already has pattern in the rug or the art.",
    ),
    build(
      "from-upholstery",
      "Drawn from the upholstery",
      sofaHsl.h,
      clamp(sofaHsl.s * 0.9, 0, 100),
      clamp(sofaHsl.l + (wallIsLight ? -6 : 8), 6, 95),
      "Repeats the sofa hue at the window, which ties the two largest fabric areas in the room together.",
    ),
    build(
      "upholstery-tint",
      "Pale tint of the upholstery",
      sofaHsl.h,
      clamp(sofaHsl.s * 0.5, 0, 100),
      clamp(Math.max(sofaHsl.l, 62) + 10, 6, 95),
      "The sofa hue diluted to a tint. Keeps the connection while letting light through and reducing solar gain.",
    ),
    build(
      "bridge",
      "Bridging hue",
      bridgeHue,
      clamp((wallHsl.s + sofaHsl.s) / 2 * 0.85, 0, 100),
      clamp((wallHsl.l + sofaHsl.l) / 2 + shift * 0.4, 6, 95),
      "The circular mean of the wall and upholstery hues, so it belongs to both without copying either.",
    ),
    build(
      "warm-neutral",
      "Warm neutral",
      WARM_NEUTRAL_HUE,
      NEUTRAL_SATURATION,
      clamp(wallHsl.l + shift, 12, 92),
      "A low-saturation warm neutral. The safe default when the wall and the sofa are already fighting for attention.",
    ),
    build(
      "cool-neutral",
      "Cool neutral",
      COOL_NEUTRAL_HUE,
      NEUTRAL_SATURATION,
      clamp(wallHsl.l + shift, 12, 92),
      "The cool equivalent. Choose it if the room's woods and metals are cool-toned rather than golden.",
    ),
    build(
      "grounding-deep",
      "Deep grounding shade",
      bridgeHue,
      clamp((wallHsl.s + sofaHsl.s) / 2 * 1.1, 8, 100),
      GROUNDING_LIGHTNESS,
      "Floor-length curtains in a deep shade weight the bottom of the room and make the ceiling read higher.",
    ),
  ];

  // Rank by how close each option lands to the LRV move the goal asked for.
  const ranked = [...suggestions].sort(
    (a, b) => Math.abs(a.lrvGapWall - step) - Math.abs(b.lrvGapWall - step),
  );
  const topPick = ranked[0];

  const warnings = [];
  if (band.id === "discordant") {
    warnings.push(
      `The wall and the upholstery sit ${round(distance)}° apart on the colour wheel, the interval that is hardest to add a third colour to. ${band.advice}`,
    );
  }
  if (sun.uv === 2 && topPick.isDark) {
    warnings.push(
      `This window gets hours of direct sun and the best match has an LRV of ${topPick.lrv}. Dark, saturated fabric fades visibly in that position — specify a lining, or accept that the leading edge will lighten within a few summers.`,
    );
  }
  if (Math.abs(wallLrv - sofaLrv) < BLEND_LRV_GAP) {
    warnings.push(
      `The wall and the sofa are only ${round(Math.abs(wallLrv - sofaLrv), 1)} LRV points apart, so the sofa is already disappearing into the wall. A curtain with more contrast will do more for the room than a matching one.`,
    );
  }

  return {
    wallHex: rgbToHex(wallRgb),
    upholsteryHex: rgbToHex(sofaRgb),
    wallLrv: round(wallLrv, 1),
    upholsteryLrv: round(sofaLrv, 1),
    wallHue: round(wallHsl.h, 1),
    upholsteryHue: round(sofaHsl.h, 1),
    hueDistance: round(distance, 1),
    bandId: band.id,
    bandLabel: band.label,
    bandAdvice: band.advice,
    bridgeHue: round(bridgeHue, 1),
    wallSofaContrast: round(contrastRatio(wallRgb, sofaRgb), 2),
    wallIsLight,
    goalId: chosenGoal.id,
    goalLabel: chosenGoal.label,
    goalTargetGap: step,
    exposureId: sun.id,
    exposureLabel: sun.label,
    exposureNote: sun.note,
    suggestions,
    ranked,
    topPick,
    warnings,
  };
}

/** Example starting colours: a warm off-white wall and a slate-blue sofa. */
export const DEFAULT_WALL_HEX = "#EDE7DC";
export const DEFAULT_UPHOLSTERY_HEX = "#4A5D6B";
