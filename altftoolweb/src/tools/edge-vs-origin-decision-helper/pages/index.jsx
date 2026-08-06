"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Globe, RotateCcw } from "lucide-react";

import { BLOCKERS, decideEdgeVsOrigin } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function formatBreakEven(breakEvenHitPercent) {
  if (breakEvenHitPercent === null || breakEvenHitPercent === undefined) {
    return "N/A (no origin calls)";
  }
  if (breakEvenHitPercent <= 0) {
    return "0% (edge always wins)";
  }
  if (breakEvenHitPercent >= 100) {
    return ">100% (unreachable)";
  }
  return `${breakEvenHitPercent.toFixed(0)}%`;
}

const DEFAULTS = {
  userToEdge: "20",
  userToOrigin: "120",
  edgeToOrigin: "100",
  originCalls: "1",
  cacheHit: "90",
  compute: "5",
  blockers: [],
};

const DASH = "—";

export default function ToolHome() {
  const [userToEdge, setUserToEdge] = useState(DEFAULTS.userToEdge);
  const [userToOrigin, setUserToOrigin] = useState(DEFAULTS.userToOrigin);
  const [edgeToOrigin, setEdgeToOrigin] = useState(DEFAULTS.edgeToOrigin);
  const [originCalls, setOriginCalls] = useState(DEFAULTS.originCalls);
  const [cacheHit, setCacheHit] = useState(DEFAULTS.cacheHit);
  const [compute, setCompute] = useState(DEFAULTS.compute);
  const [blockers, setBlockers] = useState(DEFAULTS.blockers);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      decideEdgeVsOrigin({
        userToEdgeRttMs: userToEdge.trim() === "" ? NaN : Number(userToEdge),
        userToOriginRttMs: userToOrigin.trim() === "" ? NaN : Number(userToOrigin),
        edgeToOriginRttMs: edgeToOrigin.trim() === "" ? NaN : Number(edgeToOrigin),
        originCallsPerRequest: originCalls.trim() === "" ? NaN : Number(originCalls),
        cacheHitPercent: cacheHit.trim() === "" ? NaN : Number(cacheHit),
        computeMs: compute.trim() === "" ? 0 : Number(compute),
        blockers,
      }),
    [userToEdge, userToOrigin, edgeToOrigin, originCalls, cacheHit, compute, blockers],
  );
  const hasError = Boolean(result.error);

  const toggleBlocker = (id) => {
    setBlockers((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Edge vs origin: run this endpoint at the ${result.recommendation.toUpperCase()}`,
      `Expected edge path latency: ${NUM.format(result.edgeLatencyMs)} ms`,
      `Expected origin path latency: ${NUM.format(result.originLatencyMs)} ms`,
      `Difference: ${NUM.format(Math.abs(result.savingsMs))} ms (${Math.abs(result.savingsPercent).toFixed(0)}%) in favour of the ${result.savingsMs >= 0 ? "edge" : "origin"}`,
      `Break-even cache-hit ratio: ${formatBreakEven(result.breakEvenHitPercent)}`,
      ...result.reasons.map((r) => `- ${r}`),
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
    setUserToEdge(DEFAULTS.userToEdge);
    setUserToOrigin(DEFAULTS.userToOrigin);
    setEdgeToOrigin(DEFAULTS.edgeToOrigin);
    setOriginCalls(DEFAULTS.originCalls);
    setCacheHit(DEFAULTS.cacheHit);
    setCompute(DEFAULTS.compute);
    setBlockers(DEFAULTS.blockers);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Globe className="h-4 w-4" aria-hidden="true" />
          Serverless architecture
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Edge vs Origin Decision Helper
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          An edge function is only fast if it can answer without crossing back to where the data
          lives. Model the round trips for one endpoint and see which side actually wins.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="evo-useredge">
              User → nearest edge RTT (ms)
            </label>
            <input
              id="evo-useredge"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              value={userToEdge}
              onChange={(event) => setUserToEdge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="evo-userorigin">
              User → origin region RTT (ms)
            </label>
            <input
              id="evo-userorigin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              value={userToOrigin}
              onChange={(event) => setUserToOrigin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="evo-edgeorigin">
              Edge PoP → origin region RTT (ms)
            </label>
            <input
              id="evo-edgeorigin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              value={edgeToOrigin}
              onChange={(event) => setEdgeToOrigin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="evo-calls">
              Sequential origin data calls per request
            </label>
            <input
              id="evo-calls"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={originCalls}
              onChange={(event) => setOriginCalls(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Database queries, auth lookups or API calls that must reach the origin region.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="evo-hit">
              Edge cache / replica hit ratio (%)
            </label>
            <input
              id="evo-hit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              value={cacheHit}
              onChange={(event) => setCacheHit(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Share of requests answered from data already at the edge (KV, cache, replica).
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="evo-compute">
              Handler compute time (ms)
            </label>
            <input
              id="evo-compute"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              value={compute}
              onChange={(event) => setCompute(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Hard blockers (any one forces origin)</legend>
          <div className="mt-2 space-y-1">
            {BLOCKERS.map((b) => (
              <label
                key={b.id}
                htmlFor={`evo-blocker-${b.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-sm"
              >
                <input
                  id={`evo-blocker-${b.id}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={blockers.includes(b.id)}
                  onChange={() => toggleBlocker(b.id)}
                />
                {b.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Run this endpoint at the
            </p>
            <p className="mt-1 text-4xl font-semibold uppercase text-[var(--primary)]">
              {hasError ? DASH : result.recommendation}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the recommendation."
                : result.blocked
                  ? "A hard constraint decides this one — latency was not the deciding factor."
                  : `Expected per-request difference: ${NUM.format(Math.abs(result.savingsMs))} ms (${Math.abs(result.savingsPercent).toFixed(0)}%) in favour of the ${result.savingsMs >= 0 ? "edge" : "origin"}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the edge vs origin analysis"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy analysis"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Expected edge path latency", DASH],
                ["Expected origin path latency", DASH],
                ["Origin data cost from edge", DASH],
                ["Miss rate", DASH],
                ["Break-even cache-hit ratio", DASH],
              ]
            : [
                ["Expected edge path latency", `${NUM.format(result.edgeLatencyMs)} ms`],
                ["Expected origin path latency", `${NUM.format(result.originLatencyMs)} ms`],
                ["Origin data cost from edge", `${NUM.format(result.missPenaltyMs)} ms per request`],
                ["Miss rate", `${NUM.format(result.missRatePercent)}%`],
                ["Break-even cache-hit ratio", formatBreakEven(result.breakEvenHitPercent)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.reasons.map((r) => (
              <li key={r} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {r}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Simplified single-request model: it ignores connection reuse, TLS handshakes and
        provider-specific smart routing, all of which soften but rarely reverse the conclusion.
        Measure with your provider&apos;s real numbers before committing.
      </p>
    </main>
  );
}
