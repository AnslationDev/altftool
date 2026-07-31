"use client";

import React, { useState, useCallback } from "react";
import { Palette, RefreshCw, Copy, Sparkles, Heart, Star, Zap } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const MOODS = [
  { id: "happy", label: "Happy", icon: "😊" },
  { id: "calm", label: "Calm", icon: "😌" },
  { id: "energetic", label: "Energetic", icon: "⚡" },
  { id: "romantic", label: "Romantic", icon: "💕" },
  { id: "creative", label: "Creative", icon: "🎨" },
  { id: "adventurous", label: "Adventurous", icon: "🚀" },
];

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const COLORS = [
  { hex: "#FF6B6B", name: "Coral Red", meaning: "Passion & Energy" },
  { hex: "#FFA502", name: "Sunset Orange", meaning: "Creativity & Joy" },
  { hex: "#FFD93D", name: "Sunshine Yellow", meaning: "Optimism & Clarity" },
  { hex: "#6BCB77", name: "Vibrant Green", meaning: "Growth & Balance" },
  { hex: "#4D96FF", name: "Ocean Blue", meaning: "Peace & Trust" },
  { hex: "#9B59B6", name: "Royal Purple", meaning: "Wisdom & Luxury" },
  { hex: "#FF6B9D", name: "Blush Pink", meaning: "Love & Compassion" },
  { hex: "#2DD4BF", name: "Teal Dream", meaning: "Harmony & Renewal" },
  { hex: "#F97316", name: "Warm Amber", meaning: "Confidence & Warmth" },
  { hex: "#8B5CF6", name: "Violet Aura", meaning: "Intuition & Spirituality" },
  { hex: "#EC4899", name: "Magenta", meaning: "Transformation & Originality" },
  { hex: "#14B8A6", name: "Teal", meaning: "Sophistication & Healing" },
];

function getZodiacColor(sign) {
  const map = {
    Aries: "#FF6B6B", Taurus: "#6BCB77", Gemini: "#FFD93D",
    Cancer: "#4D96FF", Leo: "#FFA502", Virgo: "#9B59B6",
    Libra: "#FF6B9D", Scorpio: "#8B5CF6", Sagittarius: "#F97316",
    Capricorn: "#2DD4BF", Aquarius: "#EC4899", Pisces: "#14B8A6",
  };
  return map[sign] || "#4D96FF";
}

function getMoodColor(mood) {
  const map = { happy: "#FFD93D", calm: "#4D96FF", energetic: "#FF6B6B", romantic: "#FF6B9D", creative: "#9B59B6", adventurous: "#FFA502" };
  return map[mood] || "#4D96FF";
}

export default function ToolHome() {
  const [mode, setMode] = useState("random");
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedZodiac, setSelectedZodiac] = useState(null);
  const [color, setColor] = useState(null);
  const [history, setHistory] = useState([]);
  const { copy: copyToClipboard, isCopied, announcement } = useCopyToClipboard();

  const pickColor = useCallback(() => {
    let picked;
    if (mode === "mood" && selectedMood) {
      const hex = getMoodColor(selectedMood);
      picked = COLORS.find((c) => c.hex === hex) || COLORS[Math.floor(Math.random() * COLORS.length)];
    } else if (mode === "zodiac" && selectedZodiac) {
      const hex = getZodiacColor(selectedZodiac);
      picked = COLORS.find((c) => c.hex === hex) || COLORS[Math.floor(Math.random() * COLORS.length)];
    } else {
      picked = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    setColor(picked);
    setHistory((prev) => [picked, ...prev].slice(0, 10));
  }, [mode, selectedMood, selectedZodiac]);

  const copyColor = () => {
    if (!color) return;
    copyToClipboard("hex", color.hex, { label: `${color.name} hex code` });
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <span role="status" aria-live="polite" className="sr-only">
          {color ? `Your lucky color is ${color.name}, ${color.hex}. ${color.meaning}.` : ""}
        </span>
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Palette className="h-4 w-4" /> Fun Discovery
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Lucky Color Picker</h1>
          <p className="mt-2 text-(--muted-foreground)">Discover your lucky color based on mood, zodiac, or random chance</p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { id: "random", label: "Random", icon: <Sparkles className="h-4 w-4" /> },
              { id: "mood", label: "By Mood", icon: <Heart className="h-4 w-4" /> },
              { id: "zodiac", label: "By Zodiac", icon: <Star className="h-4 w-4" /> },
            ].map((m) => (
              <button key={m.id} onClick={() => { setMode(m.id); setColor(null); }} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${mode === m.id ? "bg-(--primary) text-white shadow-md" : "border border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"}`}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {mode === "mood" && (
            <div className="mb-6">
              <p className="mb-3 text-sm font-semibold text-(--foreground)">Select your mood:</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((mood) => (
                  <button key={mood.id} onClick={() => setSelectedMood(mood.id)} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${selectedMood === mood.id ? "border-(--primary) bg-(--primary)/10 text-(--primary)" : "border-(--border) text-(--muted-foreground) hover:border-(--primary)"}`}>
                    <span>{mood.icon}</span> {mood.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "zodiac" && (
            <div className="mb-6">
              <p className="mb-3 text-sm font-semibold text-(--foreground)">Select your zodiac sign:</p>
              <div className="flex flex-wrap gap-2">
                {ZODIAC_SIGNS.map((sign) => (
                  <button key={sign} onClick={() => setSelectedZodiac(sign)} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${selectedZodiac === sign ? "border-(--primary) bg-(--primary)/10 text-(--primary)" : "border-(--border) text-(--muted-foreground) hover:border-(--primary)"}`}>
                    {sign}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={pickColor}
            disabled={(mode === "mood" && !selectedMood) || (mode === "zodiac" && !selectedZodiac)}
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-(--primary) px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50 disabled:active:scale-100"
          >
            <RefreshCw className="h-5 w-5" /> Pick My Lucky Color
          </button>
        </div>

        {color && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-lg">
              <div className="flex h-48 items-center justify-center transition-all" style={{ backgroundColor: color.hex }}>
                <span className="rounded-xl bg-black/55 px-6 py-3 text-4xl font-bold text-white backdrop-blur-sm">{color.hex}</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-(--foreground)">{color.name}</h3>
                <p className="mt-2 flex items-center gap-2 text-(--muted-foreground)"><Zap className="h-4 w-4 text-(--primary)" /> {color.meaning}</p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={copyColor}
                    aria-label={isCopied("hex") ? "Copied the hex code to clipboard" : "Copy the hex code"}
                    className="inline-flex items-center gap-2 rounded-lg border border-(--border) bg-(--background) px-4 py-2 text-sm font-semibold text-(--foreground) transition-all hover:border-(--primary)"
                  >
                    <Copy className="h-4 w-4" /> {isCopied("hex") ? "Copied!" : "Copy Hex"}
                  </button>
                  <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
                </div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
                <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-(--muted-foreground)"><Palette className="h-4 w-4" /> Color History</h4>
                <div className="flex flex-wrap gap-3">
                  {history.map((c, i) => (
                    <div key={i} className="group relative">
                      <button
                        type="button"
                        onClick={() => setColor(c)}
                        aria-label={`${c.name}, ${c.hex}. View this color again.`}
                        title={`${c.name} - ${c.hex}`}
                        className="h-10 w-10 rounded-lg shadow-sm transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-(--foreground) px-2 py-1 text-xs text-(--background) opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
