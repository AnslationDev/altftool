"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCheck, Copy, RotateCcw } from "lucide-react";

import { CHECKLIST_CATEGORIES, computePresentationScore } from "../lib";

const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

// Sensible default: a typical partially polished answer, so a real score shows at first paint.
const DEFAULT_CHECKED = [
  "intro-line",
  "logical-flow",
  "paragraph-per-point",
  "question-numbering",
  "handwriting",
  "margins",
];

export default function ToolHome() {
  const [checkedIds, setCheckedIds] = useState(DEFAULT_CHECKED);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computePresentationScore({ checkedIds }), [checkedIds]);
  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Exam answer presentation score: ${PCT.format(result.percent)}% (${result.band})`,
      `${result.checkedCount} of ${result.totalCount} habits in place`,
      ...result.categories.map(
        (category) => `${category.label}: ${category.earned}/${category.max} points`,
      ),
      ...(result.suggestions.length > 0
        ? ["Fix first:", ...result.suggestions.map((s) => `- ${s.label}`)]
        : []),
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
          Exam technique
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Exam Answer Presentation Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick the presentation habits your written answers already follow. The checker
          weights each habit by how often examiner reports flag it and scores your answer
          presentation out of 100.
        </p>
      </header>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Presentation score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${PCT.format(result.percent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input to see a score." : result.band}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the presentation score summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset the checklist to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Category scores</dt>
              <dd className="text-right font-semibold">{DASH}</dd>
            </div>
          ) : (
            result.categories.map((category) => (
              <div key={category.id} className="py-2.5">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[var(--muted-foreground)]">{category.label}</dt>
                  <dd className="text-right font-semibold">
                    {category.earned}/{category.max} pts
                  </dd>
                </div>
                <div
                  className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="presentation"
                >
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{ width: `${Math.min(100, category.percent)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </dl>

        {!hasError && result.suggestions.length > 0 ? (
          <div className="mt-4 rounded-lg bg-[var(--muted)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Biggest wins to fix first
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {result.suggestions.map((suggestion) => (
                <li key={suggestion.id} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>
                    {suggestion.label}
                    <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                      ({suggestion.category}, +{suggestion.weight} pts)
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <div className="mt-6 space-y-5">
        {CHECKLIST_CATEGORIES.map((category) => (
          <section
            key={category.id}
            className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-base font-semibold">{category.label}</h2>
            <div className="mt-3 space-y-1">
              {category.items.map((item) => {
                const inputId = `pc-${item.id}`;
                return (
                  <label
                    key={item.id}
                    htmlFor={inputId}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-[var(--muted)]"
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                      checked={checkedIds.includes(item.id)}
                      onChange={() => toggle(item.id)}
                    />
                    <span>
                      {item.label}
                      <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                        ({item.weight} pts)
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Presentation conventions differ between boards, universities and subjects — treat
        this score as a practice aid, and follow any explicit instructions on your question
        paper first.
      </p>
    </main>
  );
}
