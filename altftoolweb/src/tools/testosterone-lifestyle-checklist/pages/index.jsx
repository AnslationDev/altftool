"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import { ANSWER_OPTIONS, HABITS, scoreChecklist } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";
const zero = (value) => (Number.isFinite(value) ? NUM0.format(value) : DASH);
const one = (value) => (Number.isFinite(value) ? NUM1.format(value) : DASH);

/** A realistic starting sheet so the page shows a live score at first paint. */
const DEFAULT_ANSWERS = {
  "sleep-duration": "partly",
  "sleep-regularity": "partly",
  "sleep-apnoea": "yes",
  waist: "partly",
  "weight-stability": "yes",
  "resistance-training": "partly",
  cardio: "yes",
  recovery: "yes",
  "dietary-fat": "yes",
  protein: "partly",
  "vitamin-d": "partly",
  micronutrients: "yes",
  alcohol: "partly",
  smoking: "yes",
  "no-anabolics": "yes",
  "medication-review": "yes",
  stress: "no",
};

const CATEGORIES = ["Sleep", "Body composition", "Training", "Nutrition", "Substances", "Stress"];

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreChecklist(answers), [answers]);
  const ok = !result.error;

  const setAnswer = (habitId, value) => {
    setAnswers((previous) => ({ ...previous, [habitId]: value }));
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Testosterone Lifestyle Checklist",
      `Habit score: ${one(result.score)} of ${zero(result.maxScore)} (${zero(result.percent)}%) — ${result.bandLabel}`,
      ...result.byCategory.map((entry) => `${entry.name}: ${zero(entry.percent)}%`),
      result.topGaps.length > 0 ? "Biggest gaps:" : "No gaps recorded.",
      ...result.topGaps.map((gap) => `- ${gap.label} → ${gap.action}`),
    ].join("\n");
  }, [ok, result]);

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

  const percentWidth = ok ? Math.max(0, Math.min(100, result.percent)) : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Men&apos;s health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Testosterone Lifestyle Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Seventeen habits with published links to androgen status, weighted by how solid the
          evidence is. This scores habits, not hormones — only a blood test tells you your level.
        </p>
      </header>

      <p className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
        Informational only. This is not a diagnosis and not a substitute for a clinician. Persistent
        low energy, low libido or erectile difficulty deserves a proper medical assessment.
      </p>

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
              Habit score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${zero(result.percent)}%` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${one(result.score)} of ${zero(result.maxScore)} weighted points — ${result.bandLabel}`
                : "Answer the checklist below."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy checklist result"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={ok ? `Habit score ${zero(result.percent)} percent` : "No score"}
          >
            <span className="block h-full bg-[var(--primary)]" style={{ width: `${percentWidth}%` }} />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {ok ? result.bandNote : DASH}
          </p>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(ok ? result.byCategory : []).map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{entry.name}</dt>
              <dd className="text-right font-semibold">
                {one(entry.score)} / {zero(entry.max)} · {zero(entry.percent)}%
              </dd>
            </div>
          ))}
          {ok ? null : (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Category scores</dt>
              <dd className="text-right font-semibold">{DASH}</dd>
            </div>
          )}
        </dl>
      </section>

      {ok && result.topGaps.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the biggest gains are</h2>
          <ul className="mt-3 grid gap-3">
            {result.topGaps.map((gap) => (
              <li key={gap.id} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-sm font-semibold">{gap.label}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{gap.action}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {ok && result.clinicalFlags.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Worth raising with a clinician</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {result.clinicalFlags.map((flag) => (
              <li key={flag.id} className="text-[var(--muted-foreground)]">
                <span className="font-semibold text-[var(--foreground)]">{flag.label}:</span>{" "}
                {flag.action}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {CATEGORIES.map((category) => (
        <section key={category} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{category}</h2>
          <div className="mt-3 grid gap-5">
            {HABITS.filter((habit) => habit.category === category).map((habit) => (
              <fieldset key={habit.id}>
                <legend className="text-sm font-semibold text-[var(--foreground)]">
                  {habit.label}
                </legend>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{habit.detail}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {ANSWER_OPTIONS.map((option) => {
                    const inputId = `tlc-${habit.id}-${option.value}`;
                    return (
                      <label
                        key={option.value}
                        htmlFor={inputId}
                        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
                      >
                        <input
                          id={inputId}
                          type="radio"
                          name={`tlc-${habit.id}`}
                          className="h-4 w-4 accent-[var(--primary)]"
                          value={option.value}
                          checked={answers[habit.id] === option.value}
                          onChange={() => setAnswer(habit.id, option.value)}
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </section>
      ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Nothing here measures testosterone. If you want a number, ask for a morning total
        testosterone test, repeated on a second morning before any treatment decision. Do not start
        or stop medication on the basis of a web checklist.
      </p>
    </main>
  );
}
