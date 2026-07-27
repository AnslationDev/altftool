/**
 * Art style prompt explorer.
 *
 * A reference table of art movements with their documented hallmarks, plus a
 * deterministic prompt composer. Nothing here calls a model; it assembles text
 * and estimates how that text will be tokenised.
 *
 * Token budget: CLIP's text encoder — used by Stable Diffusion 1.x/2.x, SDXL and
 * several derivatives — has a context length of 77 tokens, of which 75 are
 * available for content once the start and end tokens are counted. Prompts past
 * that point are truncated or chunked, so the composer reports an estimate and
 * can emit a trimmed version that fits.
 */

export const CLIP_CONTEXT_TOKENS = 77;
export const CLIP_USABLE_TOKENS = CLIP_CONTEXT_TOKENS - 2; // start-of-text + end-of-text

/** Blending more than three movements reliably produces mush rather than a hybrid. */
export const MAX_MOVEMENTS = 3;

/** OpenAI's published English rules of thumb: ~4 characters per token, ~0.75 words per token. */
export const CHARS_PER_TOKEN = 4;
export const WORDS_PER_TOKEN = 0.75;

export const MOVEMENTS = [
  {
    id: "bauhaus",
    label: "Bauhaus",
    era: "1919–1933, Germany",
    hallmarks: [
      "primary geometry: circle, square, triangle",
      "function over ornament, flat unmodulated planes",
      "geometric sans-serif lettering as a design element",
    ],
    palette: "red, yellow and blue against black, white and grey",
    conflicts: ["art-nouveau", "baroque", "memphis"],
    avoid: ["ornament", "gradients", "drop shadows", "decorative flourish"],
  },
  {
    id: "ukiyo-e",
    label: "Ukiyo-e",
    era: "17th–19th century, Edo Japan",
    hallmarks: [
      "woodblock print: flat colour fields inside a bold keyblock outline",
      "asymmetric composition with a high, tilted horizon",
      "no cast shadows and no linear perspective",
    ],
    palette: "indigo, vermilion, ochre and pale ground",
    conflicts: ["baroque", "impressionism"],
    avoid: ["cast shadows", "photographic depth of field", "volumetric shading"],
  },
  {
    id: "art-nouveau",
    label: "Art Nouveau",
    era: "1890–1910, Europe",
    hallmarks: [
      "whiplash curves and continuous organic line",
      "botanical motifs: iris, lily, vine, peacock",
      "stained-glass panelling and decorative border framing",
    ],
    palette: "moss green, gold, plum and cream",
    conflicts: ["bauhaus", "minimalism", "brutalism", "swiss"],
    avoid: ["hard geometric grids", "flat corporate vector shapes"],
  },
  {
    id: "impressionism",
    label: "Impressionism",
    era: "1870s–1880s, France",
    hallmarks: [
      "broken colour: separate visible strokes read as one hue at distance",
      "painted outdoors, chasing a specific hour of light",
      "soft edges, no black in the shadows",
    ],
    palette: "high-key blues, violets and warm sunlit yellows",
    conflicts: ["ukiyo-e", "minimalism", "constructivism"],
    avoid: ["crisp outlines", "flat colour fill", "hard graphic edges"],
  },
  {
    id: "suprematism",
    label: "Suprematism",
    era: "1915–1920s, Russia",
    hallmarks: [
      "pure geometric forms floating in undefined white space",
      "diagonal tilt implying weightlessness",
      "no depiction of objects at all",
    ],
    palette: "black, red and a warm white ground",
    conflicts: ["baroque", "art-nouveau", "surrealism"],
    avoid: ["representational detail", "texture", "perspective"],
  },
  {
    id: "swiss",
    label: "Swiss / International Typographic",
    era: "1950s–1960s, Switzerland",
    hallmarks: [
      "strict modular grid with asymmetric balance",
      "neo-grotesque type, ranged left, generous white space",
      "photography treated as a flat rectangular element",
    ],
    palette: "black and white with one saturated accent",
    conflicts: ["art-nouveau", "memphis", "baroque"],
    avoid: ["centred layouts", "decorative type", "texture overlays"],
  },
  {
    id: "memphis",
    label: "Memphis",
    era: "1981–1987, Milan",
    hallmarks: [
      "squiggles, confetti and terrazzo speckle over solid ground",
      "clashing pastels next to hot primaries",
      "shapes stacked as if furniture, deliberately unstable",
    ],
    palette: "mint, hot pink, black squiggle, lemon and cobalt",
    conflicts: ["swiss", "minimalism", "bauhaus"],
    avoid: ["muted palettes", "symmetry", "realistic rendering"],
  },
  {
    id: "brutalism",
    label: "Brutalism",
    era: "1950s–1970s, international",
    hallmarks: [
      "raw board-marked concrete, monumental mass",
      "repeated modular units and deep recessed shadow",
      "structure left visible and unfinished",
    ],
    palette: "concrete grey, rust, moss and overcast sky",
    conflicts: ["art-nouveau", "memphis"],
    avoid: ["gloss finishes", "ornament", "pastel colour"],
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    era: "1980s onward",
    hallmarks: [
      "dense multilingual neon signage stacked up a street wall",
      "rain-slick reflective ground and volumetric haze",
      "low camera in a crowded canyon of buildings",
    ],
    palette: "teal and magenta neon against near-black",
    conflicts: ["minimalism", "suprematism"],
    avoid: ["daylight", "empty space", "pastel"],
  },
  {
    id: "baroque",
    label: "Baroque",
    era: "1600–1750, Europe",
    hallmarks: [
      "chiaroscuro: a single dramatic light against deep shadow",
      "diagonal composition full of movement",
      "rich fabric, gilt and theatrical gesture",
    ],
    palette: "umber, deep crimson, gold and lead white",
    conflicts: ["minimalism", "bauhaus", "suprematism", "swiss", "ukiyo-e"],
    avoid: ["flat lighting", "empty backgrounds", "graphic outlines"],
  },
  {
    id: "minimalism",
    label: "Minimalism",
    era: "1960s onward",
    hallmarks: [
      "one idea, one gesture, everything else removed",
      "large fields of negative space carrying the composition",
      "restrained palette and industrial finish",
    ],
    palette: "off-white, graphite and a single restrained accent",
    conflicts: ["baroque", "memphis", "cyberpunk", "art-nouveau", "impressionism"],
    avoid: ["clutter", "ornament", "busy texture", "multiple focal points"],
  },
  {
    id: "pop-art",
    label: "Pop Art",
    era: "1950s–1960s, UK and USA",
    hallmarks: [
      "Ben-Day dot halftone and heavy black outline",
      "commercial and mass-media subject matter",
      "flat spot colour, repeated as a grid of panels",
    ],
    palette: "primary red, yellow and blue with black line",
    conflicts: ["impressionism", "baroque"],
    avoid: ["subtle gradients", "painterly texture"],
  },
  {
    id: "surrealism",
    label: "Surrealism",
    era: "1920s–1940s",
    hallmarks: [
      "precise realistic rendering of an impossible juxtaposition",
      "dream logic: scale, gravity and material behave wrongly",
      "long empty horizon with a single uncanny object",
    ],
    palette: "sun-bleached sky blue, sand and long shadow",
    conflicts: ["suprematism", "swiss"],
    avoid: ["cartoon abstraction", "flat graphic treatment"],
  },
  {
    id: "constructivism",
    label: "Constructivism",
    era: "1920s, Soviet Russia",
    hallmarks: [
      "aggressive diagonals and dynamic asymmetry",
      "photomontage combined with heavy geometric blocks",
      "type set on a slant as a structural element",
    ],
    palette: "red, black and off-white paper",
    conflicts: ["impressionism", "art-nouveau"],
    avoid: ["soft gradients", "decorative curves", "pastel"],
  },
  {
    id: "mughal-miniature",
    label: "Mughal Miniature",
    era: "16th–18th century, South Asia",
    hallmarks: [
      "flattened multi-level perspective inside an ornamental border",
      "extremely fine brushwork, gold leaf highlights",
      "jewel-toned flat grounds with stylised flora",
    ],
    palette: "lapis blue, malachite green, vermilion and gold",
    conflicts: ["brutalism", "minimalism"],
    avoid: ["photographic depth of field", "loose brushwork"],
  },
  {
    id: "madhubani",
    label: "Madhubani",
    era: "Mithila region, Bihar, India",
    hallmarks: [
      "every gap filled with pattern — no empty background",
      "double-outlined figures with large almond eyes",
      "motifs from nature: fish, peacock, lotus, sun",
    ],
    palette: "earth pigments — ochre, indigo, lampblack and turmeric yellow",
    conflicts: ["minimalism", "swiss"],
    avoid: ["empty negative space", "realistic proportion", "perspective"],
  },
];

