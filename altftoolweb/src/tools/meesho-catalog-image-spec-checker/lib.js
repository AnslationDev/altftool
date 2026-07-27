/**
 * Meesho Catalog Image Spec Checker.
 *
 * Meesho publishes its catalogue image requirements in the Supplier Panel and
 * they vary a little by category. The rules encoded here are the ones applied
 * across the common categories:
 *  - Minimum 500 x 500 px; 1000 x 1000 px or larger recommended.
 *  - Square (1:1) is the standard catalogue shape; several apparel categories
 *    also accept portrait 3:4.
 *  - JPEG or PNG.
 *  - A clean, uncluttered background — no props competing with the product.
 *  - No watermark, brand logo, price, discount badge, phone number, website or
 *    any other contact detail on the image.
 *  - No collages: one product per image.
 *  - Sharp, well-lit photography; blurred or pixelated images are rejected.
 *
 * The checker also works out how much of a non-square image a 1:1 catalogue
 * thumbnail would crop away, which is the most common surprise at upload.
 *
 * Pure module — no React, no DOM, no clocks.
 */

export const MIN_SIDE_PX = 500;
export const RECOMMENDED_SIDE_PX = 1000;

/** Very large uploads time out on patchy connections; advisory, not a hard cap. */
export const LARGE_SIDE_ADVISORY_PX = 5000;
export const LARGE_FILE_ADVISORY_MB = 5;

export const ALLOWED_FORMATS = ["jpg", "jpeg", "png"];

/** Accepted catalogue shapes, as width divided by height. */
export const ACCEPTED_RATIOS = [
  { id: "square", label: "1:1 (square)", value: 1 },
  { id: "portrait", label: "3:4 (portrait, apparel)", value: 3 / 4 },
];

/** Small tolerance so a 1000 x 1001 export is not treated as the wrong shape. */
export const RATIO_TOLERANCE = 0.02;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Normalise a user-entered extension or MIME type to a bare lowercase format. */
export function normaliseFormat(raw) {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/^image\//, "")
    .replace(/^\./, "");
}

/**
 * Share of the longer side a 1:1 thumbnail crop would discard, as a percentage.
 * A 1200 x 1600 image loses 1 - 1200/1600 = 25% of its height.
 */
export function squareCropLossPct(width, height) {
  if (!(width > 0) || !(height > 0)) return null;
  const shortest = Math.min(width, height);
  const longest = Math.max(width, height);
  return (1 - shortest / longest) * 100;
}

function matchRatio(ratio) {
  return ACCEPTED_RATIOS.find(
    (entry) => Math.abs(ratio - entry.value) <= entry.value * RATIO_TOLERANCE
  );
}

/**
 * @param {object} input
 * @returns {object} check results, or { error } for unusable input.
 */
