"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, LayoutGrid, RotateCcw } from "lucide-react";

import {
  CELL_STATUSES,
  CLASSES,
  SUBJECTS,
  cellKey,
  computeCoverage,
  isAvailable,
  nextCellStatus,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";
const STORAGE_KEY = "altft-class-wise-ncert-coverage-map";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const CELL_CLASS = {
  "not-started": "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]",
  "in-progress": "border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)]",
  done: "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]",
};

const CELL_MARK = { "not-started": "·", "in-progress": "½", done: "✓" };
const STATUS_LABEL = Object.fromEntries(CELL_STATUSES.map((s) => [s.id, s.label]));

// A realistic partly-read default so the map shows a meaningful result at first paint.
const DEFAULT_GRID = {
  "history-6": "done",
  "history-7": "done",
  "history-8": "in-progress",
  "geography-6": "done",
  "geography-7": "in-progress",
  "polity-9": "done",
  "polity-10": "done",
  "economics-11": "in-progress",
};

export default function ToolHome() {
  const [grid, setGrid] = useState(DEFAULT_GRID);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) setGrid(parsed);
      }
    } catch {
      /* corrupted storage — keep defaults */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(grid));
    } catch {
      /* storage blocked — session-only */
    }
  }, [grid]);

  const result = useMemo(() => computeCoverage({ grid }), [grid]);
  const hasError = Boolean(result.error);

  const cycleCell = (subjectId, classNumber) => {
    const key = cellKey(subjectId, classNumber);
    setGrid((previous) => ({
      ...previous,
      [key]: nextCellStatus(previous[key] ?? "not-started"),
    }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Class-wise NCERT coverage (classes 6-12)",
      `Overall: ${PCT.format(result.overallPercent)}% of ${NUM.format(result.totalBooks)} books`,
      ...result.bySubject.map((s) => `${s.label}: ${PCT.format(s.percent)}%`),
      `Weakest subject: ${result.weakestSubject.label} (${PCT.format(result.weakestSubject.percent)}%)`,
      `Weakest class: Class ${result.weakestClass.classNumber} (${PCT.format(result.weakestClass.percent)}%)`,
    ].join("\n");
  }, [hasError, result]);

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
    setGrid(DEFAULT_GRID);
    setCopied(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          NCERT tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Class Wise NCERT Coverage Map</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tap a cell to cycle it through Not started → In progress → Done. The grid follows the
          standard UPSC NCERT reading list for classes 6-12; blank cells mean no commonly-read book
          exists there. Saved in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Subject
                </th>
                {CLASSES.map((classNumber) => (
                  <th scope="col" key={classNumber} className="px-1 py-2 text-center font-semibold">
                    {classNumber}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUBJECTS.map((subject) => (
                <tr key={subject.id} className="border-b border-[var(--border)] last:border-0">
                  <th scope="row" className="py-2 pr-3 font-semibold">
                    {subject.label}
                  </th>
                  {CLASSES.map((classNumber) => {
                    if (!isAvailable(subject.id, classNumber)) {
                      return (
                        <td key={classNumber} className="px-1 py-2 text-center text-[var(--muted-foreground)]">
                          <span aria-hidden="true"> </span>
                        </td>
                      );
                    }
                    const status = grid[cellKey(subject.id, classNumber)] ?? "not-started";
                    return (
                      <td key={classNumber} className="px-1 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => cycleCell(subject.id, classNumber)}
                          aria-label={`${subject.label} class ${classNumber}: ${STATUS_LABEL[status] ?? status}. Tap to change.`}
                          className={`min-h-11 min-w-11 rounded-md border text-base font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${CELL_CLASS[status] ?? CELL_CLASS["not-started"]}`}
                        >
                          {CELL_MARK[status] ?? CELL_MARK["not-started"]}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
          {CELL_STATUSES.map((status) => (
            <li key={status.id} className="flex items-center gap-1.5">
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border text-[10px] ${CELL_CLASS[status.id]}`}
                aria-hidden="true"
              >
                {CELL_MARK[status.id]}
              </span>
              {status.label}
            </li>
          ))}
        </ul>
      </section>

      {hasError ? (
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
              Overall coverage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${PCT.format(result.overallPercent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Reset the map to clear the corrupted data."
                : `${NUM.format(result.doneCount)} done, ${NUM.format(result.inProgressCount)} in progress, ${NUM.format(result.notStartedCount)} untouched of ${NUM.format(result.totalBooks)} books.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the coverage summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the coverage map" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Coverage by subject", DASH],
                ["Weakest subject", DASH],
                ["Weakest class", DASH],
              ]
            : [
                ...result.bySubject.map((s) => [
                  `${s.label} (${NUM.format(s.books)} books)`,
                  `${PCT.format(s.percent)}%`,
                ]),
                [
                  "Weakest subject",
                  `${result.weakestSubject.label} — ${PCT.format(result.weakestSubject.percent)}%`,
                ],
                [
                  "Weakest class",
                  `Class ${result.weakestClass.classNumber} — ${PCT.format(result.weakestClass.percent)}%`,
                ],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Coverage counts Done as 100%, In progress as 50% and Not started as 0% of a book, averaged
        over the books available in each row, column or the whole grid. The book list mirrors the
        standard UPSC NCERT set: History, Geography and Polity for classes 6-12, Economics from
        class 9, Science for classes 6-10 and Sociology in classes 11-12.
      </p>
    </main>
  );
}
