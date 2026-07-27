"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import {
  FREQUENCY_OPTIONS,
  OFFSET_OPTIONS,
  WEEKDAYS,
  buildCronSchedule,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  frequency: "daily",
  everyN: "15",
  localHour: "9",
  localMinute: "30",
  offsetMinutes: "330",
  daysOfWeek: [1, 3, 5],
  dayOfMonth: "1",
};

const DASH = "—";

export default function ToolHome() {
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [everyN, setEveryN] = useState(DEFAULTS.everyN);
  const [localHour, setLocalHour] = useState(DEFAULTS.localHour);
  const [localMinute, setLocalMinute] = useState(DEFAULTS.localMinute);
  const [offsetMinutes, setOffsetMinutes] = useState(DEFAULTS.offsetMinutes);
  const [daysOfWeek, setDaysOfWeek] = useState(DEFAULTS.daysOfWeek);
  const [dayOfMonth, setDayOfMonth] = useState(DEFAULTS.dayOfMonth);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildCronSchedule({
        frequency,
        everyN: everyN.trim() === "" ? Number.NaN : Number(everyN),
        localHour: localHour.trim() === "" ? Number.NaN : Number(localHour),
        localMinute: localMinute.trim() === "" ? Number.NaN : Number(localMinute),
        offsetMinutes: Number(offsetMinutes),
        daysOfWeek,
        dayOfMonth: dayOfMonth.trim() === "" ? Number.NaN : Number(dayOfMonth),
      }),
    [frequency, everyN, localHour, localMinute, offsetMinutes, daysOfWeek, dayOfMonth],
  );
  const hasError = Boolean(result.error);

  const toggleDay = (day) => {
    setDaysOfWeek((previous) =>
      previous.includes(day) ? previous.filter((item) => item !== day) : [...previous, day],
    );
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(`${result.yaml}\n# ${result.description}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFrequency(DEFAULTS.frequency);
    setEveryN(DEFAULTS.everyN);
    setLocalHour(DEFAULTS.localHour);
    setLocalMinute(DEFAULTS.localMinute);
    setOffsetMinutes(DEFAULTS.offsetMinutes);
    setDaysOfWeek(DEFAULTS.daysOfWeek);
    setDayOfMonth(DEFAULTS.dayOfMonth);
    setCopied(false);
  };

  const needsTime = frequency !== "every-n-minutes";
  const needsOffset = frequency === "daily" || frequency === "weekly" || frequency === "monthly";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          CI / CD
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GitHub Actions Cron Schedule Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          GitHub&apos;s on.schedule cron runs in UTC only. Pick your local time and timezone offset
          and get the correct cron entry, with day-of-week shifts across midnight handled for you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-frequency">
              Frequency
            </label>
            <select
              id="cr-frequency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {frequency === "every-n-minutes" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="cr-every">
                Interval (minutes, minimum 5)
              </label>
              <input
                id="cr-every"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="5"
                max="720"
                step="1"
                value={everyN}
                onChange={(event) => setEveryN(event.target.value)}
              />
            </div>
          ) : null}
          {needsTime && frequency !== "hourly" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="cr-hour">
                Local hour (0-23)
              </label>
              <input
                id="cr-hour"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="23"
                step="1"
                value={localHour}
                onChange={(event) => setLocalHour(event.target.value)}
              />
            </div>
          ) : null}
          {needsTime ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="cr-minute">
                Minute (0-59)
              </label>
              <input
                id="cr-minute"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="59"
                step="1"
                value={localMinute}
                onChange={(event) => setLocalMinute(event.target.value)}
              />
            </div>
          ) : null}
          {needsOffset ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="cr-offset">
                Your timezone (fixed offset)
              </label>
              <select
                id="cr-offset"
                className={`mt-2 ${INPUT_CLASS}`}
                value={offsetMinutes}
                onChange={(event) => setOffsetMinutes(event.target.value)}
              >
                {OFFSET_OPTIONS.map((option) => (
                  <option key={option.id} value={String(option.id)}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {frequency === "monthly" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="cr-dom">
                Day of month (1-31)
              </label>
              <input
                id="cr-dom"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                max="31"
                step="1"
                value={dayOfMonth}
                onChange={(event) => setDayOfMonth(event.target.value)}
              />
            </div>
          ) : null}
        </div>

        {frequency === "weekly" ? (
          <fieldset className="mt-4">
            <legend className={LABEL_CLASS}>Local days of the week</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const active = daysOfWeek.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleDay(day.id)}
                    className={`min-h-11 min-w-14 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      active
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
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

      {!hasError && result.warnings.length > 0 ? (
        <ul className="mt-6 space-y-1 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
          {result.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cron expression (UTC)
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.cron}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the schedule YAML snippet"
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

        <div className="mt-5 overflow-x-auto">
          <pre className="min-w-[280px] rounded-md bg-[var(--muted)] p-4 font-mono text-xs leading-5 text-[var(--foreground)]">
            {hasError ? DASH : result.yaml}
          </pre>
        </div>

        {!hasError && result.preview.length > 0 ? (
          <>
            <h2 className="mt-5 text-base font-semibold">When your team sees it run</h2>
            <dl className="mt-2 divide-y divide-[var(--border)] text-sm">
              {result.preview.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{row.label}</dt>
                  <dd className="text-right font-semibold">{row.time}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        GitHub evaluates schedule crons in UTC with a 5-minute minimum interval; runs may be delayed
        under load, scheduled workflows use the default branch, and schedules on public repos are
        disabled after 60 days of repository inactivity. Cron cannot follow daylight-saving changes
        — revisit the entry when your clocks shift.
      </p>
    </main>
  );
}
