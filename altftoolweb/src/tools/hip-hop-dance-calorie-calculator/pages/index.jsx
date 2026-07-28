"use client";

import { useMemo, useState } from "react";
import { BoomBox, Check, Copy, RotateCcw } from "lucide-react";

import { HIP_HOP_STYLES, computeHipHopBurn } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const show = (value, formatter = NUM0) =>
  Number.isFinite(value) ? formatter.format(value) : DASH;

const DEFAULTS = {
  weight: "62",
  weightUnit: "kg",
  sessionMinutes: "90",
  styleId: "choreo",
  runs: "12",
  runSeconds: "90",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState(DEFAULTS.weightUnit);
  const [sessionMinutes, setSessionMinutes] = useState(DEFAULTS.sessionMinutes);
  const [styleId, setStyleId] = useState(DEFAULTS.styleId);
  const [runs, setRuns] = useState(DEFAULTS.runs);
  const [runSeconds, setRunSeconds] = useState(DEFAULTS.runSeconds);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeHipHopBurn({
        weight: toNumber(weight),
        weightUnit,
        sessionMinutes: toNumber(sessionMinutes),
        styleId,
        runs: toNumber(runs),
        runSeconds: toNumber(runSeconds),
      }),
    [weight, weightUnit, sessionMinutes, styleId, runs, runSeconds],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Hip Hop Dance Calorie Estimate",
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Session: ${sessionMinutes} min (${result.fullOutMinutes} min full out, ${result.markingMinutes} min marking)`,
      `Style: ${result.styleLabel} — ${result.met} MET`,
      `Total calories: ${NUM0.format(result.grossKcal)} kcal`,
      `Net of resting metabolism: ${NUM0.format(result.netKcal)} kcal`,
      `Per run-through: ${NUM1.format(result.kcalPerRun)} kcal`,
      `Non-stop rate: ${NUM0.format(result.kcalPerHour)} kcal/hour`,
    ].join("\n");
  }, [hasError, result, sessionMinutes]);

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
    setWeightUnit(DEFAULTS.weightUnit);
    setSessionMinutes(DEFAULTS.sessionMinutes);
    setStyleId(DEFAULTS.styleId);
    setRuns(DEFAULTS.runs);
    setRunSeconds(DEFAULTS.runSeconds);
    setCopied(false);
  };

  const rows = [
    ["From full-out run-throughs", hasError ? DASH : `${show(result.fullOutKcal)} kcal`],
    ["From marking and learning", hasError ? DASH : `${show(result.markingKcal)} kcal`],
    ["Net of resting metabolism", hasError ? DASH : `${show(result.netKcal)} kcal`],
    ["Calories per run-through", hasError ? DASH : `${show(result.kcalPerRun, NUM1)} kcal`],
    ["Rate at full out", hasError ? DASH : `${show(result.kcalPerMinute, NUM2)} kcal/min`],
    ["Non-stop hour of this style", hasError ? DASH : `${show(result.kcalPerHour)} kcal`],
    ["Minutes at full out", hasError ? DASH : `${show(result.fullOutMinutes, NUM1)} min`],
    ["Share of session at full out", hasError ? DASH : `${show(result.fullOutSharePercent)}%`],
    ["Average MET across the session", hasError ? DASH : show(result.averageMet, NUM2)],
    ["Body-fat equivalent", hasError ? DASH : `${show(result.fatGramsEquivalent, NUM1)} g`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BoomBox className="h-4 w-4" aria-hidden="true" />
          Dance calories
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Hip Hop Dance Calorie Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Most of a choreography session is marking, counting and waiting for the next eight. Enter
          how many times you actually ran the piece full out and this splits the session into the two
          intensities instead of averaging everything as dance.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hiphop-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="hiphop-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="25"
                step="0.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                aria-label="Weight unit"
                className={`${INPUT_CLASS} w-24`}
                value={weightUnit}
                onChange={(event) => setWeightUnit(event.target.value)}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="hiphop-session">
              Total studio time (minutes)
            </label>
            <input
              id="hiphop-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="480"
              step="5"
              value={sessionMinutes}
              onChange={(event) => setSessionMinutes(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hiphop-style">
              What the routine demands
            </label>
            <select
              id="hiphop-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={styleId}
              onChange={(event) => setStyleId(event.target.value)}
            >
              {HIP_HOP_STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.met} MET)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="hiphop-runs">
              Full-out run-throughs
            </label>
            <input
              id="hiphop-runs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="1"
              value={runs}
              onChange={(event) => setRuns(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="hiphop-runsecs">
              Length of one run (seconds)
            </label>
            <input
              id="hiphop-runsecs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="600"
              step="5"
              value={runSeconds}
              onChange={(event) => setRunSeconds(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[45, 60, 90, 120].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setSessionMinutes(String(preset))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} min
            </button>
          ))}
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
              Calories for the session
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${show(result.grossKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see an estimate."
                : `${show(result.fullOutMinutes, NUM1)} min full out, ${show(result.markingMinutes, NUM1)} min marking`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy hip hop calorie result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.basis} Marking time is priced at 2.8 MET.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">This session at each intensity</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Style
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  MET
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Session total
                </th>
              </tr>
            </thead>
            <tbody>
              {HIP_HOP_STYLES.map((item) => {
                const row = computeHipHopBurn({
                  weight: toNumber(weight),
                  weightUnit,
                  sessionMinutes: toNumber(sessionMinutes),
                  styleId: item.id,
                  runs: toNumber(runs),
                  runSeconds: toNumber(runSeconds),
                });
                return (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{item.label}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{item.met}</td>
                    <td className="py-2 text-right">
                      {row.error ? DASH : `${show(row.grossKcal)} kcal`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Floor work, freezes and power moves are anaerobic bursts that MET tables
        handle poorly, so breaking sessions in particular can land well outside this range. General
        information, not medical or dietary advice.
      </p>
    </main>
  );
}
