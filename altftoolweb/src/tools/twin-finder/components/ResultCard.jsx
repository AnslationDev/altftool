"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2, Download, Clock, Star } from "lucide-react";

function FaceLandmarks() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 400">
      <circle cx="130" cy="140" r="6" fill="none" stroke="rgba(20,184,166,0.4)" strokeWidth="1.5" />
      <circle cx="270" cy="140" r="6" fill="none" stroke="rgba(20,184,166,0.4)" strokeWidth="1.5" />
      <circle cx="130" cy="180" r="4" fill="none" stroke="rgba(20,184,166,0.3)" strokeWidth="1.5" />
      <circle cx="270" cy="180" r="4" fill="none" stroke="rgba(20,184,166,0.3)" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="5" fill="none" stroke="rgba(20,184,166,0.35)" strokeWidth="1.5" />
      <circle cx="155" cy="230" r="3" fill="none" stroke="rgba(20,184,166,0.25)" strokeWidth="1" />
      <circle cx="245" cy="230" r="3" fill="none" stroke="rgba(20,184,166,0.25)" strokeWidth="1" />
      <circle cx="200" cy="160" r="8" fill="none" stroke="rgba(20,184,166,0.2)" strokeWidth="1" />
      <ellipse cx="200" cy="270" rx="40" ry="12" fill="none" stroke="rgba(239,68,68,0.2)" strokeWidth="1" />
    </svg>
  );
}

function HeatMapOverlay() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const spots = [
      { x: 0.2, y: 0.3, r: 60, color: "rgba(239,68,68,0.12)" },
      { x: 0.7, y: 0.25, r: 50, color: "rgba(251,146,60,0.1)" },
      { x: 0.5, y: 0.6, r: 70, color: "rgba(34,211,238,0.08)" },
      { x: 0.3, y: 0.7, r: 45, color: "rgba(20,184,166,0.1)" },
      { x: 0.8, y: 0.6, r: 55, color: "rgba(168,85,247,0.08)" },
    ];
    spots.forEach((spot) => {
      const gradient = ctx.createRadialGradient(
        w * spot.x, h * spot.y, 0,
        w * spot.x, h * spot.y, spot.r
      );
      gradient.addColorStop(0, spot.color);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(w * spot.x, h * spot.y, spot.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
    />
  );
}

export default function ResultCard({ result, onShare, onDownload, onToggleFavorite, isFavorite }) {
  if (!result) return null;

  const formattedDate = new Date(result.timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-(--border) bg-(--card) p-6 shadow-md"
    >
      <FaceLandmarks />
      <HeatMapOverlay />

      <div className="relative z-10 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-(--foreground)">Comparison Result</h3>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-(--muted-foreground)">
              <Clock size={12} />
              {formattedDate}
            </div>
          </div>
          <button
            onClick={() => onToggleFavorite(result.id)}
            className="rounded-lg p-2 transition hover:bg-(--muted)"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star
              size={18}
              className={isFavorite ? "fill-yellow-400 text-yellow-400" : "text-(--muted-foreground)"}
            />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-5xl font-black text-(--foreground)">{result.percentage}%</span>
          <span className="rounded-full bg-(--primary-soft) px-3 py-1 text-xs font-bold text-(--primary)">
            Match
          </span>
        </div>

        <div className="rounded-xl bg-(--muted) p-4">
          <p className="text-sm leading-relaxed text-(--foreground)">{result.insights}</p>
        </div>

        <div className="rounded-xl border border-(--border-strong) bg-(--background) p-3">
          <p className="text-xs leading-relaxed text-(--muted-foreground) italic">
            &ldquo;{result.funFact}&rdquo;
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
          >
            <Share2 size={16} /> Share
          </button>
          <button
            onClick={onDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-(--border) px-4 py-2.5 text-sm font-semibold text-(--foreground) transition hover:bg-(--muted) active:scale-95"
          >
            <Download size={16} /> Download
          </button>
        </div>
      </div>
    </motion.div>
  );
}
