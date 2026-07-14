"use client";

import { MousePointerClick, Gauge, Sparkles, ArrowUpCircle, HeartCrack, Bug } from "lucide-react";
import { cn } from "../utils/cn";

const CARDS = [
  {
    icon: MousePointerClick,
    title: "Tap to catch",
    text: "Click or tap any insect to catch it before it escapes off the screen.",
    accent: "text-[var(--primary)]",
  },
  {
    icon: Gauge,
    title: "Know the speeds",
    text: "Each species moves at its own pace — dragonflies and ants are quick, beetles are slow.",
    accent: "text-[var(--secondary)]",
  },
  {
    icon: Sparkles,
    title: "Build combos",
    text: "Rarer, faster bugs score more. Chain quick catches to grow a combo multiplier.",
    accent: "text-[#f59e0b]",
  },
  {
    icon: ArrowUpCircle,
    title: "Level up",
    text: "Reach the score target to level up; every level spawns more bugs, faster, for less time.",
    accent: "text-[var(--anslation-ds-success)]",
  },
  {
    icon: HeartCrack,
    title: "Mind your lives",
    text: "An insect that flees costs one life. Lose them all and the hunt ends.",
    accent: "text-[var(--anslation-ds-danger)]",
  },
  {
    icon: Bug,
    title: "Pick a favourite",
    text: "Choose a favourite bug for a cosmetic +1 starting life, and toggle sound or music anytime.",
    accent: "text-[var(--primary)]",
  },
];

export default function Description() {
  return (
    <section className="mx-auto mt-12 w-full max-w-3xl">
      <h2 className="mb-4 text-center text-lg font-bold text-[var(--foreground)]">How to play Insect Tracker</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <div
            key={c.title}
            className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-4 shadow-sm backdrop-blur-md transition hover:-translate-y-1 hover:border-[var(--primary)]/40 hover:shadow-[var(--anslation-ds-shadow-md)]"
          >
            <span className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[var(--primary)]/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--muted)] shadow-sm transition group-hover:scale-110">
              <c.icon className={cn("h-5 w-5", c.accent)} />
            </div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">{c.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">{c.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
