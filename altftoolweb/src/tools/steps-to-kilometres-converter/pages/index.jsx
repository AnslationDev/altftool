"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";

import { WALK_PACES, stepsToDistance } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  steps: "10000",
  method: "height",
  sex: "female",
  heightCm: "170",
  stepLengthCm: "72",
  measuredDistanceM: "20",
  measuredSteps: "26",
  pace: "brisk",
  weightKg: "60",
};

const STEP_PRESETS = [2000, 5000, 7500, 10000];

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return String(raw).trim() === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [steps, setSteps] = useState(DEFAULTS.steps);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [stepLengthCm, setStepLengthCm] = useState(DEFAULTS.stepLengthCm);
  const [measuredDistanceM, setMeasuredDistanceM] = useState(DEFAULTS.measuredDistanceM);
  const [measuredSteps, setMeasuredSteps] = useState(DEFAULTS.measuredSteps);
  const [pace, setPace] = useState(DEFAULTS.pace);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      stepsToDistance({
        steps: toNumber(steps),
        method,
        sex,
        heightCm: toNumber(heightCm),
        stepLengthCm: toNumber(stepLengthCm),
        measuredDistanceM: toNumber(measuredDistanceM),
        measuredSteps: toNumber(measuredSteps),
        pace,
        weightKg: toNumber(weightKg),
      }),
    [steps, method, sex, heightCm, stepLengthCm, measuredDistanceM, measuredSteps, pace, weightKg],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `${NUM0.format(result.steps)} steps`,
      `= ${NUM2.format(result.kilometres)} km (${NUM2.format(result.miles)} miles)`,
      `Step length: ${NUM1.format(result.stepLengthCm)} cm — ${result.stepLengthSource}`,
      `Stride length: ${NUM1.format(result.strideLengthCm)} cm`,
      `Steps per km: ${NUM0.format(result.stepsPerKm)} · per mile: ${NUM0.format(result.stepsPerMile)}`,
    ];
    if (result.effort) {
      lines.push(`At ${result.effort.pace.label}: about ${NUM0.format(result.effort.minutes)} minutes`);
      if (result.effort.kcal !== null) lines.push(`Energy: about ${NUM0.format(result.effort.kcal)} kcal`);
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
    setSteps(DEFAULTS.steps);
    setMethod(DEFAULTS.method);
    setSex(DEFAULTS.sex);
    setHeightCm(DEFAULTS.heightCm);
    setStepLengthCm(DEFAULTS.stepLengthCm);
    setMeasuredDistanceM(DEFAULTS.measuredDistanceM);
    setMeasuredSteps(DEFAULTS.measuredSteps);
    setPace(DEFAULTS.pace);
    setWeightKg(DEFAULTS.weightKg);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Walking &amp; steps
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Steps to Kilometres Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Distance is steps multiplied by step length, so everything depends on getting that length
          right. Estimate it from your height, measure it over a known distance, or type in a figure
          you already trust.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sk-steps">
              Steps
            </label>
            <input
              id="sk-steps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="200000"
              step="100"
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sk-method">
              Step length from
            </label>
            <select
              id="sk-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              <option value="height">My height (estimate)</option>
              <option value="measured">A distance I measured (most accurate)</option>
              <option value="known">A step length I already know</option>
            </select>
          </div>

          {method === "height" && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="sk-sex">
                  Proportion to use
                </label>
                <select
                  id="sk-sex"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={sex}
                  onChange={(event) => setSex(event.target.value)}
                >
                  <option value="female">Women — 0.413 x height</option>
                  <option value="male">Men — 0.415 x height</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="sk-height">
                  Height (cm)
                </label>
                <input
                  id="sk-height"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="100"
                  max="250"
                  step="1"
                  value={heightCm}
                  onChange={(event) => setHeightCm(event.target.value)}
                />
              </div>
            </>
          )}

          {method === "measured" && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="sk-measured-distance">
                  Distance you walked (metres)
                </label>
                <input
                  id="sk-measured-distance"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  max="1000"
                  step="1"
                  value={measuredDistanceM}
                  onChange={(event) => setMeasuredDistanceM(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="sk-measured-steps">
                  Steps it took
                </label>
                <input
                  id="sk-measured-steps"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={measuredSteps}
                  onChange={(event) => setMeasuredSteps(event.target.value)}
                />
              </div>
            </>
          )}

          {method === "known" && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="sk-step-length">
                Step length (cm) — one foot strike, not a full stride
              </label>
              <input
                id="sk-step-length"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="20"
                max="150"
                step="0.5"
                value={stepLengthCm}
                onChange={(event) => setStepLengthCm(event.target.value)}
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="sk-pace">
              Walking pace (for time and energy)
            </label>
            <select
              id="sk-pace"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pace}
              onChange={(event) => setPace(event.target.value)}
            >
              {WALK_PACES.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sk-weight">
              Bodyweight (kg)
            </label>
            <input
              id="sk-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              step="0.5"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STEP_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setSteps(String(preset))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {NUM0.format(preset)} steps
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
              Distance covered
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${NUM2.format(result.kilometres)} km`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${NUM2.format(result.miles)} miles · ${NUM0.format(result.metres)} m · step length ${NUM1.format(result.stepLengthCm)} cm`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the step to distance conversion"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Step length", hasError ? dash : `${NUM1.format(result.stepLengthCm)} cm`],
            ["Stride length (two steps)", hasError ? dash : `${NUM1.format(result.strideLengthCm)} cm`],
            ["Based on", hasError ? dash : result.stepLengthSource],
            ["Steps in 1 km", hasError ? dash : NUM0.format(result.stepsPerKm)],
            ["Steps in 1 mile", hasError ? dash : NUM0.format(result.stepsPerMile)],
            [
              "Time at this pace",
              hasError || !result.effort ? dash : `${NUM0.format(result.effort.minutes)} minutes`,
            ],
            [
              "Energy used",
              hasError || !result.effort || result.effort.kcal === null
                ? dash
                : `about ${NUM0.format(result.effort.kcal)} kcal`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">At your step length</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Steps</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Kilometres</th>
                  <th scope="col" className="py-2 text-right font-semibold">Miles</th>
                </tr>
              </thead>
              <tbody>
                {result.reference.map((row) => (
                  <tr key={row.steps} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{NUM0.format(row.steps)}</td>
                    <td className="py-2 pr-3 text-right">{NUM2.format(row.kilometres)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{NUM2.format(row.miles)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How to measure your own step length</h2>
        <ol className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>1. Mark out a known distance — 20 metres on a track, corridor or pavement works well.</li>
          <li>2. Walk it at your normal pace, starting from a few steps back so you are already moving.</li>
          <li>3. Count every foot strike, left and right.</li>
          <li>4. Enter both numbers above. Repeat twice more and average if you want a tighter figure.</li>
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Step length is not fixed: it grows as you speed up and shortens on stairs,
        hills, sand and in a crowd, so a single figure will always be an approximation across a full
        day. Energy figures come from published MET values and are estimates, not measurements.
      </p>
    </main>
  );
}
