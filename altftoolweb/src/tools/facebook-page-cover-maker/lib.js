/**
 * Facebook page cover geometry.
 *
 * The defining problem is that one uploaded file is shown at two different aspect ratios:
 * 820 x 312 on desktop (2.628:1) and 640 x 360 on a phone (1.778:1). Facebook centre-crops to
 * whichever ratio the surface needs, so the region guaranteed to be visible everywhere is the
 * intersection of the two centred crops. Anything outside it is cropped on one device or the other.
 *
 * On desktop the circular page profile photo also overlaps the lower left of the cover; on mobile
 * it sits below the cover instead. The exclusion is therefore modelled on the desktop crop only.
 */

/** Facebook's stated display sizes for a page cover photo. */
export const DESKTOP_DISPLAY = { width: 820, height: 312 };
export const MOBILE_DISPLAY = { width: 640, height: 360 };

/** Twice the desktop display size — the usual upload target for a crisp cover. */
export const RECOMMENDED_UPLOAD = { width: 1640, height: 624 };

/** Facebook's stated minimum upload dimensions for a page cover. */
export const MIN_UPLOAD = { width: 400, height: 150 };

/** The page profile photo: 170 px on desktop, 128 px on a phone, uploaded at 320 x 320. */
export const PROFILE_PHOTO = { desktop: 170, mobile: 128, upload: 320 };

export const UPLOAD_PRESETS = [
  { id: "recommended", label: "Recommended 1640 × 624", width: 1640, height: 624 },
  { id: "display", label: "Exact desktop size 820 × 312", width: 820, height: 312 },
  { id: "tall", label: "Tall, mobile-first 1640 × 923", width: 1640, height: 923 },
];

/** Practical legibility floor and comfort target for rendered text. */
export const MIN_LEGIBLE_PX = 12;
export const COMFORTABLE_PX = 16;

export const CANVAS_MIN = 100;
export const CANVAS_MAX = 6000;

function round(value, places = 1) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function rect(x, y, width, height) {
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  return { x: round(x), y: round(y), width: round(w), height: round(h), area: round(w * h) };
}

/** Centred crop of a canvas to a target aspect ratio. */
export function centreCrop(width, height, ratio) {
  if (!(width > 0) || !(height > 0) || !(ratio > 0)) return rect(0, 0, 0, 0);
  if (width / height > ratio) {
    const cropWidth = height * ratio;
    return rect((width - cropWidth) / 2, 0, cropWidth, height);
  }
  const cropHeight = width / ratio;
  return rect(0, (height - cropHeight) / 2, width, cropHeight);
}

/**
 * Plan a Facebook page cover.
 * @returns geometry object, or { error } for input that cannot be laid out.
 */
