"use client";

import React, { useState, useCallback } from "react";
import { Sparkles, Calendar, RefreshCw, Sun, Moon, Star, TrendingUp } from "lucide-react";

const LUCK_SCORES = [
  { range: [0, 20], label: "Unlucky", emoji: "😰", advice: "Stay low-key today. Avoid risks and stick to routines." },
  { range: [21, 40], label: "Neutral", emoji: "😐", advice: "An average day. Nothing special, nothing terrible." },
  { range: [41, 60], label: "Favorable", emoji: "🙂", advice: "Good vibes ahead. Try something new today!" },
  { range: [61, 80], label: "Lucky", emoji: "😄", advice: "Fortune smiles on you. Take a chance!" },
  { range: [81, 100], label: "Very Lucky", emoji: "🤩", advice: "Stars are aligned! Today is YOUR day!" },
];

const COLORS = ["#FF6B6B", "#FFA502", "#FFD93D", "#6BCB77", "#4D96FF", "#9B59B6", "#FF6B9D", "#2DD4BF", "#8B5CF6", "#EC4899"];

function getNumerology(birthDate) {
  if (!birthDate) return null;
  const nums = birthDate.replace(/-/g, "").split("").map(Number).filter((n) => !isNaN(n));
  let sum = nums.reduce((a, b) => a + b, 0);
  while (sum > 9) sum = String(sum).split("").reduce((a, b) => a + Number(b), 0);
  return sum;
}

function getLifePathNumber(birthDate) {
  if (!birthDate) return null;
  const [y, m, d] = birthDate.split("-").map(Number);
  const sum = (y % 9 || 9) + (m % 9 || 9) + (d % 9 || 9);
  let r = sum;
  while (r > 9) r = String(r).split("").reduce((a, b) => a + Number(b), 0);
  return r;
}

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

export default function ToolHome() {
  const [birthDate, setBirthDate] = useState("");
  const [prediction, setPrediction] = useState(null);

  const predictDay = useCallback(() => {
    const dayOfYear = getDayOfYear();
    const numerology = getNumerology(birthDate);
    const lifePath = getLifePathNumber(birthDate);

    const seed = dayOfYear * (numerology || 5) * (lifePath || 5);
    const base = ((seed % 100) + 100) % 100;
    const luckScore = Math.round(base);
    const category = LUCK_SCORES.find((c) => luckScore >= c.range[0] && luckScore <= c.range[1]) || LUCK_SCORES[2];
    const color = COLORS[luckScore % COLORS.length];

    const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const predictions = [
      `Today's cosmic energy resonates with the number ${numerology || "7"}. Embrace creativity and connection.`,
      `The stars suggest focusing on communication today. Your words carry extra weight.`,
      `A moment of unexpected joy will find you around midday. Stay open to serendipity.`,
      `Trust your intuition today — it's sharper than usual thanks to planetary alignment.`,
      `Someone from your past may resurface. Approach with an open heart.`,
    ];

    setPrediction({
      date: today,
      score: luckScore,
      label: category.label,
      emoji: category.emoji,
      advice: category.advice,
      color,
      numerology: numerology || "—",
      lifePath: lifePath || "—",
      message: predictions[luckScore % predictions.length],
    });
  }, [birthDate]);

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Sparkles className="h-4 w-4" /> Mystical Prediction
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Lucky Day Predictor</h1>
          <p className="mt-2 text-(--muted-foreground)">Discover how lucky today will be based on numerology and cosmic alignment</p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-(--foreground)">Your Birth Date</label>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
          </div>
          <button onClick={predictDay} disabled={!birthDate} className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-(--primary) px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
            <Calendar className="h-5 w-5" /> Predict Today's Luck
          </button>
        </div>

        {prediction && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-lg" style={{ borderColor: prediction.color }}>
              <div className="p-8 text-center" style={{ background: `linear-gradient(135deg, ${prediction.color}22, ${prediction.color}44)` }}>
                <span className="text-6xl">{prediction.emoji}</span>
                <div className="mt-4">
                  <div className="mb-2 text-5xl font-black" style={{ color: prediction.color }}>{prediction.score}%</div>
                  <div className="inline-block rounded-full px-4 py-1 text-sm font-bold text-white" style={{ backgroundColor: prediction.color }}>{prediction.label}</div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-(--muted-foreground)">{prediction.date}</p>
                <p className="text-lg font-semibold text-(--foreground)">{prediction.message}</p>
                <div className="rounded-xl bg-(--muted) p-4">
                  <p className="text-sm font-semibold text-(--foreground)">Advice for today:</p>
                  <p className="mt-1 text-sm text-(--muted-foreground)">{prediction.advice}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-(--border) pt-4">
                  <div><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Numerology Number</p><p className="text-lg font-bold text-(--foreground)">{prediction.numerology}</p></div>
                  <div><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Life Path Number</p><p className="text-lg font-bold text-(--foreground)">{prediction.lifePath}</p></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
