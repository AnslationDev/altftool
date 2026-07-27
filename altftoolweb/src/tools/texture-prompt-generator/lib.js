/**
 * Texture Prompt Generator — deterministic prompt assembly for texture / material
 * generation in AI image models (Midjourney, Stable Diffusion, DALL-E, Firefly)
 * and PBR-material generators.
 *
 * The prompt grammar follows the widely used "subject, material qualities,
 * lighting, camera/framing, output constraints" ordering that diffusion models
 * parse most reliably: earlier tokens carry more weight in CLIP-style text
 * encoders, so the material itself always comes first.
 */

/** Common base materials. Free-text entry is also allowed in the UI. */
export const MATERIAL_PRESETS = [
  "weathered oak wood",
  "brushed stainless steel",
  "rough cast concrete",
  "polished carrara marble",
  "hand-woven linen fabric",
  "cracked desert clay",
  "hammered copper",
  "black slate stone",
  "aged tan leather",
  "frosted glass",
];

/** Surface finish vocabulary — standard material-science / 3D-art terms. */
export const FINISH_OPTIONS = [
  { id: "matte", label: "Matte (diffuse, no highlights)" },
  { id: "satin", label: "Satin (soft sheen)" },
  { id: "glossy", label: "Glossy (sharp specular highlights)" },
  { id: "rough", label: "Rough (high micro-surface detail)" },
  { id: "polished", label: "Polished (mirror-like)" },
  { id: "brushed", label: "Brushed (directional micro-scratches)" },
];

/**
 * Physical scale of the captured patch. Stating a real-world dimension is the
 * most reliable way to control feature size in texture prompts.
 */
export const SCALE_OPTIONS = [
  { id: "macro", label: "Macro close-up (~2 cm patch)", phrase: "extreme macro close-up of a 2 cm surface patch" },
  { id: "close", label: "Close-up (~10 cm patch)", phrase: "close-up of a 10 cm surface patch" },
  { id: "medium", label: "Medium (~50 cm patch)", phrase: "flat view of a 50 cm surface area" },
  { id: "wide", label: "Wide (~2 m panel)", phrase: "straight-on view of a 2 m wide surface panel" },
];

/** Lighting setups that read well for material capture. */
export const LIGHTING_OPTIONS = [
  { id: "studio", label: "Even studio softbox", phrase: "even diffused studio softbox lighting, no harsh shadows" },
  { id: "raking", label: "Raking side light (shows relief)", phrase: "low-angle raking side light emphasising surface relief and bump detail" },
  { id: "overcast", label: "Neutral overcast daylight", phrase: "neutral overcast daylight, soft ambient occlusion" },
  { id: "warm", label: "Warm golden-hour", phrase: "warm golden-hour sunlight at a shallow angle" },
];

/** Wear / age states. */
export const WEAR_OPTIONS = [
  { id: "pristine", label: "Pristine / new", phrase: "pristine factory-new condition" },
  { id: "light", label: "Lightly used", phrase: "light wear, faint scuffs and fingerprints" },
  { id: "weathered", label: "Weathered", phrase: "weathered by sun and rain, faded patches and stains" },
  { id: "heavy", label: "Heavily aged", phrase: "heavily aged, deep cracks, chips, grime in crevices and patina" },
];

/** Output targets — each appends the constraints that matter for that use. */
export const TARGET_OPTIONS = [
  {
    id: "seamless",
    label: "Seamless tileable texture",
    phrase:
      "seamless tileable texture, perfectly repeating pattern, top-down orthographic view, uniform lighting, no vignette, no border",
  },
  {
    id: "pbr",
    label: "PBR material reference",
    phrase:
      "PBR material reference capture, top-down orthographic view, flat even lighting suitable for albedo extraction, high dynamic range detail",
  },
  {
    id: "hero",
    label: "Hero / beauty render",
    phrase: "hero product-photography style render, shallow depth of field on the surface detail",
  },
  {
    id: "reference",
    label: "Plain photo reference",
    phrase: "photorealistic reference photograph, sharp focus across the frame",
  },
];

/**
 * Standard negative prompt for texture work: the recurring failure modes of
 * diffusion models on material shots are text/watermarks, unwanted objects,
 * blur, and visible seams on tiles.
 */
export const BASE_NEGATIVE = [
  "text",
  "watermark",
  "logo",
  "people",
  "hands",
  "objects on surface",
  "blurry",
  "low resolution",
  "jpeg artifacts",
  "distorted perspective",
];

/** Extra negatives that only matter when the target must tile. */
export const SEAMLESS_NEGATIVE = ["visible seams", "vignette", "uneven lighting", "border", "frame"];

const findById = (options, id) => options.find((o) => o.id === id) || null;

/**
 * Build the texture prompt.
 * @param {object} input
 * @param {string} input.material     Base material description (required).
 * @param {string} input.finishId    One of FINISH_OPTIONS ids.
 * @param {string} input.scaleId     One of SCALE_OPTIONS ids.
 * @param {string} input.lightingId  One of LIGHTING_OPTIONS ids.
 * @param {string} input.wearId      One of WEAR_OPTIONS ids.
 * @param {string} input.targetId    One of TARGET_OPTIONS ids.
 * @param {string} [input.colors]    Optional colour palette notes.
 * @param {string} [input.details]   Optional extra surface details.
 * @returns {{prompt:string, negativePrompt:string, wordCount:number}|{error:string}}
 */
export function buildTexturePrompt({
  material,
  finishId,
  scaleId,
  lightingId,
  wearId,
  targetId,
  colors = "",
  details = "",
}) {
  const mat = typeof material === "string" ? material.trim() : "";
  if (!mat) return { error: "Describe the base material (for example, weathered oak wood)." };
  if (mat.length > 200) return { error: "Keep the material description under 200 characters." };

  const finish = findById(FINISH_OPTIONS, finishId);
  const scale = findById(SCALE_OPTIONS, scaleId);
  const lighting = findById(LIGHTING_OPTIONS, lightingId);
  const wear = findById(WEAR_OPTIONS, wearId);
  const target = findById(TARGET_OPTIONS, targetId);
  if (!finish || !scale || !lighting || !wear || !target) {
    return { error: "Choose a finish, scale, lighting, wear level and output target from the lists." };
  }

  const finishWord = finish.id === "matte" ? "matte" : finish.label.split(" (")[0].toLowerCase();

  const parts = [
    `${scale.phrase} of ${mat}`,
    `${finishWord} surface finish`,
    wear.phrase,
  ];
  const colorNote = colors.trim();
  if (colorNote) parts.push(`colour palette: ${colorNote}`);
  const detailNote = details.trim();
  if (detailNote) parts.push(detailNote);
  parts.push(lighting.phrase);
  parts.push(target.phrase);
  parts.push("highly detailed, 8k, photorealistic material study");

  const negatives = target.id === "seamless" ? [...BASE_NEGATIVE, ...SEAMLESS_NEGATIVE] : [...BASE_NEGATIVE];

  const prompt = parts.join(", ");
  return {
    prompt,
    negativePrompt: negatives.join(", "),
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
  };
}
