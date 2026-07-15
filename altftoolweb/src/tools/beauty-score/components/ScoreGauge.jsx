"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

function Sparkle({ delay }) {
  const randomX = useRef(Math.random() * 100);
  const randomY = useRef(Math.random() * 100);
  const size = useRef(2 + Math.random() * 4);

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${randomX.current}%`,
        top: `${randomY.current}%`,
        width: size.current,
        height: size.current,
      }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 1.5 + Math.random() * 2,
        repeat: Infinity,
        delay: delay || Math.random() * 3,
      }}
    >
      <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-300 via-yellow-200 to-blue-300 shadow-[0_0_6px_rgba(244,114,182,0.6)]" />
    </motion.div>
  );
}

export default function ScoreGauge({ score = 85, animated = true, size = 200 }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const s = [];
    for (let i = 0; i < 12; i++) s.push(i);
    setSparkles(s);
  }, []);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }
    setDisplayScore(0);
    const duration = 1500;
    const interval = 30;
    const steps = duration / interval;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));
      if (step >= steps) {
        setDisplayScore(score);
        clearInterval(timer);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [score, animated]);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - (displayScore - 70) / 30);

  const gradientId = "scoreGaugeGradient";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 8px rgba(244,114,182,0.4))`,
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-5xl font-black text-foreground tabular-nums"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          {displayScore}
        </motion.span>
        <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase mt-1">
          Score
        </span>
      </div>

      {sparkles.map((i) => (
        <Sparkle key={i} delay={i * 0.3} />
      ))}
    </div>
  );
}
