/**
 * Facebook Cover Size Generator — cover-crop geometry and safe-zone maths.
 *
 * The core idea: Facebook shows the same uploaded cover in two very different
 * boxes (a wide desktop strip and a much taller mobile strip). Each box is
 * filled with a centred "cover" crop, so each one throws away a different part
 * of the artwork. The region that survives BOTH crops is the safe zone — the
 * only place a headline or logo is guaranteed to be visible.
 *
 * Pure module: no React, no DOM, no Date.
 */

/**
 * Upload sizes and the display boxes Facebook renders them in.
 * Display boxes come from Facebook's long-published cover guidance:
 * a Page/profile cover renders 820 x 312 px on desktop and 640 x 360 px on
 * mobile. Uploading at 2x (1640 x 624) keeps it crisp on retina screens.
 */
export const FACEBOOK_COVER_PRESETS = [
  {
    id: "page-cover",
    label: "Page cover (2x)",
    uploadW: 1640,
    uploadH: 624,
    views: [
      { id: "desktop", label: "Desktop", w: 820, h: 312 },
      { id: "mobile", label: "Mobile app", w: 640, h: 360 },
    ],
    note: "Upload at 2x so the 820 x 312 desktop strip stays sharp on retina displays.",
  },
  {
    id: "profile-cover",
    label: "Personal profile cover",
    uploadW: 851,
    uploadH: 315,
    views: [
      { id: "desktop", label: "Desktop", w: 820, h: 312 },
      { id: "mobile", label: "Mobile app", w: 640, h: 360 },
    ],
    note: "The classic 851 x 315 cover. Your profile picture overlaps the lower-left corner on desktop.",
  },
  {
    id: "group-cover",
    label: "Group cover",
    uploadW: 1640,
    uploadH: 856,
    views: [
      { id: "desktop", label: "Desktop", w: 1640, h: 856 },
      { id: "mobile", label: "Mobile app", w: 640, h: 334 },
    ],
    note: "Groups use a taller banner than Pages, roughly 1.92:1.",
  },
  {
    id: "event-cover",
    label: "Event cover",
    uploadW: 1920,
    uploadH: 1005,
    views: [
      { id: "desktop", label: "Desktop", w: 1920, h: 1005 },
      { id: "feed-card", label: "Feed / share card", w: 1200, h: 630 },
    ],
    note: "Events use the 1.91:1 link-card ratio, the same shape as a shared link preview.",
  },
];

/**
 * Facebook's desktop profile picture renders at 170 x 170 px inside the
 * 820 px-wide cover strip, sitting near the lower-left corner. Treat the
 * clearance box as approximate — Facebook shifts it between layouts.
 */
export const AVATAR_DISPLAY_SIZE = 170;
export const AVATAR_DISPLAY_LEFT = 24;
export const AVATAR_DISPLAY_BOTTOM = -40; // overhangs below the cover strip

/** A raster upscaled past this factor visibly softens on a retina screen. */
export const SOFT_UPSCALE_LIMIT = 1.0;
export const BAD_UPSCALE_LIMIT = 1.5;

const isPositive = (value) => Number.isFinite(value) && value > 0;

/**
 * Which rectangle of the uploaded image survives a centred cover crop into a
 * box of viewW x viewH? Returned in upload pixels.
 */
export function visibleSourceRect({ uploadW, uploadH, viewW, viewH }) {
  if (![uploadW, uploadH, viewW, viewH].every(isPositive)) {
    return { error: "Upload size and display size must all be greater than zero." };
  }
  const scale = Math.max(viewW / uploadW, viewH / uploadH);
  const w = Math.min(uploadW, viewW / scale);
  const h = Math.min(uploadH, viewH / scale);
  return {
    x: (uploadW - w) / 2,
    y: (uploadH - h) / 2,
    w,
    h,
    scale,
    keptPct: ((w * h) / (uploadW * uploadH)) * 100,
  };
}

/** Intersection of two axis-aligned rectangles. Empty overlap returns zero size. */
export function intersectRects(a, b) {
  if (!a || !b || a.error || b.error) return { error: "Both rectangles must be valid." };
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  return { x: x1, y: y1, w: Math.max(0, x2 - x1), h: Math.max(0, y2 - y1) };
}

