/**
 * LinkedIn Image Size Generator — pure geometry + spec tables.
 *
 * No React, no DOM. Every exported function is total: it never returns NaN or
 * Infinity, and returns { error } for input it cannot honestly answer for.
 */

/**
 * LinkedIn's published image guidance. Widths/heights are the sizes LinkedIn
 * recommends you upload; `display` is the box the platform renders them in, so
 * a 2x upload still lands on a crisp 1x slot.
 *
 * Sources: LinkedIn Help — "Profile photo and background photo guidelines",
 * "Add or edit your Page logo and cover image", and LinkedIn Marketing
 * Solutions ad-spec guidance. Confirm before a paid campaign; LinkedIn
 * refreshes these occasionally.
 */
export const LINKEDIN_PRESETS = [
  {
    id: "square-post",
    label: "Square feed post",
    group: "Posts",
    width: 1200,
    height: 1200,
    display: "Fills the feed column on mobile; the tallest safe single image.",
  },
  {
    id: "portrait-post",
    label: "Portrait feed post",
    group: "Posts",
    width: 1080,
    height: 1350,
    display: "4:5 portrait — the maximum height LinkedIn shows without cropping.",
  },
  {
    id: "landscape-post",
    label: "Landscape / link share",
    group: "Posts",
    width: 1200,
    height: 627,
    display: "1.91:1, the ratio LinkedIn uses for link preview cards.",
  },
  {
    id: "document-slide",
    label: "Document (carousel) slide",
    group: "Posts",
    width: 1080,
    height: 1350,
    display: "Export slides at 4:5 and combine them into one PDF before upload.",
  },
  {
    id: "article-cover",
    label: "Article / newsletter cover",
    group: "Articles",
    width: 1920,
    height: 1080,
    display: "16:9. LinkedIn accepts a minimum of 744 x 400 px.",
  },
  {
    id: "profile-photo",
    label: "Profile photo",
    group: "Personal profile",
    width: 400,
    height: 400,
    display: "Square, rendered as a circle. Minimum 268 x 268 px.",
  },
  {
    id: "profile-background",
    label: "Profile background banner",
    group: "Personal profile",
    width: 1584,
    height: 396,
    display: "4:1. Your photo overlaps the lower-left corner.",
  },
  {
    id: "page-logo",
    label: "Company Page logo",
    group: "Company Page",
    width: 300,
    height: 300,
    display: "Square logo shown beside every Page post.",
  },
  {
    id: "page-cover",
    label: "Company Page cover",
    group: "Company Page",
    width: 1128,
    height: 191,
    display: "Very wide 5.9:1 strip — keep type near the centre.",
  },
  {
    id: "life-tab-hero",
    label: "Life tab hero image",
    group: "Company Page",
    width: 1128,
    height: 376,
    display: "3:1 hero on the Page's Life tab.",
  },
];

/** LinkedIn rejects uploads above 8 MB for feed images. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/**
 * A raster image resampled above 1.0x starts to look soft; above 1.5x it is
 * visibly mushy on a retina feed. These thresholds are the industry rule of
 * thumb used by print and web prepress checklists.
 */
export const SOFT_UPSCALE_LIMIT = 1.0;
export const BAD_UPSCALE_LIMIT = 1.5;

const isPositive = (value) => Number.isFinite(value) && value > 0;

/**
 * Cover fit: scale the source so it completely fills the target, then centre
 * crop. Returns the rectangle of the SOURCE that survives the crop.
 */
export function computeCoverCrop({ srcW, srcH, targetW, targetH, focusX = 0.5, focusY = 0.5 }) {
  if (![srcW, srcH, targetW, targetH].every(isPositive)) {
    return { error: "Image and target sizes must all be greater than zero." };
  }
  const fx = Math.min(1, Math.max(0, Number.isFinite(focusX) ? focusX : 0.5));
  const fy = Math.min(1, Math.max(0, Number.isFinite(focusY) ? focusY : 0.5));

  const scale = Math.max(targetW / srcW, targetH / srcH);
  // Source pixels that map onto the target box.
  const sw = Math.min(srcW, targetW / scale);
  const sh = Math.min(srcH, targetH / scale);
  const sx = Math.min(Math.max(0, (srcW - sw) * fx), srcW - sw);
  const sy = Math.min(Math.max(0, (srcH - sh) * fy), srcH - sh);

  const keptArea = (sw * sh) / (srcW * srcH);
  return {
    sx,
    sy,
    sw,
    sh,
    scale,
    croppedPct: Math.max(0, Math.min(100, (1 - keptArea) * 100)),
  };
}

/**
 * Contain fit: scale the source down (never up past 1:1 unless allowed) so the
 * whole image sits inside the target, letterboxed with a background colour.
 */
