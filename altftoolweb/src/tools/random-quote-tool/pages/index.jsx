"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, Quote, RotateCcw, Shuffle } from "lucide-react";

import { formatQuote, MAX_SEED, pickQuote, quoteLength, quoteStats, THEMES } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const FIRST_SEED = 19470815;
const NUM = new Intl.NumberFormat("en-IN");

const newSeed = () => Math.floor(Math.random() * MAX_SEED) + 1;

export default function ToolHome() {
  const [theme, setTheme] = useState("all");
  const [seed, setSeed] = useState(FIRST_SEED);
  const [seen, setSeen] = useState([]);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => quoteStats(), []);
  const result = useMemo(() => pickQuote({ seed, theme, excludeIds: seen }), [seed, theme, seen]);

  const quote = result.error ? null : result.quote;
  const length = useMemo(() => (quote ? quoteLength(quote) : { error: "No quote." }), [quote]);

  const nextQuote = useCallback(() => {
    setSeen((prev) => {
      if (!quote) return prev;
      if (result.cycled) return [quote.id];
      return prev.includes(quote.id) ? prev : [...prev, quote.id];
    });
    setSeed(newSeed());
    setCopied(false);
  }, [quote, result.cycled]);

  const changeTheme = (value) => {
    setTheme(value);
    setSeen([]);
    setSeed(newSeed());
    setCopied(false);
  };

  const reset = () => {
    setTheme("all");
    setSeen([]);
    setSeed(FIRST_SEED);
    setCopied(false);
  };

  const copy = async () => {
    if (!quote) return;
    try {
      await navigator.clipboard.writeText(formatQuote(quote));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const themeLabel = THEMES.find((t) => t.id === theme)?.label ?? "Any theme";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Quote className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Random Quote Generator
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {NUM.format(stats.total)} attributed quotes from {NUM.format(stats.authors)} authors,
          stored in the page. No API, no tracking, and the attribution is copied with the text.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="quote-theme">
            Theme
          </label>
          <select
            id="quote-theme"
            className={`${INPUT_CLASS} mt-1.5`}
            value={theme}
            onChange={(event) => changeTheme(event.target.value)}
          >
            {THEMES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="quote-seed">
            Seed (same seed, same quote)
          </label>
          <input
            id="quote-seed"
            type="number"
            min="1"
            max={MAX_SEED}
            className={`${INPUT_CLASS} mt-1.5`}
            value={seed}
            onChange={(event) => {
              const next = Number(event.target.value);
              setSeed(Number.isFinite(next) ? next : FIRST_SEED);
              setCopied(false);
            }}
          />
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
          {themeLabel}
        </p>

        <blockquote className="mt-3">
          <p className="text-xl leading-relaxed font-bold text-[var(--foreground)] sm:text-2xl">
            {quote ? `“${quote.text}”` : DASH}
          </p>
          <footer className="mt-3 text-base font-semibold text-[var(--primary)]">
            {quote ? `— ${quote.author}` : DASH}
          </footer>
        </blockquote>

        <dl className="mt-5 grid gap-x-6 gap-y-2 border-t border-[var(--border)] pt-4 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted-foreground)]">Quotes in this theme</dt>
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
            <dt className="text-[var(--muted-foreground)]">Words</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {length.error ? DASH : NUM.format(length.words)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted-foreground)]">Characters with credit</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {length.error ? DASH : NUM.format(length.withAttribution)}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={nextQuote} className={`${PRIMARY_BTN} flex-1 sm:flex-none`}>
          <Shuffle className="h-4 w-4" aria-hidden="true" />
          New quote
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={!quote}
          aria-label="Copy the quote with its attribution"
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
            Quotes available per theme
          </caption>
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th scope="col" className="py-2 pr-4 font-semibold text-[var(--foreground)]">
                Theme
              </th>
              <th scope="col" className="py-2 text-right font-semibold text-[var(--foreground)]">
                Quotes
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.byTheme.map((row) => (
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
