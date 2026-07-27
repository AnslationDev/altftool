"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  BASELINE_WINDOW_DAYS,
  ROLLING_WINDOW_DAYS,
  buildChartPoints,
  summariseRestingHr,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const STORAGE_KEY = "altft-rhr-trend-log-v1";
const DASH = "—";

/** Fixed demo log so a real trend is on screen at first paint. */
const SEED_ENTRIES = [
  { date: "2025-03-01", bpm: 54 },
  { date: "2025-03-02", bpm: 55 },
  { date: "2025-03-03", bpm: 53 },
  { date: "2025-03-04", bpm: 56 },
  { date: "2025-03-05", bpm: 54 },
  { date: "2025-03-06", bpm: 52 },
  { date: "2025-03-07", bpm: 53 },
  { date: "2025-03-08", bpm: 55 },
  { date: "2025-03-09", bpm: 58 },
  { date: "2025-03-10", bpm: 61 },
  { date: "2025-03-11", bpm: 57 },
  { date: "2025-03-12", bpm: 54 },
  { date: "2025-03-13", bpm: 52 },
  { date: "2025-03-14", bpm: 51 },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_STYLE = {
  elevated: "bg-[var(--danger-soft)] text-[var(--danger)]",
  low: "bg-[var(--muted)] text-[var(--success)]",
  steady: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [entries, setEntries] = useState(SEED_ENTRIES);
  const [dateInput, setDateInput] = useState("");
  const [bpmInput, setBpmInput] = useState("");
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const today = new Date();
    const iso = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");
    setDateInput(iso);

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) setEntries(parsed);
      }
    } catch {
      /* storage unavailable or corrupt — keep the seed log */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* storage unavailable — the log still works for this session */
    }
  }, [entries]);

  const summary = useMemo(() => summariseRestingHr(entries), [entries]);
  const hasError = Boolean(summary.error);
  const chart = useMemo(
    () => (hasError ? null : buildChartPoints(summary.series)),
    [hasError, summary],
  );

  const addEntry = () => {
    const bpm = Number(String(bpmInput).trim());
    if (!dateInput) {
      setFormError("Pick the date of the reading.");
      return;
    }
    if (!Number.isFinite(bpm)) {
      setFormError("Enter the reading in beats per minute.");
      return;
    }
    const next = summariseRestingHr([...entries, { date: dateInput, bpm }]);
    if (next.error) {
      setFormError(next.error);
      return;
    }
    setEntries((current) => [
      ...current.filter((item) => item.date !== dateInput),
      { date: dateInput, bpm },
    ]);
    setBpmInput("");
    setFormError("");
  };

  const removeEntry = (date) => {
    setEntries((current) => current.filter((item) => item.date !== date));
    setFormError("");
  };

  const resetLog = () => {
    setEntries(SEED_ENTRIES);
    setBpmInput("");
    setFormError("");
    setCopied(false);
  };

  const clipboardText = useMemo(() => {
    if (hasError) return "";
    return [
      "Resting Heart Rate Trend",
      `Readings: ${summary.count} over ${summary.spanDays} days`,
      `Latest: ${summary.latest.bpm} bpm on ${summary.latest.date}`,
      `${summary.rollingWindowDays}-day rolling average: ${NUM1.format(summary.rollingLatest)} bpm`,
      `${summary.baselineWindowDays}-day baseline: ${NUM1.format(summary.baseline)} bpm`,
      `Deviation from baseline: ${summary.deviation >= 0 ? "+" : ""}${NUM1.format(summary.deviation)} bpm`,
      summary.slopePerWeek === null
        ? "Trend: not enough readings"
        : `Trend: ${summary.slopePerWeek >= 0 ? "+" : ""}${NUM1.format(summary.slopePerWeek)} bpm per week`,
      `Lowest: ${summary.lowest.bpm} bpm (${summary.lowest.date}) · Highest: ${summary.highest.bpm} bpm (${summary.highest.date})`,
      summary.statusText,
    ].join("\n");
  }, [hasError, summary]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const sortedForTable = hasError ? [] : [...summary.series].reverse();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Recovery tracking
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Resting Heart Rate Trend Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log your morning pulse and see the {ROLLING_WINDOW_DAYS}-day rolling average, your{" "}
          {BASELINE_WINDOW_DAYS}-day personal baseline, and how far today sits from it. Readings stay
          in this browser.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Add a morning reading</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rhr-date">
              Date
            </label>
            <input
              id="rhr-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dateInput}
              onChange={(event) => setDateInput(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rhr-bpm">
              Resting heart rate (bpm)
            </label>
            <input
              id="rhr-bpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="25"
              max="130"
              step="1"
              placeholder="e.g. 54"
              value={bpmInput}
              onChange={(event) => setBpmInput(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={addEntry} className={PRIMARY_BTN} aria-label="Add reading">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add reading
          </button>
          <button
            type="button"
            onClick={resetLog}
            className={GHOST_BTN}
            aria-label="Reset the log to the sample data"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset log
          </button>
        </div>
        {formError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {formError}
          </p>
        ) : null}
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {summary.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {ROLLING_WINDOW_DAYS}-day rolling average
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM1.format(summary.rollingLatest)} bpm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Add a reading to build the trend."
                : `Latest ${summary.latest.bpm} bpm on ${summary.latest.date} · ${summary.count} readings over ${summary.spanDays} days`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy resting heart rate trend summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
          </div>
        </div>

        {!hasError && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${STATUS_STYLE[summary.status]}`}
          >
            {summary.statusText}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              `${BASELINE_WINDOW_DAYS}-day baseline`,
              hasError ? DASH : `${NUM1.format(summary.baseline)} bpm`,
            ],
            [
              "Latest vs baseline",
              hasError
                ? DASH
                : `${summary.deviation >= 0 ? "+" : ""}${NUM1.format(summary.deviation)} bpm`,
            ],
            [
              "Weekly trend",
              hasError || summary.slopePerWeek === null
                ? DASH
                : `${summary.slopePerWeek >= 0 ? "+" : ""}${NUM1.format(summary.slopePerWeek)} bpm per week`,
            ],
            [
              "Day-to-day spread (SD)",
              hasError || summary.spread === null ? DASH : `${NUM1.format(summary.spread)} bpm`,
            ],
            [
              "Lowest reading",
              hasError ? DASH : `${NUM0.format(summary.lowest.bpm)} bpm (${summary.lowest.date})`,
            ],
            [
              "Highest reading",
              hasError ? DASH : `${NUM0.format(summary.highest.bpm)} bpm (${summary.highest.date})`,
            ],
            [
              "All-time average",
              hasError ? DASH : `${NUM1.format(summary.average)} bpm`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {chart && chart.points.length > 1 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Trend chart</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Thin line: daily readings. Thick line: {ROLLING_WINDOW_DAYS}-day rolling average. Scale{" "}
            {NUM0.format(chart.minBpm)}–{NUM0.format(chart.maxBpm)} bpm.
          </p>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="mt-3 h-40 w-full"
            role="img"
            aria-label={`Resting heart rate from ${summary.series[0].date} to ${summary.latest.date}, ranging ${NUM0.format(chart.minBpm)} to ${NUM0.format(chart.maxBpm)} beats per minute`}
          >
            <polyline
              points={chart.points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="var(--muted-foreground)"
              strokeWidth="0.7"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={chart.points
                .filter((p) => p.rollingY !== null)
                .map((p) => `${p.x},${p.rollingY}`)
                .join(" ")}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your log</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Date
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  bpm
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Rolling
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedForTable.length === 0 ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    No readings logged yet.
                  </td>
                </tr>
              ) : (
                sortedForTable.map((row) => (
                  <tr key={row.date} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap">{row.date}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{NUM0.format(row.bpm)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.rolling === null ? DASH : NUM1.format(row.rolling)}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeEntry(row.date)}
                        aria-label={`Remove the reading for ${row.date}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not a diagnostic tool. A resting heart rate persistently above 100 bpm
        or below 50 bpm without endurance training, or a sudden unexplained change, should be
        checked by a doctor — as should palpitations, dizziness or chest discomfort.
      </p>
    </main>
  );
}
