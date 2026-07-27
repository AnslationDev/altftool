/**
 * Reddit Banner Size Generator — banner crop, icon legibility and old-Reddit
 * header fitting. Pure module: no React, no DOM, no clock.
 *
 * The banner behaves like a CSS `background-size: cover` fill: Reddit paints
 * the image across the full width of the community header at a fixed header
 * height, so a wide desktop window shows almost all of it and a phone shows
 * only the middle. The intersection across viewports is the safe zone.
 */

/**
 * Common authoring sizes for the community banner. Reddit renders the banner
 * across the full header width and lets moderators pick the header height in
 * Mod Tools > Appearance, so treat the height as the setting you chose rather
 * than a fixed platform constant.
 */
export const BANNER_PRESETS = [
  { id: "banner-384", label: "Tall banner", width: 1920, height: 384 },
  { id: "banner-256", label: "Medium banner", width: 1920, height: 256 },
  { id: "banner-192", label: "Short banner", width: 1920, height: 192 },
  { id: "banner-128", label: "Slim banner", width: 1920, height: 128 },
];

/**
 * Header boxes the same banner has to survive. Widths are ordinary device
 * widths in CSS pixels; the height is the banner height you set, reduced on
 * narrow screens where Reddit shortens the header.
 */
export function buildViewports(bannerHeight) {
  const h = Number.isFinite(bannerHeight) && bannerHeight > 0 ? bannerHeight : 384;
  return [
    { id: "desktop", label: "Wide desktop", w: 1920, h },
    { id: "laptop", label: "Laptop", w: 1024, h },
    { id: "mobile", label: "Phone", w: 412, h: Math.round(h / 2) },
  ];
}

/**
 * Community icon. Reddit's documented community icon upload is 256 x 256 px,
 * and it is displayed far smaller: a large header avatar, a feed byline chip
 * and a tiny sidebar/list glyph.
 */
export const ICON_UPLOAD_SIZE = 256;
export const ICON_RENDER_SIZES = [
  { id: "header", label: "Community header", px: 72 },
  { id: "feed", label: "Feed byline", px: 40 },
  { id: "list", label: "Sidebar / list", px: 20 },
];

/**
 * Old Reddit still serves subreddits at old.reddit.com. Its header logo slot
 * accepts a maximum of 500 x 100 px and a 500 KB file.
 */
export const OLD_HEADER_MAX_W = 500;
export const OLD_HEADER_MAX_H = 100;
export const OLD_HEADER_MAX_BYTES = 500 * 1024;

export const SOFT_UPSCALE_LIMIT = 1.0;
export const BAD_UPSCALE_LIMIT = 1.5;

const isPositive = (value) => Number.isFinite(value) && value > 0;

/** Rectangle of the banner that survives a centred cover crop into one header box. */
export function visibleBannerRect({ bannerW, bannerH, viewW, viewH }) {
  if (![bannerW, bannerH, viewW, viewH].every(isPositive)) {
    return { error: "Banner size and header size must all be greater than zero." };
  }
  const scale = Math.max(viewW / bannerW, viewH / bannerH);
  const w = Math.min(bannerW, viewW / scale);
  const h = Math.min(bannerH, viewH / scale);
  return {
    x: (bannerW - w) / 2,
    y: (bannerH - h) / 2,
    w,
    h,
    scale,
    keptPct: ((w * h) / (bannerW * bannerH)) * 100,
  };
}

export function intersectRects(a, b) {
  if (!a || !b || a.error || b.error) return { error: "Both rectangles must be valid." };
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  return { x: x1, y: y1, w: Math.max(0, x2 - x1), h: Math.max(0, y2 - y1) };
}

/** Region of the banner visible on every listed device width. */
export function bannerSafeZone({ bannerW, bannerH, viewports }) {
  if (!isPositive(bannerW) || !isPositive(bannerH)) {
    return { error: "Banner width and height must be greater than zero." };
  }
  const list = Array.isArray(viewports) && viewports.length ? viewports : buildViewports(bannerH);
  const rects = [];
  for (const view of list) {
    const rect = visibleBannerRect({ bannerW, bannerH, viewW: view.w, viewH: view.h });
    if (rect.error) return rect;
    rects.push({ ...rect, id: view.id, label: view.label, viewW: view.w, viewH: view.h });
  }

  let zone = { x: rects[0].x, y: rects[0].y, w: rects[0].w, h: rects[0].h };
  for (let i = 1; i < rects.length; i += 1) {
    zone = intersectRects(zone, rects[i]);
    if (zone.error) return zone;
  }

  return {
    rects,
    zone,
    safePctW: (zone.w / bannerW) * 100,
    safePctArea: ((zone.w * zone.h) / (bannerW * bannerH)) * 100,
    marginSide: (bannerW - zone.w) / 2,
  };
}