export const MEDIA = [
  { id: "oil", label: "Oil on canvas", phrase: "painted in oil on canvas with visible impasto and canvas weave" },
  { id: "gouache", label: "Gouache", phrase: "painted in gouache, matte opaque colour with soft edges" },
  { id: "watercolour", label: "Watercolour", phrase: "watercolour on cold-press paper, blooms and granulation visible" },
  { id: "ink", label: "Ink and brush", phrase: "brush and ink on paper, confident varied line weight" },
  { id: "linocut", label: "Linocut relief print", phrase: "linocut relief print, carved marks and slightly uneven inking" },
  { id: "riso", label: "Risograph", phrase: "two-colour risograph print with misregistration and paper grain" },
  { id: "screenprint", label: "Screen print", phrase: "screen printed flat spot colours with a slight halo of overlap" },
  { id: "charcoal", label: "Charcoal", phrase: "charcoal on toned paper, smudged mid-tones and lifted highlights" },
  { id: "pencil", label: "Pencil sketch", phrase: "graphite pencil study with construction lines left in" },
  { id: "vector", label: "Flat vector", phrase: "flat vector illustration, clean shapes and no gradients" },
  { id: "clay3d", label: "3D clay render", phrase: "soft 3D clay render, matte subsurface material, gentle ambient occlusion" },
  { id: "cel", label: "Cel animation", phrase: "hand-inked cel animation frame with flat paint fills" },
  { id: "collage", label: "Cut-paper collage", phrase: "cut-paper collage with torn edges and layered drop shadow" },
  { id: "airbrush", label: "Airbrush", phrase: "airbrushed illustration with smooth blends and crisp masked edges" },
  { id: "photo", label: "Photographic", phrase: "photographed on medium format film, shallow depth of field" },
];

