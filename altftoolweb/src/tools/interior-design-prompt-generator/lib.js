/**
 * Interior design prompt generator.
 *
 * Composes an image-generation prompt for a room from room type, design style,
 * palette, budget feel and time of day — and computes real planning numbers from
 * the room's dimensions: floor area, the ambient light the room needs in lumens
 * (from published residential illuminance guidance), a rug size that respects the
 * exposed-floor border rule, and the main walkway clearance.
 *
 * Pure module — no React, no DOM, no clock.
 */

/**
 * Ambient illuminance targets in lux by room type. Values follow widely published
 * residential guidance derived from IES recommendations and EN 12464-1 practice:
 * circulation/bedroom ~100 lux, living/dining ~150 lux, bathroom ~200 lux,
 * kitchen and home-office task areas ~300 lux.
 */
export const ROOM_TYPES = [
  { id: "living", label: "Living room", lux: 150, phrase: "a living room" },
  { id: "bedroom", label: "Bedroom", lux: 100, phrase: "a bedroom" },
  { id: "kitchen", label: "Kitchen", lux: 300, phrase: "a kitchen" },
  { id: "dining", label: "Dining room", lux: 150, phrase: "a dining room" },
  { id: "office", label: "Home office", lux: 300, phrase: "a home office" },
  { id: "bathroom", label: "Bathroom", lux: 200, phrase: "a bathroom" },
  { id: "kids", label: "Kids' room", lux: 150, phrase: "a children's bedroom" },
  { id: "balcony", label: "Balcony / sunroom", lux: 100, phrase: "an enclosed balcony sunroom" },
];

/**
 * Standard interior-design rug rule: leave 45-60 cm (18-24 in) of exposed floor
 * between the rug edge and the walls. We use the middle of that band.
 */
export const RUG_FLOOR_BORDER_M = 0.5;

/** Minimum rug side worth buying; below ~1.2 m a "room rug" reads as a door mat. */
export const MIN_RUG_SIDE_M = 1.2;

/** Accessibility and space-planning convention: a main circulation path needs ~90 cm. */
export const MAIN_WALKWAY_M = 0.9;

/** Typical residential ceiling height used as the reference for scale phrases. */
export const STANDARD_CEILING_M = 2.4;
/** Above this a room reads as double-height / loft scale in a prompt. */
export const TALL_CEILING_M = 3.2;

/** Sanity bounds — a residential room outside these is almost certainly a typo. */
export const MIN_ROOM_SIDE_M = 1;
export const MAX_ROOM_SIDE_M = 30;
export const MIN_CEILING_M = 2;
export const MAX_CEILING_M = 8;

export const DESIGN_STYLES = [
  { id: "japandi", label: "Japandi", phrase: "Japandi style, low natural-wood furniture, muted tones, visible craftsmanship, calm negative space" },
  { id: "scandinavian", label: "Scandinavian", phrase: "Scandinavian style, pale woods, white walls, soft wool textiles, functional simplicity" },
  { id: "midcentury", label: "Mid-century modern", phrase: "mid-century modern style, teak and walnut furniture, tapered legs, one statement lounge chair" },
  { id: "industrial", label: "Industrial", phrase: "industrial style, exposed brick, black steel frames, concrete floor, Edison-bulb fixtures" },
  { id: "bohemian", label: "Bohemian", phrase: "bohemian style, layered rugs, rattan, trailing plants, collected global textiles" },
  { id: "minimalist", label: "Minimalist", phrase: "strict minimalist style, hidden storage, bare surfaces, precise lines, almost empty" },
  { id: "traditional-indian", label: "Modern Indian", phrase: "modern Indian style, carved sheesham wood accents, brass details, jaali screen pattern, handloom textiles" },
  { id: "coastal", label: "Coastal", phrase: "coastal style, whitewashed wood, linen slipcovers, sea-glass tones, airy and bright" },
  { id: "artdeco", label: "Art Deco", phrase: "Art Deco style, geometric inlays, velvet upholstery, fluted panels, polished brass" },
];

