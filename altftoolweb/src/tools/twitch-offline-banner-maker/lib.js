/**
 * Twitch offline screen (video player banner) layout.
 *
 * Twitch shows the offline banner inside the video player, so the usable area is the 1920 x 1080
 * canvas minus two things: an edge margin, because the player is letterboxed differently on
 * different viewports, and the control bar Twitch draws across the bottom of the player. Neither
 * the control-bar height nor the margin is published as a number, so both are adjustable shares of
 * the canvas with defaults measured from the current player.
 *
 * Inside the remaining area the module lays out an even grid of information blocks — schedule,
 * socials, next stream, sponsors — and reports the cell size and the rendered type size once the
 * player scales the banner down.
 */

/** Twitch's stated size for the video player banner shown when a channel is offline. */
export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;
export const CANVAS_RATIO = 16 / 9;

/** Twitch's stated maximum file size for the offline banner and the profile image. */
export const MAX_FILE_MB = 10;
export const ACCEPTED_FORMATS = ["JPG", "PNG", "GIF (static frame used)"];

/** Other channel artwork sizes, for reference while you build a set. */
export const RELATED_ASSETS = [
  { label: "Profile banner", width: 1200, height: 480 },
  { label: "Profile picture", width: 256, height: 256 },
  { label: "Channel panel image", width: 320, height: 300 },
];

/** Practical legibility floor and comfort target for rendered text. */
export const MIN_LEGIBLE_PX = 12;
export const COMFORTABLE_PX = 16;

/** Typical width of the Twitch player on a 1440 px desktop window with the chat sidebar open. */
export const TYPICAL_RENDER_WIDTH = 940;

export const PRESETS = [
  { id: "offline", label: "Offline screen — 1920 × 1080", width: 1920, height: 1080 },
  { id: "banner", label: "Profile banner — 1200 × 480", width: 1200, height: 480 },
  { id: "panel", label: "Channel panel — 320 × 300", width: 320, height: 300 },
];

export const CANVAS_MIN = 100;
export const CANVAS_MAX = 6000;
export const MAX_BLOCKS = 12;

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
 * Plan an offline screen.
 * @returns geometry object, or { error } for input that cannot be laid out.
 */
