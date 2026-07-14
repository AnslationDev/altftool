import { DIRECTIONS, GRID_SIZE } from "../constants/gameSettings";

export function isSameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function createFood(snake) {
  const openCells = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (!snake.some((cell) => isSameCell(cell, { x, y }))) {
        openCells.push({ x, y });
      }
    }
  }

  return openCells[Math.floor(Math.random() * openCells.length)] || { x: 0, y: 0 };
}

export function nextSnakeState(snake, direction, food) {
  const vector = DIRECTIONS[direction];
  const head = snake[0];
  const nextHead = { x: head.x + vector.x, y: head.y + vector.y };
  const hitWall = nextHead.x < 0 || nextHead.x >= GRID_SIZE || nextHead.y < 0 || nextHead.y >= GRID_SIZE;
  const ateFood = isSameCell(nextHead, food);
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
