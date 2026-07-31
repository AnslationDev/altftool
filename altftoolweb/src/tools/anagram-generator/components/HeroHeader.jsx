"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Star, Zap, Shuffle } from "lucide-react";

export default function HeroHeader() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/20 dark:border-teal-500/30 p-8 sm:p-12 lg:p-16 shadow-[0_25px_70px_rgba(15,23,42,0.25)] text-center group">
      {/* Real High-Resolution Anagram Word Tiles Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-100 transition-transform duration-1000 opacity-90"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1600&auto=format&fit=crop')",
        }}
      />

      {/* Subtle Soft Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/30 to-slate-950/55 backdrop-blur-[2px]" />

      {/* Decorative Vector Accent Glow Orbs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Transparent Text Container (Background Color Box Removed) */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-6 flex flex-col items-center justify-center">
        {/* Top Badge with Real Lucide Sparkles Icon */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-2xl border border-white/30 text-white text-xs font-bold tracking-wide uppercase shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>AltF Anagram SaaS Platform</span>
        </motion.div>

        {/* Centered Title with Real Shuffle Icon */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
        >
          <span>Anagram</span>
          <span className="inline-flex items-center gap-2 text-teal-300">
            <Shuffle className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 animate-bounce" />
            <span>Generator</span>
          </span>
        </motion.h1>

        {/* Centered Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl text-slate-100 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        >
          Generate meaningful anagrams instantly for games, puzzles and creative writing. Rearrange any letters, word, or phrase with advanced word filtering.
        </motion.p>

        {/* Centered Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
        >
          <motion.div
            whileHover={{ y: -3, scale: 1.04 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/30 text-xs font-bold text-white shadow-lg hover:bg-white/30 transition-all duration-300"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Fast Permutation</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, scale: 1.04 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/30 text-xs font-bold text-white shadow-lg hover:bg-white/30 transition-all duration-300"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Unlimited Words</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, scale: 1.04 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/30 text-xs font-bold text-white shadow-lg hover:bg-white/30 transition-all duration-300"
          >
            <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span className="font-bold text-white">50K+</span>
            <span className="text-slate-200">Active Users</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
