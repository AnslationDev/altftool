"use client";

import { useCallback, useRef } from "react";
import { keyOf } from "../lib/generator";

/**
 * Fixed vivid palette used as game art inside the play area. Each found word
 * keeps one of these tints on the board and in the word list. The board paints
 * its own light "paper" background so it stays legible on light AND dark page
 * themes.
 */
export const WORD_COLORS = [
  { cell: "rgba(249, 115, 22, 0.55)", chip: "rgba(249, 115, 22, 0.28)" },
  { cell: "rgba(34, 197, 94, 0.55)", chip: "rgba(34, 197, 94, 0.28)" },
  { cell: "rgba(59, 130, 246, 0.5)", chip: "rgba(59, 130, 246, 0.28)" },
  { cell: "rgba(234, 179, 8, 0.55)", chip: "rgba(234, 179, 8, 0.3)" },
  { cell: "rgba(168, 85, 247, 0.5)", chip: "rgba(168, 85, 247, 0.28)" },
  { cell: "rgba(236, 72, 153, 0.5)", chip: "rgba(236, 72, 153, 0.28)" },
  { cell: "rgba(20, 184, 166, 0.55)", chip: "rgba(20, 184, 166, 0.28)" },
  { cell: "rgba(132, 204, 22, 0.55)", chip: "rgba(132, 204, 22, 0.3)" },
];

const ART = {
  boardBg: "#fffbef",
  boardBorder: "#e4dcc6",
  letter: "#273349",
  selectedBg: "#0d9488",
  selectedText: "#ffffff",
  invalidBg: "#dc2626",
  invalidText: "#ffffff",
  cursorOutline: "#0d9488",
};

/**
 * Presentational letter grid plus pointer-to-cell math. The parent owns all
 * selection state; this component reports drag start / move / end cells using
 * pointer events (works for both mouse and touch thanks to touch-action:none
 * and pointer capture).
 */
export default function Board({
  grid,
  size,
  foundCells,
  selectedKeys,
  invalidKeys,
  cursorKey,
  anchorKey,
  disabled,
  onSelectStart,
  onSelectMove,
  onSelectEnd,
}) {
  const boardRef = useRef(null);
  const draggingRef = useRef(false);

  const cellFromEvent = useCallback(
    (event) => {
      const node = boardRef.current;
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const x = Math.min(rect.width - 1, Math.max(0, event.clientX - rect.left));
      const y = Math.min(rect.height - 1, Math.max(0, event.clientY - rect.top));
      return {
        r: Math.min(size - 1, Math.floor((y / rect.height) * size)),
        c: Math.min(size - 1, Math.floor((x / rect.width) * size)),
      };
    },
    [size],
  );

  const handlePointerDown = (event) => {
    if (disabled) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    const cell = cellFromEvent(event);
    if (!cell) return;
    draggingRef.current = true;
    boardRef.current?.setPointerCapture?.(event.pointerId);
    onSelectStart(cell);
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current || disabled) return;
    const cell = cellFromEvent(event);
    if (cell) onSelectMove(cell);
  };

  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    onSelectEnd();
  };

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div
        ref={boardRef}
        aria-label={`Word search grid, ${size} by ${size} letters`}
        className="grid w-full select-none rounded-lg border p-1.5 sm:p-2"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          gap: "2px",
          aspectRatio: "1 / 1",
          touchAction: "none",
          containerType: "inline-size",
          backgroundColor: ART.boardBg,
          borderColor: ART.boardBorder,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onContextMenu={(event) => event.preventDefault()}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const key = keyOf(r, c);
            const foundColor = foundCells.get(key);
            const isSelected = selectedKeys.has(key) || anchorKey === key;
            const isInvalid = Boolean(invalidKeys && invalidKeys.has(key));
            const isCursor = cursorKey === key;

            let background = "transparent";
            let color = ART.letter;
            if (foundColor !== undefined) {
              background = WORD_COLORS[foundColor % WORD_COLORS.length].cell;
            }
            if (isSelected) {
              background = ART.selectedBg;
              color = ART.selectedText;
            }
            if (isInvalid) {
              background = ART.invalidBg;
              color = ART.invalidText;
            }

            return (
              <div
                key={key}
                className="flex items-center justify-center rounded-[4px] font-semibold leading-none transition-colors duration-150 motion-reduce:transition-none"
                style={{
                  backgroundColor: background,
                  color,
                  fontSize: `${((100 / size) * 0.5).toFixed(2)}cqw`,
                  outline: isCursor ? `2px solid ${ART.cursorOutline}` : undefined,
                  outlineOffset: isCursor ? "-2px" : undefined,
                }}
              >
                {letter}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
