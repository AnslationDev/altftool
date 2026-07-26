"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarPlus, Copy, Minus, Plus, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const MAX_YEARS = 5000;
const MAX_MONTHS = 60000;
const MAX_WEEKS = 260000;
const MAX_DAYS = 1800000;

const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const pad = (value) => String(value).padStart(2, "0");
const toISO = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function parseISO(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const probe = new Date(y, m - 1, d);
  if (probe.getFullYear() !== y || probe.getMonth() !== m - 1 || probe.getDate() !== d) return null;
  return probe;
}

const daysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate();

const formatLong = (date) =>
  date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function addYearsMonths(date, years, months) {
  const totalMonths = date.getFullYear() * 12 + date.getMonth() + years * 12 + months;
  const year = Math.floor(totalMonths / 12);
  const monthIndex = ((totalMonths % 12) + 12) % 12;
  const day = Math.min(date.getDate(), daysInMonth(year, monthIndex));
  return new Date(year, monthIndex, day);
}

function addCalendarDays(date, days) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function shiftBusinessDays(date, steps) {
  let cursor = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const direction = steps >= 0 ? 1 : -1;
  let remaining = Math.abs(steps);
  let guard = 0;
  while (remaining > 0 && guard < 500000) {
    cursor = addCalendarDays(cursor, direction);
    guard += 1;
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) remaining -= 1;
  }
  return cursor;
}

function isoWeek(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDayNumber = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNumber + 3);
  return {
    week: 1 + Math.round((target - firstThursday) / (7 * 86400000)),
    year: target.getUTCFullYear(),
  };
}

const dayOfYear = (date) =>
  Math.round(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 1)) /
      86400000
  ) + 1;

const QUICK = [
  { label: "+7 days", op: "add", field: "days", value: 7 },
  { label: "+30 days", op: "add", field: "days", value: 30 },
  { label: "+90 days", op: "add", field: "days", value: 90 },
  { label: "+6 months", op: "add", field: "months", value: 6 },
  { label: "+1 year", op: "add", field: "years", value: 1 },
  { label: "-1 year", op: "subtract", field: "years", value: 1 },
];

