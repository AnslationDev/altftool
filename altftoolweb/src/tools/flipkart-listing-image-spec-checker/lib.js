/**
 * Flipkart Listing Image Spec Checker.
 *
 * Rules encoded here follow Flipkart's seller image guidelines:
 *  - Catalogue images must be at least 500 x 500 px.
 *  - 1500 x 1500 px or larger is recommended so the zoom viewer is usable.
 *  - Images may not exceed 5000 x 5000 px.
 *  - JPEG is the catalogue format.
 *  - The primary image needs a plain white background with the product centred.
 *  - The product should occupy roughly 85% of the frame, which leaves at most
 *    about 7.5% margin on each side.
 *  - No watermarks, text, logos, borders, collages or promotional badges on the
 *    primary image.
 *
 * Category style guides differ, so the checker reports the rule it applied for
 * every result rather than returning a bare pass or fail.
 *
 * Pure module — no React, no DOM, no clocks.
 */

export const MIN_SIDE_PX = 500;
export const RECOMMENDED_SIDE_PX = 1500;
export const MAX_SIDE_PX = 5000;

/** Share of the frame the product should occupy on the primary image. */
export const MIN_PRODUCT_FILL_PCT = 85;

/** Ratio beyond which the square catalogue frame adds heavy padding. */
export const RATIO_WARN_THRESHOLD = 1.5;

/** Not a platform limit — a practical ceiling that keeps bulk uploads fast. */
export const LARGE_FILE_ADVISORY_MB = 10;

export const ALLOWED_FORMATS = ["jpg", "jpeg"];
export const IMAGE_ROLES = [
  { id: "primary", label: "Primary image (first in the catalogue)" },
  { id: "secondary", label: "Secondary image (angles, details, in-use)" },
];

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
 * A product centred in the frame and occupying `fillPct` of it leaves an even
 * margin on each side; this converts one to the other for the margin check.
 */
export function marginPerSidePct(fillPct) {
  if (!isNum(fillPct) || fillPct < 0 || fillPct > 100) return null;
  return (100 - fillPct) / 2;
}

/**
 * @param {object} input
 * @returns {object} check results, or { error } for unusable input.
 */
