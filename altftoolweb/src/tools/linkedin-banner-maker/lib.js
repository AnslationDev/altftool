/**
 * LinkedIn banner geometry.
 *
 * Canvas sizes are LinkedIn's published recommendations. The avatar overlap and the edge trim are
 * geometry that LinkedIn does not publish as numbers, so they are expressed as adjustable shares
 * of the canvas with defaults measured from the current desktop layout — change them if the
 * layout moves.
 *
 * The safe zone is computed, not guessed: the avatar is treated as a circular exclusion, and the
 * two candidate text rectangles (to the right of the avatar, and above it) are measured so you
 * can pick the larger one.
 */

/** LinkedIn's recommended upload sizes for each surface. */
export const SURFACES = [
  {
    id: "personal",
    label: "Personal profile background",
    width: 1584,
    height: 396,
    ratio: "4:1",
    // Profile photo renders as a circle overlapping the lower-left of the banner on desktop.
    avatarDiameterShare: 0.55,
    avatarCenterXShare: 0.1,
    avatarCenterYShare: 1,
    note: "LinkedIn recommends 1584 x 396 px (4:1) for the profile background image.",
  },
  {
    id: "company",
    label: "Company page cover",
    width: 1128,
    height: 191,
    ratio: "5.9:1",
    // The company logo sits below the cover rather than over it, so there is no exclusion circle.
    avatarDiameterShare: 0,
    avatarCenterXShare: 0.08,
    avatarCenterYShare: 1,
    note: "LinkedIn recommends 1128 x 191 px for the company page cover; the 300 x 300 logo sits below it.",
  },
];

/** LinkedIn's stated upper bound for a background image file. */
export const MAX_FILE_MB = 8;

/** Accepted upload formats for LinkedIn images. */
export const ACCEPTED_FORMATS = ["JPG", "PNG", "GIF (first frame only)"];

/**
 * No standard sets a minimum font size. 12 CSS pixels is the practical floor below which UI text
 * becomes uncomfortable, so it is used to judge the banner once LinkedIn scales it down.
 */
export const MIN_LEGIBLE_PX = 12;
export const COMFORTABLE_PX = 16;

/** Typical rendered width of the profile background in a desktop browser at a 1280 px viewport. */
export const TYPICAL_RENDER_WIDTH = 1128;

export const CANVAS_MIN = 100;
export const CANVAS_MAX = 6000;

function round(value, places = 1) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function rect(x, y, width, height) {
  return {
    x: round(x),
    y: round(y),
    width: round(Math.max(0, width)),
    height: round(Math.max(0, height)),
    area: round(Math.max(0, width) * Math.max(0, height)),
  };
}

/**
 * Plan a LinkedIn banner.
 * @returns geometry object, or { error } when the canvas cannot be laid out.
 */
