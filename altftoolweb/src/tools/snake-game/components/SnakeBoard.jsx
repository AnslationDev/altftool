import { GRID_SIZE } from "../constants/gameSettings";
import { isSameCell } from "../utils/gameLogic";

export default function SnakeBoard({ snake, food, status }) {
  const rows = Array.from({ length: GRID_SIZE }, (_, y) => y);
  const columns = Array.from({ length: GRID_SIZE }, (_, x) => x);

  return (
    <div
      className="mx-auto grid aspect-square w-full max-w-[min(100%,560px)] gap-1 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-2 shadow-[var(--anslation-ds-shadow-sm)]"
      style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      role="grid"
      aria-label="Snake game board"
    >
      {rows.map((y) => (
        // `display: contents` keeps these cells as direct participants in
        // the parent's CSS grid track layout (so the visual grid is
        // unchanged) while still giving assistive tech the role="row"
        // wrapper a well-formed ARIA grid requires between role="grid" and
        // role="gridcell" — without it AT falls back to announcing 324
        // unlabelled "gridcell"s with no row/column structure.
        <div role="row" key={y} style={{ display: "contents" }}>
          {columns.map((x) => {
            const cell = { x, y };
            const snakeIndex = snake.findIndex((segment) => isSameCell(segment, cell));
            const isFood = food ? isSameCell(food, cell) : false;
            const isHead = snakeIndex === 0;
            const stateLabel = isHead
              ? "snake head"
              : snakeIndex > -1
                ? "snake body"
                : isFood
                  ? "food"
                  : "empty";

            return (
              <span
                key={`${x}-${y}`}
                role="gridcell"
                aria-label={`Row ${y + 1}, column ${x + 1}: ${stateLabel}`}
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
      ))}
    </div>
  );
}
