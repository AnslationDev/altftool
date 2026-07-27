/**
 * AMP for Email image sizing and weight budget.
 *
 * Hard rules this module encodes:
 *  - The AMP HTML part of an email must stay under 200 KB (Gmail's AMP for Email requirement).
 *  - Inline <style amp-custom> is capped at 75 KB.
 *  - <img> is not allowed; images use <amp-img> and MUST carry width, height and a layout.
 *  - Images referenced by URL do not count towards the 200 KB part, but a data: URI does, and
 *    base64 inflates the payload by 4/3 plus padding.
 *
 * File-weight figures are ESTIMATES built from bytes-per-pixel rates typical of photographic
 * content at the stated quality. Real encoders vary with noise, gradients and subject matter,
 * so treat the numbers as a planning budget and confirm against the exported file.
 */

/** Gmail's limit on the AMP HTML part of a message. */
export const AMP_PART_LIMIT_BYTES = 200 * 1024;

/** AMP's cap on the inline <style amp-custom> block. */
export const AMP_CUSTOM_CSS_LIMIT_BYTES = 75 * 1024;

/** The layout width almost every email template uses for its content column. */
export const DEFAULT_CONTENT_WIDTH = 600;

export const CONTENT_WIDTH_MIN = 200;
export const CONTENT_WIDTH_MAX = 1200;
export const DPR_MIN = 1;
export const DPR_MAX = 4;

/** amp-img layout values that are valid in AMP for Email, and what each one needs. */
export const LAYOUTS = [
  {
    value: "responsive",
    label: "responsive — scales to the column, keeps the ratio",
    needsSize: true,
    note: "width and height are read as an aspect ratio, not as pixels.",
  },
  {
    value: "fixed",
    label: "fixed — exact pixel box",
    needsSize: true,
    note: "renders at exactly the width and height you give.",
  },
  {
    value: "intrinsic",
    label: "intrinsic — scales down but never past its natural size",
    needsSize: true,
    note: "good for logos that must not be blown up.",
  },
  {
    value: "fill",
    label: "fill — fills the parent element",
    needsSize: false,
    note: "the parent must have its own width and height.",
  },
  {
    value: "flex-item",
    label: "flex-item — sized by a flex container",
    needsSize: false,
    note: "only meaningful inside a flex parent.",
  },
];

/**
 * Common placements in a 600 px email column.
 * widthShare is a fraction of the content width; fixedWidth overrides it when set.
 */
export const PLACEMENTS = [
  { id: "hero", label: "Full-width hero", widthShare: 1, aspectW: 16, aspectH: 9, layout: "responsive" },
  { id: "half", label: "Two-column card", widthShare: 0.48, aspectW: 4, aspectH: 3, layout: "responsive" },
  { id: "third", label: "Three-across product", widthShare: 0.31, aspectW: 1, aspectH: 1, layout: "responsive" },
  { id: "thumb", label: "Article thumbnail", fixedWidth: 150, aspectW: 1, aspectH: 1, layout: "fixed" },
  { id: "logo", label: "Header logo", fixedWidth: 180, aspectW: 4, aspectH: 1, layout: "intrinsic" },
  { id: "icon", label: "Inline icon", fixedWidth: 48, aspectW: 1, aspectH: 1, layout: "fixed" },
];

/**
 * Bytes per output pixel for photographic content at the stated setting.
 * Ranges are drawn from typical encoder behaviour; flat artwork compresses far better, which the
 * content multipliers below account for.
 */
export const FORMATS = [
  { id: "avif", label: "AVIF (quality ~50)", bytesPerPixel: 0.085, note: "Smallest, but decoder support in mail clients is inconsistent." },
  { id: "webp", label: "WebP (quality 75)", bytesPerPixel: 0.12, note: "Roughly 30% smaller than JPEG at similar quality." },
  { id: "jpeg75", label: "JPEG (quality 75)", bytesPerPixel: 0.17, note: "The safe default for photographs in email." },
  { id: "jpeg85", label: "JPEG (quality 85)", bytesPerPixel: 0.28, note: "Use when the image has fine detail or text." },
  { id: "png24", label: "PNG-24", bytesPerPixel: 2.2, note: "Lossless; only worth it for flat art or transparency." },
  { id: "gif", label: "GIF (256 colours)", bytesPerPixel: 0.4, note: "Per frame — multiply by the frame count for animation." },
];

/** How much smaller non-photographic artwork encodes, relative to a photograph. */
export const CONTENT_TYPES = [
  { id: "photo", label: "Photograph", multiplier: 1 },
  { id: "illustration", label: "Illustration or gradient", multiplier: 0.45 },
  { id: "flat", label: "Flat graphic, logo or UI screenshot", multiplier: 0.18 },
];

