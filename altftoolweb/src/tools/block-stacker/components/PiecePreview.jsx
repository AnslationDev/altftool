"use client";

import { getShape, PIECE_COLORS } from "../lib/engine";

const PREVIEW_BG = "#0b1220"; // matches the board — play-area art, fixed on purpose

function buildCells(type) {
  const grid = Array.from({ length: 4 }, () => Array(4).fill(false));
  if (!type) return grid;
  const shape = getShape(type);
  let minR = 4;
  let maxR = -1;
  let minC = 4;
  let maxC = -1;
  shape.forEach((row, r) =>
    row.forEach((v, c) => {
      if (!v) return;
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
    }),
  );
  const offR = Math.floor((4 - (maxR - minR + 1)) / 2) - minR;
  const offC = Math.floor((4 - (maxC - minC + 1)) / 2) - minC;
  shape.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v) grid[r + offR][c + offC] = true;
    }),
  );
  return grid;
}

/** Small 4x4 swatch of a piece, used for the hold slot and the next queue. */
export default function PiecePreview({ type = null, label, dimmed = false }) {
  const grid = buildCells(type);
  return (
    <div className="flex w-full flex-col items-center gap-1">
      {label ? (
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      ) : null}
      <div
        aria-hidden="true"
        className={`grid w-full grid-cols-4 gap-px rounded-md p-1 ${dimmed ? "opacity-50" : ""}`}
        style={{ backgroundColor: PREVIEW_BG }}
      >
        {grid.flat().map((filled, i) => (
          <div
            key={i}
            className="aspect-square rounded-[2px]"
            style={{ backgroundColor: filled ? PIECE_COLORS[type] : "transparent" }}
          />
        ))}
      </div>
    </div>
  );
}
