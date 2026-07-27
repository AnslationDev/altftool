/**
 * Sprite Animation Timing Calculator — pure calculation module.
 * No React, no DOM, no clock reads.
 */

/** Milliseconds in a second. */
export const MS_PER_SECOND = 1000;

/** Highest playback rate this tool will accept — past this nothing displays it. */
export const MAX_FPS = 240;

/** Sprite sheets past this on a side hit GPU texture limits on older mobile devices. */
export const MAX_SHEET_SIDE_PX = 8192;

/** Uncompressed RGBA is four bytes per pixel. */
export const BYTES_PER_PIXEL = 4;

/**
 * GIF stores each frame delay in hundredths of a second. Browsers historically
 * clamp any delay below 2 cs, commonly rendering it as 10 cs instead, so a GIF
 * cannot reliably run faster than 50 fps.
 */
export const MIN_GIF_DELAY_CS = 2;

/** A refresh ratio within this of a whole number counts as evenly divided. */
export const REFRESH_ALIGN_TOLERANCE = 0.01;

/** Common display refresh rates, in hertz. */
export const REFRESH_RATES = [60, 75, 90, 120, 144, 165, 240];

/** Frame rates people actually author sprite animation at. */
export const COMMON_FPS = [8, 10, 12, 15, 24, 30, 60];

const round = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/**
 * Work out every timing and layout figure for a sprite sheet animation.
 *
 * @param {object} input
 * @param {number} input.frameCount   number of frames in the animation
 * @param {number} input.fps          playback rate in frames per second
 * @param {number} input.frameWidth   width of one frame, in pixels
 * @param {number} input.frameHeight  height of one frame, in pixels
 * @param {number} input.columns      frames per row on the sheet
 * @param {number} input.refreshHz    display refresh rate to check against
 */
export function computeSpriteTiming(input) {
  const {
    frameCount,
    fps,
    frameWidth,
    frameHeight,
    columns,
    refreshHz = 60,
  } = input || {};

  const frames = Number(frameCount);
  const rate = Number(fps);
  const fw = Number(frameWidth);
  const fh = Number(frameHeight);
  const cols = Number(columns);
  const hz = Number(refreshHz);

  if ([frames, rate, fw, fh, cols, hz].some((value) => !Number.isFinite(value))) {
    return { error: "Every field has to be a number." };
  }
  if (!Number.isInteger(frames) || frames < 1) {
    return { error: "Frame count must be a whole number of at least 1." };
  }
  if (rate <= 0) return { error: "Frame rate must be greater than zero." };
  if (rate > MAX_FPS) return { error: `Frame rates above ${MAX_FPS} fps are beyond any display this would run on.` };
  if (fw <= 0 || fh <= 0) return { error: "Frame width and height must both be greater than zero." };
  if (!Number.isInteger(cols) || cols < 1) return { error: "Frames per row must be a whole number of at least 1." };
  if (cols > frames) return { error: "Frames per row cannot exceed the total frame count." };
  if (hz <= 0) return { error: "Display refresh rate must be greater than zero." };

  const rows = Math.ceil(frames / cols);
  const sheetWidth = cols * fw;
  const sheetHeight = rows * fh;

  if (sheetWidth > MAX_SHEET_SIDE_PX || sheetHeight > MAX_SHEET_SIDE_PX) {
    return {
      error: `That layout makes a ${sheetWidth} × ${sheetHeight} px sheet, past the ${MAX_SHEET_SIDE_PX} px texture limit on many mobile GPUs.`,
    };
  }

  const frameDurationMs = MS_PER_SECOND / rate;
  const totalDurationMs = (frames / rate) * MS_PER_SECOND;

  // How many display refreshes each sprite frame is held for.
  const refreshesPerFrame = hz / rate;
  const alignedToRefresh =
    Math.abs(refreshesPerFrame - Math.round(refreshesPerFrame)) < REFRESH_ALIGN_TOLERANCE;
  const nearestAlignedFps = hz / Math.max(1, Math.round(refreshesPerFrame));

  const gifDelayCs = Math.round(frameDurationMs / 10);
  const emptyCells = rows * cols - frames;

  const uncompressedBytes = sheetWidth * sheetHeight * BYTES_PER_PIXEL;

  const warnings = [];
  if (!alignedToRefresh) {
    warnings.push(
      `At ${round(rate, 2)} fps each frame lasts ${round(refreshesPerFrame, 2)} refreshes on a ${hz} Hz display, so frame lengths alternate and the motion judders. ${round(nearestAlignedFps, 2)} fps divides evenly.`,
    );
  }
  if (refreshesPerFrame < 1) {
    warnings.push(
      `A ${hz} Hz display cannot show ${round(rate, 2)} distinct frames per second — frames will be dropped.`,
    );
  }
  if (gifDelayCs < MIN_GIF_DELAY_CS) {
    warnings.push(
      `As a GIF this needs a ${gifDelayCs} cs frame delay, below the ${MIN_GIF_DELAY_CS} cs floor browsers enforce — export as video or CSS instead.`,
    );
  }
  if (emptyCells > 0) {
    warnings.push(
      `${emptyCells} cell${emptyCells === 1 ? "" : "s"} on the sheet ${emptyCells === 1 ? "is" : "are"} empty. Use a column count that divides ${frames} to avoid wasted pixels.`,
    );
  }

  return {
    frames,
    fps: rate,
    frameWidth: fw,
    frameHeight: fh,
    columns: cols,
    rows,
    sheetWidth,
    sheetHeight,
    frameDurationMs,
    totalDurationMs,
    totalDurationS: totalDurationMs / MS_PER_SECOND,
    refreshHz: hz,
    refreshesPerFrame,
    alignedToRefresh,
    nearestAlignedFps,
    gifDelayCs,
    emptyCells,
    uncompressedBytes,
    uncompressedKiB: uncompressedBytes / 1024,
    endPositionX: -(fw * cols),
    endPositionY: -(fh * rows),
    warnings,
  };
}

