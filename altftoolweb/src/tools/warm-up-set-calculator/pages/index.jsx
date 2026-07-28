"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingUp } from "lucide-react";

import {
  DEFAULT_INCREMENT_KG,
  DEFAULT_REST_SEC,
  WARMUP_SCHEMES,
  buildWarmUp,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  working: "140",
  bar: "20",
  increment: String(DEFAULT_INCREMENT_KG),
  rest: String(DEFAULT_REST_SEC),
  topReps: "5",
  schemeId: "standard",
  unit: "kg",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [working, setWorking] = useState(DEFAULTS.working);
  const [bar, setBar] = useState(DEFAULTS.bar);
  const [increment, setIncrement] = useState(DEFAULTS.increment);
  const [rest, setRest] = useState(DEFAULTS.rest);
  const [topReps, setTopReps] = useState(DEFAULTS.topReps);
  const [schemeId, setSchemeId] = useState(DEFAULTS.schemeId);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildWarmUp({
        workingWeight: toNumber(working),
        barWeight: toNumber(bar),
        increment: toNumber(increment),
        restSec: toNumber(rest),
        topReps: toNumber(topReps),
        schemeId,
      }),
    [working, bar, increment, rest, topReps, schemeId]
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Warm-up ramp — ${result.scheme.label}`,
      ...result.allSets.map(
        (set) =>
          `${set.isWorkSet ? "Work set" : `${set.percentage}%`}: ${NUM.format(set.weight)} ${unit} × ${set.reps}`
      ),
      `Warm-up sets: ${result.warmUpSetCount} · reps: ${result.warmUpReps}`,
      `Estimated time: ${NUM1.format(result.estimatedMinutes)} min`,
    ].join("\n");
  }, [hasError, result, unit]);

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
    setWorking(DEFAULTS.working);
    setBar(DEFAULTS.bar);
    setIncrement(DEFAULTS.increment);
    setRest(DEFAULTS.rest);
    setTopReps(DEFAULTS.topReps);
    setSchemeId(DEFAULTS.schemeId);
    setUnit(DEFAULTS.unit);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Warm-up sets", DASH],
        ["Warm-up reps", DASH],
        ["Warm-up tonnage", DASH],
        ["Session tonnage including the work set", DASH],
        ["Estimated time", DASH],
        ["Rungs skipped as duplicates", DASH],
      ]
    : [
        ["Warm-up sets", NUM0.format(result.warmUpSetCount)],
        ["Warm-up reps", NUM0.format(result.warmUpReps)],
        ["Warm-up tonnage", `${NUM0.format(result.warmUpVolume)} ${unit}`],
        ["Session tonnage including the work set", `${NUM0.format(result.totalVolume)} ${unit}`],
        ["Estimated time", `${NUM1.format(result.estimatedMinutes)} min`],
        ["Rungs skipped as duplicates", NUM0.format(result.skippedSteps)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Strength training
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Warm-Up Set Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Percentages are taken from your top working weight, reps fall as the bar climbs, and every
          rung is rounded to a weight your plates can actually make. Rungs that land on the same
          weight as the one before are dropped rather than repeated.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="warmup-scheme">
              Ramp style
            </label>
            <select
              id="warmup-scheme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={schemeId}
              onChange={(event) => setSchemeId(event.target.value)}
            >
              {WARMUP_SCHEMES.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.label}
                </option>
              ))}
            </select>
            {!hasError && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{result.scheme.note}</p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="warmup-working">
              Top working weight ({unit})
            </label>
            <input
              id="warmup-working"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="2.5"
              value={working}
              onChange={(event) => setWorking(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="warmup-topreps">
              Reps in the work set
            </label>
            <input
              id="warmup-topreps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              step="1"
              value={topReps}
              onChange={(event) => setTopReps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="warmup-bar">
              Bar weight ({unit})
            </label>
            <input
              id="warmup-bar"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={bar}
              onChange={(event) => setBar(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              20 kg men&apos;s bar, 15 kg women&apos;s bar, or 0 for dumbbells and machines.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="warmup-increment">
              Smallest jump ({unit})
            </label>
            <input
              id="warmup-increment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              step="0.25"
              value={increment}
              onChange={(event) => setIncrement(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Twice your smallest plate — 2.5 kg with 1.25 kg discs.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="warmup-rest">
              Rest between warm-up sets (seconds)
            </label>
            <input
              id="warmup-rest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="15"
              value={rest}
              onChange={(event) => setRest(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="warmup-unit">
              Unit label
            </label>
            <select
              id="warmup-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Warm-up sets before the work set
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM0.format(result.warmUpSetCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to build a ramp."
                : `${NUM0.format(result.warmUpReps)} warm-up reps, then ${result.workSet.reps} at ${NUM.format(result.workSet.weight)} ${unit}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the warm-up ramp"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The ramp</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Set
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  % of top
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Weight
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Reps
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              ) : (
                result.allSets.map((set, index) => (
                  <tr
                    key={`${set.percentage}-${set.weight}-${index}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 font-semibold">
                      {set.isWorkSet ? "Work set" : index + 1}
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {set.percentage}%{set.isBarOnly ? " · empty bar" : ""}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">
                      {NUM.format(set.weight)} {unit}
                    </td>
                    <td className="py-2 text-right">{set.reps}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A ramp is a load progression, not a substitute for general movement preparation — do your
        mobility and pulse-raising work first. Informational only; speak to a coach or clinician if
        you are returning from injury.
      </p>
    </main>
  );
}
