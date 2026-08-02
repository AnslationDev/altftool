/**
 * Earthy Organic Palette Generator — pure colour engine.
 *
 * The palette is built around the hue positions of real earth pigments — yellow
 * ochre, raw and burnt sienna, iron oxide red, raw umber and green earth — the
 * mineral colours that have been used in paint for millennia and that still read
 * as "natural" on a screen. On top of the palette the module reports a warm/cool
 * balance, a kraft-paper packaging preview and WCAG contrast for label text.
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round1 = (value) => Math.round(value * 10) / 10;

/* ---------------------------------------------------------------------------
 * Colour conversion and WCAG contrast
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

/** WCAG 2.1 contrast ratio, 1 to 21. */
export function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export const AA_NORMAL = 4.5;
export const AA_LARGE = 3;

/** Whichever candidate reads better on a fill — used for label text on packaging. */
export function bestLabelOn(fillRgb, candidates) {
  let winner = candidates[0];
  let winnerRatio = contrastRatio(candidates[0].rgb, fillRgb);
  for (const candidate of candidates.slice(1)) {
    const ratio = contrastRatio(candidate.rgb, fillRgb);
    if (ratio > winnerRatio) {
      winner = candidate;
      winnerRatio = ratio;
    }
  }
  return { name: winner.name, hex: winner.hex, ratio: round1(winnerRatio), passes: winnerRatio >= AA_NORMAL };
}

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
 * Pigment anchors
 *
 * Hue windows approximating where each historic earth pigment sits once mixed
 * to a usable tint. Saturation and lightness bands come from the pigment's own
 * character: ochres are bright and light, umbers dark and nearly neutral.
 * ------------------------------------------------------------------------ */

export const PIGMENTS = {
  limestone: { label: "Limestone", hue: [38, 46], sat: [8, 16], light: [92, 96] },
  sand: { label: "Sand", hue: [36, 44], sat: [16, 28], light: [84, 89] },
  yellowOchre: { label: "Yellow ochre", hue: [38, 46], sat: [42, 58], light: [52, 60] },
  rawSienna: { label: "Raw sienna", hue: [28, 36], sat: [44, 58], light: [46, 54] },
  burntSienna: { label: "Burnt sienna", hue: [14, 22], sat: [46, 60], light: [40, 48] },
  terracotta: { label: "Terracotta", hue: [12, 20], sat: [40, 54], light: [50, 58] },
  greenEarth: { label: "Green earth (terre verte)", hue: [96, 124], sat: [16, 30], light: [40, 50] },
  moss: { label: "Moss", hue: [74, 96], sat: [22, 36], light: [34, 42] },
  rawUmber: { label: "Raw umber", hue: [26, 36], sat: [22, 34], light: [16, 22] },
};

/** Kraft board colour, used for the packaging preview. */
export const KRAFT = [32, 34, 62];

/** Which lead the palette is built around. */
export const LEADS = [
  { id: "clay", label: "Clay-led (terracotta and sienna)", primary: "terracotta", secondary: "burntSienna" },
  { id: "moss", label: "Moss-led (green earth and olive)", primary: "moss", secondary: "greenEarth" },
  { id: "ochre", label: "Ochre-led (yellow ochre and sienna)", primary: "yellowOchre", secondary: "rawSienna" },
];

/** Earthiness lowers saturation towards the mineral end of each band. */
export const MIN_EARTHINESS = 0;
export const MAX_EARTHINESS = 100;

/** Warm hues sit here; anything else in the palette counts as cool. */
export const WARM_HUE_RANGE = [0, 70];
/** A natural palette usually stays warm-dominant; below this it reads cold. */
export const WARM_SHARE_TARGET = 55;

/** Tonal ramp stops for the lead pigment. */
export const RAMP_STOPS = [92, 82, 68, 54, 40, 26];

const pick = (random, [min, max]) => min + random() * (max - min);

function buildColour(random, pigment, earthBias) {
  const hue = pick(random, pigment.hue);
  // Earthiness pulls saturation towards the lower edge of the pigment's band.
  const satRange = pigment.sat;
  const saturation = satRange[1] - earthBias * (satRange[1] - satRange[0]);
  const lightness = clamp(pick(random, pigment.light), 4, 98);
  return [hue, saturation, lightness];
}

/**
 * Generate the earthy organic palette.
 *
 * @param {object} input
 * @param {string} input.seed any text
 * @param {string} input.lead one of LEADS
 * @param {number} input.earthiness 0-100; higher pulls every colour towards raw pigment
 * @returns {object} palette, or { error }
 */