export function planBanner(options = {}) {
  const {
    surfaceId = "personal",
    width,
    height,
    avatarDiameterShare,
    avatarCenterXShare,
    edgeTrimShare = 0.02,
    padding = 24,
    headlineSize = 64,
    renderWidth = TYPICAL_RENDER_WIDTH,
    fileSizeMb = 1.5,
  } = options;

  const surface = SURFACES.find((item) => item.id === surfaceId) || SURFACES[0];

  const w = Number(width ?? surface.width);
  const h = Number(height ?? surface.height);
  const avatarShare = Number(avatarDiameterShare ?? surface.avatarDiameterShare);
  const avatarX = Number(avatarCenterXShare ?? surface.avatarCenterXShare);
  const trim = Number(edgeTrimShare);
  const pad = Number(padding);
  const fontSize = Number(headlineSize);
  const rw = Number(renderWidth);
  const fileMb = Number(fileSizeMb);

  const nums = {
    "canvas width": w,
    "canvas height": h,
    "avatar diameter": avatarShare,
    "avatar position": avatarX,
    "edge trim": trim,
    padding: pad,
    "headline size": fontSize,
    "rendered width": rw,
    "file size": fileMb,
  };
  for (const [key, value] of Object.entries(nums)) {
    if (!Number.isFinite(value)) return { error: `Enter a valid number for ${key}.` };
  }
  if (w < CANVAS_MIN || w > CANVAS_MAX || h < CANVAS_MIN || h > CANVAS_MAX) {
    return { error: `Canvas width and height must be between ${CANVAS_MIN} and ${CANVAS_MAX} pixels.` };
  }
  if (avatarShare < 0 || avatarShare > 2) {
    return { error: "Avatar diameter should be between 0 and 2 times the banner height." };
  }
  if (avatarX < 0 || avatarX > 1) {
    return { error: "Avatar horizontal position must be between 0 and 1 (a share of the width)." };
  }
  if (trim < 0 || trim > 0.4) {
    return { error: "Edge trim should be between 0% and 40% of each side." };
  }
  if (pad < 0 || pad > Math.min(w, h) / 2) {
    return { error: "Padding is larger than half the canvas — reduce it." };
  }
  if (fontSize <= 0 || fontSize > 600) {
    return { error: "Headline size must be between 1 and 600 pixels." };
  }
  if (rw < 100 || rw > 4000) {
    return { error: "Rendered width should be between 100 and 4000 pixels." };
  }
  if (fileMb < 0 || fileMb > 200) {
    return { error: "File size should be between 0 and 200 MB." };
  }

  const trimX = w * trim;
  const trimY = h * trim;
  const inner = rect(trimX, trimY, w - trimX * 2, h - trimY * 2);
  if (!(inner.width > 0) || !(inner.height > 0)) {
    return { error: "The edge trim removes the whole canvas — lower it." };
  }

  const radius = (h * avatarShare) / 2;
  const cx = w * avatarX;
  const cy = h * Number(surface.avatarCenterYShare);
  const avatar = { cx: round(cx), cy: round(cy), r: round(radius), diameter: round(radius * 2) };

  // With no avatar overlap (company covers) the exclusion disappears entirely.
  const hasAvatar = radius > 0;
  const avatarRight = hasAvatar ? cx + radius : -Infinity;
  const avatarTop = hasAvatar ? cy - radius : Infinity;

  const innerRight = inner.x + inner.width;
  const innerBottom = inner.y + inner.height;

  const rightRect = rect(
    Math.max(inner.x, avatarRight + pad),
    inner.y + pad,
    innerRight - Math.max(inner.x, avatarRight + pad) - pad,
    inner.height - pad * 2,
  );
  const topRect = rect(
    inner.x + pad,
    inner.y + pad,
    inner.width - pad * 2,
    Math.min(innerBottom, avatarTop - pad) - (inner.y + pad),
  );

  const best = rightRect.area >= topRect.area ? "right" : "top";
  const recommended = best === "right" ? rightRect : topRect;
  const canvasArea = w * h;

  const scale = rw / w;
  const renderedHeadlinePx = fontSize * scale;

  const warnings = [];
  if (renderedHeadlinePx < MIN_LEGIBLE_PX) {
    warnings.push(
      `At a ${round(rw)} px rendered width a ${round(fontSize)} px headline shows at about ${round(renderedHeadlinePx)} px, under the ${MIN_LEGIBLE_PX} px practical floor. Increase the type size.`,
    );
  } else if (renderedHeadlinePx < COMFORTABLE_PX) {
    warnings.push(
      `The headline lands at about ${round(renderedHeadlinePx)} px on screen — legible but tight. Aim for ${COMFORTABLE_PX} px or more.`,
    );
  }
  if (fileMb > MAX_FILE_MB) {
    warnings.push(
      `${round(fileMb, 2)} MB is over LinkedIn's ${MAX_FILE_MB} MB limit for a background image. Export a JPEG at quality 80 instead of a PNG.`,
    );
  }
  if (recommended.area / canvasArea < 0.35) {
    warnings.push(
      "The usable text zone is under 35% of the canvas. Move the focal artwork to that zone rather than centring it, or the avatar will sit on top of it.",
    );
  }
  if (Math.abs(w / h - surface.width / surface.height) > 0.05) {
    warnings.push(
      `This canvas is ${round(w / h, 2)}:1 but the ${surface.label.toLowerCase()} is ${surface.ratio}. LinkedIn will crop or letterbox the difference.`,
    );
  }
  if (surface.id === "personal" && avatarShare === 0) {
    warnings.push(
      "The avatar exclusion is set to zero. On a personal profile the photo does overlap the banner — leave some allowance for it.",
    );
  }

  const guideSvg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none">`,
    `  <rect x="0" y="0" width="${w}" height="${h}" stroke="currentColor" stroke-width="2" opacity="0.4" />`,
    `  <rect x="${inner.x}" y="${inner.y}" width="${inner.width}" height="${inner.height}" stroke="currentColor" stroke-dasharray="12 8" stroke-width="2" opacity="0.6" />`,
    avatar.r > 0
      ? `  <circle cx="${avatar.cx}" cy="${avatar.cy}" r="${avatar.r}" stroke="currentColor" stroke-width="3" stroke-dasharray="10 8" />`
      : "",
    `  <rect x="${recommended.x}" y="${recommended.y}" width="${recommended.width}" height="${recommended.height}" stroke="currentColor" stroke-width="4" />`,
    `</svg>`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    surface: surface.label,
    surfaceNote: surface.note,
    width: w,
    height: h,
    ratio: round(w / h, 2),
    recommendedRatio: surface.ratio,
    inner,
    avatar,
    rightRect,
    topRect,
    recommended,
    recommendedSide: best,
    safeAreaShare: round(recommended.area / canvasArea, 4),
    renderWidth: rw,
    renderScale: round(scale, 4),
    renderedHeadlinePx: round(renderedHeadlinePx),
    maxFileMb: MAX_FILE_MB,
    fileSizeMb: round(fileMb, 2),
    fileSizeOk: fileMb <= MAX_FILE_MB,
    guideSvg,
    warnings,
  };
}

/** Plain-text summary for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [
    "LinkedIn banner plan",
    `${result.surface}: ${result.width} x ${result.height} px (${result.ratio}:1, recommended ${result.recommendedRatio})`,
    `Avatar exclusion: ${result.avatar.diameter} px circle centred at ${result.avatar.cx}, ${result.avatar.cy}`,
    `Safe text zone (${result.recommendedSide === "right" ? "right of the avatar" : "above the avatar"}): ${result.recommended.width} x ${result.recommended.height} px at ${result.recommended.x}, ${result.recommended.y}`,
    `That is ${Math.round(result.safeAreaShare * 100)}% of the canvas`,
    `Headline renders at about ${result.renderedHeadlinePx} px on a ${result.renderWidth} px wide profile`,
    `File size: ${result.fileSizeMb} MB of ${result.maxFileMb} MB allowed`,
  ];
  for (const warning of result.warnings) lines.push(`- ${warning}`);
  return lines.join("\n");
}
