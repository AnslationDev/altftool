/**
 * X (Twitter) header geometry.
 *
 * The canvas size is X's published recommendation: 1500 x 500 pixels, a 3:1 ratio, with a
 * 400 x 400 circular profile photo. Two things eat into that canvas and neither is published as a
 * number, so both are adjustable shares of the canvas with defaults measured from the current
 * layout:
 *   1. the profile photo, which straddles the bottom edge of the header on the left;
 *   2. the translucent top bar that the mobile app draws over the header when you scroll.
 *
 * Given those two exclusions the module measures the two candidate text rectangles — to the right
 * of the avatar, and the full-width band between the top bar and the top of the avatar — and
 * returns the larger.
 */

/** X's recommended header canvas. */
export const HEADER_WIDTH = 1500;
export const HEADER_HEIGHT = 500;
export const HEADER_RATIO = 3;

/** X's recommended profile photo, rendered as a circle. */
export const AVATAR_UPLOAD_SIZE = 400;

/** Practical file-size guidance. X accepts JPG, PNG and GIF for the header. */
export const SUGGESTED_MAX_FILE_MB = 5;
export const ACCEPTED_FORMATS = ["JPG", "PNG", "GIF (static frame used)"];

/** Practical legibility floor and comfort target for rendered text. */
export const MIN_LEGIBLE_PX = 12;
export const COMFORTABLE_PX = 16;

/** Typical rendered width of the header in the profile column on a desktop browser. */
export const TYPICAL_RENDER_WIDTH = 600;

export const PRESETS = [
  { id: "standard", label: "X header — 1500 × 500", width: 1500, height: 500 },
  { id: "retina", label: "Double resolution — 3000 × 1000", width: 3000, height: 1000 },
  { id: "legacy", label: "Legacy 1200 × 400 artwork", width: 1200, height: 400 },
];

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

/**
 * Plan an X header.
 * @returns geometry object, or { error } for input that cannot be laid out.
 */
