"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Clock, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULT_OCCURRENCES,
  MAX_OCCURRENCES,
  MIN_OCCURRENCES,
  nextRuns,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_EXPRESSION = "30 9 * * 1-5";
/** Static so the first server render and the first client render agree. */
const FALLBACK_REFERENCE = "2026-01-01T00:00";

const PRESETS = [
  ["*/5 * * * *", "Every 5 minutes"],
  ["0 * * * *", "Hourly, on the hour"],
  ["30 9 * * 1-5", "09:30 on weekdays"],
  ["0 2 * * 0", "02:00 every Sunday"],
  ["0 0 1 * *", "Midnight on the 1st"],
  ["@daily", "@daily macro"],
];

function localNowMinute() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
    now.getHours(),
  )}:${pad(now.getMinutes())}`;
}

export default function ToolHome() {
  const [expression, setExpression] = useState(DEFAULT_EXPRESSION);
  const [reference, setReference] = useState(FALLBACK_REFERENCE);
  const [count, setCount] = useState(String(DEFAULT_OCCURRENCES));
  const [copied, setCopied] = useState(false);

  // Move to the visitor's real clock only after hydration.
  useEffect(() => {
    setReference(localNowMinute());
  }, []);

  const result = useMemo(
    () => nextRuns(expression, reference, Number(count)),
    [expression, reference, count],
  );

  const summary = result.error
    ? ""
    : [
        `Cron: ${result.expression}`,
        `Meaning: ${result.description}`,
        `From: ${reference}`,
        "",
        ...result.runs.map((run, index) => `${index + 1}. ${run.weekday} ${run.date} ${run.time}`),
      ].join("\n");

  const copyResult = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setExpression(DEFAULT_EXPRESSION);
    setReference(localNowMinute());
    setCount(String(DEFAULT_OCCURRENCES));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)] sm:text-2xl">
          <Clock className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          Crontab Evaluator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a five-field cron expression to read it back in plain English and see exactly when
          it will fire next.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="cron-expression">
            Cron expression
          </label>
          <input
            id="cron-expression"
            type="text"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
            className={`${INPUT_CLASS} mt-1.5 font-mono`}
          />
          <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
            Order: minute, hour, day-of-month, month, day-of-week.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cron-reference">
              Count from
            </label>
            <input
              id="cron-reference"
              type="datetime-local"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cron-count">
              Occurrences to show
            </label>
            <input
              id="cron-count"
              type="number"
              min={MIN_OCCURRENCES}
              max={MAX_OCCURRENCES}
              step={1}
              value={count}
              onChange={(event) => setCount(event.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </div>
        </div>

        <div>
          <p className={LABEL_CLASS}>Common schedules</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setExpression(value)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Next run</p>
            <p className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              {result.error ? DASH : `${result.nextRun.weekday} ${result.nextRun.time}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? DASH : `${result.nextRun.date} · in ${result.waitToNext}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the upcoming run times"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy runs"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the cron expression and reference time"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["In plain English", result.error ? DASH : result.description],
            ["Expression used", result.error ? DASH : result.expression],
            ["Shortest gap between runs", result.error ? DASH : result.shortestGap],
            [
              "Runs per day",
              result.error || result.runsPerDay === null ? DASH : String(result.runsPerDay),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
            <CalendarClock className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            Upcoming runs
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[24rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Day</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                  <th scope="col" className="py-2 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {result.runs.map((run, index) => (
                  <tr key={run.iso} className="border-b border-[var(--border)]">
                    <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{index + 1}</td>
                    <td className="py-2.5 pr-3 text-[var(--foreground)]">{run.weekday}</td>
                    <td className="py-2.5 pr-3 text-[var(--foreground)]">{run.date}</td>
                    <td className="py-2.5 font-mono font-semibold text-[var(--foreground)]">
                      {run.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.truncated && (
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Fewer runs than requested were found inside the 40-year search window.
            </p>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Times are wall-clock, exactly as cron schedules them, and daylight-saving shifts on the
        host are not applied. When both day-of-month and day-of-week are restricted, cron fires if
        either matches — that is the crontab(5) rule, and it surprises people regularly.
      </p>
    </main>
  );
}