export const PALETTES = [
  { id: "warm-neutral", label: "Warm neutrals", phrase: "a warm neutral palette of cream, oat and terracotta" },
  { id: "cool-neutral", label: "Cool neutrals", phrase: "a cool neutral palette of white, grey and charcoal" },
  { id: "earth", label: "Earth tones", phrase: "an earth-tone palette of olive, ochre and clay" },
  { id: "monochrome-green", label: "Deep green", phrase: "a tonal palette built around deep forest green with brass accents" },
  { id: "blue-white", label: "Blue and white", phrase: "a crisp blue and white palette with navy accents" },
  { id: "jewel", label: "Jewel tones", phrase: "a jewel-tone palette of emerald, sapphire and plum against dark walls" },
  { id: "pastel", label: "Soft pastels", phrase: "a soft pastel palette of blush, sage and powder blue" },
];

export const BUDGET_FEELS = [
  {
    id: "budget",
    label: "Smart budget",
    phrase: "furnished on a smart budget: flat-pack furniture styled well, cotton dhurrie rug, paper lantern pendant, gallery wall of framed prints",
  },
  {
    id: "mid",
    label: "Mid-range",
    phrase: "mid-range furnishing: solid-wood pieces mixed with high-street finds, wool rug, ceramic table lamps, a few original artworks",
  },
  {
    id: "premium",
    label: "Premium",
    phrase: "premium furnishing: designer sofa, hand-knotted rug, sculptural floor lamp, custom built-in joinery",
  },
  {
    id: "luxury",
    label: "Luxury",
    phrase: "luxury furnishing: bespoke furniture, book-matched stone, silk rug, statement chandelier, museum-grade art",
  },
];

export const TIMES_OF_DAY = [
  { id: "morning", label: "Soft morning light", phrase: "soft diffused morning light through sheer curtains" },
  { id: "midday", label: "Bright midday", phrase: "bright midday sun casting clean window shadows on the floor" },
  { id: "golden", label: "Golden hour", phrase: "warm golden-hour light raking across the room" },
  { id: "evening", label: "Cosy evening", phrase: "cosy evening scene lit by layered warm lamps, dusk blue outside the window" },
];

/** Negatives that keep interior renders usable. */
export const BASE_NEGATIVES = [
  "warped furniture geometry",
  "melted or floating objects",
  "impossible room layout",
  "fisheye distortion",
  "oversaturated HDR look",
  "watermark",
  "text or captions",
  "people",
];

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const byId = (list, id) => list.find((item) => item.id === id) || null;
const round = (value, dp = 1) => {
  const f = Math.pow(10, dp);
  return Math.round(value * f) / f;
};
const toFinite = (value) => {
  const n = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
};

/**
 * Planning numbers for the room.
 * lumens = area (m2) x lux target — the definition of lux is lumens per m2.
 * Rug: room side minus the exposed-floor border on both sides, never below MIN_RUG_SIDE_M.
 */
