/**
 * YouTube thumbnail geometry and spec checks.
 *
 * Pure module — no React, no DOM, no canvas. The page does the pixel pushing;
 * every rectangle, ratio and verdict is computed here.
 *
 * Specs come from YouTube's own "Add video thumbnails" help page:
 *  - recommended resolution 1280 x 720
 *  - minimum width 640 px
 *  - 16:9 aspect ratio, because that is what the player and feed use
 *  - upload limit 2 MB per thumbnail
 *  - accepted formats JPG, GIF, PNG and WebP
 */

export const RECOMMENDED = { width: 1280, height: 720 };
export const MIN_WIDTH = 640;
export const TARGET_RATIO = 16 / 9;
export const MAX_BYTES = 2 * 1024 * 1024; // 2 MB upload limit

/** Formats a browser canvas can actually encode (GIF is accepted but not encodable here). */
export const EXPORT_FORMATS = [
  { id: "image/jpeg", label: "JPEG", extension: "jpg", lossy: true },
  { id: "image/png", label: "PNG", extension: "png", lossy: false },
  { id: "image/webp", label: "WebP", extension: "webp", lossy: true },
];

export const PRESETS = [
  {
    id: "hd",
    label: "1280 x 720 — YouTube recommended",
    width: 1280,
    height: 720,
    note: "The size YouTube asks for; safely under the 2 MB limit as a JPEG.",
  },
  {
    id: "fhd",
    label: "1920 x 1080 — high-detail master",
    width: 1920,
    height: 1080,
    note: "Same 16:9 frame at higher resolution; keep an eye on the 2 MB limit.",
  },
  {
    id: "min",
    label: "640 x 360 — minimum accepted width",
    width: 640,
    height: 360,
    note: "The smallest width YouTube accepts. Use only when the source is tiny.",
  },
];

/**
 * Roughly where the duration badge sits on a thumbnail in feeds and search:
 * the bottom-right corner. Treat as an approximate keep-clear zone, not a
 * pixel-exact overlay — YouTube changes chrome without notice.
 */
export const DURATION_BADGE_ZONE = { widthShare: 0.16, heightShare: 0.14 };

/** Typical rendered width of a thumbnail in the sidebar / search results. */
export const SMALL_RENDER_WIDTH = 246;

const isPositive = (value) => Number.isFinite(value) && value > 0;

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

/** "16:9" style label for a pixel size. */
export function ratioLabel(width, height) {
  if (!isPositive(width) || !isPositive(height)) return "—";
  const w = Math.round(width);
  const h = Math.round(height);
  const divisor = gcd(w, h) || 1;
  const rw = w / divisor;
  const rh = h / divisor;
  if (rw <= 40 && rh <= 40) return `${rw}:${rh}`;
  return `${(width / height).toFixed(2)}:1`;
}

/** Human-readable byte size using binary units. */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

/**
 * Centre "cover" crop: the largest rectangle of the source that has the target
 * ratio. Returns source-pixel coordinates for drawImage.
 */
export function computeCoverRect(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  if (![sourceWidth, sourceHeight, targetWidth, targetHeight].every(isPositive)) {
    return { error: "Width and height must be positive numbers." };
  }
  const targetRatio = targetWidth / targetHeight;
  const sourceRatio = sourceWidth / sourceHeight;

  let sw = sourceWidth;
  let sh = sourceHeight;
  if (sourceRatio > targetRatio) {
    // Source is wider — trim the sides.
    sw = sourceHeight * targetRatio;
  } else if (sourceRatio < targetRatio) {
    // Source is taller — trim top and bottom.
    sh = sourceWidth / targetRatio;
  }
  return {
    sx: (sourceWidth - sw) / 2,
    sy: (sourceHeight - sh) / 2,
    sw,
    sh,
    croppedShare: 1 - (sw * sh) / (sourceWidth * sourceHeight),
  };
}

/**
 * "Contain" box: the whole source scaled to fit inside the target, centred,
 * with the leftover area padded.
 */
export function computeContainBox(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  if (![sourceWidth, sourceHeight, targetWidth, targetHeight].every(isPositive)) {
    return { error: "Width and height must be positive numbers." };
  }
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const dw = sourceWidth * scale;
  const dh = sourceHeight * scale;
  return {
    dx: (targetWidth - dw) / 2,
    dy: (targetHeight - dh) / 2,
    dw,
    dh,
    scale,
    padShare: 1 - (dw * dh) / (targetWidth * targetHeight),
  };
}

/**
 * Plan one export.
 *
 * @param {object} input
 * @param {number} input.sourceWidth
 * @param {number} input.sourceHeight
 * @param {string} input.presetId
 * @param {"cover"|"contain"} input.mode
 * @returns {object|{error: string}}
 */