export function computeContainBox({ srcW, srcH, targetW, targetH, allowUpscale = true }) {
  if (![srcW, srcH, targetW, targetH].every(isPositive)) {
    return { error: "Image and target sizes must all be greater than zero." };
  }
  let scale = Math.min(targetW / srcW, targetH / srcH);
  if (!allowUpscale) scale = Math.min(scale, 1);

  const dw = srcW * scale;
  const dh = srcH * scale;
  return {
    dx: (targetW - dw) / 2,
    dy: (targetH - dh) / 2,
    dw,
    dh,
    scale,
    padPct: Math.max(0, Math.min(100, (1 - (dw * dh) / (targetW * targetH)) * 100)),
  };
}

/**
 * Sharpness verdict for one preset: how far the source has to be stretched to
 * fill the target in cover mode.
 */
export function assessQuality({ srcW, srcH, targetW, targetH }) {
  if (![srcW, srcH, targetW, targetH].every(isPositive)) {
    return { error: "Image and target sizes must all be greater than zero." };
  }
  const scale = Math.max(targetW / srcW, targetH / srcH);
  let verdict = "sharp";
  let note = "Source is large enough — the export downsamples, which stays crisp.";
  if (scale > BAD_UPSCALE_LIMIT) {
    verdict = "poor";
    note = `Source is upscaled ${scale.toFixed(2)}x. Re-export the artwork at a higher resolution.`;
  } else if (scale > SOFT_UPSCALE_LIMIT) {
    verdict = "soft";
    note = `Source is upscaled ${scale.toFixed(2)}x — usable, but edges will soften slightly.`;
  }
  return { scale, verdict, note };
}

/**
 * Aspect-ratio distance between source and target, as a percentage. 0% means
 * the crop is free; large values mean a lot of the frame is thrown away.
 */
export function ratioMismatchPct({ srcW, srcH, targetW, targetH }) {
  if (![srcW, srcH, targetW, targetH].every(isPositive)) {
    return { error: "Image and target sizes must all be greater than zero." };
  }
  const srcRatio = srcW / srcH;
  const targetRatio = targetW / targetH;
  const larger = Math.max(srcRatio, targetRatio);
  const smaller = Math.min(srcRatio, targetRatio);
  return { srcRatio, targetRatio, mismatchPct: ((larger - smaller) / smaller) * 100 };
}

/**
 * Uncompressed RGBA byte count, then a rough compressed estimate.
 * PNG-24 of photographic content typically lands near 1/3 of raw RGB; JPEG at
 * quality 0.9 lands near 1/12. These are estimates for planning only.
 */
const PNG_RATIO = 1 / 3;
const JPEG_Q90_RATIO = 1 / 12;

export function estimateBytes({ width, height, format = "png" }) {
  if (![width, height].every(isPositive)) {
    return { error: "Width and height must be greater than zero." };
  }
  const raw = width * height * 3;
  const ratio = format === "jpeg" ? JPEG_Q90_RATIO : PNG_RATIO;
  const bytes = Math.round(raw * ratio);
  return { raw, bytes, overLimit: bytes > MAX_UPLOAD_BYTES };
}

/** Build the full per-preset report for one source image. */
export function buildReport({ srcW, srcH, presetIds, format = "png" }) {
  if (!isPositive(srcW) || !isPositive(srcH)) {
    return { error: "Load an image first — its width and height must be above zero." };
  }
  const wanted = Array.isArray(presetIds) && presetIds.length ? presetIds : LINKEDIN_PRESETS.map((p) => p.id);
  const rows = LINKEDIN_PRESETS.filter((preset) => wanted.includes(preset.id)).map((preset) => {
    const quality = assessQuality({ srcW, srcH, targetW: preset.width, targetH: preset.height });
    const crop = computeCoverCrop({ srcW, srcH, targetW: preset.width, targetH: preset.height });
    const ratio = ratioMismatchPct({ srcW, srcH, targetW: preset.width, targetH: preset.height });
    const size = estimateBytes({ width: preset.width, height: preset.height, format });
    return {
      ...preset,
      scale: quality.scale,
      verdict: quality.verdict,
      note: quality.note,
      croppedPct: crop.croppedPct,
      mismatchPct: ratio.mismatchPct,
      estBytes: size.bytes,
    };
  });

  if (!rows.length) return { error: "Pick at least one LinkedIn size to export." };

  return {
    rows,
    poorCount: rows.filter((row) => row.verdict === "poor").length,
    softCount: rows.filter((row) => row.verdict === "soft").length,
  };
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function gcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function ratioLabel(width, height) {
  if (!isPositive(width) || !isPositive(height)) return "—";
  const divisor = gcd(width, height);
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}
