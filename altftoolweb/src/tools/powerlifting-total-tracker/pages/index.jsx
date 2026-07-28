"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Trophy } from "lucide-react";

import { REFERENCE_SPLIT, landmarkTable, summariseTotals } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const STORAGE_KEY = "altft-powerlifting-total-tracker";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const FLAG_STYLE = {
  strong: "bg-[var(--success-soft)] text-[var(--success)]",
  balanced: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  lagging: "bg-[var(--warning-soft)] text-[var(--warning)]",
  unknown: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const FLAG_LABEL = {
  strong: "Strong point",
  balanced: "Balanced",
  lagging: "Lagging",
  unknown: "—",
};

const SEED = [
  { id: 1, dateIso: "2025-07-12", squat: "180", bench: "110", deadlift: "220", bodyweight: "83" },
  { id: 2, dateIso: "2026-01-10", squat: "200", bench: "120", deadlift: "240", bodyweight: "84" },
];

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [entries, setEntries] = useState(SEED);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) setEntries(parsed);
    } catch {
      /* ignore unreadable storage */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* storage may be full or blocked */
    }
  }, [entries]);

  const stats = useMemo(
    () =>
      summariseTotals(
        entries.map((entry) => ({
          dateIso: entry.dateIso,
          squat: toNumber(entry.squat),
          bench: toNumber(entry.bench),
          deadlift: toNumber(entry.deadlift),
          bodyweight: entry.bodyweight === "" ? null : toNumber(entry.bodyweight),
        }))
      ),
    [entries]
  );

  const hasError = Boolean(stats.error);
  const hasData = !hasError && stats.entryCount > 0;

  const landmarks = useMemo(() => {
    if (!hasData || !stats.latest) return [];
    return landmarkTable(stats.latest.bodyweight);
  }, [hasData, stats]);

  const summary = useMemo(() => {
    if (!hasData) return "";
    return [
      "Powerlifting Total Tracker",
      `Best single-day total: ${NUM1.format(stats.bestMeetTotal)} kg on ${stats.bestMeetDate}`,
      `All-time gym total: ${NUM1.format(stats.gymTotal)} kg`,
      `Best squat: ${NUM1.format(stats.bestByLift.squat)} kg`,
      `Best bench: ${NUM1.format(stats.bestByLift.bench)} kg`,
      `Best deadlift: ${NUM1.format(stats.bestByLift.deadlift)} kg`,
      stats.progress && Number.isFinite(stats.progress.totalDelta)
        ? `Total change since first entry: ${stats.progress.totalDelta >= 0 ? "+" : ""}${NUM1.format(stats.progress.totalDelta)} kg`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasData, stats]);

  const updateEntry = (id, patch) =>
    setEntries((list) => list.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));

  const addEntry = () =>
    setEntries((list) => {
      const nextId = list.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;
      const last = list[list.length - 1];
      return [
        ...list,
        {
          id: nextId,
          dateIso: new Date().toISOString().slice(0, 10),
          squat: last?.squat ?? "100",
          bench: last?.bench ?? "60",
          deadlift: last?.deadlift ?? "120",
          bodyweight: last?.bodyweight ?? "80",
        },
      ];
    });

  const removeEntry = (id) => setEntries((list) => list.filter((entry) => entry.id !== id));

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
    setEntries(SEED);
    setCopied(false);
  };

  const rows = hasData
    ? [
        ["All-time gym total (best of each lift)", `${NUM1.format(stats.gymTotal)} kg`],
        [
          "Gap between gym total and meet total",
          stats.sameDayGap > 0 ? `${NUM1.format(stats.sameDayGap)} kg` : "None — all set together",
        ],
        ["Best squat", `${NUM1.format(stats.bestByLift.squat)} kg (${stats.bestByLiftDate.squat})`],
        ["Best bench press", `${NUM1.format(stats.bestByLift.bench)} kg (${stats.bestByLiftDate.bench})`],
        [
          "Best deadlift",
          `${NUM1.format(stats.bestByLift.deadlift)} kg (${stats.bestByLiftDate.deadlift})`,
        ],
        [
          "Total change since first entry",
          stats.progress
            ? `${stats.progress.totalDelta >= 0 ? "+" : ""}${NUM1.format(stats.progress.totalDelta)} kg over ${NUM0.format(stats.progress.days ?? 0)} days`
            : DASH,
        ],
        [
          "Average gain per month",
          stats.progress && Number.isFinite(stats.progress.kgPerMonth)
            ? `${NUM1.format(stats.progress.kgPerMonth)} kg`
            : DASH,
        ],
        [
          "Total as a bodyweight multiple",
          stats.bodyweightMultiples ? `${NUM2.format(stats.bodyweightMultiples.total)}×` : DASH,
        ],
      ]
    : [
        ["All-time gym total (best of each lift)", DASH],
        ["Gap between gym total and meet total", DASH],
        ["Best squat", DASH],
        ["Best bench press", DASH],
        ["Best deadlift", DASH],
        ["Total change since first entry", DASH],
        ["Average gain per month", DASH],
        ["Total as a bodyweight multiple", DASH],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          Powerlifting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Powerlifting Total Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A competition total is squat plus bench plus deadlift from one day. This tracks that
          single-day figure separately from the all-time gym total, shows how the three lifts are
          balanced, and converts everything to bodyweight multiples. Data stays in this browser.
        </p>
      </header>

      {hasError && (
        <p
          role="alert"
          className="mb-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {stats.error}
        </p>
      )}

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best single-day total
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasData ? `${NUM1.format(stats.bestMeetTotal)} kg` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasData
                ? `Set on ${stats.bestMeetDate} across ${stats.entryCount} logged session${stats.entryCount === 1 ? "" : "s"}`
                : "Add a session below to see your total."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy powerlifting total summary"
              className={GHOST_BTN}
              disabled={!hasData}
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
              aria-label="Reset the log to the sample sessions"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Lift balance in your latest session</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Raw totals typically split near {REFERENCE_SPLIT.squat}% squat, {REFERENCE_SPLIT.bench}%
          bench and {REFERENCE_SPLIT.deadlift}% deadlift. That is a descriptive average, not a
          target.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Lift
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Weight
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Share
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  × bodyweight
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {["squat", "bench", "deadlift"].map((liftId) => {
                const label =
                  liftId === "squat" ? "Squat" : liftId === "bench" ? "Bench press" : "Deadlift";
                const flag = hasData && stats.splitFlags ? stats.splitFlags[liftId] : "unknown";
                return (
                  <tr key={liftId} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{label}</td>
                    <td className="py-2 pr-3 text-right">
                      {hasData ? `${NUM1.format(stats.latest[liftId])} kg` : DASH}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {hasData && stats.split ? `${NUM1.format(stats.split[liftId])}%` : DASH}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {hasData && stats.bodyweightMultiples
                        ? `${NUM2.format(stats.bodyweightMultiples[liftId])}×`
                        : DASH}
                    </td>
                    <td className="py-2">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${FLAG_STYLE[flag]}`}
                      >
                        {FLAG_LABEL[flag]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {landmarks.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            Bodyweight-multiple landmarks at {NUM1.format(stats.latest.bodyweight)} kg
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Level
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Squat
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Bench
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Deadlift
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {landmarks.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{NUM0.format(row.squat)}</td>
                    <td className="py-2 pr-3 text-right">{NUM0.format(row.bench)}</td>
                    <td className="py-2 pr-3 text-right">{NUM0.format(row.deadlift)}</td>
                    <td className="py-2 text-right font-semibold">{NUM0.format(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Informal coaching conventions in kilograms, not federation standards.
          </p>
        </section>
      )}

      <section className="mt-6 space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Session {entry.dateIso}</h2>
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                aria-label={`Remove the session on ${entry.dateIso}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`pt-date-${entry.id}`}>
                  Date
                </label>
                <input
                  id={`pt-date-${entry.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="date"
                  value={entry.dateIso}
                  onChange={(event) => updateEntry(entry.id, { dateIso: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`pt-bw-${entry.id}`}>
                  Bodyweight (kg)
                </label>
                <input
                  id={`pt-bw-${entry.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={entry.bodyweight}
                  onChange={(event) => updateEntry(entry.id, { bodyweight: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`pt-squat-${entry.id}`}>
                  Squat (kg)
                </label>
                <input
                  id={`pt-squat-${entry.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="2.5"
                  value={entry.squat}
                  onChange={(event) => updateEntry(entry.id, { squat: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`pt-bench-${entry.id}`}>
                  Bench press (kg)
                </label>
                <input
                  id={`pt-bench-${entry.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="2.5"
                  value={entry.bench}
                  onChange={(event) => updateEntry(entry.id, { bench: event.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor={`pt-dead-${entry.id}`}>
                  Deadlift (kg)
                </label>
                <input
                  id={`pt-dead-${entry.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="2.5"
                  value={entry.deadlift}
                  onChange={(event) => updateEntry(entry.id, { deadlift: event.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      <button type="button" onClick={addEntry} className={`mt-4 w-full sm:w-auto ${PRIMARY_BTN}`}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add a session
      </button>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Only a same-day squat, bench and deadlift counts as a competition total — a federation will
        not add bests set in different months. Bodyweight-multiple levels here are coaching
        shorthand, not official classifications.
      </p>
    </main>
  );
}
