"use client";

import { motion } from "framer-motion";
import { getScoreColor, getScoreGradient } from "../utils/helpers";

export default function LuckyMeter({ score = 0, animated = true }) {
  const radius = 120;
  const strokeWidth = 16;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getArcColor = (s) => {
    if (s >= 80) return "#F59E0B";
    if (s >= 60) return "#22C55E";
    if (s >= 40) return "#EAB308";
    if (s >= 20) return "#EA580C";
    return "#EF4444";
  };

  const arcColor = getArcColor(score);
  const scoreColor = getScoreColor(score);
  const gradientId = `lucky-gradient-${score}`;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={radius * 2}
        height={radius * 2}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="25%" stopColor="#EA580C" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="75%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        <motion.circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset }}
          transition={{ duration: animated ? 1.5 : 0, ease: "easeOut" }}
          style={{
            filter: score >= 80 ? "drop-shadow(0 0 12px rgba(245,158,11,0.5))" : "none",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`text-5xl font-black ${scoreColor}`}
          initial={animated ? { opacity: 0, scale: 0.5 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
        >
          {score}
        </motion.span>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">
          Luck Score
        </span>
      </div>

      {score >= 80 && (
        <motion.div
          className="absolute -top-2 -right-2 text-3xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 1.2, type: "spring" }}
        >
          👑
        </motion.div>
      )}
    </div>
  );
}
