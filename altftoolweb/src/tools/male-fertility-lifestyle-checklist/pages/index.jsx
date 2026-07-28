"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import {
  ANSWER_OPTIONS,
  CATEGORY_ORDER,
  HABITS,
  WHO_2021_REFERENCE_LIMITS,
  scoreFertilityChecklist,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";
const zero = (value) => (Number.isFinite(value) ? NUM0.format(value) : DASH);
const one = (value) => (Number.isFinite(value) ? NUM1.format(value) : DASH);

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const ms = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(ms) ? DATE_FMT.format(new Date(ms)) : DASH;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

/** A realistic starting sheet so a live score is on screen at first paint. */
const DEFAULT_ANSWERS = {
  laptop: "partly",
  "hot-tubs": "yes",
  "occupational-heat": "partly",
  smoking: "yes",
  alcohol: "partly",
  cannabis: "yes",
  anabolics: "yes",
  bmi: "partly",
  sleep: "partly",
  exercise: "yes",
  cycling: "yes",
  antioxidants: "partly",
  micronutrients: "yes",
  "ejaculation-frequency": "yes",
  "fertile-window": "partly",
  "medication-review": "no",
  sti: "yes",
  varicocele: "yes",
  toxins: "yes",
};

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const [today, setToday] = useState(todayISO);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreFertilityChecklist({ answers, todayISO: today }), [answers, today]);
  const ok = !result.error;

  const setAnswer = (habitId, value) => {
    setAnswers((previous) => ({ ...previous, [habitId]: value }));
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Male Fertility Lifestyle Checklist",
      `Habit score: ${one(result.score)} of ${zero(result.maxScore)} (${zero(result.percent)}%) — ${result.bandLabel}`,
      ...result.byCategory.map((entry) => `${entry.name}: ${zero(entry.percent)}%`),
      `Re-check after a full sperm cycle: ${result.reviewDateISO} (${zero(result.reviewAfterDays)} days)`,
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
    setToday(todayISO());
    setCopied(false);
  };

  const percentWidth = ok ? Math.max(0, Math.min(100, result.percent)) : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Men&apos;s health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Male Fertility Lifestyle Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Nineteen habits with published links to semen quality — heat, substances, weight, sleep,
          nutrition and timing — weighted by the strength of the evidence, with a review date one
          full sperm cycle away.
        </p>
      </header>

      <p className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
        Informational only, not a diagnosis. If you have been trying to conceive for 12 months (or 6
        months if your partner is over 35), both partners should be assessed by a clinician.
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
              aria-label="Copy fertility checklist result"
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
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">{ok ? result.bandNote : DASH}</p>
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
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Re-check semen analysis after</dt>
            <dd className="text-right font-semibold">
              {ok ? `${prettyDate(result.reviewDateISO)} (${zero(result.reviewAfterDays)} days)` : DASH}
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <label
            className="block text-sm font-semibold text-[var(--foreground)]"
            htmlFor="mf-today"
          >
            Start date for the review countdown
          </label>
          <input
            id="mf-today"
            type="date"
            className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none sm:max-w-xs"
            value={today}
            onChange={(event) => setToday(event.target.value)}
          />
        </div>
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
          <h2 className="text-base font-semibold">Take these to a clinician</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {result.clinicalFlags.map((flag) => (
              <li key={flag.id} className="text-[var(--muted-foreground)]">
                <span className="font-semibold text-[var(--foreground)]">{flag.label}:</span> {flag.action}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {CATEGORY_ORDER.map((category) => (
        <section key={category} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{category}</h2>
          <div className="mt-3 grid gap-5">
            {HABITS.filter((habit) => habit.category === category).map((habit) => (
              <fieldset key={habit.id}>
                <legend className="text-sm font-semibold text-[var(--foreground)]">{habit.label}</legend>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{habit.detail}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {ANSWER_OPTIONS.map((option) => {
                    const inputId = `mfc-${habit.id}-${option.value}`;
                    return (
                      <label
                        key={option.value}
                        htmlFor={inputId}
                        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
                      >
                        <input
                          id={inputId}
                          type="radio"
                          name={`mfc-${habit.id}`}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">WHO 2021 lower reference limits</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          The 5th centile of men whose partners conceived within a year. A result below a limit is
          not a diagnosis of infertility — it is a prompt for a clinician to interpret.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Measure
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Lower limit
                </th>
              </tr>
            </thead>
            <tbody>
              {WHO_2021_REFERENCE_LIMITS.map((limit) => (
                <tr key={limit.name} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{limit.name}</td>
                  <td className="py-2 text-right font-semibold">{limit.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Habit changes take about one spermatogenic cycle — roughly 74 days, plus a fortnight of
        epididymal transit — before they can show in a semen analysis, so re-test around three
        months later rather than three weeks.
      </p>
    </main>
  );
}
