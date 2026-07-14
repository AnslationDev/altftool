"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Layers } from "lucide-react";
import { CARD_THEMES } from "../utils/deck";

// Visual stack of the remaining deck: a few offset card backs plus a count
// badge. When `shuffling` is true it plays a quick riffle-style wiggle.
export default function Deck({ count, theme = "classic", shuffling = false, size = 64, onShuffle }) {
  const t = CARD_THEMES[theme] || CARD_THEMES.classic;
  const layers = Math.min(5, Math.max(0, count));

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        type="button"
        onClick={onShuffle}
        aria-label="Shuffle the deck"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="relative cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
        style={{ width: size, height: size * 1.4 }}
      >
        {Array.from({ length: layers }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-xl border border-white/10 shadow-md"
            style={{ background: t.back }}
            animate={
              shuffling
                ? { x: [0, (i % 2 ? 6 : -6), 0], rotate: [0, (i % 2 ? 3 : -3), 0] }
                : { x: i * 1.5, y: -i * 1.5, rotate: i * 0.6 }
            }
            transition={
              shuffling
                ? { duration: 0.5, repeat: 1 }
                : { type: "spring", stiffness: 300, damping: 24 }
            }
          >
            <div
              className="absolute inset-0 flex items-center justify-center opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 6px, transparent 6px 12px)",
              }}
            />
            <span
              className="relative flex h-full items-center justify-center text-xl"
              style={{ color: t.backAccent }}
              aria-hidden
            >
              ✦
            </span>
          </motion.div>
        ))}

        {count === 0 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-(--border) bg-(--muted) text-(--muted-foreground)">
            <Layers size={size * 0.4} />
          </div>
        )}
      </motion.button>

      <div className="flex items-center gap-2 text-sm text-(--muted-foreground)">
        <Layers size={14} />
        <span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={count}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              className="font-semibold text-(--foreground)"
            >
              {count}
            </motion.span>
          </AnimatePresence>{" "}
          cards left
        </span>
      </div>
    </div>
  );
}
