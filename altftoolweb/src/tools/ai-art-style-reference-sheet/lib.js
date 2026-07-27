/**
 * AI Art Style Reference Sheet — style-phrase catalogue and prompt assembly.
 *
 * Pure module: no React, no DOM, no clocks.
 */

/**
 * OpenAI's CLIP text encoder, used by Stable Diffusion 1.x and 2.x, has a
 * context length of 77 tokens. Two of those are the start and end markers, so
 * 75 tokens of prompt text are actually read in a single chunk.
 */
export const CLIP_CONTEXT_TOKENS = 77;
export const CLIP_USABLE_TOKENS = 75;

/**
 * Attention-weight syntax used by AUTOMATIC1111 and ComfyUI is written as
 * (phrase:weight). Weights far outside this range tend to break the image.
 */
export const MIN_WEIGHT = 0.5;
export const MAX_WEIGHT = 2;

/**
 * The eight axes a style is actually made of. Naming one phrase from each axis
 * is what makes a look reproducible across prompts.
 */
export const STYLE_AXES = [
  {
    id: "medium",
    label: "Medium",
    hint: "What it is physically made of.",
    phrases: [
      "oil painting on canvas",
      "gouache illustration",
      "35mm film photograph",
      "charcoal sketch on toned paper",
      "3D render, physically based materials",
      "linocut print",
      "loose watercolour wash",
      "flat vector illustration",
      "clay stop-motion still",
      "ink and wash drawing",
    ],
  },
  {
    id: "lighting",
    label: "Lighting",
    hint: "The single biggest lever on mood.",
    phrases: [
      "golden hour backlight",
      "overcast, diffused light",
      "single hard key light, deep shadows",
      "rim lighting separating subject from background",
      "candlelit chiaroscuro",
      "neon signage glow",
      "large softbox, even studio light",
      "moonlight, cool blue cast",
      "dappled light through leaves",
      "volumetric shafts of light",
    ],
  },
  {
    id: "lens",
    label: "Lens and camera",
    hint: "Controls distortion and how much is in focus.",
    phrases: [
      "35mm, f/1.8, shallow depth of field",
      "85mm portrait lens, compressed features",
      "24mm wide angle, slight edge distortion",
      "macro, 1:1 magnification",
      "tilt-shift, miniature effect",
      "fisheye, heavy barrel distortion",
      "200mm telephoto, flattened background",
      "anamorphic lens, horizontal flare",
    ],
  },
  {
    id: "composition",
    label: "Composition",
    hint: "Where the subject sits and where the eye goes.",
    phrases: [
      "rule of thirds placement",
      "centred, symmetrical composition",
      "low angle, looking up at the subject",
      "overhead flat lay",
      "extreme close-up, subject fills the frame",
      "generous negative space, subject small in frame",
      "strong leading lines",
      "dutch angle",
      "over-the-shoulder framing",
    ],
  },
  {
    id: "colour",
    label: "Colour",
    hint: "Say the palette, not just 'colourful'.",
    phrases: [
      "muted earth palette",
      "high contrast orange and teal",
      "monochrome, single hue",
      "soft pastel palette",
      "desaturated, film-like colour",
      "vivid saturated primaries",
      "duotone, two ink colours",
      "limited three-colour palette",
    ],
  },
  {
    id: "era",
    label: "Era or movement",
    hint: "Anchors the whole look in a known visual language.",
    phrases: [
      "1970s editorial photography",
      "Art Nouveau linework",
      "Bauhaus geometry",
      "Ukiyo-e woodblock",
      "Dutch Golden Age still life",
      "1990s disposable camera snapshot",
      "mid-century modern poster",
      "Y2K chrome and gradients",
    ],
  },
  {
    id: "finish",
    label: "Surface and finish",
    hint: "The texture that stops it looking generic.",
    phrases: [
      "fine grain, visible halation",
      "clean edges, no texture",
      "heavy impasto brush texture",
      "risograph misregistration",
      "matte paper texture",
      "glossy specular highlights",
      "screen-print halftone dots",
    ],
  },
  {
    id: "mood",
    label: "Mood",
    hint: "One emotional word, not three.",
    phrases: [
      "quiet and contemplative",
      "tense, claustrophobic",
      "warm and nostalgic",
      "clinical, detached",
      "playful, high energy",
      "melancholy, overcast",
    ],
  },
];

/** Total axes — the denominator of the coverage score. */
export const TOTAL_AXES = STYLE_AXES.length;

/** Common negative-prompt lines that fix the usual failure modes. */
export const NEGATIVE_PRESETS = [
  "extra fingers, malformed hands",
  "text, watermark, signature",
  "oversaturated, HDR halo",
  "plastic skin, waxy shading",
  "lowres, jpeg artifacts",
  "blurry, out of focus",
  "cropped limbs, cut off at the edge",
];

/** Aspect ratios worth naming explicitly. */
export const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1 square" },
  { id: "3:2", label: "3:2 landscape" },
  { id: "2:3", label: "2:3 portrait" },
  { id: "16:9", label: "16:9 widescreen" },
  { id: "9:16", label: "9:16 vertical" },
  { id: "4:5", label: "4:5 social portrait" },
];

