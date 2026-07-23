"use client";

import { motion } from "framer-motion";
import { Gamepad2, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, CheckSquare, Square } from "lucide-react";
import { soundManager } from "../utils/soundEffects";

export default function GameControls({
  gameStarted,
  gameOver,
  autoMark,
  onNewGame,
  onRestartGame,
  onResetBoard,
  onToggleAutoMark,
  soundEnabled,
  onToggleSound,
  fullscreen,
  onToggleFullscreen,
}) {
  const handleClick = (fn) => {
    if (soundEnabled) soundManager.playClick();
    fn();
  };

  const handleHover = () => {
    if (soundEnabled) soundManager.playHover();
  };

  return (
    <div className="rounded-3xl border-4 border-pink-400/60 bg-[var(--card)] p-5 shadow-xl text-[var(--foreground)] dark:bg-gradient-to-b dark:from-[#3d134d] dark:via-[#2a0e36] dark:to-[#180521] dark:border-pink-400/80 dark:shadow-[0_0_35px_rgba(236,72,153,0.3)]">
      <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 dark:text-pink-300">
        Control Center
      </span>
      <h2 className="text-xl font-black text-[var(--foreground)] dark:text-white">Game Actions</h2>

      {/* Main Game Reset Buttons */}
      <div className="mt-4 flex flex-col gap-2.5">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onMouseEnter={handleHover}
          onClick={() => handleClick(onNewGame)}
          className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border-b-4 border-emerald-800 bg-gradient-to-b from-emerald-400 to-green-600 px-4 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all cursor-pointer"
        >
          <Gamepad2 className="h-4 w-4" />
          🎮 New Game
        </motion.button>

        {gameStarted && !gameOver && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={handleHover}
            onClick={() => handleClick(onRestartGame)}
            className="inline-flex h-11 items-center justify-center gap-2.5 rounded-2xl border-b-4 border-purple-800 bg-purple-600 px-4 text-xs font-black uppercase tracking-wider text-white hover:bg-purple-500 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            🔄 Restart Game
          </motion.button>
        )}

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={handleHover}
          onClick={() => handleClick(onResetBoard)}
          className="inline-flex h-11 items-center justify-center gap-2.5 rounded-2xl border-b-4 border-pink-800 bg-pink-600 px-4 text-xs font-black uppercase tracking-wider text-white hover:bg-pink-500 transition-all cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          🎲 New Board
        </motion.button>
      </div>

      {/* Toggles */}
      <div className="mt-4 space-y-2">
        {/* Auto Mark Toggle */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={handleHover}
          onClick={() => handleClick(onToggleAutoMark)}
          className={`inline-flex h-10 w-full items-center justify-between rounded-xl border-2 px-3.5 text-xs font-black transition-all cursor-pointer ${
            autoMark
              ? "border-pink-400 bg-pink-500/20 text-pink-700 dark:text-yellow-300"
              : "border-pink-500/30 bg-[var(--muted)] text-[var(--muted-foreground)] dark:bg-[#250831] dark:text-pink-200"
          }`}
        >
          <span className="flex items-center gap-2">
            {autoMark ? <CheckSquare className="h-4 w-4 text-amber-500 dark:text-yellow-300" /> : <Square className="h-4 w-4" />}
            Auto Mark Numbers
          </span>
          <span className="rounded-full bg-pink-200 dark:bg-pink-950 px-2 py-0.5 text-[10px] uppercase font-black text-pink-900 dark:text-white">
            {autoMark ? "ON" : "OFF"}
          </span>
        </motion.button>

        {/* Sound Toggle */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={handleHover}
          onClick={() => handleClick(onToggleSound)}
          className={`inline-flex h-10 w-full items-center justify-between rounded-xl border-2 px-3.5 text-xs font-black transition-all cursor-pointer ${
            soundEnabled
              ? "border-indigo-400 bg-indigo-500/20 text-indigo-700 dark:text-yellow-300"
              : "border-pink-500/30 bg-[var(--muted)] text-[var(--muted-foreground)] dark:bg-[#250831] dark:text-pink-200"
          }`}
        >
          <span className="flex items-center gap-2">
            {soundEnabled ? <Volume2 className="h-4 w-4 text-indigo-600 dark:text-yellow-300" /> : <VolumeX className="h-4 w-4" />}
            Audio SFX
          </span>
          <span className="rounded-full bg-indigo-200 dark:bg-pink-950 px-2 py-0.5 text-[10px] uppercase font-black text-indigo-900 dark:text-white">
            {soundEnabled ? "ON" : "OFF"}
          </span>
        </motion.button>

        {/* Fullscreen Toggle */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={handleHover}
          onClick={() => handleClick(onToggleFullscreen)}
          className={`inline-flex h-10 w-full items-center justify-between rounded-xl border-2 px-3.5 text-xs font-black transition-all cursor-pointer ${
            fullscreen
              ? "border-purple-400 bg-purple-500/20 text-purple-700 dark:text-yellow-300"
              : "border-pink-500/30 bg-[var(--muted)] text-[var(--muted-foreground)] dark:bg-[#250831] dark:text-pink-200"
          }`}
        >
          <span className="flex items-center gap-2">
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            Fullscreen View
          </span>
          <span className="rounded-full bg-purple-200 dark:bg-pink-950 px-2 py-0.5 text-[10px] uppercase font-black text-purple-900 dark:text-white">
            {fullscreen ? "EXIT" : "ENTER"}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
