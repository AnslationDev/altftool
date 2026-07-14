"use client";

import { useCallback, useRef, useState } from "react";
import { Gamepad2, RotateCcw, Trash2 } from "lucide-react";
import ChoiceButton from "../components/ChoiceButton";
import ResultDisplay from "../components/ResultDisplay";
import ScoreBoard from "../components/ScoreBoard";
import StatsPanel from "../components/StatsPanel";
import { CHOICES, getComputerChoice, getRoundResult } from "../utils/gameLogic";

function HeaderMetric({ label, value }) {
  return (
    <div className="min-w-[88px] flex-1 px-3 py-2 text-center">
      <p className="whitespace-normal text-[11px] font-semibold uppercase leading-4 text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 text-xl font-semibold leading-6 text-[var(--foreground)]">{value}</p>
    </div>
  );
}

export default function ToolHome() {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [round, setRound] = useState(1);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [draws, setDraws] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const busyRef = useRef(false);
  const totalMatches = wins + losses + draws;
  const winRate = totalMatches > 0 ? `${Math.round((wins / totalMatches) * 100)}%` : "0%";

  const handleChoice = useCallback((choice) => {
    if (busyRef.current) return;
    busyRef.current = true;
    const computer = getComputerChoice();
    const roundResult = getRoundResult(choice, computer);

    setPlayerChoice(choice);
    setComputerChoice(computer);
    setResult(roundResult);

    if (roundResult === "win") {
      setWins((v) => v + 1);
      setCurrentStreak((v) => {
        const next = v + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
    } else if (roundResult === "lose") {
      setLosses((v) => v + 1);
      setCurrentStreak(0);
    } else {
      setDraws((v) => v + 1);
    }

    setRound((v) => v + 1);
  }, []);

  function restartRound() {
    busyRef.current = false;
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
  }

  function resetScore() {
    busyRef.current = false;
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setRound(1);
    setWins(0);
    setLosses(0);
    setDraws(0);
    setCurrentStreak(0);
    setBestStreak(0);
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Gamepad2 className="h-4 w-4" />
            Classic game
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] xl:items-end">
            <div className="min-w-0">
              <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Snake Water Gun Game</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                Pick Snake, Water, or Gun — the computer picks at random. Snake drinks Water, Water defeats Gun, Gun
                defeats Snake. Best of luck!
              </p>
            </div>
            <div className="grid min-w-0 grid-cols-3 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
              <HeaderMetric label="Round" value={round} />
              <HeaderMetric label="Wins" value={wins} />
              <HeaderMetric label="Win Rate" value={winRate} />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--primary)]">Game board</p>
                <h2 className="mt-1 text-xl font-semibold">
                  {playerChoice ? "Round complete" : "Make your move"}
                </h2>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {CHOICES.map((choice) => (
                <ChoiceButton
                  key={choice}
                  choice={choice}
                  onClick={handleChoice}
                  disabled={playerChoice !== null}
                />
              ))}
            </div>

            <div className="mt-6">
              <ResultDisplay
                playerChoice={playerChoice}
                computerChoice={computerChoice}
                result={result}
                round={round}
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={restartRound}
                disabled={!playerChoice}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RotateCcw className="h-4 w-4" />
                Restart Match
              </button>
              <button
                type="button"
                onClick={resetScore}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                <Trash2 className="h-4 w-4" />
                Reset Score
              </button>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <ScoreBoard wins={wins} losses={losses} draws={draws} totalMatches={totalMatches} />

            <StatsPanel
              wins={wins}
              losses={losses}
              draws={draws}
              totalMatches={totalMatches}
              winRate={winRate}
              currentStreak={currentStreak}
              bestStreak={bestStreak}
            />

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--primary)]">Rules</p>
              <ul className="mt-3 space-y-2 text-sm leading-5 text-[var(--muted-foreground)]">
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">🐍</span> Snake drinks Water
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">💧</span> Water defeats Gun
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">🔫</span> Gun defeats Snake
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--muted-foreground)]">—</span> Same choice = Draw
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