export function getAxis(axisId) {
  return STYLE_AXES.find((axis) => axis.id === axisId) || null;
}

/**
 * Approximate CLIP token count: one token per word-like run, plus one for each
 * comma separator. Real BPE splits long or rare words into several tokens, so
 * treat this as a floor, not an exact count.
 */
export function estimateClipTokens(text) {
  if (typeof text !== "string" || !text.trim()) return 0;
  const words = text.match(/[A-Za-z0-9']+/g) || [];
  const commas = (text.match(/,/g) || []).length;
  return words.length + commas;
}

/** Trim, drop empties, and remove case-insensitive duplicates in order. */
export function dedupePhrases(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const value = String(raw == null ? "" : raw).trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

/** Comma or newline separated free-text phrases. */
export function parsePhraseList(text) {
  if (typeof text !== "string") return [];
  return dedupePhrases(text.split(/[,\n]/));
}

/**
 * Coverage score: the share of the eight axes that have at least one phrase,
 * as a percentage from 0 to 100.
 */
export function coverageScore(selections) {
  if (!selections || typeof selections !== "object") return 0;
  const covered = STYLE_AXES.filter((axis) => {
    const list = selections[axis.id];
    return Array.isArray(list) && dedupePhrases(list).length > 0;
  }).length;
  if (TOTAL_AXES <= 0) return 0;
  return (covered / TOTAL_AXES) * 100;
}

/** Wrap a phrase in AUTOMATIC1111 attention syntax, e.g. (rim lighting:1.3). */
export function applyWeight(phrase, weight) {
  const text = String(phrase == null ? "" : phrase).trim();
  if (!text) return "";
  const w = Number(weight);
  if (!Number.isFinite(w) || w === 1) return text;
  const clamped = Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, w));
  return `(${text}:${clamped.toFixed(2).replace(/0$/, "")})`;
}

/**
 * Build the reference sheet.
 * @returns {object} { prompt, coverage, tokenEstimate, ... } or { error }
 */
export function buildStyleSheet({
  subject = "",
  selections = {},
  extraPhrases = "",
  emphasisAxis = "",
  emphasisWeight = 1,
  negatives = [],
  extraNegatives = "",
  aspect = "",
} = {}) {
  const subjectText = String(subject || "").trim();
  if (!subjectText) return { error: "Describe the subject in a few words." };

  const weight = Number(emphasisWeight);
  if (!Number.isFinite(weight)) return { error: "Emphasis weight must be a number." };
  if (weight < MIN_WEIGHT || weight > MAX_WEIGHT) {
    return {
      error: `Emphasis weight must be between ${MIN_WEIGHT.toFixed(1)} and ${MAX_WEIGHT.toFixed(1)}.`,
    };
  }

  const perAxis = STYLE_AXES.map((axis) => {
    const chosen = dedupePhrases(Array.isArray(selections[axis.id]) ? selections[axis.id] : []);
    const weighted =
      emphasisAxis === axis.id && weight !== 1 ? chosen.map((phrase) => applyWeight(phrase, weight)) : chosen;
    return { id: axis.id, label: axis.label, phrases: chosen, rendered: weighted };
  });

  const extras = parsePhraseList(extraPhrases);
  const styleParts = dedupePhrases([...perAxis.flatMap((axis) => axis.rendered), ...extras]);

  if (styleParts.length === 0) {
    return { error: "Pick at least one style phrase, or type your own." };
  }

  const aspectText = String(aspect || "").trim();
  const promptParts = [subjectText, ...styleParts];
  if (aspectText) promptParts.push(`aspect ratio ${aspectText}`);
  const prompt = promptParts.join(", ");

  const negativeList = dedupePhrases([
    ...(Array.isArray(negatives) ? negatives : []),
    ...parsePhraseList(extraNegatives),
  ]);
  const negativePrompt = negativeList.join(", ");

  const tokenEstimate = estimateClipTokens(prompt);
  const coverage = coverageScore(selections);
  const coveredAxes = perAxis.filter((axis) => axis.phrases.length > 0).map((axis) => axis.label);
  const missingAxes = perAxis.filter((axis) => axis.phrases.length === 0).map((axis) => axis.label);

  const sheet = [
    `Subject: ${subjectText}`,
    ...perAxis
      .filter((axis) => axis.rendered.length > 0)
      .map((axis) => `${axis.label}: ${axis.rendered.join(", ")}`),
    ...(extras.length > 0 ? [`Your own phrases: ${extras.join(", ")}`] : []),
    ...(aspectText ? [`Aspect ratio: ${aspectText}`] : []),
    "",
    `Prompt: ${prompt}`,
    ...(negativePrompt ? [`Negative prompt: ${negativePrompt}`] : []),
  ].join("\n");

  return {
    prompt,
    negativePrompt,
    sheet,
    perAxis,
    styleCount: styleParts.length,
    tokenEstimate,
    overTokenLimit: tokenEstimate > CLIP_USABLE_TOKENS,
    coverage,
    coveredAxes,
    missingAxes,
    negativeCount: negativeList.length,
  };
}
