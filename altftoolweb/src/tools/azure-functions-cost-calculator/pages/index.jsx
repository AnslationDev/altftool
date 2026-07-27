"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Zap } from "lucide-react";

import {
  EP1_MEMORY_GB,
  EP1_VCPU,
  FREE_EXECUTIONS,
  FREE_GB_SECONDS,
  PRICE_PER_GB_SECOND,
  PRICE_PER_MILLION_EXECUTIONS,
  computeAzureFunctionsCost,
} from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-US");

const money = (value) => USD.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  executions: "5000000",
  durationMs: "500",
  memoryMb: "512",
};

const DASH = "—";

export default function ToolHome() {
  const [executions, setExecutions] = useState(DEFAULTS.executions);
  const [durationMs, setDurationMs] = useState(DEFAULTS.durationMs);
  const [memoryMb, setMemoryMb] = useState(DEFAULTS.memoryMb);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeAzureFunctionsCost({
        executionsPerMonth: executions.trim() === "" ? Number.NaN : Number(executions),
        avgDurationMs: durationMs.trim() === "" ? Number.NaN : Number(durationMs),
        memoryMb: memoryMb.trim() === "" ? Number.NaN : Number(memoryMb),
      }),
    [executions, durationMs, memoryMb],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Azure Functions Consumption plan estimate (East US list prices)",
      `Executions: ${NUM.format(Number(executions))} (${NUM.format(result.billableExecutions)} billable)`,
      `GB-seconds: ${NUM.format(Math.round(result.totalGbSeconds))} (${NUM.format(Math.round(result.billableGbSeconds))} billable)`,
      `Execution cost: ${money(result.executionCost)}`,
      `GB-second cost: ${money(result.gbSecondCost)}`,
      `Consumption total: ${money(result.consumptionTotal)}`,
      `One EP1 Premium instance: ${money(result.premiumTotal)}`,
      `Cheaper plan: ${result.cheaperPlan === "consumption" ? "Consumption" : "Premium EP1"}`,
    ].join("\n");
  }, [hasError, result, executions]);

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
    setExecutions(DEFAULTS.executions);
    setDurationMs(DEFAULTS.durationMs);
    setMemoryMb(DEFAULTS.memoryMb);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Billed memory per execution", DASH],
        ["Billed duration per execution", DASH],
        ["Total GB-seconds", DASH],
        ["GB-second cost", DASH],
        ["Execution cost", DASH],
        ["One EP1 Premium instance", DASH],
      ]
    : [
        ["Billed memory per execution", `${NUM.format(result.billedMemoryGb * 1024)} MB`],
        ["Billed duration per execution", `${NUM.format(result.billedMsPerExecution)} ms`],
        [
          `Total GB-seconds (free ${NUM.format(FREE_GB_SECONDS)})`,
          NUM.format(Math.round(result.totalGbSeconds)),
        ],
        ["GB-second cost", money(result.gbSecondCost)],
        [
          `Execution cost (free ${NUM.format(FREE_EXECUTIONS)})`,
          money(result.executionCost),
        ],
        [
          `One EP1 Premium instance (${EP1_VCPU} vCPU, ${EP1_MEMORY_GB} GB)`,
          money(result.premiumTotal),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Cloud cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Azure Functions Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The Consumption plan bills ${PRICE_PER_MILLION_EXECUTIONS.toFixed(2)} per million
          executions plus ${PRICE_PER_GB_SECOND} per GB-second, after monthly free grants of{" "}
          {NUM.format(FREE_EXECUTIONS)} executions and {NUM.format(FREE_GB_SECONDS)} GB-seconds
          (East US list prices). Memory rounds up to 128 MB and each run bills at least 100 ms.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="azf-exec">
              Executions per month
            </label>
            <input
              id="azf-exec"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100000"
              value={executions}
              onChange={(event) => setExecutions(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="azf-duration">
              Average duration (ms)
            </label>
            <input
              id="azf-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={durationMs}
              onChange={(event) => setDurationMs(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Runs shorter than 100 ms still bill 100 ms.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="azf-memory">
              Peak memory per execution (MB)
            </label>
            <input
              id="azf-memory"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="1536"
              step="64"
              value={memoryMb}
              onChange={(event) => setMemoryMb(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Rounded up to the nearest 128 MB; the Consumption plan caps at 1,536 MB.
            </p>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Consumption plan monthly cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.consumptionTotal)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.cheaperPlan === "consumption"
                  ? `Consumption is ${money(result.monthlySavingOnCheaper)} cheaper than one always-on EP1 Premium instance.`
                  : `One EP1 Premium instance would be ${money(result.monthlySavingOnCheaper)} cheaper at this volume.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Azure Functions cost estimate"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate using East US pay-as-you-go list prices. Storage transactions,
        networking and Durable Functions storage costs are billed separately, and regional prices
        change — confirm with the Azure Pricing Calculator before budgeting. The Premium comparison
        assumes a single always-on EP1 instance.
      </p>
    </main>
  );
}