export const LIGHTING = [
  { id: "north-window", label: "Soft north window", phrase: "soft directional north-window light" },
  { id: "hard-single", label: "Hard single source", phrase: "one hard light source casting a defined shadow" },
  { id: "rim", label: "Rim / backlight", phrase: "backlit with a bright rim separating subject from ground" },
  { id: "golden", label: "Golden hour", phrase: "low golden-hour sun with long warm shadows" },
  { id: "overcast", label: "Flat overcast", phrase: "flat even overcast light, minimal shadow" },
  { id: "chiaroscuro", label: "Chiaroscuro", phrase: "chiaroscuro: a single shaft of light against deep shadow" },
  { id: "neon", label: "Neon ambient", phrase: "coloured neon ambient light bouncing off wet surfaces" },
  { id: "studio", label: "Three-point studio", phrase: "three-point studio lighting, controlled falloff" },
  { id: "silhouette", label: "Silhouette", phrase: "subject reduced to a silhouette against a bright field" },
  { id: "none", label: "Let the style decide", phrase: "" },
];

export const COMPOSITIONS = [
  { id: "centered", label: "Centred and symmetrical", phrase: "centred symmetrical composition" },
  { id: "thirds", label: "Rule of thirds", phrase: "subject placed on a third, weight balanced across the frame" },
  { id: "closeup", label: "Extreme close-up", phrase: "extreme close-up, subject cropped by the frame" },
  { id: "wide", label: "Wide establishing", phrase: "wide establishing view with the subject small in the scene" },
  { id: "isometric", label: "Isometric", phrase: "isometric projection, no vanishing point" },
  { id: "flatlay", label: "Top-down flat lay", phrase: "top-down flat lay, objects arranged on a plane" },
  { id: "lowhorizon", label: "Low horizon", phrase: "low horizon line with a dominant sky" },
  { id: "diagonal", label: "Diagonal / dynamic", phrase: "strong diagonal composition full of movement" },
  { id: "negative", label: "Negative-space heavy", phrase: "large areas of empty space around a small subject" },
  { id: "none", label: "Let the style decide", phrase: "" },
];

