/**
 * Email header image sizing: CSS width to export pixels, retina multiplier,
 * mobile rendered height, and the img markup Outlook needs.
 */

/**
 * 600 px has been the safe email body width since Outlook's Word rendering
 * engine took over in 2007; 640 px is the widest most templates go, and
 * mobile-first single-column layouts sometimes use 680 px with fluid scaling.
 */
export const TEMPLATE_WIDTHS = [
  { id: "600", width: 600, label: "600 px — the safe default" },
  { id: "640", width: 640, label: "640 px — wide template" },
  { id: "680", width: 680, label: "680 px — fluid / hybrid" },
  { id: "320", width: 320, label: "320 px — mobile-only module" },
];

/** Device pixel ratios worth exporting for. */
export const PIXEL_RATIOS = [
  { id: "1", value: 1, label: "1x — standard" },
  { id: "2", value: 2, label: "2x — retina (recommended)" },
  { id: "3", value: 3, label: "3x — very high density" },
];

/** Highest DPR this tool will export for; beyond 3x the file cost is wasted. */
export const MAX_PIXEL_RATIO = 3;

/**
 * Gmail truncates a message and shows a "View entire message" link once the
 * HTML passes about 102 KB. Images are fetched separately and do not count,
 * but base64-embedded images do.
 */
export const GMAIL_CLIP_BYTES = 102 * 1024;

/**
 * Practical file-size ceiling per hero image. Above this, slow mobile
 * connections show a broken-looking header while it loads.
 */
export const HERO_IMAGE_BUDGET_BYTES = 200 * 1024;

/** Common phone viewport widths, in CSS pixels. */
export const MOBILE_VIEWPORTS = [
  { id: "320", width: 320, label: "320 px — small phone" },
  { id: "375", width: 375, label: "375 px — iPhone standard" },
  { id: "414", width: 414, label: "414 px — large phone" },
];

/**
 * How each major client treats a header image. These are behaviours, not
 * numbers that change with a release, so they stay accurate.
 */
export const CLIENT_NOTES = [
  {
    client: "Outlook 2007-2019 / 365 (Windows)",
    note: "Uses the Word rendering engine: ignores max-width and CSS background images, so set width and height attributes on the img itself.",
  },
  {
    client: "Outlook on high-DPI Windows",
    note: "Scales images by the system DPI setting, which can soften a 1x export. A 2x export sized down by the width attribute stays crisp.",
  },
  {
    client: "Gmail web and app",
    note: "Strips <style> in some contexts and clips messages over roughly 102 KB of HTML. Keep the header as one linked image, not base64.",
  },
  {
    client: "Apple Mail / iOS Mail",
    note: "Full retina support and honours max-width, so a 2x export displayed at half size looks sharp.",
  },
  {
    client: "Dark mode (Apple Mail, Outlook, some Gmail)",
    note: "May invert or recolour the header. Use a PNG with a transparent background or bake in a background that works either way.",
  },
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Format a byte count for display. */
export function formatBytes(bytes) {
  if (!isNum(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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

/**
 * Work out every number needed to export and place an email header image.
 *
 * @param {object} input
 * @param {number} input.cssWidth   width the image occupies in the template
 * @param {number} input.cssHeight  height it occupies in the template
 * @param {number} input.pixelRatio export multiplier (1, 2 or 3)
 * @param {number} input.fileKb     current file size in kilobytes, 0 if unknown
 * @returns {object} result, or { error } when the input cannot be used
 */
export function computeEmailHeader({
  cssWidth,
  cssHeight,
  pixelRatio = 2,
  fileKb = 0,
} = {}) {
  if (![cssWidth, cssHeight, pixelRatio, fileKb].every(isNum)) {
    return { error: "Enter a number in every field." };
  }
  if (cssWidth <= 0 || cssHeight <= 0) {
    return { error: "Display width and height must be greater than zero." };
  }
  if (cssWidth > 1200) {
    return { error: "Email bodies wider than 1200 px break in every desktop client." };
  }
  if (cssHeight > 2000) {
    return { error: "A header taller than 2000 px is a full email, not a header." };
  }
  if (pixelRatio < 1) return { error: "Pixel ratio must be at least 1." };
  if (pixelRatio > MAX_PIXEL_RATIO) {
    return { error: `Exporting above ${MAX_PIXEL_RATIO}x adds file size with no visible gain.` };
  }
  if (fileKb < 0) return { error: "File size cannot be negative." };

  const exportWidth = Math.round(cssWidth * pixelRatio);
  const exportHeight = Math.round(cssHeight * pixelRatio);
  const aspectRatio = cssWidth / cssHeight;
  const bytes = fileKb * 1024;

  const mobileRenders = MOBILE_VIEWPORTS.map((viewport) => {
    // A fluid header fills the viewport width and keeps its aspect ratio.
    const renderedWidth = Math.min(viewport.width, cssWidth);
    return {
      id: viewport.id,
      label: viewport.label,
      viewportWidth: viewport.width,
      renderedWidth,
      renderedHeight: renderedWidth / aspectRatio,
      effectiveRatio: exportWidth / renderedWidth,
    };
  });

  const warnings = [];
  if (cssWidth > 640) {
    warnings.push(
      "Above 640 px the template needs fluid or hybrid coding — Outlook will not scale it down.",
    );
  }
  if (cssHeight > cssWidth * 0.6) {
    warnings.push(
      "A header taller than about 60% of its width pushes the first line of copy below the preview pane.",
    );
  }
  if (bytes > HERO_IMAGE_BUDGET_BYTES) {
    warnings.push(
      `File is over the ${formatBytes(HERO_IMAGE_BUDGET_BYTES)} practical budget for a hero image.`,
    );
  }
  if (exportWidth > 2000) {
    warnings.push("Exports wider than 2000 px rarely pay for themselves in an email.");
  }

  return {
    cssWidth,
    cssHeight,
    pixelRatio,
    exportWidth,
    exportHeight,
    aspectRatio,
    megapixels: (exportWidth * exportHeight) / 1e6,
    bytes,
    budgetBytes: HERO_IMAGE_BUDGET_BYTES,
    budgetUsedShare: bytes / HERO_IMAGE_BUDGET_BYTES,
    gmailClipBytes: GMAIL_CLIP_BYTES,
    mobileRenders,
    warnings,
    ok: warnings.length === 0,
  };
}

/**
 * The img tag to paste into the template. Width and height attributes are set
 * explicitly because Outlook's Word engine ignores CSS sizing.
 */
export function buildImgMarkup({
  src = "",
  alt = "",
  cssWidth,
  cssHeight,
  linkUrl = "",
} = {}) {
  if (!isNum(cssWidth) || !isNum(cssHeight) || cssWidth <= 0 || cssHeight <= 0) {
    return { error: "Display width and height must be greater than zero." };
  }
  const img =
    `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}"\n` +
    `     width="${Math.round(cssWidth)}" height="${Math.round(cssHeight)}"\n` +
    `     style="display:block;width:100%;max-width:${Math.round(cssWidth)}px;height:auto;border:0;outline:none;text-decoration:none;" />`;

  const html = linkUrl
    ? `<a href="${escapeAttribute(linkUrl)}" target="_blank" style="text-decoration:none;">\n  ${img.replace(/\n/g, "\n  ")}\n</a>`
    : img;

  return { html };
}
