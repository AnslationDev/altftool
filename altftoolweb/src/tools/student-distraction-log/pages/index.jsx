"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListX, RotateCcw } from "lucide-react";

import {
  DEFAULT_MINUTES_LOST_PER_DISTRACTION,
  DISTRACTION_CATEGORIES,
  analyseDistractions,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_COUNTS = {
  phone: "6",
  social: "2",
  people: "2",
  noise: "1",
  daydreaming: "3",
  hunger: "0",
  other: "0",
};

const DEFAULTS = {
  studyMinutes: "120",
  minutesLost: String(DEFAULT_MINUTES_LOST_PER_DISTRACTION),
};

export default function ToolHome() {
  const [counts, setCounts] = useState(DEFAULT_COUNTS);
  const [studyMinutes, setStudyMinutes] = useState(DEFAULTS.studyMinutes);
  const [minutesLost, setMinutesLost] = useState(DEFAULTS.minutesLost);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseDistractions({
        entries: DISTRACTION_CATEGORIES.map((category) => ({
          category: category.id,
          count: (counts[category.id] ?? "0").trim() === "" ? 0 : Number(counts[category.id]),
        })),
        studyMinutes: studyMinutes.trim() === "" ? Number.NaN : studyMinutes,
        minutesLostPerDistraction: minutesLost.trim() === "" ? Number.NaN : minutesLost,
      }),
    [counts, studyMinutes, minutesLost],
  );
  const hasError = Boolean(result.error);

  const setCount = (id, value) => {
    setCounts((prev) => ({ ...prev, [id]: value }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Distraction log",
      `Session: ${NUM.format(result.studyMinutes)} min`,
      `Distractions: ${result.totalDistractions} (${NUM.format(result.perHour)}/hour) — ${result.bandLabel}`,
      `Estimated time lost: ${NUM.format(result.minutesLost)} min (${NUM.format(result.percentLost)}%)`,
      result.topTriggers.length > 0
        ? `Top triggers: ${result.topTriggers.map((t) => `${t.label} (${t.count})`).join(", ")}`
        : "Top triggers: none logged",
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
    setCounts(DEFAULT_COUNTS);
    setStudyMinutes(DEFAULTS.studyMinutes);
    setMinutesLost(DEFAULTS.minutesLost);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListX className="h-4 w-4" aria-hidden="true" />
          Study habits
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Distraction Log For Students
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tally every time your focus broke during a study session. The tool computes your
          interruption rate per hour, names your top three triggers, and estimates the study
          time they cost you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dl-minutes">
              Study session length (minutes)
            </label>
            <input
              id="dl-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              step="10"
              value={studyMinutes}
              onChange={(event) => setStudyMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dl-cost">
              Minutes lost per distraction
            </label>
            <input
              id="dl-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={minutesLost}
              onChange={(event) => setMinutesLost(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Default {DEFAULT_MINUTES_LOST_PER_DISTRACTION} min is conservative — raise it if
              your refocus time is longer.
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          How many times did each one happen?
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {DISTRACTION_CATEGORIES.map((category) => (
            <div key={category.id}>
              <label className={LABEL_CLASS} htmlFor={`dl-cat-${category.id}`}>
                {category.label}
              </label>
              <input
                id={`dl-cat-${category.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={counts[category.id] ?? "0"}
                onChange={(event) => setCount(category.id, event.target.value)}
              />
            </div>
          ))}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Interruptions per hour
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.perHour)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the analysis." : result.bandLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the distraction analysis"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total distractions", hasError ? DASH : String(result.totalDistractions)],
            [
              "Estimated time lost",
              hasError
                ? DASH
                : `${NUM.format(result.minutesLost)} min (${NUM.format(result.percentLost)}% of session)`,
            ],
            [
              "Effective study time",
              hasError ? DASH : `${NUM.format(result.effectiveMinutes)} min`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.topTriggers.length > 0 ? (
          <div className="mt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Top triggers — and one fix each
            </h2>
            <ol className="mt-3 space-y-3">
              {result.topTriggers.map((trigger, index) => (
                <li
                  key={trigger.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <p className="text-sm font-semibold">
                    {index + 1}. {trigger.label} — {trigger.count}×
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{trigger.fix}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Time lost is an estimate: distraction count times your chosen cost per event, capped
        at the session length. Interruption research suggests full refocusing after a big
        interruption can take considerably longer than the conservative default used here.
      </p>
    </main>
  );
}
