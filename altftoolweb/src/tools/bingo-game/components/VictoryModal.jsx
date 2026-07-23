"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, RotateCcw, Clock, Hash } from "lucide-react";
import { soundManager } from "../utils/soundEffects";

export default function VictoryModal({
  isOpen,
  winPatternLabel,
  timer,
  calledCount,
  onPlayAgain,
  soundEnabled,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          onClick={onPlayAgain}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border-4 border-yellow-300 bg-gradient-to-b from-[#4a1c3e] via-[#2b1029] to-[#180718] p-6 text-center shadow-[0_0_60px_rgba(250,204,21,0.5)] sm:p-8 text-white"
        >
          {/* Top Radial Glow Effect */}
          <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-500/30 blur-3xl pointer-events-none" />

          {/* Trophy Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.1, damping: 12 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 shadow-xl shadow-yellow-500/50 border-2 border-white text-slate-950"
          >
            <Trophy className="h-10 w-10 filter drop-shadow-md" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-yellow-300 bg-yellow-400/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-yellow-300">
              <Sparkles className="h-3.5 w-3.5" />
              Bingo Blitz Victory!
            </div>

            <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl text-yellow-300 filter drop-shadow">
              BINGO!!
            </h2>
            <p className="mt-1 text-base font-black text-pink-200">
              {winPatternLabel}
            </p>
          </motion.div>

          {/* Match Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 grid grid-cols-2 gap-3"
          >
            <div className="rounded-2xl border border-pink-400/30 bg-[#250831] p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-pink-200">
                <Clock className="h-4 w-4 text-yellow-300" />
                Time Elapsed
              </div>
              <p className="mt-1 text-2xl font-black text-white">{timer}s</p>
            </div>

            <div className="rounded-2xl border border-pink-400/30 bg-[#250831] p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-pink-200">
                <Hash className="h-4 w-4 text-yellow-300" />
                Calls Required
              </div>
              <p className="mt-1 text-2xl font-black text-white">{calledCount}</p>
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onMouseEnter={() => soundEnabled && soundManager.playHover()}
              onClick={() => {
                if (soundEnabled) soundManager.playClick();
                onPlayAgain();
              }}
              type="button"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border-b-4 border-emerald-800 bg-gradient-to-b from-emerald-400 to-green-600 px-6 py-4 text-base font-black uppercase tracking-wider text-white shadow-xl transition-all cursor-pointer"
            >
              <RotateCcw className="h-5 w-5" />
              Play Again
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
