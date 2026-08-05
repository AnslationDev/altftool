"use client";

import { motion } from "framer-motion";
import ToolLogo from "../ToolLogo";

/** Single card in the hero's auto-scrolling tool wall — real logo tile on top, name and status below. */
export default function ToolWallCard({ tool }) {
  return (
    <motion.div
      className="aib-card flex flex-col gap-3 rounded-2xl p-5"
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--aib-muted)] p-2">
        <ToolLogo name={tool.name} domain={tool.domain} hue={tool.hue} size={28} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-base font-bold text-[var(--aib-fg)]">{tool.name}</p>
        <p className="mt-1 truncate font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--aib-muted-fg)]">{tool.status}</p>
      </div>
    </motion.div>
  );
}
