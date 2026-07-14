"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, RotateCcw, Sparkles, Users } from "lucide-react";
import MarkIcon from "../components/MarkIcon";
import ModeButton from "../components/ModeButton";
import ScoreCard from "../components/ScoreCard";
import { EMPTY_BOARD, PLAYERS, getComputerMove, getGameResult } from "../utils/gameLogic";

export default function ToolHome() {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [round, setRound] = useState(1);
  const [mode, setMode] = useState("players");
  const [difficulty, setDifficulty] = useState("easy");

  const result = useMemo(() => getGameResult(board), [board]);
  const isComputerTurn = mode === "computer" && currentPlayer === "O" && result.type === "active";
  const winningCells = result.line;

  const statusMessage = useMemo(() => {
    if (result.type === "win") return `${PLAYERS[result.winner].label} wins this round`;
    if (result.type === "draw") return "Round ended in a draw";
    if (isComputerTurn) return "Computer is choosing a move";
    return `${PLAYERS[currentPlayer].label}'s turn`;
  }, [currentPlayer, isComputerTurn, result.type, result.winner]);

  useEffect(() => {
    if (result.type === "win") {
      setScores((current) => ({ ...current, [result.winner]: current[result.winner] + 1 }));
    }

    if (result.type === "draw") {
      setScores((current) => ({ ...current, draws: current.draws + 1 }));
    }
  }, [result.type, result.winner]);

  useEffect(() => {
    if (!isComputerTurn) return;

    const timer = window.setTimeout(() => {
      const move = getComputerMove(board, difficulty);
      if (move === null) return;

      setBoard((current) => current.map((cell, index) => (index === move ? "O" : cell)));
      setCurrentPlayer("X");
    }, 420);

    return () => window.clearTimeout(timer);
  }, [board, difficulty, isComputerTurn]);

  function playCell(index) {
    if (board[index] || result.type !== "active" || isComputerTurn) return;

    setBoard((current) => current.map((cell, cellIndex) => (cellIndex === index ? currentPlayer : cell)));
    setCurrentPlayer((player) => (player === "X" ? "O" : "X"));
  }

  function restartRound() {
    setBoard(EMPTY_BOARD);
    setCurrentPlayer("X");
    setRound((value) => value + 1);
  }

  function resetScore() {
    setBoard(EMPTY_BOARD);
    setCurrentPlayer("X");
    setScores({ X: 0, O: 0, draws: 0 });
    setRound(1);
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setBoard(EMPTY_BOARD);
    setCurrentPlayer("X");
    setRound((value) => value + 1);
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Sparkles className="h-4 w-4" />
            Strategy game
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] xl:items-end">
            <div className="min-w-0">
              <h1 className="whitespace-nowrap text-lg font-semibold leading-tight text-[var(--primary)] [overflow-wrap:normal] [word-break:normal] sm:text-4xl">
                Tic-Tac-Toe Game
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                Play a quick round, track wins across sessions, and switch between two-player and computer practice.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
              <ScoreCard label="X Wins" value={scores.X} />
              <ScoreCard label="O Wins" value={scores.O} />
              <ScoreCard label="Draws" value={scores.draws} />
              <ScoreCard label="Round" value={round} />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--primary)]">Game board</p>
                <h2 className="mt-1 text-xl font-semibold">{statusMessage}</h2>
              </div>
              <div className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold">
                <span className="text-[var(--muted-foreground)]">Current</span>
                <span className="inline-flex items-center gap-1 text-[var(--primary)]">
                  <MarkIcon mark={currentPlayer} className="h-4 w-4" />
                  {currentPlayer}
                </span>
              </div>
            </div>

            <div
              className="mx-auto mt-6 grid aspect-square w-full max-w-[min(100%,420px)] grid-cols-3 gap-3"
              role="grid"
              aria-label="Tic-Tac-Toe board"
            >
              {board.map((cell, index) => {
                const isWinningCell = winningCells.includes(index);
                const isDisabled = Boolean(cell) || result.type !== "active" || isComputerTurn;

                return (
                  <button
                    key={index}
                    type="button"
                    role="gridcell"
                    onClick={() => playCell(index)}
                    disabled={isDisabled}
                    aria-label={cell ? `Cell ${index + 1}, ${PLAYERS[cell].label}` : `Cell ${index + 1}, empty`}
                    className={`flex aspect-square items-center justify-center rounded-lg border text-4xl font-semibold transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] sm:text-5xl ${
                      isWinningCell
                        ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--primary)] shadow-[var(--anslation-ds-shadow-md)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)] hover:bg-[var(--muted)]"
                    } ${isDisabled ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <span className={isWinningCell ? "motion-safe:animate-pulse" : ""}>
                      <MarkIcon mark={cell} className="h-12 w-12 sm:h-16 sm:w-16" />
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={restartRound}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                <RotateCcw className="h-4 w-4" />
                Restart Game
              </button>
              <button
                type="button"
                onClick={resetScore}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                Reset Score
              </button>
            </div>
          </div>

          <aside className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-xs font-semibold uppercase text-[var(--primary)]">Play mode</p>
            <h2 className="mt-1 text-xl font-semibold">Round settings</h2>

            <div className="mt-4 grid gap-2">
              <ModeButton active={mode === "players"} icon={Users} onClick={() => changeMode("players")}>
                Two players
              </ModeButton>
              <ModeButton active={mode === "computer"} icon={Bot} onClick={() => changeMode("computer")}>
                Vs computer
              </ModeButton>
            </div>

            <label className="mt-5 block text-sm font-semibold" htmlFor="tic-tac-toe-difficulty">
              Difficulty
            </label>
            <select
              id="tic-tac-toe-difficulty"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              disabled={mode !== "computer"}
              className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)] disabled:opacity-60"
            >
              <option value="easy">Easy: random moves</option>
              <option value="medium">Medium: win and block</option>
            </select>

            <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-sm font-semibold">Round status</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{statusMessage}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-[var(--muted)] px-3 py-2">
                  <span className="block text-xs font-semibold uppercase text-[var(--muted-foreground)]">Mode</span>
                  <span className="mt-1 block font-semibold">{mode === "computer" ? "Computer" : "Two players"}</span>
                </div>
                <div className="rounded-md bg-[var(--muted)] px-3 py-2">
                  <span className="block text-xs font-semibold uppercase text-[var(--muted-foreground)]">Open cells</span>
                  <span className="mt-1 block font-semibold">{board.filter((cell) => !cell).length}</span>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
