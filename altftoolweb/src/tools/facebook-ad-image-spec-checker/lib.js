/**
 * Facebook Ad Image Spec Checker — validates a still creative against the
 * placements in Meta's Ads Guide.
 *
 * Rules encoded here come from Meta's published image-ad design and technical
 * requirements:
 *  - File type: JPG or PNG for image ads.
 *  - Maximum file size: 30 MB.
 *  - Facebook Feed: aspect ratio 1.91:1 through 1:1, minimum 600 x 600 px,
 *    recommended at least 1080 x 1080 px.
 *  - Vertical feed: 4:5.
 *  - Stories and Reels: 9:16, recommended 1080 x 1920 px, minimum width 500 px.
 *  - Right column: 1.91:1, minimum 254 x 133 px.
 *  - Ratio tolerance: 3%.
 *  - The old "20% text" rejection rule was retired in 2020. Heavy text overlay
 *    is no longer a rejection reason but can still suppress delivery, so it is
 *    reported as a warning, never as a failure.
 *
 * Pure module — no React, no DOM, no clocks.
 */

export const MAX_FILE_SIZE_MB = 30;
export const ALLOWED_FORMATS = ["jpg", "jpeg", "png"];

/** Meta allows a 3% deviation from a placement's stated aspect ratio. */
export const RATIO_TOLERANCE = 0.03;

/** Retired as a hard rule in 2020; still a delivery signal, so warn only. */
export const TEXT_COVERAGE_GUIDANCE_PCT = 20;

/** Practical upper bound on a single dimension for a still creative. */
export const MAX_DIMENSION_PX = 30000;

