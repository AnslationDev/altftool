
export const GAME_CONFIG = {
  LIVES: 3,
  PADDLE_WIDTH_PCT: 0.20, // 20% of screen width
  PADDLE_HEIGHT_PCT: 0.025,
  BALL_RADIUS_PCT: 0.015,
  BALL_SPEED_BASE: 0.006, // Speed relative to screen height per frame? Or width.
  BRICK_ROWS: 5,
  BRICK_COLS: 8,
  BRICK_PADDING: 10,
  BRICK_OFFSET_TOP: 60,
  BRICK_OFFSET_LEFT: 35,
};

export const LEVEL_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#3b82f6"  // Blue
];

/**
 * Creates the initial brick layout
 * @param {number} rows
 * @param {number} cols
 * @returns {Array} Array of brick objects
 */
export const createBricks = (rows, cols) => {
  const bricks = [];
  for (let c = 0; c < cols; c++) {
    bricks[c] = [];
    for (let r = 0; r < rows; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1, color: LEVEL_COLORS[r % LEVEL_COLORS.length] };
    }
  }
  return bricks;
};
