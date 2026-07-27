/**
 * Scandinavian Palette Generator — pure colour engine.
 *
 * Nordic palettes are defined by restraint: saturation stays low, lightness
 * stays high, and the whites are tinted rather than pure. This module generates
 * such a palette and reports the two numbers interior designers actually use —
 * Light Reflectance Value (LRV) and contrast — plus a 60-30-10 allocation.
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round1 = (value) => Math.round(value * 10) / 10;

/* ---------------------------------------------------------------------------
 * Colour conversion, luminance, LRV and contrast
 * ------------------------------------------------------------------------ */

/** HSL -> sRGB 0-255 (CSS Color 3). */
export function hslToRgb(h, s, l) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const sat = clamp(Number(s), 0, 100) / 100;
  const lig = clamp(Number(l), 0, 100) / 100;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  let rgb;
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgb.map((channel) => clamp(Math.round((channel + m) * 255), 0, 255));
}

export function hslToHex(h, s, l) {
  return `#${hslToRgb(h, s, l)
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** WCAG 2.1 relative luminance, 0-1. */
export function relativeLuminance([r, g, b]) {
  const channel = (value) => {
    const v = clamp(value, 0, 255) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * Light Reflectance Value, 0 (absorbs everything) to 100 (reflects everything).
 * Paint manufacturers measure LRV on a physical sample; this is the standard
 * screen approximation, sRGB relative luminance expressed as a percentage.
 */
export function lightReflectanceValue(rgb) {
  return round1(relativeLuminance(rgb) * 100);
}

/** WCAG 2.1 contrast ratio, 1 to 21. */
export function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export const AA_NORMAL = 4.5;
export const AA_LARGE = 3;

/**
 * Practical LRV guidance used by paint suppliers: walls in a room with limited
 * daylight are usually kept at LRV 60 or above, and ceilings higher still, so
 * the surface keeps bouncing light instead of swallowing it.
 */
export const WALL_LRV_MIN = 60;
export const CEILING_LRV_MIN = 80;
/** Below this, a colour reads as a dark accent rather than a light neutral. */
export const ACCENT_LRV_MAX = 25;

/* ---------------------------------------------------------------------------
 * Seeded randomness
 * ------------------------------------------------------------------------ */

export function hashSeed(text) {
  let hash = 2166136261;
  const source = String(text ?? "");
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function makeRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------------------
 * The Scandinavian recipe
 * ------------------------------------------------------------------------ */

/** Hue windows: warm plaster and birch on one side, cold stone and sky on the other. */
export const HUE_WINDOWS = {
  warmWhite: [32, 44],
  coolWhite: [198, 214],
  birch: [26, 38],
  stone: [200, 218],
  sage: [118, 148],
  ink: [204, 220],
};

/** Saturation stays inside this band — above it the palette stops reading as Nordic. */
export const SATURATION_BAND = { min: 2, max: 18 };

/**
 * Room aspect changes the light entering it, so designers compensate in the
 * paint: north-facing rooms get warmer colour to offset cool daylight, and
 * south-facing rooms can take cooler colour.
 */
export const ORIENTATIONS = [
  { id: "north", label: "North-facing (cool daylight)", warmthShift: 12, lightShift: 2 },
  { id: "east-west", label: "East or west-facing (changing light)", warmthShift: 4, lightShift: 0 },
  { id: "south", label: "South-facing (warm daylight)", warmthShift: -8, lightShift: -1 },
];

export const MIN_WARMTH = 0;
export const MAX_WARMTH = 100;

/** The 60-30-10 rule: dominant surface, secondary surface, accent. */
export const ALLOCATION = [
  { key: "dominant", share: 60, note: "Walls and the largest surfaces" },
  { key: "secondary", share: 30, note: "Furniture, textiles, cabinetry" },
  { key: "accent", share: 10, note: "Joinery, hardware, one strong object" },
];

const pick = (random, [min, max]) => min + random() * (max - min);

/**
 * Generate the Scandinavian palette.
 *
 * @param {object} input
 * @param {string} input.seed any text
 * @param {string} input.orientation one of ORIENTATIONS
 * @param {number} input.warmth 0-100; slides the whole palette warm or cool
 * @returns {object} palette, or { error }
 */
export function generateScandiPalette({ seed = "hygge", orientation = "north", warmth = 55 } = {}) {
  const cleanSeed = String(seed ?? "").trim();
  if (!cleanSeed) return { error: "Enter a seed word or phrase to generate a palette." };
  if (cleanSeed.length > 64) return { error: "Keep the seed under 64 characters." };
  const aspect = ORIENTATIONS.find((item) => item.id === orientation);
  if (!aspect) return { error: "Pick the room orientation." };
  const warmthLevel = Number(warmth);
  if (!Number.isFinite(warmthLevel) || warmthLevel < MIN_WARMTH || warmthLevel > MAX_WARMTH) {
    return { error: `Warmth must be between ${MIN_WARMTH} and ${MAX_WARMTH}.` };
  }

  const random = makeRandom(hashSeed(`${cleanSeed}|${aspect.id}`));
  // Effective warmth combines the slider with the orientation compensation.
  const warmBias = clamp(warmthLevel + aspect.warmthShift, 0, 100) / 100;

  // Warmth also decides how much pigment the near-whites carry: a warm scheme
  // holds a little more colour, a cool one is closer to neutral.
  const sat = (share) =>
    clamp(SATURATION_BAND.min + share * (SATURATION_BAND.max - SATURATION_BAND.min), SATURATION_BAND.min, SATURATION_BAND.max);
  const whiteSat = (share) => sat(share * (0.4 + warmBias * 1.2));
  const light = (value) => clamp(value + aspect.lightShift, 4, 99);

  // Whites are mixed between the warm and the cool anchor by the warm bias.
  const warmWhiteH = pick(random, HUE_WINDOWS.warmWhite);
  const coolWhiteH = pick(random, HUE_WINDOWS.coolWhite);
  const whiteHue = warmBias >= 0.5 ? warmWhiteH : coolWhiteH;
  const secondaryWhiteHue = warmBias >= 0.5 ? coolWhiteH : warmWhiteH;

  const roles = [
    {
      key: "ceiling",
      name: "Ceiling white",
      use: "Ceilings and trim — the brightest surface in the room",
      hsl: [whiteHue, whiteSat(0.18), light(98)],
    },
    {
      key: "wall",
      name: "Wall white",
      use: "Dominant wall colour",
      hsl: [whiteHue, whiteSat(0.45), light(94)],
    },
    {
      key: "plaster",
      name: "Plaster",
      use: "Secondary walls, alcoves, a quieter zone",
      hsl: [secondaryWhiteHue, whiteSat(0.55), light(88)],
    },
    {
      key: "birch",
      name: "Birch",
      use: "Wood tone — floors, table tops, shelving",
      hsl: [pick(random, HUE_WINDOWS.birch), sat(0.85), light(76)],
    },
    {
      key: "stone",
      name: "Cold stone",
      use: "Textiles and mid-tone surfaces",
      hsl: [pick(random, HUE_WINDOWS.stone), sat(0.55), light(62)],
    },
    {
      key: "sage",
      name: "Muted sage",
      use: "The single colour note — cabinetry or one wall",
      hsl: [pick(random, HUE_WINDOWS.sage), sat(0.5), light(58)],
    },
    {
      key: "charcoal",
      name: "Charcoal",
      use: "Accent — joinery, frames, hardware, text",
      hsl: [pick(random, HUE_WINDOWS.ink), sat(0.6), light(18)],
    },
  ].map((role) => {
    const hsl = [((role.hsl[0] % 360) + 360) % 360, clamp(role.hsl[1], 0, 100), clamp(role.hsl[2], 0, 100)];
    const rgb = hslToRgb(...hsl);
    return {
      ...role,
      hsl,
      rgb,
      hex: hslToHex(...hsl),
      lrv: lightReflectanceValue(rgb),
      hslText: `hsl(${Math.round(hsl[0])} ${Math.round(hsl[1])}% ${Math.round(hsl[2])}%)`,
    };
  });

  const byKey = Object.fromEntries(roles.map((role) => [role.key, role]));

  const checks = [
    { id: "charcoal-wall", label: "Charcoal text on wall white", fg: byKey.charcoal, bg: byKey.wall, min: AA_NORMAL },
    { id: "charcoal-plaster", label: "Charcoal text on plaster", fg: byKey.charcoal, bg: byKey.plaster, min: AA_NORMAL },
    { id: "ceiling-charcoal", label: "Ceiling white on charcoal", fg: byKey.ceiling, bg: byKey.charcoal, min: AA_NORMAL },
    { id: "stone-wall", label: "Stone beside wall white", fg: byKey.stone, bg: byKey.wall, min: AA_LARGE, kind: "surface" },
    { id: "sage-wall", label: "Sage beside wall white", fg: byKey.sage, bg: byKey.wall, min: AA_LARGE, kind: "surface" },
    { id: "birch-wall", label: "Birch beside wall white", fg: byKey.birch, bg: byKey.wall, min: AA_LARGE, kind: "surface" },
  ].map((check) => {
    const ratio = contrastRatio(check.fg.rgb, check.bg.rgb);
    const kind = check.kind ?? "text";
    return {
      id: check.id,
      label: check.label,
      ratio: round1(ratio),
      min: check.min,
      kind,
      passes: ratio >= check.min,
      verdict:
        kind === "surface"
          ? ratio >= AA_LARGE
            ? "Reads as a distinct surface; also usable for UI shapes"
            : "Soft tonal shift — intended here, but not enough for text or borders"
          : ratio >= AA_NORMAL
            ? "Body text"
            : ratio >= AA_LARGE
              ? "Large text and UI only"
              : "Decoration only",
    };
  });

  const notes = [];
  if (byKey.wall.lrv < WALL_LRV_MIN) {
    notes.push(
      `Wall white has an LRV of ${byKey.wall.lrv}; suppliers usually recommend LRV ${WALL_LRV_MIN}+ for walls in rooms with limited daylight.`,
    );
  }
  if (byKey.ceiling.lrv < CEILING_LRV_MIN) {
    notes.push(`Ceiling white sits at LRV ${byKey.ceiling.lrv}, below the LRV ${CEILING_LRV_MIN} usually used overhead.`);
  }
  if (byKey.charcoal.lrv > ACCENT_LRV_MAX) {
    notes.push(`Charcoal is at LRV ${byKey.charcoal.lrv} — it will read as a mid grey rather than a dark accent.`);
  }
  if (aspect.id === "north") {
    notes.push("North light is cool and even, so the whites here carry extra warmth to stop the room reading grey.");
  }
  if (notes.length === 0) {
    notes.push("Every surface sits inside the usual LRV guidance for its role.");
  }

  const allocation = ALLOCATION.map((slot, index) => ({
    ...slot,
    role: index === 0 ? byKey.wall : index === 1 ? byKey.plaster : byKey.charcoal,
  }));

  // Mean LRV of the three largest surfaces is a rough read on how bright the
  // finished room will feel.
  const roomLrv = round1((byKey.wall.lrv * 0.6 + byKey.plaster.lrv * 0.3 + byKey.charcoal.lrv * 0.1) / 1);

  const cssVariables = [
    ":root {",
    ...roles.map((role) => `  --scandi-${role.key}: ${role.hex};`),
    "}",
  ].join("\n");

  const tailwindTheme = [
    "@theme {",
    ...roles.map((role) => `  --color-scandi-${role.key}: ${role.hex};`),
    "}",
  ].join("\n");

  const json = JSON.stringify(
    {
      seed: cleanSeed,
      orientation: aspect.id,
      warmth: warmthLevel,
      roles: Object.fromEntries(roles.map((role) => [role.key, { hex: role.hex, lrv: role.lrv }])),
      roomLrv,
    },
    null,
    2,
  );

  return {
    seed: cleanSeed,
    orientation: aspect,
    warmth: warmthLevel,
    roles,
    checks,
    notes,
    allocation,
    roomLrv,
    saturationBand: SATURATION_BAND,
    meanSaturation: round1(roles.reduce((sum, role) => sum + role.hsl[1], 0) / roles.length),
    cssVariables,
    tailwindTheme,
    json,
    summary: roles.map((role) => `${role.name}: ${role.hex} (LRV ${role.lrv})`).join("\n"),
  };
}
