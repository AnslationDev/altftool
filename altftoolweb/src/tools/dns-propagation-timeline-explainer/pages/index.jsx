"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, RotateCcw } from "lucide-react";

import { CHANGE_TYPES, computePropagationTimeline, formatDuration } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TTL_PRESETS = [
  { label: "5 min (300)", value: "300" },
  { label: "1 hour (3600)", value: "3600" },
  { label: "24 hours (86400)", value: "86400" },
];

const DEFAULTS = { changeType: "existing", ttl: "3600", negativeTtl: "3600" };
const DASH = "—";

export default function ToolHome() {
  const [changeType, setChangeType] = useState(DEFAULTS.changeType);
  const [ttl, setTtl] = useState(DEFAULTS.ttl);
  const [negativeTtl, setNegativeTtl] = useState(DEFAULTS.negativeTtl);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computePropagationTimeline({
        changeType,
        ttlSeconds: ttl.trim() === "" ? NaN : Number(ttl),
        negativeTtlSeconds: negativeTtl.trim() === "" ? NaN : Number(negativeTtl),
      }),
    [changeType, ttl, negativeTtl],
  );
  const hasError = Boolean(result.error);
  const isNew = changeType === "new";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "DNS propagation timeline",
      `Change: ${CHANGE_TYPES.find((c) => c.id === changeType)?.label}`,
      `Governing cache window: ${formatDuration(result.governingSeconds)}`,
      `Worst case until fully visible: ${formatDuration(result.worstCaseSeconds)}`,
      ...result.milestones.map((m) => `t+${formatDuration(m.atSeconds)}: ${m.label}`),
    ].join("\n");
  }, [hasError, result, changeType]);

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
    setChangeType(DEFAULTS.changeType);
    setTtl(DEFAULTS.ttl);
    setNegativeTtl(DEFAULTS.negativeTtl);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clock className="h-4 w-4" aria-hidden="true" />
          DNS caching
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          DNS Propagation Timeline Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          DNS changes are not pushed — caches expire. Enter your record&apos;s TTL and see the
          worst-case window before everyone gets the new answer, based on RFC 1035 positive caching
          and RFC 2308 negative caching.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dpt-change">
              What are you changing?
            </label>
            <select
              id="dpt-change"
              className={`mt-2 ${INPUT_CLASS}`}
              value={changeType}
              onChange={(event) => setChangeType(event.target.value)}
            >
              {CHANGE_TYPES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dpt-ttl">
              {isNew ? "TTL of the new record (seconds)" : "Old TTL of the record (seconds)"}
            </label>
            <input
              id="dpt-ttl"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="60"
              value={ttl}
              onChange={(event) => setTtl(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {TTL_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setTtl(preset.value)}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          {isNew ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="dpt-negttl">
                Negative-cache TTL (seconds)
              </label>
              <input
                id="dpt-negttl"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="60"
                value={negativeTtl}
                onChange={(event) => setNegativeTtl(event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                min(SOA MINIMUM field, SOA record TTL) for your zone — RFC 2308. Many providers use
                3600 or less.
              </p>
            </div>
          ) : null}
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
              Worst case until fully visible
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatDuration(result.worstCaseSeconds)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the timeline." : result.governingRule}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the propagation timeline"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy timeline"}
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
                ["Governing cache window", DASH],
                ["Client-side cache allowance", DASH],
                ["Worst case total", DASH],
              ]
            : [
                ["Governing cache window", formatDuration(result.governingSeconds)],
                ["Client-side cache allowance", formatDuration(result.browserCacheSeconds)],
                ["Worst case total", formatDuration(result.worstCaseSeconds)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Timeline after you publish (t = 0)</h2>
          <ol className="mt-4 space-y-4">
            {result.milestones.map((m) => (
              <li key={`${m.atSeconds}-${m.label}`} className="flex gap-3">
                <span className="mt-0.5 shrink-0 rounded-md bg-[var(--muted)] px-2 py-1 font-mono text-xs font-semibold text-[var(--primary)]">
                  t+{formatDuration(m.atSeconds)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{m.label}</p>
                  <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{m.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <h3 className="mt-6 text-sm font-semibold">Caveats the model cannot schedule around</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational model of standards-compliant caching. Real-world resolvers occasionally clamp or
        ignore TTLs, so verify critical cutovers with a multi-location DNS checker before switching
        traffic.
      </p>
    </main>
  );
}