export function generateEarthyPalette({ seed = "raw-clay", lead = "clay", earthiness = 55 } = {}) {
  const cleanSeed = String(seed ?? "").trim();
  if (!cleanSeed) return { error: "Enter a seed word or phrase to generate a palette." };
  if (cleanSeed.length > 64) return { error: "Keep the seed under 64 characters." };
  const leadSpec = LEADS.find((item) => item.id === lead);
  if (!leadSpec) return { error: "Pick which pigment family leads the palette." };
  const level = Number(earthiness);
  if (!Number.isFinite(level) || level < MIN_EARTHINESS || level > MAX_EARTHINESS) {
    return { error: `Earthiness must be between ${MIN_EARTHINESS} and ${MAX_EARTHINESS}.` };
  }

  const random = makeRandom(hashSeed(`${cleanSeed}|${leadSpec.id}`));
  const earthBias = level / 100;

  const definitions = [
    { key: "limestone", pigment: PIGMENTS.limestone, name: "Limestone", use: "Page background — chalky, almost white" },
    { key: "sand", pigment: PIGMENTS.sand, name: "Sand", use: "Cards, packaging fills, quiet blocks" },
    {
      key: "primary",
      pigment: PIGMENTS[leadSpec.primary],
      name: PIGMENTS[leadSpec.primary].label,
      use: "Primary — buttons, headings, the lead pigment",
    },
    {
      key: "secondary",
      pigment: PIGMENTS[leadSpec.secondary],
      name: PIGMENTS[leadSpec.secondary].label,
      use: "Secondary — supporting fills and hover states",
    },
    { key: "ochre", pigment: PIGMENTS.yellowOchre, name: "Yellow ochre", use: "Warm accent — badges, highlights" },
    { key: "green", pigment: PIGMENTS.greenEarth, name: "Green earth", use: "The cool note that stops it going orange" },
    { key: "umber", pigment: PIGMENTS.rawUmber, name: "Raw umber", use: "Text and the darkest surfaces" },
  ];

  const roles = definitions.map((definition) => {
    const hsl = buildColour(random, definition.pigment, earthBias);
    const normalised = [
      ((hsl[0] % 360) + 360) % 360,
      clamp(hsl[1], 0, 100),
      clamp(hsl[2], 0, 100),
    ];
    const rgb = hslToRgb(...normalised);
    return {
      key: definition.key,
      name: definition.name,
      use: definition.use,
      hsl: normalised,
      rgb,
      hex: hslToHex(...normalised),
      warm: normalised[0] >= WARM_HUE_RANGE[0] && normalised[0] <= WARM_HUE_RANGE[1],
      hslText: `hsl(${Math.round(normalised[0])} ${Math.round(normalised[1])}% ${Math.round(normalised[2])}%)`,
    };
  });

  const byKey = Object.fromEntries(roles.map((role) => [role.key, role]));

  const kraftHsl = [KRAFT[0], KRAFT[1], KRAFT[2]];
  const kraft = {
    key: "kraft",
    name: "Kraft board",
    use: "Unbleached packaging stock, for checking print colour",
    hsl: kraftHsl,
    rgb: hslToRgb(...kraftHsl),
    hex: hslToHex(...kraftHsl),
  };

  const ramp = RAMP_STOPS.map((lightness, index) => ({
    key: `primary-${(index + 1) * 100}`,
    step: (index + 1) * 100,
    hsl: [byKey.primary.hsl[0], byKey.primary.hsl[1], lightness],
    hex: hslToHex(byKey.primary.hsl[0], byKey.primary.hsl[1], lightness),
  }));

  // Label text options for packaging. Four realistic inks: the palette's own
  // umber, a deeper cut of it, the limestone paper colour and a chalk white —
  // the choices a printer would actually have on an earth-toned pack.
  const deepUmberHsl = [byKey.umber.hsl[0], byKey.umber.hsl[1], 9];
  const chalkHsl = [byKey.limestone.hsl[0], Math.min(byKey.limestone.hsl[1], 8), 97];
  const labelCandidates = [
    { name: "Umber ink", hex: byKey.umber.hex, rgb: byKey.umber.rgb },
    { name: "Deep umber ink", hex: hslToHex(...deepUmberHsl), rgb: hslToRgb(...deepUmberHsl) },
    { name: "Limestone", hex: byKey.limestone.hex, rgb: byKey.limestone.rgb },
    { name: "Chalk white", hex: hslToHex(...chalkHsl), rgb: hslToRgb(...chalkHsl) },
  ];
  const packaging = [byKey.primary, byKey.secondary, byKey.ochre, byKey.green, byKey.sand, kraft].map((fill) => {
    const label = bestLabelOn(fill.rgb, labelCandidates);
    return {
      key: fill.key,
      name: fill.name,
      fillHex: fill.hex,
      hex: label.hex,
      ratio: label.ratio,
      passes: label.passes,
    };
  });

  const checks = [
    { id: "umber-limestone", label: "Umber text on limestone", fg: byKey.umber, bg: byKey.limestone, min: AA_NORMAL },
    { id: "umber-sand", label: "Umber text on sand", fg: byKey.umber, bg: byKey.sand, min: AA_NORMAL },
    { id: "umber-kraft", label: "Umber ink on kraft board", fg: byKey.umber, bg: kraft, min: AA_NORMAL },
    { id: "primary-limestone", label: "Primary as text on limestone", fg: byKey.primary, bg: byKey.limestone, min: AA_NORMAL },
    { id: "green-limestone", label: "Green earth as a UI shape", fg: byKey.green, bg: byKey.limestone, min: AA_LARGE },
    { id: "ochre-limestone", label: "Ochre as a UI shape", fg: byKey.ochre, bg: byKey.limestone, min: AA_LARGE },
  ].map((check) => {
    const ratio = contrastRatio(check.fg.rgb, check.bg.rgb);
    return {
      id: check.id,
      label: check.label,
      ratio: round1(ratio),
      min: check.min,
      passes: ratio >= check.min,
      verdict: ratio >= AA_NORMAL ? "Body text" : ratio >= AA_LARGE ? "Large text and UI only" : "Decoration only",
    };
  });

  const warmCount = roles.filter((role) => role.warm).length;
  const warmShare = round1((warmCount / roles.length) * 100);
  const meanSaturation = round1(roles.reduce((sum, role) => sum + role.hsl[1], 0) / roles.length);
  const lightnessSpread = round1(
    Math.max(...roles.map((role) => role.hsl[2])) - Math.min(...roles.map((role) => role.hsl[2])),
  );

  const notes = [];
  if (warmShare < WARM_SHARE_TARGET) {
    notes.push(
      `Only ${warmShare}% of the palette sits in the warm ${WARM_HUE_RANGE[0]}-${WARM_HUE_RANGE[1]}° band; earth palettes usually stay above ${WARM_SHARE_TARGET}% or they start to read cold.`,
    );
  } else {
    notes.push(`${warmShare}% of the palette is warm — comfortably in the range that reads as natural.`);
  }
  if (meanSaturation > 45) {
    notes.push(`Mean saturation is ${meanSaturation}% — raise earthiness to pull it back towards raw pigment.`);
  }
  if (lightnessSpread < 55) {
    notes.push(
      `Lightness spread is only ${lightnessSpread} points, so the palette may look flat; it needs a genuinely pale and a genuinely dark member.`,
    );
  }

  const cssVariables = [
    ":root {",
    ...roles.map((role) => `  --earth-${role.key}: ${role.hex};`),
    `  --earth-kraft: ${kraft.hex};`,
    ...ramp.map((step) => `  --earth-${step.key}: ${step.hex};`),
    "}",
  ].join("\n");

  const tailwindTheme = [
    "@theme {",
    ...roles.map((role) => `  --color-earth-${role.key}: ${role.hex};`),
    `  --color-earth-kraft: ${kraft.hex};`,
    ...ramp.map((step) => `  --color-earth-${step.key}: ${step.hex};`),
    "}",
  ].join("\n");

  const json = JSON.stringify(
    {
      seed: cleanSeed,
      lead: leadSpec.id,
      earthiness: level,
      roles: Object.fromEntries(roles.map((role) => [role.key, role.hex])),
      kraft: kraft.hex,
      primaryRamp: ramp.map((step) => step.hex),
      warmShare,
      meanSaturation,
    },
    null,
    2,
  );

  return {
    seed: cleanSeed,
    lead: leadSpec,
    earthiness: level,
    roles,
    kraft,
    ramp,
    packaging,
    checks,
    notes,
    warmShare,
    meanSaturation,
    lightnessSpread,
    cssVariables,
    tailwindTheme,
    json,
    summary: roles
      .map((role) => `${role.name}: ${role.hex}`)
      .concat([`Kraft board: ${kraft.hex}`])
      .join("\n"),
  };
}
