"use client";

import React, { useState, useCallback } from "react";
import { Sparkle, RefreshCw, Copy, Heart, Flame, Brain, Coffee } from "lucide-react";

const CATEGORIES = [
  { id: "romantic", label: "Romantic", icon: "💕" },
  { id: "cheesy", label: "Cheesy", icon: "🧀" },
  { id: "nerdy", label: "Nerdy", icon: "🤓" },
  { id: "funny", label: "Funny", icon: "😂" },
  { id: "smooth", label: "Smooth", icon: "😎" },
  { id: "witty", label: "Witty", icon: "🧠" },
];

const LINES = {
  romantic: [
    "Are you a magician? Because whenever I look at you, everyone else disappears.",
    "Do you have a map? I keep getting lost in your eyes.",
    "If you were a flower, you'd be a damnn-delion.",
    "Is your name Google? Because you have everything I've been searching for.",
    "I must be a snowflake, because I've fallen for you.",
    "Are you a camera? Because every time I look at you, I smile.",
    "You must be tired because you've been running through my mind all day.",
    "If beauty were time, you'd be eternity.",
  ],
  cheesy: [
    "Are you French? Because Eiffel for you.",
    "Do you like raisins? How about a date?",
    "If you were a vegetable, you'd be a cute-cumber.",
    "Are you a parking ticket? Because you've got fine written all over you.",
    "Do you believe in love at first sight, or should I walk by again?",
    "I'm not a photographer, but I can picture us together.",
    "Are you a cat? Because you're purr-fect.",
    "You must be a broom, because you just swept me off my feet.",
  ],
  nerdy: [
    "Are you made of copper and tellurium? Because you're Cu-Te.",
    "I wish I were adenine because then I could get paired with U.",
    "You must be the square root of -1, because you can't be real.",
    "Are you a black hole? Because you're infinitely attractive.",
    "My love for you is like dividing by zero — it cannot be defined.",
    "You're like the Schrödinger's cat of my heart — both alive and dead until I see you.",
    "Are you a function? Because I want to derive you.",
    "You must be the speed of light, because time stops when I'm with you.",
  ],
  funny: [
    "Are you a loan? Because you've got my interest.",
    "I must be a beaver, because I'm dying for your wood.",
    "Is your name Wi-Fi? Because I'm feeling a connection.",
    "Are you a bank loan? Because you have my interest.",
    "Do you have a Band-Aid? Because I just scraped my knee falling for you.",
    "Are you a dictionary? Because you add meaning to my life.",
    "If you were a burger at McDonald's, you'd be the McGorgeous.",
    "Are you a campfire? Because you're hot and I want s'more.",
  ],
  smooth: [
    "I'm not usually into this kind of thing, but for you, I'll make an exception.",
    "You're the exception to every rule I have.",
    "I don't need Instagram, I already saw the most beautiful thing today.",
    "You must be a star, because you light up every room you enter.",
    "I was blinded by your beauty — I'm going to need your name and number for insurance.",
    "Are you a time traveler? Because I see you in my future.",
    "You're like a fine wine — you get better every time I see you.",
    "I didn't believe in love at first sight, but that was before I met you.",
  ],
  witty: [
    "Are you a keyboard? Because you're just my type.",
    "I'd say you're the whole package, but that would be understating it.",
    "You have something on your face — oh, it's just beauty.",
    "Are you a triangle? Because you're acute one.",
    "I must be a puzzle, because I'm missing a piece and you complete me.",
    "You're the reason they put 'Gorgeous' in the dictionary.",
    "Are you a light bulb? Because you brighten up my day.",
    "You must be a campfire, because you're hot and I want to roast marshmallows with you.",
  ],
};

export default function ToolHome() {
  const [category, setCategory] = useState("romantic");
  const [line, setLine] = useState("");
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const generate = useCallback(() => {
    const list = LINES[category] || LINES.romantic;
    setLine(list[Math.floor(Math.random() * list.length)]);
  }, [category]);

  const copyLine = async () => {
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const toggleFavorite = () => {
    if (!line) return;
    if (favorites.includes(line)) setFavorites((prev) => prev.filter((f) => f !== line));
    else setFavorites((prev) => [line, ...prev].slice(0, 20));
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Sparkle className="h-4 w-4" /> Flirting
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Pickup Line Generator</h1>
          <p className="mt-2 text-(--muted-foreground)">Generate smooth, cheesy, or funny pickup lines for any vibe</p>
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
            <Sparkle className="h-5 w-5" /> Generate Line
          </button>
        </div>

        {line && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border-2 border-(--border) bg-(--card) p-6 shadow-lg" style={{ borderColor: "var(--primary)" }}>
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--muted-foreground)">{CATEGORIES.find((c) => c.id === category)?.label}</span>
              <div className="flex gap-2">
                <button onClick={toggleFavorite} className={`rounded-lg p-2 transition-all ${favorites.includes(line) ? "text-pink-500" : "text-(--muted-foreground) hover:bg-(--muted)"}`}><Heart className="h-4 w-4" /></button>
                <button onClick={generate} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><RefreshCw className="h-4 w-4" /></button>
                <button onClick={copyLine} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><Copy className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="text-xl font-semibold leading-relaxed text-(--foreground)">{line}</p>
            {copied && <p className="mt-2 text-sm text-(--primary)">Copied to clipboard!</p>}
          </div>
        )}

        {favorites.length > 0 && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-(--muted-foreground)">Favorite Lines ({favorites.length})</h3>
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
