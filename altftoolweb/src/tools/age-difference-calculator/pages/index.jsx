"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Copy, RotateCcw, Users } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const DEFAULT_A = "1990-05-14";
const DEFAULT_B = "1994-11-02";

const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const num1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const pad = (value) => String(value).padStart(2, "0");
const toISO = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function parseISO(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const probe = new Date(y, m - 1, d);
  if (probe.getFullYear() !== y || probe.getMonth() !== m - 1 || probe.getDate() !== d) return null;
  return { y, m, d, date: probe };
}

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

const totalDaysBetween = (a, b) =>
  Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000);

// Adds whole months, clamping to the last valid day of the target month
// (31 Jan + 1 month = 28/29 Feb).
function addMonthsClamped(parts, months) {
  const total = parts.y * 12 + (parts.m - 1) + months;
  const y = Math.floor(total / 12);
  const monthIndex = ((total % 12) + 12) % 12;
  return { y, m: monthIndex + 1, d: Math.min(parts.d, daysInMonth(y, monthIndex + 1)) };
}

// Counts the largest number of whole calendar months that fit, then the
// leftover days. Never returns a negative day count.
function calendarDiff(earlier, later) {
  let months = (later.y - earlier.y) * 12 + (later.m - earlier.m);
  if (months < 0) months = 0;
  if (totalDaysBetween(addMonthsClamped(earlier, months), later) < 0) months -= 1;
  if (months < 0) months = 0;
  const anchor = addMonthsClamped(earlier, months);
  return {
    years: Math.floor(months / 12),
    months: months % 12,
    days: Math.max(totalDaysBetween(anchor, later), 0),
  };
}

