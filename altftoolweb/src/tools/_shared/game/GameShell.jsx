"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

const CONTROL_BUTTON_CLASS =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-[var(--border)] transition duration-150 hover:bg-muted hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transition-none";

/** Keyboard-hint chip styled as a physical key. Games may import this for hint rows. */
export function Kbd({ children }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-surface-soft px-1.5 font-mono text-[11px] font-semibold text-foreground ring-1 ring-[var(--border-strong)] shadow-sm">
      {children}
    </kbd>
  );
}

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
      className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-[var(--border)] sm:p-4 [&:fullscreen]:max-w-none [&:fullscreen]:justify-center [&:fullscreen]:overflow-auto [&:fullscreen]:rounded-none [&:fullscreen]:bg-card"
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {title ? (
            <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>
          ) : null}
          {stats.map((stat) => (
            <span
              key={stat.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 transition-colors duration-150 motion-reduce:transition-none"
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
