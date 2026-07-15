"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export default function ScanAnimation({ image, scanning, onComplete }) {
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!scanning) {
      setProgress(0);
      completedRef.current = false;
      return;
    }

    const duration = 2000;
    const interval = 16;
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const p = Math.min(100, (step / steps) * 100);
      setProgress(p);
      if (p >= 100 && !completedRef.current) {
        completedRef.current = true;
        setTimeout(() => onComplete?.(), 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [scanning, onComplete]);

  if (!scanning) return null;

  const beamY = `${progress}%`;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt="Scanning"
        className="w-full max-h-[400px] object-contain"
      />

      <motion.div
        className="absolute left-0 right-0 h-1 pointer-events-none"
        style={{ top: beamY }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <div className="h-full bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_12px_rgba(244,114,182,0.6)]" />
      </motion.div>

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="h-full bg-gradient-to-b from-pink-500/5 via-purple-500/10 to-blue-500/5"
          style={{ clipPath: `inset(0 0 ${100 - progress}% 0)` }}
        />
      </div>

      <div className="absolute bottom-3 left-3 right-3">
        <div className="h-2 bg-border/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground font-medium">
          <span>Analyzing...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