/** File extension each format setting exports to. */
export const FORMAT_EXTENSIONS = {
  avif: "avif",
  webp: "webp",
  jpeg75: "jpg",
  jpeg85: "jpg",
  png24: "png",
  gif: "gif",
};

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/** Size of a byte payload once base64-encoded: 4 characters for every 3 bytes, padded to 4. */
export function base64Size(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return 0;
  return Math.ceil(bytes / 3) * 4;
}

/** Human-readable byte size. */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${round(bytes / 1024, 1)} KB`;
  return `${round(bytes / (1024 * 1024), 2)} MB`;
}

/**
 * Plan one amp-img.
 * @returns metrics object, or { error } when the request cannot be sized.
 */
export function planAmpImage(options = {}) {
  const {
    contentWidth = DEFAULT_CONTENT_WIDTH,
    placementId = "hero",
    aspectW = 16,
    aspectH = 9,
    dpr = 2,
    formatId = "jpeg75",
    contentTypeId = "photo",
    layout = "",
    imageCount = 1,
    inlineAsDataUri = false,
    htmlBytes = 24 * 1024,
    cssBytes = 12 * 1024,
  } = options;

  const nums = { contentWidth, aspectW, aspectH, dpr, imageCount, htmlBytes, cssBytes };
  for (const [key, value] of Object.entries(nums)) {
    if (!Number.isFinite(Number(value))) return { error: `Enter a valid number for ${key}.` };
  }

  const cw = Number(contentWidth);
  if (cw < CONTENT_WIDTH_MIN || cw > CONTENT_WIDTH_MAX) {
    return { error: `Email content width should be between ${CONTENT_WIDTH_MIN} and ${CONTENT_WIDTH_MAX} pixels.` };
  }

  const aw = Number(aspectW);
  const ah = Number(aspectH);
  if (!(aw > 0) || !(ah > 0)) {
    return { error: "Both sides of the aspect ratio must be greater than zero." };
  }
  if (aw / ah > 20 || ah / aw > 20) {
    return { error: "That aspect ratio is more extreme than 20:1 — check the two numbers." };
  }

  const ratio = Number(dpr);
  if (ratio < DPR_MIN || ratio > DPR_MAX) {
    return { error: `Pixel density should be between ${DPR_MIN}x and ${DPR_MAX}x.` };
  }

  const count = Math.round(Number(imageCount));
  if (count < 1 || count > 60) {
    return { error: "Image count should be between 1 and 60." };
  }

  const html = Number(htmlBytes);
  const css = Number(cssBytes);
  if (html < 0 || css < 0) return { error: "Markup and CSS sizes cannot be negative." };

  const placement = PLACEMENTS.find((item) => item.id === placementId) || PLACEMENTS[0];
  const format = FORMATS.find((item) => item.id === formatId) || FORMATS[2];
  const contentType = CONTENT_TYPES.find((item) => item.id === contentTypeId) || CONTENT_TYPES[0];
  const chosenLayout = LAYOUTS.find((item) => item.value === layout) ||
    LAYOUTS.find((item) => item.value === placement.layout) ||
    LAYOUTS[0];

  const displayWidth = placement.fixedWidth
    ? Math.min(placement.fixedWidth, cw)
    : Math.round(cw * placement.widthShare);
  if (!(displayWidth >= 1)) {
    return { error: "That placement leaves no room inside the content width." };
  }
  const displayHeight = Math.round((displayWidth * ah) / aw);

  const sourceWidth = Math.round(displayWidth * ratio);
  const sourceHeight = Math.round((sourceWidth * ah) / aw);
  const pixels = sourceWidth * sourceHeight;

  const perFormat = FORMATS.map((item) => {
    const bytes = pixels * item.bytesPerPixel * contentType.multiplier;
    return {
      id: item.id,
      label: item.label,
      note: item.note,
      bytes: Math.round(bytes),
      base64Bytes: base64Size(Math.round(bytes)),
      chosen: item.id === format.id,
    };
  });

  const imageBytes = Math.round(pixels * format.bytesPerPixel * contentType.multiplier);
  const totalImageBytes = imageBytes * count;
  const inlineBytes = inlineAsDataUri ? base64Size(totalImageBytes) : 0;
  const ampPartBytes = html + css + inlineBytes;
  const partShare = ampPartBytes / AMP_PART_LIMIT_BYTES;

  // amp-img markup. responsive treats width/height as a ratio, so the source ratio is used there.
  const markupWidth = chosenLayout.value === "responsive" ? aw : displayWidth;
  const markupHeight = chosenLayout.value === "responsive" ? ah : displayHeight;
  const sizeAttrs = chosenLayout.needsSize
    ? ` width="${markupWidth}" height="${markupHeight}"`
    : "";
  const extension = FORMAT_EXTENSIONS[format.id] || "jpg";
  const markup =
    `<amp-img src="https://cdn.example.com/${placement.id}@${ratio}x.${extension}"` +
    `${sizeAttrs} layout="${chosenLayout.value}" alt="Describe the image for screen readers"></amp-img>`;

  const warnings = [];
  if (css > AMP_CUSTOM_CSS_LIMIT_BYTES) {
    warnings.push(
      `Inline CSS is ${formatBytes(css)}, over the ${formatBytes(AMP_CUSTOM_CSS_LIMIT_BYTES)} <style amp-custom> limit. AMP will reject the document.`,
    );
  }
  if (ampPartBytes > AMP_PART_LIMIT_BYTES) {
    warnings.push(
      `The AMP part comes to ${formatBytes(ampPartBytes)}, over the ${formatBytes(AMP_PART_LIMIT_BYTES)} limit. Gmail will fall back to the HTML part.`,
    );
  }
  if (inlineAsDataUri) {
    warnings.push(
      `Base64 inlining adds about ${formatBytes(inlineBytes - totalImageBytes)} of encoding overhead and counts against the 200 KB part. Host the images and reference them by HTTPS URL instead.`,
    );
  }
  if (!chosenLayout.needsSize) {
    warnings.push(
      `layout="${chosenLayout.value}" takes its size from the parent element, so give that parent an explicit width and height or the image will collapse.`,
    );
  }
  if (ratio > 2) {
    warnings.push(
      `A ${ratio}x source is ${round((ratio * ratio) / 4, 2)} times the pixel count of a 2x source for a difference most readers cannot see on an email. 2x is the usual ceiling.`,
    );
  }
  if (format.id === "avif" || format.id === "webp") {
    warnings.push(
      `${format.label} is not decoded everywhere. Serve it through a content-negotiating CDN, or fall back to JPEG for the HTML part of the message.`,
    );
  }
  if (format.id === "png24" && contentType.id === "photo") {
    warnings.push(
      "PNG-24 stores photographs losslessly and is roughly ten times the size of a quality-75 JPEG. Use PNG only for flat artwork or where you need transparency.",
    );
  }
  if (totalImageBytes > 1024 * 1024) {
    warnings.push(
      `${count} images at this size come to ${formatBytes(totalImageBytes)}. Long emails on mobile data will render with holes while they download.`,
    );
  }

  return {
    placement: placement.label,
    layout: chosenLayout.value,
    layoutNote: chosenLayout.note,
    contentWidth: cw,
    displayWidth,
    displayHeight,
    sourceWidth,
    sourceHeight,
    dpr: ratio,
    pixels,
    aspect: `${aw}:${ah}`,
    aspectDecimal: round(aw / ah, 3),
    format: format.label,
    contentType: contentType.label,
    imageBytes,
    imageCount: count,
    totalImageBytes,
    perFormat,
    inlineAsDataUri: Boolean(inlineAsDataUri),
    inlineBytes,
    htmlBytes: html,
    cssBytes: css,
    ampPartBytes,
    ampPartLimit: AMP_PART_LIMIT_BYTES,
    ampPartShare: round(partShare, 4),
    ampPartRemaining: Math.max(0, AMP_PART_LIMIT_BYTES - ampPartBytes),
    withinBudget: ampPartBytes <= AMP_PART_LIMIT_BYTES && css <= AMP_CUSTOM_CSS_LIMIT_BYTES,
    markup,
    warnings,
  };
}

/** Plain-text summary for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [
    "AMP for Email image plan",
    `Placement: ${result.placement} (layout="${result.layout}")`,
    `Displayed at ${result.displayWidth} x ${result.displayHeight} CSS px in a ${result.contentWidth} px column`,
    `Export the source at ${result.sourceWidth} x ${result.sourceHeight} px for ${result.dpr}x screens`,
    `${result.format}, ${result.contentType.toLowerCase()}: about ${formatBytes(result.imageBytes)} each`,
    `${result.imageCount} image(s) total: about ${formatBytes(result.totalImageBytes)}`,
    `AMP part: ${formatBytes(result.ampPartBytes)} of ${formatBytes(result.ampPartLimit)} used`,
    "",
    result.markup,
  ];
  if (result.warnings.length > 0) {
    lines.push("");
    for (const warning of result.warnings) lines.push(`- ${warning}`);
  }
  return lines.join("\n");
}
