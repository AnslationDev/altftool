"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Play, Volume2, VolumeX, Music, Music2, Sparkles, Target, Zap, Heart, Timer, Trophy, Leaf } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { cn } from "../utils/cn";
import { DIFFICULTIES, CHOICE_INSECTS, INSECT_TYPES } from "../utils/insects";

const DIFFS = Object.values(DIFFICULTIES);

const DIFF_META = {
  easy: {
    blurb: "Slow bugs, 5 lives, 75s — a relaxed hunt.",
    badge: "Chill",
    gradient: "from-[var(--anslation-ds-success)]/20 to-[var(--anslation-ds-success)]/5",
    ring: "border-[var(--anslation-ds-success)]",
    icon: "text-[var(--anslation-ds-success)]",
  },
  medium: {
    blurb: "A balanced chase — 4 lives, 60s.",
    badge: "Balanced",
    gradient: "from-[var(--secondary)]/20 to-[var(--secondary)]/5",
    ring: "border-[var(--secondary)]",
    icon: "text-[var(--secondary)]",
  },
  hard: {
    blurb: "Fast & furious — 3 lives, 50s, swarms.",
    badge: "Intense",
    gradient: "from-[var(--anslation-ds-danger)]/20 to-[#f59e0b]/5",
    ring: "border-[var(--anslation-ds-danger)]",
    icon: "text-[var(--anslation-ds-danger)]",
  },
};

const HOW_TO = [
  { icon: Target, title: "Catch", text: "Tap or click insects before they escape the meadow.", accent: "text-[var(--primary)]" },
  { icon: Zap, title: "Combos", text: "Chain quick catches to stack a score multiplier.", accent: "text-[var(--secondary)]" },
  { icon: Heart, title: "Lives", text: "Every bug that flees off-screen costs you a life.", accent: "text-[var(--anslation-ds-danger)]" },
  { icon: Timer, title: "Timer", text: "Beat the clock — the round ends when time runs out.", accent: "text-[#f59e0b]" },
  { icon: Trophy, title: "Target", text: "Hit score goals to level up, spawn more, go faster.", accent: "text-[var(--anslation-ds-success)]" },
];

export default function StartScreen({
  difficulty,
  chosenInsect,
  highScore,
  soundOn,
  musicOn,
  onDifficulty,
  onChosen,
  onStart,
  onToggleSound,
  onToggleMusic,
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="mx-auto w-full max-w-3xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-6 shadow-[var(--anslation-ds-shadow-lg)] backdrop-blur-md">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
            <Leaf className="h-5 w-5 text-[var(--primary)]" /> How to play
          </h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onToggleSound} aria-label="Toggle sound" className="cursor-pointer active:scale-95">
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleMusic} aria-label="Toggle music" className="cursor-pointer active:scale-95">
              {musicOn ? <Music2 className="h-4 w-4" /> : <Music className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* how-to instruction cards */}
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {HOW_TO.map((h, i) => (
            <motion.div
              key={h.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 p-3 transition hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:shadow-[var(--anslation-ds-shadow-md)]"
            >
              <span className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-[var(--primary)]/10 opacity-0 blur-xl transition group-hover:opacity-100" />
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--card)] shadow-sm">
                  <h.icon className={cn("h-4 w-4", h.accent)} />
                </span>
                <span className="text-sm font-semibold text-[var(--foreground)]">{h.title}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted-foreground)]">{h.text}</p>
            </motion.div>
          ))}
        </div>

        {/* difficulty */}
        <h3 className="mb-2 mt-6 text-sm font-semibold text-[var(--foreground)]">Difficulty</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {DIFFS.map((d) => {
            const meta = DIFF_META[d.key];
            const active = difficulty === d.key;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => onDifficulty(d.key)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-3.5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--anslation-ds-shadow-md)] active:scale-95",
                  meta.gradient,
                  active ? cn(meta.ring, "shadow-[var(--anslation-ds-shadow-md)]") : "border-[var(--border)]"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="diff-glow"
                    className={cn("pointer-events-none absolute inset-0 rounded-2xl ring-2", meta.ring.replace("border-", "ring-"))}
                  />
                )}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--foreground)]">{d.name}</span>
                  <span className={cn("rounded-full bg-[var(--card)]/70 px-2 py-0.5 text-[10px] font-semibold", meta.icon)}>{meta.badge}</span>
                </div>
                <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{meta.blurb}</p>
                {active && (
                  <span className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[var(--foreground)]">
                    <Sparkles className={cn("h-3.5 w-3.5", meta.icon)} /> Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* choose insect */}
        <h3 className="mb-2 mt-6 text-sm font-semibold text-[var(--foreground)]">
          Choose your bug <span className="font-normal text-[var(--muted-foreground)]">(cosmetic · +1 life)</span>
        </h3>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {CHOICE_INSECTS.map((key, i) => {
            const t = INSECT_TYPES[key];
            const Comp = t.Component;
            const active = chosenInsect === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChosen(key)}
                title={t.name}
                className={cn(
                  "group relative flex flex-col items-center gap-1 rounded-xl border p-2 transition hover:-translate-y-0.5 hover:border-[var(--primary)]/50 active:scale-95",
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-[var(--anslation-ds-shadow-md)]"
                    : "border-[var(--border)] bg-[var(--muted)]/40"
                )}
              >
                {active && (
                  <motion.span
                    className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-[var(--primary)]/60"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                )}
                <motion.div
                  animate={reduce ? undefined : { y: [0, -3, 0] }}
                  transition={{ duration: 2.2 + i * 0.15, repeat: Infinity, ease: "easeInOut" }}
                  className="transition group-hover:scale-110"
                >
                  <Comp size={34} />
                </motion.div>
                <span className="text-[10px] font-medium text-[var(--muted-foreground)]">{t.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-7 flex flex-col items-center gap-3">
          <motion.button
            type="button"
            onClick={onStart}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--anslation-ds-cta-gradient)] px-10 py-3 text-base font-bold text-[var(--primary-foreground)] shadow-[var(--anslation-ds-shadow-lg)]"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-full" />
            <Play className="h-5 w-5 fill-current" /> Start Hunt
          </motion.button>
          <p className="text-xs text-[var(--muted-foreground)]">
            High score: <span className="font-semibold text-[var(--foreground)]">{highScore}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
