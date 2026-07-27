/**
 * Thumbnail image prompt builder.
 *
 * Composes a high-contrast thumbnail prompt with a reserved text zone, and works
 * out the typography maths: given the smallest size the platform actually renders
 * the thumbnail at, how tall must the headline text be drawn on the canvas, and
 * how many characters fit in the text zone before it stops being readable.
 *
 * Pure module — no React, no DOM, no clock.
 */

/**
 * Smallest text that stays readable on a phone screen is commonly put at about
 * 11-12 px rendered cap height; we use 12 px as the floor.
 */
export const MIN_RENDERED_CAP_PX = 12;

/** Average glyph advance of a bold display face is roughly 0.6 x its cap height. */
export const CHAR_WIDTH_RATIO = 0.6;

/** Thumbnail copy that runs past two lines stops being scannable. */
export const MAX_TEXT_LINES = 2;

/** Reserve just over half the canvas width for text; the subject keeps the rest. */
export const TEXT_ZONE_FRACTION = 0.55;

/** Long-standing creator guidance: keep thumbnail copy to 3-5 words. */
export const MAX_RECOMMENDED_WORDS = 5;

/** YouTube uploads cap thumbnail files at 2 MB. */
export const YOUTUBE_MAX_FILE_MB = 2;

export const PLATFORMS = [
  {
    id: "youtube",
    label: "YouTube video",
    // YouTube's specified thumbnail size is 1280 x 720 (minimum width 640 px, 16:9).
    width: 1280,
    height: 720,
    // The suggested-videos rail and mobile list render thumbnails around 168 px wide.
    smallestRenderWidthPx: 168,
    overlayNote: "YouTube stamps the duration badge in the bottom-right corner — keep it clear.",
  },
  {
    id: "shorts",
    label: "YouTube Shorts / Reels cover",
    // Vertical full-screen format renders at 1080 x 1920 (9:16).
    width: 1080,
    height: 1920,
    // The Shorts shelf and profile grids show covers about 3-across on a 1080 px phone.
    smallestRenderWidthPx: 360,
    overlayNote: "The bottom quarter is covered by title, caption and action buttons in-feed.",
  },
  {
    id: "og",
    label: "Blog / link preview (Open Graph)",
    // The Open Graph de-facto standard card size is 1200 x 630 (1.91:1).
    width: 1200,
    height: 630,
    // Chat apps and feeds render link cards down to roughly 300 px wide.
    smallestRenderWidthPx: 300,
    overlayNote: "Some platforms round the card corners — keep key content off the extreme edges.",
  },
  {
    id: "podcast",
    label: "Podcast episode art",
    // Apple Podcasts and Spotify take square art; 3000 x 3000 is Apple's recommended size.
    width: 3000,
    height: 3000,
    // Episode lists render artwork at roughly 56-64 px; use 60 px as the working floor.
    smallestRenderWidthPx: 60,
    overlayNote: "At list size only a single bold shape survives — treat text as decoration.",
  },
];

export const SUBJECT_TREATMENTS = [
  { id: "face", label: "Expressive face close-up", phrase: "a close-up human face with an exaggerated {emotion} expression, eyes toward the camera, cut out with a thick outline" },
  { id: "object", label: "Hero object", phrase: "a single hero object shot large and centred in the subject zone, {emotion} mood, thick contrasting outline" },
  { id: "before-after", label: "Before / after split", phrase: "a split composition: dull 'before' on one side, vivid 'after' on the other, hard dividing line, {emotion} contrast" },
  { id: "vs", label: "Versus match-up", phrase: "two subjects facing off from opposite sides with a gap between them, {emotion} tension", },
  { id: "diagram", label: "Simplified diagram", phrase: "a bold simplified diagram with three thick arrows and oversized shapes, {emotion} clarity" },
];

export const EMOTIONS = [
  { id: "shock", label: "Shock / disbelief" },
  { id: "excitement", label: "Excitement" },
  { id: "curiosity", label: "Curiosity" },
  { id: "warning", label: "Warning / alarm" },
  { id: "calm", label: "Calm authority" },
];

export const BACKGROUNDS = [
  { id: "radial", label: "Radial burst", phrase: "a saturated radial burst background exploding from behind the subject" },
  { id: "split", label: "Two-tone split", phrase: "a hard two-tone split background in complementary colours" },
  { id: "blur", label: "Blurred scene", phrase: "a heavily blurred real-scene background so the subject pops" },
  { id: "dark", label: "Dark studio", phrase: "a near-black studio background with a rim light separating the subject" },
  { id: "gradient", label: "Vivid gradient", phrase: "a vivid diagonal gradient background with light grain" },
];

export const TEXT_POSITIONS = [
  { id: "left", label: "Left side", phrase: "the left" },
  { id: "right", label: "Right side", phrase: "the right" },
  { id: "top", label: "Top band", phrase: "the top" },
  { id: "bottom", label: "Bottom band", phrase: "the bottom" },
];

/** Negatives that keep a generated thumbnail usable as a base plate. */
export const BASE_NEGATIVES = [
  "any text, lettering, captions or numbers",
  "watermark",
  "cluttered background details",
  "washed-out low-contrast colours",
  "tiny distant subject",
  "photorealistic gore or shock imagery",
  "extra faces in the background",
];

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const byId = (list, id) => list.find((item) => item.id === id) || null;

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

