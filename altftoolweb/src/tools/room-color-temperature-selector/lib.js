/**
 * Choosing a light colour temperature, colour rendering and light level per room.
 *
 * Two independent decisions are being made.
 *
 * COLOUR TEMPERATURE. Each room has a conventional band, driven by what happens
 * there: warm light (2200-3000 K) where people relax, neutral to cool
 * (3500-5000 K) where people work or need to see detail. A mood choice shifts
 * that band by a fixed number of kelvin, clamped to the range LED lamps are
 * actually sold in. The Kruithof effect explains why the bands go together with
 * light level: warm light looks pleasant when it is dim, and cold light only
 * looks natural when it is bright.
 *
 * LIGHT LEVEL. Illuminance targets come from EN 12464-1 and the equivalent IES
 * recommendations - 500 lux over a desk for writing and typing, 300 lux for
 * general kitchen and utility work, 100-150 lux for circulation. Converting a
 * lux target into lamp lumens has to allow for light that never reaches the
 * task, so:
 *
 *   lumens = lux x area / (utilisation factor x maintenance factor)
 *
 * Utilisation factor is the share of lamp output that reaches the working
 * plane - roughly 0.6 in an ordinary light-coloured room. Maintenance factor
 * allows for dirt and lumen depreciation over the life of the installation,
 * usually 0.8.
 */

/** Warmest and coolest white LED lamps are commonly sold in, kelvin. */
export const MIN_CCT = 1800;
export const MAX_CCT = 6500;

/** Default share of lamp lumens that reaches the working plane. */
export const DEFAULT_UTILISATION = 0.6;

/** Default allowance for dirt and lumen depreciation over the maintenance cycle. */
export const DEFAULT_MAINTENANCE = 0.8;

/** Typical efficacy of a current mainstream LED lamp, lumens per watt. */
export const DEFAULT_EFFICACY_LM_W = 100;

export const SQFT_PER_M2 = 10.7639104;

/**
 * Room profiles. Illuminance targets follow EN 12464-1 / IES practice; colour
 * temperature bands are the conventional residential and retail choices.
 */
export const ROOM_PROFILES = [
  { id: "living", label: "Living room", cctMin: 2700, cctMax: 3000, ambientLux: 100, taskLux: 300, criMin: 80, note: "Warm and dimmable. Layer table and floor lamps rather than relying on one ceiling fitting." },
  { id: "bedroom", label: "Bedroom", cctMin: 2200, cctMax: 2700, ambientLux: 100, taskLux: 300, criMin: 80, note: "Keep it warm in the evening; blue-rich light late at night suppresses melatonin." },
  { id: "nursery", label: "Nursery", cctMin: 2200, cctMax: 2700, ambientLux: 100, taskLux: 200, criMin: 80, note: "Very warm and dimmable, with a low-level night setting for feeds." },
  { id: "kitchen", label: "Kitchen", cctMin: 3000, cctMax: 4000, ambientLux: 300, taskLux: 500, criMin: 85, note: "Neutral overhead with brighter under-cabinet light on the worktop." },
  { id: "dining", label: "Dining room", cctMin: 2700, cctMax: 3000, ambientLux: 150, taskLux: 300, criMin: 90, note: "High CRI matters here — food and skin look flat under low-CRI lamps." },
  { id: "bathroom", label: "Bathroom", cctMin: 3000, cctMax: 4000, ambientLux: 200, taskLux: 500, criMin: 90, note: "Light the mirror from both sides at face height rather than from directly above." },
  { id: "office", label: "Home office", cctMin: 4000, cctMax: 5000, ambientLux: 300, taskLux: 500, criMin: 80, note: "EN 12464-1 sets 500 lux for writing, typing and reading — measure at the desk, not the floor." },
  { id: "study", label: "Study / homework area", cctMin: 4000, cctMax: 5000, ambientLux: 300, taskLux: 500, criMin: 80, note: "Cool enough to stay alert, with the task light on the opposite side to the writing hand." },
  { id: "hallway", label: "Hallway and landing", cctMin: 2700, cctMax: 3000, ambientLux: 100, taskLux: 150, criMin: 80, note: "Match the rooms it connects, so the transition does not read as a colour shift." },
  { id: "stairs", label: "Stairs", cctMin: 3000, cctMax: 3500, ambientLux: 150, taskLux: 150, criMin: 80, note: "Light the treads without glare from below; contrast on the nosing matters more than raw level." },
  { id: "utility", label: "Laundry / utility", cctMin: 3500, cctMax: 4000, ambientLux: 300, taskLux: 300, criMin: 80, note: "Neutral white so fabric colours read correctly when sorting." },
  { id: "garage", label: "Garage / workshop", cctMin: 4000, cctMax: 5000, ambientLux: 300, taskLux: 750, criMin: 80, note: "EN 12464-1 asks for 300 lux for rough work and up to 750 for precision benches." },
  { id: "gym", label: "Home gym", cctMin: 4000, cctMax: 5000, ambientLux: 300, taskLux: 300, criMin: 80, note: "Cool and bright helps perceived alertness; avoid glare in the mirror line." },
  { id: "theatre", label: "Home theatre / media room", cctMin: 2200, cctMax: 2700, ambientLux: 50, taskLux: 100, criMin: 80, note: "Very low ambient with bias lighting behind the screen to reduce eye strain." },
  { id: "studio", label: "Art / craft studio", cctMin: 5000, cctMax: 5000, ambientLux: 500, taskLux: 750, criMin: 95, note: "5000 K at CRI 95+ matches the D50 viewing standard used for judging colour in print." },
  { id: "retail", label: "Retail or display area", cctMin: 3000, cctMax: 3500, ambientLux: 300, taskLux: 500, criMin: 90, note: "Warm-neutral accent light at high CRI makes merchandise read richer than flat cool light." },
  { id: "outdoor", label: "Porch / outdoor seating", cctMin: 2200, cctMax: 2700, ambientLux: 50, taskLux: 100, criMin: 80, note: "Warm, low and shielded — amber light also attracts far fewer insects than cool white." },
];

