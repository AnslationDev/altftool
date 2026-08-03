"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, TrendingDown, Trash2 } from "lucide-react";

import { WINDOW_OPTIONS, addDaysIso, kcalPerUnit, smoothWeighIns } from "../lib";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const int = (value) => (Number.isFinite(value) ? INT.format(value) : DASH);
const signed = (value) => (Number.isFinite(value) ? `${value > 0 ? "+" : ""}${NUM.format(value)}` : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE_WEIGHTS = [90.4, 90.1, 90.3, 89.8, 90.0, 89.6, 89.9, 89.4, 89.7, 89.2, 89.5, 89.0, 89.3, 88.9];
const SAMPLE_START = "2026-07-01";

const buildSample = () =>
  SAMPLE_WEIGHTS.map((weight, index) => ({
    date: addDaysIso(SAMPLE_START, index) || SAMPLE_START,
    weight: String(weight),
  }));

const CHART_WIDTH = 640;
const CHART_HEIGHT = 200;
const CHART_PADDING = 12;

export default function ToolHome() {
  const [rows, setRows] = useState(buildSample);
  const [windowSize, setWindowSize] = useState("7");
  const [units, setUnits] = useState("kg");
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const result = useMemo(
    () =>
      smoothWeighIns(
        // A cleared weight field is blank, not zero — coerce it to NaN so
        // lib.js's own Number.isFinite check reports "enter a number for
        // the weight" instead of silently treating it as 0 and failing the
        // (misleading) out-of-range check further down.
        rows.map((row) => ({ date: row.date, weight: row.weight === "" ? NaN : Number(row.weight) })),
        { window: Number(windowSize), units },
      ),
    [rows, windowSize, units],
  );

  const failed = Boolean(result.error);

  const updateRow = (index, patch) => {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((current) => {
      const last = current[current.length - 1];
      const nextDate = (last && addDaysIso(last.date, 1)) || SAMPLE_START;
      return [...current, { date: nextDate, weight: last ? last.weight : "" }];
    });
  };

  const removeRow = (index) => {
    setRows((current) => (current.length <= 2 ? current : current.filter((_, i) => i !== index)));
  };

  const reset = () => {
    if (!window.confirm("Reset every weigh-in? This will replace your logged readings with the sample two weeks and cannot be undone.")) {
      return;
    }
    setRows(buildSample());
    setWindowSize("7");
    setUnits("kg");
  };

  const chart = useMemo(() => {
    if (failed || result.series.length < 2) return null;
    const values = result.series.flatMap((row) => [row.weight, row.trend]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const innerWidth = CHART_WIDTH - CHART_PADDING * 2;
    const innerHeight = CHART_HEIGHT - CHART_PADDING * 2;
    const first = result.series[0];
    const last = result.series[result.series.length - 1];
    const lastOffset = last.dayOffset || 1;
    const toPoint = (row, value) => {
      const x = CHART_PADDING + (row.dayOffset / lastOffset) * innerWidth;
      const y = CHART_PADDING + innerHeight - ((value - min) / range) * innerHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    };
    return {
      raw: result.series.map((row) => toPoint(row, row.weight)).join(" "),
      trend: result.series.map((row) => toPoint(row, row.trend)).join(" "),
      min,
      max,
      firstTrend: first.trend,
      lastTrend: last.trend,
    };
  }, [failed, result]);

  const clipboardText = useMemo(() => {
    if (failed) return "";
    return [
      "Weigh-In Rolling Average",
      `${result.count} readings from ${result.firstDate} to ${result.lastDate} (${result.spanDays} days)`,
      `Latest trend weight: ${num(result.latestTrend)} ${result.units}`,
      `${result.window}-reading moving average: ${num(result.lastAverage)} ${result.units}`,
      `Weekly rate: ${signed(result.slopePerWeek)} ${result.units}/week`,
      `Implied energy balance: ${signed(result.kcalPerDay)} kcal/day`,
      `Raw spread across the period: ${num(result.rawRange)} ${result.units} (min ${num(result.minWeight)}, max ${num(result.maxWeight)})`,
      `Daily noise around the trend: ${num(result.noise)} ${result.units}`,
      `Trend fit (R squared): ${num(result.r2)}`,
      `Projection for ${result.projected30DayDate}: ${num(result.projected30Day)} ${result.units}`,
    ].join("\n");
  }, [failed, result]);

  const copyResult = () => copy("result", clipboardText, { label: "Weigh-in trend summary" });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingDown className="h-4 w-4" aria-hidden="true" />
          Trend tracking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Weigh-In Rolling Average Tool</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your daily weigh-ins and this returns a moving average, an exponentially weighted
          trend line, the least-squares weekly rate and the calorie balance that rate implies — so
          you judge progress on the line rather than on this morning&apos;s number.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wr-window">
              Averaging window (readings)
            </label>
            <select
              id="wr-window"
              className={`mt-2 ${INPUT_CLASS}`}
              value={windowSize}
              onChange={(event) => setWindowSize(event.target.value)}
            >
              {WINDOW_OPTIONS.map((option) => (
                <option key={option} value={String(option)}>
                  {option}-reading average
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wr-units">
              Units
            </label>
            <select
              id="wr-units"
              className={`mt-2 ${INPUT_CLASS}`}
              value={units}
              onChange={(event) => setUnits(event.target.value)}
            >
              <option value="kg">Kilograms</option>
              <option value="lb">Pounds</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Weigh-ins ({rows.length})</h2>
          <button type="button" onClick={addRow} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add reading
          </button>
        </div>

        <div className="mt-3 grid gap-3">
          {rows.map((row, index) => (
            <div key={`row-${index}-${row.date}`} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`wr-date-${index}`}>
                  Date
                </label>
                <input
                  id={`wr-date-${index}`}
                  type="date"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={row.date}
                  onChange={(event) => updateRow(index, { date: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`wr-weight-${index}`}>
                  Weight ({units})
                </label>
                <input
                  id={`wr-weight-${index}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={row.weight}
                  onChange={(event) => updateRow(index, { weight: event.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(index)}
                aria-label={`Remove reading ${index + 1}`}
                disabled={rows.length <= 2}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Weekly rate on the trend line
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${signed(result.slopePerWeek)} ${result.units}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the readings above to see the trend."
                : `per week across ${result.count} readings over ${result.spanDays} days — implies ${signed(result.kcalPerDay)} kcal/day`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the weigh-in trend summary" disabled={failed} className={`${GHOST_BTN} disabled:opacity-40`}>
              {isCopied("result") ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the sample two weeks" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
        <span aria-live="polite" role="status" className="sr-only">
          {announcement}
        </span>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Latest trend weight", failed ? DASH : `${num(result.latestTrend)} ${result.units}`],
            [
              failed ? "Latest reading average" : `Latest ${result.window}-reading average`,
              failed ? DASH : `${num(result.lastAverage)} ${result.units}`,
            ],
            ["This morning vs the trend", failed ? DASH : `${signed(result.scaleVsTrend)} ${result.units}`],
            ["Daily noise (1 std dev)", failed ? DASH : `${num(result.noise)} ${result.units}`],
            ["Raw high to low", failed ? DASH : `${num(result.maxWeight)} → ${num(result.minWeight)} (${num(result.rawRange)} spread)`],
            ["Trend fit, R squared", failed ? DASH : num(result.r2)],
            ["Implied energy balance", failed ? DASH : `${signed(result.kcalPerDay)} kcal/day`],
            [
              "If the trend holds for 30 days",
              failed ? DASH : `${num(result.projected30Day)} ${result.units} on ${result.projected30DayDate}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {chart && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Raw readings against the trend</h2>
          <div className="mt-3 overflow-x-auto">
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="h-48 w-full min-w-[320px]"
              role="img"
              aria-label={
                chart.lastTrend === chart.firstTrend
                  ? `Line chart of daily weigh-ins holding steady around ${num(chart.lastTrend)} ${result.units}, with a smoothed trend line`
                  : `Line chart of daily weigh-ins trending ${chart.lastTrend > chart.firstTrend ? "up" : "down"} from ${num(chart.firstTrend)} to ${num(chart.lastTrend)} ${result.units} on the smoothed trend line`
              }
            >
              <polyline
                points={chart.raw}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="1.5"
                strokeOpacity="0.55"
                strokeLinejoin="round"
              />
              <polyline
                points={chart.trend}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Thin line: what the scale said. Thick line: the exponentially weighted trend.
          </p>
        </section>
      )}

      {!failed && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Reading by reading</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Scale</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Average</th>
                    <th scope="col" className="py-2 text-right font-semibold">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {result.series.map((row) => (
                    <tr key={row.date} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.date}</td>
                      <td className="py-2 pr-3 text-right">{num(row.weight)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {num(row.movingAverage)}
                        {row.movingAverageComplete ? "" : "*"}
                      </td>
                      <td className="py-2 text-right font-semibold">{num(row.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              * partial average — fewer than {result.window} readings available at that point.
            </p>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Reading the trend</h2>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.notes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The calorie figure converts the weight trend at about{" "}
        {int(kcalPerUnit(units))} kcal per {units === "lb" ? "pound" : "kilogram"} and assumes the
        change is body tissue rather than fluid, so treat it as a rough cross-check on your food
        logging rather than a measurement.
      </p>
    </main>
  );
}
