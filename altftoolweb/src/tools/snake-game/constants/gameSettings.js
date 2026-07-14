export const GRID_SIZE = 18;

export const DIFFICULTIES = {
  easy: { label: "Easy", speed: 160, points: 5 },
  medium: { label: "Medium", speed: 120, points: 10 },
  hard: { label: "Hard", speed: 90, points: 15 },
  extreme: { label: "Extreme", speed: 60, points: 25 },
};

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const INITIAL_SNAKE = [
  { x: 8, y: 8 },
  { x: 7, y: 8 },
  { x: 6, y: 8 },
];
