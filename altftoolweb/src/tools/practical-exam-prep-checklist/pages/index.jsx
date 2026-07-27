"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCheck, Copy, RotateCcw } from "lucide-react";

import { CHECKLIST_SECTIONS, computeProgress } from "../lib";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** A believable mid-preparation starting state so a real result shows at first paint. */
const DEFAULT_CHECKED = ["rec-complete", "rec-index", "exp-list", "day-admit"];

export default function ToolHome() {
  const [checkedIds, setCheckedIds] = useState(DEFAULT_CHECKED);
  const [copied, setCopied] = useState(false);

  const toggle = (id) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id],
    );
  };

  const result = useMemo(() => computeProgress({ checkedIds }), [checkedIds]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Practical exam readiness: ${result.percent}% (${result.totalDone}/${result.totalItems} items)`,
      result.verdict,
      ...result.sections.map(
        (section) => `${section.title}: ${section.done}/${section.total} (${section.percent}%)`,
      ),
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
    setCheckedIds(DEFAULT_CHECKED);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          University Exams
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Practical Exam Prep Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Records, experiments, viva and exam-day logistics — tick items off and watch the
          per-section readiness bars fill up.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Overall readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${result.percent}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Something went wrong with the checklist state — reset to continue."
                : `${result.totalDone} of ${result.totalItems} items done. ${result.verdict}${result.weakestSection ? ` Weakest section: ${result.weakestSection}.` : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the readiness summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist to the starting state" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.error}
          </p>
        ) : (
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {result.sections.map((section) => (
              <div key={section.id} className="rounded-md border border-[var(--border)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-sm font-semibold">{section.title}</dt>
                  <dd className="text-sm font-semibold text-[var(--muted-foreground)]">
                    {section.done}/{section.total}
                  </dd>
                </div>
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="progressbar"
                  aria-label={`${section.title} completion`}
                  aria-valuenow={section.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{ width: `${section.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </dl>
        )}
      </section>

      {CHECKLIST_SECTIONS.map((section) => (
        <section key={section.id} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{section.title}</h2>
          <ul className="mt-3 space-y-1">
            {section.items.map((item) => {
              const checked = checkedIds.includes(item.id);
              return (
                <li key={item.id}>
                  <label
                    htmlFor={`pec-${item.id}`}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm leading-6 transition hover:bg-[var(--muted)]"
                  >
                    <input
                      id={`pec-${item.id}`}
                      type="checkbox"
                      className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                      checked={checked}
                      onChange={() => toggle(item.id)}
                    />
                    <span className={checked ? "text-[var(--muted-foreground)] line-through" : ""}>
                      {item.label}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Items reflect the common expectations of board and university lab exams — your examiner's
        instructions and your institution's lab manual always take precedence. Ticks are not saved
        after you leave the page; copy the summary to keep a snapshot.
      </p>
    </main>
  );
}
