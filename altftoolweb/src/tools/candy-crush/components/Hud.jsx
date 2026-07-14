"use client";

import { Pause, Play, RotateCcw, Volume2, VolumeX, Trophy, Star, Clock, Target } from "lucide-react";
import { Button } from "@/shared/ui/Button";

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex min-w-[78px] flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
      <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className={`mt-0.5 text-lg font-bold ${accent || "text-[var(--foreground)]"}`}>{value}</span>
    </div>
  );
}

export default function Hud({
  level,
  levelsCount,
  score,
  target,
  moves,
  time,
  mode,
  highScore,
  combo,
  status,
  soundOn,
  onTogglePause,
  onRestart,
  onToggleSound,
  onChangeMode,
}) {
  const progress = Math.min(100, Math.round((score / target) * 100));
  const isTimed = mode === "timed";

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Stat icon={Star} label="Level" value={`${level} / ${levelsCount}`} accent="text-[var(--primary)]" />
        <Stat icon={Trophy} label="Score" value={score} accent="text-[var(--primary)]" />
        <Stat icon={Target} label="Target" value={target} />
        {isTimed ? (
          <Stat icon={Clock} label="Time" value={`${time}s`} accent={time <= 10 ? "text-[var(--anslation-ds-danger)]" : "text-[var(--foreground)]"} />
        ) : (
          <Stat icon={Clock} label="Moves" value={moves} accent={moves <= 5 ? "text-[var(--anslation-ds-danger)]" : "text-[var(--foreground)]"} />
        )}
        <Stat icon={Trophy} label="Best" value={highScore} />
      </div>

      {/* progress toward target */}
      <div className="mx-auto mt-4 max-w-md">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <div
            className="h-full rounded-full bg-[var(--anslation-ds-cta-gradient)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-center text-xs text-[var(--muted-foreground)]">
          {progress}% to target
        </p>
      </div>

      {combo > 1 && status === "playing" && (
        <p className="mt-2 text-center text-sm font-semibold text-[var(--primary)]">
          Combo x{combo}! 🔥
        </p>
      )}

      {/* controls */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={onTogglePause} disabled={status !== "playing" && status !== "paused"}>
          {status === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          <span className="ml-1">{status === "paused" ? "Resume" : "Pause"}</span>
        </Button>

        <Button variant="outline" size="sm" onClick={onRestart}>
          <RotateCcw className="h-4 w-4" />
          <span className="ml-1">Restart</span>
        </Button>

        <Button variant="outline" size="sm" onClick={onToggleSound} aria-label={soundOn ? "Mute sound" : "Unmute sound"}>
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        <Button variant="outline" size="sm" onClick={() => onChangeMode(isTimed ? "classic" : "timed")}>
          {isTimed ? "Timed" : "Classic"} mode
        </Button>
      </div>
    </div>
  );
}
