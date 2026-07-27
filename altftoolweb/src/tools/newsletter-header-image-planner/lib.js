/**
 * Email header image planner.
 *
 * Email is not the web: the body table is a fixed pixel width, images are often
 * scaled down on phones without any responsive CSS applying, and several clients
 * repaint the message in dark mode. This module turns those constraints into
 * concrete export dimensions, a minimum in-image text size and a weight budget.
 */

/** The long-standing safe body width for HTML email; 640 is the common alternative. */
export const DEFAULT_EMAIL_WIDTH = 600;
export const MIN_EMAIL_WIDTH = 320;
export const MAX_EMAIL_WIDTH = 800;

/** Export multiplier for high-density screens. 2x covers current phones and laptops. */
export const DEFAULT_RETINA = 2;

/** Smallest phone viewport worth designing for, and the padding usually applied around the body. */
export const DEFAULT_MOBILE_VIEWPORT = 375;
export const DEFAULT_MOBILE_PADDING = 20;

/** Text rendered inside an image should not fall below this on screen. */
export const MIN_READABLE_PX = 14;

/** Default weight budget for a single header image, in kilobytes. */
export const DEFAULT_MAX_KB = 200;

/**
 * Gmail clips a message once the HTML source passes about 102 KB, showing a
 * "View entire message" link. Image bytes do not count toward that figure.
 */
export const GMAIL_CLIP_KB = 102;

export const ASPECT_PRESETS = [
  { id: "3:1", label: "3:1 banner", ratio: 3 },
  { id: "2.5:1", label: "2.5:1 wide header", ratio: 2.5 },
  { id: "2:1", label: "2:1 header", ratio: 2 },
  { id: "1.91:1", label: "1.91:1 (social-style)", ratio: 1.91 },
  { id: "16:9", label: "16:9 hero", ratio: 16 / 9 },
  { id: "1:1", label: "1:1 square", ratio: 1 },
];

/**
 * Rough compressed weight per pixel, in bytes, for a photographic-to-flat header
 * at typical export quality. Used only to say whether a weight budget is
 * realistic — actual output depends on the image content.
 */
export const FORMATS = [
  {
    id: "jpeg",
    label: "JPEG (quality 75)",
    bytesPerPixel: 0.16,
    alpha: false,
    support: "Supported everywhere. No transparency, so it needs a solid background.",
  },
  {
    id: "png8",
    label: "PNG-8 (indexed)",
    bytesPerPixel: 0.4,
    alpha: true,
    support: "Supported everywhere. Good for flat logos and few colours.",
  },
  {
    id: "png24",
    label: "PNG-24",
    bytesPerPixel: 1.6,
    alpha: true,
    support: "Supported everywhere but heavy; only worth it for gradients with transparency.",
  },
  {
    id: "gif",
    label: "GIF",
    bytesPerPixel: 0.5,
    alpha: true,
    support: "Universal, but Outlook on Windows shows only the first frame of an animation.",
  },
  {
    id: "webp",
    label: "WebP (quality 75)",
    bytesPerPixel: 0.1,
    alpha: true,
    support: "Not rendered by Outlook on Windows; needs a fallback if you use it.",
  },
];

export function formatById(id) {
  return FORMATS.find((format) => format.id === id) || null;
}

export function aspectById(id) {
  return ASPECT_PRESETS.find((preset) => preset.id === id) || null;
}

/** Kilobytes, rounded to one decimal. */
function toKB(bytes) {
  return Math.round((bytes / 1024) * 10) / 10;
}

