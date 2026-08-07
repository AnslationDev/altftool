/**
 * X (Twitter) card meta-tag parsing, validation and preview text.
 *
 * The rules below come from X's Cards documentation ("Cards markup reference"
 * and the summary / summary_large_image card pages):
 *
 *  - twitter:card is required and must be one of summary, summary_large_image,
 *    app or player.
 *  - twitter:title is truncated at 70 characters.
 *  - twitter:description is truncated at 200 characters.
 *  - Images must be under 5 MB and in JPG, PNG, WEBP or GIF (animated GIFs show
 *    only the first frame).
 *  - summary card image: minimum 144 x 144 px, maximum 4096 x 4096 px, cropped
 *    to a 1:1 square.
 *  - summary_large_image: minimum 300 x 157 px, maximum 4096 x 4096 px, cropped
 *    to a 2:1 ratio.
 *  - When a twitter:* tag is missing, X falls back to the matching Open Graph
 *    tag (og:title, og:description, og:image).
 */

/** Card types X accepts in twitter:card. */
export const CARD_TYPES = {
  summary: "Summary (small square thumbnail)",
  summary_large_image: "Summary with large image",
  app: "App card",
  player: "Player card",
};

/** X truncates the card title at this many characters. */
export const TITLE_MAX_CHARS = 70;

/** X truncates the card description at this many characters. */
export const DESCRIPTION_MAX_CHARS = 200;

/** Maximum image file size X will fetch for a card: 5 MB. */
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** Largest image edge X accepts. */
export const IMAGE_MAX_DIMENSION = 4096;

/** Smallest image for the small summary card (square). */
export const SUMMARY_MIN_DIMENSION = 144;

/** Smallest image for the large-image card. */
export const LARGE_IMAGE_MIN_WIDTH = 300;
export const LARGE_IMAGE_MIN_HEIGHT = 157;

/** Target aspect ratios: 1:1 for summary, 2:1 for summary_large_image. */
export const SUMMARY_ASPECT = 1;
export const LARGE_IMAGE_ASPECT = 2;

/**
 * How far the aspect ratio may drift before the crop starts cutting content
 * noticeably. 0.2 covers the common 1.91:1 Open Graph image on a 2:1 card.
 */
export const ASPECT_TOLERANCE = 0.2;

/** Image formats X will render on a card. */
export const SUPPORTED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"];

const decodeEntities = (text) =>
  String(text)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

/**
 * Pull meta tags out of an HTML string without a DOM.
 * Handles name= and property=, either attribute order, single or double quotes.
 * @returns {Record<string,string>} lower-cased key -> content
 */
export function parseMetaTags(html) {
  const tags = {};
  const source = String(html ?? "");
  const metaPattern = /<meta\b[^>]*>/gi;
  const matches = source.match(metaPattern) || [];

  for (const tag of matches) {
    const keyMatch = tag.match(/(?:name|property|itemprop)\s*=\s*["']([^"']+)["']/i);
    const contentMatch = tag.match(/content\s*=\s*["']([^"']*)["']/i);
    if (!keyMatch || !contentMatch) continue;
    tags[keyMatch[1].trim().toLowerCase()] = decodeEntities(contentMatch[1].trim());
  }

  const titleMatch = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) tags["<title>"] = decodeEntities(titleMatch[1].trim());

  return tags;
}

/**
 * Resolve the fields X will actually use, applying the documented Open Graph
 * fallbacks, and record where each value came from.
 */
export function resolveCardFields(tags) {
  const get = (...keys) => {
    for (const key of keys) {
      const value = tags?.[key];
      if (typeof value === "string" && value !== "") return { value, source: key };
    }
    return { value: "", source: null };
  };

  return {
    card: get("twitter:card"),
    title: get("twitter:title", "og:title", "<title>"),
    description: get("twitter:description", "og:description", "description"),
    image: get("twitter:image", "twitter:image:src", "og:image"),
    imageAlt: get("twitter:image:alt", "og:image:alt"),
    site: get("twitter:site"),
    creator: get("twitter:creator"),
    url: get("og:url", "twitter:url"),
  };
}

