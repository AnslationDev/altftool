"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Scissors, Trash2 } from "lucide-react";

import {
  MIN_RELIABLE_DAYS,
  REFERENCE_CM_PER_MONTH,
  analyseHairGrowth,
  formatDate,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ROWS = [
  { id: 1, date: "2026-01-01", lengthCm: "40", trimmedCm: "0" },
  { id: 2, date: "2026-04-01", lengthCm: "43", trimmedCm: "0" },
];
const DEFAULT_TARGET = "50";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return String(raw).trim() === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [nextId, setNextId] = useState(3);
  const [targetCm, setTargetCm] = useState(DEFAULT_TARGET);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseHairGrowth({
        entries: rows.map((row) => ({
          date: row.date,
          lengthCm: toNumber(row.lengthCm),
          trimmedCm: toNumber(row.trimmedCm) || 0,
        })),
        targetCm: toNumber(targetCm),
      }),
    [rows, targetCm],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const updateRow = (id, field, value) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setRows((current) => [...current, { id: nextId, date: "", lengthCm: "", trimmedCm: "0" }]);
    setNextId((value) => value + 1);
  };

  const removeRow = (id) => {
    setRows((current) => (current.length <= 2 ? current : current.filter((row) => row.id !== id)));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Hair growth progress",
      `${formatDate(result.firstDateMs)} → ${formatDate(result.lastDateMs)} (${result.totalDays} days)`,
      `Length: ${NUM1.format(result.firstLengthCm)} cm → ${NUM1.format(result.lastLengthCm)} cm`,
      `Trimmed off in that time: ${NUM1.format(result.totalTrimmedCm)} cm`,
      `True growth: ${NUM2.format(result.totalGrownCm)} cm`,
      `Rate: ${NUM2.format(result.cmPerMonth)} cm/month (${NUM1.format(result.cmPerYear)} cm/year) — ${result.band.label}`,
    ];
    if (result.projection && !result.projection.reached && result.projection.onMs) {
      lines.push(
        `Projected ${NUM1.format(toNumber(targetCm))} cm on ${formatDate(result.projection.onMs)} (${NUM1.format(result.projection.months)} months away)`,
      );
    }
    return lines.join("\n");
  }, [hasError, result, targetCm]);

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
    setNextId(3);
    setTargetCm(DEFAULT_TARGET);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scissors className="h-4 w-4" aria-hidden="true" />
          Skin &amp; hair
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Hair Growth Progress Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log dated length measurements and see your real rate in centimetres per month. Trims are
          added back, so a haircut does not read as negative growth.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Measurements</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Measure dry hair from the same starting point each time — a fixed spot on the scalp or the
          crown — and pull it straight without stretching.
        </p>

        <div className="mt-4 space-y-4">
          {rows.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Measurement {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 2}
                  aria-label={`Remove measurement ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--danger)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`hg-date-${row.id}`}>
                    Date measured
                  </label>
                  <input
                    id={`hg-date-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.date}
                    onChange={(event) => updateRow(row.id, "date", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`hg-length-${row.id}`}>
                    Length (cm)
                  </label>
                  <input
                    id={`hg-length-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="300"
                    step="0.5"
                    value={row.lengthCm}
                    onChange={(event) => updateRow(row.id, "lengthCm", event.target.value)}
                  />
                </div>
                {index > 0 && (
                  <div className="sm:col-span-2">
                    <label className={LABEL_CLASS} htmlFor={`hg-trim-${row.id}`}>
                      Cut off since the previous measurement (cm)
                    </label>
                    <input
                      id={`hg-trim-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="300"
                      step="0.5"
                      value={row.trimmedCm}
                      onChange={(event) => updateRow(row.id, "trimmedCm", event.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={addRow} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add measurement
          </button>
        </div>

        <div className="mt-5 max-w-xs">
          <label className={LABEL_CLASS} htmlFor="hg-target">
            Target length (cm, optional)
          </label>
          <input
            id="hg-target"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="decimal"
            min="0"
            max="300"
            step="1"
            value={targetCm}
            onChange={(event) => setTargetCm(event.target.value)}
          />
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
              Growth rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${NUM2.format(result.cmPerMonth)} cm/month`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : `${result.band.label} — ${result.band.note}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy hair growth summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tracker" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Tracked period", hasError ? dash : `${formatDate(result.firstDateMs)} → ${formatDate(result.lastDateMs)}`],
            ["Days tracked", hasError ? dash : `${result.totalDays} days`],
            ["Length now", hasError ? dash : `${NUM1.format(result.lastLengthCm)} cm`],
            ["Change on the ruler", hasError ? dash : `${NUM2.format(result.netChangeCm)} cm`],
            ["Trimmed off", hasError ? dash : `${NUM1.format(result.totalTrimmedCm)} cm`],
            ["True growth (trims added back)", hasError ? dash : `${NUM2.format(result.totalGrownCm)} cm`],
            ["Per year at this rate", hasError ? dash : `${NUM1.format(result.cmPerYear)} cm`],
            ["Per day", hasError ? dash : `${NUM2.format(result.mmPerDay)} mm`],
            [
              "Versus the 1.25 cm/month reference",
              hasError ? dash : `${NUM1.format(result.vsReferencePct)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.reliable && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Only {result.totalDays} days of data. A 2–3 mm measuring error is a large share of that, so
            treat the rate as provisional until you have at least {MIN_RELIABLE_DAYS} days between the
            first and last measurement.
          </p>
        )}

        {!hasError && result.projection && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-3 text-sm leading-6">
            {result.projection.message ? (
              result.projection.message
            ) : (
              <>
                At {NUM2.format(result.cmPerMonth)} cm a month you need another{" "}
                <strong>{NUM1.format(result.projection.remainingCm)} cm</strong>, reaching your target
                in about <strong>{NUM1.format(result.projection.months)} months</strong> — around{" "}
                <strong>{formatDate(result.projection.onMs)}</strong>.
              </>
            )}
          </p>
        )}
      </section>

      {!hasError && result.intervals.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Between measurements</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Period</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Days</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Trimmed</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Grown</th>
                  <th scope="col" className="py-2 text-right font-semibold">cm/month</th>
                </tr>
              </thead>
              <tbody>
                {result.intervals.map((interval) => (
                  <tr key={`${interval.fromMs}-${interval.toMs}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      {formatDate(interval.fromMs)} → {formatDate(interval.toMs)}
                    </td>
                    <td className="py-2 pr-3 text-right">{interval.days}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(interval.trimmedCm)} cm
                    </td>
                    <td className="py-2 pr-3 text-right">{NUM2.format(interval.grownCm)} cm</td>
                    <td className="py-2 text-right font-semibold">
                      {interval.reliable ? NUM2.format(interval.cmPerMonth) : `${NUM2.format(interval.cmPerMonth)}*`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            * fewer than {MIN_RELIABLE_DAYS} days apart, so this figure is noisy.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The {NUM2.format(REFERENCE_CM_PER_MONTH)} cm per month reference is a
        population average; your maximum length is set largely by how long your growth phase lasts, so
        some people plateau however patient they are. Sudden shedding, patchy loss, scalp pain or
        scarring needs a doctor or dermatologist rather than a tracker.
      </p>
    </main>
  );
}
