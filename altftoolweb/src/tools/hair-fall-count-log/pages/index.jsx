"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  HIGH_DAILY_THRESHOLD,
  NORMAL_DAILY_MAX,
  NORMAL_DAILY_MIN,
  ROLLING_WINDOW_DAYS,
  analyseShedding,
  formatDate,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warn: "bg-[var(--muted)] text-[var(--foreground)]",
  success: "bg-[var(--muted)] text-[var(--success)]",
  neutral: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const DEFAULT_ROWS = [
  { id: 1, date: "2026-07-20", count: "60", washDay: false },
  { id: 2, date: "2026-07-21", count: "70", washDay: false },
  { id: 3, date: "2026-07-22", count: "80", washDay: false },
  { id: 4, date: "2026-07-23", count: "90", washDay: false },
  { id: 5, date: "2026-07-24", count: "120", washDay: true },
  { id: 6, date: "2026-07-25", count: "55", washDay: false },
  { id: 7, date: "2026-07-26", count: "65", washDay: false },
];

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return String(raw).trim() === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [nextId, setNextId] = useState(8);
  const [triggerDate, setTriggerDate] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseShedding({
        entries: rows.map((row) => ({ date: row.date, count: toNumber(row.count), washDay: row.washDay })),
        triggerDate: triggerDate || undefined,
      }),
    [rows, triggerDate],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const updateRow = (id, field, value) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setRows((current) => [...current, { id: nextId, date: "", count: "", washDay: false }]);
    setNextId((value) => value + 1);
  };

  const removeRow = (id) => {
    setRows((current) => (current.length <= 1 ? current : current.filter((row) => row.id !== id)));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Hair fall log",
      `${formatDate(result.firstDateMs)} → ${formatDate(result.lastDateMs)} (${result.spanDays} days, ${result.daysLogged} logged)`,
      `Total hairs counted: ${NUM0.format(result.totalHairs)}`,
      `Average: ${NUM1.format(result.dailyAverage)} per day — ${result.band.label}`,
      `Days over ${NORMAL_DAILY_MAX}: ${result.daysAboveNormal}`,
    ];
    if (result.washDayAverage !== null) lines.push(`Wash-day average: ${NUM1.format(result.washDayAverage)}`);
    if (result.nonWashDayAverage !== null) lines.push(`Non-wash-day average: ${NUM1.format(result.nonWashDayAverage)}`);
    if (result.telogen) {
      lines.push(
        "",
        `Trigger logged ${formatDate(result.telogen.triggerMs)}`,
        `Expected shedding window: ${formatDate(result.telogen.windowStartMs)} → ${formatDate(result.telogen.windowEndMs)}`,
        `Usually settling by: ${formatDate(result.telogen.settleByMs)}`,
      );
    }
    return lines.join("\n");
  }, [hasError, result]);

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
    setRows(DEFAULT_ROWS);
    setNextId(8);
    setTriggerDate("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Skin &amp; hair
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Hair Fall Count Log</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count the hairs you collect each day and see how the average compares with the normal
          {" "}{NORMAL_DAILY_MIN}–{NORMAL_DAILY_MAX} a day range. Wash days are marked separately, because
          hairs shed on dry days stay caught until the next wash.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Daily log</h2>
        <div className="mt-4 space-y-3">
          {rows.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Day {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                  aria-label={`Remove day ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--danger)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`hf-date-${row.id}`}>
                    Date
                  </label>
                  <input
                    id={`hf-date-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.date}
                    onChange={(event) => updateRow(row.id, "date", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`hf-count-${row.id}`}>
                    Hairs collected
                  </label>
                  <input
                    id={`hf-count-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="2000"
                    step="1"
                    value={row.count}
                    onChange={(event) => updateRow(row.id, "count", event.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
                    htmlFor={`hf-wash-${row.id}`}
                  >
                    <input
                      id={`hf-wash-${row.id}`}
                      type="checkbox"
                      className="h-5 w-5 accent-[var(--primary)]"
                      checked={row.washDay}
                      onChange={(event) => updateRow(row.id, "washDay", event.target.checked)}
                    />
                    I washed my hair on this day
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button type="button" onClick={addRow} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a day
          </button>
        </div>

        <div className="mt-5 max-w-xs">
          <label className={LABEL_CLASS} htmlFor="hf-trigger">
            Trigger date (optional)
          </label>
          <input
            id="hf-trigger"
            className={`mt-2 ${INPUT_CLASS}`}
            type="date"
            value={triggerDate}
            onChange={(event) => setTriggerDate(event.target.value)}
          />
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Illness with fever, surgery, childbirth, a crash diet or a severe stressor. Shedding after
            a trigger usually starts 2–3 months later.
          </p>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Average per day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${NUM1.format(result.dailyAverage)} hairs`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : result.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy hair fall log summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the hair fall log" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className={`mt-4 rounded-md px-3 py-2 text-sm leading-6 ${TONE_CLASS[result.band.tone]}`}>
            {result.band.note}
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Period", hasError ? dash : `${formatDate(result.firstDateMs)} → ${formatDate(result.lastDateMs)}`],
            ["Days covered / logged", hasError ? dash : `${result.spanDays} / ${result.daysLogged}`],
            ["Total hairs counted", hasError ? dash : NUM0.format(result.totalHairs)],
            ["Average per logged day", hasError ? dash : NUM1.format(result.averagePerLoggedDay)],
            [
              "Wash-day average",
              hasError ? dash : result.washDayAverage === null ? "No wash days logged" : NUM1.format(result.washDayAverage),
            ],
            [
              "Non-wash-day average",
              hasError ? dash : result.nonWashDayAverage === null ? "No non-wash days logged" : NUM1.format(result.nonWashDayAverage),
            ],
            [`Days over ${NORMAL_DAILY_MAX}`, hasError ? dash : String(result.daysAboveNormal)],
            ["Highest day", hasError ? dash : `${NUM0.format(result.peak.count)} on ${formatDate(result.peak.ms)}`],
            ["Lowest day", hasError ? dash : `${NUM0.format(result.lowest.count)} on ${formatDate(result.lowest.ms)}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.missingDays > 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.missingDays} day{result.missingDays === 1 ? "" : "s"} in this period have no entry.
            The headline average spreads the counted hairs across every calendar day, which is the fair
            comparison if you only count on wash days — but it understates things if you simply skipped
            counting on days when hair still fell.
          </p>
        )}

        {!hasError && result.trend && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Last {ROLLING_WINDOW_DAYS} entries average {NUM1.format(result.trend.recentAverage)} versus{" "}
            {NUM1.format(result.trend.priorAverage)} for the {ROLLING_WINDOW_DAYS} before —{" "}
            {result.trend.direction === "flat"
              ? "no change"
              : `${result.trend.direction === "up" ? "up" : "down"} ${NUM1.format(Math.abs(result.trend.changePct))}%`}
            .
          </p>
        )}
      </section>

      {!hasError && result.telogen && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">After your trigger</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Trigger date", formatDate(result.telogen.triggerMs)],
              [
                "Shedding usually starts",
                `${formatDate(result.telogen.windowStartMs)} – ${formatDate(result.telogen.windowEndMs)}`,
              ],
              ["Usually settling by", formatDate(result.telogen.settleByMs)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            Diffuse shedding after a fever, an operation, childbirth, sharp weight loss or severe
            stress typically begins two to three months later and usually settles within about six
            months once the trigger has passed. These dates are a general pattern, not a prediction
            for you.
          </p>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Daily counts and {ROLLING_WINDOW_DAYS}-day average</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Count</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Wash</th>
                  <th scope="col" className="py-2 text-right font-semibold">Rolling avg</th>
                </tr>
              </thead>
              <tbody>
                {result.entries.map((entry, index) => (
                  <tr key={entry.ms} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{formatDate(entry.ms)}</td>
                    <td
                      className={`py-2 pr-3 text-right font-semibold ${
                        entry.count > HIGH_DAILY_THRESHOLD
                          ? "text-[var(--danger)]"
                          : entry.count > NORMAL_DAILY_MAX
                            ? "text-[var(--foreground)]"
                            : "text-[var(--success)]"
                      }`}
                    >
                      {NUM0.format(entry.count)}
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{entry.washDay ? "Yes" : "—"}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(result.rolling[index].average)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and no substitute for a medical assessment. See a doctor or dermatologist
        for shedding that stays above about {NORMAL_DAILY_MAX} a day for more than a few weeks, a
        widening parting, patchy or circular bald areas, a receding hairline, scalp pain, scaling or
        scarring, or hair loss alongside other symptoms — many causes, including thyroid disease and
        iron deficiency, are treatable once identified.
      </p>
    </main>
  );
}
