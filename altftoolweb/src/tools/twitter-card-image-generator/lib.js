/**
 * X (Twitter) card sizing, validation and meta-tag generation.
 *
 * Figures come from X's published Cards documentation: the summary card takes
 * a 1:1 image of at least 144x144, the summary_large_image card takes a 2:1
 * image of at least 300x157, both cap at 4096x4096 and under 5 MB, and the
 * text fields truncate at 70 characters (title) and 200 (description).
 */

/** Maximum image file size X accepts for a card image. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Largest edge X accepts on a card image. */
export const MAX_IMAGE_EDGE = 4096;

/** Text limits published for the card meta tags. */
export const TEXT_LIMITS = {
  title: 70,
  description: 200,
  imageAlt: 420,
};

/** The two card types that still render a preview on X. */
export const CARD_TYPES = [
  {
    id: "summary",
    name: "Summary card",
    metaValue: "summary",
    ratio: 1,
    ratioLabel: "1:1",
    recommended: { w: 800, h: 800 },
    min: { w: 144, h: 144 },
    note: "Square thumbnail beside the title and description.",
  },
  {
    id: "summary_large_image",
    name: "Summary card with large image",
    metaValue: "summary_large_image",
    ratio: 2,
    ratioLabel: "2:1",
    recommended: { w: 1200, h: 600 },
    min: { w: 300, h: 157 },
    note: "Full-width image above the title and description.",
  },
];

/** Formats X accepts for card images. Animated GIFs render as a still frame. */
export const SUPPORTED_FORMATS = ["JPG", "PNG", "WEBP", "GIF"];

/**
 * Aspect ratio tolerance, as a fraction of the target ratio. Set to 5% so the
 * two sizes the platform itself publishes for the large card both pass: the
 * exact 2:1 (1200x600) and the widely used 1200x628 (1.911:1), which is also
 * X's stated 300x157 minimum. Anything further out gets cropped visibly.
 */
export const RATIO_TOLERANCE = 0.05;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Look up a card type by id. */
export function findCardType(id) {
  return CARD_TYPES.find((type) => type.id === id) || null;
}

/** Truncate to a limit and report whether X would cut the text. */
export function checkTextField(value, limit) {
  const text = typeof value === "string" ? value : "";
  const length = [...text].length;
  if (!isNum(limit) || limit <= 0) {
    return { text, length, limit: 0, overBy: 0, truncated: text, isOver: false };
  }
  const isOver = length > limit;
  return {
    text,
    length,
    limit,
    overBy: isOver ? length - limit : 0,
    truncated: isOver ? `${[...text].slice(0, limit - 1).join("")}…` : text,
    isOver,
  };
}

/**
 * Check an image against the card spec.
 *
 * @param {object} input
 * @param {number} input.width  image width in pixels
 * @param {number} input.height image height in pixels
 * @param {number} input.bytes  file size in bytes (0 if unknown)
 * @param {string} input.typeId card type id
 */
export function validateCardImage({ width, height, bytes = 0, typeId } = {}) {
  const type = findCardType(typeId);
  if (!type) return { error: "Choose a summary or large-image card." };
  if (![width, height, bytes].every(isNum)) {
    return { error: "Enter a number for width, height and file size." };
  }
  if (width <= 0 || height <= 0) {
    return { error: "Image width and height must be greater than zero." };
  }
  if (bytes < 0) return { error: "File size cannot be negative." };

  const ratio = width / height;
  const ratioOff = Math.abs(ratio - type.ratio) / type.ratio;
  const problems = [];

  if (width < type.min.w || height < type.min.h) {
    problems.push(
      `Below the minimum of ${type.min.w} x ${type.min.h} px for a ${type.name.toLowerCase()} — X will not render a preview.`,
    );
  }
  if (width > MAX_IMAGE_EDGE || height > MAX_IMAGE_EDGE) {
    problems.push(`Larger than the ${MAX_IMAGE_EDGE} px maximum on either edge.`);
  }
  if (ratioOff > RATIO_TOLERANCE) {
    problems.push(
      `Aspect ratio is ${ratio.toFixed(3)}:1 but this card expects ${type.ratioLabel} — X will crop or letterbox it.`,
    );
  }
  if (bytes > MAX_IMAGE_BYTES) {
    problems.push(`File is over the 5 MB limit X accepts.`);
  }

  return {
    type,
    width,
    height,
    ratio,
    ratioOffPct: ratioOff * 100,
    bytes,
    megapixels: (width * height) / 1e6,
    problems,
    ok: problems.length === 0,
    recommended: type.recommended,
    scaleToRecommended: type.recommended.w / width,
  };
}

/** Escape a string for safe use inside an HTML attribute value. */
export function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Normalise an @handle: strip a leading @, keep it empty if blank. */
export function normaliseHandle(raw) {
  const text = String(raw ?? "").trim();
  if (!text) return "";
  const stripped = text.replace(/^@+/, "");
  return stripped ? `@${stripped}` : "";
}

