"use client";

import { motion } from "framer-motion";
import { LayoutTemplate, MousePointer2 } from "lucide-react";
import FloatingCard from "../FloatingCard";

const PALETTE = ["#0ea5e9", "#6366f1", "#a855f7", "#0f172a"];

const blockVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

export default function UiUxScene() {
  return (
    <div className="flex h-full w-full flex-col p-4 sm:p-6">
      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.14, delayChildren: 0.1 }}
        className="relative flex-1 overflow-hidden rounded-xl border border-dashed border-sky-300 bg-sky-50/60 p-4 sm:p-5"
      >
        <motion.div variants={blockVariants} className="h-4 w-20 rounded-full bg-sky-500/70" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <motion.div variants={blockVariants} className="h-20 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-400 sm:h-24" />
          <motion.div variants={blockVariants} className="h-20 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-400 sm:h-24" />
        </div>
        <div className="mt-3 space-y-2">
          <motion.div variants={blockVariants} className="h-2.5 w-full rounded-full bg-slate-200" />
          <motion.div variants={blockVariants} className="h-2.5 w-2/3 rounded-full bg-slate-200" />
        </div>

        <motion.span
          className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md"
          animate={{ x: [0, 14, 0], y: [0, -8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <MousePointer2 className="h-4 w-4 text-indigo-500" aria-hidden="true" />
        </motion.span>

        <FloatingCard index={1} bobDuration={5} className="right-3 top-3 w-[172px] p-3">
          <div className="flex items-center gap-1.5">
            <LayoutTemplate className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
            <p className="text-xs font-bold text-slate-900">Auto Layout</p>
          </div>
          <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.1, delayChildren: 0.4 }}
            className="mt-2 space-y-1"
          >
            {["Header", "Grid · 2 cols", "Footer"].map((row) => (
              <motion.div
                key={row}
                variants={rowVariants}
                className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                {row}
              </motion.div>
            ))}
          </motion.div>
        </FloatingCard>
      </motion.div>

      <div className="mt-4 flex items-center gap-2.5">
        {PALETTE.map((color) => (
          <span key={color} className="h-6 w-6 rounded-full ring-2 ring-white" style={{ backgroundColor: color }} />
        ))}
        <span className="font-serif text-lg font-bold text-slate-800">Aa</span>
        <span className="ml-auto text-xs font-semibold text-slate-500">Design tokens synced</span>
      </div>
    </div>
  );
}
