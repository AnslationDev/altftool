"use client";
import { motion } from "framer-motion";

// Original inline-SVG ant (fast, common, low value).
export default function Ant({ size = 36, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <motion.g
        style={{ transformOrigin: "24px 24px" }}
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <line x1="24" y1="6" x2="19" y2="2" stroke="#7c2d12" strokeWidth="2" />
        <line x1="24" y1="6" x2="29" y2="2" stroke="#7c2d12" strokeWidth="2" />
        <circle cx="24" cy="9" r="4" fill="#7c2d12" />
        <circle cx="22" cy="8" r="1.2" fill="#fde68a" />
        <circle cx="26" cy="8" r="1.2" fill="#fde68a" />
        <ellipse cx="24" cy="20" rx="6" ry="7" fill="#92400e" />
        <ellipse cx="24" cy="33" rx="8" ry="9" fill="#b45309" />
        <line x1="18" y1="18" x2="11" y2="14" stroke="#7c2d12" strokeWidth="2" />
        <line x1="18" y1="24" x2="10" y2="26" stroke="#7c2d12" strokeWidth="2" />
        <line x1="18" y1="30" x2="12" y2="36" stroke="#7c2d12" strokeWidth="2" />
        <line x1="30" y1="18" x2="37" y2="14" stroke="#7c2d12" strokeWidth="2" />
        <line x1="30" y1="24" x2="38" y2="26" stroke="#7c2d12" strokeWidth="2" />
        <line x1="30" y1="30" x2="36" y2="36" stroke="#7c2d12" strokeWidth="2" />
      </motion.g>
    </svg>
  );
}
