import { DIRECTIONS, GRID_SIZE } from "../constants/gameSettings";

export function isSameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

// Returns null when the snake occupies every cell — there is nowhere left
// to place food. Falling back to a fixed cell (e.g. {x:0,y:0}) would place
// food directly on top of the snake's own body instead of signalling that
// the board is genuinely full.
export function createFood(snake) {
  const openCells = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (!snake.some((cell) => isSameCell(cell, { x, y }))) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) return null;
  return openCells[Math.floor(Math.random() * openCells.length)];
}

export function nextSnakeState(snake, direction, food) {
  const vector = DIRECTIONS[direction];
  const head = snake[0];
  const nextHead = { x: head.x + vector.x, y: head.y + vector.y };
  const hitWall = nextHead.x < 0 || nextHead.x >= GRID_SIZE || nextHead.y < 0 || nextHead.y >= GRID_SIZE;
  const ateFood = food != null && isSameCell(nextHead, food);
  const body = ateFood ? snake : snake.slice(0, -1);
  const hitSelf = body.some((cell) => isSameCell(cell, nextHead));

  return {
    snake: [nextHead, ...body],
    ateFood,
    collision: hitWall || hitSelf,
  };
}

export function isOppositeDirection(current, next) {
  return (
    (current === "up" && next === "down") ||
    (current === "down" && next === "up") ||
    (current === "left" && next === "right") ||
    (current === "right" && next === "left")
  );
}
