"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Shuffle, Wand2 } from "lucide-react";

export default function EmptyState({ onQuickFill }) {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col items-center justify-center p-10 sm:p-14 text-center rounded-3xl bg-card/60 border border-dashed border-border/80 backdrop-blur-md shadow-inner space-y-5 my-4">
      {/* Animated Icon Illustration */}
      <motion.div
        animate={
          reduce
            ? undefined
            : {
                scale: [1, 1.06, 1],
                rotate: [0, 5, -5, 0],
              }
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-500/20 via-indigo-500/20 to-purple-500/20 p-1 flex items-center justify-center border border-teal-500/30 shadow-lg">
          <div className="w-full h-full rounded-[22px] bg-card flex items-center justify-center text-teal-500">
            <Shuffle className="w-8 h-8 animate-pulse" />
          </div>
        </div>
        <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40">
          <Sparkles className="w-4 h-4 animate-spin" />
        </div>
      </motion.div>

      {/* Main Copy */}
      <div className="max-w-sm space-y-2">
        <h3 className="text-xl font-bold text-foreground">
          ✨ Start Creating Amazing Anagrams
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Type any word or phrase in the input box above and click <strong className="text-teal-500">Generate Anagrams</strong> to instantly see creative combinations.
        </p>
      </div>

      {/* Quick Try Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onQuickFill("listen")}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 text-xs font-semibold transition shadow-sm"
      >
        <Wand2 className="w-3.5 h-3.5" />
        <span>Try &ldquo;listen&rdquo; example</span>
      </motion.button>
    </div>
  );
}
