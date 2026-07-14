"use client";
import { motion } from "framer-motion";

// Original inline-SVG butterfly. Wings flap, body wobbles gently.
export default function Butterfly({ size = 46, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <motion.g
        style={{ transformOrigin: "24px 24px" }}
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.g style={{ transformOrigin: "18px 24px" }} animate={{ scaleX: [1, 0.55, 1] }} transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut" }}>
          <ellipse cx="14" cy="16" rx="9" ry="11" fill="#c084fc" />
          <ellipse cx="14" cy="32" rx="7" ry="9" fill="#a855f7" />
        </motion.g>
        <motion.g style={{ transformOrigin: "30px 24px" }} animate={{ scaleX: [1, 0.55, 1] }} transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut" }}>
          <ellipse cx="34" cy="16" rx="9" ry="11" fill="#c084fc" />
          <ellipse cx="34" cy="32" rx="7" ry="9" fill="#a855f7" />
        </motion.g>
        <ellipse cx="24" cy="24" rx="2.4" ry="11" fill="#4c1d95" />
        <circle cx="24" cy="13" r="2.2" fill="#4c1d95" />
      </motion.g>
    </svg>
  );
}
