"use client";

import { useMemo, useState } from "react";
import { Check, CloudCog, Copy, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  BASE_PLAN_PRICE,
  CPU_OVERAGE_PER_M_MS,
  INCLUDED_CPU_MS_M,
  INCLUDED_REQUESTS_M,
  KV_INCLUDED_READS_M,
  KV_INCLUDED_STORAGE_GB,
  KV_INCLUDED_WRITES_M,
  REQUEST_OVERAGE_PER_M,
  computeWorkersCost,
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
  requestsM: "50",
  avgCpuMs: "5",
  kvReadsM: "0",
  kvWritesM: "0",
  kvDeletesM: "0",
  kvListsM: "0",
  kvStorageGb: "0",
};

const DASH = "—";

export default function ToolHome() {
  const [requestsM, setRequestsM] = useState(DEFAULTS.requestsM);
  const [avgCpuMs, setAvgCpuMs] = useState(DEFAULTS.avgCpuMs);
  const [kvReadsM, setKvReadsM] = useState(DEFAULTS.kvReadsM);
  const [kvWritesM, setKvWritesM] = useState(DEFAULTS.kvWritesM);
  const [kvDeletesM, setKvDeletesM] = useState(DEFAULTS.kvDeletesM);
  const [kvListsM, setKvListsM] = useState(DEFAULTS.kvListsM);
  const [kvStorageGb, setKvStorageGb] = useState(DEFAULTS.kvStorageGb);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const result = useMemo(
    () =>
      computeWorkersCost({
        requestsM: requestsM.trim() === "" ? Number.NaN : Number(requestsM),
        avgCpuMs: avgCpuMs.trim() === "" ? Number.NaN : Number(avgCpuMs),
        kvReadsM: kvReadsM.trim() === "" ? 0 : Number(kvReadsM),
        kvWritesM: kvWritesM.trim() === "" ? 0 : Number(kvWritesM),
        kvDeletesM: kvDeletesM.trim() === "" ? 0 : Number(kvDeletesM),
        kvListsM: kvListsM.trim() === "" ? 0 : Number(kvListsM),
        kvStorageGb: kvStorageGb.trim() === "" ? 0 : Number(kvStorageGb),
      }),
    [requestsM, avgCpuMs, kvReadsM, kvWritesM, kvDeletesM, kvListsM, kvStorageGb],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Cloudflare Workers Paid plan estimate (list prices)",
      `Base plan: ${money(result.basePlanCost)}`,
      `Request overage: ${money(result.requestCost)}`,
      `CPU time overage (${NUM.format(result.totalCpuMsM)}M CPU-ms total): ${money(result.cpuCost)}`,
      `Workers KV: ${money(result.kvCost)}`,
      `Total per month: ${money(result.total)}`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = () => {
    if (!summary) return;
    copy("result", summary, { label: "Workers cost estimate" });
  };

  const reset = () => {
    setRequestsM(DEFAULTS.requestsM);
    setAvgCpuMs(DEFAULTS.avgCpuMs);
    setKvReadsM(DEFAULTS.kvReadsM);
    setKvWritesM(DEFAULTS.kvWritesM);
    setKvDeletesM(DEFAULTS.kvDeletesM);
    setKvListsM(DEFAULTS.kvListsM);
    setKvStorageGb(DEFAULTS.kvStorageGb);
    resetCopyState();
  };

  const rows = hasError
    ? [
        ["Base plan", DASH],
        ["Request overage", DASH],
        ["CPU time overage", DASH],
        ["KV reads / writes / deletes / lists", DASH],
        ["KV storage", DASH],
      ]
    : [
        ["Base plan (Workers Paid)", money(result.basePlanCost)],
        [
          `Requests over ${INCLUDED_REQUESTS_M}M @ $${REQUEST_OVERAGE_PER_M}/M`,
          money(result.requestCost),
        ],
        [
          `CPU time over ${INCLUDED_CPU_MS_M}M CPU-ms @ $${CPU_OVERAGE_PER_M_MS}/M`,
          money(result.cpuCost),
        ],
        [
          "KV reads / writes / deletes / lists",
          money(result.kvReadCost + result.kvWriteCost + result.kvDeleteCost + result.kvListCost),
        ],
        ["KV storage", money(result.kvStorageCost)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CloudCog className="h-4 w-4" aria-hidden="true" />
          Cloud cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cloudflare Workers Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The Workers Paid plan is ${BASE_PLAN_PRICE}/month and includes {INCLUDED_REQUESTS_M}{" "}
          million requests and {INCLUDED_CPU_MS_M} million CPU-milliseconds; overage bills at $
          {REQUEST_OVERAGE_PER_M} per million requests and ${CPU_OVERAGE_PER_M_MS} per million
          CPU-ms. Egress is free. Workers KV adds its own metered reads, writes and storage.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cfw-requests">
              Worker requests (millions/month)
            </label>
            <input
              id="cfw-requests"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={requestsM}
              onChange={(event) => setRequestsM(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cfw-cpu">
              Average CPU time per request (ms)
            </label>
            <input
              id="cfw-cpu"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={avgCpuMs}
              onChange={(event) => setAvgCpuMs(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              CPU time only — waiting on fetch() is free. Typical Workers use 1–10 ms.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cfw-reads">
              KV reads (millions/month)
            </label>
            <input
              id="cfw-reads"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={kvReadsM}
              onChange={(event) => setKvReadsM(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cfw-writes">
              KV writes (millions/month)
            </label>
            <input
              id="cfw-writes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={kvWritesM}
              onChange={(event) => setKvWritesM(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cfw-deletes">
              KV deletes (millions/month)
            </label>
            <input
              id="cfw-deletes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={kvDeletesM}
              onChange={(event) => setKvDeletesM(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cfw-lists">
              KV list operations (millions/month)
            </label>
            <input
              id="cfw-lists"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={kvListsM}
              onChange={(event) => setKvListsM(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cfw-storage">
              KV stored data (GB)
            </label>
            <input
              id="cfw-storage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={kvStorageGb}
              onChange={(event) => setKvStorageGb(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              KV includes {KV_INCLUDED_READS_M}M reads, {KV_INCLUDED_WRITES_M}M
              writes/deletes/lists each and {KV_INCLUDED_STORAGE_GB} GB storage per month.
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
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated monthly Workers bill
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Workers Paid plan list prices; egress and cached responses are free."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={
                isCopied("result")
                  ? "Copied the Workers cost estimate to clipboard"
                  : "Copy the Workers cost estimate"
              }
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
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
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl
          className="mt-5 divide-y divide-[var(--border)] text-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate from Cloudflare's published Workers and KV pricing. Durable Objects,
        D1, R2, Queues and the free plan's 100,000 requests/day model are not included, and prices
        change — confirm on the Cloudflare pricing docs and your dashboard's usage view.
      </p>
    </main>
  );
}
