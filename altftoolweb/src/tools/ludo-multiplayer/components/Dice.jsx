"use client";

import { motion, AnimatePresence } from "framer-motion";

const PIP_LAYOUT = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const DICE_THEMES = {
  classic: {
    face: "from-white to-slate-100",
    border: "border-slate-200",
    pip: "bg-slate-800",
    glow: "shadow-slate-300/50",
  },
  neon: {
    face: "from-slate-900 to-cyan-950",
    border: "border-cyan-400/60",
    pip: "bg-cyan-300",
    glow: "shadow-cyan-400/40",
  },
  gold: {
    face: "from-amber-50 to-amber-200",
    border: "border-amber-400",
    pip: "bg-amber-700",
    glow: "shadow-amber-300/50",
  },
};

export default function Dice({ value, rolling, onRoll, disabled, theme = "classic" }) {
  const t = DICE_THEMES[theme] || DICE_THEMES.classic;
  const pips = PIP_LAYOUT[value] || [];

  return (
    <motion.button
      type="button"
      onClick={onRoll}
      disabled={disabled || rolling}
      whileHover={{ scale: disabled ? 1 : 1.06 }}
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      className={`relative w-24 h-24 rounded-3xl border-2 ${t.border} ${t.face} shadow-xl ${
        t.glow
      } cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center select-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)`}
      aria-label="Roll dice"
    >
      <AnimatePresence mode="wait">
        {rolling ? (
          <motion.div
            key="rolling"
            initial={{ rotate: 0, scale: 1 }}
            animate={{ rotate: [0, 360, 720], scale: [1, 1.18, 1] }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="text-4xl font-black text-(--primary)"
          >
            ?
          </motion.div>
        ) : (
          <motion.div
            key={value}
            initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="grid grid-cols-3 grid-rows-3 gap-1.5 w-16 h-16"
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                {pips.includes(i) && (
                  <span className={`w-3 h-3 rounded-full ${t.pip} shadow-inner`} />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