export function computeRoomSpecs({ lengthM, widthM, ceilingM, lux } = {}) {
  const length = toFinite(lengthM);
  const width = toFinite(widthM);
  const ceiling = toFinite(ceilingM);
  const luxTarget = toFinite(lux);

  if ([length, width, ceiling, luxTarget].some((n) => Number.isNaN(n))) {
    return { error: "Enter valid numbers for the room's length, width and ceiling height." };
  }
  if (length < MIN_ROOM_SIDE_M || width < MIN_ROOM_SIDE_M) {
    return { error: `Room sides must be at least ${MIN_ROOM_SIDE_M} m.` };
  }
  if (length > MAX_ROOM_SIDE_M || width > MAX_ROOM_SIDE_M) {
    return { error: `Room sides above ${MAX_ROOM_SIDE_M} m are outside residential scale — check the number.` };
  }
  if (ceiling < MIN_CEILING_M || ceiling > MAX_CEILING_M) {
    return { error: `Ceiling height must be between ${MIN_CEILING_M} m and ${MAX_CEILING_M} m.` };
  }
  if (luxTarget <= 0) {
    return { error: "Choose a room type so an illuminance target can be applied." };
  }

  const areaM2 = round(length * width, 1);
  const lumens = Math.round(areaM2 * luxTarget);

  const rugLength = round(Math.max(MIN_RUG_SIDE_M, length - 2 * RUG_FLOOR_BORDER_M), 1);
  const rugWidth = round(Math.max(MIN_RUG_SIDE_M, width - 2 * RUG_FLOOR_BORDER_M), 1);
  const rugFits = length - 2 * RUG_FLOOR_BORDER_M >= MIN_RUG_SIDE_M && width - 2 * RUG_FLOOR_BORDER_M >= MIN_RUG_SIDE_M;

  return {
    lengthM: length,
    widthM: width,
    ceilingM: ceiling,
    areaM2,
    luxTarget,
    lumens,
    rugLengthM: rugLength,
    rugWidthM: rugWidth,
    rugFits,
    walkwayM: MAIN_WALKWAY_M,
    tallCeiling: ceiling >= TALL_CEILING_M,
    lowCeiling: ceiling < STANDARD_CEILING_M,
  };
}

/**
 * Compose the interior prompt plus negatives, planning specs and advice.
 */
export function buildInteriorPrompt({
  roomId = "living",
  styleId = "japandi",
  paletteId = "warm-neutral",
  budgetId = "mid",
  timeId = "morning",
  lengthM = 4.5,
  widthM = 3.6,
  ceilingM = 2.7,
  mustHave = "",
} = {}) {
  const room = byId(ROOM_TYPES, roomId) || ROOM_TYPES[0];
  const style = byId(DESIGN_STYLES, styleId) || DESIGN_STYLES[0];
  const palette = byId(PALETTES, paletteId) || PALETTES[0];
  const budget = byId(BUDGET_FEELS, budgetId) || BUDGET_FEELS[1];
  const time = byId(TIMES_OF_DAY, timeId) || TIMES_OF_DAY[0];

  const specs = computeRoomSpecs({ lengthM, widthM, ceilingM, lux: room.lux });
  if (specs.error) return { error: specs.error };

  const wants = clean(mustHave);
  if (wants.length > 200) {
    return { error: "Keep the must-have list under 200 characters; long lists confuse image models." };
  }

  const scalePhrase = specs.tallCeiling
    ? "double-height ceiling with tall windows"
    : specs.lowCeiling
      ? "a low snug ceiling"
      : "standard ceiling height";

  const parts = [
    `Interior design photograph of ${room.phrase}, about ${specs.areaM2} square metres`,
    scalePhrase,
    style.phrase,
    palette.phrase,
    budget.phrase,
    wants ? `featuring ${wants}` : "",
    time.phrase,
    "wide-angle interior shot at chest height, straight verticals, photorealistic, magazine editorial quality",
  ].filter((part) => clean(part).length > 0);

  const prompt = parts.map(clean).join(", ");
  const negativePrompt = BASE_NEGATIVES.join(", ");

  const advice = [
    `Ambient light: aim for about ${specs.lumens.toLocaleString("en-US")} lumens total (${specs.luxTarget} lux across ${specs.areaM2} m²) — split across ceiling, wall and lamp layers rather than one fixture.`,
    specs.rugFits
      ? `Rug: about ${specs.rugLengthM} m x ${specs.rugWidthM} m leaves the standard ${RUG_FLOOR_BORDER_M * 100} cm of exposed floor on each side.`
      : "Rug: the room is too small for a bordered area rug — use a small accent rug or none at all.",
    `Circulation: keep the main walkway at least ${MAIN_WALKWAY_M * 100} cm clear between furniture pieces.`,
  ];

  return {
    prompt,
    negativePrompt,
    specs,
    advice,
    room: { id: room.id, label: room.label, lux: room.lux },
  };
}
