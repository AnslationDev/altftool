"use client";

import React from "react";
import { motion } from "framer-motion";

export default function DualSectionCard({
  leftComponent,
  rightComponent,
  leftWidth = "lg:w-[45%]",
  rightWidth = "lg:w-[55%]",
  rightIsDark = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[1360px] mx-auto rounded-[32px] bg-white dark:bg-card border border-black/10 dark:border-border/80 p-5 sm:p-6 shadow-[0_30px_70px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 my-8 overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        {/* LEFT INNER CARD */}
        <motion.div
          whileHover={{ scale: 1.003 }}
          transition={{ duration: 0.3 }}
          className={`w-full ${leftWidth} rounded-[24px] bg-[#FAFAFA] dark:bg-surface-soft/90 p-6 sm:p-7 flex flex-col justify-between border border-black/5 dark:border-border/60`}
        >
          {leftComponent}
        </motion.div>

        {/* RIGHT INNER CARD */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className={`w-full ${rightWidth} rounded-[24px] ${
            rightIsDark
              ? "bg-gradient-to-b from-[#111111] via-[#0b0f19] to-[#050505] text-white border border-white/10 shadow-[0_35px_60px_rgba(0,0,0,0.22)]"
              : "bg-surface-soft dark:bg-card text-foreground border border-border/80 shadow-md"
          } p-6 sm:p-8 flex flex-col justify-between z-20 relative overflow-hidden`}
        >
          {rightIsDark && (
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-teal-500/10 blur-[60px] pointer-events-none" />
          )}
          {rightComponent}
        </motion.div>
      </div>
    </motion.div>
  );
}
