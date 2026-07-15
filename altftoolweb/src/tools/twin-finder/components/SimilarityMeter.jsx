"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { getSimilarityColor } from "../utils/helpers";

export default function SimilarityMeter({ percentage, animated = true }) {
  const [displayValue, setDisplayValue] = useState(0);
  const color = getSimilarityColor(percentage);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!animated || hasAnimated.current) {
      setDisplayValue(percentage);
      return;
    }
    hasAnimated.current = true;
    let start = 0;
    const duration = 1500;
    const step = 16;
    const totalSteps = duration / step;
    const increment = percentage / totalSteps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= percentage) {
        setDisplayValue(percentage);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [percentage, animated]);

  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (displayValue / 100) * circumference;

  const getArcColor = () => {
    if (displayValue < 30) return "#EF4444";
    if (displayValue < 55) return "#F97316";
    if (displayValue < 80) return "#EAB308";
    return "#22C55E";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="relative flex items-center justify-center">
        <svg width="180" height="180" className="transform -rotate-90">
          <circle
            cx="90"
            cy="90"
            r="70"
            fill="none"
            stroke="var(--border)"
            strokeWidth="10"
          />
          <motion.circle
            cx="90"
            cy="90"
            r="70"
            fill="none"
            stroke={getArcColor()}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            key={displayValue}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-4xl font-black ${color.text}`}
          >
            {displayValue}%
          </motion.span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="text-center"
      >
        <span className={`text-sm font-bold ${color.text}`}>
          {color.label}
        </span>
      </motion.div>

      <div className="flex w-full gap-1 rounded-full bg-(--muted) p-0.5">
        {[0, 25, 50, 75, 100].map((mark) => (
          <div
            key={mark}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              displayValue >= mark ? "bg-(--primary)" : "bg-(--muted)"
            }`}
            style={{ width: "20%" }}
          />
        ))}
      </div>

      <div className="flex w-full justify-between text-[10px] font-medium text-(--muted-foreground)">
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
        <span>Twin!</span>
      </div>
    </motion.div>
  );
}
