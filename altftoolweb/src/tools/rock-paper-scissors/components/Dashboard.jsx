"use client";

import { Hand, Coins, ArrowLeft } from "lucide-react";

const GAMES = [
  {
    key: "rps",
    title: "Rock Paper Scissors",
    blurb: "Beat the computer in a classic showdown of wits and luck.",
    icon: <Hand size={30} />,
    desc: "Hand-shake animation, countdown reveal, streaks & confetti.",
    bg: "bg-(--primary)/10",
  },
  {
    key: "coin",
    title: "Flip Coin",
    blurb: "Predict heads or tails and watch the 3D coin spin to a landing.",
    icon: <Coins size={30} />,
    desc: "Realistic 3D flip, multiple designs, auto-flip & history.",
    bg: "bg-(--primary)/10",
  },
];

export default function Dashboard({ onPlay }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {GAMES.map((g) => (
          <GameCard key={g.key} g={g} onPlay={onPlay} />
        ))}
      </div>
    </div>
  );
}

function GameCard({ g, onPlay }) {
  return (
    <button
      type="button"
      onClick={() => onPlay(g.key)}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-(--border) bg-(--card) p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md active:scale-95"
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${g.bg} text-(--primary) transition group-hover:scale-110`}
      >
        {g.icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-(--foreground)">{g.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-(--muted-foreground)">{g.blurb}</p>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-medium text-(--muted-foreground)">{g.desc}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-(--primary) px-3 py-1.5 text-xs font-semibold text-(--primary-foreground) transition group-hover:scale-105">
          Play <ArrowLeft size={12} className="rotate-180" />
        </span>
      </div>
    </button>
  );
}