export function planHeader(options = {}) {
  const {
    width = HEADER_WIDTH,
    height = HEADER_HEIGHT,
    avatarDiameterShare = 0.66,
    avatarCenterXShare = 0.115,
    topBarShare = 0.12,
    edgeTrimShare = 0.02,
    padding = 24,
    headlineSize = 72,
    renderWidth = TYPICAL_RENDER_WIDTH,
    fileSizeMb = 1.2,
  } = options;

  const values = {
    "canvas width": Number(width),
    "canvas height": Number(height),
    "avatar diameter": Number(avatarDiameterShare),
    "avatar position": Number(avatarCenterXShare),
    "top bar height": Number(topBarShare),
    "edge trim": Number(edgeTrimShare),
    padding: Number(padding),
    "headline size": Number(headlineSize),
    "rendered width": Number(renderWidth),
    "file size": Number(fileSizeMb),
  };
  for (const [key, value] of Object.entries(values)) {
    if (!Number.isFinite(value)) return { error: `Enter a valid number for ${key}.` };
  }

  const w = values["canvas width"];
  const h = values["canvas height"];
  const avatarShare = values["avatar diameter"];
  const avatarX = values["avatar position"];
  const barShare = values["top bar height"];
  const trim = values["edge trim"];
  const pad = values.padding;
  const fontSize = values["headline size"];
  const rw = values["rendered width"];
  const fileMb = values["file size"];

  if (w < CANVAS_MIN || w > CANVAS_MAX || h < CANVAS_MIN || h > CANVAS_MAX) {
    return { error: `Canvas width and height must be between ${CANVAS_MIN} and ${CANVAS_MAX} pixels.` };
  }
  if (avatarShare < 0 || avatarShare > 2) {
    return { error: "Avatar diameter should be between 0 and 2 times the header height." };
  }
  if (avatarX < 0 || avatarX > 1) {
    return { error: "Avatar horizontal position must be between 0 and 1 (a share of the width)." };
  }
  if (barShare < 0 || barShare > 0.5) {
    return { error: "The top bar should cover between 0% and 50% of the header height." };
  }
  if (trim < 0 || trim > 0.4) return { error: "Edge trim should be between 0% and 40% of each side." };
  if (pad < 0 || pad > Math.min(w, h) / 2) {
    return { error: "Padding is larger than half the canvas — reduce it." };
  }
  if (fontSize <= 0 || fontSize > 600) {
    return { error: "Headline size must be between 1 and 600 pixels." };
  }
  if (rw < 100 || rw > 4000) return { error: "Rendered width should be between 100 and 4000 pixels." };
  if (fileMb < 0 || fileMb > 200) return { error: "File size should be between 0 and 200 MB." };

  const trimX = w * trim;
  const trimY = h * trim;
  const inner = rect(trimX, trimY, w - trimX * 2, h - trimY * 2);
  if (!(inner.width > 0) || !(inner.height > 0)) {
    return { error: "The edge trim removes the whole canvas — lower it." };
  }

  const innerRight = inner.x + inner.width;
  const innerBottom = inner.y + inner.height;

  const barHeight = h * barShare;
  const topBar = rect(0, 0, w, barHeight);

  const radius = (h * avatarShare) / 2;
  const cx = w * avatarX;
  const cy = h; // The circle is centred on the bottom edge of the header.
  const hasAvatar = radius > 0;
  const avatar = { cx: round(cx), cy: round(cy), r: round(radius), diameter: round(radius * 2) };
  const avatarRight = hasAvatar ? cx + radius : -Infinity;
  const avatarTop = hasAvatar ? cy - radius : Infinity;

  const contentTop = Math.max(inner.y, barHeight) + pad;

  const rightRect = rect(
    Math.max(inner.x, avatarRight + pad),
    contentTop,
    innerRight - Math.max(inner.x, avatarRight + pad) - pad,
    innerBottom - contentTop - pad,
  );
  const bandRect = rect(
    inner.x + pad,
    contentTop,
    inner.width - pad * 2,
    Math.min(innerBottom, avatarTop - pad) - contentTop,
  );

  const best = rightRect.area >= bandRect.area ? "right" : "band";
  const recommended = best === "right" ? rightRect : bandRect;
  const canvasArea = w * h;

  const scale = rw / w;
  const renderedHeadlinePx = fontSize * scale;

  const warnings = [];
  if (Math.abs(w / h - HEADER_RATIO) > 0.05) {
    warnings.push(
      `This canvas is ${round(w / h, 2)}:1 but X crops headers to 3:1. Export at ${HEADER_WIDTH} × ${HEADER_HEIGHT} (or an exact multiple) so nothing is trimmed.`,
    );
  }
  if (renderedHeadlinePx < MIN_LEGIBLE_PX) {
    warnings.push(
      `At a ${round(rw)} px column width a ${round(fontSize)} px headline shows at about ${round(renderedHeadlinePx)} px, under the ${MIN_LEGIBLE_PX} px practical floor.`,
    );
  } else if (renderedHeadlinePx < COMFORTABLE_PX) {
    warnings.push(
      `The headline lands at about ${round(renderedHeadlinePx)} px on screen — readable but tight. Aim for ${COMFORTABLE_PX} px or more.`,
    );
  }
  if (fileMb > SUGGESTED_MAX_FILE_MB) {
    warnings.push(
      `${round(fileMb, 2)} MB is larger than the ${SUGGESTED_MAX_FILE_MB} MB most uploads stay under. Re-export as JPEG at quality 80.`,
    );
  }
  if (recommended.area / canvasArea < 0.3) {
    warnings.push(
      "Less than 30% of the header is usable once the avatar and the top bar are accounted for. Treat the header as texture and put the message in your bio instead.",
    );
  }
  if (barShare === 0) {
    warnings.push(
      "The top bar allowance is zero. The mobile app draws a translucent bar with your name over the top of the header when the profile scrolls — leave some room for it.",
    );
  }

  const guideSvg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none">`,
    `  <rect x="0" y="0" width="${w}" height="${h}" stroke="currentColor" stroke-width="2" opacity="0.4" />`,
    barHeight > 0
      ? `  <rect x="0" y="0" width="${w}" height="${round(barHeight)}" stroke="currentColor" stroke-width="2" stroke-dasharray="10 8" opacity="0.6" />`
      : "",
    `  <rect x="${inner.x}" y="${inner.y}" width="${inner.width}" height="${inner.height}" stroke="currentColor" stroke-width="2" stroke-dasharray="14 10" opacity="0.6" />`,
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
    ratio: round(w / h, 2),
    recommendedSize: `${HEADER_WIDTH} × ${HEADER_HEIGHT}`,
    avatarUploadSize: AVATAR_UPLOAD_SIZE,
    inner,
    topBar,
    avatar,
    rightRect,
    bandRect,
    recommended,
    recommendedSide: best,
    safeAreaShare: round(recommended.area / canvasArea, 4),
    renderWidth: rw,
    renderScale: round(scale, 4),
    renderedHeadlinePx: round(renderedHeadlinePx),
    fileSizeMb: round(fileMb, 2),
    suggestedMaxFileMb: SUGGESTED_MAX_FILE_MB,
    fileSizeOk: fileMb <= SUGGESTED_MAX_FILE_MB,
    guideSvg,
    warnings,
  };
}

/** Plain-text summary for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [
    "X header plan",
    `Canvas: ${result.width} × ${result.height} px (${result.ratio}:1; X uses ${result.recommendedSize})`,
    `Avatar exclusion: ${result.avatar.diameter} px circle centred at ${result.avatar.cx}, ${result.avatar.cy}`,
    `Top bar allowance: ${result.topBar.height} px`,
    `Safe text zone (${result.recommendedSide === "right" ? "right of the avatar" : "band above the avatar"}): ${result.recommended.width} × ${result.recommended.height} px at ${result.recommended.x}, ${result.recommended.y}`,
    `That is ${Math.round(result.safeAreaShare * 100)}% of the canvas`,
    `Headline renders at about ${result.renderedHeadlinePx} px in a ${result.renderWidth} px column`,
  ];
  for (const warning of result.warnings) lines.push(`- ${warning}`);
  return lines.join("\n");
}