export function checkMeeshoImage({
  width,
  height,
  fileSizeMB = 0,
  format = "jpg",
  cleanBackground = true,
  hasWatermarkOrText = false,
  hasContactDetails = false,
  isCollage = false,
  isSharp = true,
} = {}) {
  if (!isNum(width) || !isNum(height)) return { error: "Enter the image width and height in pixels." };
  if (!isNum(fileSizeMB)) return { error: "Enter a valid file size in MB." };
  if (width <= 0 || height <= 0) return { error: "Width and height must be greater than zero." };
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return { error: "Pixel dimensions must be whole numbers." };
  }
  if (fileSizeMB < 0) return { error: "File size cannot be negative." };

  const shortest = Math.min(width, height);
  const longest = Math.max(width, height);
  const ratio = width / height;
  const matched = matchRatio(ratio);
  const ext = normaliseFormat(format);
  const cropLoss = squareCropLossPct(width, height);

  const checks = [];

  checks.push({
    id: "size",
    label: "Minimum size",
    status: shortest >= MIN_SIDE_PX ? "pass" : "fail",
    detail:
      shortest >= MIN_SIDE_PX
        ? `${width} x ${height} px clears the ${MIN_SIDE_PX} x ${MIN_SIDE_PX} px minimum.`
        : `Shortest side is ${shortest} px. Catalogue images must be at least ${MIN_SIDE_PX} x ${MIN_SIDE_PX} px.`,
  });

  checks.push({
    id: "recommended",
    label: "Recommended size",
    status: shortest >= RECOMMENDED_SIDE_PX ? "pass" : "warn",
    detail:
      shortest >= RECOMMENDED_SIDE_PX
        ? `At or above the recommended ${RECOMMENDED_SIDE_PX} px on the short side.`
        : `${RECOMMENDED_SIDE_PX} x ${RECOMMENDED_SIDE_PX} px or larger is recommended so the product stays sharp when a buyer zooms.`,
  });

  checks.push({
    id: "shape",
    label: "Aspect ratio",
    status: matched ? "pass" : "warn",
    detail: matched
      ? `${matched.label} — a standard catalogue shape.`
      : `Ratio is ${ratio.toFixed(2)}:1. Catalogue thumbnails are square, so about ${cropLoss.toFixed(
          1
        )}% of the longer side gets cropped away.`,
  });

  checks.push({
    id: "format",
    label: "File format",
    status: ALLOWED_FORMATS.includes(ext) ? "pass" : "fail",
    detail: ALLOWED_FORMATS.includes(ext)
      ? `${ext.toUpperCase()} is accepted.`
      : `${ext ? ext.toUpperCase() : "This format"} is not accepted — upload JPEG or PNG.`,
  });

  checks.push({
    id: "filesize",
    label: "File size",
    status: fileSizeMB > LARGE_FILE_ADVISORY_MB ? "warn" : "pass",
    detail:
      fileSizeMB > LARGE_FILE_ADVISORY_MB
        ? `${fileSizeMB} MB is heavy for a catalogue upload — compress below about ${LARGE_FILE_ADVISORY_MB} MB to avoid upload failures.`
        : `${fileSizeMB} MB uploads comfortably.`,
  });

  checks.push({
    id: "oversize",
    label: "Very large image",
    status: longest > LARGE_SIDE_ADVISORY_PX ? "warn" : "pass",
    detail:
      longest > LARGE_SIDE_ADVISORY_PX
        ? `${longest} px on the long side is far beyond what the catalogue displays; resize to save upload time.`
        : "Dimensions are in a sensible range for a catalogue image.",
  });

  checks.push({
    id: "background",
    label: "Background",
    status: cleanBackground ? "pass" : "fail",
    detail: cleanBackground
      ? "Clean, uncluttered background."
      : "Catalogue images need a clean background — remove clutter, props and busy scenes.",
  });

  checks.push({
    id: "overlay",
    label: "Watermark, logo & price text",
    status: hasWatermarkOrText ? "fail" : "pass",
    detail: hasWatermarkOrText
      ? "Watermarks, brand logos, price tags and discount badges on the image are rejected."
      : "No watermark, logo or price text declared.",
  });

  checks.push({
    id: "contact",
    label: "Contact details",
    status: hasContactDetails ? "fail" : "pass",
    detail: hasContactDetails
      ? "Phone numbers, WhatsApp handles, websites and other contact details are not allowed on catalogue images."
      : "No contact details declared on the image.",
  });

  checks.push({
    id: "collage",
    label: "Single product",
    status: isCollage ? "fail" : "pass",
    detail: isCollage
      ? "Collages and multi-panel images are rejected — one product per image."
      : "One product per image, as required.",
  });

  checks.push({
    id: "sharpness",
    label: "Sharpness",
    status: isSharp ? "pass" : "fail",
    detail: isSharp
      ? "Declared sharp and well lit."
      : "Blurred, dark or pixelated photographs are rejected at catalogue QC.",
  });

  const failCount = checks.filter((check) => check.status === "fail").length;
  const warnCount = checks.filter((check) => check.status === "warn").length;

  return {
    checks,
    shortest,
    longest,
    ratio,
    ratioLabel: matched ? matched.label : `${ratio.toFixed(2)}:1`,
    squareCropLossPct: cropLoss,
    megapixels: (width * height) / 1000000,
    failCount,
    warnCount,
    verdict: failCount > 0 ? "fail" : warnCount > 0 ? "warn" : "pass",
  };
}
