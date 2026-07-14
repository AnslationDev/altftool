"use client";
import { motion } from "framer-motion";

// Original inline-SVG beetle (slow, common, low value).
export default function Beetle({ size = 44, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <motion.g
        style={{ transformOrigin: "24px 24px" }}
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="24" cy="26" rx="13" ry="14" fill="#22c55e" />
        <path d="M24 12 v28" stroke="#14532d" strokeWidth="2" />
        <line x1="14" y1="20" x2="8" y2="16" stroke="#14532d" strokeWidth="2" />
        <line x1="14" y1="28" x2="7" y2="28" stroke="#14532d" strokeWidth="2" />
        <line x1="14" y1="36" x2="9" y2="40" stroke="#14532d" strokeWidth="2" />
        <line x1="34" y1="20" x2="40" y2="16" stroke="#14532d" strokeWidth="2" />
        <line x1="34" y1="28" x2="41" y2="28" stroke="#14532d" strokeWidth="2" />
        <line x1="34" y1="36" x2="39" y2="40" stroke="#14532d" strokeWidth="2" />
        <circle cx="24" cy="13" r="5" fill="#15803d" />
      </motion.g>
    </svg>
  );
}
