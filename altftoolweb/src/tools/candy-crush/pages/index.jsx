"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useGame } from "../utils/useGame";
import Board from "../components/Board";
import Hud from "../components/Hud";
import Overlay from "../components/Overlay";
import Description from "../components/Description";

function useCellSize() {
  const [size, setSize] = useState(44);
  useEffect(() => {
    const compute = () => {
      const available = Math.min(window.innerWidth - 40, 520);
      const next = Math.max(30, Math.min(56, Math.floor(available / 8) - 6));
      setSize(next);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return size;
}

export default function ToolHome() {
  const game = useGame();
  const cellSize = useCellSize();
  const hasNextLevel = game.levelIndex < game.levelsCount - 1;

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] md:p-8">
      <Toaster position="top-center" richColors />

      {/* Hero */}
      <div className="mb-8 pt-6 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--primary)]">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          Match-3 Puzzle
        </div>
        <h1 className="section-title tool-heading-accent">Candy Crush</h1>
        <p className="description mt-3 text-[var(--muted-foreground)]">
          Swap candies, trigger cascading combos, and beat the target score across three juicy levels.
        </p>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
        <Hud
          level={game.level.level}
          levelsCount={game.levelsCount}
          score={game.score}
          target={game.level.target}
          moves={game.moves}
          time={game.time}
          mode={game.mode}
          highScore={game.highScore}
          combo={game.combo}
          status={game.status}
          soundOn={game.soundOn}
          onTogglePause={game.togglePause}
          onRestart={game.restart}
          onToggleSound={() => game.setSound(!game.soundOn)}
          onChangeMode={game.changeMode}
        />

        <Board
          board={game.board}
          selected={game.selected}
          resolving={game.resolving}
          clearing={game.clearing}
          onSwap={game.attemptSwap}
          onSelect={game.handleSelect}
          cellSize={cellSize}
        />

        <Overlay
          status={game.status}
          level={game.level}
          score={game.score}
          mode={game.mode}
          hasNextLevel={hasNextLevel}
          onResume={game.togglePause}
          onRestart={game.restart}
          onNext={game.nextLevel}
        />

        <Description />
      </div>
    </div>
  );
}
