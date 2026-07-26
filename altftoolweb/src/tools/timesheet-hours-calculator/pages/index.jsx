"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

const MINUTES_PER_DAY = 1440;

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const makeDefaultRows = () =>
  DAY_NAMES.map((day, index) => ({
    day,
    start: index < 5 ? "09:00" : "",
    end: index < 5 ? "17:30" : "",
    breakMinutes: index < 5 ? "30" : "0",
  }));

const DEFAULT_RATE = "500";
const DEFAULT_OT_THRESHOLD = "40";
const DEFAULT_OT_MULTIPLIER = "1.5";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const intFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function parseTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function formatClock(totalMinutes) {
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${intFormatter.format(hours)}h`;
  return `${intFormatter.format(hours)}h ${minutes}m`;
}

/** Minutes worked for one row; returns { minutes, overnight, error }. */
function computeRow(row) {
  const hasStart = row.start.trim() !== "";
  const hasEnd = row.end.trim() !== "";

  if (!hasStart && !hasEnd) return { minutes: 0, overnight: false, error: null, empty: true };
  if (!hasStart || !hasEnd) {
    return { minutes: 0, overnight: false, error: "needs both an in and an out time", empty: false };
  }

  const start = parseTimeToMinutes(row.start);
  const end = parseTimeToMinutes(row.end);
  if (start === null || end === null) {
    return { minutes: 0, overnight: false, error: "has an invalid time", empty: false };
  }

  let gross = end - start;
  let overnight = false;
  if (gross <= 0) {
    gross += MINUTES_PER_DAY;
    overnight = true;
  }

  const breakValue = row.breakMinutes.trim() === "" ? 0 : Number(row.breakMinutes);
  if (!Number.isFinite(breakValue) || breakValue < 0) {
    return { minutes: 0, overnight, error: "has an invalid break value", empty: false };
  }
  if (breakValue >= gross) {
    return { minutes: 0, overnight, error: "has a break longer than the shift", empty: false };
  }

  return { minutes: gross - breakValue, gross, breakValue, overnight, error: null, empty: false };
}

export default function ToolHome() {
  const [rows, setRows] = useState(makeDefaultRows);
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [otThreshold, setOtThreshold] = useState(DEFAULT_OT_THRESHOLD);
  const [otMultiplier, setOtMultiplier] = useState(DEFAULT_OT_MULTIPLIER);
  const [copied, setCopied] = useState(false);

  const updateRow = (index, field, value) => {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
    );
    setCopied(false);
  };

  const summary = useMemo(() => {
    const computed = rows.map((row) => ({ row, ...computeRow(row) }));
    const rowErrors = computed
      .filter((item) => item.error)
      .map((item) => `${item.row.day} ${item.error}`);

    const totalMinutes = computed.reduce((sum, item) => sum + (item.error ? 0 : item.minutes), 0);
    const daysWorked = computed.filter((item) => !item.error && !item.empty && item.minutes > 0).length;

    const thresholdHours = Number(otThreshold);
    const safeThreshold =
      Number.isFinite(thresholdHours) && thresholdHours >= 0 ? thresholdHours : 40;
    const thresholdMinutes = safeThreshold * 60;

    const overtimeMinutes = Math.max(0, totalMinutes - thresholdMinutes);
    const regularMinutes = totalMinutes - overtimeMinutes;

    const rateValue = rate.trim() === "" ? 0 : Number(rate);
    const safeRate = Number.isFinite(rateValue) && rateValue >= 0 ? rateValue : 0;

    const multiplierValue = Number(otMultiplier);
    const safeMultiplier =
      Number.isFinite(multiplierValue) && multiplierValue >= 0 ? multiplierValue : 1.5;

    const regularPay = (regularMinutes / 60) * safeRate;
    const overtimePay = (overtimeMinutes / 60) * safeRate * safeMultiplier;

    const inputError =
      !Number.isFinite(thresholdHours) || thresholdHours < 0
        ? "Overtime threshold must be zero or more hours."
        : !Number.isFinite(rateValue) || rateValue < 0
          ? "Hourly rate must be zero or a positive amount."
          : !Number.isFinite(multiplierValue) || multiplierValue < 0
            ? "Overtime multiplier must be zero or more."
            : null;

    return {
      computed,
      rowErrors,
      inputError,
      totalMinutes,
      daysWorked,
      regularMinutes,
      overtimeMinutes,
      regularPay,
      overtimePay,
      totalPay: regularPay + overtimePay,
      safeRate,
      safeThreshold,
      safeMultiplier,
      averageMinutes: daysWorked > 0 ? totalMinutes / daysWorked : 0,
    };
  }, [rows, rate, otThreshold, otMultiplier]);

  const report = useMemo(() => {
    const lines = ["Timesheet Hours Calculator", ""];
    summary.computed.forEach((item) => {
      if (item.empty) {
        lines.push(`${item.row.day}: off`);
      } else if (item.error) {
        lines.push(`${item.row.day}: ${item.error}`);
      } else {
        lines.push(
          `${item.row.day}: ${item.row.start} - ${item.row.end}${item.overnight ? " (+1d)" : ""}, break ${intFormatter.format(item.breakValue)} min = ${formatClock(item.minutes)}`,
        );
      }
    });
    lines.push("");
    lines.push(`Total: ${formatClock(summary.totalMinutes)} (${decimalFormatter.format(summary.totalMinutes / 60)} h)`);
    lines.push(`Regular: ${formatClock(summary.regularMinutes)}`);
    lines.push(`Overtime: ${formatClock(summary.overtimeMinutes)} above ${summary.safeThreshold} h`);
    if (summary.safeRate > 0) {
      lines.push(`Estimated pay: ${currencyFormatter.format(summary.totalPay)}`);
    }
    return lines.join("\n");
  }, [summary]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setRows(makeDefaultRows());
    setRate(DEFAULT_RATE);
    setOtThreshold(DEFAULT_OT_THRESHOLD);
    setOtMultiplier(DEFAULT_OT_MULTIPLIER);
    setCopied(false);
  };

  const clearWeek = () => {
    setRows(DAY_NAMES.map((day) => ({ day, start: "", end: "", breakMinutes: "0" })));
    setCopied(false);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "block text-sm font-semibold text-[var(--foreground)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header>
        <p className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Weekly timesheet
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Timesheet Hours Calculator</h1>
        <p className="mt-2 text-base leading-7 text-[var(--muted-foreground)]">
          Enter your clock in and out times for each day, deduct unpaid breaks, and get weekly totals in
          hours, minutes and decimal hours — split into regular and overtime.
        </p>
      </header>

      <section className="mt-6 space-y-3">
        {rows.map((row, index) => {
          const computed = summary.computed[index];
          return (
            <div
              key={row.day}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{row.day}</p>
                <p
                  className={`text-sm font-semibold ${
                    computed.error ? "text-[var(--danger)]" : "text-[var(--primary)]"
                  }`}
                >
                  {computed.error
                    ? "Check inputs"
                    : computed.empty
                      ? "Off"
                      : `${formatClock(computed.minutes)}${computed.overnight ? " (+1d)" : ""}`}
                </p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass} htmlFor={`ts-start-${index}`}>
                    Clock in
                  </label>
                  <input
                    id={`ts-start-${index}`}
                    type="time"
                    value={row.start}
                    onChange={(event) => updateRow(index, "start", event.target.value)}
                    className={`mt-2 ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`ts-end-${index}`}>
                    Clock out
                  </label>
                  <input
                    id={`ts-end-${index}`}
                    type="time"
                    value={row.end}
                    onChange={(event) => updateRow(index, "end", event.target.value)}
                    className={`mt-2 ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`ts-break-${index}`}>
                    Break (min)
                  </label>
                  <input
                    id={`ts-break-${index}`}
                    type="number"
                    min="0"
                    step="5"
                    inputMode="numeric"
                    value={row.breakMinutes}
                    onChange={(event) => updateRow(index, "breakMinutes", event.target.value)}
                    className={`mt-2 ${inputClass}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-sm font-semibold">Pay and overtime settings</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="ts-rate">
              Hourly rate (INR)
            </label>
            <input
              id="ts-rate"
              type="number"
              min="0"
              step="10"
              inputMode="decimal"
              value={rate}
              onChange={(event) => {
                setRate(event.target.value);
                setCopied(false);
              }}
              className={`mt-2 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="ts-threshold">
              Overtime after (hours per week)
            </label>
            <input
              id="ts-threshold"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={otThreshold}
              onChange={(event) => {
                setOtThreshold(event.target.value);
                setCopied(false);
              }}
              className={`mt-2 ${inputClass}`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="ts-multiplier">
              Overtime pay multiplier
            </label>
            <input
              id="ts-multiplier"
              type="number"
              min="0"
              step="0.25"
              inputMode="decimal"
              value={otMultiplier}
              onChange={(event) => {
                setOtMultiplier(event.target.value);
                setCopied(false);
              }}
              className={`mt-2 ${inputClass}`}
            />
          </div>
        </div>
      </section>

      {summary.inputError ? (
        <div
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {summary.inputError}
        </div>
      ) : null}

      {summary.rowErrors.length > 0 ? (
        <div
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {summary.rowErrors.join("; ")}. Those days are counted as zero.
        </div>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total hours this week
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
              {formatClock(summary.totalMinutes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {decimalFormatter.format(summary.totalMinutes / 60)} decimal hours across{" "}
              {summary.daysWorked} day{summary.daysWorked === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy timesheet summary"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset the timesheet to default hours"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button
              type="button"
              onClick={clearWeek}
              aria-label="Clear all days"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              Clear week
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["Regular hours", formatClock(summary.regularMinutes)],
            [`Overtime above ${decimalFormatter.format(summary.safeThreshold)} h`, formatClock(summary.overtimeMinutes)],
            ["Average per working day", summary.daysWorked > 0 ? formatClock(summary.averageMinutes) : "0m"],
            ["Total minutes", `${intFormatter.format(summary.totalMinutes)} min`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            >
              <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-sm font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {summary.safeRate > 0 ? (
          <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-sm font-semibold">Estimated gross pay</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {currencyFormatter.format(summary.totalPay)}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Regular {currencyFormatter.format(summary.regularPay)} + overtime{" "}
              {currencyFormatter.format(summary.overtimePay)} at {decimalFormatter.format(summary.safeMultiplier)}x.
              Before tax and deductions.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
