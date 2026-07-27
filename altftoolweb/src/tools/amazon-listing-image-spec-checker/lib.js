/**
 * Amazon Listing Image Spec Checker.
 *
 * Rules encoded here are Amazon's published product image requirements
 * (Seller Central, "Product image requirements"):
 *  - The longest side must be at least 500 px for the image to be accepted.
 *  - Zoom is enabled once the longest side reaches 1000 px.
 *  - Amazon recommends 1600 px or more on the longest side.
 *  - The longest side may not exceed 10000 px.
 *  - Accepted formats: JPEG (.jpg/.jpeg, preferred), TIFF (.tif), PNG (.png)
 *    and non-animated GIF (.gif).
 *  - Colour mode must be sRGB or CMYK.
 *  - The MAIN image must have a pure white background (RGB 255,255,255).
 *  - The product, including packaging, must fill at least 85% of the frame.
 *  - The MAIN image may not contain text, logos, watermarks, borders, inset
 *    images or props that are not part of the product.
 *  - Square (1:1) is the recommended shape for the main image.
 *
 * Pure module — no React, no DOM, no clocks.
 */

/** Below this the image is rejected at upload. */
export const MIN_LONGEST_SIDE_PX = 500;

/** At or above this, Amazon's zoom viewer is enabled on the detail page. */
export const ZOOM_LONGEST_SIDE_PX = 1000;

/** Amazon's own recommendation for the longest side. */
export const RECOMMENDED_LONGEST_SIDE_PX = 1600;

/** Hard ceiling on the longest side. */
export const MAX_LONGEST_SIDE_PX = 10000;

/** Minimum share of the frame the product must occupy on the main image. */
export const MIN_PRODUCT_FILL_PCT = 85;

/** Practical upload ceiling for a single product image. */
export const MAX_FILE_SIZE_MB = 10;

export const ALLOWED_FORMATS = ["jpg", "jpeg", "tif", "tiff", "png", "gif"];
export const PREFERRED_FORMAT = "jpg";
export const ALLOWED_COLOR_MODES = ["srgb", "cmyk"];

/** Ratios further from square than this only get a recommendation warning. */
export const RATIO_WARN_THRESHOLD = 2;

