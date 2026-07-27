"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  CPHEEO_LPCD_WITH_SEWERAGE,
  METER_UNITS,
  analyseWaterReadings,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const SIGNED = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULT_READINGS = [
  { id: 1, date: "2026-01-01", value: "1200" },
  { id: 2, date: "2026-02-01", value: "1215" },
  { id: 3, date: "2026-03-01", value: "1230.5" },
  { id: 4, date: "2026-04-01", value: "1252" },
];

const DEFAULT_SETTINGS = {
  household: "4",
  unit: "kl",
  tariff: "25",
  fixed: "60",
  benchmark: String(CPHEEO_LPCD_WITH_SEWERAGE),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_READINGS);
  const [nextId, setNextId] = useState(DEFAULT_READINGS.length + 1);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseWaterReadings({
        readings: rows.map((row) => ({ date: row.date, value: toNum(row.value) })),
        householdSize: toNum(settings.household),
        unit: settings.unit,
        tariffPerUnit: toNum(settings.tariff),
        fixedMonthlyCharge: toNum(settings.fixed),
        benchmarkLpcd: toNum(settings.benchmark),
      }),
    [rows, settings],
  );

  const hasError = Boolean(result.error);
  const unitLabel = hasError ? "" : result.unitLabel;

  const updateRow = (id, key, value) =>
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const addRow = () => {
    setRows((prev) => [...prev, { id: nextId, date: "", value: "" }]);
    setNextId((n) => n + 1);
  };

  const removeRow = (id) =>
    setRows((prev) => (prev.length <= 2 ? prev : prev.filter((row) => row.id !== id)));

  const rowsOut = hasError
    ? [
        ["Total consumption", DASH],
        ["Days covered", DASH],
        ["Average litres per day", DASH],
        ["Litres per person per day", DASH],
        ["Against the benchmark", DASH],
        ["Latest period", DASH],
        ["Change against your median", DASH],
        ["Trend", DASH],
        ["Projected use per 30 days", DASH],
        ["Projected monthly bill", DASH],
        ["Cost of the logged periods", DASH],
      ]
    : [
        ["Total consumption", `${num2(result.totalUnits)} ${unitLabel}`],
        ["Days covered", `${num1(result.totalDays)} days`],
        ["Average litres per day", `${num1(result.avgLitresPerDay)} L`],
        ["Litres per person per day", `${num1(result.avgLpcd)} lpcd`],
        [
          "Against the benchmark",
          `${num1(result.benchmarkRatio * 100)}% of ${num1(result.benchmarkLpcd)} lpcd`,
        ],
        ["Latest period", `${num1(result.latest.litresPerDay)} L per day`],
        [
          "Change against your median",
          result.changePct === null ? "not enough history" : `${SIGNED.format(result.changePct)}%`,
        ],
        ["Trend", result.trend],
        ["Projected use per 30 days", `${num2(result.projectedMonthlyUnits)} ${unitLabel}`],
        ["Projected monthly bill", money(result.projectedMonthlyCost)],
        ["Cost of the logged periods", money(result.totalCost)],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Water Meter Reading Tracker",
      `Average use: ${num1(result.avgLitresPerDay)} litres per day (${num1(result.avgLpcd)} lpcd)`,
      ...rowsOut.map(([label, value]) => `${label}: ${value}`),
      "",
      ...result.periods.map(
        (p) =>
          `${p.from} to ${p.to}: ${num2(p.consumedUnits)} ${unitLabel} over ${num1(p.days)} days = ${num1(p.litresPerDay)} L/day (${num1(p.lpcd)} lpcd)`,
      ),
      ...result.leakSignals.map((s) => `Check: ${s}`),
    ].join("\n");
  }, [hasError, result, rowsOut, unitLabel]);

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
    setRows(DEFAULT_READINGS);
    setNextId(DEFAULT_READINGS.length + 1);
    setSettings(DEFAULT_SETTINGS);
    setCopied(false);
  };

  const settingFields = [
    ["wmt-household", "People in the household", "household", "1"],
    ["wmt-tariff", `Tariff (₹ per unit)`, "tariff", "0.5"],
    ["wmt-fixed", "Fixed monthly charge (₹)", "fixed", "10"],
    ["wmt-benchmark", "Benchmark (litres per person per day)", "benchmark", "5"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Meter log
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Water Meter Reading Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two readings and the dates between them are enough to know your litres per day, your
          litres per person, and whether the floor of your consumption has quietly moved up.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="mb-4">
          <label className={LABEL_CLASS} htmlFor="wmt-unit">
            Meter unit
          </label>
          <select
            id="wmt-unit"
            className={`mt-2 ${INPUT_CLASS}`}
            value={settings.unit}
            onChange={(e) => setSettings((prev) => ({ ...prev, unit: e.target.value }))}
          >
            {METER_UNITS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {settingFields.map(([id, label, key, step]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={settings[key]}
                onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
            Readings, oldest first
          </h2>
          <div className="mt-3 grid gap-4">
            {rows.map((row, index) => (
              <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`wmt-date-${row.id}`}>
                    Reading {index + 1} date
                  </label>
                  <input
                    id={`wmt-date-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.date}
                    onChange={(e) => updateRow(row.id, "date", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`wmt-value-${row.id}`}>
                    Meter value
                  </label>
                  <input
                    id={`wmt-value-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.001"
                    value={row.value}
                    onChange={(e) => updateRow(row.id, "value", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 2}
                  aria-label={`Remove reading ${index + 1}`}
                  className={`${GHOST_BTN} w-full sm:w-auto disabled:opacity-40`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sm:hidden">Remove reading</span>
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addRow} className={`${GHOST_BTN} mt-4`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a reading
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Average use per day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${num1(result.avgLitresPerDay)} L`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the reading log above to see the analysis."
                : `${num1(result.avgLpcd)} litres per person per day across ${num1(result.totalDays)} logged days`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy water meter analysis"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the log" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError &&
          result.leakSignals.map((signal) => (
            <p
              key={signal}
              className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {signal}
            </p>
          ))}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rowsOut.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 overflow-x-auto rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
            Period by period
          </h2>
          <table className="mt-3 w-full min-w-[34rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  From
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  To
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Days
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Used ({unitLabel})
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  L / day
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  lpcd
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {result.periods.map((period) => (
                <tr key={`${period.from}-${period.to}`}>
                  <td className="py-2.5 pr-3">{period.from}</td>
                  <td className="py-2.5 pr-3">{period.to}</td>
                  <td className="py-2.5 pr-3 text-right">{num1(period.days)}</td>
                  <td className="py-2.5 pr-3 text-right">{num2(period.consumedUnits)}</td>
                  <td className="py-2.5 pr-3 text-right font-semibold">
                    {num1(period.litresPerDay)}
                  </td>
                  <td className="py-2.5 pr-3 text-right">{num1(period.lpcd)}</td>
                  <td className="py-2.5 text-right">{money(period.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Readings stay in your browser — nothing is uploaded. The leak test is a signal, not a
        diagnosis: confirm it by closing every outlet and watching whether the meter still moves.
        Tariffs are often slabbed rather than flat, so the projected bill is an approximation of
        your utility's own calculation.
      </p>
    </main>
  );
}
