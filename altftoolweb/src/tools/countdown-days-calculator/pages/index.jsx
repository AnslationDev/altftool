"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, RotateCcw, Timer } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const MAX_BUSINESS_SCAN_DAYS = 40000;

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
  const probe = new Date(y, m - 1, d);
  if (probe.getFullYear() !== y || probe.getMonth() !== m - 1 || probe.getDate() !== d) return null;
  return probe;
}

function parseTime(value) {
  const match = /^(\d{2}):(\d{2})$/.exec((value || "").trim());
  if (!match) return null;
  const h = Number(match[1]);
  const mi = Number(match[2]);
  if (h > 23 || mi > 59) return null;
  return { h, mi };
}

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

// Adds whole months, clamping to the last valid day of the target month
// (31 Jan + 1 month = 28/29 Feb).
function addMonthsClamped(date, months) {
  const total = date.getFullYear() * 12 + date.getMonth() + months;
  const year = Math.floor(total / 12);
  const monthIndex = ((total % 12) + 12) % 12;
  return new Date(year, monthIndex, Math.min(date.getDate(), daysInMonth(year, monthIndex + 1)));
}

// Counts the largest number of whole calendar months that fit, then the
// leftover days. Never returns a negative day count.
function calendarDiff(earlier, later) {
  let months =
    (later.getFullYear() - earlier.getFullYear()) * 12 + (later.getMonth() - earlier.getMonth());
  if (months < 0) months = 0;
  if (dayDiff(addMonthsClamped(earlier, months), later) < 0) months -= 1;
  if (months < 0) months = 0;
  const anchor = addMonthsClamped(earlier, months);
  return {
    years: Math.floor(months / 12),
    months: months % 12,
    days: Math.max(dayDiff(anchor, later), 0),
  };
}

const dayDiff = (from, to) =>
  Math.round(
    (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
      Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
      86400000
  );

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date, amount) => {
  const next = startOfDay(date);
  next.setDate(next.getDate() + amount);
  return next;
};

function countBusinessDays(from, to) {
  const total = dayDiff(from, to);
  if (total <= 0 || total > MAX_BUSINESS_SCAN_DAYS) return total <= 0 ? 0 : null;
  let count = 0;
  for (let i = 1; i <= total; i += 1) {
    const dow = addDays(from, i).getDay();
    if (dow !== 0 && dow !== 6) count += 1;
  }
  return count;
}

