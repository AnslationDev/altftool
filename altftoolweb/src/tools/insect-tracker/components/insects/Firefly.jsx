"use client";
import { motion } from "framer-motion";

// Original inline-SVG firefly with a pulsing glowing tail.
export default function Firefly({ size = 38, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <motion.g
        style={{ transformOrigin: "24px 24px" }}
        animate={{ rotate: [-4, 4, -4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.circle cx="24" cy="34" r="5" fill="#fde047" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity }} />
        <ellipse cx="24" cy="24" rx="7" ry="9" fill="#3f6212" />
        <circle cx="24" cy="14" r="4" fill="#1a2e05" />
        <line x1="24" y1="10" x2="24" y2="6" stroke="#1a2e05" strokeWidth="2" />
        <circle cx="24" cy="5.5" r="1.5" fill="#1a2e05" />
      </motion.g>
    </svg>
  );
}
