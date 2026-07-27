"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shirt } from "lucide-react";

import {
  MENS_NECK_CHART,
  MENS_SIZE_CHART,
  MENS_SYSTEMS,
  WOMENS_SIZE_CHART,
  WOMENS_SYSTEMS,
  convertClothingSize,
  neckSizeFor,
} from "../lib";

const DEFAULTS = {
  chart: "women",
  mode: "label",
  system: "us",
  target: "eu",
  label: "6",
  measurement: "88",
  unit: "cm",
  neck: "39",
  neckUnit: "cm",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const n1 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [chart, setChart] = useState(DEFAULTS.chart);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [system, setSystem] = useState(DEFAULTS.system);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [label, setLabel] = useState(DEFAULTS.label);
  const [measurement, setMeasurement] = useState(DEFAULTS.measurement);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [neck, setNeck] = useState(DEFAULTS.neck);
  const [neckUnit, setNeckUnit] = useState(DEFAULTS.neckUnit);
  const [copied, setCopied] = useState(false);

  const systems = chart === "men" ? MENS_SYSTEMS : WOMENS_SYSTEMS;
  const table = chart === "men" ? MENS_SIZE_CHART : WOMENS_SIZE_CHART;
  const activeSystem = systems.some((entry) => entry.key === system) ? system : systems[0].key;
  const activeTarget = systems.some((entry) => entry.key === target) ? target : systems[1].key;

  const result = useMemo(
    () =>
      convertClothingSize({
        chart,
        mode,
        system: activeSystem,
        label,
        measurement: Number(String(measurement).trim()),
        unit,
      }),
    [chart, mode, activeSystem, label, measurement, unit],
  );

  const collar = useMemo(
    () => neckSizeFor({ measurement: Number(String(neck).trim()), unit: neckUnit }),
    [neck, neckUnit],
  );

  const ok = !result.error;
  const targetLabel = systems.find((entry) => entry.key === activeTarget)?.label ?? "";

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [chart === "men" ? "Men's size conversion" : "Women's size conversion"];
    for (const entry of result.equivalents) {
      lines.push(`${entry.label}: ${entry.value}`);
    }
    lines.push(
      `${chart === "men" ? "Chest" : "Bust"} on this row: ${n1.format(result.measurementCm)} cm (${n1.format(result.measurementIn)} in)`,
    );
    if (result.advice) lines.push(result.advice);
    return lines.join("\n");
  }, [ok, chart, result]);

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
    setChart(DEFAULTS.chart);
    setMode(DEFAULTS.mode);
    setSystem(DEFAULTS.system);
    setTarget(DEFAULTS.target);
    setLabel(DEFAULTS.label);
    setMeasurement(DEFAULTS.measurement);
    setUnit(DEFAULTS.unit);
    setNeck(DEFAULTS.neck);
    setNeckUnit(DEFAULTS.neckUnit);
    setCopied(false);
  };

  const switchChart = (next) => {
    setChart(next);
    const nextSystems = next === "men" ? MENS_SYSTEMS : WOMENS_SYSTEMS;
    setSystem(nextSystems[0].key);
    setTarget(nextSystems[1].key);
    setLabel(String((next === "men" ? MENS_SIZE_CHART : WOMENS_SIZE_CHART)[3][nextSystems[0].key]));
    setMeasurement(next === "men" ? "100" : "88");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Shirt className="h-4 w-4" aria-hidden="true" />
          Shopping abroad
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Clothing Size Converter for Shopping Abroad</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Start from the size on your label or from your own measurements, and read the equivalent in
          US, UK, EU, French, Italian and Japanese sizing.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="size-chart">
              Size chart
            </label>
            <select
              id="size-chart"
              className={`mt-2 ${INPUT_CLASS}`}
              value={chart}
              onChange={(event) => switchChart(event.target.value)}
            >
              <option value="women">Women's dresses and tops</option>
              <option value="men">Men's jackets, suits and tops</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="size-mode">
              Start from
            </label>
            <select
              id="size-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="label">A size I already know</option>
              <option value="measurement">My body measurement</option>
            </select>
          </div>

          {mode === "label" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="size-system">
                  That size is in
                </label>
                <select
                  id="size-system"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={activeSystem}
                  onChange={(event) => setSystem(event.target.value)}
                >
                  {systems.map((entry) => (
                    <option key={entry.key} value={entry.key}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="size-label">
                  Size
                </label>
                <select
                  id="size-label"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                >
                  {table.map((row) => (
                    <option key={`${row.eu}-${row[activeSystem]}`} value={String(row[activeSystem])}>
                      {row[activeSystem]}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="size-measurement">
                  {chart === "men" ? "Chest measurement" : "Bust measurement"}
                </label>
                <input
                  id="size-measurement"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={measurement}
                  onChange={(event) => setMeasurement(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="size-unit">
                  Measured in
                </label>
                <select
                  id="size-unit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                >
                  <option value="cm">Centimetres</option>
                  <option value="in">Inches</option>
                </select>
              </div>
            </>
          )}

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="size-target">
              I am shopping in
            </label>
            <select
              id="size-target"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activeTarget}
              onChange={(event) => setTarget(event.target.value)}
            >
              {systems.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {result.error && (
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
              Ask for size ({targetLabel})
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
              {ok ? result.row[activeTarget] : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Fits a ${chart === "men" ? "chest" : "bust"} of about ${n1.format(result.measurementCm)} cm (${n1.format(result.measurementIn)} in)`
                : "Fix the input above to see the equivalent size."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the converted clothing size" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && result.advice && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.advice}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(ok ? result.equivalents : systems.map((entry) => ({ ...entry, value: DASH }))).map((entry) => (
            <div key={entry.key} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{entry.label}</dt>
              <dd className="text-right font-semibold">{entry.value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">
              {chart === "men" ? "Chest on this row" : "Bust on this row"}
            </dt>
            <dd className="text-right font-semibold">
              {ok ? `${n1.format(result.measurementCm)} cm / ${n1.format(result.measurementIn)} in` : DASH}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Waist on this row</dt>
            <dd className="text-right font-semibold">{ok ? `${n1.format(result.row.waistCm)} cm` : DASH}</dd>
          </div>
        </dl>
      </section>

      {chart === "men" && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Shirt collar size</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="size-neck">
                Neck measurement
              </label>
              <input
                id="size-neck"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={neck}
                onChange={(event) => setNeck(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="size-neck-unit">
                Measured in
              </label>
              <select
                id="size-neck-unit"
                className={`mt-2 ${INPUT_CLASS}`}
                value={neckUnit}
                onChange={(event) => setNeckUnit(event.target.value)}
              >
                <option value="cm">Centimetres</option>
                <option value="in">Inches</option>
              </select>
            </div>
          </div>
          {collar.error ? (
            <p
              role="alert"
              className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {collar.error}
            </p>
          ) : (
            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Ask for a <span className="font-semibold text-[var(--foreground)]">{collar.row.neckCm} cm</span> collar in
              Europe, <span className="font-semibold text-[var(--foreground)]">{collar.row.neckIn}"</span> in the UK, US
              or India — letter size {collar.row.intl}.
            </p>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Full chart</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                {systems.map((entry) => (
                  <th key={entry.key} scope="col" className="py-2 pr-3 font-semibold">
                    {entry.label.split(" (")[0]}
                  </th>
                ))}
                <th scope="col" className="py-2 text-right font-semibold">
                  {chart === "men" ? "Chest cm" : "Bust cm"}
                </th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr
                  key={row.eu}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    ok && row.eu === result.row.eu ? "bg-[var(--muted)]" : ""
                  }`}
                >
                  {systems.map((entry) => (
                    <td key={entry.key} className="py-2 pr-3">
                      {row[entry.key]}
                    </td>
                  ))}
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {chart === "men" ? row.chestCm : row.bustCm}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {chart === "men" && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Collar sizes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Neck cm</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Neck inches</th>
                  <th scope="col" className="py-2 font-semibold">Letter</th>
                </tr>
              </thead>
              <tbody>
                {MENS_NECK_CHART.map((row) => (
                  <tr key={row.neckCm} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.neckCm}</td>
                    <td className="py-2 pr-3">{row.neckIn}"</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{row.intl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Clothing sizes are labels, not units. Vanity sizing means a single brand can run one to two
        sizes away from any published chart, and cut varies far more than the number does. Measure
        yourself, compare against the shop's own size guide, and check the return policy before
        buying abroad.
      </p>
    </main>
  );
}
