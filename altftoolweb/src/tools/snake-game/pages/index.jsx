"use client";

import { Gamepad2, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import MobileControls from "../components/MobileControls";
import SnakeBoard from "../components/SnakeBoard";
import StatCard from "../components/StatCard";
import { DIFFICULTIES, GRID_SIZE } from "../constants/gameSettings";
import { useSnakeGame } from "../hooks/useSnakeGame";

export default function ToolHome() {
  const game = useSnakeGame();
  const statusText = game.status === "game-over" ? "Game over" : game.status === "paused" ? "Paused" : game.status === "running" ? "Running" : "Ready";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Gamepad2 className="h-4 w-4" />
            Arcade game
          </div>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Snake Game</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                Guide the snake, collect food, and survive faster boards with keyboard or touch controls.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Score" value={game.score} live />
              <StatCard label="High score" value={game.stats.highestScore} />
            </div>
          </div>
        </section>

        {game.status === "game-over" && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border border-[var(--primary)] bg-[var(--primary)]/10 p-4 text-sm font-semibold text-[var(--foreground)]"
          >
            Collision detected. Final score: {game.score}. Restart when you are ready for another run.
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--primary)]">Game board</p>
                <h2 className="mt-1 text-xl font-semibold" role="status" aria-live="polite">
                  {statusText}
                </h2>
              </div>
              <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                {GRID_SIZE} x {GRID_SIZE} grid · {game.settings.label}
              </p>
            </div>
            <SnakeBoard snake={game.snake} food={game.food} status={game.status} />
            <div className="mt-5">
              <MobileControls onMove={game.changeDirection} />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--primary)]">Controls</p>
              <div className="mt-4 grid gap-2">
                {game.status === "running" ? (
                  <button type="button" onClick={game.pause} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]">
                    <Pause className="h-4 w-4" /> Pause
                  </button>
                ) : (
                  <button type="button" onClick={game.status === "paused" ? game.resume : game.start} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]">
                    <Play className="h-4 w-4" /> {game.status === "paused" ? "Resume" : "Start Game"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const runInProgress = game.status === "running" || game.status === "paused";
                    if (
                      runInProgress &&
                      !window.confirm("Restart? Your current run will end now and count as a finished game.")
                    ) {
                      return;
                    }
                    game.restart();
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <RotateCcw className="h-4 w-4" /> Restart
                </button>
              </div>

              <label className="mt-5 block text-sm font-semibold" htmlFor="snake-difficulty">Difficulty</label>
              <select id="snake-difficulty" value={game.difficulty} onChange={(event) => game.setDifficulty(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]">
                {Object.entries(DIFFICULTIES).map(([key, item]) => (
                  <option key={key} value={key}>{item.label} · {item.speed}ms</option>
                ))}
              </select>

              <button type="button" onClick={() => game.setSoundEnabled(!game.soundEnabled)} className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold transition hover:border-[var(--primary)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]">
                {game.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Sound {game.soundEnabled ? "On" : "Off"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Games played" value={game.stats.gamesPlayed} />
              <StatCard label="Average score" value={game.stats.averageScore} />
              <StatCard label="Survival" value={`${game.survivalTime}s`} />
              <StatCard label="Longest" value={`${game.stats.longestSurvival}s`} />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
