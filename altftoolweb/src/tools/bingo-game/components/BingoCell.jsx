"use client";

import { motion } from "framer-motion";
import { Star, Trophy, Heart } from "lucide-react";
import { soundManager } from "../utils/soundEffects";

// Variety daub icons inspired by Bingo Blitz (Star, Trophy, Cat, Heart)
function getDaubStyle(row, col) {
  const mod = (row * 5 + col) % 4;
  if (mod === 0) {
    return {
      bg: "bg-gradient-to-tr from-rose-600 via-red-500 to-rose-400 border-2 border-red-300 shadow-rose-500/50",
      content: <Star className="h-6 w-6 text-white fill-white filter drop-shadow-md" />,
    };
  } else if (mod === 1) {
    return {
      bg: "bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 border-2 border-yellow-200 shadow-amber-500/50",
      content: <Trophy className="h-6 w-6 text-slate-950 fill-slate-950 filter drop-shadow-md" />,
    };
  } else if (mod === 2) {
    return {
      bg: "bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 border-2 border-sky-200 shadow-sky-500/50",
      content: <span className="text-xl filter drop-shadow-md">🐱</span>,
    };
  } else {
    return {
      bg: "bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 border-2 border-pink-200 shadow-pink-500/50",
      content: <Heart className="h-6 w-6 text-white fill-white filter drop-shadow-md" />,
    };
  }
}

export default function BingoCell({
  cell,
  row,
  col,
  isMarked,
  onClick,
  disabled,
  isWinning,
  soundEnabled = true,
}) {
  const handleMouseEnter = () => {
    if (!disabled && soundEnabled) {
      soundManager.playHover();
    }
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      if (soundEnabled) soundManager.playMark();
      onClick();
    }
  };

  const daub = getDaubStyle(row, col);

  return (
    <motion.button
      type="button"
      role="gridcell"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.08, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.92 } : {}}
      aria-label={
        cell.isFree
          ? "Free space"
          : `${cell.letter}-${cell.number}${isMarked ? ", marked" : ""}`
      }
      className={`relative flex aspect-square select-none flex-col items-center justify-center rounded-2xl text-base font-black transition-all duration-200 focus:outline-none ${
        isWinning
          ? "border-4 border-yellow-300 bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_30px_rgba(250,204,21,0.9)] animate-pulse z-10 rounded-2xl"
          : cell.isFree
            ? "border-b-4 border-amber-600 bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 text-slate-950 shadow-lg rounded-2xl cursor-default"
            : isMarked
              ? "border-2 border-pink-300 bg-pink-100 dark:bg-[#3d134d] text-white shadow-inner rounded-2xl"
              : "border-b-4 border-slate-300 bg-gradient-to-b from-white via-slate-50 to-slate-200 text-slate-900 shadow-md hover:brightness-105 rounded-2xl"
      } ${disabled && !cell.isFree && !isMarked ? "opacity-90 cursor-default" : ""} ${
        !disabled ? "cursor-pointer" : ""
      }`}
    >
      {/* FREE Space Tile */}
      {cell.isFree ? (
        <div className="relative z-10 flex flex-col items-center justify-center">
          <Trophy className="h-6 w-6 text-slate-950 fill-amber-300 animate-bounce filter drop-shadow" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-950">
            FREE
          </span>
        </div>
      ) : isMarked ? (
        /* Marked Daub Badge (Red Star, Blue Cat, Yellow Trophy, Pink Heart) */
        <motion.div
          initial={{ scale: 0.2, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={`flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full shadow-lg ${daub.bg}`}
        >
          {daub.content}
        </motion.div>
      ) : (
        /* Unmarked Tile */
        <div className="relative z-10 flex flex-col items-center justify-center leading-none">
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-sans tracking-tight">
            {cell.number}
          </span>
        </div>
      )}
    </motion.button>
  );
}
