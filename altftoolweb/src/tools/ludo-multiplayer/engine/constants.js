export const BOARD_SIZE = 15;
export const CELL_SIZE = 40;
export const PLAYERS = [
  { id: 0, name: "Red", color: "#EF4444", home: { x: 1, y: 1 }, start: 0 },
  { id: 1, name: "Blue", color: "#3B82F6", home: { x: 9, y: 1 }, start: 13 },
  { id: 2, name: "Green", color: "#22C55E", home: { x: 1, y: 9 }, start: 26 },
  { id: 3, name: "Yellow", color: "#F59E0B", home: { x: 9, y: 9 }, start: 39 },
];

export const TOTAL_CELLS = 52;
export const TOKENS_PER_PLAYER = 4;
export const HOME_ENTRY = [50, 11, 24, 37];
export const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];
export const HOME_STRETCH_SIZE = 6;
export const MAX_PATH_STEPS = 56;

export const DICE_MIN = 1;
export const DICE_MAX = 6;
export const MAX_CONSECUTIVE_SIXES = 3;
export const TURN_TIMEOUT_MS = 30000;
export const AI_THINK_MIN_MS = 600;
export const AI_THINK_MAX_MS = 1500;

export const GAME_MODES = {
  PVP: "pvp",
  AI: "ai",
};

export const DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};