export const IMAGE_ROLES = [
  { id: "main", label: "Main image (first photo on the detail page)" },
  { id: "additional", label: "Additional image (lifestyle, angles, infographic)" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Normalise a user-entered extension or MIME type to a bare lowercase format. */
export function normaliseFormat(raw) {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/^image\//, "")
    .replace(/^\./, "")
    .replace(/^jpeg$/, "jpeg");
}

/**
 * @param {object} input
 * @param {number}  input.width
 * @param {number}  input.height
 * @param {number}  input.fileSizeMB
 * @param {string}  input.format
 * @param {string}  input.role            "main" or "additional".
 * @param {boolean} input.whiteBackground Pure white RGB 255,255,255 background.
 * @param {number}  input.productFillPct  Share of frame the product occupies.
 * @param {boolean} input.hasTextOrLogo   Text, logo, watermark or border present.
 * @param {string}  input.colorMode       "srgb", "cmyk" or anything else.
 * @returns {object} check results, or { error } for unusable input.
 */
export function checkAmazonImage({
  width,
  height,
  fileSizeMB = 0,
  format = "jpg",
  role = "main",
  whiteBackground = true,
  productFillPct = 85,
  hasTextOrLogo = false,
  colorMode = "srgb",
} = {}) {
  if (!isNum(width) || !isNum(height)) return { error: "Enter the image width and height in pixels." };
  if (!isNum(fileSizeMB)) return { error: "Enter a valid file size in MB." };
  if (!isNum(productFillPct)) return { error: "Enter a valid product fill percentage." };
  if (width <= 0 || height <= 0) return { error: "Width and height must be greater than zero." };
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return { error: "Pixel dimensions must be whole numbers." };
  }
  if (fileSizeMB < 0) return { error: "File size cannot be negative." };
  if (productFillPct < 0 || productFillPct > 100) {
    return { error: "Product fill must be between 0% and 100%." };
  }
  if (!IMAGE_ROLES.some((entry) => entry.id === role)) {
    return { error: "Choose whether this is the main image or an additional image." };
  }

  const longest = Math.max(width, height);
  const shortest = Math.min(width, height);
  const ratio = longest / shortest;
  const ext = normaliseFormat(format);
  const mode = String(colorMode ?? "").trim().toLowerCase();
  const isMain = role === "main";

  const checks = [];

  if (longest < MIN_LONGEST_SIDE_PX) {
    checks.push({
      id: "min-size",
      label: "Minimum size",
      status: "fail",
      detail: `Longest side is ${longest} px. Amazon rejects images under ${MIN_LONGEST_SIDE_PX} px on the longest side.`,
    });
  } else if (longest > MAX_LONGEST_SIDE_PX) {
    checks.push({
      id: "min-size",
      label: "Maximum size",
      status: "fail",
      detail: `Longest side is ${longest} px, over the ${MAX_LONGEST_SIDE_PX} px ceiling.`,
    });
  } else {
    checks.push({
      id: "min-size",
      label: "Accepted size",
      status: "pass",
      detail: `Longest side is ${longest} px, inside the ${MIN_LONGEST_SIDE_PX}-${MAX_LONGEST_SIDE_PX} px range.`,
    });
  }

  const zoomEnabled = longest >= ZOOM_LONGEST_SIDE_PX;
  checks.push({
    id: "zoom",
    label: "Zoom",
    status: zoomEnabled ? "pass" : "warn",
    detail: zoomEnabled
      ? `Zoom is enabled — the longest side is at or above ${ZOOM_LONGEST_SIDE_PX} px.`
      : `Zoom stays off below ${ZOOM_LONGEST_SIDE_PX} px on the longest side, which costs conversions on detail pages.`,
  });

  checks.push({
    id: "recommended",
    label: "Recommended resolution",
    status: longest >= RECOMMENDED_LONGEST_SIDE_PX ? "pass" : "warn",
    detail:
      longest >= RECOMMENDED_LONGEST_SIDE_PX
        ? `At or above Amazon's recommended ${RECOMMENDED_LONGEST_SIDE_PX} px.`
        : `Amazon recommends ${RECOMMENDED_LONGEST_SIDE_PX} px or more on the longest side for a crisp zoom.`,
  });

  checks.push({
    id: "format",
    label: "File format",
    status: ALLOWED_FORMATS.includes(ext) ? (ext === "jpg" || ext === "jpeg" ? "pass" : "warn") : "fail",
    detail: ALLOWED_FORMATS.includes(ext)
      ? ext === "jpg" || ext === "jpeg"
        ? "JPEG is Amazon's preferred format."
        : `${ext.toUpperCase()} is accepted, but JPEG is preferred and uploads more reliably.`
      : `${ext ? ext.toUpperCase() : "This format"} is not accepted. Use ${ALLOWED_FORMATS.join(", ").toUpperCase()}.`,
  });

  checks.push({
    id: "filesize",
    label: "File size",
    status: fileSizeMB > MAX_FILE_SIZE_MB ? "fail" : "pass",
    detail:
      fileSizeMB > MAX_FILE_SIZE_MB
        ? `${fileSizeMB} MB is above the ${MAX_FILE_SIZE_MB} MB upload limit.`
        : `${fileSizeMB} MB is within the ${MAX_FILE_SIZE_MB} MB upload limit.`,
  });

  checks.push({
    id: "colour",
    label: "Colour mode",
    status: ALLOWED_COLOR_MODES.includes(mode) ? "pass" : "warn",
    detail: ALLOWED_COLOR_MODES.includes(mode)
      ? `${mode.toUpperCase()} is accepted.`
      : "Amazon expects sRGB or CMYK. Other profiles can shift colour on the live listing.",
  });

  checks.push({
    id: "background",
    label: "Background",
    status: !isMain ? "pass" : whiteBackground ? "pass" : "fail",
    detail: !isMain
      ? "Additional images may use any background, including lifestyle scenes."
      : whiteBackground
        ? "Pure white background, as the main image requires."
        : "The main image must sit on a pure white background (RGB 255,255,255).",
  });

  checks.push({
    id: "fill",
    label: "Frame fill",
    status: !isMain ? "pass" : productFillPct >= MIN_PRODUCT_FILL_PCT ? "pass" : "fail",
    detail: !isMain
      ? "Frame fill is only enforced on the main image."
      : productFillPct >= MIN_PRODUCT_FILL_PCT
        ? `The product fills about ${productFillPct}% of the frame, at or above the ${MIN_PRODUCT_FILL_PCT}% minimum.`
        : `The product fills about ${productFillPct}% of the frame. Amazon requires at least ${MIN_PRODUCT_FILL_PCT}% — crop tighter.`,
  });

  checks.push({
    id: "overlay",
    label: "Text, logos & borders",
    status: !isMain ? "pass" : hasTextOrLogo ? "fail" : "pass",
    detail: !isMain
      ? "Additional images may carry text, callouts and infographics."
      : hasTextOrLogo
        ? "The main image may not contain text, logos, watermarks, borders or inset images."
        : "No overlay elements declared on the main image.",
  });

  checks.push({
    id: "shape",
    label: "Shape",
    status: ratio <= RATIO_WARN_THRESHOLD ? "pass" : "warn",
    detail:
      ratio <= RATIO_WARN_THRESHOLD
        ? `Aspect ratio is ${ratio.toFixed(2)}:1 — close enough to square to display well.`
        : `Aspect ratio is ${ratio.toFixed(2)}:1. Amazon shows product images in a square frame, so very long images get heavy white padding.`,
  });

  const failCount = checks.filter((check) => check.status === "fail").length;
  const warnCount = checks.filter((check) => check.status === "warn").length;

  return {
    checks,
    longest,
    shortest,
    ratio,
    megapixels: (width * height) / 1000000,
    zoomEnabled,
    isSquare: width === height,
    failCount,
    warnCount,
    verdict: failCount > 0 ? "fail" : warnCount > 0 ? "warn" : "pass",
  };
}
