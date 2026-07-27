"use client";

import { useMemo, useState } from "react";
import { Activity, Check, Copy, RotateCcw } from "lucide-react";

import { SOLVE_MODES, solveLittlesLaw } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DEC2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  solveFor: "concurrency",
  concurrency: "120",
  rps: "100",
  responseTimeMs: "200",
  thinkTimeMs: "0",
};

const RESULT_LABELS = {
  concurrency: "Concurrent users needed",
  rps: "Requests per second sustained",
  responseTime: "Average response time",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(
    () =>
      solveLittlesLaw({
        solveFor: form.solveFor,
        concurrency: form.concurrency,
        rps: form.rps,
        responseTimeMs: form.responseTimeMs,
        thinkTimeMs: form.thinkTimeMs,
      }),
    [form],
  );
  const hasError = Boolean(result.error);

  const primaryValue = useMemo(() => {
    if (hasError) return DASH;
    if (form.solveFor === "concurrency") return `${NUM.format(result.concurrency)} users`;
    if (form.solveFor === "rps") return `${NUM.format(result.rps)} req/s`;
    return `${NUM.format(result.responseTimeMs)} ms`;
  }, [hasError, form.solveFor, result]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Little's Law: L = λ × W",
      `Concurrent users: ${NUM.format(result.concurrency)}`,
      `Requests per second: ${NUM.format(result.rps)} (${NUM.format(result.requestsPerMinute)}/min)`,
      `Response time: ${NUM.format(result.responseTimeMs)} ms`,
      `Think time: ${NUM.format(result.thinkTimeMs)} ms`,
      `In-flight requests: ${NUM.format(result.inFlight)}`,
      `Requests per user per second: ${DEC2.format(result.requestsPerUserPerSecond)}`,
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const inputDefs = [
    ["concurrency", "Concurrent users", { min: "1", step: "1" }, "users"],
    ["rps", "Requests per second", { min: "0.01", step: "1" }, "req/s"],
    ["responseTimeMs", "Avg response time (ms)", { min: "1", step: "10" }, "ms"],
  ];
  const hiddenKey =
    form.solveFor === "responseTime" ? "responseTimeMs" : form.solveFor === "rps" ? "rps" : "concurrency";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Capacity planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Concurrency vs RPS Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert between concurrent users, requests per second and response time with Little&apos;s
          Law — <code>L = λ × W</code> — including per-user think time for sizing load tests.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="ll-mode">
            Solve for
          </label>
          <select
            id="ll-mode"
            className={`mt-2 ${INPUT_CLASS}`}
            value={form.solveFor}
            onChange={(event) => set("solveFor", event.target.value)}
          >
            {SOLVE_MODES.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {inputDefs
            .filter(([key]) => key !== hiddenKey)
            .map(([key, label, attrs]) => (
              <div key={key}>
                <label className={LABEL_CLASS} htmlFor={`ll-${key}`}>
                  {label}
                </label>
                <input
                  id={`ll-${key}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  {...attrs}
                  value={form[key]}
                  onChange={(event) => set(key, event.target.value)}
                />
              </div>
            ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="ll-think">
              Think time between requests (ms)
            </label>
            <input
              id="ll-think"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.thinkTimeMs}
              onChange={(event) => set("thinkTimeMs", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              0 for raw in-flight concurrency; &gt; 0 to size virtual users in a load test.
            </p>
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
              {RESULT_LABELS[form.solveFor]}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{primaryValue}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to solve."
                : "L = λ × W with W = response time + think time per request cycle."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Little's Law result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
            ["Concurrent users (L)", hasError ? DASH : NUM.format(result.concurrency)],
            [
              "Requests per second (λ)",
              hasError ? DASH : `${NUM.format(result.rps)} (${NUM.format(result.requestsPerMinute)}/min)`,
            ],
            ["Response time", hasError ? DASH : `${NUM.format(result.responseTimeMs)} ms`],
            [
              "Full cycle per user (response + think)",
              hasError ? DASH : `${DEC2.format(result.cycleSeconds)} s`,
            ],
            [
              "Requests actually in flight",
              hasError ? DASH : NUM.format(result.inFlight),
            ],
            [
              "Users idle in think time",
              hasError ? DASH : NUM.format(result.thinkingUsers),
            ],
            [
              "Requests per user per second",
              hasError ? DASH : DEC2.format(result.requestsPerUserPerSecond),
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
        Little&apos;s Law holds for averages in any stable system regardless of traffic pattern, but
        it says nothing about peaks or queueing delay near saturation — size headroom separately.
        &quot;In-flight&quot; counts requests being served; &quot;concurrent users&quot; includes
        users pausing between requests.
      </p>
    </main>
  );
}
