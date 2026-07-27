/**
 * Product photo prompt builder.
 *
 * Composes an image-generation prompt for an ecommerce product shot from surface,
 * camera angle, lighting and shot type, and computes the framing numbers for the
 * chosen marketplace: canvas size, aspect ratio, how many pixels the product should
 * occupy, and the margin left on each side.
 *
 * Pure module — no React, no DOM, no clock.
 */

/**
 * Amazon product image rules (Seller Central, "Product image requirements"):
 * the MAIN image must have a pure white background and the product should fill
 * 85% or more of the frame; images must be at least 1000 px on the longest side
 * for zoom to activate, and 1600 px or more is recommended.
 */
export const AMAZON_MAIN_COVERAGE_PCT = 85;
export const AMAZON_ZOOM_MIN_PX = 1000;
export const AMAZON_ZOOM_RECOMMENDED_PX = 1600;

/** Coverage below this reads as a lost product in a sea of background on any marketplace tile. */
export const MIN_SENSIBLE_COVERAGE_PCT = 50;
export const MAX_COVERAGE_PCT = 100;

export const PLATFORMS = [
  {
    id: "amazon-main",
    label: "Amazon — main image",
    // Square canvas; 2000 px comfortably clears Amazon's 1600 px zoom recommendation.
    width: 2000,
    height: 2000,
    defaultCoveragePct: AMAZON_MAIN_COVERAGE_PCT,
    requiresPureWhite: true, // Amazon main-image rule: pure white (RGB 255,255,255) background.
    forbidsProps: true, // Main image may show only the product being sold, no props or graphics.
    note: "Pure white background, product filling 85%+ of the frame, longest side 1000 px minimum for zoom (1600 px recommended).",
  },
  {
    id: "etsy",
    label: "Etsy listing",
    // Etsy recommends listing images at least 2000 px on the shortest side; thumbnails crop to 4:3.
    width: 3000,
    height: 2250,
    defaultCoveragePct: 70,
    requiresPureWhite: false,
    forbidsProps: false,
    note: "Shortest side at least 2000 px; search thumbnails crop to 4:3, so keep the product centred.",
  },
  {
    id: "shopify",
    label: "Shopify product page",
    // Shopify recommends square product images up to 2048 x 2048 for crisp zoom.
    width: 2048,
    height: 2048,
    defaultCoveragePct: 75,
    requiresPureWhite: false,
    forbidsProps: false,
    note: "Square 2048 x 2048 is Shopify's recommended size for zoomable product images.",
  },
  {
    id: "instagram-portrait",
    label: "Instagram feed — portrait 4:5",
    // Instagram renders portrait feed posts at 1080 x 1350 (4:5), the tallest feed format.
    width: 1080,
    height: 1350,
    defaultCoveragePct: 65,
    requiresPureWhite: false,
    forbidsProps: false,
    note: "1080 x 1350 (4:5) takes the most feed space Instagram allows for a photo post.",
  },
  {
    id: "instagram-square",
    label: "Instagram feed — square 1:1",
    width: 1080, // Instagram square feed posts render at 1080 x 1080.
    height: 1080,
    defaultCoveragePct: 65,
    requiresPureWhite: false,
    forbidsProps: false,
    note: "1080 x 1080; grid previews crop to this square, so keep the product inside it.",
  },
  {
    id: "instagram-story",
    label: "Instagram story / Reel cover 9:16",
    width: 1080, // Stories and Reels render full-screen at 1080 x 1920 (9:16).
    height: 1920,
    defaultCoveragePct: 55,
    requiresPureWhite: false,
    forbidsProps: false,
    note: "1080 x 1920 full-screen; keep the top and bottom ~250 px free of anything critical (UI overlays).",
  },
];

export const SHOT_TYPES = [
  {
    id: "packshot",
    label: "Clean packshot",
    phrase: "a clean studio packshot, product perfectly isolated, every edge sharp",
  },
  {
    id: "lifestyle",
    label: "Lifestyle / in-context",
    phrase: "a lifestyle shot with the product in believable use, shallow depth of field on the background",
  },
  {
    id: "detail",
    label: "Detail / macro",
    phrase: "a macro detail shot revealing material texture and construction quality",
  },
  {
    id: "scale",
    label: "Scale reference",
    phrase: "a scale shot beside an everyday object so the true size is obvious",
  },
  {
    id: "group",
    label: "Group / family",
    phrase: "a group shot of the product family arranged with even spacing on one plane",
  },
];

