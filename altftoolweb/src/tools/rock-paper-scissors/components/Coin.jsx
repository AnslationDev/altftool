"use client";

import { motion } from "framer-motion";

export const COIN_DESIGNS = [
  {
    id: "teal",
    name: "Teal",
    heads: "bg-(--primary)",
    tails: "bg-cyan-400",
    edge: "border-(--primary)/40",
    text: "text-(--primary-foreground)",
  },
  {
    id: "violet",
    name: "Violet",
    heads: "bg-violet-500",
    tails: "bg-fuchsia-500",
    edge: "border-violet-300/40",
    text: "text-white",
  },
  {
    id: "amber",
    name: "Amber",
    heads: "bg-amber-500",
    tails: "bg-rose-500",
    edge: "border-amber-300/40",
    text: "text-white",
  },
];

// A single 3D coin. `rotation` is the target rotateY in degrees; the parent
// decides the final value so the landed face matches the pre-rolled result.
export default function Coin({ face, rotation, design, size = 120, spinning }) {
  const d = design || COIN_DESIGNS[0];
  return (
    <div
      style={{ perspective: 800 }}
      className="flex items-center justify-center"
    >
      <motion.div
        style={{ width: size, height: size, transformStyle: "preserve-3d" }}
        animate={{ rotateY: rotation }}
        transition={
          spinning
            ? { duration: 1.1, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      >
        {/* Heads */}
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-full border-4 ${d.edge} ${d.heads} ${d.text} text-4xl font-black shadow-lg`}
          style={{ backfaceVisibility: "hidden" }}
        >
          H
        </div>
        {/* Tails */}
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-full border-4 ${d.edge} ${d.tails} ${d.text} text-4xl font-black shadow-lg`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          T
        </div>
      </motion.div>
    </div>
  );
}