export function planCover(options = {}) {
  const {
    width = RECOMMENDED_UPLOAD.width,
    height = RECOMMENDED_UPLOAD.height,
    padding = 24,
    showProfilePhoto = true,
    avatarCenterXShare = 0.1,
    headlineSize = 72,
    renderWidth = DESKTOP_DISPLAY.width,
    fileSizeMb = 1.2,
  } = options;

  const values = {
    "canvas width": Number(width),
    "canvas height": Number(height),
    padding: Number(padding),
    "profile photo position": Number(avatarCenterXShare),
    "headline size": Number(headlineSize),
    "rendered width": Number(renderWidth),
    "file size": Number(fileSizeMb),
  };
  for (const [key, value] of Object.entries(values)) {
    if (!Number.isFinite(value)) return { error: `Enter a valid number for ${key}.` };
  }

  const w = values["canvas width"];
  const h = values["canvas height"];
  const pad = values.padding;
  const avatarX = values["profile photo position"];
  const fontSize = values["headline size"];
  const rw = values["rendered width"];
  const fileMb = values["file size"];

  if (w < CANVAS_MIN || w > CANVAS_MAX || h < CANVAS_MIN || h > CANVAS_MAX) {
    return { error: `Canvas width and height must be between ${CANVAS_MIN} and ${CANVAS_MAX} pixels.` };
  }
  if (pad < 0 || pad > Math.min(w, h) / 2) {
    return { error: "Padding is larger than half the canvas — reduce it." };
  }
  if (avatarX < 0 || avatarX > 1) {
    return { error: "Profile photo position must be between 0 and 1 (a share of the width)." };
  }
  if (fontSize <= 0 || fontSize > 600) {
    return { error: "Headline size must be between 1 and 600 pixels." };
  }
  if (rw < 100 || rw > 4000) return { error: "Rendered width should be between 100 and 4000 pixels." };
  if (fileMb < 0 || fileMb > 200) return { error: "File size should be between 0 and 200 MB." };

  const desktopRatio = DESKTOP_DISPLAY.width / DESKTOP_DISPLAY.height;
  const mobileRatio = MOBILE_DISPLAY.width / MOBILE_DISPLAY.height;

  const desktopCrop = centreCrop(w, h, desktopRatio);
  const mobileCrop = centreCrop(w, h, mobileRatio);

  const safeWidth = Math.min(desktopCrop.width, mobileCrop.width);
  const safeHeight = Math.min(desktopCrop.height, mobileCrop.height);
  const safeBox = rect((w - safeWidth) / 2, (h - safeHeight) / 2, safeWidth, safeHeight);
  if (!(safeBox.width > 0) || !(safeBox.height > 0)) {
    return { error: "Neither crop leaves any usable area — check the canvas dimensions." };
  }

  // Desktop scales the cover so its crop fills 820 px; the 170 px photo scales with it.
  const desktopScale = desktopCrop.width / DESKTOP_DISPLAY.width;
  const avatarRadius = showProfilePhoto ? (PROFILE_PHOTO.desktop * desktopScale) / 2 : 0;
  const avatarCx = w * avatarX;
  const avatarCy = desktopCrop.y + desktopCrop.height;
  const avatar = {
    cx: round(avatarCx),
    cy: round(avatarCy),
    r: round(avatarRadius),
    diameter: round(avatarRadius * 2),
  };
  const hasAvatar = avatarRadius > 0;
  const avatarRight = hasAvatar ? avatarCx + avatarRadius : -Infinity;
  const avatarTop = hasAvatar ? avatarCy - avatarRadius : Infinity;

  const safeRight = safeBox.x + safeBox.width;
  const safeBottom = safeBox.y + safeBox.height;

  const rightRect = rect(
    Math.max(safeBox.x, avatarRight + pad),
    safeBox.y + pad,
    safeRight - Math.max(safeBox.x, avatarRight + pad) - pad,
    safeBox.height - pad * 2,
  );
  const topRect = rect(
    safeBox.x + pad,
    safeBox.y + pad,
    safeBox.width - pad * 2,
    Math.min(safeBottom, avatarTop - pad) - (safeBox.y + pad),
  );

  const best = rightRect.area >= topRect.area ? "right" : "top";
  const recommended = best === "right" ? rightRect : topRect;

  const canvasArea = w * h;
  const scale = rw / w;
  const renderedHeadlinePx = fontSize * scale;

  const croppedEachSideOnMobile = round((w - mobileCrop.width) / 2);
  const croppedTopBottomOnDesktop = round((h - desktopCrop.height) / 2);

  const warnings = [];
  if (w < MIN_UPLOAD.width || h < MIN_UPLOAD.height) {
    warnings.push(
      `Facebook requires at least ${MIN_UPLOAD.width} × ${MIN_UPLOAD.height} px for a page cover; this canvas is smaller and will be rejected or upscaled.`,
    );
  }
  if (w < RECOMMENDED_UPLOAD.width) {
    warnings.push(
      `Uploading below ${RECOMMENDED_UPLOAD.width} px wide means the cover is upscaled on high-density screens. Export at ${RECOMMENDED_UPLOAD.width} × ${RECOMMENDED_UPLOAD.height} for a sharp result.`,
    );
  }
  if (renderedHeadlinePx < MIN_LEGIBLE_PX) {
    warnings.push(
      `A ${round(fontSize)} px headline shows at about ${round(renderedHeadlinePx)} px once the cover is displayed at ${round(rw)} px wide — below the ${MIN_LEGIBLE_PX} px practical floor.`,
    );
  } else if (renderedHeadlinePx < COMFORTABLE_PX) {
    warnings.push(
      `The headline lands at about ${round(renderedHeadlinePx)} px on screen. Aim for ${COMFORTABLE_PX} px or more.`,
    );
  }
  if (croppedEachSideOnMobile > 0) {
    warnings.push(
      `Phones crop ${croppedEachSideOnMobile} px from each side of this canvas. Keep logos and type inside the highlighted safe box.`,
    );
  }
  if (croppedTopBottomOnDesktop > 0) {
    warnings.push(
      `Desktop crops ${croppedTopBottomOnDesktop} px from the top and bottom. A taller canvas gains mobile height but loses it on desktop.`,
    );
  }
  if (fileMb > 8) {
    warnings.push(
      `${round(fileMb, 2)} MB is heavier than a cover needs to be. Export JPEG at quality 80 — Facebook re-compresses anyway, and starting smaller avoids a second lossy pass.`,
    );
  }

  const guideSvg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none">`,
    `  <rect x="0" y="0" width="${w}" height="${h}" stroke="currentColor" stroke-width="2" opacity="0.4" />`,
    `  <rect x="${mobileCrop.x}" y="${mobileCrop.y}" width="${mobileCrop.width}" height="${mobileCrop.height}" stroke="currentColor" stroke-width="2" stroke-dasharray="16 10" opacity="0.6" />`,
    `  <rect x="${desktopCrop.x}" y="${desktopCrop.y}" width="${desktopCrop.width}" height="${desktopCrop.height}" stroke="currentColor" stroke-width="2" stroke-dasharray="6 8" opacity="0.6" />`,
    hasAvatar
      ? `  <circle cx="${avatar.cx}" cy="${avatar.cy}" r="${avatar.r}" stroke="currentColor" stroke-width="4" stroke-dasharray="12 10" />`
      : "",
    `  <rect x="${recommended.x}" y="${recommended.y}" width="${recommended.width}" height="${recommended.height}" stroke="currentColor" stroke-width="5" />`,
    `</svg>`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    width: w,
    height: h,
    ratio: round(w / h, 3),
    desktopCrop,
    mobileCrop,
    safeBox,
    safeShare: round(safeBox.area / canvasArea, 4),
    avatar,
    rightRect,
    topRect,
    recommended,
    recommendedSide: best,
    recommendedShare: round(recommended.area / canvasArea, 4),
    croppedEachSideOnMobile,
    croppedTopBottomOnDesktop,
    renderWidth: rw,
    renderScale: round(scale, 4),
    renderedHeadlinePx: round(renderedHeadlinePx),
    fileSizeMb: round(fileMb, 2),
    guideSvg,
    warnings,
  };
}

/** Plain-text summary for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [
    "Facebook page cover plan",
    `Canvas: ${result.width} × ${result.height} px (${result.ratio}:1)`,
    `Desktop crop: ${result.desktopCrop.width} × ${result.desktopCrop.height} px`,
    `Mobile crop: ${result.mobileCrop.width} × ${result.mobileCrop.height} px`,
    `Visible on both: ${result.safeBox.width} × ${result.safeBox.height} px at ${result.safeBox.x}, ${result.safeBox.y} (${Math.round(result.safeShare * 100)}% of the canvas)`,
    `Cropped on mobile: ${result.croppedEachSideOnMobile} px from each side`,
    `Cropped on desktop: ${result.croppedTopBottomOnDesktop} px top and bottom`,
    `Safe text zone (${result.recommendedSide === "right" ? "right of the profile photo" : "above the profile photo"}): ${result.recommended.width} × ${result.recommended.height} px at ${result.recommended.x}, ${result.recommended.y}`,
    `Headline renders at about ${result.renderedHeadlinePx} px at ${result.renderWidth} px wide`,
  ];
  for (const warning of result.warnings) lines.push(`- ${warning}`);
  return lines.join("\n");
}
