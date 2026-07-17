"use client";

import React, { useState, useCallback } from "react";
import { ShieldOff, RefreshCw, Copy, Briefcase, GraduationCap, Users, Heart, Plane } from "lucide-react";

const CATEGORIES = [
  { id: "work", label: "Work", icon: "💼" },
  { id: "school", label: "School", icon: "🎓" },
  { id: "social", label: "Social", icon: "👥" },
  { id: "date", label: "Date", icon: "💕" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧" },
  { id: "travel", label: "Travel", icon: "✈️" },
];

const EXCUSES = {
  work: [
    "My alarm didn't go off because of a power surge in the neighborhood.",
    "I had a sudden allergic reaction to something I ate last night.",
    "My car wouldn't start — turns out the battery died overnight.",
    "I confused the meeting time with another timezone.",
    "My laptop crashed and I lost all my work, so I had to restart.",
    "A family emergency came up that I couldn't ignore.",
    "I was stuck in traffic because of an accident on the highway.",
    "My internet went down and I couldn't join the call.",
  ],
  school: [
    "My dog literally ate my homework — I'm not even joking this time.",
    "I had a doctor's appointment that ran longer than expected.",
    "My printer ran out of ink at 3 AM, right before the deadline.",
    "I misunderstood the assignment instructions completely.",
    "My roommate accidentally deleted my file while using my laptop.",
    "I was sick with food poisoning and couldn't focus.",
    "The submission portal was down when I tried to upload.",
    "I confused the due date with next week's assignment.",
  ],
  social: [
    "I suddenly remembered I have a prior commitment I can't cancel.",
    "I'm not feeling well and need to rest tonight.",
    "My phone died and I didn't see your message until now.",
    "Something came up with my family last minute.",
    "I'm completely exhausted from this week and need alone time.",
    "I thought this was tomorrow, not today!",
    "My ride fell through and I can't make it.",
    "I accidentally double-booked myself, sorry!",
  ],
  date: [
    "My friend had an emergency and needed me to help them move.",
    "I came down with a terrible headache and need to lie down.",
    "My ex texted and I'm still processing that emotionally.",
    "My roommate locked me out and I'm waiting for the locksmith.",
    "I realized I'm not ready to date right now, sorry.",
    "A work deadline suddenly appeared and I have to focus.",
    "My pet got sick and I need to take them to the vet.",
    "I'm visiting family this weekend and just found out.",
  ],
  family: [
    "I have a work deadline that I absolutely cannot miss.",
    "I promised a friend I'd help them with something important.",
    "I'm not feeling well and don't want to get anyone sick.",
    "My car is in the shop and I have no way to get there.",
    "I have a doctor's appointment I forgot to mention.",
    "I'm behind on a project and need to catch up this weekend.",
    "The weather is too bad to safely travel.",
    "I already made plans before this was scheduled.",
  ],
  travel: [
    "My flight got cancelled due to weather conditions.",
    "I lost my passport and had to sort it out urgently.",
    "My hotel booking got mixed up and I'm dealing with that.",
    "I missed my train by literally 30 seconds.",
    "My luggage got lost and I'm waiting at the airport.",
    "There was a road closure and I had to turn back.",
    "My visa application is still pending, unfortunately.",
    "I got sick right before departure and the doctor advised against travel.",
  ],
};

export default function ToolHome() {
  const [category, setCategory] = useState("work");
  const [excuse, setExcuse] = useState("");
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const generate = useCallback(() => {
    const list = EXCUSES[category] || EXCUSES.work;
    setExcuse(list[Math.floor(Math.random() * list.length)]);
  }, [category]);

  const copyExcuse = async () => {
    try {
      await navigator.clipboard.writeText(excuse);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const toggleFavorite = () => {
    if (!excuse) return;
    if (favorites.includes(excuse)) setFavorites((prev) => prev.filter((f) => f !== excuse));
    else setFavorites((prev) => [excuse, ...prev].slice(0, 20));
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <ShieldOff className="h-4 w-4" /> Quick Escape
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Excuse Generator</h1>
          <p className="mt-2 text-(--muted-foreground)">Generate a believable excuse for any situation</p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <div className="mb-6 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.id)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${category === cat.id ? "bg-(--primary) text-white shadow-md" : "border border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"}`}>
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>

          <button onClick={generate} className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-(--primary) px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
            <ShieldOff className="h-5 w-5" /> Generate Excuse
          </button>
        </div>

        {excuse && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border-2 border-(--border) bg-(--card) p-6 shadow-lg" style={{ borderColor: "var(--primary)" }}>
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--muted-foreground)">{CATEGORIES.find((c) => c.id === category)?.label}</span>
              <div className="flex gap-2">
                <button onClick={toggleFavorite} className={`rounded-lg p-2 transition-all ${favorites.includes(excuse) ? "text-pink-500" : "text-(--muted-foreground) hover:bg-(--muted)"}`}><Heart className="h-4 w-4" /></button>
                <button onClick={generate} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><RefreshCw className="h-4 w-4" /></button>
                <button onClick={copyExcuse} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><Copy className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="text-xl font-semibold leading-relaxed text-(--foreground)">{excuse}</p>
            {copied && <p className="mt-2 text-sm text-(--primary)">Copied to clipboard!</p>}
          </div>
        )}

        {favorites.length > 0 && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-(--muted-foreground)">Saved Excuses ({favorites.length})</h3>
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
