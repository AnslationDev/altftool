"use client";

import { Heart, Share2, Download, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ScoreGauge from "./ScoreGauge";
import { formatTimestamp } from "../utils/helpers";

export default function ResultCard({
  result,
  isFavorite,
  onToggleFavorite,
  onShare,
  onDownload,
}) {
  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg"
    >
      {/* Decorative top bar */}
      <div className="h-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400" />

      <div className="p-6 sm:p-8 space-y-6">
        {/* Score Gauge */}
        <div className="flex justify-center">
          <ScoreGauge score={result.score} />
        </div>

        {/* Photo with ornate frame */}
        {result.imageData && (
          <div className="relative flex justify-center">
            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-pink-200/30 via-purple-200/30 to-blue-200/30 border border-pink-300/30">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <rect
                  x="2"
                  y="2"
                  width="96"
                  height="96"
                  rx="12"
                  fill="none"
                  stroke="url(#frameGradient)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <defs>
                  <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
              </svg>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.imageData}
                alt="Your photo"
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover"
              />
            </div>
          </div>
        )}

        {/* Mood Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-pink-300/20 text-sm font-bold text-pink-500">
            <Sparkles size={14} />
            {result.moodBadge}
          </span>
        </div>

        {/* Style Tags */}
        <div className="flex flex-wrap justify-center gap-2">
          {result.styleTags?.map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="px-3 py-1 text-xs font-semibold rounded-full bg-card border border-border text-foreground shadow-sm"
            >
              {tag}
            </motion.span>
          ))}
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{formatTimestamp(result.timestamp)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onToggleFavorite?.(result.id)}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              isFavorite
                ? "bg-pink-500/10 border-pink-400 text-pink-500"
                : "border-border hover:bg-card text-muted-foreground hover:text-foreground"
            }`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              size={18}
              className={isFavorite ? "fill-pink-500" : ""}
            />
          </button>
          <button
            onClick={onShare}
            className="p-2.5 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
            title="Share"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={onDownload}
            className="p-2.5 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
            title="Download"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
