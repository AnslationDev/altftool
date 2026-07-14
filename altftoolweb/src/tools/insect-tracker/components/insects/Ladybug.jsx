"use client";
import { motion } from "framer-motion";

// Original inline-SVG ladybug.
export default function Ladybug({ size = 42, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <motion.g
        style={{ transformOrigin: "24px 24px" }}
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="24" cy="26" r="14" fill="#ef4444" />
        <path d="M24 12 a14 14 0 0 1 0 28 z" fill="#dc2626" />
        <line x1="24" y1="14" x2="24" y2="40" stroke="#1f2937" strokeWidth="2" />
        <circle cx="18" cy="22" r="2.6" fill="#1f2937" />
        <circle cx="30" cy="22" r="2.6" fill="#1f2937" />
        <circle cx="19" cy="32" r="2.4" fill="#1f2937" />
        <circle cx="31" cy="32" r="2.4" fill="#1f2937" />
        <circle cx="24" cy="12" r="6" fill="#1f2937" />
        <line x1="20" y1="8" x2="16" y2="4" stroke="#1f2937" strokeWidth="2" />
        <line x1="28" y1="8" x2="32" y2="4" stroke="#1f2937" strokeWidth="2" />
      </motion.g>
    </svg>
  );
}
