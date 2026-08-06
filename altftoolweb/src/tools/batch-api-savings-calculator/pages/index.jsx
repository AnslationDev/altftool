"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

import {
  BATCH_WINDOW_HOURS,
  BATCH_WORKLOADS,
  DEFAULT_BATCH_DISCOUNT_PERCENT,
  computeBatchSavings,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const usd = (value, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);

const smartUsd = (value) => {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return usd(0, 2);
  if (Math.abs(value) < 0.01) return usd(value, 6);
  if (Math.abs(value) < 1) return usd(value, 4);
  return usd(value, 2);
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULTS = {
  requests: "1000000",
  inputTokens: "1500",
  outputTokens: "300",
  inputPerMTok: "3",
  outputPerMTok: "15",
  discountPercent: String(DEFAULT_BATCH_DISCOUNT_PERCENT),
  batchablePercent: "80",
  jobsPerMonth: "1",
};

export default function ToolHome() {
  const [fields, setFields] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setFields((current) => ({ ...current, [key]: event.target.value }));

  const applyWorkload = (workload) => {
    setFields((current) => ({
      ...current,
      inputTokens: String(workload.inputTokens),
      outputTokens: String(workload.outputTokens),
      batchablePercent: String(workload.batchablePercent),
    }));
    setCopied(false);
  };

  const result = useMemo(() => {
    const parsed = {};
    for (const key of Object.keys(DEFAULTS)) {
      const value = toNumber(fields[key]);
      if (Number.isNaN(value)) return { error: "Every field must be a number." };
      parsed[key] = value;
    }
    return computeBatchSavings(parsed);
  }, [fields]);

  const ok = !result.error;
  const dash = "—";

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Batch API savings",
      `Requests in job: ${fields.requests}`,
      `Tokens per request: ${fields.inputTokens} in / ${fields.outputTokens} out`,
      `Batch discount: ${fields.discountPercent}%`,
      `Batchable share: ${fields.batchablePercent}%`,
      `Real-time cost: ${usd(result.allRealtimeCost)}`,
      `Blended cost: ${usd(result.blendedCost)}`,
      `Saving: ${usd(result.savings)} (${NUM2.format(result.savingsPercent)}%)`,
      `If everything were batched: ${usd(result.allBatchCost)}`,
    ].join("\n");
  }, [ok, result, fields]);

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
    setFields(DEFAULTS);
    setCopied(false);
  };

  const numberField = (key, label, hint, step = "1") => (
    <div>
      <label className={LABEL_CLASS} htmlFor={`batch-${key}`}>
        {label}
      </label>
      <input
        id={`batch-${key}`}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min="0"
        step={step}
        value={fields[key]}
        onChange={set(key)}
      />
      {hint ? <p className={HINT_CLASS}>{hint}</p> : null}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          AI cost
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Batch API Savings Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Batch endpoints discount input and output tokens alike in exchange for a completion window
          measured in hours. Work out what that trade is worth on your job.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The job</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {BATCH_WORKLOADS.map((workload) => (
            <button key={workload.id} type="button" onClick={() => applyWorkload(workload)} className={CHIP_BTN}>
              {workload.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {numberField("requests", "Requests in the job", null, "1000")}
          {numberField("jobsPerMonth", "Jobs per month", "Use 30 for a nightly job.")}
          {numberField("inputTokens", "Input tokens per request", null, "100")}
          {numberField("outputTokens", "Output tokens per request", null, "50")}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Pricing</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {numberField("inputPerMTok", "Real-time input rate (USD / 1M)", null, "0.05")}
          {numberField("outputPerMTok", "Real-time output rate (USD / 1M)", null, "0.05")}
          {numberField(
            "discountPercent",
            "Batch discount (%)",
            `${DEFAULT_BATCH_DISCOUNT_PERCENT}% is the published discount on the major batch APIs.`,
            "5",
          )}
          {numberField(
            "batchablePercent",
            "Share of the job that can wait (%)",
            `Batch jobs return within about ${BATCH_WINDOW_HOURS} hours.`,
            "5",
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

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Saving on this job
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? usd(result.savings) : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM2.format(result.savingsPercent)}% off ${usd(result.allRealtimeCost)} of real-time spend`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy batch savings result"
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
          {[
            ["Cost per request (real-time)", ok ? smartUsd(result.realtimeCostPerRequest) : dash],
            ["Cost per request (batch)", ok ? smartUsd(result.batchCostPerRequest) : dash],
            ["Effective batch input rate", ok ? `${smartUsd(result.effectiveInputRate)} / 1M` : dash],
            ["Effective batch output rate", ok ? `${smartUsd(result.effectiveOutputRate)} / 1M` : dash],
            ["Requests sent to batch", ok ? NUM.format(result.batchedRequests) : dash],
            ["Requests kept real-time", ok ? NUM.format(result.realtimeRequests) : dash],
            ["All real-time cost", ok ? usd(result.allRealtimeCost) : dash],
            ["Blended cost", ok ? usd(result.blendedCost) : dash],
            ["All batch cost", ok ? usd(result.allBatchCost) : dash],
            ["Saving if 100% batched", ok ? usd(result.maxSavings) : dash],
            ["Saving per 1,000 requests", ok ? smartUsd(result.savingsPer1kRequests) : dash],
            ["Monthly cost (real-time only)", ok ? usd(result.monthlyRealtimeCost) : dash],
            ["Monthly cost (with batching)", ok ? usd(result.monthlyBlendedCost) : dash],
            ["Monthly saving", ok ? usd(result.monthlySavings) : dash],
            ["Annual saving", ok ? usd(result.annualSavings) : dash],
            ["Total tokens in the job", ok ? NUM.format(result.totalTokens) : dash],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Batching removes ${Math.round(result.savingsPercent)} percent of the bill`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, 100 - result.savingsPercent))}%` }}
              />
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${Math.max(0, Math.min(100, result.savingsPercent))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              You still pay {100 - Math.round(result.savingsPercent)}% · Saved{" "}
              {Math.round(result.savingsPercent)}%
            </p>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Batch endpoints have their own queue limits, file size caps and
        partial-failure behaviour, and a job that misses its window is returned unprocessed — budget
        for a real-time retry path before moving critical work to batch.
      </p>
    </main>
  );
}