export function checkFlipkartImage({
  width,
  height,
  fileSizeMB = 0,
  format = "jpg",
  role = "primary",
  whiteBackground = true,
  productFillPct = 85,
  hasWatermarkOrText = false,
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
    return { error: "Choose whether this is the primary image or a secondary image." };
  }

  const shortest = Math.min(width, height);
  const longest = Math.max(width, height);
  const ratio = longest / shortest;
  const ext = normaliseFormat(format);
  const isPrimary = role === "primary";
  const margin = marginPerSidePct(productFillPct);
  const allowedMargin = marginPerSidePct(MIN_PRODUCT_FILL_PCT);

  const checks = [];

  if (shortest < MIN_SIDE_PX) {
    checks.push({
      id: "size",
      label: "Minimum size",
      status: "fail",
      detail: `Shortest side is ${shortest} px. Flipkart catalogue images must be at least ${MIN_SIDE_PX} x ${MIN_SIDE_PX} px.`,
    });
  } else if (longest > MAX_SIDE_PX) {
    checks.push({
      id: "size",
      label: "Maximum size",
      status: "fail",
      detail: `Longest side is ${longest} px, above the ${MAX_SIDE_PX} px ceiling.`,
    });
  } else {
    checks.push({
      id: "size",
      label: "Accepted size",
      status: "pass",
      detail: `${width} x ${height} px sits inside the ${MIN_SIDE_PX}-${MAX_SIDE_PX} px range.`,
    });
  }

  const zoomReady = shortest >= RECOMMENDED_SIDE_PX;
  checks.push({
    id: "zoom",
    label: "Zoom quality",
    status: zoomReady ? "pass" : "warn",
    detail: zoomReady
      ? `At or above the recommended ${RECOMMENDED_SIDE_PX} px, so zoom stays sharp.`
      : `Flipkart recommends ${RECOMMENDED_SIDE_PX} x ${RECOMMENDED_SIDE_PX} px or larger; below that the zoom view looks soft.`,
  });

  checks.push({
    id: "format",
    label: "File format",
    status: ALLOWED_FORMATS.includes(ext) ? "pass" : "fail",
    detail: ALLOWED_FORMATS.includes(ext)
      ? "JPEG is the catalogue format Flipkart expects."
      : `${ext ? ext.toUpperCase() : "This format"} is not a catalogue format — export as JPEG.`,
  });

  checks.push({
    id: "filesize",
    label: "File size",
    status: fileSizeMB > LARGE_FILE_ADVISORY_MB ? "warn" : "pass",
    detail:
      fileSizeMB > LARGE_FILE_ADVISORY_MB
        ? `${fileSizeMB} MB is heavy for a catalogue image. Most sellers keep files under ${LARGE_FILE_ADVISORY_MB} MB so bulk uploads do not time out.`
        : `${fileSizeMB} MB is a comfortable size for a bulk catalogue upload.`,
  });

  checks.push({
    id: "background",
    label: "Background",
    status: !isPrimary ? "pass" : whiteBackground ? "pass" : "fail",
    detail: !isPrimary
      ? "Secondary images may show the product in use or on a styled background."
      : whiteBackground
        ? "Plain white background, as the primary image requires."
        : "The primary catalogue image needs a plain white background with the product centred.",
  });

  checks.push({
    id: "fill",
    label: "Frame fill",
    status: !isPrimary ? "pass" : productFillPct >= MIN_PRODUCT_FILL_PCT ? "pass" : "fail",
    detail: !isPrimary
      ? "Frame fill is only enforced on the primary image."
      : productFillPct >= MIN_PRODUCT_FILL_PCT
        ? `The product fills about ${productFillPct}% of the frame, at or above the ${MIN_PRODUCT_FILL_PCT}% guideline.`
        : `The product fills about ${productFillPct}% of the frame — Flipkart expects around ${MIN_PRODUCT_FILL_PCT}%.`,
  });

  checks.push({
    id: "margin",
    label: "Margin",
    status: !isPrimary ? "pass" : margin <= allowedMargin ? "pass" : "warn",
    detail: !isPrimary
      ? "Margin guidance applies to the primary image."
      : `Roughly ${margin.toFixed(1)}% margin on each side; the ${MIN_PRODUCT_FILL_PCT}% fill guideline allows about ${allowedMargin.toFixed(1)}%.`,
  });

  checks.push({
    id: "overlay",
    label: "Watermarks & text",
    status: !isPrimary ? (hasWatermarkOrText ? "warn" : "pass") : hasWatermarkOrText ? "fail" : "pass",
    detail: hasWatermarkOrText
      ? isPrimary
        ? "Watermarks, logos, borders, collages and promotional text are not allowed on the catalogue image."
        : "Secondary images tolerate callouts, but brand watermarks and price badges are still commonly rejected."
      : "No watermark, border or promotional text declared.",
  });

  checks.push({
    id: "shape",
    label: "Shape",
    status: ratio <= RATIO_WARN_THRESHOLD ? "pass" : "warn",
    detail:
      ratio <= RATIO_WARN_THRESHOLD
        ? `Aspect ratio ${ratio.toFixed(2)}:1 displays cleanly in the catalogue frame.`
        : `Aspect ratio ${ratio.toFixed(2)}:1 is far from square, so the listing frame will add large white bands.`,
  });

  const failCount = checks.filter((check) => check.status === "fail").length;
  const warnCount = checks.filter((check) => check.status === "warn").length;

  return {
    checks,
    shortest,
    longest,
    ratio,
    marginPerSide: margin,
    megapixels: (width * height) / 1000000,
    zoomReady,
    isSquare: width === height,
    failCount,
    warnCount,
    verdict: failCount > 0 ? "fail" : warnCount > 0 ? "warn" : "pass",
  };
}
