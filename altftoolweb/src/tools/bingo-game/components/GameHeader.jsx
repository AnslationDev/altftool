"use client";

import { motion } from "framer-motion";
import { Sparkles, Flame, Coins, Trophy, Award, Gamepad2 } from "lucide-react";
import { soundManager } from "../utils/soundEffects";
import Bingo3DModel from "./Bingo3DModel";

export default function GameHeader({
  gameStarted,
  gameOver,
  winPatterns,
  stats,
  soundEnabled,
}) {
  const isWon = gameOver && winPatterns.length > 0;

  const handleHover = () => {
    if (soundEnabled) soundManager.playHover();
  };

  return (
    <header className="relative z-10 overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all text-[var(--foreground)] dark:border-pink-500/30">

      {/* Background Subtle SaaS Lighting Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">

        {/* Left Side: Sleek SaaS Hero Typography */}
        <div className="space-y-4">

          {/* SaaS Pill Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/40 bg-pink-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-300 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-yellow-300" />
              Pro Gaming Suite &bull; Bingo Blitz Edition
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider border ${
                isWon
                  ? "border-yellow-400 bg-yellow-400/20 text-amber-800 dark:text-yellow-300 animate-pulse"
                  : gameStarted
                    ? "border-teal-400 bg-teal-500/20 text-teal-700 dark:text-teal-300"
                    : "border-purple-400/40 bg-purple-500/10 text-purple-700 dark:text-purple-200"
              }`}
            >
              {isWon ? "🏆 BINGO VICTORY!" : gameStarted ? "⚡ GAME ACTIVE" : "🟢 READY TO PLAY"}
            </span>
          </div>

          {/* SaaS Hero Title */}
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl leading-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 dark:from-yellow-300 dark:via-pink-300 dark:to-purple-300 filter drop-shadow">
              Bingo Blitz Studio
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[var(--muted-foreground)] dark:text-pink-200/90 font-medium max-w-xl leading-relaxed">
              Experience modern 5x5 Bingo online with real-time 3D physics, auto-marking, crisp vector daubs, and instant win detection.
            </p>
          </div>

          {/* Minimalist SaaS Inline Metric Pills (No Heavy Cards) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">

            {/* Level Pill */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onMouseEnter={handleHover}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-black text-indigo-700 dark:text-indigo-300"
            >
              <Award className="h-4 w-4 text-indigo-500" />
              <span>Lv. 5 Blitz Master</span>
            </motion.div>

            {/* Coins / Points Pill */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onMouseEnter={handleHover}
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-black text-amber-800 dark:text-yellow-300"
            >
              <Coins className="h-4 w-4 text-amber-500 dark:text-yellow-300 animate-bounce" />
              <span>{(stats.gamesWon * 250 + stats.gamesPlayed * 50).toLocaleString()} PTS</span>
            </motion.div>

            {/* Streak Pill */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onMouseEnter={handleHover}
              className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-black text-rose-700 dark:text-rose-300"
            >
              <Flame className="h-4 w-4 text-rose-500" />
              <span>{stats.gamesWon > 0 ? `${stats.gamesWon} 🔥 Streak` : "0 Streak"}</span>
            </motion.div>

            {/* Win Rate Pill */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onMouseEnter={handleHover}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300"
            >
              <Trophy className="h-4 w-4 text-emerald-500" />
              <span>{stats.winPercentage}% Win Rate</span>
            </motion.div>

          </div>

        </div>

        {/* Right Side: Interactive 3D WebGL Model */}
        <div className="flex justify-center lg:justify-end">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <Bingo3DModel className="h-48 w-48 sm:h-56 sm:w-56" />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-0.5 text-[10px] font-bold text-pink-300 uppercase tracking-widest border border-pink-400/30">
              Interactive 3D Globe
            </span>
          </motion.div>
        </div>

      </div>
    </header>
  );
}
