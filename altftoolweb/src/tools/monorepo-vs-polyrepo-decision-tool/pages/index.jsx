"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import { FACTORS, scoreDecision } from "../lib";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

// Unanswered by default: no factor is pre-selected, so scoreDecision()'s own
// "answer every question" error path is the real initial state instead of a
// pre-computed verdict nobody chose.
const DEFAULT_ANSWERS = {};

const VERDICT_LABELS = {
  monorepo: "Monorepo",
  polyrepo: "Polyrepo",
  borderline: "Too close to call",
};

export default function ToolHome() {
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreDecision(answers), [answers]);
  const hasError = Boolean(result.error);

  const setAnswer = (id, idx) => () =>
    setAnswers((prev) => ({ ...prev, [id]: idx }));

  const copyResult = async () => {
    if (hasError) return;
    const text = [
      `Repo strategy recommendation: ${VERDICT_LABELS[result.verdict]}`,
      `Monorepo fit: ${PCT.format(result.monoPct)}% (${result.monoPoints}/${result.monoMax} pts)`,
      `Polyrepo fit: ${PCT.format(result.polyPct)}% (${result.polyPoints}/${result.polyMax} pts)`,
      result.headline,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setAnswers(DEFAULT_ANSWERS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Monorepo tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Monorepo vs Polyrepo Decision Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Eight questions about code sharing, tooling investment, release
          coupling and access control — scored into a monorepo-vs-polyrepo
          recommendation you can defend.
        </p>
      </header>

      <section className="space-y-4">
        {FACTORS.map((factor, qIndex) => (
          <fieldset
            key={factor.id}
            className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <legend className="sr-only">{factor.question}</legend>
            <p className="text-sm font-semibold">
              {qIndex + 1}. {factor.question}
            </p>
            <div className="mt-3 grid gap-2">
              {factor.options.map((option, idx) => (
                <label
                  key={option.label}
                  htmlFor={`mvp-${factor.id}-${idx}`}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm transition ${
                    answers[factor.id] === idx
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`mvp-${factor.id}-${idx}`}
                    type="radio"
                    name={`mvp-${factor.id}`}
                    className="h-5 w-5 border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    checked={answers[factor.id] === idx}
                    onChange={setAnswer(factor.id, idx)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommendation
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : VERDICT_LABELS[result.verdict]}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Answer every question to see a result." : result.headline}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the repo strategy recommendation"
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
              aria-label="Reset all answers"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 space-y-4 text-sm">
          {[
            ["Monorepo fit", hasError ? null : result.monoPct, hasError ? DASH : `${result.monoPoints}/${result.monoMax} pts`],
            ["Polyrepo fit", hasError ? null : result.polyPct, hasError ? DASH : `${result.polyPoints}/${result.polyMax} pts`],
          ].map(([label, pct, detail]) => (
            <div key={label}>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="font-semibold">
                  {pct === null ? DASH : `${PCT.format(pct)}%`}
                  <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                    {detail}
                  </span>
                </dd>
              </div>
              <div
                className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${label} ${pct === null ? "unavailable" : `${PCT.format(pct)} percent`}`}
              >
                <div
                  className="h-full rounded-full bg-[var(--primary)]"
                  style={{ width: `${pct === null ? 0 : Math.max(2, pct)}%` }}
                />
              </div>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Your answer
                  </th>
                  <th scope="col" className="px-2 py-2 text-right font-semibold">
                    Mono pts
                  </th>
                  <th scope="col" className="px-2 py-2 text-right font-semibold">
                    Poly pts
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.choice}</td>
                    <td className="px-2 py-2 text-right font-semibold">{row.mono}</td>
                    <td className="px-2 py-2 text-right font-semibold">{row.poly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A scoring aid, not a mandate — repo strategy also depends on hiring
        plans, existing CI contracts and how painful your current setup actually
        is. Migrations are expensive in both directions, so a borderline score
        usually means: stay where you are and fix tooling instead.
      </p>
    </main>
  );
}