export const SURFACES = [
  { id: "white-sweep", label: "Seamless white sweep", phrase: "on a seamless pure white sweep with no visible horizon line", pureWhite: true },
  { id: "marble", label: "Marble slab", phrase: "on a honed white marble slab with subtle grey veining", pureWhite: false },
  { id: "wood", label: "Warm oak wood", phrase: "on a warm oiled oak surface with visible grain", pureWhite: false },
  { id: "concrete", label: "Cast concrete", phrase: "on a smooth cast-concrete surface, cool grey, slightly mottled", pureWhite: false },
  { id: "linen", label: "Linen cloth", phrase: "on softly rumpled natural linen fabric", pureWhite: false },
  { id: "black-acrylic", label: "Glossy black acrylic", phrase: "on glossy black acrylic with a soft mirror reflection under the product", pureWhite: false },
];

export const ANGLES = [
  { id: "eye-level", label: "Eye level (0°)", phrase: "shot at eye level, straight on, lens at product height" },
  { id: "high-45", label: "High three-quarter (45°)", phrase: "shot from a high three-quarter angle about 45 degrees above" },
  { id: "top-down", label: "Top-down flat lay (90°)", phrase: "shot directly overhead as a top-down flat lay" },
  { id: "low-hero", label: "Low hero angle", phrase: "shot from slightly below so the product looms like a hero" },
  { id: "three-quarter", label: "Three-quarter turn", phrase: "product rotated a three-quarter turn to show front and side faces together" },
];

export const LIGHTING = [
  { id: "softbox", label: "Big softbox", phrase: "lit by one large softbox, soft wraparound shadows, even highlights" },
  { id: "window", label: "Natural window light", phrase: "lit by diffused natural window light from the left, gentle falloff" },
  { id: "hard-sun", label: "Hard directional sun", phrase: "lit by hard directional sunlight casting one crisp defined shadow" },
  { id: "rim", label: "Backlit rim", phrase: "backlit with a bright rim outlining the silhouette, fill from the front" },
  { id: "gradient", label: "Studio gradient", phrase: "lit against a smooth studio gradient falling from light to dark behind the product" },
];

