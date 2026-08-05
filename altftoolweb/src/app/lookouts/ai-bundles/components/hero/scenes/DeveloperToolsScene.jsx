"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import FloatingCard from "../FloatingCard";

const lineVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export default function DeveloperToolsScene() {
  return (
    <div className="flex h-full w-full flex-col p-4 sm:p-6">
      <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-100 bg-slate-900">
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/5 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-[11px] font-medium text-slate-400">checkout.ts</span>
        </div>
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.12, delayChildren: 0.1 }}
          className="space-y-1.5 px-4 py-4 font-mono text-[13px] leading-relaxed sm:text-sm"
        >
          <motion.p variants={lineVariants}>
            <span className="text-purple-400">function</span> <span className="text-sky-400">getUser</span>
            <span className="text-slate-500">(id) {"{"}</span>
          </motion.p>
          <motion.p variants={lineVariants} className="pl-4">
            <span className="text-purple-400">return</span> <span className="text-slate-200">db.users.find(id)</span>
          </motion.p>
          <motion.p variants={lineVariants} className="text-slate-500">
            {"}"}
          </motion.p>
          <motion.p variants={lineVariants} className="mt-2 rounded-md bg-emerald-400/10 px-2 py-1 text-emerald-400/80 italic">
            {"// AI: add try/catch handling"}
            <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-emerald-400/80 align-middle" />
          </motion.p>
          <motion.p variants={lineVariants} className="mt-3 text-emerald-400">
            ✓ Build passed in 2.4s
          </motion.p>
        </motion.div>

        <FloatingCard index={1} bobDuration={5} className="bottom-3 right-3 w-[180px] p-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            <p className="text-xs font-bold text-slate-900">AI Suggestion</p>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-slate-500">Add error handling to this function?</p>
          <div className="mt-2 flex gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-white">
              <Check className="h-3 w-3" aria-hidden="true" /> Accept
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
              <X className="h-3 w-3" aria-hidden="true" /> Skip
            </span>
          </div>
        </FloatingCard>
      </div>
    </div>
  );
}
