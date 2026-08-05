"use client";

import { motion } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";
import { baloo2 } from "../lib/fonts";

const ORBIT_TILES = [
  { emoji: "🎧", size: 90, delay: 0.05, floatDelay: 0, className: "top-[2%] left-1/2 -translate-x-1/2" },
  { emoji: "🕶️", size: 60, delay: 0.14, floatDelay: 0.5, className: "top-[18%] right-[4%]" },
  { emoji: "👟", size: 78, delay: 0.22, floatDelay: 1, className: "bottom-[14%] right-0" },
  { emoji: "📷", size: 78, delay: 0.3, floatDelay: 1.5, className: "bottom-0 left-1/2 -translate-x-1/2" },
  { emoji: "🎮", size: 78, delay: 0.38, floatDelay: 2, className: "bottom-[14%] left-0" },
  { emoji: "🛍️", size: 60, delay: 0.46, floatDelay: 2.5, className: "top-[18%] left-[4%]" },
];

const POP_EASE = [0.34, 1.56, 0.64, 1];

// function OrbitTile({ emoji, size, delay, floatDelay, className }) {
//   return (
//     <motion.div
//       className={`absolute hidden items-center justify-center md:flex ${className}`}
//       style={{ width: size, height: size }}
//       initial={{ opacity: 0, scale: 0.4 }}
//       animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
//       transition={{
//         opacity: { duration: 0.55, delay },
//         scale: { duration: 0.55, delay, ease: POP_EASE },
//         y: { duration: 3, delay: delay + 0.55, repeat: Infinity, ease: "easeInOut" },
//       }}
//     >
//       <button
//         type="button"
//         aria-hidden="true"
//         tabIndex={-1}
//         className="flex h-full w-full items-center justify-center rounded-full border-[3px] border-[#171717] bg-[#ffffff] text-5xl shadow-[5px_5px_0_#171717] transition-transform duration-200 hover:scale-[1.18] hover:shadow-[7px_7px_0_#FF5A5F]"
//       >
//         {emoji}
//       </button>
//     </motion.div>
//   );
// }

function OrbitTile({ emoji, size, delay, floatDelay, className }) {
  return (
    <motion.div
      className={`absolute hidden items-center justify-center md:flex ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { duration: 0.55, delay },
        scale: { duration: 0.55, delay, ease: POP_EASE },
        y: { duration: 3, delay: delay + 0.55, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        style={{ fontSize: size * 0.62, lineHeight: 1 }}
        className="flex h-full w-full items-center justify-center rounded-full border-[3px] border-[#171717] bg-[#ffffff] shadow-[5px_5px_0_#171717] transition-transform duration-200 hover:scale-[1.18] hover:shadow-[7px_7px_0_#FF5A5F]"
      >
        {emoji}
      </button>
    </motion.div>
  );
}

export default function HeroSection({ onExplore, onTopDiscounts }) {
  return (
    <section className={`${baloo2.className} tdp-hero-orbit relative flex min-h-[86vh] items-center justify-center overflow-hidden px-10 pb-24 pt-10`}>
      <div className="relative flex aspect-square w-full max-w-[720px] items-center justify-center">
        {ORBIT_TILES.map((tile) => (
          <OrbitTile key={tile.emoji} {...tile} />
        ))}

        {/* Center content */}
        <div className="relative z-[2] flex max-w-[460px] flex-col items-center gap-5 text-center">
          <div className="tdp-hero-burst" aria-hidden="true" />

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="-rotate-3 inline-flex items-center gap-2 rounded-full border-[3px] border-[#171717] bg-[#FF5A5F] px-[18px] py-[7px] text-[13px] font-semibold text-white shadow-[3px_3px_0_#171717]"
          >
            <span className="relative flex h-[7px] w-[7px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ffffff] opacity-75" />
              <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-[#ffffff]" />
            </span>
            LIVE NOW
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(32px,4.6vw,58px)] font-extrabold leading-[1.08] text-[#171717]"
          >
            Today&apos;s Best Amazon Deals
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="text-base font-medium text-[#5b5648]"
            style={{ fontFamily: "var(--font-inter, sans-serif)" }}
          >
            Discover the biggest discounts on Amazon — updated daily with handpicked offers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-1 flex flex-wrap items-center justify-center gap-3.5"
          >
            <button
              type="button"
              onClick={onExplore}
              className="inline-flex items-center gap-2 rounded-xl border-[3px] border-[#171717] bg-[#4CC9F0] px-6 py-3.5 text-sm font-bold text-[#171717] shadow-[4px_4px_0_#171717] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#171717]"
            >
              Explore Deals
              <ArrowRight size={16} strokeWidth={2.6} />
            </button>
            <button
              type="button"
              onClick={onTopDiscounts}
              className="inline-flex items-center gap-2 rounded-xl border-[3px] border-[#171717] bg-[#ffffff] px-6 py-3.5 text-sm font-bold text-[#171717] shadow-[4px_4px_0_#171717] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#171717]"
            >
              <Flame size={16} strokeWidth={2.6} />
              Top Discounts
            </button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="tdp-scroll-indicator absolute bottom-[26px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-xs font-semibold tracking-[0.1em] text-[#171717]"
      >
        SCROLL
        <span className="text-base leading-none">⌄</span>
      </motion.div>
    </section>
  );
}
