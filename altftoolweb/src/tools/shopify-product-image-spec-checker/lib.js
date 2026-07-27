/**
 * Shopify Product Image Spec Checker.
 *
 * Rules encoded here are Shopify's published product image requirements:
 *  - Maximum resolution: 20 megapixels (width x height).
 *  - Maximum file size: 20 MB.
 *  - Recommended size for square product photos: 2048 x 2048 px.
 *  - Zoom on the product page needs at least 800 x 800 px.
 *  - Supported file types: JPEG, PNG, GIF, WebP and HEIC.
 *  - Shopify recommends using one aspect ratio across every product image in a
 *    store so collection grids line up; this checker compares your image to a
 *    store standard you pick and reports how much a crop to that shape removes.
 *
 * Pure module — no React, no DOM, no clocks.
 */

/** Shopify rejects anything above this many megapixels. */
export const MAX_MEGAPIXELS = 20;

/** Shopify's per-file upload ceiling. */
export const MAX_FILE_SIZE_MB = 20;

/** Below this the product-page zoom does not engage usefully. */
export const ZOOM_MIN_SIDE_PX = 800;

/** Shopify's recommended square product photo. */
export const RECOMMENDED_SIDE_PX = 2048;

export const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "gif", "webp", "heic"];

export const STORE_RATIOS = [
  { id: "square", label: "1:1 square", value: 1 },
  { id: "portrait45", label: "4:5 portrait", value: 4 / 5 },
  { id: "portrait23", label: "2:3 portrait", value: 2 / 3 },
  { id: "landscape32", label: "3:2 landscape", value: 3 / 2 },
  { id: "landscape169", label: "16:9 landscape", value: 16 / 9 },
];

/** How far an image may drift from the store ratio before it is flagged. */
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
 * Share of the image a centre crop to `targetRatio` would discard.
 * Cropping a 1:1 image to 4:5 removes 1 - 0.8/1 = 20% of its width.
 */
export function cropLossPct(currentRatio, targetRatio) {
  if (!(currentRatio > 0) || !(targetRatio > 0)) return null;
  return (1 - Math.min(currentRatio, targetRatio) / Math.max(currentRatio, targetRatio)) * 100;
}

/**
 * @param {object} input
 * @returns {object} check results, or { error } for unusable input.
 */
export function checkShopifyImage({
  width,
  height,
  fileSizeMB = 0,
  format = "jpg",
  storeRatio = "square",
} = {}) {
  if (!isNum(width) || !isNum(height)) return { error: "Enter the image width and height in pixels." };
  if (!isNum(fileSizeMB)) return { error: "Enter a valid file size in MB." };
  if (width <= 0 || height <= 0) return { error: "Width and height must be greater than zero." };
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return { error: "Pixel dimensions must be whole numbers." };
  }
  if (fileSizeMB < 0) return { error: "File size cannot be negative." };

  const target = STORE_RATIOS.find((entry) => entry.id === storeRatio);
  if (!target) return { error: "Choose a store standard aspect ratio." };

  const megapixels = (width * height) / 1000000;
  const shortest = Math.min(width, height);
  const ratio = width / height;
  const ext = normaliseFormat(format);
  const loss = cropLossPct(ratio, target.value);
  const matchesStore = Math.abs(ratio - target.value) <= target.value * RATIO_TOLERANCE;

  const checks = [];

  checks.push({
    id: "megapixels",
    label: "Resolution limit",
    status: megapixels > MAX_MEGAPIXELS ? "fail" : "pass",
    detail:
      megapixels > MAX_MEGAPIXELS
        ? `${megapixels.toFixed(1)} MP is over Shopify's ${MAX_MEGAPIXELS} MP ceiling — the upload will be refused.`
        : `${megapixels.toFixed(1)} MP is within the ${MAX_MEGAPIXELS} MP ceiling.`,
  });

  checks.push({
    id: "filesize",
    label: "File size",
    status: fileSizeMB > MAX_FILE_SIZE_MB ? "fail" : "pass",
    detail:
      fileSizeMB > MAX_FILE_SIZE_MB
        ? `${fileSizeMB} MB is over the ${MAX_FILE_SIZE_MB} MB per-file limit.`
        : `${fileSizeMB} MB is within the ${MAX_FILE_SIZE_MB} MB per-file limit.`,
  });

  const zoomReady = shortest >= ZOOM_MIN_SIDE_PX;
  checks.push({
    id: "zoom",
    label: "Zoom",
    status: zoomReady ? "pass" : "warn",
    detail: zoomReady
      ? `Shortest side is ${shortest} px, above the ${ZOOM_MIN_SIDE_PX} px zoom threshold.`
      : `Zoom needs at least ${ZOOM_MIN_SIDE_PX} px on the shortest side; this image is ${shortest} px.`,
  });

  checks.push({
    id: "recommended",
    label: "Recommended size",
    status: shortest >= RECOMMENDED_SIDE_PX ? "pass" : "warn",
    detail:
      shortest >= RECOMMENDED_SIDE_PX
        ? `At or above Shopify's recommended ${RECOMMENDED_SIDE_PX} px.`
        : `Shopify recommends ${RECOMMENDED_SIDE_PX} x ${RECOMMENDED_SIDE_PX} px for product photos so retina screens stay sharp.`,
  });

  checks.push({
    id: "format",
    label: "File type",
    status: ALLOWED_FORMATS.includes(ext) ? "pass" : "fail",
    detail: ALLOWED_FORMATS.includes(ext)
      ? `${ext.toUpperCase()} is supported. Shopify serves resized WebP variants automatically, so upload the highest quality original you have.`
      : `${ext ? ext.toUpperCase() : "This format"} is not supported. Use ${ALLOWED_FORMATS.join(", ").toUpperCase()}.`,
  });

  checks.push({
    id: "consistency",
    label: "Store ratio",
    status: matchesStore ? "pass" : "warn",
    detail: matchesStore
      ? `Matches your ${target.label} store standard, so collection grids stay aligned.`
      : `Image is ${ratio.toFixed(2)}:1 but your store standard is ${target.label}. A centre crop to that shape removes about ${loss.toFixed(
          1
        )}% of the image, and a mismatched ratio leaves uneven padding in collection grids.`,
  });

  const failCount = checks.filter((check) => check.status === "fail").length;
  const warnCount = checks.filter((check) => check.status === "warn").length;

  return {
    checks,
    megapixels,
    shortest,
    ratio,
    targetRatio: target,
    cropLossPct: loss,
    matchesStore,
    zoomReady,
    isSquare: width === height,
    failCount,
    warnCount,
    verdict: failCount > 0 ? "fail" : warnCount > 0 ? "warn" : "pass",
  };
}
