"use client";

import { motion } from "framer-motion";

/**
 * Glass card positioned absolutely within a scene stage. Combines a staggered
 * entrance/exit with a continuous idle "bob" so the showcase reads as alive
 * rather than a static screenshot.
 */
export default function FloatingCard({ className = "", style, index = 0, bobDuration = 5, children }) {
  return (
    <motion.div
      className={`aib-glass absolute rounded-2xl shadow-xl shadow-slate-900/10 ${className}`}
      style={style}
      initial={{ opacity: 0, y: 18, scale: 0.9 }}
      animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.9, transition: { duration: 0.3 } }}
      transition={{
        opacity: { duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] },
        y: { duration: bobDuration, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 + 0.5 },
      }}
    >
      {children}
    </motion.div>
  );
}
