"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Lightbulb, RotateCcw, Shuffle, SkipForward } from "lucide-react";

import { LEVELS, buildPuzzle, checkAttempt, sessionScore } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [level, setLevel] = useState("Easy");
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [scored, setScored] = useState([]);
  const [attempted, setAttempted] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const puzzle = useMemo(
    () => buildPuzzle({ index, level, round, maskCase: true }),
    [index, level, round],
  );
  const puzzleError = puzzle.error || null;

  const attemptWords = useMemo(() => {
    if (puzzleError) return [];
    return placed.map((chipIndex) => puzzle.chips[chipIndex]).filter((word) => word !== undefined);
  }, [placed, puzzle, puzzleError]);

  const result = useMemo(() => {
    if (puzzleError) return { error: puzzleError };
    return checkAttempt({ attemptWords, answerWords: puzzle.answerWords });
  }, [attemptWords, puzzle, puzzleError]);

  const score = useMemo(
    () => sessionScore({ attempted, correct: correctCount }),
    [attempted, correctCount],
  );

  const error = puzzleError || result.error || score.error || null;
  const questionKey = puzzleError ? "" : `${puzzle.id}:${round}`;

  const addChip = (chipIndex) => {
    if (placed.includes(chipIndex)) return;
    setPlaced(placed.concat(chipIndex));
    setChecked(false);
  };

  const removeAt = (position) => {
    setPlaced(placed.filter((_, slot) => slot !== position));
    setChecked(false);
  };

  const clearLine = () => {
    setPlaced([]);
    setChecked(false);
  };

  const checkNow = () => {
    if (error || !result.complete) return;
    setChecked(true);
    if (!scored.includes(questionKey)) {
      setScored(scored.concat(questionKey));
      setAttempted(attempted + 1);
      if (result.correct) setCorrectCount(correctCount + 1);
    }
  };

  const nextQuestion = () => {
    setIndex(index + 1);
    setPlaced([]);
    setChecked(false);
    setShowHint(false);
  };

  const reshuffle = () => {
    setRound(round + 1);
    setPlaced([]);
    setChecked(false);
  };

  const changeLevel = (value) => {
    setLevel(value);
    setIndex(0);
    setPlaced([]);
    setChecked(false);
    setShowHint(false);
  };

  const reset = () => {
    setLevel("Easy");
    setIndex(0);
    setRound(0);
    setPlaced([]);
    setChecked(false);
    setShowHint(false);
    setScored([]);
    setAttempted(0);
    setCorrectCount(0);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Jumbled Sentence Rearranger Drill",
      `Level: ${puzzle.level}`,
      `Correct sentence: ${puzzle.sentence}`,
      `Grammar rule: ${puzzle.note}`,
      `Session: ${score.correct} correct out of ${score.attempted} (${score.accuracyPct}% accuracy)`,
    ].join("\n");
  }, [error, puzzle, score]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const solvedLine = error
    ? DASH
    : `${attemptWords.join(" ")}${attemptWords.length ? puzzle.terminator : ""}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Shuffle className="h-4 w-4" aria-hidden="true" />
          Grammar drill
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Jumbled Sentence Rearranger Drill
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tap the words in the right order to rebuild the sentence. Every answer comes with the
          grammar rule that decides the word order, so a wrong attempt turns into an explanation
          rather than a red cross.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jsr-level">
              Difficulty
            </label>
            <select
              id="jsr-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={level}
              onChange={(event) => changeLevel(event.target.value)}
            >
              <option value="All">All levels</option>
              {LEVELS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className={LABEL_CLASS} id="jsr-progress-label">
              Question
            </p>
            <p
              className="mt-2 flex h-11 items-center rounded-md border border-[var(--border)] px-3 text-sm text-[var(--muted-foreground)]"
              aria-labelledby="jsr-progress-label"
            >
              {error ? DASH : `${puzzle.position + 1} of ${puzzle.poolSize} · ${puzzle.level}`}
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your sentence</h2>
            <div
              className="mt-3 min-h-16 rounded-md border border-dashed border-[var(--border)] p-3"
              aria-live="polite"
            >
              {placed.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Tap the word tiles below to build the sentence here.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {placed.map((chipIndex, slot) => (
                    <button
                      key={`${chipIndex}-${slot}`}
                      type="button"
                      className={CHIP}
                      onClick={() => removeAt(slot)}
                      aria-label={`Remove ${puzzle.chips[chipIndex]} from position ${slot + 1}`}
                    >
                      {puzzle.chips[chipIndex]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <h3 className="mt-5 text-sm font-semibold">Word tiles</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {puzzle.chips.map((word, chipIndex) => (
                <button
                  key={`${word}-${chipIndex}`}
                  type="button"
                  className={CHIP}
                  onClick={() => addChip(chipIndex)}
                  disabled={placed.includes(chipIndex)}
                  aria-label={`Add ${word} to the sentence`}
                >
                  <span className={placed.includes(chipIndex) ? "opacity-40" : undefined}>
                    {word}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className={PRIMARY_BTN}
                onClick={checkNow}
                disabled={!result.complete}
                aria-label="Check the sentence you built"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                Check answer
              </button>
              <button type="button" className={GHOST_BTN} onClick={clearLine}>
                Clear line
              </button>
              <button type="button" className={GHOST_BTN} onClick={reshuffle}>
                <Shuffle className="h-4 w-4" aria-hidden="true" />
                Reshuffle
              </button>
              <button type="button" className={GHOST_BTN} onClick={nextQuestion}>
                <SkipForward className="h-4 w-4" aria-hidden="true" />
                Next sentence
              </button>
              <button
                type="button"
                className={GHOST_BTN}
                onClick={() => setShowHint((value) => !value)}
                aria-expanded={showHint}
              >
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
                {showHint ? "Hide hint" : "Hint"}
              </button>
            </div>

            {showHint ? (
              <p className="mt-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                {puzzle.hint}
              </p>
            ) : null}

            {checked ? (
              <div
                className={`mt-4 rounded-md px-3 py-3 text-sm ${
                  result.correct
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : "bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
                role="status"
              >
                <p className="font-semibold">
                  {result.correct
                    ? "Correct."
                    : `Not yet — the first word out of place is position ${result.firstWrongIndex + 1}.`}
                </p>
                <p className="mt-1 text-[var(--foreground)]">
                  <span className="font-semibold">Answer:</span> {puzzle.sentence}
                </p>
                <p className="mt-1 text-[var(--muted-foreground)]">{puzzle.note}</p>
              </div>
            ) : null}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Session accuracy
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {score.accuracyPct}%
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {score.correct} correct out of {score.attempted} checked
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the answer and session score"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Reset the drill and clear the score"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Sentence as built", solvedLine || DASH],
                ["Words placed", `${placed.length} of ${puzzle.answerWords.length}`],
                ["Words in the right slot", `${result.correctCount} of ${result.total}`],
                ["Sentences checked", String(score.attempted)],
                ["Wrong so far", String(score.wrong)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                >
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="font-semibold sm:max-w-[62%] sm:text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Answers are matched without regard to capital letters, so the opening word is never a
        giveaway. Some sentences allow a second natural order in speech; the key shown is the one
        used in standard exam answer sheets.
      </p>
    </main>
  );
}