const formatLong = (parts) =>
  new Date(parts.y, parts.m - 1, parts.d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const phrase = ({ years, months, days }) => {
  const bits = [];
  if (years) bits.push(`${years} year${years === 1 ? "" : "s"}`);
  if (months) bits.push(`${months} month${months === 1 ? "" : "s"}`);
  if (days || bits.length === 0) bits.push(`${days} day${days === 1 ? "" : "s"}`);
  return bits.join(", ");
};

export default function ToolHome() {
  const [nameA, setNameA] = useState("Person A");
  const [nameB, setNameB] = useState("Person B");
  const [dateA, setDateA] = useState(DEFAULT_A);
  const [dateB, setDateB] = useState(DEFAULT_B);
  const [refDate, setRefDate] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setRefDate(toISO(new Date()));
  }, []);

  const parsedA = useMemo(() => parseISO(dateA), [dateA]);
  const parsedB = useMemo(() => parseISO(dateB), [dateB]);
  const parsedRef = useMemo(() => parseISO(refDate), [refDate]);

  const errors = useMemo(() => {
    const list = [];
    if (!dateA || !parsedA) list.push("Enter a valid first date of birth (YYYY-MM-DD).");
    if (!dateB || !parsedB) list.push("Enter a valid second date of birth (YYYY-MM-DD).");
    if (parsedA && parsedA.y < 1000) list.push("The first year looks too small — use a 4-digit year.");
    if (parsedB && parsedB.y < 1000) list.push("The second year looks too small — use a 4-digit year.");
    if (refDate && !parsedRef) list.push("The reference date is not a valid date.");
    return list;
  }, [dateA, dateB, parsedA, parsedB, parsedRef, refDate]);

  const result = useMemo(() => {
    if (!parsedA || !parsedB) return null;

    const aFirst = totalDaysBetween(parsedA, parsedB) >= 0;
    const earlier = aFirst ? parsedA : parsedB;
    const later = aFirst ? parsedB : parsedA;
    const olderName = (aFirst ? nameA : nameB) || "Person A";
    const youngerName = (aFirst ? nameB : nameA) || "Person B";

    const gap = calendarDiff(earlier, later);
    const totalDays = totalDaysBetween(earlier, later);
    const totalMonths = gap.years * 12 + gap.months;

    const ages =
      parsedRef && totalDaysBetween(earlier, parsedRef) >= 0
        ? {
            older:
              totalDaysBetween(earlier, parsedRef) >= 0 ? calendarDiff(earlier, parsedRef) : null,
            younger:
              totalDaysBetween(later, parsedRef) >= 0 ? calendarDiff(later, parsedRef) : null,
          }
        : null;

    return {
      gap,
      totalDays,
      totalMonths,
      totalWeeks: Math.floor(totalDays / 7),
      remainderDays: totalDays % 7,
      earlier,
      later,
      olderName,
      youngerName,
      sameDay: totalDays === 0,
      ages,
    };
  }, [nameA, nameB, parsedA, parsedB, parsedRef]);

  const swap = useCallback(() => {
    setDateA(dateB);
    setDateB(dateA);
    setNameA(nameB);
    setNameB(nameA);
  }, [dateA, dateB, nameA, nameB]);

  const reset = useCallback(() => {
    setNameA("Person A");
    setNameB("Person B");
    setDateA(DEFAULT_A);
    setDateB(DEFAULT_B);
    setRefDate(toISO(new Date()));
  }, []);

  const report = useMemo(() => {
    if (!result) return "";
    const lines = [
      "Age Difference",
      `${result.olderName}: ${formatLong(result.earlier)}`,
      `${result.youngerName}: ${formatLong(result.later)}`,
      "",
      result.sameDay
        ? "Both were born on the same day — there is no age gap."
        : `Age gap: ${phrase(result.gap)}`,
      `Total days: ${num.format(result.totalDays)}`,
      `Total weeks: ${num.format(result.totalWeeks)} weeks and ${result.remainderDays} day(s)`,
      `Total months: ${num.format(result.totalMonths)}`,
    ];
    if (result.ages?.older && result.ages?.younger && parsedRef) {
      lines.push(
        "",
        `As of ${formatLong(parsedRef)}:`,
        `${result.olderName} is ${phrase(result.ages.older)}`,
        `${result.youngerName} is ${phrase(result.ages.younger)}`
      );
    }
    return lines.join("\n");
  }, [parsedRef, result]);

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
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            Date maths
          </span>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Age Difference Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Enter two dates of birth to get the exact gap in years, months and days — calculated
            calendar-accurately, with leap years and unequal month lengths handled properly.
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
              <label htmlFor="name-a" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                First person
              </label>
              <input
                id="name-a"
                type="text"
                value={nameA}
                onChange={(event) => setNameA(event.target.value)}
                className={`mt-1 ${inputClass}`}
              />
              <label
                htmlFor="date-a"
                className="mt-3 block text-xs font-semibold text-[var(--muted-foreground)]"
              >
                Date of birth
              </label>
              <input
                id="date-a"
                type="date"
                value={dateA}
                onChange={(event) => setDateA(event.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="name-b" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                Second person
              </label>
              <input
                id="name-b"
                type="text"
                value={nameB}
                onChange={(event) => setNameB(event.target.value)}
                className={`mt-1 ${inputClass}`}
              />
              <label
                htmlFor="date-b"
                className="mt-3 block text-xs font-semibold text-[var(--muted-foreground)]"
              >
                Date of birth
              </label>
              <input
                id="date-b"
                type="date"
                value={dateB}
                onChange={(event) => setDateB(event.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ref-date" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                Show ages as of
              </label>
              <input
                id="ref-date"
                type="date"
                value={refDate}
                onChange={(event) => setRefDate(event.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={swap} className={`${ghostButton} w-full`}>
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                Swap the two people
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          {result ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Age difference
              </p>
              <p className="mt-1 text-4xl font-semibold leading-tight text-[var(--primary)]">
                {result.sameDay ? "No gap" : phrase(result.gap)}
              </p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {result.sameDay
                  ? `${result.olderName} and ${result.youngerName} share the same date of birth.`
                  : `${result.olderName} is older than ${result.youngerName} by this much.`}
              </p>

              <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                {[
                  ["Total days", num.format(result.totalDays)],
                  [
                    "Total weeks",
                    `${num.format(result.totalWeeks)} wk ${result.remainderDays} d`,
                  ],
                  ["Total months", num.format(result.totalMonths)],
                  ["Total years (decimal)", num1.format(result.totalDays / 365.2425)],
                  ["Older", `${result.olderName} · ${formatLong(result.earlier)}`],
                  ["Younger", `${result.youngerName} · ${formatLong(result.later)}`],
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

              {result.ages?.older && result.ages?.younger && parsedRef && (
                <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
                  <p className="font-semibold">Ages on {formatLong(parsedRef)}</p>
                  <p className="mt-1 text-[var(--muted-foreground)]">
                    {result.olderName}: {phrase(result.ages.older)}
                  </p>
                  <p className="text-[var(--muted-foreground)]">
                    {result.youngerName}: {phrase(result.ages.younger)}
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyReport}
                  aria-label="Copy age difference result"
                  className={primaryButton}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset dates" className={ghostButton}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              Enter both dates of birth to see the exact age gap.
            </p>
          )}
        </section>

        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          The gap is measured calendar-style: full years first, then whole months, then leftover
          days. Because months have 28-31 days, the day count in the breakdown depends on which
          months the two dates fall in — the total-days figure is always exact.
        </p>
      </div>
    </main>
  );
}
