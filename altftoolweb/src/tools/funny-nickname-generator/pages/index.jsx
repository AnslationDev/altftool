"use client";

import React, { useState, useCallback } from "react";
import { SmilePlus, RefreshCw, Copy, Sparkles, Tag } from "lucide-react";

const THEMES = [
  { id: "food", label: "Food", icon: "🍕" },
  { id: "animal", label: "Animals", icon: "🐱" },
  { id: "superhero", label: "Superhero", icon: "🦸" },
  { id: "nerdy", label: "Nerdy", icon: "🤓" },
  { id: "royal", label: "Royal", icon: "👑" },
  { id: "silly", label: "Silly", icon: "🤪" },
  { id: "savage", label: "Savage", icon: "😈" },
  { id: "wholesome", label: "Wholesome", icon: "🥰" },
];

const NICKNAMES = {
  food: ["Nacho King", "Taco Titan", "Sushi Master", "Burger Boss", "Pizza Prince", "Donut Destroyer", "Waffle Wizard", "Bagel Bandit", "Cupcake Commander", "Muffin Mastermind", "Bacon Baron", "Cookie Crusader", "Pasta Pro", "Nacho Ninja", "Sriracha Queen"],
  animal: ["Corgi Commander", "Panda Pal", "Sloth Star", "Foxinator", "Penguin Pro", "Koala King", "Otter Overlord", "Hedgehog Hero", "Flamingo Fury", "Llama Legend", "Raccoon Ruler", "Dolphin Dreamer", "Capybara Champ", "Axolotl Ace", "Red Panda Rascal"],
  superhero: ["Captain Quirk", "The Average Avenger", "Mild Mannered Man", "Professor Procrastinate", "The Bedtime Bandit", "Captain Nap", "Lazy Lantern", "Dr. Caffeine", "The Snack Sentinel", "Mighty Mouse", "Pixel Protector", "The Napper", "Snooze Control", "Captain Couch", "WiFi Warrior"],
  nerdy: ["Code Wizard", "Debug Diva", "API Artist", "Syntax Sorcerer", "Pixel Paladin", "Cache Crusader", "Byte Baron", "Script Ninja", "Query Queen", "Loop Legend", "Stack Overflow King", "Git Gremlin", "Kernel Commander", "Daemon Lord", "Protocol Pro"],
  royal: ["Lord of Laughter", "Queen of Quirk", "Duke of Doodles", "Baron of Banter", "Countess of Chaos", "Sir Snugs-a-Lot", "Lady Luck", "Princess of Procrastination", "King of Couch", "Empress of Emoji", "Duchess of Dance", "Marquis of Memes"],
  silly: ["Booger Boss", "Pickle Princess", "Wiggle Worm", "Goose Master", "Noodle Noggin", "Doodle Bug", "Wobble King", "Giggle Monster", "Snort Lord", "Zigzag Champion", "Fluffy Butt", "Wiggly Wizard", "Pudding Pop", "Squiggles", "Bloop Master"],
  savage: ["No Filter", "Truth Slayer", "Savage Queen", "Clapback King", "Sarcasm Supreme", "Burn Unit", "Ice Queen", "Silver Tongue", "Shadow Ban", "Zero Chill", "Roast Master", "Cancelled", "Tea Spiller", "Mic Dropper", "Vibe Checker"],
  wholesome: ["Sunshine", "Hug Expert", "Good Vibes Only", "Peace Keeper", "Smile Factory", "Joy Bringer", "Snuggle Bug", "Kindness King", "Rainbow Maker", "Heart Healer", "Cuddle Commander", "Love Spreader", "Chill Champion", "Warm Hug", "Happy Place"],
};

const PREFIXES = ["Sir", "Lady", "Captain", "Queen", "King", "Professor", "Doctor", "Chief", "Master", "Duke", "Baron", "Count"];

export default function ToolHome() {
  const [theme, setTheme] = useState("silly");
  const [prefix, setPrefix] = useState(false);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const generate = useCallback(() => {
    const list = NICKNAMES[theme] || NICKNAMES.silly;
    let nick = list[Math.floor(Math.random() * list.length)];

    if (name.trim()) {
      const p = prefix ? `${PREFIXES[Math.floor(Math.random() * PREFIXES.length)]} ` : "";
      nick = `${p}${nick === name.trim() ? list[(list.indexOf(nick) + 1) % list.length] : nick} ${name.trim().split(" ")[0]}`;
    } else if (prefix) {
      nick = `${PREFIXES[Math.floor(Math.random() * PREFIXES.length)]} ${nick}`;
    }

    setNickname(nick);
    setHistory((prev) => [nick, ...prev].slice(0, 10));
  }, [theme, prefix, name]);

  const copyNickname = async () => {
    try {
      await navigator.clipboard.writeText(nickname);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <SmilePlus className="h-4 w-4" /> Fun Generation
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Funny Nickname Generator</h1>
          <p className="mt-2 text-(--muted-foreground)">Generate hilarious nicknames based on your name and preferred theme</p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <div className="mb-6 flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => setTheme(t.id)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${theme === t.id ? "bg-(--primary) text-white shadow-md" : "border border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"}`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-(--foreground)">Your name (optional)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name..." className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
          </div>

          <label className="mb-4 flex items-center gap-3 text-sm font-semibold text-(--foreground)">
            <input type="checkbox" checked={prefix} onChange={(e) => setPrefix(e.target.checked)} className="h-4 w-4 rounded border-(--border) text-(--primary) focus:ring-(--primary)" />
            Add a fancy prefix (Sir, Lady, Captain, etc.)
          </label>

          <button onClick={generate} className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-(--primary) px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
            <Sparkles className="h-5 w-5" /> Generate Nickname
          </button>
        </div>

        {nickname && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border-2 border-(--border) bg-(--card) p-6 shadow-lg text-center">
            <span className="mb-2 inline-block text-4xl">{THEMES.find((t) => t.id === theme)?.icon}</span>
            <p className="mb-4 text-3xl font-black text-(--foreground)">{nickname}</p>
            <div className="flex justify-center gap-3">
              <button onClick={generate} className="inline-flex items-center gap-2 rounded-lg border border-(--border) bg-(--background) px-4 py-2 text-sm font-semibold text-(--muted-foreground) transition-all hover:border-(--primary)"><RefreshCw className="h-4 w-4" /> Another</button>
              <button onClick={copyNickname} className="inline-flex items-center gap-2 rounded-lg border border-(--border) bg-(--background) px-4 py-2 text-sm font-semibold text-(--muted-foreground) transition-all hover:border-(--primary)"><Copy className="h-4 w-4" /> {copied ? "Copied!" : "Copy"}</button>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-(--muted-foreground)"><Tag className="h-4 w-4" /> Recent Nicknames</h3>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <span key={i} className="rounded-full bg-(--muted) px-3 py-1 text-sm font-semibold text-(--foreground)">{h}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
