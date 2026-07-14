import { GRID_SIZE } from "../constants/gameSettings";
import { isSameCell } from "../utils/gameLogic";

export default function SnakeBoard({ snake, food, status }) {
  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({
    x: index % GRID_SIZE,
    y: Math.floor(index / GRID_SIZE),
  }));

  return (
    <div
      className="mx-auto grid aspect-square w-full max-w-[min(100%,560px)] gap-1 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-2 shadow-[var(--anslation-ds-shadow-sm)]"
      style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      role="grid"
      aria-label="Snake game board"
    >
      {cells.map((cell) => {
        const snakeIndex = snake.findIndex((segment) => isSameCell(segment, cell));
        const isFood = isSameCell(food, cell);
        const isHead = snakeIndex === 0;

        return (
          <span
            key={`${cell.x}-${cell.y}`}
            role="gridcell"
            className={`aspect-square rounded-sm border border-[var(--border)] ${
              isHead
                ? "bg-[var(--primary)]"
                : snakeIndex > -1
                  ? "bg-[var(--secondary)]"
                  : isFood
                    ? "bg-[var(--primary)]/70"
                    : "bg-[var(--card)]"
            } ${status === "game-over" && snakeIndex > -1 ? "opacity-60" : ""}`}
          />
        );
      })}
    </div>
  );
}
