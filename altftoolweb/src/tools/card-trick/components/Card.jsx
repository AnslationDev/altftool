"use client";

import { motion } from "framer-motion";
import { CARD_THEMES } from "../utils/deck";

// A single playing card with a smooth 3D flip (rotateY). The outer element
// owns the perspective + layout; the inner element rotates. Front and back
// faces use backfaceVisibility:hidden so only one shows at a time.
export default function Card({
  card,
  faceUp = false,
  theme = "classic",
  size = 64,
  onClick,
  disabled = false,
  highlight = false,
  dimmed = false,
  ariaLabel,
  style,
}) {
  const t = CARD_THEMES[theme] || CARD_THEMES.classic;
  const isRed = card?.color === "red";
  // Each theme defines its own AA-contrast-safe red (see utils/deck.js) —
  // a single fixed red cannot clear 4.5:1 against every theme's face bg.
  const faceTextColor = isRed ? t.faceTextRed : t.faceText;

  return (
    <motion.button
      type="button"
      layout
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel || (card ? `Card ${card.name}` : "Face-down card")}
      whileHover={disabled ? undefined : { y: -6, scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`relative shrink-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-(--primary) ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
      style={{
        width: size,
        height: size * 1.4,
        perspective: 900,
        opacity: dimmed ? 0.35 : 1,
        ...style,
      }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: faceUp ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0.1, 0.2, 1] }}
      >
        {/* Back face (visible when face down) */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl border border-white/10 shadow-md"
          style={{ backfaceVisibility: "hidden", background: t.back }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 6px, transparent 6px 12px)",
            }}
          />
          <span
            className="relative text-2xl"
            style={{ color: t.backAccent }}
            aria-hidden
          >
            ✦
          </span>
        </div>

        {/* Front face (visible when face up) */}
        <div
          className="absolute inset-0 flex flex-col justify-between rounded-xl border border-black/5 p-1.5 shadow-md"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: t.face,
          }}
        >
          <div
            className="absolute inset-0 rounded-xl"
            style={{ background: t.pip }}
            aria-hidden
          />
          <div
            className="relative flex items-center gap-0.5 font-bold leading-none"
            style={{ color: faceTextColor }}
          >
            <span style={{ fontSize: size * 0.2 }}>{card?.rankLabel}</span>
            <span style={{ fontSize: size * 0.16 }}>{card?.suitSymbol}</span>
          </div>
          <div
            className="relative flex items-center justify-center font-black"
            style={{ color: faceTextColor, fontSize: size * 0.42 }}
            aria-hidden
          >
            {card?.suitSymbol}
          </div>
          <div
            className="relative flex rotate-180 items-center gap-0.5 font-bold leading-none"
            style={{ color: faceTextColor }}
          >
            <span style={{ fontSize: size * 0.2 }}>{card?.rankLabel}</span>
            <span style={{ fontSize: size * 0.16 }}>{card?.suitSymbol}</span>
          </div>
        </div>
      </motion.div>

      {highlight && (
        <motion.span
          className="pointer-events-none absolute -inset-1 rounded-2xl"
          style={{ boxShadow: `0 0 0 3px ${t.backAccent}, 0 0 24px ${t.backAccent}` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          aria-hidden
        />
      )}
    </motion.button>
  );
}