/**
 * CSS for the animation.
 *
 * A single row uses one steps(columns) animation on background-position-x.
 * A grid runs the horizontal animation once per row, and a slower vertical
 * animation with steps(rows) that advances a row each time the row completes.
 *
 * steps() defaults to jump-end, so the final keyframe position is never held —
 * that is what makes exactly `columns` frames visible per cycle.
 */
export function buildSpriteCss(result, selector = ".sprite") {
  if (!result || result.error) return "";

  const {
    frameWidth, frameHeight, columns, rows,
    sheetWidth, sheetHeight, totalDurationS, endPositionX, endPositionY,
  } = result;

  const rowDurationS = totalDurationS / rows;
  const fmt = (value) => `${round(value, 4)}s`;

  const lines = [
    `${selector} {`,
    `  width: ${frameWidth}px;`,
    `  height: ${frameHeight}px;`,
    `  background-image: url("sprite-sheet.png");`,
    `  background-size: ${sheetWidth}px ${sheetHeight}px;`,
    `  background-repeat: no-repeat;`,
  ];

  if (rows === 1) {
    lines.push(
      `  animation: sprite-x ${fmt(totalDurationS)} steps(${columns}) infinite;`,
      "}",
      "",
      "@keyframes sprite-x {",
      "  from { background-position-x: 0; }",
      `  to   { background-position-x: ${endPositionX}px; }`,
      "}",
    );
  } else {
    lines.push(
      `  animation:`,
      `    sprite-x ${fmt(rowDurationS)} steps(${columns}) infinite,`,
      `    sprite-y ${fmt(totalDurationS)} steps(${rows}) infinite;`,
      "}",
      "",
      "@keyframes sprite-x {",
      "  from { background-position-x: 0; }",
      `  to   { background-position-x: ${endPositionX}px; }`,
      "}",
      "",
      "@keyframes sprite-y {",
      "  from { background-position-y: 0; }",
      `  to   { background-position-y: ${endPositionY}px; }`,
      "}",
    );
  }

  lines.push(
    "",
    "@media (prefers-reduced-motion: reduce) {",
    `  ${selector} { animation: none; }`,
    "}",
  );

  return lines.join("\n");
}

/**
 * Frame rates that divide a given refresh rate exactly, so the animation can
 * hold every frame for a whole number of display refreshes.
 */
export function alignedFpsOptions(refreshHz, maxFps = 60) {
  const hz = Number(refreshHz);
  const cap = Number(maxFps);
  if (!Number.isFinite(hz) || hz <= 0) return [];
  if (!Number.isFinite(cap) || cap <= 0) return [];
  const options = [];
  for (let hold = 1; hold <= 30; hold += 1) {
    const value = hz / hold;
    if (value <= cap && value >= 1) options.push({ fps: round(value, 3), holdRefreshes: hold });
  }
  return options;
}
