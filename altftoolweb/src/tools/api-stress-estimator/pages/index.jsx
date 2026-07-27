"use client";

import { useMemo, useState } from "react";
import { Activity, Check, Copy, RotateCcw } from "lucide-react";

import {
  REPORTED_PERCENTILES,
  TARGET_UTILISATION,
  analyzeLoad,
  buildScenarioTable,
  capacityAt,
  workersForLatencyBudget,
} from "../lib";

const DEFAULTS = {
  requestsPerSecond: "500",
  serviceTimeMs: "80",
  workers: "60",
  budgetMs: "400",
  percentile: "99",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const int = (value) => (Number.isFinite(value) ? INT.format(value) : DASH);
const ms = (value) => (Number.isFinite(value) ? `${NUM.format(value)} ms` : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value * 100)}%` : DASH);

const RISK_STYLE = {
  low: "text-[var(--success)]",
  moderate: "text-[var(--success)]",
  warning: "text-[var(--primary)]",
  high: "text-[var(--danger)]",
  critical: "text-[var(--danger)]",
  unknown: "text-[var(--muted-foreground)]",
};

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [requestsPerSecond, setRequestsPerSecond] = useState(DEFAULTS.requestsPerSecond);
  const [serviceTimeMs, setServiceTimeMs] = useState(DEFAULTS.serviceTimeMs);
  const [workers, setWorkers] = useState(DEFAULTS.workers);
  const [budgetMs, setBudgetMs] = useState(DEFAULTS.budgetMs);
  const [percentile, setPercentile] = useState(DEFAULTS.percentile);
  const [copied, setCopied] = useState(false);

  const inputs = useMemo(
    () => ({
      requestsPerSecond: toNumber(requestsPerSecond),
      serviceTimeMs: toNumber(serviceTimeMs),
      workers: toNumber(workers),
    }),
    [requestsPerSecond, serviceTimeMs, workers],
  );

  const result = useMemo(() => analyzeLoad(inputs), [inputs]);
  const hasError = Boolean(result.error);

  const scenarios = useMemo(() => buildScenarioTable(inputs), [inputs]);

  const sizing = useMemo(
    () =>
      workersForLatencyBudget({
        requestsPerSecond: inputs.requestsPerSecond,
        serviceTimeMs: inputs.serviceTimeMs,
        percentile: toNumber(percentile),
        budgetMs: toNumber(budgetMs),
      }),
    [inputs, percentile, budgetMs],
  );

  const capacity = useMemo(
    () => capacityAt({ serviceTimeMs: inputs.serviceTimeMs, workers: inputs.workers }),
    [inputs],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "API load estimate (M/M/c queue)",
      `Traffic: ${int(result.lambda)} req/s · ${num(result.serviceTimeMs)} ms average · ${int(result.workers)} workers`,
      `Utilisation: ${pct(result.utilisation)} (${result.risk.label})`,
      `Offered load: ${num(result.offeredLoad)} erlangs`,
      `Probability a request queues: ${pct(result.probQueue)}`,
      `Mean queue wait: ${ms(result.meanWaitMs)}`,
      `Mean response time: ${ms(result.meanResponseMs)}`,
      ...REPORTED_PERCENTILES.map((p) => `p${p} response time: ${ms(result.percentiles[p])}`),
      `Requests in flight (Little's law): ${num(result.requestsInSystem)}`,
      `Safe capacity at ${TARGET_UTILISATION * 100}% utilisation: ${int(result.safeCapacityRps)} req/s`,
      `Headroom before that ceiling: ${int(result.headroomRps)} req/s`,
    ];
    if (!sizing.error) {
      lines.push(
        `To hold p${percentile} under ${budgetMs} ms you need ${sizing.workers} workers (achieves ${ms(sizing.achievedMs)}).`,
      );
    }
    return lines.join("\n");
  }, [budgetMs, hasError, percentile, result, sizing]);

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
    setRequestsPerSecond(DEFAULTS.requestsPerSecond);
    setServiceTimeMs(DEFAULTS.serviceTimeMs);
    setWorkers(DEFAULTS.workers);
    setBudgetMs(DEFAULTS.budgetMs);
    setPercentile(DEFAULTS.percentile);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Capacity model
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">API Stress Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Model your API as an M/M/c queue: give it a request rate, an average response time and a
          worker count, and it returns utilisation, queueing probability, mean and tail latency, and
          the pool size a latency budget actually needs.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rps">
              Requests per second
            </label>
            <input
              id="rps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={requestsPerSecond}
              onChange={(event) => setRequestsPerSecond(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="service-ms">
              Average server time per request (ms)
            </label>
            <input
              id="service-ms"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={serviceTimeMs}
              onChange={(event) => setServiceTimeMs(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="workers">
              Concurrent workers (instances × concurrency)
            </label>
            <input
              id="workers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={workers}
              onChange={(event) => setWorkers(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="budget-ms">
              Latency budget (ms)
            </label>
            <input
              id="budget-ms"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={budgetMs}
              onChange={(event) => setBudgetMs(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="percentile">
              Percentile the budget applies to
            </label>
            <select
              id="percentile"
              className={`mt-2 ${INPUT_CLASS}`}
              value={percentile}
              onChange={(event) => setPercentile(event.target.value)}
            >
              {REPORTED_PERCENTILES.map((p) => (
                <option key={p} value={String(p)}>
                  p{p}
                </option>
              ))}
            </select>
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

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Worker utilisation
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : pct(result.utilisation)}
            </p>
            <p className={`mt-1 text-sm font-semibold ${hasError ? "text-[var(--muted-foreground)]" : RISK_STYLE[result.risk.level]}`}>
              {hasError ? "Fix the inputs above to see a result." : result.risk.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the capacity estimate to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
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
          {[
            ["Offered load (erlangs)", hasError ? DASH : num(result.offeredLoad)],
            ["Chance a request has to queue", hasError ? DASH : pct(result.probQueue)],
            ["Mean queue wait", hasError ? DASH : ms(result.meanWaitMs)],
            ["Mean response time", hasError ? DASH : ms(result.meanResponseMs)],
            ...REPORTED_PERCENTILES.map((p) => [
              `p${p} response time`,
              hasError ? DASH : ms(result.percentiles[p]),
            ]),
            ["Requests in flight", hasError ? DASH : num(result.requestsInSystem)],
            ["Requests waiting in queue", hasError ? DASH : num(result.queueLength)],
            [
              "Queueing share of latency",
              hasError ? DASH : pct(result.queueShareOfLatency),
            ],
            [
              `Safe capacity at ${TARGET_UTILISATION * 100}% utilisation`,
              capacity.error ? DASH : `${int(capacity.requestsPerSecond)} req/s`,
            ],
            [
              "Headroom before that ceiling",
              hasError ? DASH : `${int(result.headroomRps)} req/s`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Sizing for your latency budget</h2>
        {sizing.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {sizing.error}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6">
            <span className="text-3xl font-semibold text-[var(--primary)]">{int(sizing.workers)}</span>{" "}
            workers hold p{percentile} at {ms(sizing.achievedMs)}, inside your {num(toNumber(budgetMs))} ms
            budget. You currently have {int(inputs.workers)}.
          </p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">The same pool under traffic multiples</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Latency does not scale linearly with traffic — the queueing term takes over near the top.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Scenario
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Req/s
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Utilisation
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Mean
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  p99
                </th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {row.label} <span className="text-[var(--muted-foreground)]">×{row.multiplier}</span>
                  </td>
                  <td className="py-2 pr-3 text-right">{int(row.requestsPerSecond)}</td>
                  <td className="py-2 pr-3 text-right">
                    {row.survives ? pct(row.result.utilisation) : (
                      <span className="font-semibold text-[var(--danger)]">Saturated</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {row.survives ? ms(row.result.meanResponseMs) : DASH}
                  </td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {row.survives ? ms(row.result.percentiles[99]) : DASH}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        M/M/c assumes Poisson arrivals and exponential service times. Real APIs have bursty arrivals
        and long-tailed service times, both of which make queueing worse than this model predicts —
        treat these numbers as an optimistic floor, then load test.
      </p>
    </main>
  );
}
