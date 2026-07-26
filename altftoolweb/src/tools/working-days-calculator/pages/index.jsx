"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const WEEKDAYS = [
  { index: 0, short: "Sun", long: "Sunday" },
  { index: 1, short: "Mon", long: "Monday" },
  { index: 2, short: "Tue", long: "Tuesday" },
  { index: 3, short: "Wed", long: "Wednesday" },
  { index: 4, short: "Thu", long: "Thursday" },
  { index: 5, short: "Fri", long: "Friday" },
  { index: 6, short: "Sat", long: "Saturday" },
];

const MAX_SPAN_DAYS = 40000;

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

const formatLong = (date) =>
  date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

const addDays = (date, days) => {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
};

// Fixed-date national holidays in India (same calendar date every year).
const INDIA_FIXED_HOLIDAYS = [
  { month: 1, day: 26, name: "Republic Day" },
  { month: 8, day: 15, name: "Independence Day" },
  { month: 10, day: 2, name: "Gandhi Jayanti" },
];

let nextId = 100;
const makeId = () => `h${(nextId += 1)}`;

export default function ToolHome() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [includeEnd, setIncludeEnd] = useState(true);
  const [weekend, setWeekend] = useState([0, 6]);
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const [holidays, setHolidays] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const today = new Date();
    setStart(toISO(today));
    setEnd(toISO(addDays(today, 30)));
  }, []);

  const startDate = useMemo(() => parseISO(start), [start]);
  const endDate = useMemo(() => parseISO(end), [end]);

  const errors = useMemo(() => {
    const list = [];
    if (start && !startDate) list.push("The start date is not a valid date.");
    if (end && !endDate) list.push("The end date is not a valid date.");
    if (startDate && endDate && endDate < startDate) {
      list.push("The end date must be on or after the start date.");
    }
    if (startDate && endDate) {
      const span = Math.round((endDate - startDate) / 86400000);
      if (span > MAX_SPAN_DAYS) {
        list.push("That range is longer than about 109 years — please pick a shorter period.");
      }
    }
    if (weekend.length === 7) list.push("At least one day of the week must be a working day.");
    const hours = Number.parseFloat(hoursPerDay);
    if (hoursPerDay !== "" && (!Number.isFinite(hours) || hours < 0 || hours > 24)) {
      list.push("Hours per working day must be between 0 and 24.");
    }
    return list;
  }, [end, endDate, hoursPerDay, start, startDate, weekend]);

  const holidaySet = useMemo(() => {
    const map = new Map();
    holidays.forEach((item) => {
      if (parseISO(item.date)) map.set(item.date, item.name || "Holiday");
    });
    return map;
  }, [holidays]);

  const result = useMemo(() => {
    if (!startDate || !endDate || endDate < startDate || weekend.length === 7) return null;
    const span = Math.round((endDate - startDate) / 86400000);
    if (span > MAX_SPAN_DAYS) return null;

    const lastDate = includeEnd ? endDate : addDays(endDate, -1);
    if (lastDate < startDate) {
      return {
        totalDays: 0,
        workingDays: 0,
        weekendDays: 0,
        holidayDays: 0,
        holidayHits: [],
        perWeekday: WEEKDAYS.map(() => 0),
        lastDate: null,
      };
    }

    const weekendSet = new Set(weekend);
    const perWeekday = WEEKDAYS.map(() => 0);
    const holidayHits = [];
    let totalDays = 0;
    let workingDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;

    for (let cursor = startDate; cursor <= lastDate; cursor = addDays(cursor, 1)) {
      totalDays += 1;
      const dow = cursor.getDay();
      const iso = toISO(cursor);
      if (weekendSet.has(dow)) {
        weekendDays += 1;
        continue;
      }
      if (holidaySet.has(iso)) {
        holidayDays += 1;
        holidayHits.push({ iso, name: holidaySet.get(iso), date: cursor });
        continue;
      }
      workingDays += 1;
      perWeekday[dow] += 1;
    }

    return {
      totalDays,
      workingDays,
      weekendDays,
      holidayDays,
      holidayHits,
      perWeekday,
      lastDate,
    };
  }, [endDate, holidaySet, includeEnd, startDate, weekend]);

  const toggleWeekend = useCallback((index) => {
    setWeekend((prev) =>
      prev.includes(index) ? prev.filter((day) => day !== index) : [...prev, index].sort()
    );
  }, []);

  const addHoliday = useCallback(() => {
    setHolidays((prev) => [
      ...prev,
      { id: makeId(), date: start || toISO(new Date()), name: "Holiday" },
    ]);
  }, [start]);

  const updateHoliday = useCallback((id, field, value) => {
    setHolidays((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }, []);

  const removeHoliday = useCallback((id) => {
    setHolidays((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addIndiaHolidays = useCallback(() => {
    if (!startDate || !endDate) return;
    const additions = [];
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year += 1) {
      INDIA_FIXED_HOLIDAYS.forEach((entry) => {
        const date = new Date(year, entry.month - 1, entry.day);
        if (date >= startDate && date <= endDate) {
          additions.push({ id: makeId(), date: toISO(date), name: entry.name });
        }
      });
    }
    setHolidays((prev) => {
      const seen = new Set(prev.map((item) => item.date));
      return [...prev, ...additions.filter((item) => !seen.has(item.date))].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    });
  }, [endDate, startDate]);

  const reset = useCallback(() => {
    const today = new Date();
    setStart(toISO(today));
    setEnd(toISO(addDays(today, 30)));
    setIncludeEnd(true);
    setWeekend([0, 6]);
    setHoursPerDay("8");
    setHolidays([]);
  }, []);

  const hoursValue = useMemo(() => {
    const parsed = Number.parseFloat(hoursPerDay);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 24 ? parsed : 0;
  }, [hoursPerDay]);

  const report = useMemo(() => {
    if (!result || !startDate || !endDate) return "";
    return [
      "Working Days Calculation",
      `From: ${formatLong(startDate)}`,
      `To: ${formatLong(endDate)}${includeEnd ? " (included)" : " (excluded)"}`,
      `Weekend: ${
        weekend.length
          ? weekend
              .slice()
              .sort()
              .map((day) => WEEKDAYS[day].long)
              .join(", ")
          : "none"
      }`,
      "",
      `Working days: ${num.format(result.workingDays)}`,
      `Weekend days: ${num.format(result.weekendDays)}`,
      `Holidays excluded: ${num.format(result.holidayDays)}`,
      `Total calendar days: ${num.format(result.totalDays)}`,
      `Working hours at ${num1.format(hoursValue)} h/day: ${num1.format(
        result.workingDays * hoursValue
      )}`,
      ...(result.holidayHits.length
        ? ["", "Holidays that fell on a working day:", ...result.holidayHits.map((hit) => `- ${hit.iso} ${hit.name}`)]
        : []),
    ].join("\n");
  }, [endDate, hoursValue, includeEnd, result, startDate, weekend]);

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
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Business days
          </span>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Working Days Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Count the business days between two dates. Choose which days count as your weekend, add
            your own holiday list, and see working days, weekend days and total working hours.
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

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid content-start gap-6">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Date range</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="start" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                    Start date
                  </label>
                  <input
                    id="start"
                    type="date"
                    value={start}
                    onChange={(event) => setStart(event.target.value)}
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="end" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                    End date
                  </label>
                  <input
                    id="end"
                    type="date"
                    value={end}
                    onChange={(event) => setEnd(event.target.value)}
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm">
                <input
                  id="include-end"
                  type="checkbox"
                  checked={includeEnd}
                  onChange={(event) => setIncludeEnd(event.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                />
                <span>Include the end date in the count</span>
              </label>

              <div className="mt-5">
                <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                  Which days are your weekend?
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => {
                    const active = weekend.includes(day.index);
                    return (
                      <button
                        key={day.index}
                        type="button"
                        onClick={() => toggleWeekend(day.index)}
                        aria-pressed={active}
                        aria-label={`Toggle ${day.long} as a weekend day`}
                        className={`min-h-11 min-w-[3.5rem] rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                          active
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {day.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 sm:max-w-[16rem]">
                <label htmlFor="hours" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                  Hours per working day
                </label>
                <input
                  id="hours"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  inputMode="decimal"
                  value={hoursPerDay}
                  onChange={(event) => setHoursPerDay(event.target.value)}
                  className={`mt-1 ${inputClass}`}
                />
              </div>
            </div>

            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold">Holidays to exclude</h2>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={addIndiaHolidays} className={ghostButton}>
                    India national days
                  </button>
                  <button type="button" onClick={addHoliday} className={ghostButton}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add holiday
                  </button>
                </div>
              </div>

              {holidays.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  No holidays added. Weekends are still excluded automatically.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3">
                  {holidays.map((item) => (
                    <li key={item.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                      <div>
                        <label
                          htmlFor={`hdate-${item.id}`}
                          className="block text-xs font-semibold text-[var(--muted-foreground)]"
                        >
                          Date
                        </label>
                        <input
                          id={`hdate-${item.id}`}
                          type="date"
                          value={item.date}
                          onChange={(event) => updateHoliday(item.id, "date", event.target.value)}
                          className={`mt-1 ${inputClass}`}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`hname-${item.id}`}
                          className="block text-xs font-semibold text-[var(--muted-foreground)]"
                        >
                          Name
                        </label>
                        <input
                          id={`hname-${item.id}`}
                          type="text"
                          value={item.name}
                          onChange={(event) => updateHoliday(item.id, "name", event.target.value)}
                          className={`mt-1 ${inputClass}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeHoliday(item.id)}
                        aria-label={`Remove holiday ${item.name || item.date}`}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Working days
              </p>
              {result ? (
                <>
                  <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
                    {num.format(result.workingDays)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    out of {num.format(result.totalDays)} calendar days
                  </p>

                  <dl className="mt-4 grid gap-2 text-sm">
                    {[
                      ["Weekend days", num.format(result.weekendDays)],
                      ["Holidays excluded", num.format(result.holidayDays)],
                      // The weekend is user-configurable, so a week is however
                      // many days are NOT marked as weekend — not always 5.
                      [
                        "Full weeks",
                        num.format(
                          Math.floor(result.workingDays / Math.max(1, 7 - weekend.length)),
                        ),
                      ],
                      [
                        "Working hours",
                        `${num1.format(result.workingDays * hoursValue)} h`,
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-0 last:pb-0"
                      >
                        <dt className="text-[var(--muted-foreground)]">{label}</dt>
                        <dd className="font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4 grid grid-cols-5 gap-1 text-center text-xs">
                    {WEEKDAYS.filter((day) => !weekend.includes(day.index)).map((day) => (
                      <div
                        key={day.index}
                        className="rounded-md border border-[var(--border)] bg-[var(--background)] px-1 py-2"
                      >
                        <p className="text-[var(--muted-foreground)]">{day.short}</p>
                        <p className="mt-0.5 font-semibold">{result.perWeekday[day.index]}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={copyReport}
                      aria-label="Copy working days result"
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
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Pick a valid start and end date to count business days.
                </p>
              )}
            </div>

            {result && result.holidayHits.length > 0 && (
              <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
                <h2 className="text-base font-semibold">Holidays removed</h2>
                <ul className="mt-3 grid gap-2 text-sm">
                  {result.holidayHits.map((hit) => (
                    <li key={hit.iso} className="flex items-center justify-between gap-3">
                      <span className="text-[var(--muted-foreground)]">{formatLong(hit.date)}</span>
                      <span className="font-semibold">{hit.name}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                  Holidays that land on a weekend are not listed here — they were already excluded.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