export function planOfflineScreen(options = {}) {
  const {
    width = CANVAS_WIDTH,
    height = CANVAS_HEIGHT,
    controlBarShare = 0.09,
    edgeTrimShare = 0.03,
    padding = 40,
    blocks = 3,
    columns = 3,
    gutter = 32,
    headingSize = 64,
    bodySize = 34,
    renderWidth = TYPICAL_RENDER_WIDTH,
    fileSizeMb = 2.4,
  } = options;

  const values = {
    "canvas width": Number(width),
    "canvas height": Number(height),
    "control bar height": Number(controlBarShare),
    "edge trim": Number(edgeTrimShare),
    padding: Number(padding),
    blocks: Number(blocks),
    columns: Number(columns),
    gutter: Number(gutter),
    "heading size": Number(headingSize),
    "body size": Number(bodySize),
    "rendered width": Number(renderWidth),
    "file size": Number(fileSizeMb),
  };
  for (const [key, value] of Object.entries(values)) {
    if (!Number.isFinite(value)) return { error: `Enter a valid number for ${key}.` };
  }

  const w = values["canvas width"];
  const h = values["canvas height"];
  const barShare = values["control bar height"];
  const trim = values["edge trim"];
  const pad = values.padding;
  const blockCount = Math.round(values.blocks);
  const cols = Math.round(values.columns);
  const gap = values.gutter;
  const heading = values["heading size"];
  const body = values["body size"];
  const rw = values["rendered width"];
  const fileMb = values["file size"];

  if (w < CANVAS_MIN || w > CANVAS_MAX || h < CANVAS_MIN || h > CANVAS_MAX) {
    return { error: `Canvas width and height must be between ${CANVAS_MIN} and ${CANVAS_MAX} pixels.` };
  }
  if (barShare < 0 || barShare > 0.5) {
    return { error: "The control bar should cover between 0% and 50% of the canvas height." };
  }
  if (trim < 0 || trim > 0.4) return { error: "Edge trim should be between 0% and 40% of each side." };
  if (pad < 0 || pad > Math.min(w, h) / 2) {
    return { error: "Padding is larger than half the canvas — reduce it." };
  }
  if (blockCount < 1 || blockCount > MAX_BLOCKS) {
    return { error: `Use between 1 and ${MAX_BLOCKS} information blocks.` };
  }
  if (cols < 1 || cols > blockCount) {
    return { error: "Columns must be at least 1 and no more than the number of blocks." };
  }
  if (gap < 0 || gap > Math.min(w, h) / 2) {
    return { error: "The gutter between blocks is too large for this canvas." };
  }
  if (heading <= 0 || heading > 600 || body <= 0 || body > 600) {
    return { error: "Heading and body sizes must be between 1 and 600 pixels." };
  }
  if (rw < 100 || rw > 4000) return { error: "Rendered width should be between 100 and 4000 pixels." };
  if (fileMb < 0 || fileMb > 200) return { error: "File size should be between 0 and 200 MB." };

  const trimX = w * trim;
  const trimY = h * trim;
  const barHeight = h * barShare;
  const controlBar = rect(0, h - barHeight, w, barHeight);

  const safeTop = trimY + pad;
  const safeLeft = trimX + pad;
  const safeRight = w - trimX - pad;
  const safeBottom = Math.min(h - trimY, h - barHeight) - pad;
  const safe = rect(safeLeft, safeTop, safeRight - safeLeft, safeBottom - safeTop);
  if (!(safe.width > 0) || !(safe.height > 0)) {
    return { error: "Trim, padding and the control bar leave no usable area — reduce one of them." };
  }

  const rows = Math.ceil(blockCount / cols);
  const cellWidth = (safe.width - gap * (cols - 1)) / cols;
  const cellHeight = (safe.height - gap * (rows - 1)) / rows;
  if (!(cellWidth > 0) || !(cellHeight > 0)) {
    return { error: "The gutter is too wide for that many columns — lower it or use fewer blocks." };
  }

  const cells = [];
  for (let index = 0; index < blockCount; index += 1) {
    const row = Math.floor(index / cols);
    const column = index % cols;
    cells.push({
      index: index + 1,
      ...rect(
        safe.x + column * (cellWidth + gap),
        safe.y + row * (cellHeight + gap),
        cellWidth,
        cellHeight,
      ),
    });
  }

  const scale = rw / w;
  const renderedHeading = heading * scale;
  const renderedBody = body * scale;

  const warnings = [];
  if (Math.abs(w / h - CANVAS_RATIO) > 0.02) {
    warnings.push(
      `This canvas is ${round(w / h, 2)}:1 but the Twitch player is 16:9. Export at ${CANVAS_WIDTH} × ${CANVAS_HEIGHT} so the banner is not letterboxed.`,
    );
  }
  if (renderedBody < MIN_LEGIBLE_PX) {
    warnings.push(
      `Body text at ${round(body)} px shows at about ${round(renderedBody)} px once the player is ${round(rw)} px wide, under the ${MIN_LEGIBLE_PX} px practical floor. Increase it or drop the detail.`,
    );
  } else if (renderedBody < COMFORTABLE_PX) {
    warnings.push(
      `Body text lands at about ${round(renderedBody)} px in the player — readable but tight. Aim for ${COMFORTABLE_PX} px or more.`,
    );
  }
  if (renderedHeading < COMFORTABLE_PX) {
    warnings.push(
      `Headings land at about ${round(renderedHeading)} px on screen. Headings should clear ${COMFORTABLE_PX} px comfortably.`,
    );
  }
  if (fileMb > MAX_FILE_MB) {
    warnings.push(
      `${round(fileMb, 2)} MB is over Twitch's ${MAX_FILE_MB} MB limit for the offline banner. Export a JPEG at quality 80.`,
    );
  }
  if (barShare === 0) {
    warnings.push(
      "The control bar allowance is zero. Twitch draws player controls across the bottom of the offline screen, so keep the lower strip clear.",
    );
  }
  if (cellHeight < heading * 2) {
    warnings.push(
      `Each block is only ${round(cellHeight)} px tall for a ${round(heading)} px heading. Either use fewer blocks per row or reduce the heading size.`,
    );
  }
  if (blockCount > 6) {
    warnings.push(
      `${blockCount} blocks is a lot for a screen viewers glance at. Three or four — schedule, socials, next stream — is usually enough.`,
    );
  }

  const guideSvg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none">`,
    `  <rect x="0" y="0" width="${w}" height="${h}" stroke="currentColor" stroke-width="2" opacity="0.4" />`,
    barHeight > 0
      ? `  <rect x="0" y="${controlBar.y}" width="${w}" height="${controlBar.height}" stroke="currentColor" stroke-width="2" stroke-dasharray="12 8" opacity="0.6" />`
      : "",
    `  <rect x="${safe.x}" y="${safe.y}" width="${safe.width}" height="${safe.height}" stroke="currentColor" stroke-width="3" stroke-dasharray="18 10" opacity="0.7" />`,
    ...cells.map(
      (cell) =>
        `  <rect x="${cell.x}" y="${cell.y}" width="${cell.width}" height="${cell.height}" stroke="currentColor" stroke-width="4" />`,
    ),
    `</svg>`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    width: w,
    height: h,
    ratio: round(w / h, 2),
    controlBar,
    safe,
    safeShare: round(safe.area / (w * h), 4),
    rows,
    columns: cols,
    blocks: blockCount,
    gutter: gap,
    cellWidth: round(cellWidth),
    cellHeight: round(cellHeight),
    cells,
    renderWidth: rw,
    renderScale: round(scale, 4),
    renderedHeadingPx: round(renderedHeading),
    renderedBodyPx: round(renderedBody),
    fileSizeMb: round(fileMb, 2),
    maxFileMb: MAX_FILE_MB,
    fileSizeOk: fileMb <= MAX_FILE_MB,
    guideSvg,
    warnings,
  };
}

/** Plain-text summary for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [
    "Twitch offline screen plan",
    `Canvas: ${result.width} × ${result.height} px (${result.ratio}:1)`,
    `Control bar allowance: ${result.controlBar.height} px across the bottom`,
    `Usable area: ${result.safe.width} × ${result.safe.height} px at ${result.safe.x}, ${result.safe.y} (${Math.round(result.safeShare * 100)}% of the canvas)`,
    `${result.blocks} blocks in ${result.columns} column(s) × ${result.rows} row(s), ${result.gutter} px gutter`,
    `Each block: ${result.cellWidth} × ${result.cellHeight} px`,
    `On a ${result.renderWidth} px player: headings about ${result.renderedHeadingPx} px, body about ${result.renderedBodyPx} px`,
    `File size: ${result.fileSizeMb} MB of ${result.maxFileMb} MB allowed`,
  ];
  for (const warning of result.warnings) lines.push(`- ${warning}`);
  return lines.join("\n");
}
