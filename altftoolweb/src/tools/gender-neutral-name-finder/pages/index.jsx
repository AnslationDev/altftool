"use client";

import { useMemo, useState } from "react";
import { Check, CircleDot, Copy, RotateCcw } from "lucide-react";

import { availableTraditions, filterNeutralNames } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { tradition: "any", maxLetters: "20", minScore: "0", withNote: false, query: "" };
const DASH = "—";

export default function ToolHome() {
  const [tradition, setTradition] = useState(DEFAULTS.tradition);
  const [maxLetters, setMaxLetters] = useState(DEFAULTS.maxLetters);
  const [minScore, setMinScore] = useState(DEFAULTS.minScore);
  const [withNote, setWithNote] = useState(DEFAULTS.withNote);
  const [query, setQuery] = useState(DEFAULTS.query);
  const [copied, setCopied] = useState(false);

  const traditions = useMemo(() => availableTraditions(), []);

  const result = useMemo(
    () =>
      filterNeutralNames({
        tradition,
        maxLetters: Number(maxLetters),
        minScore: Number(minScore),
        withNote,
        query,
      }),
    [tradition, maxLetters, minScore, withNote, query],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Gender-neutral name shortlist",
      `${result.total} names, average portability ${result.averageScore}/100`,
      "",
      ...result.names.map(
        (n) => `${n.score}/100  ${n.name} (${n.traditions.join(", ")}) — ${n.meaning}`,
      ),
    ].join("\n");
  }, [result]);

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

  const reset = () => {
    setTradition(DEFAULTS.tradition);
    setMaxLetters(DEFAULTS.maxLetters);
    setMinScore(DEFAULTS.minScore);
    setWithNote(DEFAULTS.withNote);
    setQuery(DEFAULTS.query);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CircleDot className="h-4 w-4" aria-hidden="true" />
          Unisex names
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gender Neutral Name Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every name here is used for more than one gender. Each is scored out of 100 for how well it
          travels: how many traditions already use it, whether it stays under six letters, whether it
          avoids aspirated digraphs and three-consonant runs, and whether it ends in a sound most
          languages share.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gn-tradition">
              Tradition
            </label>
            <select
              id="gn-tradition"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tradition}
              onChange={(event) => setTradition(event.target.value)}
            >
              <option value="any">All traditions</option>
              {traditions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gn-query">
              Search name or meaning
            </label>
            <input
              id="gn-query"
              className={`mt-2 ${INPUT_CLASS}`}
              type="search"
              placeholder="light, sea, peace…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gn-max">
              Maximum letters
            </label>
            <input
              id="gn-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              max="20"
              step="1"
              value={maxLetters}
              onChange={(event) => setMaxLetters(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gn-score">
              Minimum portability score
            </label>
            <input
              id="gn-score"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="5"
              value={minScore}
              onChange={(event) => setMinScore(event.target.value)}
            />
          </div>
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="gn-notes">
          <input
            id="gn-notes"
            type="checkbox"
            className="h-5 w-5 rounded border border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={withNote}
            onChange={(event) => setWithNote(event.target.checked)}
          />
          Only names with a cross-culture usage note
        </label>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Names matched
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : NUM.format(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? DASH : `out of ${NUM.format(result.libraryTotal)} unisex names`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the gender-neutral name shortlist"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all filters" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Average portability score", result.error ? DASH : `${result.averageScore}/100`],
            [
              "Highest scoring match",
              result.error || !result.best ? DASH : `${result.best.name} (${result.best.score}/100)`,
            ],
            ["Traditions covered", result.error ? DASH : NUM.format(traditions.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && result.total === 0 ? (
        <p className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)]">
          Nothing matched. Lower the minimum score, raise the letter cap, or clear the search box.
        </p>
      ) : null}

      {!result.error && result.total > 0 ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {result.names.map((entry) => (
            <li key={entry.name} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold">{entry.name}</h2>
                <span className="text-sm font-semibold text-[var(--primary)]">{entry.score}/100</span>
              </div>
              <p className="mt-1 text-sm text-[var(--foreground)]">{entry.meaning}</p>
              {entry.note ? (
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{entry.note}</p>
              ) : null}
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {entry.traditions.join(" · ")} — {entry.band}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The portability score measures how easily a name crosses languages, not how good it is. Gender
        association shifts by country and by decade, so a name that reads neutral where you live may
        read strongly gendered elsewhere — the usage notes flag the best-known cases.
      </p>
    </main>
  );
}
