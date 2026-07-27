"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Grid3x3, RotateCcw } from "lucide-react";

import { GITHUB_MATRIX_JOB_LIMIT, estimateMatrix } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  dimensionsText: "os: ubuntu-latest, windows-latest, macos-latest\nnode: 18, 20, 22",
  includeCount: "0",
  excludeCount: "2",
  avgJobMinutes: "5",
  maxParallel: "0",
  runsPerDay: "10",
};

const DASH = "—";
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const result = useMemo(
    () =>
      estimateMatrix({
        dimensionsText: form.dimensionsText,
        includeCount: form.includeCount.trim() === "" ? 0 : Number(form.includeCount),
        excludeCount: form.excludeCount.trim() === "" ? 0 : Number(form.excludeCount),
        avgJobMinutes: form.avgJobMinutes.trim() === "" ? Number.NaN : Number(form.avgJobMinutes),
        maxParallel: form.maxParallel.trim() === "" ? 0 : Number(form.maxParallel),
        runsPerDay: form.runsPerDay.trim() === "" ? 0 : Number(form.runsPerDay),
      }),
    [form],
  );
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    const text = [
      "CI build matrix estimate",
      ...result.dimensions.map((dimension) => `${dimension.name}: ${dimension.count} values`),
      `Cartesian product: ${NUM.format(result.product)}`,
      `Jobs per run (product - ${result.excludes} excludes + ${result.includes} includes): ${NUM.format(result.jobs)}`,
      `GitHub 256-job limit: ${result.withinGithubLimit ? "OK" : "EXCEEDED"}`,
      `Runner minutes per run: ${NUM.format(result.minutesPerRun)}`,
      `Wall-clock per run (${result.effectiveParallel} parallel): ${NUM.format(result.wallClockMinutes)} min`,
      `Minutes per day: ${NUM.format(result.minutesPerDay)}`,
      `Minutes per 30-day month: ${NUM.format(result.minutesPerMonth)}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Grid3x3 className="h-4 w-4" aria-hidden="true" />
          CI / CD
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          CI Build Matrix Explosion Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A matrix multiplies every dimension — 3 OSes x 3 Node versions x 2 databases is already 18
          jobs. See the real job count, minutes and wall-clock time before you commit the YAML.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="mx-dims">
          Matrix dimensions (one per line: name: value, value, …)
        </label>
        <textarea
          id="mx-dims"
          rows={4}
          spellCheck={false}
          className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          value={form.dimensionsText}
          onChange={set("dimensionsText")}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mx-exclude">
              Excluded combinations
            </label>
            <input
              id="mx-exclude"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.excludeCount}
              onChange={set("excludeCount")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mx-include">
              Include entries adding new combos
            </label>
            <input
              id="mx-include"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.includeCount}
              onChange={set("includeCount")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mx-minutes">
              Average job duration (minutes)
            </label>
            <input
              id="mx-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="360"
              step="0.5"
              value={form.avgJobMinutes}
              onChange={set("avgJobMinutes")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mx-parallel">
              max-parallel (0 = unlimited)
            </label>
            <input
              id="mx-parallel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.maxParallel}
              onChange={set("maxParallel")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mx-runs">
              Workflow runs per day
            </label>
            <input
              id="mx-runs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.runsPerDay}
              onChange={set("runsPerDay")}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      {!hasError && result.warnings.length > 0 ? (
        <ul className="mt-6 space-y-1 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
          {result.warnings.map((warning) => (
            <li key={warning} className={warning.includes("FAIL") ? "font-semibold text-[var(--danger)]" : ""}>
              {warning}
            </li>
          ))}
        </ul>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Jobs per workflow run
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !hasError && !result.withinGithubLimit ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {hasError ? DASH : NUM.format(result.jobs)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.dimensions.map((dimension) => dimension.count).join(" x ")} = ${NUM.format(result.product)} combinations, minus ${result.excludes} excluded, plus ${result.includes} added — GitHub allows ${GITHUB_MATRIX_JOB_LIMIT}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the matrix estimate breakdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Runner minutes per run",
              hasError ? DASH : `${NUM.format(result.minutesPerRun)} min`,
            ],
            [
              "Wall-clock per run",
              hasError
                ? DASH
                : `${NUM.format(result.wallClockMinutes)} min (${NUM.format(result.effectiveParallel)} jobs in parallel)`,
            ],
            ["Runner minutes per day", hasError ? DASH : `${NUM.format(result.minutesPerDay)} min`],
            [
              "Runner minutes per 30-day month",
              hasError ? DASH : `${NUM.format(result.minutesPerMonth)} min`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Dimension
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Values
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.dimensions.map((dimension) => (
                  <tr key={dimension.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-mono font-semibold">{dimension.name}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{dimension.values.join(", ")}</td>
                    <td className="py-2 text-right font-semibold">{dimension.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A matrix builds the cartesian product of its dimensions; exclude removes combinations and
        non-matching include entries add them. GitHub fails any workflow whose matrix exceeds 256
        jobs, and GitLab caps parallel:matrix at 200. Wall-clock assumes equal-length jobs running
        in waves of max-parallel.
      </p>
    </main>
  );
}
