"use client";

import { motion } from "framer-motion";
import { GripVertical, Wand2 } from "lucide-react";
import FloatingCard from "../FloatingCard";

const PALETTE = ["#a855f7", "#ec4899", "#22d3ee", "#f59e0b"];
const sliderPosition = { left: ["28%", "72%", "28%"] };
const sliderTransition = { duration: 6, repeat: Infinity, ease: "easeInOut" };

export default function ImageEditingScene() {
  return (
    <div className="flex h-full w-full flex-col p-4 sm:p-6">
      <div className="relative flex-1 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500" />
        <motion.div
          className="absolute inset-y-0 right-0"
          animate={{ left: sliderPosition.left }}
          transition={sliderTransition}
          style={{ backgroundImage: "repeating-conic-gradient(#e2e8f0 0% 25%, #f8fafc 0% 50%)", backgroundSize: "16px 16px" }}
        />
        <motion.div
          className="absolute inset-y-0 flex w-7 -translate-x-1/2 items-center justify-center"
          animate={{ left: sliderPosition.left }}
          transition={sliderTransition}
        >
          <span className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/80" />
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md">
            <GripVertical className="h-4 w-4 text-slate-500" aria-hidden="true" />
          </span>
        </motion.div>

        <FloatingCard index={1} bobDuration={5} className="right-3 top-3 flex items-center gap-2.5 px-3 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-fuchsia-100">
            <Wand2 className="h-3.5 w-3.5 text-fuchsia-600" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-slate-900">Remove Background</p>
            <p className="text-[10px] text-slate-500">Applied instantly</p>
          </div>
          <span className="ml-1 flex h-4 w-7 items-center rounded-full bg-fuchsia-500 p-0.5">
            <span className="ml-auto h-3 w-3 rounded-full bg-white" />
          </span>
        </FloatingCard>
      </div>

      <div className="mt-4 flex items-center gap-2.5">
        {PALETTE.map((color) => (
          <span key={color} className="h-6 w-6 rounded-full ring-2 ring-white" style={{ backgroundColor: color }} />
        ))}
        <span className="ml-auto text-xs font-semibold text-slate-500">Auto palette · Upscaled to 4K</span>
      </div>
    </div>
  );
}
