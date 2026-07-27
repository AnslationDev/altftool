/**
 * Etsy Listing Image Spec Checker.
 *
 * Rules encoded here come from Etsy's Seller Handbook guidance on listing
 * photos:
 *  - Etsy recommends images of at least 2000 px on the shortest side, because
 *    the listing page allows buyers to enlarge the photo.
 *  - A listing may carry up to 10 photos.
 *  - Accepted file types are .jpg, .gif and .png.
 *  - The primary photo is cropped to a 4:3 frame in search results, so Etsy
 *    advises leaving space around the subject rather than cropping tight.
 *  - Landscape orientation survives the 4:3 thumbnail crop better than portrait.
 *
 * The file-size advisory below is NOT an Etsy limit; Etsy publishes the current
 * per-file ceiling in its own help centre. It only flags files large enough to
 * fail on a slow or mobile connection.
 *
 * Pure module — no React, no DOM, no clocks.
 */

/** Etsy's recommended minimum on the shortest side. */
export const RECOMMENDED_SHORT_SIDE_PX = 2000;

/** Below this a listing photo looks soft as soon as a buyer enlarges it. */
export const LOW_RESOLUTION_SHORT_SIDE_PX = 1000;

/** Maximum photos per listing. */
export const MAX_PHOTOS_PER_LISTING = 10;

/** Search-result thumbnails are cropped to this shape. */
export const THUMBNAIL_RATIO = 4 / 3;
export const THUMBNAIL_RATIO_LABEL = "4:3";

/** Crop loss above this is worth warning about. */
export const CROP_WARN_PCT = 15;

/** Not an Etsy limit — a practical ceiling for reliable uploads. */
export const LARGE_FILE_ADVISORY_MB = 10;

export const ALLOWED_FORMATS = ["jpg", "jpeg", "gif", "png"];

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
 * Share of the image a centre crop to `targetRatio` discards.
 * A 1:1 photo cropped to 4:3 loses 1 - 1/(4/3) = 25% of its height.
 */
export function cropLossPct(currentRatio, targetRatio) {
  if (!(currentRatio > 0) || !(targetRatio > 0)) return null;
  return (1 - Math.min(currentRatio, targetRatio) / Math.max(currentRatio, targetRatio)) * 100;
}

/**
 * @param {object} input
 * @param {number} input.width
 * @param {number} input.height
 * @param {number} input.fileSizeMB
 * @param {string} input.format
 * @param {number} input.photoCount   Photos on the listing, including this one.
 * @param {boolean} input.isPrimary   True when this is the first listing photo.
 * @returns {object} check results, or { error } for unusable input.
 */
