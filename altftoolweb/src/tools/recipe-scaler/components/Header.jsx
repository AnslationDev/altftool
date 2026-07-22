"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

export default function Header({ onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-(--background) text-(--primary) text-center mb-8"
    >
      <h1 className="heading flex justify-center gap-2 animate-fade-up">
        Recipe Scaler
      </h1>
      <p className="description opacity-90 mt-1 animate-fade-up mb-4">
        Instantly scale your recipes for any number of servings
      </p>

      {onReset && (
        <div className="flex justify-center mt-2">
          <button
            onClick={onReset}
            className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-2xl hover:text-red-500 hover:border-red-500/30 transition-all duration-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
