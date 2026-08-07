"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LineChart, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  ADA_GENERAL_TARGET_PERCENT,
  HBA1C_WINDOW_DAYS,
  UNITS,
  analyseHba1c,
} from "../lib";

const DASH = "—";

const START_READINGS = [
  { id: 1, date: "2025-08-01", value: "9.2" },
  { id: 2, date: "2025-11-01", value: "8.4" },
  { id: 3, date: "2026-02-01", value: "7.6" },
  { id: 4, date: "2026-05-01", value: "7.1" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const CHART_WIDTH = 640;
const CHART_HEIGHT = 200;
const CHART_PAD = 16;

export default function ToolHome() {
  const [readings, setReadings] = useState(START_READINGS);
  const [unit, setUnit] = useState("percent");
  const [target, setTarget] = useState(String(ADA_GENERAL_TARGET_PERCENT));
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseHba1c({
        readings: readings.map((reading) => ({
          id: reading.id,
          date: reading.date,
          value: Number(reading.value),
        })),
        unit,
        targetValue: Number(target),
      }),
    [readings, unit, target],
  );

  const hasError = Boolean(result.error);
  const show = (value) => (hasError ? DASH : value);
  const unitShort = UNITS.find((item) => item.id === unit)?.short || "%";

  const updateReading = (id, field, value) => {
    setReadings((list) =>
      list.map((reading) => (reading.id === id ? { ...reading, [field]: value } : reading)),
    );
    setCopied(false);
  };

  const addReading = () => {
    setReadings((list) => {
      const nextId = list.reduce((max, reading) => Math.max(max, reading.id), 0) + 1;
      const lastDate = list.length > 0 ? list[list.length - 1].date : "2026-01-01";
      return [...list, { id: nextId, date: lastDate, value: "" }];
    });
    setCopied(false);
  };

  const removeReading = (id) => {
    setReadings((list) => (list.length <= 1 ? list : list.filter((reading) => reading.id !== id)));
    setCopied(false);
  };

  const switchUnit = (nextUnit) => {
    setUnit(nextUnit);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "HbA1c progress",
      `Target: ${result.targetPercent}% (${result.targetMmol} mmol/mol, eAG ${result.targetEagMgDl} mg/dL)`,
      `Latest: ${result.latest.date} — ${result.latest.percent}% (${result.latest.mmol} mmol/mol, eAG ${result.latest.eagMgDl} mg/dL)`,
      `Baseline: ${result.baseline.date} — ${result.baseline.percent}%`,
      `Change since baseline: ${result.totalChange > 0 ? "+" : ""}${result.totalChange} percentage points over ${result.spanDays} days`,
      result.atGoal
        ? "At or below target."
        : `Still ${result.distanceToTarget} percentage points above target (${result.progressPct}% of the way there).`,
      result.slopePerMonth === null
        ? ""
        : `Trend: ${result.slopePerMonth > 0 ? "+" : ""}${result.slopePerMonth} percentage points per month`,
      result.projectedTargetDate ? `On this trend, target reached around ${result.projectedTargetDate}` : "",
      `Suggested next test: ${result.nextTestDate}`,
    ]
      .filter(Boolean)
      .join("\n");
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
    setReadings(START_READINGS);
    setUnit("percent");
    setTarget(String(ADA_GENERAL_TARGET_PERCENT));
    setCopied(false);
  };

  const chartX = (x) => CHART_PAD + x * (CHART_WIDTH - CHART_PAD * 2);
  const chartY = (y) => CHART_PAD + y * (CHART_HEIGHT - CHART_PAD * 2);
  const polyline = hasError
    ? ""
    : result.chart.points.map((point) => `${chartX(point.x)},${chartY(point.y)}`).join(" ");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LineChart className="h-4 w-4" aria-hidden="true" />
          Diabetes support
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          HbA1c Goal Progress Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your HbA1c results and the target you agreed with your clinician. You get the trend,
          how far along you are, estimated average glucose for each result, and both units side by
          side.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="a1c-unit">
              Unit
            </label>
            <select
              id="a1c-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => switchUnit(event.target.value)}
            >
              {UNITS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="a1c-target">
              Your agreed target ({unitShort})
            </label>
            <input
              id="a1c-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={unit === "mmol" ? "9" : "3"}
              step={unit === "mmol" ? "1" : "0.1"}
              value={target}
              onChange={(event) => {
                setTarget(event.target.value);
                setCopied(false);
              }}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Targets are individualised. Below 7% (53 mmol/mol) is a common general target for
              non-pregnant adults with diabetes, but yours may differ.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your results</h2>
        <div className="mt-4 space-y-4">
          {readings.map((reading, index) => (
            <div key={reading.id} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`a1c-date-${reading.id}`}>
                  Test date {index + 1}
                </label>
                <input
                  id={`a1c-date-${reading.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="date"
                  value={reading.date}
                  onChange={(event) => updateReading(reading.id, "date", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`a1c-value-${reading.id}`}>
                  Result ({unitShort})
                </label>
                <input
                  id={`a1c-value-${reading.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min={unit === "mmol" ? "9" : "3"}
                  step={unit === "mmol" ? "1" : "0.1"}
                  value={reading.value}
                  onChange={(event) => updateReading(reading.id, "value", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeReading(reading.id)}
                className={GHOST_BTN}
                aria-label={`Remove result ${index + 1}`}
                disabled={readings.length <= 1}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={addReading} className={GHOST_BTN} aria-label="Add another result">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a result
          </button>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the HbA1c progress summary"
            className={GHOST_BTN}
            disabled={hasError}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy summary"}
          </button>
          <button type="button" onClick={reset} aria-label="Reset the tracker" className={PRIMARY_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Latest HbA1c
        </p>
        <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
          {hasError ? DASH : `${result.latest.percent}%`}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {show(
            `${result.latest.mmol} mmol/mol on ${result.latest.date} · ${result.atGoal ? "at or below target" : `${result.distanceToTarget} points above target`}`,
          )}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Your target", show(`${result.targetPercent}% (${result.targetMmol} mmol/mol)`)],
            [
              "Estimated average glucose now",
              show(`${result.latest.eagMgDl} mg/dL · ${result.latest.eagMmolL} mmol/L`),
            ],
            ["Estimated average glucose at target", show(`${result.targetEagMgDl} mg/dL · ${result.targetEagMmolL} mmol/L`)],
            [
              "Change since your first result",
              show(`${result.totalChange > 0 ? "+" : ""}${result.totalChange} points over ${result.spanDays} days`),
            ],
            ["Progress towards target", show(`${result.progressPct}%`)],
            [
              "Trend",
              hasError
                ? DASH
                : result.slopePerMonth === null
                  ? "Add a second result to see a trend"
                  : `${result.slopePerMonth > 0 ? "+" : ""}${result.slopePerMonth} points per month`,
            ],
            [
              "On this trend, target reached",
              hasError
                ? DASH
                : result.atGoal
                  ? "Already there"
                  : result.projectedTargetDate
                    ? `${result.projectedTargetDate} (about ${result.monthsToTarget} months)`
                    : "No downward trend to project from",
            ],
            ["Suggested next test", show(`${result.nextTestDate} (${result.retestDays} days on)`)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${result.progressPct}% of the way from your first result to your target`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.progressPct))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              From {result.baseline.percent}% on {result.baseline.date} towards {result.targetPercent}%
            </p>
          </div>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Results over time</h2>
          <div className="mt-3 overflow-x-auto">
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="h-48 w-full min-w-[320px]"
              role="img"
              aria-label={`Line chart of ${result.readingCount} HbA1c results from ${result.baseline.percent}% down to ${result.latest.percent}% against a ${result.targetPercent}% target`}
            >
              <line
                x1={CHART_PAD}
                x2={CHART_WIDTH - CHART_PAD}
                y1={chartY(result.chart.targetY)}
                y2={chartY(result.chart.targetY)}
                stroke="var(--success)"
                strokeWidth="2"
                strokeDasharray="6 5"
              />
              {result.chart.points.length > 1 && (
                <polyline
                  points={polyline}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
              {result.chart.points.map((point) => (
                <circle
                  key={point.id}
                  cx={chartX(point.x)}
                  cy={chartY(point.y)}
                  r="5"
                  fill={point.atTarget ? "var(--success)" : "var(--primary)"}
                />
              ))}
            </svg>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Dashed line is your {result.targetPercent}% target. Scale runs from{" "}
            {result.chart.minValue}% to {result.chart.maxValue}%.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">%</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">mmol/mol</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">eAG mg/dL</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">vs previous</th>
                  <th scope="col" className="py-2 text-right font-semibold">Band</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.date}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{row.percent}</td>
                    <td className="py-2 pr-3 text-right">{row.mmol}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{row.eagMgDl}</td>
                    <td
                      className={`py-2 pr-3 text-right ${row.changeFromPrevious !== null && row.changeFromPrevious < 0 ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}
                    >
                      {row.changeFromPrevious === null
                        ? "—"
                        : `${row.changeFromPrevious > 0 ? "+" : ""}${row.changeFromPrevious}`}
                    </td>
                    <td className="py-2 text-right text-xs text-[var(--muted-foreground)]">
                      {row.bandLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not a substitute for your care team. HbA1c reflects roughly the last{" "}
        {HBA1C_WINDOW_DAYS} days of average glucose, and it can be misleading in anaemia, recent
        blood loss or transfusion, pregnancy, kidney disease and some haemoglobin variants. Discuss
        your target, your results and any medication change with your doctor or diabetes team.
      </p>
    </main>
  );
}
