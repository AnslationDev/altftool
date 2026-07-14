"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, Volume2, VolumeX, Music, Music2, Heart, Timer, Trophy, Star, Bug, Flame } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { cn } from "../utils/cn";
import { INSECT_TYPES } from "../utils/insects";
import { LEVEL_THRESHOLDS, MAX_LEVEL } from "../utils/game";

function StatCard({ icon: Icon, label, children, accent }) {
  return (
    <div className="relative flex min-w-[78px] flex-col items-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 px-3.5 py-2.5 shadow-[var(--anslation-ds-shadow-md)] backdrop-blur-md transition hover:-translate-y-0.5">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/60 to-transparent" />
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        <Icon className={cn("h-3.5 w-3.5", accent)} /> {label}
      </span>
      <span className="mt-0.5 flex h-7 items-center">{children}</span>
    </div>
  );
}

function AnimatedValue({ value, className }) {
  return (
    <span className={cn("text-lg font-extrabold tabular-nums", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="inline-block"
          initial={{ y: -10, opacity: 0, scale: 0.7 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 10, opacity: 0, scale: 0.7 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hud({
  level,
  maxLevel,
  score,
  timeLeft,
  lives,
  combo,
  highScore,
  status,
  chosenInsect,
  soundOn,
  musicOn,
  onTogglePause,
  onRestart,
  onToggleSound,
  onToggleMusic,
}) {
  const threshold = LEVEL_THRESHOLDS[Math.min(level, MAX_LEVEL) - 1] || 0;
  const next = LEVEL_THRESHOLDS[Math.min(level, MAX_LEVEL)] || threshold;
  const span = Math.max(1, next - threshold);
  const progress = level >= MAX_LEVEL ? 100 : Math.min(100, Math.round(((score - threshold) / span) * 100));

  const Chosen = chosenInsect ? INSECT_TYPES[chosenInsect].Component : Bug;
  const lowTime = timeLeft <= 10;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <StatCard icon={Star} label="Level" accent="text-[var(--primary)]">
          <span className="text-lg font-extrabold text-[var(--primary)]">{level}<span className="text-xs text-[var(--muted-foreground)]">/{maxLevel}</span></span>
        </StatCard>

        <StatCard icon={Trophy} label="Score" accent="text-[var(--primary)]">
          <AnimatedValue value={score} className="text-[var(--primary)]" />
        </StatCard>

        <StatCard icon={Timer} label="Time" accent={lowTime ? "text-[var(--anslation-ds-danger)]" : undefined}>
          <motion.span
            animate={lowTime ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.6, repeat: lowTime ? Infinity : 0 }}
            className={cn("text-lg font-extrabold tabular-nums", lowTime ? "text-[var(--anslation-ds-danger)]" : "text-[var(--foreground)]")}
          >
            {timeLeft}s
          </motion.span>
        </StatCard>

        <StatCard icon={Heart} label="Lives" accent="text-[var(--anslation-ds-danger)]">
          <span className="flex gap-0.5">
            <AnimatePresence mode="popLayout">
              {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Heart className="h-4 w-4 fill-[var(--anslation-ds-danger)] text-[var(--anslation-ds-danger)]" />
                </motion.span>
              ))}
            </AnimatePresence>
            {lives <= 0 && <span className="text-sm font-bold text-[var(--anslation-ds-danger)]">0</span>}
          </span>
        </StatCard>

        <StatCard icon={Flame} label="Combo" accent={combo > 1 ? "text-[var(--secondary)]" : undefined}>
          <AnimatedValue value={`x${Math.max(1, combo)}`} className={combo > 1 ? "text-[var(--secondary)]" : "text-[var(--foreground)]"} />
        </StatCard>

        <StatCard icon={Trophy} label="Best">
          <span className="text-lg font-extrabold tabular-nums text-[var(--foreground)]">{highScore}</span>
        </StatCard>

        <StatCard icon={Bug} label="Bug" accent="text-[var(--primary)]">
          <Chosen size={24} />
        </StatCard>
      </div>

      {/* progress toward next level */}
      <div className="mx-auto mt-4 max-w-md">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <motion.div
            className="h-full rounded-full bg-[var(--anslation-ds-cta-gradient)]"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
          />
        </div>
        <p className="mt-1 text-center text-xs text-[var(--muted-foreground)]">
          {level >= MAX_LEVEL ? "Max level — keep catching!" : `${progress}% to level ${level + 1}`}
        </p>
      </div>

      <AnimatePresence>
        {combo > 1 && status === "playing" && (
          <motion.p
            key={combo}
            className="mt-2 text-center text-sm font-bold text-[var(--secondary)]"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Combo x{combo}! 🔥
          </motion.p>
        )}
      </AnimatePresence>

      {/* controls */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={onTogglePause} disabled={status !== "playing" && status !== "paused"} className="cursor-pointer active:scale-95">
          {status === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          <span className="ml-1">{status === "paused" ? "Resume" : "Pause"}</span>
        </Button>

        <Button variant="outline" size="sm" onClick={onRestart} className="cursor-pointer active:scale-95">
          <RotateCcw className="h-4 w-4" />
          <span className="ml-1">Restart</span>
        </Button>

        <Button variant="outline" size="sm" onClick={onToggleSound} aria-label={soundOn ? "Mute sound" : "Unmute sound"} className="cursor-pointer active:scale-95">
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        <Button variant="outline" size="sm" onClick={onToggleMusic} aria-label={musicOn ? "Mute music" : "Unmute music"} className="cursor-pointer active:scale-95">
          {musicOn ? <Music2 className="h-4 w-4" /> : <Music className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