/** Mood shifts the room's default band by a fixed number of kelvin. */
export const MOODS = [
  { id: "cosy", label: "Cosy and relaxing", offsetK: -300 },
  { id: "inviting", label: "Warm and inviting", offsetK: -150 },
  { id: "neutral", label: "Neutral — as the room suggests", offsetK: 0 },
  { id: "bright", label: "Bright and alert", offsetK: 500 },
  { id: "clinical", label: "Crisp and task focused", offsetK: 800 },
];

/** Named bands people search for. */
export const CCT_BANDS = [
  { max: 2400, label: "Ultra warm / candle white" },
  { max: 2900, label: "Warm white" },
  { max: 3500, label: "Soft white" },
  { max: 4500, label: "Neutral / cool white" },
  { max: 5500, label: "Daylight white" },
  { max: Infinity, label: "Cool daylight" },
];

export function bandFor(kelvin) {
  const k = Number(kelvin);
  if (!Number.isFinite(k)) return "";
  const band = CCT_BANDS.find((entry) => k <= entry.max);
  return band ? band.label : "";
}

/**
 * Approximate sRGB appearance of a black-body radiator at a given temperature,
 * using Tanner Helland's widely used curve fit to the Planckian locus. Valid
 * from roughly 1000 K to 40000 K.
 *
 * @returns {{ r: number, g: number, b: number, hex: string }}
 */
