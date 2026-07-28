"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import {
  MOPPING_EFFORTS,
  MOPPING_LAYOUTS,
  computeMoppingCalories,
  toKilograms,
  toSquareMetres,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  weight: "60",
  unit: "kg",
  mode: "time",
  minutes: "30",
  area: "80",
  areaUnit: "m2",
  layout: "congested",
  effort: "moderate",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [area, setArea] = useState(DEFAULTS.area);
  const [areaUnit, setAreaUnit] = useState(DEFAULTS.areaUnit);
  const [layout, setLayout] = useState(DEFAULTS.layout);
  const [effort, setEffort] = useState(DEFAULTS.effort);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeMoppingCalories({
        weightKg: toKilograms(weight, unit),
        mode,
        minutes: Number(String(minutes).trim()),
        areaM2: toSquareMetres(area, areaUnit),
        layoutId: layout,
        effortId: effort,
      }),
    [weight, unit, mode, minutes, area, areaUnit, layout, effort],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Mopping Calorie Burn",
      `${result.effortLabel} (${result.met} MET)`,
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      result.areaM2 === null
        ? `Time mopping: ${NUM0.format(result.minutes)} min`
        : `Floor area: ${NUM0.format(result.areaM2)} m² (${result.layoutLabel}) — about ${NUM0.format(result.minutes)} min`,
      `Calories burned: ${NUM0.format(result.totalKcal)} kcal`,
      `Net of resting burn: ${NUM0.format(result.netKcal)} kcal`,
      `Rate: ${NUM0.format(result.kcalPerHour)} kcal/hour`,
    ].join("\n");
  }, [ok, result]);

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
    setWeight(DEFAULTS.weight);
    setUnit(DEFAULTS.unit);
    setMode(DEFAULTS.mode);
    setMinutes(DEFAULTS.minutes);
    setArea(DEFAULTS.area);
    setAreaUnit(DEFAULTS.areaUnit);
    setLayout(DEFAULTS.layout);
    setEffort(DEFAULTS.effort);
    setCopied(false);
  };

  const rows = [
    ["Time mopping", ok ? `${NUM0.format(result.minutes)} min` : DASH],
    ["Net of resting metabolism", ok ? `${NUM0.format(result.netKcal)} kcal` : DASH],
    ["Burn rate", ok ? `${NUM1.format(result.rate)} kcal/min` : DASH],
    ["Per hour of mopping", ok ? `${NUM0.format(result.kcalPerHour)} kcal/hour` : DASH],
    [
      "Calories per square metre",
      ok && result.kcalPerM2 !== null ? `${NUM2.format(result.kcalPerM2)} kcal/m²` : DASH,
    ],
    ["MET value used", ok ? `${result.met} MET` : DASH],
  ];

  const modeButton = (id, label) => (
    <button
      key={id}
      type="button"
      aria-pressed={mode === id}
      onClick={() => setMode(id)}
      className={`min-h-11 flex-1 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
        mode === id
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Household activity
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Mopping Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Mopping is rated at 3.5 METs — the same moderate-intensity band as brisk walking. Enter
          the minutes you spent, or the floor area you covered, and see what it cost you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex gap-2" role="group" aria-label="Choose how to describe the job">
          {modeButton("time", "I know the minutes")}
          {modeButton("area", "I know the floor area")}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="mp-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="20"
                step="0.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                id="mp-unit"
                aria-label="Weight unit"
                className={`${INPUT_CLASS} w-24`}
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mp-effort">
              How hard were you working?
            </label>
            <select
              id="mp-effort"
              className={`mt-2 ${INPUT_CLASS}`}
              value={effort}
              onChange={(event) => setEffort(event.target.value)}
            >
              {MOPPING_EFFORTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.met} MET)
                </option>
              ))}
            </select>
          </div>

          {mode === "time" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="mp-minutes">
                Minutes spent mopping
              </label>
              <input
                id="mp-minutes"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                step="5"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="mp-area">
                  Floor area mopped
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="mp-area"
                    className={INPUT_CLASS}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="5"
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                  />
                  <select
                    id="mp-area-unit"
                    aria-label="Area unit"
                    className={`${INPUT_CLASS} w-28`}
                    value={areaUnit}
                    onChange={(event) => setAreaUnit(event.target.value)}
                  >
                    <option value="m2">m²</option>
                    <option value="sqft">sq ft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="mp-layout">
                  Floor layout
                </label>
                <select
                  id="mp-layout"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={layout}
                  onChange={(event) => setLayout(event.target.value)}
                >
                  {MOPPING_LAYOUTS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Calories burned
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM0.format(result.totalKcal)} kcal` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.effortLabel} · about ${NUM0.format(result.minutes)} minutes`
                : "Fix the input above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy mopping calorie result"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
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

        {ok ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            MET source: {result.source}.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How long an area takes</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Area mode uses cleaning-industry damp-mopping production rates. They assume steady work
          with the bucket already filled.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Layout</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Sq ft / hour</th>
                <th scope="col" className="py-2 text-right font-semibold">m² / hour</th>
              </tr>
            </thead>
            <tbody>
              {MOPPING_LAYOUTS.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{item.label}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {NUM0.format(item.sqftPerHour)}
                  </td>
                  <td className="py-2 text-right">{NUM0.format(item.m2PerHour)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Production rates are planning averages and your own pace may be
        very different, especially with heavy soil or a small mop head. Speak to a doctor before
        counting housework towards a medically supervised activity target.
      </p>
    </main>
  );
}
