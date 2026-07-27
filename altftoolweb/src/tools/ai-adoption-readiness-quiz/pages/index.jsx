"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import { DIMENSIONS, QUESTIONS, scoreReadiness } from "../lib";

const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** Default: every answer at maturity level 1 so a real score renders at first paint. */
const DEFAULT_ANSWERS = Object.fromEntries(QUESTIONS.map((q) => [q.id, 1]));

const DASH = "—";

export default function ToolHome() {
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreReadiness(answers), [answers]);
  const hasError = Boolean(result.error);

  const setAnswer = (qid, index) => {
    setAnswers((prev) => ({ ...prev, [qid]: index }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "AI adoption readiness score",
      `Overall: ${result.total}/${result.maxScore} (${PCT.format(result.pct)}%) — ${result.band.label}`,
      ...result.dimensionScores.map(
        (d) => `${d.label}: ${d.score}/${d.max} (${PCT.format(d.pct)}%)`,
      ),
      `Weakest area: ${result.weakest.label}`,
      `Next step: ${result.band.advice}`,
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
    setAnswers(DEFAULT_ANSWERS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          AI Business
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Adoption Readiness Quiz
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Twelve questions across data, skills, process and governance. Each answer is a maturity
          level worth 0–3 points; the banded score tells you whether to fix foundations, pilot, or
          scale.
        </p>
      </header>

      {DIMENSIONS.map((dim) => (
        <section
          key={dim.id}
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 first:mt-0"
        >
          <h2 className="text-base font-semibold">{dim.label}</h2>
          {QUESTIONS.filter((q) => q.dimension === dim.id).map((q) => (
            <fieldset key={q.id} className="mt-4">
              <legend className="text-sm font-semibold">{q.text}</legend>
              <div className="mt-2 grid gap-1">
                {q.options.map((opt, index) => (
                  <label
                    key={opt}
                    htmlFor={`${q.id}-${index}`}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-[var(--muted)]"
                  >
                    <input
                      id={`${q.id}-${index}`}
                      type="radio"
                      name={q.id}
                      className="h-5 w-5 border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                      checked={answers[q.id] === index}
                      onChange={() => setAnswer(q.id, index)}
                    />
                    <span>
                      {opt}{" "}
                      <span className="text-xs text-[var(--muted-foreground)]">({index} pts)</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </section>
      ))}

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
              Readiness score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${PCT.format(result.pct)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Answer every question to see your band." : `${result.band.label} — ${result.band.advice}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the readiness score breakdown"
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
              aria-label="Reset all answers to defaults"
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
              <dt className="text-[var(--muted-foreground)]">Breakdown</dt>
              <dd className="text-right font-semibold">{DASH}</dd>
            </div>
          ) : (
            <>
              {result.dimensionScores.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{d.label}</dt>
                  <dd className="text-right font-semibold">
                    {d.score}/{d.max} ({PCT.format(d.pct)}%)
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">Total</dt>
                <dd className="text-right font-semibold">
                  {result.total}/{result.maxScore}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">Weakest area — fix first</dt>
                <dd className="text-right font-semibold">{result.weakest.label}</dd>
              </div>
            </>
          )}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A self-assessment, not an audit. Bands: 80%+ ready to scale, 60–79% ready to pilot, 40–59%
        early stage, below 40% fix foundations first.
      </p>
    </main>
  );
}