const formatLong = (date) =>
  date.toLocaleDateString(undefined, {
    weekday: "long",
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

const PRESETS = [
  { label: "New Year", month: 1, day: 1 },
  { label: "Republic Day", month: 1, day: 26 },
  { label: "Independence Day", month: 8, day: 15 },
  { label: "Christmas", month: 12, day: 25 },
];

export default function ToolHome() {
  const [eventName, setEventName] = useState("My event");
  const [target, setTarget] = useState("");
  const [time, setTime] = useState("00:00");
  const [now, setNow] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const current = new Date();
    setNow(current);
    setTarget(toISO(addDays(current, 30)));
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const targetDate = useMemo(() => parseISO(target), [target]);
  const parsedTime = useMemo(() => parseTime(time), [time]);

  const errors = useMemo(() => {
    const list = [];
    if (target && !targetDate) list.push("The target date is not a valid date.");
    if (time && !parsedTime) list.push("Enter the time as HH:MM in 24-hour format.");
    return list;
  }, [parsedTime, target, targetDate, time]);

  const result = useMemo(() => {
    if (!targetDate || !now) return null;

    const today = startOfDay(now);
    const days = dayDiff(today, targetDate);
    const past = days < 0;
    const earlier = past ? targetDate : today;
    const later = past ? today : targetDate;
    const breakdown = calendarDiff(earlier, later);
    const absDays = Math.abs(days);

    const targetMoment = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      parsedTime ? parsedTime.h : 0,
      parsedTime ? parsedTime.mi : 0,
      0,
      0
    );
    const msLeft = targetMoment.getTime() - now.getTime();
    const absMs = Math.abs(msLeft);
    const live = {
      past: msLeft < 0,
      days: Math.floor(absMs / 86400000),
      hours: Math.floor((absMs % 86400000) / 3600000),
      minutes: Math.floor((absMs % 3600000) / 60000),
      seconds: Math.floor((absMs % 60000) / 1000),
    };

    const business = past ? null : countBusinessDays(today, targetDate);

    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearEnd = new Date(today.getFullYear(), 11, 31);
    const yearLength = dayDiff(yearStart, yearEnd) + 1;
    const yearElapsed = ((dayDiff(yearStart, today) + 1) / yearLength) * 100;

    return {
      days,
      absDays,
      past,
      isToday: days === 0,
      breakdown,
      weeks: Math.floor(absDays / 7),
      remainderDays: absDays % 7,
      business,
      live,
      targetMoment,
      yearElapsed,
    };
  }, [now, parsedTime, targetDate]);

  const applyPreset = useCallback((preset) => {
    const current = new Date();
    let year = current.getFullYear();
    const candidate = new Date(year, preset.month - 1, preset.day);
    if (dayDiff(startOfDay(current), candidate) < 0) year += 1;
    setTarget(toISO(new Date(year, preset.month - 1, preset.day)));
    setEventName(preset.label);
  }, []);

  const reset = useCallback(() => {
    const current = new Date();
    setEventName("My event");
    setTarget(toISO(addDays(current, 30)));
    setTime("00:00");
  }, []);

  const report = useMemo(() => {
    if (!result || !targetDate) return "";
    const label = eventName?.trim() || "Target";
    const lines = [
      `Countdown: ${label}`,
      `Target date: ${formatLong(targetDate)}${parsedTime ? ` at ${time}` : ""}`,
      "",
      result.isToday
        ? "That is today."
        : result.past
          ? `${num.format(result.absDays)} day(s) ago`
          : `${num.format(result.days)} day(s) remaining`,
      `Breakdown: ${phrase(result.breakdown)}`,
      `Weeks: ${num.format(result.weeks)} week(s) and ${result.remainderDays} day(s)`,
    ];
    if (result.business !== null && result.business !== undefined) {
      lines.push(`Working days remaining: ${num.format(result.business)}`);
    }
    lines.push(
      `Exact time ${result.live.past ? "since" : "left"}: ${result.live.days}d ${result.live.hours}h ${result.live.minutes}m ${result.live.seconds}s`
    );
    return lines.join("\n");
  }, [eventName, parsedTime, result, targetDate, time]);

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
            <Timer className="h-3.5 w-3.5" aria-hidden="true" />
            Countdown
          </span>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Countdown Days Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Pick a target date and see exactly how many days are left, plus the same wait expressed
            in weeks, calendar months and working days — with a live hours-minutes-seconds ticker.
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
            <div className="sm:col-span-2">
              <label htmlFor="event" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                Event name
              </label>
              <input
                id="event"
                type="text"
                value={eventName}
                onChange={(event) => setEventName(event.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="target" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                Target date
              </label>
              <input
                id="target"
                type="date"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                Target time (optional)
              </label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                Next {preset.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          {result ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {result.isToday
                  ? "Today is the day"
                  : result.past
                    ? "Days since"
                    : "Days remaining"}
                {eventName?.trim() ? ` · ${eventName.trim()}` : ""}
              </p>
              <p className="mt-1 text-5xl font-semibold text-[var(--primary)] sm:text-6xl">
                {result.isToday ? "0" : num.format(result.absDays)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {formatLong(targetDate)}
                {parsedTime ? ` at ${time}` : ""}
              </p>

              <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                {[
                  ["Days", result.live.days],
                  ["Hours", result.live.hours],
                  ["Minutes", result.live.minutes],
                  ["Seconds", result.live.seconds],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-1 py-3"
                  >
                    <p className="text-xl font-semibold tabular-nums sm:text-2xl">
                      {num.format(value)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">{label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]" aria-live="off">
                {result.live.past
                  ? "Time elapsed since the target moment."
                  : "Time left until the target moment, ticking every second."}
              </p>

              <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                {[
                  ["Calendar breakdown", phrase(result.breakdown)],
                  ["Weeks", `${num.format(result.weeks)} wk ${result.remainderDays} d`],
                  [
                    "Working days left",
                    result.past
                      ? "—"
                      : result.business === null
                        ? "Range too long"
                        : num.format(result.business),
                  ],
                  ["Year progress", `${num1.format(result.yearElapsed)}% of this year done`],
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

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyReport}
                  aria-label="Copy countdown result"
                  className={primaryButton}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset countdown" className={ghostButton}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              Pick a valid target date to start the countdown.
            </p>
          )}
        </section>

        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Days remaining counts whole calendar days from today to the target date, so a target of
          tomorrow shows 1. The live ticker measures the exact gap to the chosen time in your
          device&rsquo;s local time zone, and working days exclude Saturdays and Sundays only.
        </p>
      </div>
    </main>
  );
}
