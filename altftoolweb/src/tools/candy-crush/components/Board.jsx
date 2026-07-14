"use client";

import { useCallback, useEffect, useRef } from "react";
import { LayoutGroup } from "framer-motion";
import Tile from "./Tile";
import { ROWS, COLS } from "../utils/board";

const DRAG_THRESHOLD = 18;

export default function Board({ board, selected, resolving, clearing, onSwap, onSelect, cellSize }) {
  const dragRef = useRef(null);

  // Keep latest callbacks in refs so the window listeners stay stable.
  const onSwapRef = useRef(onSwap);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSwapRef.current = onSwap;
  }, [onSwap]);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const cleanupRef = useRef(() => {});

  const onPointerDown = useCallback(
    (r, c) => (e) => {
      if (resolving) return;
      dragRef.current = { r, c, x: e.clientX, y: e.clientY };

      const move = (ev) => {
        const d = dragRef.current;
        if (!d) return;
        const dx = ev.clientX - d.x;
        const dy = ev.clientY - d.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) > DRAG_THRESHOLD) {
          let tr = d.r;
          let tc = d.c;
          if (Math.abs(dx) > Math.abs(dy)) tc += dx > 0 ? 1 : -1;
          else tr += dy > 0 ? 1 : -1;
          if (tr >= 0 && tr < ROWS && tc >= 0 && tc < COLS) {
            onSwapRef.current(d.r, d.c, tr, tc);
          }
          cleanupRef.current();
        }
      };

      const up = (ev) => {
        const d = dragRef.current;
        if (d) {
          const dx = ev.clientX - d.x;
          const dy = ev.clientY - d.y;
          // Treat as tap (click-to-select) if it barely moved.
          if (Math.max(Math.abs(dx), Math.abs(dy)) <= DRAG_THRESHOLD) {
            onSelectRef.current(d.r, d.c);
          }
        }
        cleanupRef.current();
      };

      cleanupRef.current = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        dragRef.current = null;
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [resolving]
  );

  // Keyboard accessibility: arrows move focus, Enter/Space selects.
  const handleKeyDown = useCallback(
    (r, c) => (e) => {
      if (resolving) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelectRef.current(r, c);
        return;
      }
      let tr = r;
      let tc = c;
      if (e.key === "ArrowUp") tr -= 1;
      else if (e.key === "ArrowDown") tr += 1;
      else if (e.key === "ArrowLeft") tc -= 1;
      else if (e.key === "ArrowRight") tc += 1;
      else return;
      e.preventDefault();
      if (tr >= 0 && tr < ROWS && tc >= 0 && tc < COLS) {
        const el = document.getElementById(`tile-${tr}-${tc}`);
        if (el) el.focus();
      }
    },
    [resolving]
  );

  if (!board) return null;

  return (
    <div className="inline-block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--anslation-ds-shadow-md)]">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)`, gap: 6 }}
      >
        {/* Fixed 64-slot grid: every slot always occupies its grid cell, so
            removing/adding a candy never collapses the row-major layout (which
            previously reflowed and visually scrambled the whole board). Candies
            keep a stable layoutId, so when they fall they animate smoothly to
            their new slot instead of teleporting. */}
        <LayoutGroup>
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`slot-${r}-${c}`}
                className="relative"
                style={{ width: cellSize, height: cellSize }}
              >
                {cell ? (
                  <Tile
                    key={cell.id}
                    cell={cell}
                    r={r}
                    c={c}
                    selected={selected && selected.r === r && selected.c === c}
                    clearing={clearing ? clearing.has(`${r},${c}`) : false}
                    onPointerDown={onPointerDown(r, c)}
                    onKeyDown={handleKeyDown(r, c)}
                    size={cellSize}
                  />
                ) : null}
              </div>
            ))
          )}
        </LayoutGroup>
      </div>
    </div>
  );
}
