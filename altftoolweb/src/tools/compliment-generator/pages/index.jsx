"use client";

import React, { useState, useCallback } from "react";
import { Heart, RefreshCw, Copy, Sparkles, Smile, Brain, Star, Palette } from "lucide-react";

const CATEGORIES = [
  { id: "personality", label: "Personality", icon: "💎" },
  { id: "appearance", label: "Appearance", icon: "✨" },
  { id: "intelligence", label: "Intelligence", icon: "🧠" },
  { id: "talent", label: "Talent", icon: "🎯" },
  { id: "kindness", label: "Kindness", icon: "🌟" },
  { id: "general", label: "General", icon: "💫" },
];

const COMPLIMENTS = {
  personality: [
    "You have an amazing ability to make people feel comfortable around you.",
    "Your positive energy is absolutely contagious.",
    "You're the kind of person everyone wants to have around.",
    "Your sense of humor is one of the best I've ever encountered.",
    "You have such a warm and welcoming presence.",
    "Your confidence is genuinely inspiring.",
    "You have a beautiful soul and it shows.",
    "You radiate kindness wherever you go.",
  ],
  appearance: [
    "Your smile could light up the darkest room.",
    "You have such an incredible sense of style.",
    "Your eyes are absolutely mesmerizing.",
    "You look amazing today — like, really amazing.",
    "Your confidence is your best accessory.",
    "You have a glow about you that's hard to miss.",
    "That look really suits you perfectly.",
    "You age like fine wine — getting better every year.",
  ],
  intelligence: [
    "You're one of the smartest people I know.",
    "Your problem-solving skills are truly impressive.",
    "You have such a sharp and quick mind.",
    "Your curiosity and love for learning is inspiring.",
    "You always have the most thoughtful insights.",
    "Your wisdom far exceeds your years.",
    "You have an incredible ability to understand complex things.",
    "Your creativity and intelligence are a powerful combination.",
  ],
  talent: [
    "You're incredibly talented at everything you do.",
    "Your skills in this area are truly remarkable.",
    "You have a natural gift that's rare to find.",
    "Your dedication to your craft is inspiring.",
    "You make difficult things look so easy.",
    "Your creativity knows no bounds.",
    "You're a true artist in your field.",
    "Your talent is matched only by your humility.",
  ],
  kindness: [
    "Your kindness has a ripple effect on everyone around you.",
    "You have such a generous and giving heart.",
    "The world is a better place because of you.",
    "You always know the right thing to say to lift someone up.",
    "Your compassion for others is truly beautiful.",
    "You make the world warmer just by being in it.",
    "Your selflessness is something we should all aspire to.",
    "You care so deeply and it shows in everything you do.",
  ],
  general: [
    "You are absolutely amazing just the way you are.",
    "The world needs more people like you.",
    "You're doing a great job — keep it up!",
    "You're capable of incredible things.",
    "Your presence makes any place better.",
    "You're stronger than you think and braver than you believe.",
    "Today is a great day because you're in it.",
    "You matter more than you'll ever know.",
  ],
};

export default function ToolHome() {
  const [category, setCategory] = useState("general");
  const [name, setName] = useState("");
  const [compliment, setCompliment] = useState("");
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const generate = useCallback(() => {
    const list = COMPLIMENTS[category] || COMPLIMENTS.general;
    let c = list[Math.floor(Math.random() * list.length)];
    if (name.trim()) {
      const greetings = ["Hey", "Hi", "Yo", "Oh"].filter((_, i) => i < 2 || Math.random() > 0.5);
      c = `${greetings[Math.floor(Math.random() * greetings.length)]} ${name.trim()} — ${c[0].toLowerCase() + c.slice(1)}`;
    }
    setCompliment(c);
  }, [category, name]);

  const copyCompliment = async () => {
    try {
      await navigator.clipboard.writeText(compliment);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const toggleFavorite = () => {
    if (!compliment) return;
    if (favorites.includes(compliment)) {
      setFavorites((prev) => prev.filter((f) => f !== compliment));
    } else {
      setFavorites((prev) => [compliment, ...prev].slice(0, 20));
    }
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Heart className="h-4 w-4" /> Positivity
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Compliment Generator</h1>
          <p className="mt-2 text-(--muted-foreground)">Brighten someone's day with a thoughtful compliment</p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <div className="mb-6 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.id)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${category === cat.id ? "bg-(--primary) text-white shadow-md" : "border border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"}`}>
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-(--foreground)">Recipient name (optional)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter a name..." className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
          </div>

          <button onClick={generate} className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-(--primary) px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
            <Sparkles className="h-5 w-5" /> Generate Compliment
          </button>
        </div>

        {compliment && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border-2 border-(--border) bg-(--card) p-6 shadow-lg" style={{ borderColor: "var(--primary)" }}>
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--muted-foreground)">{CATEGORIES.find((c) => c.id === category)?.label}</span>
              <div className="flex gap-2">
                <button onClick={() => toggleFavorite()} className={`rounded-lg p-2 transition-all ${favorites.includes(compliment) ? "text-pink-500" : "text-(--muted-foreground) hover:bg-(--muted)"}`}><Heart className="h-4 w-4" /></button>
                <button onClick={generate} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><RefreshCw className="h-4 w-4" /></button>
                <button onClick={copyCompliment} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><Copy className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="text-xl font-semibold leading-relaxed text-(--foreground)">{compliment}</p>
            {copied && <p className="mt-2 text-sm text-(--primary)">Copied to clipboard!</p>}
          </div>
        )}

        {favorites.length > 0 && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-(--muted-foreground)">Favorite Compliments ({favorites.length})</h3>
            <div className="space-y-2">
              {favorites.map((f, i) => (
                <div key={i} className="flex items-start justify-between rounded-xl bg-(--muted) p-3">
                  <p className="text-sm text-(--foreground)">{f}</p>
                  <button onClick={() => setFavorites((prev) => prev.filter((_, j) => j !== i))} className="ml-2 text-xs text-(--muted-foreground) hover:text-red-500">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