function numberOr(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

/**
 * Plan a header image.
 * @returns {Object|{error:string}}
 */
export function planHeader(input) {
  const raw = input && typeof input === "object" ? input : {};

  const emailWidth = numberOr(raw.emailWidth, DEFAULT_EMAIL_WIDTH);
  if (!Number.isFinite(emailWidth) || emailWidth < MIN_EMAIL_WIDTH || emailWidth > MAX_EMAIL_WIDTH) {
    return { error: `Email body width must be between ${MIN_EMAIL_WIDTH} and ${MAX_EMAIL_WIDTH} pixels.` };
  }

  const retina = numberOr(raw.retina, DEFAULT_RETINA);
  if (!Number.isFinite(retina) || retina < 1 || retina > 4) {
    return { error: "Export multiplier must be between 1x and 4x." };
  }

  const aspect = aspectById(typeof raw.aspectId === "string" ? raw.aspectId : "3:1");
  if (!aspect) return { error: "Choose one of the listed aspect ratios." };

  const viewport = numberOr(raw.mobileViewport, DEFAULT_MOBILE_VIEWPORT);
  if (!Number.isFinite(viewport) || viewport < 240 || viewport > 1024) {
    return { error: "Phone viewport width must be between 240 and 1024 pixels." };
  }

  const padding = numberOr(raw.mobilePadding, DEFAULT_MOBILE_PADDING);
  if (!Number.isFinite(padding) || padding < 0 || padding * 2 >= viewport) {
    return { error: "Body padding must be zero or more, and leave room inside the viewport." };
  }

  const maxKB = numberOr(raw.maxKB, DEFAULT_MAX_KB);
  if (!Number.isFinite(maxKB) || maxKB <= 0 || maxKB > 5000) {
    return { error: "Weight budget must be between 1 KB and 5000 KB." };
  }

  const format = formatById(typeof raw.formatId === "string" ? raw.formatId : "jpeg");
  if (!format) return { error: "Choose one of the listed image formats." };

  const cssWidth = Math.round(emailWidth);
  const cssHeight = Math.round(emailWidth / aspect.ratio);
  const exportWidth = Math.round(emailWidth * retina);
  const exportHeight = Math.round(cssHeight * retina);
  const pixels = exportWidth * exportHeight;

  const mobileDisplayWidth = Math.min(cssWidth, Math.round(viewport - padding * 2));
  const mobileScale = mobileDisplayWidth / cssWidth;
  const mobileDisplayHeight = Math.round(cssHeight * mobileScale);

  // Text drawn at S pixels in the CSS-width design renders at S * mobileScale on
  // the phone, so the design size must be at least MIN_READABLE_PX / mobileScale.
  const minDesignTextPx = mobileScale > 0 ? Math.ceil(MIN_READABLE_PX / mobileScale) : null;
  const minExportTextPx = minDesignTextPx === null ? null : Math.ceil(minDesignTextPx * retina);

  const estimatedBytes = pixels * format.bytesPerPixel;
  const budgetBytes = maxKB * 1024;
  const budgetPerPixel = pixels > 0 ? budgetBytes / pixels : 0;
  const withinBudget = estimatedBytes <= budgetBytes;

  const suggestions = [];
  if (!withinBudget) {
    // Width that would bring the estimate inside the budget, keeping the ratio.
    const scale = Math.sqrt(budgetBytes / estimatedBytes);
    suggestions.push(
      `At this size ${format.label} lands near ${toKB(estimatedBytes)} KB. Dropping the export to about ${Math.floor(
        exportWidth * scale,
      )}px wide, or switching to a lighter format, brings it under ${maxKB} KB.`,
    );
  }
  if (retina > 2) {
    suggestions.push("Above 2x the extra detail is rarely visible in an email client and the file grows quickly.");
  }
  if (cssHeight > 300) {
    suggestions.push(
      `A ${cssHeight}px tall header pushes the first line of copy below the fold in most preview panes; 120-200px is typical.`,
    );
  }

  return {
    aspect,
    format,
    cssWidth,
    cssHeight,
    exportWidth,
    exportHeight,
    retina,
    pixels,
    mobileDisplayWidth,
    mobileDisplayHeight,
    mobileScale: Math.round(mobileScale * 1000) / 1000,
    mobileScalePercent: Math.round(mobileScale * 1000) / 10,
    minDesignTextPx,
    minExportTextPx,
    estimatedKB: toKB(estimatedBytes),
    budgetKB: Math.round(maxKB * 10) / 10,
    budgetPerPixel: Math.round(budgetPerPixel * 1000) / 1000,
    withinBudget,
    suggestions,
  };
}

/**
 * Dark-mode and client-compatibility checks driven by what the header contains.
 * Each item is a rule with a fixed reason, so nothing here is guesswork.
 */
export function darkModeChecks(options) {
  const raw = options && typeof options === "object" ? options : {};
  const transparentBackground = raw.transparentBackground === true;
  const darkArtwork = raw.darkArtwork === true;
  const textInImage = raw.textInImage === true;
  const animated = raw.animated === true;
  const formatId = typeof raw.formatId === "string" ? raw.formatId : "jpeg";

  const checks = [];

  checks.push({
    id: "transparent",
    ok: !(transparentBackground && darkArtwork),
    severity: "blocker",
    text:
      transparentBackground && darkArtwork
        ? "Dark artwork on a transparent background disappears when a client repaints the message dark. Add an opaque background or supply a light-on-dark variant."
        : "Background and artwork will not vanish against an inverted message background.",
  });

  checks.push({
    id: "alt",
    ok: true,
    severity: "blocker",
    text:
      "Give the image an alt attribute that carries the same message; Outlook and many corporate clients block images by default and show only the alt text.",
  });

  checks.push({
    id: "dimensions",
    ok: true,
    severity: "blocker",
    text:
      "Set width and height attributes on the img tag as well as in CSS — Outlook on Windows uses the Word rendering engine and ignores CSS-only sizing.",
  });

  checks.push({
    id: "text-in-image",
    ok: !textInImage,
    severity: textInImage ? "standard" : "nice",
    text: textInImage
      ? "Text baked into the image cannot reflow, cannot be selected, is invisible when images are blocked and will not adapt to dark mode. Keep the headline as live HTML text where you can."
      : "Keeping the headline as live text means it reflows, adapts to dark mode and survives image blocking.",
  });

  checks.push({
    id: "animation",
    ok: !animated,
    severity: animated ? "standard" : "nice",
    text: animated
      ? "Outlook on Windows shows only the first frame of an animated GIF, so make frame one meaningful on its own."
      : "A static header avoids the Outlook first-frame problem entirely.",
  });

  const format = formatById(formatId);
  if (format) {
    checks.push({
      id: "format",
      ok: formatId !== "webp",
      severity: formatId === "webp" ? "standard" : "nice",
      text: format.support,
    });
  }

  const blockers = checks.filter((check) => !check.ok && check.severity === "blocker").length;
  const warnings = checks.filter((check) => !check.ok && check.severity === "standard").length;

  return { checks, blockers, warnings, clean: blockers === 0 && warnings === 0 };
}
