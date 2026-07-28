"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Lightbulb, RotateCcw, Shuffle, SkipForward, Trophy } from "lucide-react";

import {
  buildRounds,
  checkGuess,
  DIFFICULTIES,
  HINT_PENALTY,
  POINTS_PER_LETTER,
  scoreRound,
  summariseGame,
} from "../lib";

const DEFAULT_SEED = 424242;
const DEFAULT_ROUNDS = 5;
const MAX_HINTS = 3;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-2 last:border-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-right text-sm font-semibold text-[var(--foreground)] tabular-nums">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [difficulty, setDifficulty] = useState("medium");
  const [roundCount, setRoundCount] = useState(String(DEFAULT_ROUNDS));
  const [seed, setSeed] = useState(String(DEFAULT_SEED));

  const [roundIndex, setRoundIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [results, setResults] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [copied, setCopied] = useState(false);

  const game = useMemo(
    () => buildRounds({ difficulty, count: Number(roundCount), seed: Number(seed) }),
    [difficulty, roundCount, seed],
  );

  const error = game.error || null;
  const rounds = error ? [] : game.rounds;
  const timeLimit = error ? 0 : game.timeLimitSeconds;
  const finished = !error && roundIndex >= rounds.length;
  const current = !error && !finished ? rounds[roundIndex] : null;
  const secondsLeft = current ? Math.max(0, timeLimit - elapsed) : 0;

  const finishRound = useCallback(
    (solved) => {
      if (!current) return;
      const scored = scoreRound({
        letters: current.letters,
        secondsTaken: Math.min(elapsed, timeLimit),
        timeLimitSeconds: timeLimit,
        hintsUsed,
        solved,
      });
      setResults((previous) => [
        ...previous,
        {
          word: current.word,
          scrambled: current.scrambled,
          solved,
          score: scored.error ? 0 : scored.score,
          secondsTaken: Math.min(elapsed, timeLimit),
          hintsUsed,
        },
      ]);
      setRoundIndex((index) => index + 1);
      setGuess("");
      setHintsUsed(0);
      setElapsed(0);
      setFeedback(solved ? `Correct — ${current.word}` : `Time up. The word was ${current.word}.`);
    },
    [current, elapsed, timeLimit, hintsUsed],
  );

  useEffect(() => {
    if (!current) return undefined;
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [current]);

  useEffect(() => {
    if (current && elapsed >= timeLimit && timeLimit > 0) finishRound(false);
  }, [current, elapsed, timeLimit, finishRound]);

  const summary = useMemo(() => summariseGame(results), [results]);

  function submitGuess(event) {
    event.preventDefault();
    if (!current) return;
    const checked = checkGuess(guess, current.word);
    if (checked.error) {
      setFeedback(checked.error);
      return;
    }
    if (checked.correct) {
      finishRound(true);
      return;
    }
    setFeedback(checked.sameLetters ? "Right letters, wrong order — keep going." : "Not it. Use only the letters shown.");
  }

  function newGame() {
    setSeed(String(Math.floor(Math.random() * 1_000_000) + 1));
    setRoundIndex(0);
    setResults([]);
    setGuess("");
    setHintsUsed(0);
    setElapsed(0);
    setFeedback("");
    setCopied(false);
  }

  function restart() {
    setRoundIndex(0);
    setResults([]);
    setGuess("");
    setHintsUsed(0);
    setElapsed(0);
    setFeedback("");
    setCopied(false);
  }

  function reset() {
    setDifficulty("medium");
    setRoundCount(String(DEFAULT_ROUNDS));
    setSeed(String(DEFAULT_SEED));
    restart();
  }

  async function copyResult() {
    if (summary.error) return;
    const lines = [
      `Word Scramble — seed ${seed}, ${difficulty}`,
      `Score ${NUM.format(summary.totalScore)} across ${summary.rounds} rounds`,
      `Solved ${summary.solved}/${summary.rounds} (${NUM1.format(summary.accuracyPercent)}%), best streak ${summary.bestStreak}`,
      `Average ${NUM1.format(summary.averageSeconds)}s per round, ${summary.hintsUsed} hints used`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const hintText = current
    ? hintsUsed >= 3
      ? `${current.category} · ${current.hint} · starts with ${current.word.slice(0, 2)}`
      : hintsUsed === 2
        ? `${current.category} · ${current.hint} · starts with ${current.word.slice(0, 1)}`
        : hintsUsed === 1
          ? `${current.category} · ${current.hint}`
          : ""
    : "";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Shuffle className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Word Scramble Game
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {POINTS_PER_LETTER} points a letter, up to half as much again for speed, minus {HINT_PENALTY} for every hint.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={LABEL_CLASS} htmlFor="ws-difficulty">
            Difficulty
          </label>
          <select
            id="ws-difficulty"
            className={`mt-1 ${INPUT_CLASS}`}
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              restart();
            }}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="ws-rounds">
            Rounds
          </label>
          <input
            id="ws-rounds"
            className={`mt-1 ${INPUT_CLASS}`}
            value={roundCount}
            onChange={(e) => {
              setRoundCount(e.target.value);
              restart();
            }}
            inputMode="numeric"
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="ws-seed">
            Puzzle seed
          </label>
          <input
            id="ws-seed"
            className={`mt-1 ${INPUT_CLASS}`}
            value={seed}
            onChange={(e) => {
              setSeed(e.target.value);
              restart();
            }}
            inputMode="numeric"
          />
        </div>
      </section>

      {error ? (
        <p className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {error ? (
          <p className="text-4xl font-bold text-[var(--foreground)]">{DASH}</p>
        ) : finished ? (
          <div>
            <p className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Trophy className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
              Game over
            </p>
            <p className="text-4xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
              {summary.error ? DASH : `${NUM.format(summary.totalScore)} points`}
            </p>
            <dl className="mt-4">
              <Row label="Solved" value={summary.error ? DASH : `${summary.solved} of ${summary.rounds}`} />
              <Row label="Accuracy" value={summary.error ? DASH : `${NUM1.format(summary.accuracyPercent)}%`} />
              <Row label="Best streak" value={summary.error ? DASH : summary.bestStreak} />
              <Row label="Average time per round" value={summary.error ? DASH : `${NUM1.format(summary.averageSeconds)}s`} />
              <Row label="Hints used" value={summary.error ? DASH : summary.hintsUsed} />
            </dl>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-[var(--muted-foreground)]">
                Round {roundIndex + 1} of {rounds.length} · {current.letters} letters
              </p>
              <p className={`text-sm font-semibold tabular-nums ${secondsLeft <= 10 ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"}`}>
                {secondsLeft}s left
              </p>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className={`h-full rounded-full ${secondsLeft <= 10 ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${timeLimit > 0 ? (secondsLeft / timeLimit) * 100 : 0}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2" aria-label={`Scrambled letters: ${current.scrambled.split("").join(" ")}`}>
              {current.scrambled.split("").map((letter, position) => (
                <span
                  key={`${letter}-${position}`}
                  className="inline-flex h-12 w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-xl font-bold text-[var(--foreground)]"
                >
                  {letter}
                </span>
              ))}
            </div>

            <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={submitGuess}>
              <div>
                <label className="sr-only" htmlFor="ws-guess">
                  Your answer for round {roundIndex + 1}
                </label>
                <input
                  id="ws-guess"
                  className={INPUT_CLASS}
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Type the unscrambled word"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <button type="submit" className={PRIMARY_BTN} aria-label="Submit your answer">
                <Check className="h-4 w-4" aria-hidden="true" />
                Submit
              </button>
            </form>

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                className={GHOST_BTN}
                disabled={hintsUsed >= MAX_HINTS}
                onClick={() => setHintsUsed((n) => Math.min(MAX_HINTS, n + 1))}
                aria-label={`Reveal a hint, costing ${HINT_PENALTY} points`}
              >
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
                Hint ({hintsUsed}/{MAX_HINTS}) · −{HINT_PENALTY}
              </button>
              <button type="button" className={GHOST_BTN} onClick={() => finishRound(false)} aria-label="Give up on this word and move to the next round">
                <SkipForward className="h-4 w-4" aria-hidden="true" />
                Skip
              </button>
            </div>

            {hintText ? <p className="mt-3 text-sm text-[var(--muted-foreground)]">{hintText}</p> : null}
            {feedback ? (
              <p className="mt-3 text-sm font-semibold text-[var(--foreground)]" role="status">
                {feedback}
              </p>
            ) : null}
          </div>
        )}
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className={PRIMARY_BTN} onClick={newGame} aria-label="Start a new game with a fresh random seed">
          <Shuffle className="h-4 w-4" aria-hidden="true" />
          New game
        </button>
        <button type="button" className={PRIMARY_BTN} onClick={copyResult} disabled={Boolean(summary.error)} aria-label="Copy your score summary to the clipboard">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy result"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset the game to its default settings">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {results.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Rounds played</h2>
          <div className="mt-2 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="bg-[var(--card)] text-left text-[var(--muted-foreground)]">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">Scramble</th>
                  <th scope="col" className="px-4 py-2 font-medium">Word</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Time</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Hints</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {results.map((round, index) => (
                  <tr key={`${round.word}-${index}`} className="border-t border-[var(--border)]">
                    <td className="px-4 py-2 font-mono text-[var(--muted-foreground)]">{round.scrambled}</td>
                    <td className={`px-4 py-2 font-semibold ${round.solved ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>{round.word}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-[var(--foreground)]">{round.secondsTaken}s</td>
                    <td className="px-4 py-2 text-right tabular-nums text-[var(--foreground)]">{round.hintsUsed}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-[var(--foreground)]">{NUM.format(round.score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
