// components/Piece.jsx
// Renders a single chess piece glyph. White pieces are filled with the page
// background colour and outlined with the foreground colour so they stay legible
// on both light and dark squares; black pieces use the foreground colour.
// `layoutId` enables smooth cross-board slide animation via framer-motion.
"use client";

import { motion } from "framer-motion";
import { PIECE_GLYPH } from "../engine/chess";

export default function Piece({ piece, sq, reduced }) {
  const glyph = PIECE_GLYPH[piece.c][piece.t];
  const base =
    piece.c === "w"
      ? "text-(--background) [-webkit-text-stroke:2px_var(--foreground)]"
      : "text-(--foreground)";

  return (
    <motion.span
      layoutId={reduced ? undefined : String(sq)}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className={`pointer-events-none block select-none text-center text-[clamp(22px,7vw,44px)] leading-none ${base}`}
      aria-hidden="true"
    >
      {glyph}
    </motion.span>
  );
}