/**
 * Build the twitter:* meta tags (plus the Open Graph fallbacks X reads when a
 * twitter:* tag is missing).
 *
 * @returns {{ tags: Array<{property: string, content: string}>, html: string }}
 */
export function buildMetaTags({
  typeId,
  title = "",
  description = "",
  imageUrl = "",
  imageAlt = "",
  site = "",
  creator = "",
} = {}) {
  const type = findCardType(typeId);
  if (!type) return { error: "Choose a summary or large-image card." };

  const titleField = checkTextField(title, TEXT_LIMITS.title);
  const descField = checkTextField(description, TEXT_LIMITS.description);
  const altField = checkTextField(imageAlt, TEXT_LIMITS.imageAlt);

  // twitter:* tags are addressed with name=, Open Graph tags with property=.
  const rows = [
    { attr: "name", property: "twitter:card", content: type.metaValue },
    { attr: "name", property: "twitter:title", content: titleField.truncated },
    { attr: "name", property: "twitter:description", content: descField.truncated },
  ];
  if (imageUrl) rows.push({ attr: "name", property: "twitter:image", content: imageUrl });
  if (altField.truncated) {
    rows.push({ attr: "name", property: "twitter:image:alt", content: altField.truncated });
  }
  const siteHandle = normaliseHandle(site);
  if (siteHandle) rows.push({ attr: "name", property: "twitter:site", content: siteHandle });
  const creatorHandle = normaliseHandle(creator);
  if (creatorHandle) {
    rows.push({ attr: "name", property: "twitter:creator", content: creatorHandle });
  }

  rows.push({ attr: "property", property: "og:title", content: titleField.truncated });
  rows.push({ attr: "property", property: "og:description", content: descField.truncated });
  if (imageUrl) rows.push({ attr: "property", property: "og:image", content: imageUrl });

  const html = rows
    .map(
      (row) =>
        `<meta ${row.attr}="${escapeAttribute(row.property)}" content="${escapeAttribute(row.content)}" />`,
    )
    .join("\n");

  return { tags: rows, html, titleField, descField, altField, type };
}

/**
 * Greedy word wrap driven by a caller-supplied measuring function, so this
 * stays pure and testable while the component supplies canvas measureText.
 *
 * @param {string} text
 * @param {number} maxWidth
 * @param {(line: string) => number} measure
 * @param {number} maxLines lines to keep; the last one gets an ellipsis
 */
export function wrapText(text, maxWidth, measure, maxLines = 4) {
  const words = String(text ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (typeof measure !== "function" || !isNum(maxWidth) || maxWidth <= 0) {
    return [words.join(" ")];
  }

  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate) <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  if (isNum(maxLines) && maxLines > 0 && lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S*$/, "")}…`;
    return kept;
  }
  return lines;
}

/**
 * Type scale and padding for the generated card, expressed as fractions of the
 * canvas width so the same recipe works at 800x800 and at 1200x600.
 */
export const LAYOUT_RATIOS = {
  padding: 0.065,
  accentBar: 0.012,
  titleSize: 0.062,
  titleLineHeight: 1.22,
  bodySize: 0.032,
  bodyLineHeight: 1.4,
  handleSize: 0.026,
};

/**
 * Pixel geometry for drawing a card of a given canvas size.
 * Pure: no canvas or DOM involved, just numbers a renderer can use.
 */
export function cardLayout(width, height) {
  if (!isNum(width) || !isNum(height) || width <= 0 || height <= 0) {
    return { error: "Canvas width and height must be greater than zero." };
  }
  const pad = width * LAYOUT_RATIOS.padding;
  const titleSize = width * LAYOUT_RATIOS.titleSize;
  const bodySize = width * LAYOUT_RATIOS.bodySize;
  const handleSize = width * LAYOUT_RATIOS.handleSize;
  return {
    width,
    height,
    pad,
    accentBarHeight: width * LAYOUT_RATIOS.accentBar,
    contentWidth: width - pad * 2,
    titleSize,
    titleLine: titleSize * LAYOUT_RATIOS.titleLineHeight,
    bodySize,
    bodyLine: bodySize * LAYOUT_RATIOS.bodyLineHeight,
    handleSize,
    titleTop: pad + titleSize,
    handleBaseline: height - pad,
    maxTitleLines: height >= width ? 4 : 3,
    maxBodyLines: height >= width ? 4 : 2,
  };
}

/**
 * Three 0-255 channel values to a hex colour string, for feeding a colour
 * input. Values are clamped and rounded, so it never produces junk.
 */
export function rgbToHex(r, g, b) {
  const channel = (value) => {
    const n = Math.round(Number(value));
    const clamped = Number.isFinite(n) ? Math.min(255, Math.max(0, n)) : 0;
    return clamped.toString(16).padStart(2, "0");
  };
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/** Human-readable byte size. */
export function formatBytes(bytes) {
  if (!isNum(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
