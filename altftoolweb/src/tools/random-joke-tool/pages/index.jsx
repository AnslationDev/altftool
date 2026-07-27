"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shuffle, Smile } from "lucide-react";

import { CATEGORIES, formatJoke, jokeStats, MAX_SEED, pickJoke } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const FIRST_SEED = 20260727;
const NUM = new Intl.NumberFormat("en-IN");

/** New random seed. Lives in the UI so lib.js stays pure. */
const newSeed = () => Math.floor(Math.random() * MAX_SEED) + 1;

export default function ToolHome() {
  const [category, setCategory] = useState("all");
  const [seed, setSeed] = useState(FIRST_SEED);
  const [seen, setSeen] = useState([]);
  const [revealed, setRevealed] = useState(true);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => jokeStats(), []);

  const result = useMemo(
    () => pickJoke({ seed, category, excludeIds: seen }),
    [seed, category, seen],
  );

  const joke = result.error ? null : result.joke;

  const nextJoke = useCallback(() => {
    setSeen((prev) => {
      if (!joke) return prev;
      if (result.cycled) return [joke.id];
      return prev.includes(joke.id) ? prev : [...prev, joke.id];
    });
    setSeed(newSeed());
    setRevealed(false);
    setCopied(false);
  }, [joke, result.cycled]);

  const changeCategory = (value) => {
    setCategory(value);
    setSeen([]);
    setSeed(newSeed());
    setRevealed(true);
    setCopied(false);
  };

  const reset = () => {
    setCategory("all");
    setSeen([]);
    setSeed(FIRST_SEED);
    setRevealed(true);
    setCopied(false);
  };

  const copy = async () => {
    if (!joke) return;
    try {
      await navigator.clipboard.writeText(formatJoke(joke));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const categoryLabel =
    CATEGORIES.find((c) => c.id === category)?.label ?? "Any category";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Smile className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Random Joke Generator
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {NUM.format(stats.total)} clean, hand-picked jokes. Nothing is fetched
          from a server — pick a category and hit the button.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="joke-category">
            Category
          </label>
          <select
            id="joke-category"
            className={`${INPUT_CLASS} mt-1.5`}
            value={category}
            onChange={(event) => changeCategory(event.target.value)}
          >
            {CATEGORIES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="joke-reveal">
            Punchline
          </label>
          <select
            id="joke-reveal"
            className={`${INPUT_CLASS} mt-1.5`}
            value={revealed ? "instant" : "hidden"}
            onChange={(event) => setRevealed(event.target.value === "instant")}
          >
            <option value="instant">Show straight away</option>
            <option value="hidden">Hide until I tap</option>
          </select>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
          {categoryLabel}
        </p>

        <p className="mt-3 text-xl leading-relaxed font-bold text-[var(--foreground)] sm:text-2xl">
          {joke ? joke.setup : DASH}
        </p>

        {joke && revealed ? (
          <p className="mt-3 text-lg leading-relaxed text-[var(--primary)] sm:text-xl">
            {joke.punchline}
          </p>
        ) : null}

        {joke && !revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className={`${GHOST_BTN} mt-3 w-full sm:w-auto`}
          >
            Reveal the punchline
          </button>
        ) : null}

        <dl className="mt-5 grid gap-x-6 gap-y-2 border-t border-[var(--border)] pt-4 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted-foreground)]">Jokes in this category</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {result.error ? DASH : NUM.format(result.poolSize)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted-foreground)]">Unseen left</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {result.error ? DASH : NUM.format(result.remaining)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted-foreground)]">Seed</dt>
            <dd className="font-mono font-semibold text-[var(--foreground)]">
              {result.error ? DASH : seed}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted-foreground)]">Pool status</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {result.error ? DASH : result.cycled ? "Restarted" : "Fresh"}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={nextJoke} className={`${PRIMARY_BTN} flex-1 sm:flex-none`}>
          <Shuffle className="h-4 w-4" aria-hidden="true" />
          Another joke
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={!joke}
          aria-label="Copy this joke to the clipboard"
          className={`${GHOST_BTN} disabled:opacity-50`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button type="button" onClick={reset} className={GHOST_BTN} aria-label="Reset the generator">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <section className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[22rem] text-left text-sm">
          <caption className="pb-2 text-left text-xs text-[var(--muted-foreground)]">
            What is in the joke book
          </caption>
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th scope="col" className="py-2 pr-4 font-semibold text-[var(--foreground)]">
                Category
              </th>
              <th scope="col" className="py-2 text-right font-semibold text-[var(--foreground)]">
                Jokes
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.byCategory.map((row) => (
              <tr key={row.id} className="border-b border-[var(--border)]">
                <td className="py-2 pr-4 text-[var(--muted-foreground)]">{row.label}</td>
                <td className="py-2 text-right font-semibold text-[var(--foreground)]">
                  {NUM.format(row.count)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
