"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import Card from "./Card";

// Dramatic full-screen reveal of a single card: backdrop blur, glowing ring,
// scale + rotate entrance. Confetti is fired by the page via canvas-confetti.
export default function Reveal({ open, card, theme, title, subtitle, onClose }) {
  return (
    <AnimatePresence>
      {open && card && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title || "Magic reveal"}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <motion.div
            className="relative flex flex-col items-center gap-5"
            initial={{ scale: 0.6, rotate: -18, y: 30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, y: 0, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-(--primary-foreground)">
              <Sparkles className="text-(--primary)" size={22} />
              <h2 className="text-xl font-bold text-white drop-shadow">
                {title}
              </h2>
            </div>

            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 20px 40px rgba(20,184,166,0.45))" }}
            >
              <Card card={card} faceUp theme={theme} size={150} highlight />
            </motion.div>

            {subtitle && (
              <p className="max-w-xs text-center text-sm font-medium text-white/90">
                {subtitle}
              </p>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close reveal"
              className="mt-1 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-5 py-2.5 font-semibold text-(--primary-foreground) transition hover:opacity-90 active:scale-95"
            >
              <X size={16} /> Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
