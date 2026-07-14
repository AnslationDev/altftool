"use client";
import { motion } from "framer-motion";

// Original inline-SVG dragonfly (fast, rare, high value).
export default function Dragonfly({ size = 52, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <motion.g
        style={{ transformOrigin: "24px 24px" }}
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.g style={{ transformOrigin: "24px 22px" }} animate={{ scaleX: [1, 0.6, 1] }} transition={{ duration: 0.22, repeat: Infinity, ease: "easeInOut" }}>
          <ellipse cx="15" cy="18" rx="11" ry="4" fill="#7dd3fc" opacity="0.85" />
          <ellipse cx="33" cy="18" rx="11" ry="4" fill="#7dd3fc" opacity="0.85" />
          <ellipse cx="15" cy="27" rx="9" ry="3.4" fill="#38bdf8" opacity="0.85" />
          <ellipse cx="33" cy="27" rx="9" ry="3.4" fill="#38bdf8" opacity="0.85" />
        </motion.g>
        <rect x="22.5" y="14" width="3" height="28" rx="1.5" fill="#0ea5e9" />
        <circle cx="24" cy="12" r="4" fill="#0369a1" />
        <circle cx="22.4" cy="11" r="1.4" fill="#e0f2fe" />
        <circle cx="25.6" cy="11" r="1.4" fill="#e0f2fe" />
      </motion.g>
    </svg>
  );
}
