/**
 * Room colour palette from a mood and the light the room actually gets.
 *
 * Two real pieces of arithmetic sit under the styling advice.
 *
 * 1. Light Reflectance Value (LRV). A colour's LRV is its relative luminance
 *    expressed on a 0-100 scale, computed exactly the way WCAG defines relative
 *    luminance: each sRGB channel is normalised, linearised through the sRGB
 *    transfer function, and combined as
 *
 *      Y = 0.2126 R + 0.7152 G + 0.0722 B
 *
 *    Pure white gives 100, pure black 0, saturated red 21.3. Decorators use LRV
 *    to judge how much light a wall gives back to the room, which is exactly the
 *    question a north-facing room raises.
 *
 * 2. Contrast ratio, again from WCAG: (Ylight + 0.05) / (Ydark + 0.05), which
 *    runs from 1:1 to 21:1. It decides whether trim and lettering will actually
 *    read against the wall colour; 4.5:1 is the AA threshold for normal text and
 *    3:1 for large text and graphics.
 *
 * Palette structure follows the 60-30-10 convention used in interior design: a
 * dominant wall colour over about 60% of the visible surface, a secondary over
 * 30% and an accent over the last 10%.
 */

/** sRGB relative luminance coefficients, from the sRGB specification. */
export const LUMINANCE_COEFFICIENTS = { r: 0.2126, g: 0.7152, b: 0.0722 };

/** WCAG contrast threshold for large text and graphical objects (this tool never renders body text directly on a swatch, so only the large/graphics threshold is used). */
export const CONTRAST_AA_LARGE = 3;

/** Below this LRV a wall gives back little light; above it a room stays bright. */
export const LOW_LRV_THRESHOLD = 40;
export const BRIGHT_LRV_THRESHOLD = 60;

/**
 * Moods, each anchored to a hue and a saturation/lightness band. Hue is in
 * degrees on the standard colour wheel: 0 red, 60 yellow, 120 green, 180 cyan,
 * 240 blue, 300 magenta.
 */
export const MOODS = [
  { id: "calm", label: "Calm and restful", hue: 200, sat: 26, light: 84, accentOffset: 150, note: "Soft blue-greens read as quiet; they are the usual choice for bedrooms." },
  { id: "focus", label: "Focused and clear", hue: 215, sat: 20, light: 80, accentOffset: 30, note: "Cool, low-saturation walls keep a study from feeling busy." },
  { id: "energetic", label: "Energetic", hue: 28, sat: 72, light: 62, accentOffset: 200, note: "Warm oranges lift a room; keep them to one wall if the room is small." },
  { id: "cosy", label: "Cosy and warm", hue: 20, sat: 34, light: 70, accentOffset: 190, note: "Earthy terracotta and clay tones close a large room in." },
  { id: "fresh", label: "Fresh and airy", hue: 150, sat: 24, light: 86, accentOffset: 180, note: "Pale greens hold their character in strong daylight." },
  { id: "luxurious", label: "Rich and luxurious", hue: 265, sat: 30, light: 42, accentOffset: 45, note: "Deep colours need good light or good lamps — check the LRV before committing." },
  { id: "playful", label: "Playful", hue: 340, sat: 45, light: 76, accentOffset: 130, note: "Bright, light-heavy schemes suit children's rooms and keep them from feeling dim." },
];

/**
 * How the window direction changes the light. In the northern hemisphere a
 * north-facing room never gets direct sun and its light is cool and even, so
 * warming the palette and keeping it light compensates; a south-facing room gets
 * warm direct sun and can carry cooler or deeper colours. In the southern
 * hemisphere the two swap.
 */
export const DIRECTIONS = [
  { id: "north", label: "North-facing", description: "Cool, indirect light all day" },
  { id: "east", label: "East-facing", description: "Warm morning light, cooler afternoon" },
  { id: "south", label: "South-facing", description: "Warm direct light for most of the day" },
  { id: "west", label: "West-facing", description: "Cool morning, strong warm light in the evening" },
];

export const HEMISPHERES = [
  { id: "north", label: "Northern hemisphere" },
  { id: "south", label: "Southern hemisphere" },
];