export const COLOR_TREATMENTS = [
  { id: "movement", label: "Use the movement's palette", phrase: "" },
  { id: "mono", label: "Monochrome", phrase: "monochrome, one hue across the full value range" },
  { id: "duotone", label: "Duotone", phrase: "duotone: shadows in one hue, highlights in another" },
  { id: "complementary", label: "Complementary contrast", phrase: "complementary colour scheme, two hues opposite on the wheel" },
  { id: "analogous", label: "Analogous harmony", phrase: "analogous palette of three neighbouring hues" },
  { id: "triadic", label: "Triadic", phrase: "triadic palette, three hues evenly spaced around the wheel" },
  { id: "earth", label: "Muted earth", phrase: "desaturated earth palette, low chroma throughout" },
  { id: "highkey", label: "High-key pastel", phrase: "high-key pastel palette, everything light in value" },
  { id: "lowkey", label: "Low-key", phrase: "low-key palette, most of the frame in shadow" },
];

export const DETAIL_LEVELS = [
  { id: "sparse", label: "Sparse", phrase: "minimal detail, large simple shapes" },
  { id: "balanced", label: "Balanced", phrase: "" },
  { id: "dense", label: "Dense", phrase: "highly detailed, intricate ornament throughout" },
];

/** Negatives worth adding to almost any image prompt. */
export const BASE_NEGATIVES = ["watermark", "signature", "stock-photo caption", "distorted hands", "garbled text"];

const byId = (list, id) => list.find((item) => item.id === id) || null;

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

/** Conservative token estimate: the larger of the character rule and the word rule. */
export function estimateTokens(text) {
  const t = clean(text);
  if (!t) return 0;
  const words = t.split(" ").length;
  return Math.max(Math.ceil(t.length / CHARS_PER_TOKEN), Math.ceil(words / WORDS_PER_TOKEN));
}

/** Movement pairs that pull in opposite directions. */
export function detectConflicts(movementIds = []) {
  const chosen = movementIds.map((id) => byId(MOVEMENTS, id)).filter(Boolean);
  const pairs = [];
  for (let i = 0; i < chosen.length; i += 1) {
    for (let j = i + 1; j < chosen.length; j += 1) {
      const a = chosen[i];
      const b = chosen[j];
      if ((a.conflicts || []).includes(b.id) || (b.conflicts || []).includes(a.id)) {
        pairs.push({ a: a.label, b: b.label });
      }
    }
  }
  return pairs;
}

/**
 * Compose the prompt.
 * Segments carry a priority so a trimmed version can be built for CLIP's 75-token window:
 * 1 = never drop, 5 = drop first.
 */
