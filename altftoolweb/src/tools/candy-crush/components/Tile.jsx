"use client";

import { motion } from "framer-motion";
import { getCandy, shade } from "../utils/candies";

export default function Tile({ cell, r, c, selected, clearing, onPointerDown, onKeyDown, size }) {
  const candy = getCandy(cell.type);
  const Icon = candy.Icon;

  return (
    <motion.button
      layout
      layoutId={`candy-${cell.id}`}
      type="button"
      id={`tile-${r}-${c}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: clearing ? 0 : 1,
        opacity: clearing ? 0 : 1,
        boxShadow: selected
          ? "0 0 0 3px var(--primary), 0 6px 14px rgba(15,23,42,0.25)"
          : "0 2px 6px rgba(15,23,42,0.12)",
      }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      whileTap={{ scale: 0.92 }}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      aria-label={`${candy.name} candy at row ${r + 1}, column ${c + 1}${
        selected ? ", selected" : ""
      }`}
      className="relative flex touch-none select-none items-center justify-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, ${candy.color}, ${shade(candy.color, -18)})`,
      }}
    >
      <Icon className="h-1/2 w-1/2" style={{ color: "#ffffff" }} strokeWidth={2.5} />
    </motion.button>
  );
}
