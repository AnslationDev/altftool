import { RotateCcw, RefreshCcw, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

export default function GameControls({
  gameStarted,
  gameOver,
  autoMark,
  onNewGame,
  onRestartGame,
  onResetBoard,
  onToggleAutoMark,
  soundEnabled,
  onToggleSound,
  fullscreen,
  onToggleFullscreen,
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <p className="text-xs font-semibold uppercase text-[var(--primary)]">Controls</p>
      <h2 className="mt-1 text-xl font-semibold">Game Actions</h2>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onNewGame}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
        >
          <RefreshCcw className="h-4 w-4" />
          New Game
        </button>

        {gameStarted && !gameOver && (
          <button
            type="button"
            onClick={onRestartGame}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
          >
            <RotateCcw className="h-4 w-4" />
            Restart Game
          </button>
        )}

        <button
          type="button"
          onClick={onResetBoard}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
        >
          <RotateCcw className="h-4 w-4" />
          New Board
        </button>
      </div>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={onToggleAutoMark}
          aria-pressed={autoMark}
          className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] ${
            autoMark
              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
          }`}
        >
          Auto Mark: {autoMark ? "On" : "Off"}
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundEnabled}
          className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] ${
            soundEnabled
              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
          }`}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          Sound: {soundEnabled ? "On" : "Off"}
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-pressed={fullscreen}
          className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] ${
            fullscreen
              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
          }`}
        >
          {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>
    </div>
  );
}
