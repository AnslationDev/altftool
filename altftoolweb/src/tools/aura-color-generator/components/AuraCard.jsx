"use client";

import { motion } from "framer-motion";
import { Heart, Download, Share2, Copy, Check, Sparkles, Star, Moon } from "lucide-react";
import { useState } from "react";
import { generatePaletteShades, downloadAuraCard, FUN_DESCRIPTIONS, DAILY_MOODS, CREATIVE_MESSAGES } from "../utils/helpers";

export default function AuraCard({ aura, imagePreview, onSave, isFavorited, onShare }) {
  const [copied, setCopied] = useState(false);

  if (!aura) return null;

  const palette = generatePaletteShades(aura.hex);
  const isGradient = aura.hex.startsWith("linear-gradient");

  const handleCopy = async () => {
    const text = `✨ My Aura Color: ${aura.name}\n${aura.meaning}\n\n${FUN_DESCRIPTIONS[aura.key]}\n\nLucky Quote: ${aura.quote}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    downloadAuraCard(aura, imagePreview);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg"
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="relative h-32 w-32"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: isGradient ? "#8B5CF6" : aura.hex,
              boxShadow: `0 0 40px ${isGradient ? "#8B5CF6" : aura.hex}80`,
            }}
          />
          <div className="absolute inset-3 rounded-full bg-(--card)" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">✦</span>
          </div>
        </motion.div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-(--foreground)">{aura.name}</h3>
          <p className="text-sm text-(--muted-foreground)">{aura.meaning}</p>
          <p className="mt-1 font-mono text-xs text-(--muted-foreground)">{aura.hex}</p>
        </div>

        <div className="flex gap-2">
          {palette.map((color, i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-lg border border-(--border)"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        <p className="text-center text-sm leading-relaxed text-(--muted-foreground)">
          {FUN_DESCRIPTIONS[aura.key]}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {aura.traits.map((trait, i) => (
            <span
              key={i}
              className="rounded-full border border-(--border) bg-(--background) px-3 py-1 text-xs font-semibold text-(--foreground)"
            >
              {trait}
            </span>
          ))}
        </div>

        <div className="w-full rounded-xl bg-(--primary-soft) p-4 text-center">
          <p className="text-sm italic text-(--muted-foreground)">{CREATIVE_MESSAGES[aura.key]}</p>
        </div>

        <div className="w-full rounded-xl border border-(--border) bg-(--background) p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">Lucky Quote</p>
          <p className="mt-1 text-sm italic text-(--foreground)">&ldquo;{aura.quote}&rdquo;</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-(--primary-soft) px-3 py-1 text-xs font-bold text-(--primary)">
            Daily Mood: {DAILY_MOODS[aura.key]}
          </span>
        </div>

        <div className="flex items-center gap-2 text-(--muted-foreground)">
          <Sparkles className="h-4 w-4" />
          <Star className="h-4 w-4" />
          <Moon className="h-4 w-4" />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={onSave}
            className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-2 min-h-11 text-sm font-semibold text-(--foreground) transition-all motion-reduce:transition-none hover:bg-(--muted) active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
            {isFavorited ? "Favorited" : "Save"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-2 min-h-11 text-sm font-semibold text-(--foreground) transition-all motion-reduce:transition-none hover:bg-(--muted) active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-2 min-h-11 text-sm font-semibold text-(--foreground) transition-all motion-reduce:transition-none hover:bg-(--muted) active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-2 min-h-11 text-sm font-semibold text-(--foreground) transition-all motion-reduce:transition-none hover:bg-(--muted) active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
