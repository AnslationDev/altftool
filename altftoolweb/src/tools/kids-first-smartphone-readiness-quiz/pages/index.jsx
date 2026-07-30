"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Smartphone } from "lucide-react";

import {
  ANSWER_OPTIONS,
  DIMENSIONS,
  QUESTIONS,
  scoreQuiz,
  uniformAnswers,
} from "../lib";

const DEFAULT_AGE = "11";
const DEFAULT_ANSWERS = uniformAnswers(1);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
};
const TONE_BAR = {
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
};
const DASH = "—";

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULT_AGE);
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreQuiz({ age, answers }), [age, answers]);

  const summary = useMemo(() => {
    if (result.error) return "";
    const lines = [
      "First smartphone readiness",
      `Age ${age} · score ${result.score} of ${result.maxScore} (${result.percent}%)`,
      `Verdict: ${result.band}`,
      result.summary,
      `Suggested device: ${result.device}`,
      "",
      "By area:",
      ...result.dimensions.map((dimension) => `- ${dimension.label}: ${dimension.percent}%`),
    ];
    if (result.flags.length > 0) {
      lines.push("", "Hold-back points:");
      result.flags.forEach((flag) => lines.push(`- ${flag}`));
    }
    lines.push("", "Starting rules:");
    result.rules.forEach((rule) => lines.push(`- ${rule}`));
    return lines.join("\n");
  }, [result, age]);

  const setAnswer = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

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
    setAge(DEFAULT_AGE);
    setAnswers(uniformAnswers(1));
    setCopied(false);
  };

  const toneText = result.error ? TONE_TEXT.danger : TONE_TEXT[result.tone] ?? TONE_TEXT.warning;
  const toneBar = result.error ? TONE_BAR.danger : TONE_BAR[result.tone] ?? TONE_BAR.warning;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Smartphone className="h-4 w-4" aria-hidden="true" />
          Kids device safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kids First Smartphone Readiness Quiz
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fourteen weighted questions about behaviour you can actually observe, scored into a
          readiness percentage, a suggested device tier and a set of starting rules.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="phone-age">
              Child&apos;s age (years)
            </label>
            <input
              id="phone-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="17"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <p className="text-xs leading-5 text-[var(--muted-foreground)]">
              Age decides which device tier and platform rules apply. The score itself is about
              behaviour, so a mature 10-year-old can outscore a 14-year-old.
            </p>
          </div>
        </div>
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
              Readiness score
            </p>
            <p className={`mt-1 text-4xl font-semibold ${toneText}`}>
              {result.error ? DASH : `${result.percent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? "Fix the inputs above to see the result."
                : `${result.band} · ${result.score} of ${result.maxScore} points`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the readiness result"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the quiz" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className={`block h-full ${toneBar}`}
            style={{ width: result.error ? "0%" : `${result.percent}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Verdict", result.error ? DASH : result.band],
            ["Suggested device", result.error ? DASH : result.device],
            ["Weakest area", result.error ? DASH : `${result.weakest.label} (${result.weakest.percent}%)`],
            ["Review together every", result.error ? DASH : `${result.reviewWeeks} weeks`],
            [
              "Social accounts",
              result.error ? DASH : result.socialAllowed ? "Old enough for teen accounts" : "Below the platform minimum of 13",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!result.error && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.summary}
          </p>
        )}

        {!result.error && result.flags.length > 0 && (
          <div className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <p className="font-semibold">Points holding the recommendation back</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {result.flags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {!result.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Score by area</h2>
          <ul className="mt-3 space-y-3">
            {result.dimensions.map((dimension) => (
              <li key={dimension.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold">{dimension.label}</span>
                  <span className="text-[var(--muted-foreground)]">
                    {dimension.score} / {dimension.max} · {dimension.percent}%
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <span
                    className="block h-full bg-[var(--primary)]"
                    style={{ width: `${dimension.percent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  {dimension.blurb}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {DIMENSIONS.map((dimension) => {
        const items = QUESTIONS.filter((question) => question.dimension === dimension.id);
        return (
          <section
            key={dimension.id}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-base font-semibold">{dimension.label}</h2>
            <ul className="mt-3 space-y-4">
              {items.map((question) => (
                <li key={question.id}>
                  <p className="text-sm font-semibold leading-6" id={`q-${question.id}`}>
                    {question.text}
                  </p>
                  <div
                    role="radiogroup"
                    aria-labelledby={`q-${question.id}`}
                    className="mt-2 grid gap-2 sm:grid-cols-2"
                  >
                    {ANSWER_OPTIONS.map((option) => {
                      const inputId = `q-${question.id}-${option.value}`;
                      return (
                        <label
                          key={option.value}
                          htmlFor={inputId}
                          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm"
                        >
                          <input
                            id={inputId}
                            type="radio"
                            name={`q-${question.id}`}
                            className="h-4 w-4 accent-[var(--primary)]"
                            checked={answers[question.id] === option.value}
                            onChange={() => setAnswer(question.id, option.value)}
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {!result.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Starting rules for this result</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. This is a structured way to think about a decision, not a clinical or
        developmental assessment — if you have concerns about a child&apos;s wellbeing, speak to a
        professional who knows them.
      </p>
    </main>
  );
}
