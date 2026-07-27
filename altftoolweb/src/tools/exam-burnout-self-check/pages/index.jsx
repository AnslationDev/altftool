"use client";

import { useMemo, useState } from "react";
import { BatteryLow, Check, Copy, RotateCcw } from "lucide-react";

import {
  BAND_LABELS,
  HIGH_OVERALL_NOTE,
  QUESTIONS,
  RATING_SCALE,
  scoreBurnout,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

// Neutral mid-scale default so a real result is on screen at first paint.
const DEFAULT_ANSWER = 2;
const DEFAULT_ANSWERS = QUESTIONS.map(() => DEFAULT_ANSWER);

export default function ToolHome() {
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreBurnout({ answers }), [answers]);
  const hasError = Boolean(result.error);

  const setAnswer = (index, value) => {
    setAnswers((previous) => previous.map((a, i) => (i === index ? value : a)));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Exam burnout self-check (informational)",
      `Overall: ${BAND_LABELS[result.overallBand]} (${NUM.format(result.overallScore)} / ${result.maxScore})`,
      ...result.dimensionScores.map(
        (d) => `${d.label}: ${BAND_LABELS[d.band]} (${NUM.format(d.score)} / ${result.maxScore})`,
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
    setAnswers(DEFAULT_ANSWERS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BatteryLow className="h-4 w-4" aria-hidden="true" />
          Study wellbeing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Exam Burnout Self Check</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rate how often each statement has applied to you over the last few weeks. The check covers
          the three dimensions of academic burnout — exhaustion, cynicism and reduced efficacy — and
          is informational only, not a diagnosis.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <ol className="space-y-6">
          {QUESTIONS.map((question, index) => (
            <li key={question.id}>
              <fieldset>
                <legend className="text-sm font-semibold leading-6">
                  {index + 1}. {question.text}
                </legend>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={`Answer for question ${index + 1}`}>
                  {RATING_SCALE.map((option) => {
                    const inputId = `${question.id}-${option.value}`;
                    const selected = answers[index] === option.value;
                    return (
                      <div key={option.value}>
                        <input
                          id={inputId}
                          type="radio"
                          name={question.id}
                          className="sr-only"
                          checked={selected}
                          onChange={() => setAnswer(index, option.value)}
                        />
                        <label
                          htmlFor={inputId}
                          className={`inline-flex min-h-11 cursor-pointer items-center rounded-md border px-3 text-sm font-medium transition active:scale-[0.98] motion-reduce:transform-none ${
                            selected
                              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          {option.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            </li>
          ))}
        </ol>
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
              Overall burnout signal
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : BAND_LABELS[result.overallBand]}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Answer every question to see a result."
                : `Mean item score ${NUM.format(result.overallScore)} out of ${result.maxScore} across all three dimensions.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the burnout self-check result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all answers" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Exhaustion", DASH],
                ["Cynicism / detachment", DASH],
                ["Reduced study efficacy", DASH],
              ]
            : result.dimensionScores.map((d) => [
                d.label,
                `${BAND_LABELS[d.band]} — ${NUM.format(d.score)} / ${result.maxScore}`,
              ])
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.suggestions.length > 0 ? (
          <div className="mt-5">
            <h2 className="text-base font-semibold">Recovery suggestions</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {result.suggestions.map((item) => (
                <li key={item.tip} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                  <span>
                    <span className="font-semibold">{item.dimension}:</span> {item.tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!hasError && result.showSupportNote ? (
          <p className="mt-5 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
            {HIGH_OVERALL_NOTE}
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This self-check is for reflection only. It follows the three-dimension model of academic
        burnout (exhaustion, cynicism, reduced efficacy) but is not the MBI-SS and is not a medical
        or psychological diagnosis. If distress persists, speak to a counsellor or doctor.
      </p>
    </main>
  );
}