export default function ToolHome() {
  const [baseDate, setBaseDate] = useState("");
  const [operation, setOperation] = useState("add");
  const [years, setYears] = useState("0");
  const [months, setMonths] = useState("0");
  const [weeks, setWeeks] = useState("0");
  const [days, setDays] = useState("30");
  const [businessOnly, setBusinessOnly] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBaseDate(toISO(new Date()));
  }, []);

  const parsedBase = useMemo(() => parseISO(baseDate), [baseDate]);

  const amounts = useMemo(() => {
    const read = (value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    return {
      years: read(years),
      months: read(months),
      weeks: read(weeks),
      days: read(days),
    };
  }, [days, months, weeks, years]);

  const errors = useMemo(() => {
    const list = [];
    if (baseDate && !parsedBase) list.push("The starting date is not a valid date.");
    if (Object.values(amounts).some((value) => value < 0)) {
      list.push("Use the Add / Subtract switch instead of entering negative amounts.");
    }
    if (Math.abs(amounts.years) > MAX_YEARS) list.push(`Years must be within ${num.format(MAX_YEARS)}.`);
    if (Math.abs(amounts.months) > MAX_MONTHS)
      list.push(`Months must be within ${num.format(MAX_MONTHS)}.`);
    if (Math.abs(amounts.weeks) > MAX_WEEKS) list.push(`Weeks must be within ${num.format(MAX_WEEKS)}.`);
    if (Math.abs(amounts.days) > MAX_DAYS) list.push(`Days must be within ${num.format(MAX_DAYS)}.`);
    if (businessOnly && Math.abs(amounts.days) > 20000) {
      list.push("Business-day mode is limited to 20,000 days for performance.");
    }
    return list;
  }, [amounts, baseDate, businessOnly, parsedBase]);

  const result = useMemo(() => {
    if (!parsedBase || errors.length > 0) return null;
    const sign = operation === "subtract" ? -1 : 1;

    let end;
    if (businessOnly) {
      end = shiftBusinessDays(parsedBase, sign * Math.abs(amounts.days));
    } else {
      end = addYearsMonths(parsedBase, sign * amounts.years, sign * amounts.months);
      end = addCalendarDays(end, sign * (amounts.weeks * 7 + amounts.days));
    }

    const totalDays = Math.round(
      (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
        Date.UTC(parsedBase.getFullYear(), parsedBase.getMonth(), parsedBase.getDate())) /
        86400000
    );
    const week = isoWeek(end);
    const isWeekend = end.getDay() === 0 || end.getDay() === 6;

    return {
      end,
      totalDays,
      week,
      isWeekend,
      dayOfYear: dayOfYear(end),
      leapYear:
        (end.getFullYear() % 4 === 0 && end.getFullYear() % 100 !== 0) ||
        end.getFullYear() % 400 === 0,
      clamped:
        !businessOnly &&
        (amounts.years !== 0 || amounts.months !== 0) &&
        addYearsMonths(parsedBase, sign * amounts.years, sign * amounts.months).getDate() !==
          parsedBase.getDate(),
    };
  }, [amounts, businessOnly, errors.length, operation, parsedBase]);

  const applyQuick = useCallback((quick) => {
    setOperation(quick.op);
    setBusinessOnly(false);
    setYears("0");
    setMonths("0");
    setWeeks("0");
    setDays("0");
    if (quick.field === "years") setYears(String(quick.value));
    if (quick.field === "months") setMonths(String(quick.value));
    if (quick.field === "weeks") setWeeks(String(quick.value));
    if (quick.field === "days") setDays(String(quick.value));
  }, []);

  const reset = useCallback(() => {
    setBaseDate(toISO(new Date()));
    setOperation("add");
    setYears("0");
    setMonths("0");
    setWeeks("0");
    setDays("30");
    setBusinessOnly(false);
  }, []);

  const report = useMemo(() => {
    if (!result || !parsedBase) return "";
    const label = operation === "subtract" ? "Subtracted" : "Added";
    const parts = businessOnly
      ? [`${Math.abs(amounts.days)} business day(s)`]
      : [
          amounts.years ? `${amounts.years} year(s)` : null,
          amounts.months ? `${amounts.months} month(s)` : null,
          amounts.weeks ? `${amounts.weeks} week(s)` : null,
          amounts.days ? `${amounts.days} day(s)` : null,
        ].filter(Boolean);
    return [
      "Date Add / Subtract",
      `Start date: ${formatLong(parsedBase)}`,
      `${label}: ${parts.length ? parts.join(", ") : "nothing"}`,
      "",
      `Result: ${formatLong(result.end)}`,
      `ISO date: ${toISO(result.end)}`,
      `Difference: ${num.format(Math.abs(result.totalDays))} calendar day(s)`,
      `ISO week: ${result.week.week} of ${result.week.year}`,
      `Day of year: ${result.dayOfYear}`,
    ].join("\n");
  }, [amounts, businessOnly, operation, parsedBase, result]);

  const copyReport = async () => {
    if (!report) return;
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const primaryButton =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
  const ghostButton =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
            Date maths
          </span>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Date Add Subtract Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Move any date forwards or backwards by years, months, weeks or days. Month arithmetic is
            end-of-month safe, and there is a business-day mode that skips Saturdays and Sundays.
          </p>
        </header>

        {errors.length > 0 && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}

        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="base-date" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                Starting date
              </label>
              <input
                id="base-date"
                type="date"
                value={baseDate}
                onChange={(event) => setBaseDate(event.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
            <div>
              <p className="block text-xs font-semibold text-[var(--muted-foreground)]">Operation</p>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {[
                  { id: "add", label: "Add", Icon: Plus },
                  { id: "subtract", label: "Subtract", Icon: Minus },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setOperation(id)}
                    aria-pressed={operation === id}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      operation === id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="years" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                Years
              </label>
              <input
                id="years"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={years}
                onChange={(event) => setYears(event.target.value)}
                disabled={businessOnly}
                className={`mt-1 ${inputClass} disabled:opacity-50`}
              />
            </div>
            <div>
              <label htmlFor="months" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                Months
              </label>
              <input
                id="months"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={months}
                onChange={(event) => setMonths(event.target.value)}
                disabled={businessOnly}
                className={`mt-1 ${inputClass} disabled:opacity-50`}
              />
            </div>
            <div>
              <label htmlFor="weeks" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                Weeks
              </label>
              <input
                id="weeks"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={weeks}
                onChange={(event) => setWeeks(event.target.value)}
                disabled={businessOnly}
                className={`mt-1 ${inputClass} disabled:opacity-50`}
              />
            </div>
            <div>
              <label htmlFor="days" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                {businessOnly ? "Business days" : "Days"}
              </label>
              <input
                id="days"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={days}
                onChange={(event) => setDays(event.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              id="business-only"
              type="checkbox"
              checked={businessOnly}
              onChange={(event) => setBusinessOnly(event.target.checked)}
              className="h-4 w-4 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            />
            <span>Count business days only (skip Saturdays and Sundays)</span>
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK.map((quick) => (
              <button
                key={quick.label}
                type="button"
                onClick={() => applyQuick(quick)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {quick.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          {result ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Resulting date
              </p>
              <p className="mt-1 text-3xl font-semibold leading-tight text-[var(--primary)] sm:text-4xl">
                {formatLong(result.end)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {toISO(result.end)} ·{" "}
                {result.totalDays >= 0
                  ? `${num.format(result.totalDays)} day(s) after the start date`
                  : `${num.format(Math.abs(result.totalDays))} day(s) before the start date`}
              </p>

              <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                {[
                  ["ISO week", `Week ${result.week.week} of ${result.week.year}`],
                  ["Day of year", `${result.dayOfYear}`],
                  ["Falls on", result.isWeekend ? "A weekend" : "A weekday"],
                  ["Leap year", result.leapYear ? "Yes" : "No"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>

              {result.clamped && (
                <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                  The starting day number does not exist in the target month, so the date was pulled
                  back to the last day of that month — the standard way month arithmetic works.
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyReport}
                  aria-label="Copy resulting date"
                  className={primaryButton}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset calculator" className={ghostButton}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              Pick a valid starting date and amount to see the resulting date.
            </p>
          )}
        </section>

        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Order of operations: years and months are applied first (clamping to the last valid day of
          the target month), then weeks and days are added as plain calendar days. In business-day
          mode only the days field is used and weekends are stepped over.
        </p>
      </div>
    </main>
  );
}
