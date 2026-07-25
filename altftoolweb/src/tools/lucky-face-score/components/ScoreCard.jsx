"use client";

import { motion } from "framer-motion";
import { Heart, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { getScoreColor, getScoreBg } from "../utils/helpers";

export default function ScoreCard({
  result,
  isFavorite,
  onToggleFavorite,
  onCopy,
}) {
  const [displayScore, setDisplayScore] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result) return;
    const duration = 1500;
    const steps = 60;
    const increment = result.score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= result.score) {
        setDisplayScore(result.score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [result]);

  if (!result) return null;

  const { score, luckyNumber, luckyColor, luckyEmoji, badge, date } = result;

  const handleCopy = async () => {
    const text = `My Lucky Face Score: ${score}/100!\nLucky Number: ${luckyNumber}\nLucky Color: ${luckyColor.name}\nBadge: ${badge.label} ${badge.emoji}\nGenerated on ${date}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
    onCopy?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Your Lucky Score
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavorite}
            className="p-2 min-w-11 min-h-11 inline-flex items-center justify-center rounded-lg hover:bg-muted/50 transition cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              size={18}
              className={isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}
            />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 min-w-11 min-h-11 inline-flex items-center justify-center rounded-lg hover:bg-muted/50 transition cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
            aria-label="Copy result"
          >
            {copied ? (
              <Check size={18} className="text-green-500" />
            ) : (
              <Copy size={18} className="text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      <div className="text-center space-y-4">
        <motion.div
          className={`text-7xl font-black ${getScoreColor(score)}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
        >
          {displayScore}
          <span className="text-2xl font-bold text-muted-foreground">/100</span>
        </motion.div>

        <motion.div
          className="text-5xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
        >
          {luckyEmoji}
        </motion.div>

        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${getScoreBg(score)}`}>
          <span className="text-sm font-bold uppercase tracking-wider" style={{ color: luckyColor.hex }}>
            {badge.emoji} {badge.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-muted/30 border border-border p-3 text-center space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Lucky #
          </span>
          <span className="block text-lg font-black text-foreground">
            {luckyNumber}
          </span>
        </div>
        <div className="rounded-xl bg-muted/30 border border-border p-3 text-center space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Lucky Color
          </span>
          <div className="flex items-center justify-center gap-1.5">
            <span
              className="inline-block w-4 h-4 rounded-full border border-border"
              style={{ backgroundColor: luckyColor.hex }}
            />
            <span className="text-sm font-semibold text-foreground">
              {luckyColor.name}
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-muted/30 border border-border p-3 text-center space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Date
          </span>
          <span className="block text-xs font-medium text-foreground">
            {date}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
