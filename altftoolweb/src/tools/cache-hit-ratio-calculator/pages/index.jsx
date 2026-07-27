"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import { computeCacheMetrics } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  hits: "900",
  misses: "100",
  cacheLatencyMs: "2",
  backendLatencyMs: "50",
  requestsPerSecond: "1000",
};

const DASH = "—";
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const MS = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export default function ToolHome() {
  const [hits, setHits] = useState(DEFAULTS.hits);
  const [misses, setMisses] = useState(DEFAULTS.misses);
  const [cacheLatencyMs, setCacheLatencyMs] = useState(DEFAULTS.cacheLatencyMs);
  const [backendLatencyMs, setBackendLatencyMs] = useState(DEFAULTS.backendLatencyMs);
  const [requestsPerSecond, setRequestsPerSecond] = useState(DEFAULTS.requestsPerSecond);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCacheMetrics({
        hits: hits.trim() === "" ? Number.NaN : Number(hits),
        misses: misses.trim() === "" ? Number.NaN : Number(misses),
        cacheLatencyMs: cacheLatencyMs.trim() === "" ? Number.NaN : Number(cacheLatencyMs),
        backendLatencyMs: backendLatencyMs.trim() === "" ? Number.NaN : Number(backendLatencyMs),
        requestsPerSecond: requestsPerSecond.trim() === "" ? 0 : Number(requestsPerSecond),
      }),
    [hits, misses, cacheLatencyMs, backendLatencyMs, requestsPerSecond],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Cache performance",
      `Hit ratio: ${PCT.format(result.hitRatioPct)}%`,
      `Effective latency (AMAT): ${MS.format(result.effectiveLatencyMs)} ms`,
      `Without cache: ${MS.format(result.noCacheLatencyMs)} ms`,
      `Latency saved: ${PCT.format(result.latencySavedPct)}%`,
      `Speedup: ${result.speedup ? `${PCT.format(result.speedup)}x` : DASH}`,
      `Backend load reduction: ${PCT.format(result.backendLoadReductionPct)}%`,
    ].join("\n");
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
    setHits(DEFAULTS.hits);
    setMisses(DEFAULTS.misses);
    setCacheLatencyMs(DEFAULTS.cacheLatencyMs);
    setBackendLatencyMs(DEFAULTS.backendLatencyMs);
    setRequestsPerSecond(DEFAULTS.requestsPerSecond);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Hit ratio", DASH],
        ["Effective latency (AMAT)", DASH],
        ["Latency without cache", DASH],
        ["Latency saved", DASH],
        ["Speedup", DASH],
        ["Backend load reduction", DASH],
        ["Backend requests/second", DASH],
      ]
    : [
        ["Hit ratio", `${PCT.format(result.hitRatioPct)}%`],
        ["Miss ratio", `${PCT.format(result.missRatioPct)}%`],
        ["Effective latency (AMAT)", `${MS.format(result.effectiveLatencyMs)} ms`],
        ["Latency without cache", `${MS.format(result.noCacheLatencyMs)} ms`],
        ["Latency saved", `${PCT.format(result.latencySavedPct)}%`],
        ["Speedup", result.speedup ? `${PCT.format(result.speedup)}×` : DASH],
        ["Backend load reduction", `${PCT.format(result.backendLoadReductionPct)}%`],
        [
          "Backend requests/second",
          result.backendRps == null ? "— (enter traffic rate)" : NUM.format(result.backendRps),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Caching
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Cache Hit Ratio Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter hits, misses and latencies to see your hit ratio, the effective latency using the
          AMAT formula (hit time + miss rate × miss penalty), and how much load the cache takes off
          your backend.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="chr-hits">
              Cache hits
            </label>
            <input id="chr-hits" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" step="1" value={hits} onChange={(event) => setHits(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="chr-misses">
              Cache misses
            </label>
            <input id="chr-misses" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" step="1" value={misses} onChange={(event) => setMisses(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="chr-clat">
              Cache lookup latency (ms)
            </label>
            <input id="chr-clat" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.1" value={cacheLatencyMs} onChange={(event) => setCacheLatencyMs(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="chr-blat">
              Backend fetch latency (ms)
            </label>
            <input id="chr-blat" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={backendLatencyMs} onChange={(event) => setBackendLatencyMs(event.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="chr-rps">
              Traffic rate (requests/second, optional)
            </label>
            <input id="chr-rps" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="10" value={requestsPerSecond} onChange={(event) => setRequestsPerSecond(event.target.value)} />
          </div>
        </div>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Hit ratio
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${PCT.format(result.hitRatioPct)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${NUM.format(result.totalRequests)} requests measured — every hit skips the backend entirely.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the cache performance result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
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

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--danger)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Effective latency uses the AMAT model (hit time + miss rate × miss penalty) from Hennessy
        &amp; Patterson. Real systems also see cold-start misses, eviction churn and tail latencies
        that a single average cannot capture.
      </p>
    </main>
  );
}
