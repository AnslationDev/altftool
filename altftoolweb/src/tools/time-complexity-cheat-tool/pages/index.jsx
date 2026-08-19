"use client";

import { useMemo, useState } from "react";
import { Binary, Check, Copy, RotateCcw } from "lucide-react";

import { CATEGORIES, filterComplexityEntries, growthTable } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = { query: "", category: "all" };

export default function ToolHome() {
  const [query, setQuery] = useState(DEFAULTS.query);
  const [category, setCategory] = useState(DEFAULTS.category);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => filterComplexityEntries({ query, category }),
    [query, category],
  );
  const growth = useMemo(() => growthTable(), []);

  const hasError = Boolean(result.error);
  const entries = hasError ? [] : result.entries;

  const summary = useMemo(() => {
    if (hasError || entries.length === 0) return "";
    return [
      "| Algorithm / structure | Best | Average | Worst | Space |",
      "| --- | --- | --- | --- | --- |",
      ...entries.map(
        (entry) =>
          `| ${entry.name} | ${entry.best} | ${entry.average} | ${entry.worst} | ${entry.space} |`,
      ),
    ].join("\n");
  }, [hasError, entries]);

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
    setQuery(DEFAULTS.query);
    setCategory(DEFAULTS.category);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Binary className="h-4 w-4" aria-hidden="true" />
          Interview prep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Time Complexity Cheat Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Best, average and worst-case time plus auxiliary space for the algorithms and data
          structures interviews actually ask about, following the canonical CLRS analyses.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-query">
              Search
            </label>
            <input
              id="tc-query"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="quicksort, hash, O(n log n)…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-category">
              Category
            </label>
            <select
              id="tc-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
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

      <section aria-live="polite" aria-atomic="true" className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Matching entries
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.count}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see results."
                : `of ${result.total} algorithms and data structures in the reference.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError || entries.length === 0}
              aria-label="Copy the visible complexity table as Markdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy table"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset search and category filters"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Algorithm / structure</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Best</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Average</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Worst</th>
                <th scope="col" className="py-2 font-semibold">Space</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-[var(--muted-foreground)]">
                    {hasError ? DASH : "No entries match — try a shorter search term."}
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.name} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold">{entry.name}</span>
                      <span className="mt-0.5 block max-w-xs text-xs leading-4 text-[var(--muted-foreground)]">
                        {entry.note}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{entry.best}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{entry.average}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap font-semibold">{entry.worst}</td>
                    <td className="py-2.5 whitespace-nowrap">{entry.space}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How fast does each class grow?</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Approximate operation counts by input size n.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Class</th>
                {growth.sizes.map((size) => (
                  <th key={size} scope="col" className="py-2 pr-3 text-right font-semibold">
                    n = {size.toLocaleString("en-US")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {growth.rows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.label}</td>
                  {row.counts.map((count, index) => (
                    <td key={growth.sizes[index]} className="py-2 pr-3 text-right">
                      {count}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Big-O hides constant factors, so an O(n²) insertion sort beats O(n log n) sorts on
        tiny inputs — which is why production sorts switch algorithms below a threshold.
        Complexities follow CLRS; space figures are auxiliary space unless noted.
      </p>
    </main>
  );
}
