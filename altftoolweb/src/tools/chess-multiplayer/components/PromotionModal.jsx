// components/PromotionModal.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PIECE_GLYPH } from "../engine/chess";

const CHOICES = ["q", "r", "b", "n"];

export default function PromotionModal({ open, color, onPick, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
          aria-label="Choose promotion piece"
        >
          <motion.div
            className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-lg"
            initial={{ scale: 0.9, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-center text-sm font-semibold text-(--foreground)">
              Promote to
            </h3>
            <div className="flex gap-3">
              {CHOICES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onPick(t)}
                  className="flex h-16 w-16 items-center justify-center rounded-xl border border-(--border) bg-(--background) text-4xl transition-colors hover:border-(--primary) hover:bg-(--primary)/10 focus-visible:ring-2 focus-visible:ring-(--primary)"
                  aria-label={`Promote to ${t}`}
                >
                  <span
                    className={
                      color === "w"
                        ? "text-(--background) [-webkit-text-stroke:2px_var(--foreground)]"
                        : "text-(--foreground)"
                    }
                  >
                    {PIECE_GLYPH[color][t]}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
