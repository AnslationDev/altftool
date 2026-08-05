"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import FloatingCard from "../FloatingCard";

const SUGGESTIONS = ["Summarize", "Translate", "Explain simply"];

const bubbleVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export default function ChatbotScene() {
  return (
    <div className="flex h-full w-full flex-col p-4 sm:p-6">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-100 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-blue-500">
            <Bot className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-bold text-slate-900">AI Assistant</p>
            <p className="flex items-center gap-1 text-[11px] text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
            </p>
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.25, delayChildren: 0.15 }}
          className="flex-1 space-y-2.5 overflow-hidden px-4 py-4"
        >
          <motion.p
            variants={bubbleVariants}
            className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-slate-900 px-3.5 py-2 text-[12px] text-white sm:text-[13px]"
          >
            Summarize this article for me
          </motion.p>
          <motion.p
            variants={bubbleVariants}
            className="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 px-3.5 py-2 text-[12px] leading-relaxed text-slate-700 sm:text-[13px]"
          >
            Here&apos;s a 3-point summary with the key takeaways and sources cited.
          </motion.p>
          <motion.div variants={bubbleVariants} className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-3.5 py-2.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
          </motion.div>
        </motion.div>

        <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-4 py-3">
          {SUGGESTIONS.map((item) => (
            <span key={item} className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-600">
              {item}
            </span>
          ))}
        </div>

        <FloatingCard index={1} bobDuration={5} className="right-3 top-3 px-3 py-1.5">
          <span className="text-[10px] font-semibold text-slate-600">GPT-4 · Claude · Gemini</span>
        </FloatingCard>
      </div>
    </div>
  );
}