export function kelvinToRgb(kelvin) {
  const k = Math.min(40000, Math.max(1000, Number(kelvin) || 0));
  const t = k / 100;
  const clamp = (value) => Math.min(255, Math.max(0, Math.round(value)));

  let r;
  let g;
  let b;

  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  }

  if (t >= 66) {
    b = 255;
  } else if (t <= 19) {
    b = 0;
  } else {
    b = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  }

  const rr = clamp(r);
  const gg = clamp(g);
  const bb = clamp(b);
  const hex = `#${[rr, gg, bb].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  return { r: rr, g: gg, b: bb, hex };
}

/** Lamp lumens needed to reach a lux target over an area. */
export function lumensFor({ lux, areaM2, utilisation = DEFAULT_UTILISATION, maintenance = DEFAULT_MAINTENANCE }) {
  const e = Number(lux);
  const a = Number(areaM2);
  const u = Number(utilisation);
  const m = Number(maintenance);
  if (!(e > 0) || !(a > 0) || !(u > 0) || !(m > 0)) return NaN;
  return (e * a) / (u * m);
}

/**
 * @param {object} input
 * @param {string} input.room        id from ROOM_PROFILES
 * @param {string} input.mood        id from MOODS
 * @param {number} input.lengthM     room length
 * @param {number} input.widthM      room width
 * @param {string} input.target      "ambient" | "task"
 * @param {number} input.utilisation share of lamp lumens reaching the working plane
 * @param {number} input.maintenance dirt and depreciation allowance
 * @param {number} input.lumensPerFixture output of one lamp or fitting
 * @param {number} input.efficacy    lumens per watt of the chosen lamp
 * @returns {object} recommendation, or { error }
 */
export function recommendLighting({
  room = "living",
  mood = "neutral",
  lengthM,
  widthM,
  target = "ambient",
  utilisation = DEFAULT_UTILISATION,
  maintenance = DEFAULT_MAINTENANCE,
  lumensPerFixture = 800,
  efficacy = DEFAULT_EFFICACY_LM_W,
}) {
  const profile = ROOM_PROFILES.find((entry) => entry.id === room);
  const feel = MOODS.find((entry) => entry.id === mood);
  if (!profile) return { error: "Choose a room." };
  if (!feel) return { error: "Choose a mood." };
  if (target !== "ambient" && target !== "task") {
    return { error: "Choose whether you are lighting the whole room or a task area." };
  }

  const L = Number(lengthM);
  const W = Number(widthM);
  const u = Number(utilisation);
  const m = Number(maintenance);
  const perFixture = Number(lumensPerFixture);
  const lmPerW = Number(efficacy);

  if (![L, W, u, m, perFixture, lmPerW].every((v) => Number.isFinite(v))) {
    return { error: "Enter valid numbers for the room size, factors and lamp output." };
  }
  if (L <= 0 || W <= 0) return { error: "Room length and width must be greater than zero." };
  if (L > 200 || W > 200) return { error: "Room dimensions are limited to 200 m." };
  if (u <= 0 || u > 1) return { error: "Utilisation factor must be between 0 and 1." };
  if (m <= 0 || m > 1) return { error: "Maintenance factor must be between 0 and 1." };
  if (perFixture <= 0 || perFixture > 200000) {
    return { error: "Lumens per fitting must be between 0 and 200,000." };
  }
  if (lmPerW < 10 || lmPerW > 250) {
    return { error: "LED efficacy should be between 10 and 250 lumens per watt." };
  }

  const areaM2 = L * W;
  const midBand = (profile.cctMin + profile.cctMax) / 2;
  const recommendedCct = Math.round(Math.min(MAX_CCT, Math.max(MIN_CCT, midBand + feel.offsetK)) / 50) * 50;
  const bandLow = Math.min(MAX_CCT, Math.max(MIN_CCT, profile.cctMin + feel.offsetK));
  const bandHigh = Math.min(MAX_CCT, Math.max(MIN_CCT, profile.cctMax + feel.offsetK));

  const targetLux = target === "task" ? profile.taskLux : profile.ambientLux;
  const totalLumens = lumensFor({ lux: targetLux, areaM2, utilisation: u, maintenance: m });
  const fixtures = Math.ceil(totalLumens / perFixture);
  const watts = totalLumens / lmPerW;

  const swatch = kelvinToRgb(recommendedCct);
  const kruithofWarning =
    recommendedCct >= 4500 && targetLux <= 150
      ? "Cool light at a low level tends to read as gloomy and unnatural — either raise the light level or choose a warmer lamp."
      : recommendedCct <= 2400 && targetLux >= 500
        ? "Very warm light at a high level can look yellow and oppressive — 3000 K or above usually suits a brightly lit task area better."
        : "";

  return {
    roomLabel: profile.label,
    moodLabel: feel.label,
    recommendedCct,
    bandLow: Math.round(bandLow),
    bandHigh: Math.round(bandHigh),
    bandLabel: bandFor(recommendedCct),
    criMin: profile.criMin,
    note: profile.note,
    areaM2,
    areaSqft: areaM2 * SQFT_PER_M2,
    targetLux,
    targetLabel: target === "task" ? "task area" : "whole room",
    ambientLux: profile.ambientLux,
    taskLux: profile.taskLux,
    totalLumens,
    lumensPerM2: totalLumens / areaM2,
    fixtures,
    lumensPerFixture: perFixture,
    installedLumens: fixtures * perFixture,
    watts,
    wattsPerM2: watts / areaM2,
    utilisation: u,
    maintenance: m,
    efficacy: lmPerW,
    swatchHex: swatch.hex,
    swatchRgb: swatch,
    kruithofWarning,
  };
}

/** Colour swatches across the usable LED range, for a reference strip. */
export function cctScale(step = 500) {
  const scale = [];
  for (let k = MIN_CCT; k <= MAX_CCT; k += step) {
    scale.push({ kelvin: k, hex: kelvinToRgb(k).hex, band: bandFor(k) });
  }
  return scale;
}
