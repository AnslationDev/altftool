"use client";

import { motion } from "framer-motion";
import { Sparkles, Shuffle } from "lucide-react";

export default function AuraGenerator({ onGenerate, onRandom, loading }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        onClick={onGenerate}
        disabled={loading}
        className="relative flex items-center gap-3 rounded-2xl px-10 py-4 text-lg font-bold text-white shadow-lg transition-all disabled:opacity-70"
        style={{
          background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {loading ? (
          <span className="flex items-center gap-3">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Reading your aura...
          </span>
        ) : (
          <>
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </span>
            Generate My Aura
          </>
        )}
      </motion.button>

      <motion.button
        onClick={onRandom}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--card) px-6 py-3 text-sm font-semibold text-(--foreground) transition-all hover:bg-(--muted) disabled:opacity-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Shuffle className="h-4 w-4" />
        Surprise Me
      </motion.button>
    </div>
  );
}
