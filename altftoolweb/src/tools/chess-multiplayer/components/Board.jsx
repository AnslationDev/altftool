// components/Board.jsx
// Board renderer. Pure presentational: takes the chess state + UI selection
// props and renders 64 <Square>s. Can be used as a spectator/read-only view
// by passing `spectator` (no interactive handlers) and a `chess` snapshot.
"use client";

import { AnimatePresence } from "framer-motion";
import Square from "./Square";
import { FILES, squareIndex, findKing } from "../engine/chess";

export default function Board({
  chess,
  orientation = "w",
  selected = null,
  legalForSelected = [],
  lastMove = null,
  inCheck = false,
  onActivate,
  onHover,
  reduced = false,
  spectator = false,
}) {
  // Roving focus: arrow keys move the active square; Enter/Space activates
  // (native button behaviour). This keeps the board fully keyboard operable.
  const handleGridKeyDown = (e) => {
    const current = document.activeElement;
    if (!current || !current.dataset || current.dataset.sq === undefined) return;
    let sq = parseInt(current.dataset.sq, 10);
    let file = sq % 8;
    let rank = Math.floor(sq / 8);
    const up = orientation === "w" ? 1 : -1;
    if (e.key === "ArrowUp") rank += up;
    else if (e.key === "ArrowDown") rank -= up;
    else if (e.key === "ArrowLeft") file += orientation === "w" ? -1 : 1;
    else if (e.key === "ArrowRight") file += orientation === "w" ? 1 : -1;
    else return;
    e.preventDefault();
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return;
    const nextSq = rank * 8 + file;
    const el = e.currentTarget.querySelector(`[data-sq="${nextSq}"]`);
    if (el) el.focus();
  };

  const checkSq =
    inCheck && chess.turn ? findKing(chess.board, chess.turn) : -1;

  const legalMap = new Map();
  for (const m of legalForSelected) {
    legalMap.set(m.to, m);
  }

  const order = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      let file;
      let rank;
      if (orientation === "w") {
        file = col;
        rank = 7 - row;
      } else {
        file = 7 - col;
        rank = row;
      }
      order.push({ sq: squareIndex(file, rank), file, rank });
    }
  }

  return (
    <div className="mx-auto w-full max-w-[min(92vw,560px)]">
      <div className="overflow-hidden rounded-2xl border border-(--border) shadow-sm">
        <div
          className="grid grid-cols-8"
          role="grid"
          aria-label="Chess board"
          onKeyDown={spectator ? undefined : handleGridKeyDown}
        >
          {order.map(({ sq, file, rank }) => {
            const piece = chess.board[sq];
            const isLight = (file + rank) % 2 === 1;
            const move = legalMap.get(sq);
            return (
              <Square
                key={sq}
                sq={sq}
                piece={piece}
                isLight={isLight}
                isSelected={selected === sq}
                isLegalTarget={!!move && !move.enPassant}
                isCaptureTarget={!!move && !!piece}
                isLastMove={
                  lastMove && (lastMove.from === sq || lastMove.to === sq)
                }
                isCheck={checkSq === sq}
                showFileLabel={rank === (orientation === "w" ? 0 : 7)}
                showRankLabel={file === (orientation === "w" ? 0 : 7)}
                fileLabel={FILES[file]}
                rankLabel={rank + 1}
                onActivate={spectator ? () => {} : onActivate}
                onHover={spectator ? null : onHover}
                reduced={reduced}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