export function buildStylePrompt({
  subject = "",
  movementIds = [],
  mediumId = "",
  lightingId = "none",
  compositionId = "none",
  colorId = "movement",
  detailId = "balanced",
  extraNotes = "",
} = {}) {
  const subj = clean(subject);
  if (!subj) {
    return { error: "Describe the subject first — a style with nothing to apply it to is just a mood board." };
  }
  if (subj.length > 400) {
    return { error: "Keep the subject under 400 characters; move the rest into the extra notes field." };
  }

  const chosen = movementIds.map((id) => byId(MOVEMENTS, id)).filter(Boolean);
  if (chosen.length === 0) {
    return { error: "Pick at least one art movement." };
  }

  const medium = byId(MEDIA, mediumId);
  const lighting = byId(LIGHTING, lightingId);
  const composition = byId(COMPOSITIONS, compositionId);
  const colour = byId(COLOR_TREATMENTS, colorId);
  const detail = byId(DETAIL_LEVELS, detailId);

  const styleNames =
    chosen.length === 1
      ? `in the style of ${chosen[0].label}`
      : `blending ${chosen.map((m) => m.label).join(" with ")}`;

  const hallmarkLine = chosen
    .map((m) => m.hallmarks[0])
    .join("; ");

  const paletteLine =
    colour && colour.id === "movement"
      ? chosen.map((m) => m.palette).join("; ")
      : colour
        ? colour.phrase
        : "";

  const segments = [
    { key: "subject", text: subj, priority: 1 },
    { key: "style", text: styleNames, priority: 1 },
    { key: "medium", text: medium ? medium.phrase : "", priority: 2 },
    { key: "palette", text: paletteLine, priority: 2 },
    { key: "lighting", text: lighting ? lighting.phrase : "", priority: 3 },
    { key: "composition", text: composition ? composition.phrase : "", priority: 3 },
    { key: "detail", text: detail ? detail.phrase : "", priority: 4 },
    { key: "hallmarks", text: hallmarkLine, priority: 4 },
    { key: "notes", text: clean(extraNotes), priority: 5 },
  ].filter((segment) => clean(segment.text).length > 0);

  const prompt = segments.map((s) => clean(s.text)).join(", ");

  // Greedy trim: priority-1 segments are never dropped, then add by priority
  // while the estimate still fits the CLIP window.
  const kept = segments.filter((s) => s.priority === 1);
  const ordered = segments
    .filter((s) => s.priority > 1)
    .sort((a, b) => a.priority - b.priority);
  ordered.forEach((segment) => {
    const candidate = [...kept, segment];
    const text = segments
      .filter((s) => candidate.includes(s))
      .map((s) => clean(s.text))
      .join(", ");
    if (estimateTokens(text) <= CLIP_USABLE_TOKENS) kept.push(segment);
  });
  const shortPrompt = segments
    .filter((s) => kept.includes(s))
    .map((s) => clean(s.text))
    .join(", ");

  const negativeSet = new Set(BASE_NEGATIVES);
  chosen.forEach((m) => (m.avoid || []).forEach((a) => negativeSet.add(a)));
  const negativePrompt = Array.from(negativeSet).join(", ");

  const conflicts = detectConflicts(movementIds);
  const tokens = estimateTokens(prompt);

  const warnings = [];
  if (chosen.length > MAX_MOVEMENTS) {
    warnings.push(
      `You have blended ${chosen.length} movements. Past ${MAX_MOVEMENTS} the model averages them into something generic — cut back to the two that matter.`
    );
  }
  conflicts.forEach((pair) => {
    warnings.push(
      `${pair.a} and ${pair.b} pull in opposite directions. Expect one to win; decide now which one that should be.`
    );
  });
  if (tokens > CLIP_USABLE_TOKENS) {
    warnings.push(
      `About ${tokens} tokens. CLIP-based models read only the first ${CLIP_USABLE_TOKENS}, so use the trimmed version below or move detail into the negative prompt.`
    );
  }

  return {
    prompt,
    shortPrompt,
    negativePrompt,
    tokens,
    shortTokens: estimateTokens(shortPrompt),
    withinClip: tokens <= CLIP_USABLE_TOKENS,
    droppedSegments: segments.filter((s) => !kept.includes(s)).map((s) => s.key),
    wordCount: prompt.split(" ").length,
    conflicts,
    warnings,
    movements: chosen.map((m) => ({
      id: m.id,
      label: m.label,
      era: m.era,
      hallmarks: m.hallmarks,
      palette: m.palette,
      avoid: m.avoid,
    })),
  };
}
