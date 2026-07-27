"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";

import { RECORD_TYPE_GUIDANCE, formatDuration, planTtlCutover } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { currentTtl: "86400", lowTtl: "300", steadyTtl: "3600" };
const DASH = "—";

export default function ToolHome() {
  const [currentTtl, setCurrentTtl] = useState(DEFAULTS.currentTtl);
  const [lowTtl, setLowTtl] = useState(DEFAULTS.lowTtl);
  const [steadyTtl, setSteadyTtl] = useState(DEFAULTS.steadyTtl);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planTtlCutover({
        currentTtlSeconds: currentTtl.trim() === "" ? NaN : Number(currentTtl),
        lowTtlSeconds: lowTtl.trim() === "" ? NaN : Number(lowTtl),
        steadyTtlSeconds: steadyTtl.trim() === "" ? undefined : Number(steadyTtl),
      }),
    [currentTtl, lowTtl, steadyTtl],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "DNS TTL cutover plan",
      ...result.steps.map((s) => `${s.offsetLabel}: ${s.title}`),
      result.rollbackNote,
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
    setCurrentTtl(DEFAULTS.currentTtl);
    setLowTtl(DEFAULTS.lowTtl);
    setSteadyTtl(DEFAULTS.steadyTtl);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          DNS operations
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">DNS TTL Strategy Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Caches keep the old answer for the TTL attached when they fetched it (RFC 1035), so a
          migration needs the TTL lowered one full old-TTL period before the cutover. Enter your
          TTLs and get the timed plan.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ttl-current">
              Current TTL on the record (seconds)
            </label>
            <input
              id="ttl-current"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="60"
              value={currentTtl}
              onChange={(event) => setCurrentTtl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ttl-low">
              Temporary migration TTL (seconds)
            </label>
            <input
              id="ttl-low"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="60"
              value={lowTtl}
              onChange={(event) => setLowTtl(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              300 seconds is the common choice — short enough for a fast rollback, long enough that
              resolvers do not clamp it.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ttl-steady">
              TTL to restore afterwards (seconds)
            </label>
            <input
              id="ttl-steady"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="60"
              value={steadyTtl}
              onChange={(event) => setSteadyTtl(event.target.value)}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Lower the TTL this long before cutover
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatDuration(result.leadTimeSeconds)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the plan."
                : `One old-TTL period doubled for safety. After cutover the change is fully visible in ${formatDuration(result.visibleAfterSeconds)}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the TTL cutover plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
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
                ["Lead time before cutover", DASH],
                ["Visible after cutover", DASH],
                ["Total low-TTL window", DASH],
              ]
            : [
                ["Lead time before cutover", formatDuration(result.leadTimeSeconds)],
                ["Visible after cutover", formatDuration(result.visibleAfterSeconds)],
                ["Total low-TTL window", formatDuration(result.totalLowWindowSeconds)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <ol className="mt-5 space-y-4">
            {result.steps.map((step) => (
              <li key={step.offsetLabel + step.title} className="flex gap-3">
                <span className="mt-0.5 shrink-0 rounded-md bg-[var(--muted)] px-2 py-1 font-mono text-xs font-semibold text-[var(--primary)]">
                  {step.offsetLabel}
                </span>
                <div>
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : null}

        {!hasError ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.rollbackNote}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Steady-state TTLs by record type</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Record type
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Suggested
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Typical range (s)
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Why
                </th>
              </tr>
            </thead>
            <tbody>
              {RECORD_TYPE_GUIDANCE.map((g) => (
                <tr key={g.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{g.type}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{formatDuration(g.steadySeconds)}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{g.range}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{g.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Timings assume standards-compliant resolvers. A small tail of resolvers clamps or ignores
        low TTLs, so keep the old infrastructure answering (or forwarding) for a day after any
        critical cutover.
      </p>
    </main>
  );
}
