"use client";
import { motion } from "framer-motion";

// Original inline-SVG bee.
export default function Bee({ size = 40, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <motion.g
        style={{ transformOrigin: "24px 24px" }}
        animate={{ rotate: [-4, 4, -4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.g style={{ transformOrigin: "24px 19px" }} animate={{ scaleX: [1, 0.5, 1] }} transition={{ duration: 0.28, repeat: Infinity, ease: "easeInOut" }}>
          <ellipse cx="20" cy="18" rx="7" ry="4" fill="#e0f2fe" opacity="0.9" />
          <ellipse cx="28" cy="18" rx="7" ry="4" fill="#e0f2fe" opacity="0.9" />
        </motion.g>
        <ellipse cx="24" cy="26" rx="11" ry="9" fill="#f59e0b" />
        <path d="M16 20 q8 6 16 0" stroke="#1f2937" strokeWidth="3" fill="none" />
        <path d="M15 26 q9 6 18 0" stroke="#1f2937" strokeWidth="3" fill="none" />
        <path d="M16 32 q8 5 16 0" stroke="#1f2937" strokeWidth="3" fill="none" />
        <circle cx="24" cy="14" r="5" fill="#1f2937" />
        <line x1="24" y1="9" x2="24" y2="5" stroke="#1f2937" strokeWidth="2" />
        <circle cx="24" cy="4.5" r="1.6" fill="#1f2937" />
      </motion.g>
    </svg>
  );
}