/** Truncate the way X does: cut at the limit and add a single ellipsis. */
export function truncate(text, limit) {
  const value = String(text ?? "");
  if (value.length <= limit) return value;
  return `${value.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

/** Image file extension from a URL, lower-cased, ignoring query strings. */
export function imageExtension(url) {
  const clean = String(url ?? "").split(/[?#]/)[0];
  const match = clean.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
}

/**
 * Validate a card and describe how it will render.
 *
 * @param {object} input
 * @param {string} input.card         twitter:card value
 * @param {string} input.title
 * @param {string} input.description
 * @param {string} [input.imageUrl]
 * @param {number} [input.imageWidth]   pixels, when known
 * @param {number} [input.imageHeight]  pixels, when known
 * @param {number} [input.imageBytes]   file size, when known
 * @returns {object} validation result, or { error } when there is nothing to check.
 */
export function validateCard({
  card = "",
  title = "",
  description = "",
  imageUrl = "",
  imageWidth = 0,
  imageHeight = 0,
  imageBytes = 0,
}) {
  const cardType = String(card || "").trim().toLowerCase();
  const titleText = String(title || "");
  const descriptionText = String(description || "");
  const image = String(imageUrl || "").trim();

  if (cardType === "" && titleText === "" && descriptionText === "" && image === "") {
    return { error: "No card data found — paste a page's HTML head or fill the fields in." };
  }

  const issues = [];
  const add = (level, field, message) => issues.push({ level, field, message });

  if (cardType === "") {
    add("error", "twitter:card", "twitter:card is missing. Without it X will not build a card.");
  } else if (!CARD_TYPES[cardType]) {
    add(
      "error",
      "twitter:card",
      `"${cardType}" is not a card type. Use summary, summary_large_image, app or player.`,
    );
  }

  if (titleText.trim() === "") {
    add("error", "twitter:title", "A title is required — X falls back to og:title, then <title>.");
  } else if (titleText.length > TITLE_MAX_CHARS) {
    add(
      "warning",
      "twitter:title",
      `Title is ${titleText.length} characters and will be cut at ${TITLE_MAX_CHARS}.`,
    );
  }

  if (descriptionText.trim() === "") {
    add("warning", "twitter:description", "No description — the card will show only a title.");
  } else if (descriptionText.length > DESCRIPTION_MAX_CHARS) {
    add(
      "warning",
      "twitter:description",
      `Description is ${descriptionText.length} characters and will be cut at ${DESCRIPTION_MAX_CHARS}.`,
    );
  }

  const wantsImage = cardType === "summary" || cardType === "summary_large_image" || cardType === "";
  if (wantsImage && image === "") {
    add("warning", "twitter:image", "No image — the card will render as text only.");
  }

  if (image !== "") {
    if (!/^https:\/\//i.test(image)) {
      add("error", "twitter:image", "The image URL must be absolute and served over HTTPS.");
    }
    const ext = imageExtension(image);
    if (ext && !SUPPORTED_IMAGE_FORMATS.includes(ext)) {
      add(
        "warning",
        "twitter:image",
        `.${ext} is not a supported card image format (JPG, PNG, WEBP or GIF).`,
      );
    }
  }

  const width = Number(imageWidth) || 0;
  const height = Number(imageHeight) || 0;
  let aspect = 0;
  if (width > 0 && height > 0) {
    aspect = width / height;
    if (width > IMAGE_MAX_DIMENSION || height > IMAGE_MAX_DIMENSION) {
      add(
        "error",
        "twitter:image",
        `Image is ${width}x${height}px; the maximum is ${IMAGE_MAX_DIMENSION}px on each side.`,
      );
    }
    if (cardType === "summary_large_image") {
      if (width < LARGE_IMAGE_MIN_WIDTH || height < LARGE_IMAGE_MIN_HEIGHT) {
        add(
          "error",
          "twitter:image",
          `A large-image card needs at least ${LARGE_IMAGE_MIN_WIDTH}x${LARGE_IMAGE_MIN_HEIGHT}px; this is ${width}x${height}px.`,
        );
      }
      if (Math.abs(aspect - LARGE_IMAGE_ASPECT) > ASPECT_TOLERANCE) {
        add(
          "warning",
          "twitter:image",
          `Aspect ratio is ${aspect.toFixed(2)}:1 but the card crops to 2:1, so parts will be cut off.`,
        );
      }
    } else if (cardType === "summary") {
      if (width < SUMMARY_MIN_DIMENSION || height < SUMMARY_MIN_DIMENSION) {
        add(
          "error",
          "twitter:image",
          `A summary card needs at least ${SUMMARY_MIN_DIMENSION}x${SUMMARY_MIN_DIMENSION}px; this is ${width}x${height}px.`,
        );
      }
      if (Math.abs(aspect - SUMMARY_ASPECT) > ASPECT_TOLERANCE) {
        add(
          "warning",
          "twitter:image",
          `Aspect ratio is ${aspect.toFixed(2)}:1 but the summary thumbnail crops to a square.`,
        );
      }
    }
  }

  const bytes = Number(imageBytes) || 0;
  if (bytes > IMAGE_MAX_BYTES) {
    add(
      "error",
      "twitter:image",
      `Image is ${(bytes / (1024 * 1024)).toFixed(1)} MB; the limit is 5 MB.`,
    );
  }

  const errorCount = issues.filter((i) => i.level === "error").length;
  const warningCount = issues.length - errorCount;

  return {
    cardType: CARD_TYPES[cardType] ? cardType : "",
    cardTypeLabel: CARD_TYPES[cardType] || "Unknown",
    displayTitle: truncate(titleText, TITLE_MAX_CHARS),
    displayDescription: truncate(descriptionText, DESCRIPTION_MAX_CHARS),
    titleLength: titleText.length,
    descriptionLength: descriptionText.length,
    titleRemaining: TITLE_MAX_CHARS - titleText.length,
    descriptionRemaining: DESCRIPTION_MAX_CHARS - descriptionText.length,
    imageUrl: image,
    imageAspect: aspect > 0 ? Math.round(aspect * 100) / 100 : 0,
    issues,
    errorCount,
    warningCount,
    valid: errorCount === 0,
  };
}

/**
 * Return the image URL only when it is safe to drop into a CSS url() value:
 * https only, and free of quotes, brackets, backslashes and whitespace that
 * could break out of the declaration. Anything else returns "".
 */
export function safeImageCssUrl(url) {
  const value = String(url ?? "").trim();
  return /^https:\/\/[^\s"'()\\<>]+$/.test(value) ? value : "";
}

/** Reference markup for the card, ready to paste into <head>. */
export function buildMetaMarkup({ card, title, description, imageUrl, site, creator, imageAlt, url }) {
  const escape = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const rows = [
    ["twitter:card", card],
    ["twitter:site", site],
    ["twitter:creator", creator],
    ["twitter:title", title],
    ["twitter:description", description],
    ["twitter:image", imageUrl],
    ["twitter:image:alt", imageAlt],
  ].filter(([, value]) => String(value ?? "").trim() !== "");

  const og = [
    ["og:title", title],
    ["og:description", description],
    ["og:image", imageUrl],
    ["og:url", url],
  ].filter(([, value]) => String(value ?? "").trim() !== "");

  return [
    ...rows.map(([name, value]) => `<meta name="${name}" content="${escape(value)}" />`),
    ...og.map(([property, value]) => `<meta property="${property}" content="${escape(value)}" />`),
  ].join("\n");
}
