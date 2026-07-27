"use client";

import { useMemo, useState } from "react";
import { Check, Container, Copy, RotateCcw } from "lucide-react";

import {
  FREE_GIB_SECONDS,
  FREE_REQUESTS,
  FREE_VCPU_SECONDS,
  PRICE_PER_MILLION_REQUESTS,
  computeCloudRunCost,
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
  requests: "3000000",
  durationMs: "300",
  vcpu: "1",
  memoryGiB: "0.5",
  concurrency: "80",
  minInstances: "0",
};

const DASH = "—";

export default function ToolHome() {
  const [requests, setRequests] = useState(DEFAULTS.requests);
  const [durationMs, setDurationMs] = useState(DEFAULTS.durationMs);
  const [vcpu, setVcpu] = useState(DEFAULTS.vcpu);
  const [memoryGiB, setMemoryGiB] = useState(DEFAULTS.memoryGiB);
  const [concurrency, setConcurrency] = useState(DEFAULTS.concurrency);
  const [minInstances, setMinInstances] = useState(DEFAULTS.minInstances);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCloudRunCost({
        requestsPerMonth: requests.trim() === "" ? Number.NaN : Number(requests),
        avgDurationMs: durationMs.trim() === "" ? Number.NaN : Number(durationMs),
        vcpu: vcpu.trim() === "" ? Number.NaN : Number(vcpu),
        memoryGiB: memoryGiB.trim() === "" ? Number.NaN : Number(memoryGiB),
        concurrency: concurrency.trim() === "" ? 1 : Number(concurrency),
        minInstances: minInstances.trim() === "" ? 0 : Number(minInstances),
      }),
    [requests, durationMs, vcpu, memoryGiB, concurrency, minInstances],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "GCP Cloud Run monthly cost estimate (Tier 1 region list prices)",
      `Requests: ${NUM.format(Number(requests))}`,
      `Active vCPU cost: ${money(result.cpuCost)}`,
      `Active memory cost: ${money(result.memoryCost)}`,
      `Request cost: ${money(result.requestCost)}`,
      `Idle min-instance cost: ${money(result.idleCost)}`,
      `Total per month: ${money(result.total)}`,
    ].join("\n");
  }, [hasError, result, requests]);

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
    setRequests(DEFAULTS.requests);
    setDurationMs(DEFAULTS.durationMs);
    setVcpu(DEFAULTS.vcpu);
    setMemoryGiB(DEFAULTS.memoryGiB);
    setConcurrency(DEFAULTS.concurrency);
    setMinInstances(DEFAULTS.minInstances);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Billable vCPU-seconds", DASH],
        ["vCPU cost", DASH],
        ["Memory cost", DASH],
        ["Request cost", DASH],
        ["Idle min-instance cost", DASH],
      ]
    : [
        [
          `Billable vCPU-seconds (free ${NUM.format(FREE_VCPU_SECONDS)})`,
          NUM.format(Math.round(result.billableCpuSeconds)),
        ],
        ["vCPU cost", money(result.cpuCost)],
        [
          `Memory cost (free ${NUM.format(FREE_GIB_SECONDS)} GiB-s)`,
          money(result.memoryCost),
        ],
        [
          `Request cost (free ${NUM.format(FREE_REQUESTS)} @ $${PRICE_PER_MILLION_REQUESTS}/M)`,
          money(result.requestCost),
        ],
        ["Idle min-instance cost", money(result.idleCost)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Container className="h-4 w-4" aria-hidden="true" />
          Cloud cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GCP Cloud Run Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Request-based billing charges $0.000024 per vCPU-second, $0.0000025 per GiB-second and
          $0.40 per million requests in Tier 1 regions, with 180,000 vCPU-seconds, 360,000
          GiB-seconds and 2 million requests free each month. Time bills in 100 ms increments and
          concurrent requests share one instance's clock.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="crun-requests">
              Requests per month
            </label>
            <input
              id="crun-requests"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100000"
              value={requests}
              onChange={(event) => setRequests(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="crun-duration">
              Average request duration (ms)
            </label>
            <input
              id="crun-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={durationMs}
              onChange={(event) => setDurationMs(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="crun-cpu">
              vCPU per instance
            </label>
            <input
              id="crun-cpu"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.08"
              max="8"
              step="0.5"
              value={vcpu}
              onChange={(event) => setVcpu(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="crun-memory">
              Memory per instance (GiB)
            </label>
            <input
              id="crun-memory"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.125"
              max="32"
              step="0.5"
              value={memoryGiB}
              onChange={(event) => setMemoryGiB(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="crun-concurrency">
              Average concurrency per instance
            </label>
            <input
              id="crun-concurrency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="1000"
              step="1"
              value={concurrency}
              onChange={(event) => setConcurrency(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Requests handled at the same time share one instance, dividing the compute cost.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="crun-min">
              Minimum (warm) instances
            </label>
            <input
              id="crun-min"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={minInstances}
              onChange={(event) => setMinInstances(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Idle warm instances bill at $0.000018/vCPU-s and $0.000002/GiB-s all month.
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
              Estimated monthly Cloud Run cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Tier 1 region list prices, monthly free tier applied."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Cloud Run cost estimate"
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
        Informational estimate for request-based billing in Tier 1 regions. Networking egress,
        container registry storage and Tier 2 region uplifts are not included; the idle model
        assumes min instances stay warm the whole month. Confirm with the Google Cloud pricing
        calculator before budgeting.
      </p>
    </main>
  );
}
