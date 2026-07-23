"use client";

import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Clock } from "lucide-react";

export default function GameStats({ stats }) {
  return (
    <div className="rounded-3xl border-4 border-pink-400/60 bg-[var(--card)] p-5 shadow-xl text-[var(--foreground)] dark:bg-gradient-to-b dark:from-[#3d134d] dark:via-[#2a0e36] dark:to-[#180521] dark:border-pink-400/80 dark:shadow-[0_0_35px_rgba(236,72,153,0.3)]">
      <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 dark:text-pink-300">
        Performance
      </span>
      <h2 className="text-xl font-black text-[var(--foreground)] dark:text-white">Your Stats</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* Won */}
        <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          className="rounded-2xl border-2 border-amber-400/40 bg-amber-500/10 dark:bg-[#250831] p-3.5 text-center shadow-inner"
        >
          <Trophy className="mx-auto h-5 w-5 text-amber-500 dark:text-yellow-300 filter drop-shadow" />
          <p className="mt-1.5 text-2xl font-black text-amber-800 dark:text-yellow-300">{stats.gamesWon}</p>
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-pink-200">
            Games Won
          </p>
        </motion.div>

        {/* Played */}
        <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          className="rounded-2xl border-2 border-pink-400/30 bg-[var(--muted)]/50 dark:bg-[#250831] p-3.5 text-center"
        >
          <Target className="mx-auto h-5 w-5 text-sky-500 dark:text-sky-400" />
          <p className="mt-1.5 text-2xl font-black text-[var(--foreground)] dark:text-white">{stats.gamesPlayed}</p>
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] dark:text-pink-200">
            Total Played
          </p>
        </motion.div>

        {/* Win Rate */}
        <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          className="rounded-2xl border-2 border-emerald-400/40 bg-emerald-500/10 dark:bg-[#250831] p-3.5 text-center"
        >
          <TrendingUp className="mx-auto h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <p className="mt-1.5 text-2xl font-black text-emerald-800 dark:text-emerald-300">{stats.winPercentage}%</p>
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-200">
            Win Rate
          </p>
        </motion.div>

        {/* Fastest */}
        <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          className="rounded-2xl border-2 border-pink-400/30 bg-[var(--muted)]/50 dark:bg-[#250831] p-3.5 text-center"
        >
          <Clock className="mx-auto h-5 w-5 text-rose-500 dark:text-rose-400" />
          <p className="mt-1.5 text-2xl font-black text-[var(--foreground)] dark:text-white">
            {stats.fastestWin ? `${stats.fastestWin}s` : "--"}
          </p>
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] dark:text-pink-200">
            Fastest Win
          </p>
        </motion.div>
      </div>
    </div>
  );
}