/**
 * Contain-fit the artwork into the old Reddit 500 x 100 header slot without
 * upscaling, and report whether it will be rejected for being too large.
 */
export function fitOldHeader({ srcW, srcH }) {
  if (![srcW, srcH].every(isPositive)) {
    return { error: "Artwork width and height must be greater than zero." };
  }
  const scale = Math.min(OLD_HEADER_MAX_W / srcW, OLD_HEADER_MAX_H / srcH, 1);
  const width = Math.min(OLD_HEADER_MAX_W, Math.round(srcW * scale));
  const height = Math.min(OLD_HEADER_MAX_H, Math.round(srcH * scale));
  // PNG-24 of flat logo artwork typically compresses to roughly an eighth of
  // its raw RGB byte count; used here only as a planning estimate.
  const estBytes = Math.round((width * height * 3) / 8);
  return {
    scale,
    width,
    height,
    fitsWithoutScaling: scale >= 1,
    estBytes,
    overFileLimit: estBytes > OLD_HEADER_MAX_BYTES,
    unusedWidth: OLD_HEADER_MAX_W - width,
    unusedHeight: OLD_HEADER_MAX_H - height,
  };
}

/**
 * At each render size, how much does the icon shrink, and what is the thinnest
 * stroke in the source file that still lands on at least one device pixel?
 */
export function iconLegibility({ uploadSize = ICON_UPLOAD_SIZE, devicePixelRatio = 2 } = {}) {
  if (!isPositive(uploadSize)) return { error: "Icon upload size must be greater than zero." };
  const dpr = isPositive(devicePixelRatio) ? devicePixelRatio : 1;

  const rows = ICON_RENDER_SIZES.map((slot) => {
    const shrink = slot.px / uploadSize;
    const minSourceStroke = uploadSize / (slot.px * dpr);
    return {
      ...slot,
      shrink,
      minSourceStroke,
      minSourceTextPx: minSourceStroke * 8, // 8 px is the smallest broadly readable rendered glyph
    };
  });

  return { rows, uploadSize, devicePixelRatio: dpr };
}

/** Upscale verdict for the supplied artwork against a target size. */
export function assessQuality({ srcW, srcH, targetW, targetH }) {
  if (![srcW, srcH, targetW, targetH].every(isPositive)) {
    return { error: "Artwork and target sizes must all be greater than zero." };
  }
  const scale = Math.max(targetW / srcW, targetH / srcH);
  if (scale > BAD_UPSCALE_LIMIT) {
    return { scale, verdict: "poor", note: `Artwork is stretched ${scale.toFixed(2)}x and will look blurry across the header.` };
  }
  if (scale > SOFT_UPSCALE_LIMIT) {
    return { scale, verdict: "soft", note: `Artwork is stretched ${scale.toFixed(2)}x — usable, but edges soften.` };
  }
  return { scale, verdict: "sharp", note: "Artwork is large enough; the export only downsamples." };
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

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** One call that produces everything the page shows. */
export function buildRedditReport({ bannerW, bannerH, srcW, srcH, iconUploadSize = ICON_UPLOAD_SIZE }) {
  if (!isPositive(bannerW) || !isPositive(bannerH)) {
    return { error: "Banner width and height must be greater than zero." };
  }
  if (bannerW > 8000 || bannerH > 2000) {
    return { error: "Banner dimensions are unrealistically large — keep width under 8000 px and height under 2000 px." };
  }
  if (!isPositive(srcW) || !isPositive(srcH)) {
    return { error: "Enter the artwork width and height in pixels, or upload an image." };
  }

  const safe = bannerSafeZone({ bannerW, bannerH, viewports: buildViewports(bannerH) });
  if (safe.error) return safe;
  const quality = assessQuality({ srcW, srcH, targetW: bannerW, targetH: bannerH });
  if (quality.error) return quality;
  const oldHeader = fitOldHeader({ srcW, srcH });
  const icon = iconLegibility({ uploadSize: iconUploadSize });

  return { ...safe, quality, oldHeader, icon, bannerW, bannerH };
}