export function planExport(input = {}) {
  const preset = PRESETS.find((item) => item.id === input.presetId);
  if (!preset) return { error: "Choose a thumbnail size." };

  const sourceWidth = Number(input.sourceWidth);
  const sourceHeight = Number(input.sourceHeight);
  if (!isPositive(sourceWidth) || !isPositive(sourceHeight)) {
    return { error: "Load an image before exporting." };
  }

  const mode = input.mode === "contain" ? "contain" : "cover";
  const geometry =
    mode === "cover"
      ? computeCoverRect(sourceWidth, sourceHeight, preset.width, preset.height)
      : computeContainBox(sourceWidth, sourceHeight, preset.width, preset.height);
  if (geometry.error) return geometry;

  // How much the source has to be enlarged to fill the target. Above 1 means
  // real detail is being invented by the resampler.
  const upscale = mode === "cover" ? preset.width / geometry.sw : geometry.scale;

  const warnings = [];
  if (upscale > 1.01) {
    warnings.push(
      `The source is being enlarged ${upscale.toFixed(2)}x to reach ${preset.width} px wide, so the export will look softer than the original.`
    );
  }
  if (mode === "cover" && geometry.croppedShare > 0.25) {
    warnings.push(
      `${Math.round(geometry.croppedShare * 100)}% of the original image is cropped away at 16:9 — check that nothing important sits near an edge.`
    );
  }
  if (mode === "contain" && geometry.padShare > 0.01) {
    warnings.push(
      `${Math.round(geometry.padShare * 100)}% of the frame will be padding, which reads as letterboxing in the feed.`
    );
  }

  return {
    preset,
    mode,
    geometry,
    upscale,
    target: { width: preset.width, height: preset.height },
    filename: `youtube-thumbnail-${preset.width}x${preset.height}`,
    warnings,
  };
}

/**
 * Check a rendered thumbnail against YouTube's published limits.
 *
 * @param {{width:number,height:number,bytes:number|null}} file
 * @returns {{checks: Array, passes: boolean}|{error: string}}
 */
export function checkAgainstSpec(file = {}) {
  const width = Number(file.width);
  const height = Number(file.height);
  if (!isPositive(width) || !isPositive(height)) {
    return { error: "Load an image to run the spec checks." };
  }
  const bytes = file.bytes == null ? null : Number(file.bytes);

  const ratio = width / height;
  const ratioOff = Math.abs(ratio - TARGET_RATIO) / TARGET_RATIO;

  const checks = [
    {
      id: "width",
      label: `Minimum width ${MIN_WIDTH} px`,
      value: `${Math.round(width)} px`,
      status: width >= MIN_WIDTH ? "pass" : "fail",
      detail:
        width >= MIN_WIDTH
          ? "Wide enough for YouTube to accept the upload."
          : `YouTube rejects thumbnails under ${MIN_WIDTH} px wide.`,
    },
    {
      id: "ratio",
      label: "16:9 aspect ratio",
      value: ratioLabel(width, height),
      status: ratioOff <= 0.005 ? "pass" : ratioOff <= 0.05 ? "warn" : "fail",
      detail:
        ratioOff <= 0.005
          ? "Matches the player and feed frame exactly."
          : "Anything other than 16:9 gets letterboxed or cropped by the player.",
    },
    {
      id: "recommended",
      label: `Recommended ${RECOMMENDED.width} x ${RECOMMENDED.height}`,
      value: `${Math.round(width)} x ${Math.round(height)}`,
      status:
        width >= RECOMMENDED.width && height >= RECOMMENDED.height
          ? "pass"
          : width >= MIN_WIDTH
            ? "warn"
            : "fail",
      detail:
        width >= RECOMMENDED.width
          ? "At or above the resolution YouTube recommends."
          : "Below the recommended resolution — usable, but softer on large screens.",
    },
  ];

  if (bytes != null && Number.isFinite(bytes)) {
    checks.push({
      id: "size",
      label: `Under the ${formatBytes(MAX_BYTES)} upload limit`,
      value: formatBytes(bytes),
      status: bytes <= MAX_BYTES ? "pass" : "fail",
      detail:
        bytes <= MAX_BYTES
          ? "Within YouTube's 2 MB thumbnail limit."
          : "Over the 2 MB limit — export as JPEG or lower the quality.",
    });
  }

  return { checks, passes: checks.every((check) => check.status !== "fail") };
}

/**
 * The corner the duration badge covers, in target pixels, plus the size the
 * thumbnail is typically rendered at in feeds.
 */
export function overlayGuides(width, height) {
  if (!isPositive(width) || !isPositive(height)) return { error: "Invalid thumbnail size." };
  const badgeWidth = width * DURATION_BADGE_ZONE.widthShare;
  const badgeHeight = height * DURATION_BADGE_ZONE.heightShare;
  return {
    badge: {
      x: width - badgeWidth,
      y: height - badgeHeight,
      width: badgeWidth,
      height: badgeHeight,
    },
    smallRender: {
      width: SMALL_RENDER_WIDTH,
      height: Math.round((SMALL_RENDER_WIDTH * height) / width),
      scale: SMALL_RENDER_WIDTH / width,
    },
  };
}
