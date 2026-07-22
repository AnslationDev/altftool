"use client";

import { useMemo } from "react";
import { COLS, ROWS, landingRow } from "../lib/engine";

// Fixed vivid palette below is intentional game art (board frame + disc faces).
// The board defines its own background so it stays legible in light AND dark
// page themes. All surrounding chrome uses design tokens in pages/index.jsx.

const BOARD_CSS = `
.fiar-drop {
  animation-name: fiar-drop;
  animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.6);
  animation-fill-mode: backwards;
}
@keyframes fiar-drop {
  from { transform: translateY(var(--fiar-from, -700%)); }
  to { transform: translateY(0); }
}
.fiar-win {
  animation: fiar-win-pulse 1.1s ease-in-out infinite;
  box-shadow: 0 0 0 3px #f8fafc, 0 0 16px 4px rgba(248, 250, 252, 0.85);
}
@keyframes fiar-win-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.9); }
}
@media (prefers-reduced-motion: reduce) {
  .fiar-drop, .fiar-win { animation: none !important; }
}
`;

const FRAME_STYLE = {
  background: "linear-gradient(180deg, #2563eb 0%, #1e3a8a 100%)",
};

const HOLE_STYLE = {
  background: "#0b1f4e",
  boxShadow: "inset 0 3px 8px rgba(0, 0, 0, 0.55)",
};

export const DISC_ART = {
  1: {
    background: "radial-gradient(circle at 32% 28%, #fecaca, #ef4444 48%, #991b1b)",
    borderColor: "#7f1d1d",
  },
  2: {
    background: "radial-gradient(circle at 32% 28%, #fef9c3, #facc15 48%, #a16207)",
    borderColor: "#854d0e",
  },
};

export default function Board({
  board,
  lastMove,
  winLine,
  activeCol,
  currentPlayer,
  disabled,
  reducedMotion,
  onColumnEnter,
  onColumnClick,
}) {
  const winSet = useMemo(
    () => new Set((winLine || []).map(([r, c]) => `${r},${c}`)),
    [winLine],
  );

  return (
    <div className="mx-auto w-full max-w-md touch-manipulation select-none">
      <style>{BOARD_CSS}</style>

      {/* Aim indicator row (decorative — status is announced via aria-live). */}
      <div className="grid grid-cols-7 gap-1 px-2" aria-hidden="true">
        {Array.from({ length: COLS }, (_, c) => (
          <div key={c} className="flex h-8 items-center justify-center">
            {!disabled && c === activeCol ? (
              <span
                className="block h-6 w-6 rounded-full border-2 opacity-90"
                style={DISC_ART[currentPlayer]}
              />
            ) : null}
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-7 gap-1 rounded-lg p-2 shadow-md sm:p-2.5"
        style={FRAME_STYLE}
        role="group"
        aria-label="Game board: 7 columns, 6 rows"
      >
        {Array.from({ length: COLS }, (_, c) => {
          const columnFull = landingRow(board, c) < 0;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onColumnClick(c)}
              onMouseEnter={() => onColumnEnter(c)}
              onFocus={() => onColumnEnter(c)}
              disabled={disabled || columnFull}
              aria-label={`Drop disc in column ${c + 1}`}
              className="flex min-w-0 flex-col gap-1 overflow-hidden rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-default"
            >
              {Array.from({ length: ROWS }, (_, r) => {
                const value = board[r][c];
                const isLast = lastMove && lastMove.row === r && lastMove.col === c;
                const isWin = winSet.has(`${r},${c}`);
                const animate = isLast && !reducedMotion;
                return (
                  <span key={r} className="relative block aspect-square w-full">
                    <span className="absolute inset-0 rounded-full" style={HOLE_STYLE} />
                    {value ? (
                      <span
                        key={isLast ? `m${lastMove.key}` : "disc"}
                        className={`absolute rounded-full border-2${animate ? " fiar-drop" : ""}${isWin ? " fiar-win" : ""}`}
                        style={{
                          inset: "7%",
                          ...DISC_ART[value],
                          ...(animate
                            ? {
                                "--fiar-from": `${-(r + 1) * 115}%`,
                                animationDuration: `${(0.18 + r * 0.05).toFixed(2)}s`,
                              }
                            : null),
                        }}
                      />
                    ) : null}
                  </span>
                );
              })}
            </button>
          );
        })}
      </div>
    </div>
  );
}
