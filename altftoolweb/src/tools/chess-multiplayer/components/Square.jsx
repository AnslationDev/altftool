// components/Square.jsx
// A single board square: background colour, move highlights, coordinate labels,
// and (optionally) the piece that occupies it. Fully keyboard accessible.
"use client";

import { AnimatePresence } from "framer-motion";
import Piece from "./Piece";

export default function Square({
  sq,
  piece,
  isLight,
  isSelected,
  isLegalTarget,
  isCaptureTarget,
  isLastMove,
  isCheck,
  showFileLabel,
  showRankLabel,
  fileLabel,
  rankLabel,
  onActivate,
  onHover,
  reduced,
}) {
  const bg = isLight ? "bg-(--muted)" : "bg-(--primary)/20";

  const ring = isSelected
    ? "ring-4 ring-(--primary) ring-inset"
    : isLastMove
    ? "ring-2 ring-(--secondary) ring-inset"
    : "";

  const checkBg = isCheck ? "bg-red-600/30" : "";

  return (
    <button
      type="button"
      data-sq={sq}
      onClick={() => onActivate(sq)}
      onMouseEnter={() => onHover && onHover(sq)}
      onFocus={() => onHover && onHover(sq)}
      className={`relative flex aspect-square items-center justify-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-(--primary) ${bg} ${ring} ${checkBg}`}
      aria-label={
        (piece ? `${piece.c === "w" ? "white" : "black"} ${pieceName(piece.t)}` : "empty") +
        ` square ${fileLabel}${rankLabel}` +
        (isLegalTarget ? ", legal move" : "") +
        (isCheck ? ", king in check" : "")
      }
    >
      {showRankLabel && (
        <span
          className={`absolute left-1 top-1 text-[10px] font-semibold ${
            isLight ? "text-(--muted-foreground)" : "text-(--primary)"
          }`}
        >
          {rankLabel}
        </span>
      )}
      {showFileLabel && (
        <span
          className={`absolute bottom-1 right-1 text-[10px] font-semibold ${
            isLight ? "text-(--muted-foreground)" : "text-(--primary)"
          }`}
        >
          {fileLabel}
        </span>
      )}

      {piece && (
        <AnimatePresence>
          <Piece piece={piece} sq={sq} reduced={reduced} />
        </AnimatePresence>
      )}

      {isLegalTarget && !piece && (
        <span className="absolute h-1/4 w-1/4 rounded-full bg-(--primary)/50" />
      )}
      {isCaptureTarget && piece && (
        <span className="absolute inset-[6%] rounded-full border-[3px] border-(--primary)/60" />
      )}
    </button>
  );
}

function pieceName(t) {
  return {
    k: "king",
    q: "queen",
    r: "rook",
    b: "bishop",
    n: "knight",
    p: "pawn",
  }[t];
}