/** Negatives that stop image models producing an unusable product shot. */
export const BASE_NEGATIVES = [
  "warped or melted product shape",
  "extra floating objects",
  "garbled label text",
  "watermark",
  "human hands",
  "harsh blown-out highlights",
  "busy distracting background",
  "visible seam between surface and backdrop",
];

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const byId = (list, id) => list.find((item) => item.id === id) || null;
const toFinite = (value) => {
  const n = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

/** "1080 x 1350" -> "4:5" — reduce the canvas to its simplest integer aspect ratio. */
export function aspectRatio(width, height) {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * Framing numbers for a canvas and a target coverage.
 * The product's longest dimension should span coveragePct of the canvas's
 * SHORTER side (so the product always fits regardless of orientation);
 * the margin is what remains, split across both sides.
 */
export function computeFraming({ width, height, coveragePct }) {
  const w = toFinite(width);
  const h = toFinite(height);
  const cover = toFinite(coveragePct);

  if ([w, h, cover].some((n) => Number.isNaN(n))) {
    return { error: "Enter valid numbers for the canvas size and product coverage." };
  }
  if (w <= 0 || h <= 0) return { error: "Canvas dimensions must be greater than zero." };
  if (cover < MIN_SENSIBLE_COVERAGE_PCT || cover > MAX_COVERAGE_PCT) {
    return {
      error: `Product coverage must be between ${MIN_SENSIBLE_COVERAGE_PCT}% and ${MAX_COVERAGE_PCT}% of the frame.`,
    };
  }

  const shortSide = Math.min(w, h);
  const longSide = Math.max(w, h);
  const productPx = Math.round((cover / 100) * shortSide);
  const marginPx = Math.round((shortSide - productPx) / 2);

  return {
    width: w,
    height: h,
    aspect: aspectRatio(w, h),
    coveragePct: cover,
    productPx,
    marginPx,
    zoomReady: longSide >= AMAZON_ZOOM_MIN_PX,
    zoomRecommended: longSide >= AMAZON_ZOOM_RECOMMENDED_PX,
  };
}

/**
 * Compose the product-shot prompt plus negatives, framing numbers and warnings.
 * `product` is required; everything else falls back to sensible defaults.
 */
export function buildProductPrompt({
  product = "",
  material = "",
  platformId = "amazon-main",
  shotId = "packshot",
  surfaceId = "white-sweep",
  angleId = "high-45",
  lightingId = "softbox",
  props = "",
  coveragePct,
} = {}) {
  const item = clean(product);
  if (!item) {
    return { error: "Describe the product — the whole prompt is built around it." };
  }
  if (item.length > 200) {
    return { error: "Keep the product description under 200 characters; long lists confuse image models." };
  }

  const platform = byId(PLATFORMS, platformId) || PLATFORMS[0];
  const shot = byId(SHOT_TYPES, shotId) || SHOT_TYPES[0];
  const surface = byId(SURFACES, surfaceId) || SURFACES[0];
  const angle = byId(ANGLES, angleId) || ANGLES[0];
  const light = byId(LIGHTING, lightingId) || LIGHTING[0];

  const cover =
    coveragePct === undefined || coveragePct === null || String(coveragePct).trim() === ""
      ? platform.defaultCoveragePct
      : coveragePct;

  const framing = computeFraming({
    width: platform.width,
    height: platform.height,
    coveragePct: cover,
  });
  if (framing.error) return { error: framing.error };

  const materialText = clean(material);
  const propsText = clean(props);

  const parts = [
    `Professional ecommerce product photograph of ${item}`,
    materialText ? `made of ${materialText}` : "",
    shot.phrase,
    surface.phrase,
    angle.phrase,
    light.phrase,
    propsText && !platform.forbidsProps ? `styled with ${propsText}` : "",
    `product filling about ${framing.coveragePct}% of the frame, centred`,
    "true-to-life colour, high detail, commercial photography, 85mm lens look",
    `${framing.aspect} aspect ratio`,
  ].filter((part) => clean(part).length > 0);

  const prompt = parts.map(clean).join(", ");

  const negatives = new Set(BASE_NEGATIVES);
  if (platform.requiresPureWhite) negatives.add("coloured or grey background");
  if (shot.id === "packshot") negatives.add("props or clutter around the product");
  const negativePrompt = Array.from(negatives).join(", ");

  const warnings = [];
  if (platform.requiresPureWhite && !surface.pureWhite) {
    warnings.push(
      `${platform.label} requires a pure white (RGB 255,255,255) background — the ${surface.label.toLowerCase()} surface will get the listing image rejected. Use the seamless white sweep, or shoot this version as a secondary image.`
    );
  }
  if (platform.forbidsProps && propsText) {
    warnings.push(
      "Amazon's main image may show only the product being sold — props were left out of the prompt. Use props on secondary images instead."
    );
  }
  if (platform.id === "amazon-main" && framing.coveragePct < AMAZON_MAIN_COVERAGE_PCT) {
    warnings.push(
      `Amazon expects the product to fill at least ${AMAZON_MAIN_COVERAGE_PCT}% of the main image frame; ${framing.coveragePct}% is below that.`
    );
  }
  if (shot.id === "detail" && angle.id === "top-down") {
    warnings.push(
      "Macro detail shots read better at eye level or three-quarter angles — top-down flattens the texture you are trying to show."
    );
  }
  if (!framing.zoomRecommended) {
    warnings.push(
      `The ${framing.width} x ${framing.height} canvas is below the ${AMAZON_ZOOM_RECOMMENDED_PX} px longest side recommended for marketplace zoom — fine for social, upscale before listing it on Amazon.`
    );
  }
  warnings.push(
    "Image models invent label text. Generate the scene, then composite your real label or pack artwork over it in an editor."
  );

  return {
    prompt,
    negativePrompt,
    framing,
    platform: { id: platform.id, label: platform.label, note: platform.note },
    warnings,
  };
}