/**
 * The region of the upload visible in EVERY view Facebook renders.
 * Anything you must not lose — headline, logo, phone number — belongs here.
 */
export function computeSafeZone({ uploadW, uploadH, views }) {
  if (!isPositive(uploadW) || !isPositive(uploadH)) {
    return { error: "Upload width and height must be greater than zero." };
  }
  if (!Array.isArray(views) || views.length === 0) {
    return { error: "Add at least one display size to compare." };
  }

  const rects = [];
  for (const view of views) {
    const rect = visibleSourceRect({ uploadW, uploadH, viewW: view.w, viewH: view.h });
    if (rect.error) return rect;
    rects.push({ ...rect, id: view.id, label: view.label });
  }

  let zone = { x: rects[0].x, y: rects[0].y, w: rects[0].w, h: rects[0].h };
  for (let i = 1; i < rects.length; i += 1) {
    zone = intersectRects(zone, rects[i]);
    if (zone.error) return zone;
  }

  return {
    rects,
    zone,
    safePctW: (zone.w / uploadW) * 100,
    safePctH: (zone.h / uploadH) * 100,
    safePctArea: ((zone.w * zone.h) / (uploadW * uploadH)) * 100,
    marginLeft: zone.x,
    marginRight: uploadW - (zone.x + zone.w),
    marginTop: zone.y,
    marginBottom: uploadH - (zone.y + zone.h),
  };
}

/**
 * Map the desktop profile-picture clearance box into upload pixels, so you can
 * see how much of your artwork sits behind the avatar.
 */
export function avatarClearance({ uploadW, uploadH, desktopViewW = 820 }) {
  if (!isPositive(uploadW) || !isPositive(uploadH) || !isPositive(desktopViewW)) {
    return { error: "Upload size and desktop width must be greater than zero." };
  }
  const pxPerDisplayPx = uploadW / desktopViewW;
  const size = AVATAR_DISPLAY_SIZE * pxPerDisplayPx;
  const left = AVATAR_DISPLAY_LEFT * pxPerDisplayPx;
  return {
    x: left,
    y: Math.max(0, uploadH - size + AVATAR_DISPLAY_BOTTOM * pxPerDisplayPx),
    w: size,
    h: Math.min(size, uploadH),
    keepClearRight: left + size,
  };
}

/** How badly the source has to be stretched to fill the upload size. */
export function assessQuality({ srcW, srcH, uploadW, uploadH }) {
  if (![srcW, srcH, uploadW, uploadH].every(isPositive)) {
    return { error: "Artwork and upload sizes must all be greater than zero." };
  }
  const scale = Math.max(uploadW / srcW, uploadH / srcH);
  if (scale > BAD_UPSCALE_LIMIT) {
    return {
      scale,
      verdict: "poor",
      note: `Artwork is stretched ${scale.toFixed(2)}x — it will look blurry. Supply at least ${Math.ceil(uploadW)} x ${Math.ceil(uploadH)} px.`,
    };
  }
  if (scale > SOFT_UPSCALE_LIMIT) {
    return {
      scale,
      verdict: "soft",
      note: `Artwork is stretched ${scale.toFixed(2)}x — acceptable, but detail will soften.`,
    };
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

/** Full report for one preset and one source image. */
export function buildCoverReport({ presetId, srcW, srcH }) {
  const preset = FACEBOOK_COVER_PRESETS.find((item) => item.id === presetId);
  if (!preset) return { error: "Pick one of the Facebook cover types." };
  if (!isPositive(srcW) || !isPositive(srcH)) {
    return { error: "Enter the artwork width and height in pixels, or upload an image." };
  }

  const safe = computeSafeZone({ uploadW: preset.uploadW, uploadH: preset.uploadH, views: preset.views });
  if (safe.error) return safe;
  const quality = assessQuality({ srcW, srcH, uploadW: preset.uploadW, uploadH: preset.uploadH });
  if (quality.error) return quality;
  const avatar = avatarClearance({ uploadW: preset.uploadW, uploadH: preset.uploadH });

  return { preset, ...safe, quality, avatar };
}
