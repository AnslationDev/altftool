"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Triangle } from "lucide-react";

import { LAYERS, RATIO_PRESETS, planPyramid } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DEC2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  totalTests: "1000",
  unitPct: "70",
  integrationPct: "20",
  e2ePct: "10",
  unitSec: "0.05",
  integrationSec: "1",
  e2eSec: "30",
  unitFlake: "0.01",
  integrationFlake: "0.5",
  e2eFlake: "2",
  parallelWorkers: "4",
  costPerMinute: "0.008",
  runsPerDay: "20",
};

function formatDuration(totalSeconds) {
  if (totalSeconds < 60) return `${DEC.format(totalSeconds)} s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (minutes < 60) return `${minutes} min ${seconds} s`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const applyPreset = (preset) =>
    setForm((current) => ({
      ...current,
      unitPct: String(preset.unit),
      integrationPct: String(preset.integration),
      e2ePct: String(preset.e2e),
    }));

  const result = useMemo(
    () =>
      planPyramid({
        totalTests: form.totalTests,
        ratios: { unit: form.unitPct, integration: form.integrationPct, e2e: form.e2ePct },
        avgSeconds: { unit: form.unitSec, integration: form.integrationSec, e2e: form.e2eSec },
        flakePercents: {
          unit: form.unitFlake,
          integration: form.integrationFlake,
          e2e: form.e2eFlake,
        },
        parallelWorkers: form.parallelWorkers,
        costPerMinute: form.costPerMinute,
        runsPerDay: form.runsPerDay,
      }),
    [form],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Test pyramid plan",
      ...result.layers.map(
        (layer) => `${layer.label}: ${NUM.format(layer.count)} tests (${DEC.format(layer.percent)}%)`,
      ),
      `Wall-clock per CI run (${form.parallelWorkers} workers): ${formatDuration(result.wallClockSeconds)}`,
      `Billed minutes per run: ${DEC.format(result.billedMinutes)}`,
      `Cost per run: ${USD.format(result.costPerRun)} — monthly: ${USD.format(result.monthlyCost)}`,
      `Expected flaky failures per run: ${DEC2.format(result.expectedFlakesPerRun)}`,
      `Chance a run hits at least one flake: ${DEC.format(result.flakyRunProbability)}%`,
      `Shape: ${result.shape}`,
    ].join("\n");
  }, [hasError, result, form.parallelWorkers]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const layerFields = [
    ["Unit", "unitPct", "unitSec", "unitFlake"],
    ["Integration", "integrationPct", "integrationSec", "integrationFlake"],
    ["End-to-end", "e2ePct", "e2eSec", "e2eFlake"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Triangle className="h-4 w-4" aria-hidden="true" />
          Test strategy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Test Pyramid Ratio Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split a suite across unit, integration and end-to-end layers, then see what the mix
          really costs: wall-clock feedback time, billed CI minutes, monthly spend and how often a
          run will fail on flakes alone.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Suite shape</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {RATIO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-total">
              Total tests in the suite
            </label>
            <input
              id="tp-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.totalTests}
              onChange={(event) => set("totalTests", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-workers">
              Parallel CI workers
            </label>
            <input
              id="tp-workers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="512"
              step="1"
              value={form.parallelWorkers}
              onChange={(event) => set("parallelWorkers", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {layerFields.map(([label, pctKey, secKey, flakeKey]) => (
            <div key={label} className="rounded-lg border border-[var(--border)] p-3">
              <p className="text-sm font-semibold">{label}</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`tp-${pctKey}`}>
                    Share (%)
                  </label>
                  <input
                    id={`tp-${pctKey}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="1"
                    value={form[pctKey]}
                    onChange={(event) => set(pctKey, event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`tp-${secKey}`}>
                    Avg seconds / test
                  </label>
                  <input
                    id={`tp-${secKey}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={form[secKey]}
                    onChange={(event) => set(secKey, event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`tp-${flakeKey}`}>
                    Flake rate (%)
                  </label>
                  <input
                    id={`tp-${flakeKey}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form[flakeKey]}
                    onChange={(event) => set(flakeKey, event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-cost">
              CI cost per billed minute (USD)
            </label>
            <input
              id="tp-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              value={form.costPerMinute}
              onChange={(event) => set("costPerMinute", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-runs">
              CI runs per day
            </label>
            <input
              id="tp-runs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.runsPerDay}
              onChange={(event) => set("runsPerDay", event.target.value)}
            />
          </div>
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
              Wall-clock per CI run
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatDuration(result.wallClockSeconds)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the plan." : `${result.shape} — ${result.shapeNote}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the test pyramid plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Layer</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Tests</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Serial runtime</th>
                  <th scope="col" className="py-2 text-right font-semibold">Expected flakes / run</th>
                </tr>
              </thead>
              <tbody>
                {result.layers.map((layer) => (
                  <tr key={layer.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{layer.label}</td>
                    <td className="py-2 pr-3 text-right">
                      {NUM.format(layer.count)}{" "}
                      <span className="text-[var(--muted-foreground)]">
                        ({DEC.format(layer.percent)}%)
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">{formatDuration(layer.serialSeconds)}</td>
                    <td className="py-2 text-right">{DEC2.format(layer.expectedFlakes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Serial runtime (all tests back to back)", hasError ? DASH : formatDuration(result.serialSecondsTotal)],
            ["Billed CI minutes per run", hasError ? DASH : DEC.format(result.billedMinutes)],
            ["Cost per run", hasError ? DASH : USD.format(result.costPerRun)],
            [
              "Monthly CI cost (30 days)",
              hasError ? DASH : USD.format(result.monthlyCost),
            ],
            [
              "Chance a run fails on flakes alone",
              hasError ? DASH : `${DEC.format(result.flakyRunProbability)}%`,
            ],
            [
              "Share of runtime spent in E2E",
              hasError ? DASH : `${DEC.format(result.runtimeShareE2E)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The pyramid ratios are planning illustrations from the testing literature, not rules — the
        70/20/10 shape traces to Mike Cohn&apos;s Succeeding with Agile. Parallel workers shorten
        wall-clock time but CI providers bill per worker-minute, so parallelism does not reduce the
        bill. Flake maths assumes failures are independent.
      </p>
    </main>
  );
}
