"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, RotateCcw } from "lucide-react";

import {
  CHANGES_TO_REPORT,
  CYCLE_MAX_DAYS,
  CYCLE_MIN_DAYS,
  DAYS_AFTER_PERIOD_ENDS,
  EXAM_STEPS,
  MODES,
  buildExamSchedule,
} from "../lib";

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const SHORT_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function localISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function pretty(iso, formatter = DATE_FMT) {
  if (!iso) return DASH;
  const ms = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(ms) ? formatter.format(new Date(ms)) : DASH;
}

function defaultToday() {
  return localISO(new Date());
}

function defaultPeriodStart() {
  const date = new Date();
  date.setDate(date.getDate() - 14);
  return localISO(date);
}

export default function ToolHome() {
  const [mode, setMode] = useState(MODES.CYCLE);
  const [today, setToday] = useState(defaultToday);
  const [lastPeriodStart, setLastPeriodStart] = useState(defaultPeriodStart);
  const [cycleLength, setCycleLength] = useState("28");
  const [periodLength, setPeriodLength] = useState("5");
  const [fixedDay, setFixedDay] = useState("1");
  const [copied, setCopied] = useState(false);

  const schedule = useMemo(
    () =>
      buildExamSchedule({
        mode,
        today,
        lastPeriodStart,
        cycleLength: Number(cycleLength),
        periodLength: Number(periodLength),
        fixedDay: Number(fixedDay),
        occurrences: 12,
      }),
    [mode, today, lastPeriodStart, cycleLength, periodLength, fixedDay],
  );

  const hasError = Boolean(schedule.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Breast self-check reminder",
      `Next check: ${pretty(schedule.nextDate)} (window to ${pretty(schedule.nextWindowEnd, SHORT_FMT)})`,
      schedule.isToday
        ? "That is today."
        : `${schedule.daysUntilNext} day${schedule.daysUntilNext === 1 ? "" : "s"} away.`,
    ];
    if (schedule.mode === MODES.CYCLE) {
      lines.push(`Cycle day today: ${schedule.cycleDay} of ${schedule.cycleLength}`);
      lines.push(`Last period ended: ${pretty(schedule.periodEnds, SHORT_FMT)}`);
      lines.push(`Next period due: ${pretty(schedule.nextPeriodStart, SHORT_FMT)}`);
    } else {
      lines.push(`Fixed day of the month: ${schedule.fixedDay}`);
    }
    lines.push("Upcoming checks:");
    schedule.dates.forEach((item) => lines.push(`  ${pretty(item.date, SHORT_FMT)}`));
    return lines.join("\n");
  }, [hasError, schedule]);

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
    setMode(MODES.CYCLE);
    setToday(defaultToday());
    setLastPeriodStart(defaultPeriodStart());
    setCycleLength("28");
    setPeriodLength("5");
    setFixedDay("1");
    setCopied(false);
  };

  const daysLabel = (() => {
    if (hasError) return DASH;
    if (schedule.isToday) return "Today";
    if (schedule.daysUntilNext === 1) return "Tomorrow";
    return `In ${schedule.daysUntilNext} days`;
  })();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          Breast awareness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Breast Self-Exam Reminder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Breast tissue is least tender and least lumpy in the days just after a period ends, so this
          picks a check date {DAYS_AFTER_PERIOD_ENDS} days after bleeding stops and repeats it every
          cycle. Not menstruating? Switch to a fixed calendar day.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold">How should the date be chosen?</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              [MODES.CYCLE, "From my cycle", "I have periods"],
              [MODES.FIXED, "Same day each month", "Menopause, pregnancy or continuous hormones"],
            ].map(([value, title, note]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  mode === value
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                }`}
              >
                <span className="block font-semibold text-[var(--foreground)]">{title}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">{note}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bse-today">
              Today&apos;s date
            </label>
            <input
              id="bse-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>

          {mode === MODES.CYCLE ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="bse-period-start">
                  First day of your last period
                </label>
                <input
                  id="bse-period-start"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="date"
                  value={lastPeriodStart}
                  onChange={(event) => setLastPeriodStart(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="bse-cycle">
                  Cycle length (days)
                </label>
                <input
                  id="bse-cycle"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="15"
                  max="60"
                  step="1"
                  value={cycleLength}
                  onChange={(event) => setCycleLength(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="bse-bleed">
                  Days of bleeding
                </label>
                <input
                  id="bse-bleed"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="12"
                  step="1"
                  value={periodLength}
                  onChange={(event) => setPeriodLength(event.target.value)}
                />
              </div>
            </>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="bse-fixed-day">
                Day of the month (1-28)
              </label>
              <input
                id="bse-fixed-day"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                max="28"
                step="1"
                value={fixedDay}
                onChange={(event) => setFixedDay(event.target.value)}
              />
            </div>
          )}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {schedule.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Next self-check
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : pretty(schedule.nextDate)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see your date."
                : `${daysLabel} · good window through ${pretty(schedule.nextWindowEnd, SHORT_FMT)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the self-check schedule"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy dates"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" role="status">
          {(hasError
            ? [
                ["Why this date", DASH],
                ["Cycle day today", DASH],
                ["Next period due", DASH],
              ]
            : schedule.mode === MODES.CYCLE
              ? [
                  ["Cycle day today", `Day ${schedule.cycleDay} of ${schedule.cycleLength}`],
                  ["Last period ended", pretty(schedule.periodEnds, SHORT_FMT)],
                  ["Next period due", pretty(schedule.nextPeriodStart, SHORT_FMT)],
                  [
                    "Cycle length",
                    schedule.cycleIsTypical
                      ? `${schedule.cycleLength} days (within the typical ${CYCLE_MIN_DAYS}-${CYCLE_MAX_DAYS} day range)`
                      : `${schedule.cycleLength} days (outside the typical ${CYCLE_MIN_DAYS}-${CYCLE_MAX_DAYS} day range)`,
                  ],
                ]
              : [
                  ["Chosen day", `Day ${schedule.fixedDay} of every month`],
                  ["Checks listed", `${schedule.dates.length} months ahead`],
                ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{schedule.reason}</p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Next 12 check dates</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Check date</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Window ends</th>
                  <th scope="col" className="py-2 text-right font-semibold">Days away</th>
                </tr>
              </thead>
              <tbody>
                {schedule.dates.map((item, index) => (
                  <tr key={item.date} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{index + 1}</td>
                    <td className="py-2 pr-3 font-semibold">{pretty(item.date, SHORT_FMT)}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {pretty(item.windowEnd, SHORT_FMT)}
                    </td>
                    <td className="py-2 text-right tabular-nums">{item.daysAway}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The five-step check</h2>
        <ol className="mt-3 space-y-3 text-sm">
          {EXAM_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-semibold text-[var(--primary)]">
                {index + 1}
              </span>
              <span>
                <span className="block font-semibold">{step.title}</span>
                <span className="block leading-6 text-[var(--muted-foreground)]">{step.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Show a doctor if you notice</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {CHANGES_TO_REPORT.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not a screening test. A monthly self-check builds familiarity so you
        notice change early; it does not replace clinical examination or mammography, and a normal
        self-check does not rule anything out. Any new or persistent change should be seen by a
        doctor.
      </p>
    </main>
  );
}