/** Reduce a canvas to its simplest integer aspect ratio, e.g. 1280x720 -> "16:9". */
export function aspectRatio(width, height) {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * Typography maths for a platform.
 * scale            = smallestRenderWidth / canvasWidth
 * minCapHeightPx   = MIN_RENDERED_CAP_PX / scale (text drawn smaller than this on the
 *                    canvas renders below 12 px at the platform's smallest size).
 * charsPerLine     = text-zone width / average glyph width at that cap height.
 * maxHeadlineChars = charsPerLine x MAX_TEXT_LINES.
 */
export function computeTextSpecs(platform) {
  const scale = platform.smallestRenderWidthPx / platform.width;
  const minCapHeightPx = Math.ceil(MIN_RENDERED_CAP_PX / scale);
  const textZoneWidthPx = Math.floor(platform.width * TEXT_ZONE_FRACTION);
  const charsPerLine = Math.max(0, Math.floor(textZoneWidthPx / (CHAR_WIDTH_RATIO * minCapHeightPx)));
  const maxHeadlineChars = charsPerLine * MAX_TEXT_LINES;
  return {
    width: platform.width,
    height: platform.height,
    aspect: aspectRatio(platform.width, platform.height),
    smallestRenderWidthPx: platform.smallestRenderWidthPx,
    minCapHeightPx,
    minCapHeightPctOfHeight: Math.round((minCapHeightPx / platform.height) * 1000) / 10,
    textZoneWidthPx,
    charsPerLine,
    maxHeadlineChars,
  };
}

/**
 * Compose the thumbnail prompt, negatives, typography specs and warnings.
 * `subject` is required. `headline` is what the user plans to typeset over the
 * image afterwards — it is checked against the character budget, never put in
 * the prompt (image models garble text).
 */
export function buildThumbnailPrompt({
  subject = "",
  headline = "",
  platformId = "youtube",
  treatmentId = "face",
  emotionId = "curiosity",
  backgroundId = "radial",
  textPositionId = "left",
} = {}) {
  const topic = clean(subject);
  if (!topic) {
    return { error: "Describe the subject of the thumbnail — the composition is built around it." };
  }
  if (topic.length > 200) {
    return { error: "Keep the subject under 200 characters; long descriptions dilute the composition." };
  }

  const platform = byId(PLATFORMS, platformId) || PLATFORMS[0];
  const treatment = byId(SUBJECT_TREATMENTS, treatmentId) || SUBJECT_TREATMENTS[0];
  const emotion = byId(EMOTIONS, emotionId) || EMOTIONS[2];
  const background = byId(BACKGROUNDS, backgroundId) || BACKGROUNDS[0];
  const textPos = byId(TEXT_POSITIONS, textPositionId) || TEXT_POSITIONS[0];

  const specs = computeTextSpecs(platform);
  const text = clean(headline);
  const words = text ? text.split(" ").filter(Boolean) : [];
  const headlineChars = text.length;
  const headlineFits = headlineChars <= specs.maxHeadlineChars;

  const subjectPhrase = treatment.phrase.replace("{emotion}", emotion.label.toLowerCase());

  // The subject sits opposite the text zone so the two never fight.
  const OPPOSITE = { left: "the right", right: "the left", top: "the bottom", bottom: "the top" };

  const parts = [
    `High-contrast ${platform.label.toLowerCase()} thumbnail about ${topic}`,
    subjectPhrase,
    `subject placed toward ${OPPOSITE[textPos.id]} of the frame`,
    background.phrase,
    `a clean empty area on ${textPos.phrase} of the frame, flat and uncluttered, reserved for headline text to be added later`,
    "poster-grade colour grading, crisp edge lighting, extreme legibility at small sizes",
    `${specs.aspect} aspect ratio`,
  ];

  const prompt = parts.map(clean).join(", ");
  const negativePrompt = BASE_NEGATIVES.join(", ");

  const warnings = [];
  if (text && !headlineFits) {
    warnings.push(
      `"${text}" is ${headlineChars} characters, but at a legible size only about ${specs.maxHeadlineChars} characters fit in the text zone (${specs.charsPerLine} per line x ${MAX_TEXT_LINES} lines). Cut it down.`
    );
  }
  if (words.length > MAX_RECOMMENDED_WORDS) {
    warnings.push(
      `${words.length} words is past the ${MAX_RECOMMENDED_WORDS}-word ceiling that thumbnail copy scans at. Aim for 3-5 punchy words.`
    );
  }
  if (text && words.length === 0) {
    warnings.push("The headline is only whitespace — leave it empty or write real words.");
  }
  if (platform.id === "youtube" && textPos.id === "bottom") {
    warnings.push(
      "YouTube's duration badge covers the bottom-right corner; bottom-placed text risks being overlapped. Prefer left, right or top."
    );
  }
  if (platform.id === "shorts" && textPos.id === "bottom") {
    warnings.push(
      "In the Shorts feed the bottom quarter is covered by the title and action buttons — move the text zone up."
    );
  }
  warnings.push(
    `Draw the headline at a cap height of at least ${specs.minCapHeightPx} px on the ${specs.width} x ${specs.height} canvas — smaller than that renders below ${MIN_RENDERED_CAP_PX} px where this platform shows thumbnails at ${specs.smallestRenderWidthPx} px wide.`
  );
  warnings.push(
    "Image models garble lettering, so the prompt orders a text-free plate — typeset the headline yourself in an editor."
  );

  return {
    prompt,
    negativePrompt,
    specs,
    headline: text,
    headlineChars,
    headlineWords: words.length,
    headlineFits,
    platform: { id: platform.id, label: platform.label, overlayNote: platform.overlayNote },
    warnings,
  };
}
