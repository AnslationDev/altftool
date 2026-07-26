"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";

const MINUTES_PER_DAY = 1440;

const DEFAULTS = {
  startTime: "09:00",
  endTime: "17:30",
  extraDays: "0",
  breakMinutes: "30",
  roundTo: "1",
};

const PRESETS = [
  { label: "9 to 5 with lunch", startTime: "09:00", endTime: "17:00", breakMinutes: "60", extraDays: "0" },
  { label: "Night shift 22:00 to 06:00", startTime: "22:00", endTime: "06:00", breakMinutes: "30", extraDays: "0" },
  { label: "Half day 09:30 to 13:00", startTime: "09:30", endTime: "13:00", breakMinutes: "0", extraDays: "0" },
];

const ROUNDING_OPTIONS = [
  { value: "1", label: "Exact (1 minute)" },
  { value: "5", label: "Nearest 5 minutes" },
  { value: "6", label: "Nearest 6 minutes (0.1 h)" },
  { value: "15", label: "Nearest 15 minutes" },
  { value: "30", label: "Nearest 30 minutes" },
];

const decimalFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const intFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** "HH:MM" -> minutes since midnight, or null when malformed. */
function parseTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function toClock(totalMinutes) {
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return { hours, minutes };
}

function formatClock(totalMinutes) {
  const { hours, minutes } = toClock(totalMinutes);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${intFormatter.format(hours)}h`;
  return `${intFormatter.format(hours)}h ${minutes}m`;
}

function formatTimeLabel(minutes) {
  const normalised = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = String(Math.floor(normalised / 60)).padStart(2, "0");
  const mins = String(normalised % 60).padStart(2, "0");
  return `${hours}:${mins}`;
}

export default function ToolHome() {
  const [startTime, setStartTime] = useState(DEFAULTS.startTime);
  const [endTime, setEndTime] = useState(DEFAULTS.endTime);
  const [extraDays, setExtraDays] = useState(DEFAULTS.extraDays);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULTS.breakMinutes);
  const [roundTo, setRoundTo] = useState(DEFAULTS.roundTo);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const start = parseTimeToMinutes(startTime);
    const end = parseTimeToMinutes(endTime);

    if (start === null || end === null) {
      return { error: "Enter both a start time and an end time in 24-hour HH:MM format." };
    }

    const days = Number(extraDays);
    if (!Number.isFinite(days) || days < 0 || days > 365) {
      return { error: "Extra days must be a whole number between 0 and 365." };
    }

    const breakValue = breakMinutes === "" ? 0 : Number(breakMinutes);
    if (!Number.isFinite(breakValue) || breakValue < 0) {
      return { error: "Break minutes must be zero or a positive number." };
    }

    const wholeDays = Math.floor(days);
    // End time earlier than (or equal to) start time means the period runs past
    // midnight, e.g. a 22:00 to 06:00 night shift. That carry is independent of
    // the extra-days field — gating it on wholeDays === 0 silently dropped the
    // extra days for every overnight span.
    const crossedMidnight = end <= start;
    const gross =
      end - start + (wholeDays + (crossedMidnight ? 1 : 0)) * MINUTES_PER_DAY;

    if (gross <= 0) {
      return { error: "The end time must come after the start time. Add extra days for longer periods." };
    }

    if (breakValue >= gross) {
      return {
        error: `Breaks (${intFormatter.format(breakValue)} min) are longer than the ${formatClock(
          gross,
        )} elapsed. Reduce the break time.`,
      };
    }

    const netExact = gross - breakValue;
    const step = Number(roundTo) || 1;
    const netRounded = step > 1 ? Math.round(netExact / step) * step : netExact;
    const net = Math.max(0, netRounded);

    return {
      error: null,
      gross,
      breakValue,
      net,
      netExact,
      crossedMidnight,
      wholeDays,
      step,
      decimalHours: net / 60,
      totalSeconds: net * 60,
      workdayShare: (net / 480) * 100,
      startLabel: formatTimeLabel(start),
      endLabel: formatTimeLabel(end),
    };
  }, [startTime, endTime, extraDays, breakMinutes, roundTo]);

  const report = useMemo(() => {
    if (result.error) return "";
    return [
      "Time Duration Calculator",
      `Start: ${result.startLabel}`,
      `End: ${result.endLabel}${result.crossedMidnight ? " (next day)" : ""}`,
      result.wholeDays > 0 ? `Extra days: ${result.wholeDays}` : null,
      `Elapsed: ${formatClock(result.gross)}`,
      `Break deducted: ${intFormatter.format(result.breakValue)} min`,
      `Duration: ${formatClock(result.net)}`,
      `Decimal hours: ${decimalFormatter.format(result.decimalHours)}`,
      `Total minutes: ${intFormatter.format(result.net)}`,
      result.step > 1 ? `Rounded to nearest ${result.step} minutes` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [result]);

  const handleCopy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setStartTime(DEFAULTS.startTime);
    setEndTime(DEFAULTS.endTime);
    setExtraDays(DEFAULTS.extraDays);
    setBreakMinutes(DEFAULTS.breakMinutes);
    setRoundTo(DEFAULTS.roundTo);
    setCopied(false);
  };

  const applyPreset = (preset) => {
    setStartTime(preset.startTime);
    setEndTime(preset.endTime);
    setBreakMinutes(preset.breakMinutes);
    setExtraDays(preset.extraDays);
    setCopied(false);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "block text-sm font-semibold text-[var(--foreground)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header>
        <p className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Time calculator
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Time Duration Calculator</h1>
        <p className="mt-2 text-base leading-7 text-[var(--muted-foreground)]">
          Enter a start and end time to get the duration in hours and minutes, decimal hours and total
          minutes. Overnight periods and unpaid breaks are handled for you.
        </p>
      </header>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="tdc-start">
              Start time
            </label>
            <input
              id="tdc-start"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className={`mt-2 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="tdc-end">
              End time
            </label>
            <input
              id="tdc-end"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className={`mt-2 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="tdc-break">
              Unpaid break (minutes)
            </label>
            <input
              id="tdc-break"
              type="number"
              min="0"
              step="5"
              inputMode="numeric"
              value={breakMinutes}
              onChange={(event) => setBreakMinutes(event.target.value)}
              className={`mt-2 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="tdc-days">
              Extra full days between
            </label>
            <input
              id="tdc-days"
              type="number"
              min="0"
              max="365"
              step="1"
              inputMode="numeric"
              value={extraDays}
              onChange={(event) => setExtraDays(event.target.value)}
              className={`mt-2 ${inputClass}`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="tdc-round">
              Rounding
            </label>
            <select
              id="tdc-round"
              value={roundTo}
              onChange={(event) => setRoundTo(event.target.value)}
              className={`mt-2 ${inputClass}`}
            >
              {ROUNDING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold">Quick examples</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {result.error ? (
        <div
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </div>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Duration
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                {formatClock(result.net)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {result.startLabel} to {result.endLabel}
                {result.crossedMidnight ? " (next day)" : ""}
                {result.wholeDays > 0 ? ` + ${result.wholeDays} day${result.wholeDays > 1 ? "s" : ""}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy duration result"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset all inputs"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Decimal hours", `${decimalFormatter.format(result.decimalHours)} h`],
              ["Total minutes", `${intFormatter.format(result.net)} min`],
              ["Total seconds", `${intFormatter.format(result.totalSeconds)} s`],
              ["Share of an 8-hour day", `${decimalFormatter.format(result.workdayShare)}%`],
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

          <div className="mt-4 space-y-1 text-sm text-[var(--muted-foreground)]">
            <p>
              Elapsed time <span className="font-semibold text-[var(--foreground)]">{formatClock(result.gross)}</span>{" "}
              minus <span className="font-semibold text-[var(--foreground)]">{intFormatter.format(result.breakValue)} min</span>{" "}
              of breaks.
            </p>
            {result.step > 1 ? (
              <p>
                Rounded to the nearest {result.step} minutes (exact value {formatClock(result.netExact)}).
              </p>
            ) : null}
          </div>
        </section>
      )}
    </main>
  );
}
