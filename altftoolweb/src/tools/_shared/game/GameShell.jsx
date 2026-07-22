"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

const CONTROL_BUTTON_CLASS =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/**
 * Shared chrome for every game tool: stats chips, restart/pause/sound/fullscreen
 * controls, and a token-themed frame. Games render their board as children and
 * keep their own loop/state; the shell never intercepts gameplay input.
 */
export default function GameShell({
  title,
  stats = [],
  onRestart,
  paused,
  onTogglePause,
  soundOn,
  onToggleSound,
  help,
  children,
}) {
  const wrapperRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const node = wrapperRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      node.requestFullscreen?.().catch(() => {});
    }
  }, []);

  return (
    <section
      ref={wrapperRef}
      aria-label={title || "Game"}
      className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:p-4 [&:fullscreen]:max-w-none [&:fullscreen]:justify-center [&:fullscreen]:overflow-auto [&:fullscreen]:bg-card"
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {title ? (
            <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>
          ) : null}
          {stats.map((stat) => (
            <span
              key={stat.label}
              className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              {stat.label}
              <span className="font-semibold tabular-nums text-foreground">{stat.value}</span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5" role="toolbar" aria-label="Game controls">
          {onTogglePause ? (
            <button
              type="button"
              onClick={onTogglePause}
              className={CONTROL_BUTTON_CLASS}
              aria-label={paused ? "Resume game" : "Pause game"}
              aria-pressed={Boolean(paused)}
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          ) : null}
          {onToggleSound ? (
            <button
              type="button"
              onClick={onToggleSound}
              className={CONTROL_BUTTON_CLASS}
              aria-label={soundOn ? "Mute sound" : "Unmute sound"}
              aria-pressed={Boolean(soundOn)}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          ) : null}
          {onRestart ? (
            <button
              type="button"
              onClick={onRestart}
              className={CONTROL_BUTTON_CLASS}
              aria-label="Restart game"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={CONTROL_BUTTON_CLASS}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <div className="min-w-0">{children}</div>

      {help ? <p className="text-xs leading-relaxed text-muted-foreground">{help}</p> : null}
    </section>
  );
}
