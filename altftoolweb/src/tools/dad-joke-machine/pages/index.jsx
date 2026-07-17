"use client";

import React, { useState, useCallback } from "react";
import { Laugh, RefreshCw, Copy, Heart, Eye, EyeOff } from "lucide-react";

const JOKES = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "I'm reading a book about anti-gravity. It's impossible to put down!",
  "Did you hear about the restaurant on the moon? Great food, no atmosphere.",
  "I used to play piano by ear, but now I use my hands.",
  "What do you call a fake stone? A sham-rock!",
  "I'm on a seafood diet. I see food and I eat it.",
  "Why did the scarecrow win an award? He was outstanding in his field!",
  "What do you call a bear with no teeth? A gummy bear!",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "Why don't skeletons fight each other? They don't have the guts!",
  "What do you call a sleeping bull? A bulldozer!",
  "I'm afraid for the calendar. Its days are numbered.",
  "Why did the math book look so sad? Because it had too many problems.",
  "What do you call cheese that isn't yours? Nacho cheese!",
  "I would tell you a construction joke, but I'm still working on it.",
  "Why did the coffee file a police report? It got mugged!",
  "What do you call a fish with no eyes? Fsh!",
  "I'm friends with all electricians. We have good current connections.",
  "Why did the bicycle fall over? It was two-tired!",
  "What do you call a can opener that doesn't work? A can't opener!",
  "I'm writing a song about a tortilla. Actually, it's more of a wrap.",
  "Why don't eggs tell jokes? They'd crack each other up!",
  "What do you call a lazy kangaroo? A pouch potato!",
  "I used to be a baker, but I couldn't make enough dough.",
  "Why did the tomato turn red? Because it saw the salad dressing!",
  "What do you call a dinosaur that crashes? Tyrannosaurus Wrecks!",
  "I'm reading a book on the history of glue. I just can't seem to put it down.",
  "Why don't oysters share? Because they're shellfish!",
  "What do you call a snowman with a six-pack? An abdominal snowman!",
  "I'm not lazy, I'm on energy-saving mode.",
];

export default function ToolHome() {
  const [joke, setJoke] = useState("");
  const [punchlineHidden, setPunchlineHidden] = useState(false);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({ told: 0, laughs: 0 });

  const generate = useCallback(() => {
    let newJoke;
    do {
      newJoke = JOKES[Math.floor(Math.random() * JOKES.length)];
    } while (newJoke === joke && JOKES.length > 1);
    setJoke(newJoke);
    setPunchlineHidden(true);
    setStats((prev) => ({ ...prev, told: prev.told + 1 }));
  }, [joke]);

  const copyJoke = async () => {
    try {
      await navigator.clipboard.writeText(joke);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const toggleFavorite = () => {
    if (!joke) return;
    if (favorites.includes(joke)) setFavorites((prev) => prev.filter((f) => f !== joke));
    else setFavorites((prev) => [joke, ...prev].slice(0, 20));
  };

  const gotLaugh = () => setStats((prev) => ({ ...prev, laughs: prev.laughs + 1 }));

  const splitJoke = joke.split("? ");
  const hasQuestion = splitJoke.length > 1;

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Laugh className="h-4 w-4" /> Classic Humor
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Dad Joke Machine</h1>
          <p className="mt-2 text-(--muted-foreground)">Endless supply of groan-worthy dad jokes with puns and wordplay</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{stats.told}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Jokes Told</p>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{stats.laughs}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Laughs</p>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{JOKES.length}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">In Library</p>
          </div>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <button onClick={generate} className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-(--primary) px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
            <Laugh className="h-5 w-5" /> Tell Me a Dad Joke
          </button>
        </div>

        {joke && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border-2 border-(--border) bg-(--card) p-6 shadow-lg" style={{ borderColor: "var(--primary)" }}>
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--muted-foreground)">Dad Joke</span>
              <div className="flex gap-2">
                <button onClick={toggleFavorite} className={`rounded-lg p-2 transition-all ${favorites.includes(joke) ? "text-pink-500" : "text-(--muted-foreground) hover:bg-(--muted)"}`}><Heart className="h-4 w-4" /></button>
                <button onClick={generate} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><RefreshCw className="h-4 w-4" /></button>
                <button onClick={copyJoke} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><Copy className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="text-xl font-semibold leading-relaxed text-(--foreground)">
              {hasQuestion ? (
                <>
                  {splitJoke[0]}?
                  {punchlineHidden ? (
                    <button onClick={() => setPunchlineHidden(false)} className="ml-2 inline-flex items-center gap-1 rounded-lg bg-(--muted) px-3 py-1 text-sm font-semibold text-(--primary)"><EyeOff className="h-3 w-3" /> Reveal</button>
                  ) : (
                    <span className="text-(--primary)"> {splitJoke.slice(1).join("? ")}</span>
                  )}
                </>
              ) : (
                joke
              )}
            </p>
            {!punchlineHidden && hasQuestion && (
              <button onClick={gotLaugh} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-(--primary)/10 px-4 py-2 text-sm font-semibold text-(--primary)">
                😂 That got a laugh!
              </button>
            )}
            {copied && <p className="mt-2 text-sm text-(--primary)">Copied to clipboard!</p>}
          </div>
        )}

        {favorites.length > 0 && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-(--muted-foreground)">Favorite Jokes ({favorites.length})</h3>
            <div className="space-y-2">
              {favorites.map((f, i) => (
                <div key={i} className="flex items-start justify-between rounded-xl bg-(--muted) p-3">
                  <p className="text-sm text-(--foreground)">{f.slice(0, 80)}...</p>
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
