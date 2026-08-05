"use client";

import { motion } from "framer-motion";
import { Captions, Play } from "lucide-react";
import FloatingCard from "../FloatingCard";

const WAVEFORM = [10, 22, 34, 18, 40, 26, 14, 36, 22, 44, 16, 30, 12, 38, 20, 28, 15, 33, 24, 11, 29, 19, 42, 17, 31];

const progressKeyframes = { left: ["18%", "72%", "18%"] };
const progressTransition = { duration: 7, repeat: Infinity, ease: "easeInOut" };

export default function VideoEditingScene() {
  return (
    <div className="flex h-full w-full flex-col p-4 sm:p-6">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300">
        <motion.span
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm sm:h-16 sm:w-16"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Play className="ml-1 h-6 w-6 text-rose-600" fill="currentColor" aria-hidden="true" />
        </motion.span>
        <span className="absolute bottom-3 right-3 rounded-md bg-black/40 px-2 py-1 text-[11px] font-semibold text-white">
          00:42 / 01:15
        </span>

        <FloatingCard index={1} bobDuration={5} className="right-3 top-3 flex items-center gap-2 px-3 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100">
            <Captions className="h-3.5 w-3.5 text-rose-600" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-slate-900">Auto Captions</p>
            <p className="text-[10px] text-slate-500">Synced &amp; styled</p>
          </div>
        </FloatingCard>
      </div>

      <div className="mt-4 flex h-9 items-end gap-[3px] sm:h-11">
        {WAVEFORM.map((height, index) => (
          <span
            key={index}
            className="aib-wave-bar w-full rounded-full bg-rose-400"
            style={{ height: `${height}px`, animationDelay: `${index * 0.06}s` }}
          />
        ))}
      </div>
      <div className="relative mt-3 h-1.5 rounded-full bg-slate-100">
        <motion.span
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-500 to-orange-400"
          animate={{ width: progressKeyframes.left }}
          transition={progressTransition}
        />
        <motion.span
          className="absolute -top-1 h-3.5 w-[2px] bg-rose-500"
          animate={{ left: progressKeyframes.left }}
          transition={progressTransition}
        />
      </div>
    </div>
  );
}
