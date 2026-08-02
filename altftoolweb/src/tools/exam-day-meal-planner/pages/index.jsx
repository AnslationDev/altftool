"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { planExamDayMeals } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  reportingTime: "09:00",
  travelMinutes: "40",
};

export default function ToolHome() {
  const [reportingTime, setReportingTime] = useState(DEFAULTS.reportingTime);
  const [travelMinutes, setTravelMinutes] = useState(DEFAULTS.travelMinutes);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const result = useMemo(
    () =>
      planExamDayMeals({
        reportingTime,
        travelMinutes: travelMinutes.trim() === "" ? 0 : Number(travelMinutes),
      }),
    [reportingTime, travelMinutes],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Exam day meal timeline (reporting ${reportingTime})`,
      ...result.events.map(
        (event) =>
          `${event.previousDay ? "previous day " : ""}${event.time} — ${event.label}`,
      ),
    ].join("\n");
  }, [hasError, result, reportingTime]);

  const copyResult = () => {
    if (!summary) return;
    copy("result", summary, { label: "exam day meal timeline" });
  };

  const reset = () => {
    setReportingTime(DEFAULTS.reportingTime);
    setTravelMinutes(DEFAULTS.travelMinutes);
    resetCopyState();
  };

  const firstEvent = hasError ? null : result.events[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Exam wellness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Exam Day Meal Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the reporting time from your admit card and your travel time. The planner works
          backward to when you should wake, finish your main meal (3 hours out), snack, take the
          last big drink of water and leave home.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="edm-report">
              Reporting time (from admit card)
            </label>
            <input
              id="edm-report"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={reportingTime}
              onChange={(event) => setReportingTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="edm-travel">
              Door-to-gate travel time (minutes)
            </label>
            <input
              id="edm-travel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="5"
              value={travelMinutes}
              onChange={(event) => setTravelMinutes(event.target.value)}
            />
          </div>
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
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your day starts at
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {firstEvent ? `${firstEvent.time}${firstEvent.previousDay ? " (prev. day)" : ""}` : DASH}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to build the timeline."
                : result.earlyStart
                  ? "Early shift: the full-meal slot falls before wake-up, so dinner the night before does the heavy lifting and breakfast stays light."
                  : "Timeline built backward from your reporting time."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={isCopied("result") ? "Copied the exam day meal timeline to clipboard" : "Copy the exam day meal timeline"}
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy timeline"}
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
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        {!hasError ? (
          <ol
            className="mt-5 space-y-0 divide-y divide-[var(--border)]"
            aria-live="polite"
            aria-atomic="true"
          >
            {result.events.map((event) => (
              <li key={`${event.time}-${event.label}`} className="flex items-start gap-4 py-3">
                <span className="w-24 shrink-0 font-mono text-sm font-semibold text-[var(--primary)]">
                  {event.time}
                  {event.previousDay ? (
                    <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                      prev. day
                    </span>
                  ) : null}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{event.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {event.detail}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold text-[var(--success)]">Steady-energy picks</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--foreground)]">
              {result.eat.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--success)]">
                    +
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold text-[var(--danger)]">Skip on exam day</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--foreground)]">
              {result.avoid.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--danger)]">
                    –
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General informational guidance built on typical gastric-emptying times — not medical or
        dietetic advice. If you have diabetes, a gastrointestinal condition or any prescribed diet,
        follow your doctor's or dietitian's plan instead.
      </p>
    </main>
  );
}
