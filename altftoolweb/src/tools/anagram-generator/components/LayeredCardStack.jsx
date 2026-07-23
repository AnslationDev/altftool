"use client";

import React from "react";
import { motion } from "framer-motion";

export default function LayeredCardStack({
  children,
  showBottomHint = false,
  showArrowButton = false,
  onArrowClick = () => {},
}) {
  return (
    <div className="relative w-full my-4 sm:my-6">
      {/* Blurred Glowing Accent Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-tr from-[#3B82F6]/20 via-[#06B6D4]/20 to-[#8B5CF6]/20 blur-[50px] pointer-events-none z-0" />

      {/* Left Layered Accent Card (Subtle background depth, non-obstructive) */}
      <div className="absolute inset-0 rounded-[32px] bg-card/60 border border-border/50 transform -rotate-1 translate-y-1 shadow-md pointer-events-none z-0" />

      {/* Right Layered Accent Card (Subtle background depth, non-obstructive) */}
      <div className="absolute inset-0 rounded-[32px] bg-card/40 border border-border/40 transform rotate-1 translate-y-2 shadow-sm pointer-events-none z-0" />

      {/* Main Primary Focus Card (z-10, 100% visible, clean interactive layout) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -3 }}
        className="relative z-10 w-full rounded-[32px] bg-card/98 backdrop-blur-xl border border-border/80 p-6 sm:p-8 lg:p-9 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-all duration-300 overflow-visible"
      >
        {children}
      </motion.div>
    </div>
  );
}
