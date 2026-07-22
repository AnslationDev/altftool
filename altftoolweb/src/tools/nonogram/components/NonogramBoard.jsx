"use client";

import { useRef } from "react";
import { FILLED, MARKED } from "../lib/nonogram";

/**
 * Fixed play-area palette (game art). The board defines its own light
 * "paper puzzle" background so it stays legible on both light and dark
 * page themes. All chrome outside this component uses design tokens.
 */
const ART = {
  frame: "#475569",
  line: "#b6c2d4",
  lineBold: "#64748b",
  cell: "#ffffff",
  fill: "#0f766e",
  mark: "#64748b",
  wrong: "#dc2626",
  clueBg: "#eef2f7",
  clueText: "#334155",
  cursor: "#f59e0b",
};

const MAX_WIDTH_BY_SIZE = { 5: 340, 10: 460, 15: 560 };

const CLUE_TEXT_BY_SIZE = {
  5: "text-sm",
  10: "text-[11px]",
  15: "text-[9px]",
};

const MARK_TEXT_BY_SIZE = {
  5: "text-base",
  10: "text-xs",
  15: "text-[9px]",
};

function parseCell(node) {
  if (!node?.dataset?.cell) return null;
  const [r, c] = node.dataset.cell.split(":").map(Number);
  if (!Number.isInteger(r) || !Number.isInteger(c)) return null;
  return { r, c };
}

export default function NonogramBoard({
  size,
  grid,
  rowClues,
  colClues,
  rowSat,
  colSat,
  wrongCells,
  cursor,
  showCursor,
  disabled,
  onStrokeStart,
  onStrokeMove,
  onStrokeEnd,
}) {
  const paintingRef = useRef(false);

  const thinOrBold = (index) =>
    `1px solid ${(index + 1) % 5 === 0 ? ART.lineBold : ART.line}`;
  const innerRight = (c) => (c === size - 1 ? "none" : thinOrBold(c));
  const innerBottom = (r) => (r === size - 1 ? "none" : thinOrBold(r));
  const frameRight = `2px solid ${ART.frame}`;
  const frameBottom = `2px solid ${ART.frame}`;

  const endStroke = () => {
    if (!paintingRef.current) return;
    paintingRef.current = false;
    onStrokeEnd?.();
  };

  const handlePointerDown = (event) => {
    if (disabled) return;
    const cell = parseCell(event.target.closest?.("[data-cell]"));
    if (!cell) return;
    event.preventDefault();
    paintingRef.current = true;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is best-effort; painting still works without it.
    }
    onStrokeStart?.(cell.r, cell.c, { alt: event.button === 2 });
  };

  const handlePointerMove = (event) => {
    if (disabled || !paintingRef.current) return;
    event.preventDefault();
    const el = document.elementFromPoint(event.clientX, event.clientY);
    const cell = parseCell(el?.closest?.("[data-cell]"));
    if (cell) onStrokeMove?.(cell.r, cell.c);
  };

  const clueText = CLUE_TEXT_BY_SIZE[size] || "text-xs";
  const markText = MARK_TEXT_BY_SIZE[size] || "text-xs";

  const children = [];

  children.push(
    <div
      key="corner"
      style={{
        background: ART.clueBg,
        borderRight: frameRight,
        borderBottom: frameBottom,
      }}
    />,
  );

  for (let c = 0; c < size; c++) {
    const clue = colClues[c];
    children.push(
      <div
        key={`col-${c}`}
        className={`flex flex-col items-center justify-end gap-px px-0.5 py-1 font-semibold leading-tight tabular-nums transition-opacity motion-reduce:transition-none ${clueText}`}
        style={{
          background: ART.clueBg,
          color: ART.clueText,
          opacity: colSat[c] ? 0.35 : 1,
          borderRight: innerRight(c),
          borderBottom: frameBottom,
        }}
      >
        {clue.length === 0 ? (
          <span>0</span>
        ) : (
          clue.map((n, i) => <span key={i}>{n}</span>)
        )}
      </div>,
    );
  }

  for (let r = 0; r < size; r++) {
    const clue = rowClues[r];
    children.push(
      <div
        key={`row-${r}`}
        className={`flex items-center justify-end gap-1 whitespace-nowrap px-1.5 font-semibold leading-none tabular-nums transition-opacity motion-reduce:transition-none ${clueText}`}
        style={{
          background: ART.clueBg,
          color: ART.clueText,
          opacity: rowSat[r] ? 0.35 : 1,
          borderRight: frameRight,
          borderBottom: innerBottom(r),
        }}
      >
        {clue.length === 0 ? (
          <span>0</span>
        ) : (
          clue.map((n, i) => <span key={i}>{n}</span>)
        )}
      </div>,
    );

    for (let c = 0; c < size; c++) {
      const value = grid[r][c];
      const isWrong = wrongCells.has(`${r}:${c}`);
      const isCursor = showCursor && cursor && cursor.r === r && cursor.c === c;
      children.push(
        <div
          key={`cell-${r}-${c}`}
          data-cell={`${r}:${c}`}
          className={`flex items-center justify-center font-bold leading-none transition-colors duration-75 motion-reduce:transition-none ${markText}`}
          style={{
            aspectRatio: "1 / 1",
            background: isWrong ? ART.wrong : value === FILLED ? ART.fill : ART.cell,
            color: isWrong ? ART.cell : ART.mark,
            borderRight: innerRight(c),
            borderBottom: innerBottom(r),
            boxShadow: isCursor ? `inset 0 0 0 2px ${ART.cursor}` : "none",
            cursor: disabled ? "default" : "pointer",
          }}
        >
          {value === MARKED ? "✕" : null}
        </div>,
      );
    }
  }

  return (
    <div
      className="mx-auto w-full select-none"
      style={{ maxWidth: MAX_WIDTH_BY_SIZE[size] || 460 }}
    >
      <div
        role="group"
        aria-label={`Puzzle board, ${size} by ${size}`}
        className="grid w-full overflow-hidden rounded-md"
        style={{
          gridTemplateColumns: `auto repeat(${size}, minmax(0, 1fr))`,
          border: `2px solid ${ART.frame}`,
          background: ART.clueBg,
          touchAction: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onContextMenu={(event) => event.preventDefault()}
      >
        {children}
      </div>
    </div>
  );
}
