"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dices, Play, Square, Clock } from "lucide-react";
import { getLetterForNumber } from "../utils/bingoLogic";
import { soundManager } from "../utils/soundEffects";

const BALL_COLORS = {
  B: "from-rose-500 via-red-600 to-rose-700 shadow-rose-500/40 text-white",
  I: "from-yellow-400 via-amber-500 to-amber-600 shadow-yellow-500/40 text-slate-950",
  N: "from-emerald-400 via-green-500 to-emerald-600 shadow-emerald-500/40 text-white",
  G: "from-sky-400 via-blue-500 to-blue-600 shadow-blue-500/40 text-white",
  O: "from-purple-500 via-fuchsia-600 to-purple-700 shadow-purple-500/40 text-white",
};

export default function NumberCaller({
  calledNumbers,
  currentNumber,
  calledLetters,
  onManualCall,
  onAutoCall,
  autoCallActive,
  autoCallSpeed,
  onSpeedChange,
  gameOver,
  soundEnabled = true,
}) {
  const currentLetter = currentNumber ? getLetterForNumber(currentNumber) : null;

  const handleCall = () => {
    if (soundEnabled) soundManager.playNumberDraw();
    onManualCall();
  };

  const handleAutoToggle = () => {
    if (soundEnabled) soundManager.playClick();
    onAutoCall();
  };

  return (
    <div className="rounded-3xl border-4 border-pink-400/60 bg-[var(--card)] p-5 shadow-xl text-[var(--foreground)] dark:bg-gradient-to-b dark:from-[#3d134d] dark:via-[#2a0e36] dark:to-[#180521] dark:border-pink-400/80 dark:shadow-[0_0_35px_rgba(236,72,153,0.3)]">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 dark:text-pink-300">
            Number Generator
          </span>
          <h2 className="text-xl font-black text-[var(--foreground)] dark:text-white">Number Caller</h2>
        </div>

        {/* Counter Badge */}
        <div className="rounded-full border border-pink-400/40 bg-pink-500/20 px-3 py-1 text-xs font-black text-pink-700 dark:text-pink-200">
          <span className="text-amber-600 dark:text-yellow-300">{calledNumbers.length}</span> / 75 Called
        </div>
      </div>

      {/* Main Animated 3D Ball Display */}
      <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-pink-400/40 bg-[var(--muted)]/50 dark:bg-[#1e0728] p-6 shadow-inner relative overflow-hidden">
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] dark:text-pink-300">
          Current Call
        </p>

        {currentNumber ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNumber}
              initial={{ scale: 0.3, rotateY: 180, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="mt-3 flex flex-col items-center"
            >
              <div
                className={`relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-gradient-to-br ${
                  BALL_COLORS[currentLetter] || "from-pink-500 to-rose-600"
                } shadow-2xl border-4 border-white text-white`}
              >
                {/* 3D Ball Shine Overlay */}
                <div className="absolute top-2 left-4 h-6 w-8 rounded-full bg-white/40 blur-[1px]" />

                <div className="flex flex-col items-center leading-none">
                  <span className="text-xs font-black uppercase tracking-widest opacity-90">
                    {currentLetter}
                  </span>
                  <span className="text-3xl font-black tracking-tight sm:text-4xl filter drop-shadow-md">
                    {currentNumber}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm font-black text-[var(--foreground)] dark:text-white">
                Ball Drawn: <span className="text-amber-600 dark:text-yellow-300 font-black">{currentLetter}-{currentNumber}</span>
              </p>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="mt-4 py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-pink-400/40 bg-pink-500/20 text-pink-600 dark:text-pink-300">
              <Dices className="h-8 w-8 animate-pulse text-amber-500 dark:text-yellow-300" />
            </div>
            <p className="mt-3 text-xs font-bold text-[var(--muted-foreground)] dark:text-pink-200">
              Press Call Number to draw first ball!
            </p>
          </div>
        )}
      </div>

      {/* Letter Distribution Tracker */}
      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {["B", "I", "N", "G", "O"].map((letter) => (
          <div
            key={letter}
            className="rounded-xl border border-pink-400/30 bg-[var(--muted)] dark:bg-[#250831] p-2 text-center"
          >
            <p className="text-[10px] font-black uppercase text-[var(--muted-foreground)] dark:text-pink-300">{letter}</p>
            <p className="text-sm font-black text-amber-600 dark:text-yellow-300">
              {calledLetters[letter] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Called History (Lottery Balls Track) */}
      {calledNumbers.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] dark:text-pink-300">
              Recent Calls
            </p>
            <span className="text-[10px] text-[var(--muted-foreground)] dark:text-pink-300">Latest &rarr;</span>
          </div>

          <div className="mt-2 flex overflow-x-auto gap-2 py-1 scrollbar-thin scrollbar-thumb-pink-700">
            {calledNumbers.slice(-12).reverse().map((num, idx) => {
              const letter = getLetterForNumber(num);
              return (
                <motion.div
                  key={`${num}-${idx}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${
                    BALL_COLORS[letter] || "from-pink-500 to-purple-600"
                  } border-2 border-white text-xs font-black shadow-md`}
                >
                  {letter}{num}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Action Buttons: Chunky 3D Candy Button */}
      <div className="mt-5 flex flex-col gap-2.5">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleCall}
          onMouseEnter={() => soundEnabled && soundManager.playHover()}
          disabled={gameOver || calledNumbers.length >= 75}
          className="relative inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl border-b-4 border-emerald-800 bg-gradient-to-b from-emerald-400 via-emerald-500 to-green-600 px-5 text-base font-black uppercase tracking-wider text-white shadow-xl transition-all disabled:opacity-50 cursor-pointer"
        >
          <Dices className="h-6 w-6" />
          Call Next Number
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAutoToggle}
          disabled={gameOver || calledNumbers.length >= 75}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border-b-4 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            autoCallActive
              ? "border-amber-700 bg-amber-500 text-slate-950 shadow-lg"
              : "border-pink-500/50 bg-pink-500/20 text-[var(--foreground)] dark:text-white hover:bg-pink-500/30"
          }`}
        >
          {autoCallActive ? (
            <>
              <Square className="h-4 w-4 fill-slate-950" />
              Stop Auto Call
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current text-amber-500 dark:text-yellow-300" />
              Start Auto Call
            </>
          )}
        </motion.button>
      </div>

      {/* Speed Slider */}
      <div className="mt-4 rounded-xl border border-pink-400/30 bg-[var(--muted)] dark:bg-[#250831] p-3">
        <div className="flex items-center justify-between text-xs font-black text-[var(--foreground)] dark:text-white">
          <span className="flex items-center gap-1.5 text-[var(--muted-foreground)] dark:text-pink-300">
            <Clock className="h-3.5 w-3.5 text-amber-500 dark:text-yellow-300" />
            Auto Speed
          </span>
          <span className="text-amber-600 dark:text-yellow-300">{autoCallSpeed / 1000}s per draw</span>
        </div>
        <input
          type="range"
          min={1000}
          max={5000}
          step={500}
          value={autoCallSpeed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="mt-2.5 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--border)] dark:bg-slate-900 accent-teal-500 dark:accent-yellow-400"
        />
      </div>
    </div>
  );
}
