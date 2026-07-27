"use client";

import { useMemo, useState } from "react";
import { BookA, Check, Copy, RotateCcw, Search } from "lucide-react";

import { CATEGORIES, categoryCounts, searchGlossary } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const FILTERS = ["All", ...CATEGORIES];
const COUNTS = categoryCounts();

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [copiedTerm, setCopiedTerm] = useState(null);

  const result = useMemo(() => searchGlossary({ query, category }), [query, category]);
  const hasError = Boolean(result.error);

  const copyEntry = async (entry) => {
    const text = [
      entry.term,
      entry.source,
      "",
      entry.definition,
      entry.example ? `Example: ${entry.example}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTerm(entry.term);
      setTimeout(() => setCopiedTerm(null), 1500);
    } catch {
      setCopiedTerm(null);
    }
  };

  const reset = () => {
    setQuery("");
    setCategory("All");
    setCopiedTerm(null);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <BookA className="h-4 w-4" aria-hidden="true" />
          {COUNTS.All} terms, every one sourced
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Tax Jargon Glossary Explorer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Income tax, GST, investing and banking vocabulary in plain language, each entry naming the
          section or regulation it comes from. Search by the word, the abbreviation or the section
          number.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div>
          <label className={LABEL_CLASS} htmlFor="tjg-search">
            Search a term, abbreviation or section
          </label>
          <div className="relative mt-2">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
              aria-hidden="true"
            />
            <input
              id="tjg-search"
              className={`${INPUT_CLASS} pl-9`}
              type="search"
              autoComplete="off"
              placeholder="TDS, 87A, input tax credit, XIRR"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Filter by area</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {FILTERS.map((name) => {
              const active = category === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setCategory(name)}
                  aria-pressed={active}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {name}
                  <span className={active ? "opacity-80" : "text-[var(--muted-foreground)]"}>
                    {COUNTS[name]}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            {hasError ? "—" : `${result.matchCount} of ${result.total} entries shown`}
          </p>
          <button type="button" onClick={reset} aria-label="Clear the search and filters" className={PRIMARY_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      {!hasError && result.matchCount === 0 ? (
        <p className="mt-6 rounded-xl bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
          Nothing matched &ldquo;{query}&rdquo;
          {category === "All" ? "" : ` in ${category}`}. Try the abbreviation instead of the full
          phrase, or switch the filter back to All.
        </p>
      ) : null}

      {!hasError && result.matchCount > 0 ? (
        <ul className="mt-6 space-y-4">
          {result.results.map((entry) => (
            <li key={entry.term} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">{entry.term}</h2>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{entry.source}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                    {entry.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyEntry(entry)}
                    aria-label={`Copy the definition of ${entry.term}`}
                    className={GHOST_BTN}
                  >
                    {copiedTerm === entry.term ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    )}
                    {copiedTerm === entry.term ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6">{entry.definition}</p>
              {entry.example ? (
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  {entry.example}
                </p>
              ) : null}
              {entry.aka && entry.aka.length ? (
                <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                  Also written as: {entry.aka.join(", ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax or legal advice. Definitions describe the general rule; every
        section has provisos and exceptions, and rates and thresholds change with each Finance Act.
        Read the section itself, or ask a chartered accountant, before relying on any of this for a
        filing.
      </p>
    </main>
  );
}
