"use client";

import React, { useState, useCallback } from "react";
import { Flame, RefreshCw, Copy, Heart, Skull, Smile, ThumbsUp } from "lucide-react";

const INTENSITIES = [
  { id: "playful", label: "Playful", icon: "😏", color: "#6BCB77" },
  { id: "savage", label: "Savage", icon: "🔥", color: "#FF6B6B" },
  { id: "witty", label: "Witty", icon: "🧠", color: "#4D96FF" },
  { id: "dark", label: "Dark Humor", icon: "💀", color: "#9B59B6" },
];

const ROASTS = {
  playful: [
    "You're not stupid; you just have bad luck thinking.",
    "I'd agree with you, but then we'd both be wrong.",
    "You bring everyone so much joy… when you leave.",
    "You're proof that evolution can go in reverse.",
    "I've seen snails move faster than you.",
    "You're like a cloud. When you disappear, it's a beautiful day.",
    "You have the perfect face for radio.",
    "Somewhere a village is missing its idiot.",
  ],
  savage: [
    "You're not a complete idiot — some parts are missing.",
    "Your secrets are safe with me. I never listen anyway.",
    "I'd roast you, but my mom said not to burn trash.",
    "You're the reason God created the middle finger.",
    "If I wanted to hear from an idiot, I'd watch your TikTok.",
    "You're not ugly, but let's be real—good luck is not on your side.",
    "Your brain is like a web browser — 15 tabs open and all frozen.",
    "You have the charm of a malfunctioning parking meter.",
  ],
  witty: [
    "I'd explain it to you, but I left my crayons at home.",
    "You're not afraid of flying; you're afraid of crashing… into reality.",
    "Your opinion would matter if you had one.",
    "I'd call you an idiot, but that would be an insult to idiots.",
    "You're the human equivalent of a participation trophy.",
    "If brains were dynamite, you couldn't blow your nose.",
    "You have the attention span of a gnat on espresso.",
    "I envy people who haven't met you.",
  ],
  dark: [
    "Your gene pool could use some chlorine.",
    "You look like you were drawn from memory.",
    "The fountain of youth called — they want their ugly back.",
    "You're the reason they put instructions on shampoo.",
    "If you were any more basic, you'd be a free app.",
    "Your spirit animal is a participation trophy.",
    "You're a gray sprinkle on a rainbow cupcake of life.",
  ],
};

export default function ToolHome() {
  const [intensity, setIntensity] = useState("playful");
  const [name, setName] = useState("");
  const [roast, setRoast] = useState("");
  const [copied, setCopied] = useState(false);

  const generateRoast = useCallback(() => {
    const roasts = ROASTS[intensity] || ROASTS.playful;
    let r = roasts[Math.floor(Math.random() * roasts.length)];
    if (name.trim()) {
      const prefix = ["Hey", "Listen", "Yo", "Oh", "Well"].filter((_, i) => i < 2 || Math.random() > 0.5);
      r = `${prefix[Math.floor(Math.random() * prefix.length)]} ${name.trim()} — ${r.toLowerCase()}`;
    }
    setRoast(r);
  }, [intensity, name]);

  const copyRoast = async () => {
    try {
      await navigator.clipboard.writeText(roast);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Flame className="h-4 w-4" /> Entertainment
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Roast Generator</h1>
          <p className="mt-2 text-(--muted-foreground)">Generate hilarious roasts in different styles — from playful to savage</p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <div className="mb-6 flex flex-wrap gap-2">
            {INTENSITIES.map((int) => (
              <button key={int.id} onClick={() => setIntensity(int.id)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${intensity === int.id ? "text-white shadow-md" : "border border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"}`} style={intensity === int.id ? { backgroundColor: int.color } : {}}>
                <span>{int.icon}</span> {int.label}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-(--foreground)">Target name (optional)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter a name..." className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
          </div>

          <button onClick={generateRoast} className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-(--primary) px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
            <Flame className="h-5 w-5" /> Generate Roast
          </button>
        </div>

        {roast && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border-2 border-(--border) bg-(--card) p-6 shadow-lg" style={{ borderColor: INTENSITIES.find((i) => i.id === intensity)?.color || "var(--border)" }}>
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--muted-foreground)">{INTENSITIES.find((i) => i.id === intensity)?.label || "Playful"}</span>
              <div className="flex gap-2">
                <button onClick={generateRoast} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><RefreshCw className="h-4 w-4" /></button>
                <button onClick={copyRoast} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><Copy className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="text-xl font-semibold leading-relaxed text-(--foreground)">{roast}</p>
            {copied && <p className="mt-2 text-sm text-(--primary)">Copied to clipboard!</p>}
          </div>
        )}
      </div>
    </div>
  );
}