export const DEPTHS = [
  { id: "light", label: "Light and open", lightAdjust: 8 },
  { id: "medium", label: "Medium", lightAdjust: 0 },
  { id: "deep", label: "Deep and enveloping", lightAdjust: -18 },
];

/** The warm anchor a cool room is nudged towards, and the cool anchor for a sunny one. */
const WARM_ANCHOR_HUE = 40;
const COOL_ANCHOR_HUE = 220;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Move a hue a number of degrees towards a target, taking the short way round. */
export function nudgeHue(hue, target, degrees) {
  const diff = ((target - hue + 540) % 360) - 180;
  const step = Math.sign(diff) * Math.min(Math.abs(diff), degrees);
  return (hue + step + 360) % 360;
}

/** HSL (h in degrees, s and l in percent) to 8-bit sRGB. */
export function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  let rgb;
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgb.map((channel) => Math.round((channel + m) * 255));
}

/** 8-bit sRGB triple to a CSS colour string. */
export function rgbToCss([r, g, b]) {
  const hex = (value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

/** WCAG relative luminance of an 8-bit sRGB triple, 0 to 1. */
export function relativeLuminance([r, g, b]) {
  const channel = (value) => {
    const v = clamp(value, 0, 255) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return (
    LUMINANCE_COEFFICIENTS.r * channel(r) +
    LUMINANCE_COEFFICIENTS.g * channel(g) +
    LUMINANCE_COEFFICIENTS.b * channel(b)
  );
}

/** Light Reflectance Value, 0 to 100. */
export function lrv(rgb) {
  return relativeLuminance(rgb) * 100;
}

/** WCAG contrast ratio between two sRGB triples, 1 to 21. */
export function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Pick the lightness for the accent so it actually reads against the wall.
 * Starts at the requested lightness and searches darker, then lighter, for the
 * first value that clears the 3:1 contrast a shape needs to be distinguishable;
 * if nothing clears it, returns whichever candidate contrasts most.
 */
export function accentLightnessFor(hue, sat, startLight, wallRgb) {
  const candidates = [startLight];
  for (let step = 2; step <= 90; step += 2) {
    if (startLight - step >= 10) candidates.push(startLight - step);
    if (startLight + step <= 92) candidates.push(startLight + step);
  }
  let best = candidates[0];
  let bestContrast = 0;
  for (const candidate of candidates) {
    const ratio = contrastRatio(hslToRgb(hue, sat, candidate), wallRgb);
    if (ratio >= CONTRAST_AA_LARGE) return candidate;
    if (ratio > bestContrast) {
      bestContrast = ratio;
      best = candidate;
    }
  }
  return best;
}

function makeSwatch(role, share, h, s, l, purpose) {
  const rgb = hslToRgb(h, s, l);
  return {
    role,
    share,
    purpose,
    hue: Math.round(h),
    saturation: Math.round(s),
    lightness: Math.round(l),
    rgb,
    css: rgbToCss(rgb),
    lrv: lrv(rgb),
  };
}

/**
 * @returns {{error:string}|object}
 */
export function buildRoomPalette({
  mood = "calm",
  direction = "north",
  hemisphere = "north",
  depth = "medium",
}) {
  const moodSpec = MOODS.find((entry) => entry.id === mood);
  if (!moodSpec) return { error: "Choose the mood you want the room to have." };
  const directionSpec = DIRECTIONS.find((entry) => entry.id === direction);
  if (!directionSpec) return { error: "Choose which way the room's main window faces." };
  if (!HEMISPHERES.some((entry) => entry.id === hemisphere)) {
    return { error: "Choose a hemisphere so the window direction can be read correctly." };
  }
  const depthSpec = DEPTHS.find((entry) => entry.id === depth);
  if (!depthSpec) return { error: "Choose how deep you want the colour to go." };

  // In the southern hemisphere the sunny and shaded sides swap over.
  const effectiveDirection =
    hemisphere === "south"
      ? { north: "south", south: "north", east: "east", west: "west" }[direction]
      : direction;
  // The description of the light the room actually gets, from the hemisphere-corrected
  // direction — never from the raw, unswapped `direction` the user picked.
  const directionDescription = DIRECTIONS.find((entry) => entry.id === effectiveDirection).description;

  let hue = moodSpec.hue;
  let sat = moodSpec.sat;
  let light = moodSpec.light + depthSpec.lightAdjust;
  let lightNote;

  if (effectiveDirection === "north") {
    hue = nudgeHue(hue, WARM_ANCHOR_HUE, 10);
    sat += 4;
    light += 5;
    lightNote = "Cool indirect light all day — the palette has been warmed and lifted so the room does not read grey.";
  } else if (effectiveDirection === "south") {
    hue = nudgeHue(hue, COOL_ANCHOR_HUE, 5);
    light -= 4;
    lightNote = "Strong warm daylight — this room can carry a cooler, slightly deeper colour without going flat.";
  } else if (effectiveDirection === "east") {
    light += 2;
    lightNote = "Warm in the morning and cooler after noon — a balanced mid-tone shifts least across the day.";
  } else {
    hue = nudgeHue(hue, WARM_ANCHOR_HUE, 4);
    light += 3;
    lightNote = "Cool until midday and strongly warm by evening — expect this colour to look noticeably richer at sunset.";
  }

  sat = clamp(sat, 0, 100);
  light = clamp(light, 8, 96);

  const wall = makeSwatch("Dominant", 60, hue, sat, light, "Walls — the colour the room is remembered by");
  const secondary = makeSwatch(
    "Secondary",
    30,
    (hue + 30) % 360,
    clamp(sat * 0.85, 0, 100),
    clamp(light - 10, 8, 96),
    "Large furniture, curtains, rug",
  );
  const accentHue = (hue + moodSpec.accentOffset) % 360;
  const accentSat = clamp(sat + 35, 0, 100);
  const accentLight = accentLightnessFor(
    accentHue,
    accentSat,
    clamp(light - 32, 12, 90),
    wall.rgb,
  );
  const accent = makeSwatch(
    "Accent",
    10,
    accentHue,
    accentSat,
    accentLight,
    "Cushions, art, one painted element",
  );
  const trim = makeSwatch(
    "Trim and ceiling",
    0,
    hue,
    clamp(sat * 0.25, 0, 100),
    clamp(light + 12, 8, 97),
    "Skirting, doors, ceiling — kept close in hue so it does not jar",
  );

  const wallTrimContrast = contrastRatio(wall.rgb, trim.rgb);
  const wallAccentContrast = contrastRatio(wall.rgb, accent.rgb);

  const cautions = [];
  if (effectiveDirection === "north" && wall.lrv < BRIGHT_LRV_THRESHOLD) {
    cautions.push(
      `The wall colour has an LRV of ${wall.lrv.toFixed(0)}, below the ${BRIGHT_LRV_THRESHOLD} that keeps a room with only cool indirect light feeling bright. Either lighten it or plan warm lamps at two levels.`,
    );
  }
  if (wall.lrv < LOW_LRV_THRESHOLD) {
    cautions.push(
      `An LRV of ${wall.lrv.toFixed(0)} means the wall returns only about ${wall.lrv.toFixed(0)}% of the light falling on it, so the room will need noticeably more artificial light.`,
    );
  }
  if (wallAccentContrast < CONTRAST_AA_LARGE) {
    cautions.push(
      `The accent sits at only ${wallAccentContrast.toFixed(2)}:1 against the wall, under the ${CONTRAST_AA_LARGE}:1 that makes a shape read clearly from across the room. Deepen the accent if you want it to stand out.`,
    );
  }

  return {
    mood: moodSpec,
    direction: directionSpec,
    effectiveDirection,
    directionDescription,
    depth: depthSpec,
    lightNote,
    swatches: [wall, secondary, accent, trim],
    wall,
    secondary,
    accent,
    trim,
    wallTrimContrast,
    wallAccentContrast,
    trimReadsAgainstWall: wallTrimContrast >= CONTRAST_AA_LARGE,
    cautions,
  };
}
