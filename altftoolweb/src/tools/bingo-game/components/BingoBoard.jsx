"use client";

import { motion } from "framer-motion";
import BingoCell from "./BingoCell";

const HEART_COLORS = {
  B: {
    gradient: "url(#heart-red)",
    shadow: "drop-shadow-[0_4px_8px_rgba(239,68,68,0.5)]",
    letter: "B",
  },
  I: {
    gradient: "url(#heart-yellow)",
    shadow: "drop-shadow-[0_4px_8px_rgba(245,158,11,0.5)]",
    letter: "I",
  },
  N: {
    gradient: "url(#heart-green)",
    shadow: "drop-shadow-[0_4px_8px_rgba(16,185,129,0.5)]",
    letter: "N",
  },
  G: {
    gradient: "url(#heart-blue)",
    shadow: "drop-shadow-[0_4px_8px_rgba(59,130,246,0.5)]",
    letter: "G",
  },
  O: {
    gradient: "url(#heart-purple)",
    shadow: "drop-shadow-[0_4px_8px_rgba(168,85,247,0.5)]",
    letter: "O",
  },
};

function HeartBadge({ letter }) {
  const config = HEART_COLORS[letter];
  return (
    <motion.div
      whileHover={{ scale: 1.15, y: -3 }}
      className="relative flex aspect-square items-center justify-center cursor-pointer select-none"
    >
      <svg
        viewBox="0 0 100 100"
        className={`h-full w-full ${config.shadow} filter`}
      >
        <defs>
          <linearGradient id="heart-red" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id="heart-yellow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="heart-green" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="heart-blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="heart-purple" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
        </defs>

        {/* 3D Heart Shape */}
        <path
          d="M 50,88 C 20,65 5,45 5,28 C 5,12 18,3 32,3 C 41,3 47,8 50,13 C 53,8 59,3 68,3 C 82,3 95,12 95,28 C 95,45 80,65 50,88 Z"
          fill={config.gradient}
          stroke="#ffffff"
          strokeWidth="3"
        />

        {/* Top Gloss Highlight */}
        <ellipse cx="32" cy="18" rx="10" ry="5" fill="#ffffff" opacity="0.4" />
      </svg>

      {/* Letter Overlay */}
      <span className="absolute text-xl sm:text-2xl font-black text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
        {letter}
      </span>
    </motion.div>
  );
}

export default function BingoBoard({
  board,
  markedCells,
  onCellClick,
  disabled,
  winningCells,
  soundEnabled = true,
}) {
  return (
    <div className="mx-auto w-full max-w-[460px] rounded-3xl border-4 border-pink-400 bg-pink-100/90 p-3.5 sm:p-5 shadow-xl text-[var(--foreground)] dark:bg-gradient-to-b dark:from-[#3d134d] dark:via-[#2a0e36] dark:to-[#180521] dark:border-pink-400/80 dark:shadow-[0_0_40px_rgba(236,72,153,0.35)]">
      <div
        className="grid grid-cols-5 gap-2 sm:gap-3"
        role="grid"
        aria-label="Bingo board"
      >
        {/* Heart-Shaped B-I-N-G-O Column Headers */}
        {["B", "I", "N", "G", "O"].map((letter) => (
          <HeartBadge key={letter} letter={letter} />
        ))}

        {/* 5x5 Grid Cells */}
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            return (
              <BingoCell
                key={key}
                cell={cell}
                row={rowIndex}
                col={colIndex}
                isMarked={markedCells.has(key)}
                isWinning={winningCells.has(key)}
                onClick={() => onCellClick(rowIndex, colIndex)}
                disabled={disabled || cell.isFree || markedCells.has(key)}
                soundEnabled={soundEnabled}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
