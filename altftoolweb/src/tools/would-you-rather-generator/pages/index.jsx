"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shuffle, Sparkles } from "lucide-react";

import {
  CATEGORIES,
  DIFFICULTIES,
  drawQuestion,
  formatQuestion,
  TOTAL_QUESTIONS,
  voteSplit,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const OPTION_BTN =
  "flex min-h-11 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-center text-base font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const DEFAULTS = { seed: "party-night", category: "all", difficulty: "all" };
const NUM = new Intl.NumberFormat("en-IN");

const DIFFICULTY_LABEL = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export default function ToolHome() {
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [category, setCategory] = useState(DEFAULTS.category);
  const [difficulty, setDifficulty] = useState(DEFAULTS.difficulty);
  const [index, setIndex] = useState(0);
  const [votesA, setVotesA] = useState(0);
  const [votesB, setVotesB] = useState(0);
  const [picked, setPicked] = useState(null);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => drawQuestion({ seed, category, difficulty, index }),
    [seed, category, difficulty, index],
  );

  const split = useMemo(() => voteSplit(votesA, votesB), [votesA, votesB]);
  const error = result.error || split.error || null;
  const question = result.error ? null : result.question;
  const text = question ? formatQuestion(question) : "";

  // Changing a filter or the seed deals a new deck, so the position and the
  // running tally start again. Done in the handlers rather than an effect.
  const restart = () => {
    setIndex(0);
    setVotesA(0);
    setVotesB(0);
    setPicked(null);
  };

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const nextQuestion = () => {
    setIndex((prev) => prev + 1);
    setPicked(null);
  };

  const newDeck = () => {
    setSeed(`deck-${Math.floor(Math.random() * 1000000)}`);
    restart();
  };

  const choose = (side) => {
    if (!question || picked) return;
    setPicked(side);
    if (side === "A") setVotesA((prev) => prev + 1);
    else setVotesB((prev) => prev + 1);
  };

  const reset = () => {
    setSeed(DEFAULTS.seed);
    setCategory(DEFAULTS.category);
    setDifficulty(DEFAULTS.difficulty);
    setIndex(0);
    setVotesA(0);
    setVotesB(0);
    setPicked(null);
    setCopied(false);
  };

  const copy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Sparkles className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Would You Rather Generator
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {NUM.format(TOTAL_QUESTIONS)} forced-choice dilemmas, shuffled from a seed so the same deck
          can be replayed or shared.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="wyr-category">
            Category
          </label>
          <select
            id="wyr-category"
            className={`${INPUT_CLASS} mt-1`}
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              restart();
            }}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="wyr-difficulty">
            How hard should the choice be?
          </label>
          <select
            id="wyr-difficulty"
            className={`${INPUT_CLASS} mt-1`}
            value={difficulty}
            onChange={(event) => {
              setDifficulty(event.target.value);
              restart();
            }}
          >
            <option value="all">Any</option>
            {DIFFICULTIES.map((item) => (
              <option key={item} value={item}>
                {DIFFICULTY_LABEL[item]}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={LABEL_CLASS} htmlFor="wyr-seed">
            Deck seed (same seed = same order of questions)
          </label>
          <input
            id="wyr-seed"
            type="text"
            className={`${INPUT_CLASS} mt-1`}
            value={seed}
            onChange={(event) => {
              setSeed(event.target.value);
              restart();
            }}
            placeholder="party-night"
          />
        </div>
      </section>

      {error ? (
        <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Would you rather…</p>
        <p className="mt-2 text-2xl font-bold leading-snug text-[var(--foreground)]">
          {error ? DASH : text}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={`${OPTION_BTN} ${picked === "A" ? "border-[var(--primary)]" : ""}`}
            onClick={() => choose("A")}
            disabled={Boolean(error) || Boolean(picked)}
            aria-label={question ? `Choose option A: ${question.optionA}` : "Choose option A"}
          >
            {error ? DASH : question.optionA}
          </button>
          <button
            type="button"
            className={`${OPTION_BTN} ${picked === "B" ? "border-[var(--primary)]" : ""}`}
            onClick={() => choose("B")}
            disabled={Boolean(error) || Boolean(picked)}
            aria-label={question ? `Choose option B: ${question.optionB}` : "Choose option B"}
          >
            {error ? DASH : question.optionB}
          </button>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Question</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : `${result.position + 1} of ${result.size}`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Difficulty</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : DIFFICULTY_LABEL[question.difficulty]}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Category</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error
                ? DASH
                : (CATEGORIES.find((item) => item.id === question.category) || {}).label || DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Your tally so far</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : `${split.percentA}% left · ${split.percentB}% right (${split.total} votes)`}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={PRIMARY_BTN}
          onClick={nextQuestion}
          disabled={Boolean(result.error)}
          aria-label="Show the next would you rather question"
        >
          <Shuffle className="h-4 w-4" aria-hidden="true" />
          Next question
        </button>
        <button type="button" className={GHOST_BTN} onClick={newDeck} aria-label="Reshuffle with a brand new deck seed">
          New deck
        </button>
        <button
          type="button"
          className={GHOST_BTN}
          onClick={copy}
          disabled={!text}
          aria-label="Copy this would you rather question to the clipboard"
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy question"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset filters, seed and votes">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        Every question in a deck appears once before any repeats, so a full pass through
        {" "}
        {error ? DASH : NUM.format(result.size)} dilemmas never asks you the same thing twice.
      </p>
    </div>
  );
}