export function checkEtsyImage({
  width,
  height,
  fileSizeMB = 0,
  format = "jpg",
  photoCount = 1,
  isPrimary = true,
} = {}) {
  if (!isNum(width) || !isNum(height)) return { error: "Enter the image width and height in pixels." };
  if (!isNum(fileSizeMB)) return { error: "Enter a valid file size in MB." };
  if (!isNum(photoCount)) return { error: "Enter how many photos the listing has." };
  if (width <= 0 || height <= 0) return { error: "Width and height must be greater than zero." };
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return { error: "Pixel dimensions must be whole numbers." };
  }
  if (fileSizeMB < 0) return { error: "File size cannot be negative." };
  if (!Number.isInteger(photoCount) || photoCount < 1) {
    return { error: "Photo count must be a whole number of at least 1." };
  }

  const shortest = Math.min(width, height);
  const ratio = width / height;
  const ext = normaliseFormat(format);
  const loss = cropLossPct(ratio, THUMBNAIL_RATIO);
  const orientation = width > height ? "Landscape" : width < height ? "Portrait" : "Square";

  const checks = [];

  checks.push({
    id: "format",
    label: "File type",
    status: ALLOWED_FORMATS.includes(ext) ? "pass" : "fail",
    detail: ALLOWED_FORMATS.includes(ext)
      ? `${ext.toUpperCase()} is accepted for listing photos.`
      : `${ext ? ext.toUpperCase() : "This format"} is not accepted — Etsy takes JPG, GIF and PNG.`,
  });

  checks.push({
    id: "photo-count",
    label: "Photos on the listing",
    status: photoCount > MAX_PHOTOS_PER_LISTING ? "fail" : "pass",
    detail:
      photoCount > MAX_PHOTOS_PER_LISTING
        ? `${photoCount} photos exceeds the ${MAX_PHOTOS_PER_LISTING} allowed per listing.`
        : `${photoCount} of ${MAX_PHOTOS_PER_LISTING} photo slots used.`,
  });

  if (shortest < LOW_RESOLUTION_SHORT_SIDE_PX) {
    checks.push({
      id: "resolution",
      label: "Resolution",
      status: "fail",
      detail: `Shortest side is ${shortest} px. Below about ${LOW_RESOLUTION_SHORT_SIDE_PX} px the photo goes soft the moment a buyer enlarges it — Etsy recommends ${RECOMMENDED_SHORT_SIDE_PX} px.`,
    });
  } else if (shortest < RECOMMENDED_SHORT_SIDE_PX) {
    checks.push({
      id: "resolution",
      label: "Resolution",
      status: "warn",
      detail: `Shortest side is ${shortest} px. Etsy recommends at least ${RECOMMENDED_SHORT_SIDE_PX} px so the enlarged view stays crisp.`,
    });
  } else {
    checks.push({
      id: "resolution",
      label: "Resolution",
      status: "pass",
      detail: `Shortest side is ${shortest} px, at or above Etsy's recommended ${RECOMMENDED_SHORT_SIDE_PX} px.`,
    });
  }

  checks.push({
    id: "thumbnail",
    label: `Thumbnail crop (${THUMBNAIL_RATIO_LABEL})`,
    status: !isPrimary ? "pass" : loss <= CROP_WARN_PCT ? "pass" : "warn",
    detail: !isPrimary
      ? "Only the first photo is cropped to the search thumbnail."
      : loss <= CROP_WARN_PCT
        ? `A ${THUMBNAIL_RATIO_LABEL} search thumbnail trims about ${loss.toFixed(1)}% of this image — safe.`
        : `A ${THUMBNAIL_RATIO_LABEL} search thumbnail trims about ${loss.toFixed(
            1
          )}% of this image. Leave space around the subject or shoot wider so nothing important is cut.`,
  });

  checks.push({
    id: "orientation",
    label: "Orientation",
    status: !isPrimary ? "pass" : orientation === "Portrait" ? "warn" : "pass",
    detail: !isPrimary
      ? `${orientation} — orientation only matters for the first photo.`
      : orientation === "Portrait"
        ? `Portrait photos lose the most to the ${THUMBNAIL_RATIO_LABEL} thumbnail crop. A landscape or square first photo shows more of the product in search.`
        : `${orientation} works well with the ${THUMBNAIL_RATIO_LABEL} search thumbnail.`,
  });

  checks.push({
    id: "filesize",
    label: "File size",
    status: fileSizeMB > LARGE_FILE_ADVISORY_MB ? "warn" : "pass",
    detail:
      fileSizeMB > LARGE_FILE_ADVISORY_MB
        ? `${fileSizeMB} MB is large for a listing photo and often fails on a mobile connection. Export a smaller JPEG; Etsy's current per-file limit is published in its help centre.`
        : `${fileSizeMB} MB uploads comfortably.`,
  });

  const failCount = checks.filter((check) => check.status === "fail").length;
  const warnCount = checks.filter((check) => check.status === "warn").length;

  return {
    checks,
    shortest,
    ratio,
    orientation,
    thumbnailCropLossPct: loss,
    megapixels: (width * height) / 1000000,
    slotsLeft: Math.max(0, MAX_PHOTOS_PER_LISTING - photoCount),
    failCount,
    warnCount,
    verdict: failCount > 0 ? "fail" : warnCount > 0 ? "warn" : "pass",
  };
}
