"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Zap } from "lucide-react";

import {
  FREE_TIER_GB_SECONDS,
  FREE_TIER_REQUESTS,
  GB_SECOND_PRICE,
  MAX_MEMORY_MB,
  MIN_MEMORY_MB,
  REQUEST_PRICE_PER_MILLION,
  computeLambdaCost,
} from "../lib";

const DASH = "—";

/** Lambda's maximum configurable timeout is 15 minutes (900,000 ms) — AWS Lambda quotas. */
const MAX_DURATION_MS = 900000;

const MEMORY_PRESETS = [128, 256, 512, 1024, 1769, 3008, 10240];

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const USD_FINE = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const money = (value) => (value !== 0 && Math.abs(value) < 0.01 ? USD_FINE.format(value) : USD.format(value));

const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-medium text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  invocationsPerMonth: "10000000",
  memoryMb: "512",
  avgDurationMs: "200",
  applyFreeTier: true,
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeLambdaCost({
        invocationsPerMonth: Number(form.invocationsPerMonth),
        memoryMb: Number(form.memoryMb),
        avgDurationMs: Number(form.avgDurationMs),
        applyFreeTier: form.applyFreeTier,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "AWS Lambda monthly cost estimate (x86, us-east-1)",
      `Invocations: ${INT.format(Number(form.invocationsPerMonth))}/month`,
      `Memory: ${form.memoryMb} MB, average duration ${form.avgDurationMs} ms`,
      `Compute: ${INT.format(Math.round(result.gbSeconds))} GB-seconds`,
      `Request charge: ${money(result.requestCharge)}`,
      `Compute charge: ${money(result.computeCharge)}`,
      `Free tier applied: ${result.applyFreeTier ? "yes" : "no"}`,
      `Estimated monthly total: ${money(result.total)}`,
    ].join("\n");
  }, [hasError, form, result]);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Serverless costing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AWS Lambda Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lambda bills two meters: {USD.format(REQUEST_PRICE_PER_MILLION)} per million requests and{" "}
          {USD_FINE.format(GB_SECOND_PRICE)} per GB-second of compute (x86, US East N. Virginia).
          Enter your traffic to see the monthly bill with the always-free tier applied.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your function</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="invocations">
              Invocations per month
            </label>
            <input
              id="invocations"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              className={`${FIELD} mt-1`}
              value={form.invocationsPerMonth}
              onChange={(e) => setField("invocationsPerMonth", e.target.value)}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="memory">
              Memory (MB)
            </label>
            <input
              id="memory"
              type="number"
              min={MIN_MEMORY_MB}
              max={MAX_MEMORY_MB}
              step="1"
              inputMode="numeric"
              className={`${FIELD} mt-1`}
              value={form.memoryMb}
              onChange={(e) => setField("memoryMb", e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {MEMORY_PRESETS.map((mb) => (
                <button
                  key={mb}
                  type="button"
                  onClick={() => setField("memoryMb", String(mb))}
                  aria-label={`Set memory to ${mb} megabytes`}
                  aria-pressed={Number(form.memoryMb) === mb}
                  className={`min-h-11 rounded-md border px-3 text-xs font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    Number(form.memoryMb) === mb
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {mb}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="duration">
              Average billed duration (ms)
            </label>
            <input
              id="duration"
              type="number"
              min="0"
              max={MAX_DURATION_MS}
              step="1"
              inputMode="numeric"
              className={`${FIELD} mt-1`}
              value={form.avgDurationMs}
              onChange={(e) => setField("avgDurationMs", e.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Billed per 1 ms since December 2020 — no 100 ms rounding.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="free-tier"
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium"
            >
              <input
                id="free-tier"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={form.applyFreeTier}
                onChange={(e) => setField("applyFreeTier", e.target.checked)}
              />
              Apply the always-free tier ({INT.format(FREE_TIER_REQUESTS)} requests and{" "}
              {INT.format(FREE_TIER_GB_SECONDS)} GB-seconds a month)
            </label>
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
              Estimated monthly cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a cost."
                : result.total === 0
                  ? "This workload sits entirely inside the always-free tier."
                  : `That is ${money(result.annualTotal)} a year at the same traffic.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Lambda cost breakdown"
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
              aria-label="Reset the calculator to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Request charge
            </dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : money(result.requestCharge)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Compute charge
            </dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : money(result.computeCharge)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Compute used
            </dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${INT.format(Math.round(result.gbSeconds))} GB-seconds`}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Billable after free tier
            </dt>
            <dd className="text-sm font-semibold">
              {hasError
                ? DASH
                : `${INT.format(result.billableRequests)} requests, ${INT.format(Math.round(result.billableGbSeconds))} GB-s`}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Free tier absorbed
            </dt>
            <dd className="text-sm font-semibold">
              {hasError
                ? DASH
                : `${INT.format(result.freeRequestsUsed)} requests, ${INT.format(Math.round(result.freeGbSecondsUsed))} GB-s`}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Cost per million invocations
            </dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : money(result.costPerMillionInvocations)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          On-demand x86 pricing in US East (N. Virginia). Data transfer, provisioned concurrency,
          ephemeral storage above 512 MB and other AWS services your function calls are billed
          separately.
        </p>
      </section>
    </main>
  );
}