export const PLACEMENTS = [
  {
    id: "feed",
    label: "Facebook Feed",
    ratioMin: 1,
    ratioMax: 1.91,
    ratioText: "1:1 to 1.91:1",
    minWidth: 600,
    minHeight: 600,
    recWidth: 1080,
    recHeight: 1080,
  },
  {
    id: "feed-vertical",
    label: "Vertical feed (4:5)",
    ratioMin: 4 / 5,
    ratioMax: 4 / 5,
    ratioText: "4:5",
    minWidth: 600,
    minHeight: 750,
    recWidth: 1080,
    recHeight: 1350,
  },
  {
    id: "story",
    label: "Stories & Reels",
    ratioMin: 9 / 16,
    ratioMax: 9 / 16,
    ratioText: "9:16",
    minWidth: 500,
    minHeight: 888,
    recWidth: 1080,
    recHeight: 1920,
  },
  {
    id: "right-column",
    label: "Right column",
    ratioMin: 1.91,
    ratioMax: 1.91,
    ratioText: "1.91:1",
    minWidth: 254,
    minHeight: 133,
    recWidth: 1200,
    recHeight: 628,
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function gcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/** Reduce a pixel size to its smallest whole-number aspect ratio. */
export function simplifyRatio(width, height) {
  const divisor = gcd(width, height);
  return { w: Math.round(width) / divisor, h: Math.round(height) / divisor };
}

/** "1200 x 628" -> "1.91:1". Returns a readable label for any size. */
export function ratioLabel(width, height) {
  if (!(width > 0) || !(height > 0)) return "—";
  const simple = simplifyRatio(width, height);
  if (simple.w <= 40 && simple.h <= 40) return `${simple.w}:${simple.h}`;
  const value = width / height;
  return value >= 1 ? `${(value).toFixed(2)}:1` : `1:${(1 / value).toFixed(2)}`;
}

/** Normalise a user-entered extension or MIME type to a bare lowercase format. */
export function normaliseFormat(raw) {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/^image\//, "")
    .replace(/^\./, "");
}

function withinRatio(value, placement) {
  const low = placement.ratioMin * (1 - RATIO_TOLERANCE);
  const high = placement.ratioMax * (1 + RATIO_TOLERANCE);
  return value >= low && value <= high;
}

/**
 * @param {object} input
 * @param {number} input.width           Creative width in pixels.
 * @param {number} input.height          Creative height in pixels.
 * @param {number} input.fileSizeMB      File size in megabytes.
 * @param {string} input.format          Extension or MIME type.
 * @param {number} input.textCoveragePct Share of the frame covered by text.
 * @returns {object} check results, or { error } for unusable input.
 */
export function checkFacebookAdImage({
  width,
  height,
  fileSizeMB = 0,
  format = "jpg",
  textCoveragePct = 0,
} = {}) {
  if (!isNum(width) || !isNum(height)) return { error: "Enter the image width and height in pixels." };
  if (!isNum(fileSizeMB)) return { error: "Enter a valid file size in MB." };
  if (!isNum(textCoveragePct)) return { error: "Enter a valid text coverage percentage." };
  if (width <= 0 || height <= 0) return { error: "Width and height must be greater than zero." };
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return { error: "Pixel dimensions must be whole numbers." };
  }
  if (width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX) {
    return { error: `Width and height must be ${MAX_DIMENSION_PX} px or less.` };
  }
  if (fileSizeMB < 0) return { error: "File size cannot be negative." };
  if (textCoveragePct < 0 || textCoveragePct > 100) {
    return { error: "Text coverage must be between 0% and 100%." };
  }

  const ratio = width / height;
  const ext = normaliseFormat(format);

  const placements = PLACEMENTS.map((placement) => {
    const reasons = [];
    if (!withinRatio(ratio, placement)) {
      reasons.push(`Needs ${placement.ratioText} (±${Math.round(RATIO_TOLERANCE * 100)}%)`);
    }
    if (width < placement.minWidth) reasons.push(`Needs at least ${placement.minWidth} px wide`);
    if (height < placement.minHeight) reasons.push(`Needs at least ${placement.minHeight} px tall`);

    const fits = reasons.length === 0;
    const belowRecommended =
      fits && (width < placement.recWidth || height < placement.recHeight);

    return {
      ...placement,
      fits,
      belowRecommended,
      reasons,
    };
  });

  const eligible = placements.filter((placement) => placement.fits);

  const checks = [];

  checks.push({
    id: "format",
    label: "File type",
    status: ALLOWED_FORMATS.includes(ext) ? "pass" : "fail",
    detail: ALLOWED_FORMATS.includes(ext)
      ? `${ext.toUpperCase()} is accepted for image ads.`
      : `Image ads accept ${ALLOWED_FORMATS.join(", ").toUpperCase()} — convert before uploading.`,
  });

  checks.push({
    id: "filesize",
    label: "File size",
    status: fileSizeMB > MAX_FILE_SIZE_MB ? "fail" : "pass",
    detail:
      fileSizeMB > MAX_FILE_SIZE_MB
        ? `${fileSizeMB} MB is over the ${MAX_FILE_SIZE_MB} MB limit.`
        : `${fileSizeMB} MB is within the ${MAX_FILE_SIZE_MB} MB limit.`,
  });

  checks.push({
    id: "resolution",
    label: "Resolution",
    status: width >= 1080 && height >= 1080 ? "pass" : "warn",
    detail:
      width >= 1080 && height >= 1080
        ? "At or above Meta's recommended 1080 px on both sides."
        : "Meta recommends at least 1080 px on both sides so the creative stays sharp on high-density screens.",
  });

  checks.push({
    id: "placements",
    label: "Placement fit",
    status: eligible.length > 0 ? "pass" : "fail",
    detail:
      eligible.length > 0
        ? `Fits ${eligible.length} placement${eligible.length === 1 ? "" : "s"}: ${eligible
            .map((placement) => placement.label)
            .join(", ")}.`
        : "This ratio does not match any standard Meta image placement.",
  });

  checks.push({
    id: "text",
    label: "Text density",
    status: textCoveragePct > TEXT_COVERAGE_GUIDANCE_PCT ? "warn" : "pass",
    detail:
      textCoveragePct > TEXT_COVERAGE_GUIDANCE_PCT
        ? `Text covers about ${textCoveragePct}% of the frame. The hard 20% rule was retired in 2020, so this will not be rejected, but text-heavy creative often gets less delivery.`
        : `Text covers about ${textCoveragePct}% of the frame, at or under the ${TEXT_COVERAGE_GUIDANCE_PCT}% Meta used to enforce.`,
  });

  const failCount = checks.filter((check) => check.status === "fail").length;
  const warnCount = checks.filter((check) => check.status === "warn").length;

  return {
    ratio,
    ratioText: ratioLabel(width, height),
    megapixels: (width * height) / 1000000,
    orientation: width > height ? "Landscape" : width < height ? "Portrait" : "Square",
    placements,
    eligible,
    checks,
    failCount,
    warnCount,
    verdict: failCount > 0 ? "fail" : warnCount > 0 ? "warn" : "pass",
  };
}
