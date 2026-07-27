"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Target } from "lucide-react";

import { computeImprovementNeeded } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  obtainedSoFar: "320",
  maxSoFar: "500",
  remainingMax: "500",
  targetPercent: "75",
};

export default function ToolHome() {
  const [obtainedSoFar, setObtainedSoFar] = useState(DEFAULTS.obtainedSoFar);
  const [maxSoFar, setMaxSoFar] = useState(DEFAULTS.maxSoFar);
  const [remainingMax, setRemainingMax] = useState(DEFAULTS.remainingMax);
  const [targetPercent, setTargetPercent] = useState(DEFAULTS.targetPercent);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeImprovementNeeded({
        obtainedSoFar: obtainedSoFar.trim() === "" ? Number.NaN : obtainedSoFar,
        maxSoFar: maxSoFar.trim() === "" ? Number.NaN : maxSoFar,
        remainingMax: remainingMax.trim() === "" ? Number.NaN : remainingMax,
        targetPercent: targetPercent.trim() === "" ? Number.NaN : targetPercent,
      }),
    [obtainedSoFar, maxSoFar, remainingMax, targetPercent],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Improvement needed",
      `Scored so far: ${NUM.format(Number(obtainedSoFar))}/${NUM.format(Number(maxSoFar))} (${PCT.format(result.currentPercent)}%)`,
      `Target overall: ${PCT.format(Number(targetPercent))}%`,
      `Marks still needed: ${NUM.format(result.marksNeeded)}`,
      result.requiredPercentOfRemaining !== null
        ? `Required in remaining exams: ${PCT.format(result.requiredPercentOfRemaining)}%`
        : "No exams remaining",
      `Best possible overall: ${PCT.format(result.bestPossiblePercent)}%`,
      result.message,
    ].join("\n");
  }, [hasError, result, obtainedSoFar, maxSoFar, targetPercent]);

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
    setObtainedSoFar(DEFAULTS.obtainedSoFar);
    setMaxSoFar(DEFAULTS.maxSoFar);
    setRemainingMax(DEFAULTS.remainingMax);
    setTargetPercent(DEFAULTS.targetPercent);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Target className="h-4 w-4" aria-hidden="true" />
          Result analysis
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Improvement Needed Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter what you have scored so far, what remains, and your target overall
          percentage. The tool computes the exact marks still required and tells you whether
          the target is mathematically reachable.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="imp-obtained">
              Marks scored so far
            </label>
            <input
              id="imp-obtained"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              value={obtainedSoFar}
              onChange={(event) => setObtainedSoFar(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="imp-max">
              Maximum marks of exams already taken
            </label>
            <input
              id="imp-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              value={maxSoFar}
              onChange={(event) => setMaxSoFar(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="imp-remaining">
              Maximum marks still to be examined
            </label>
            <input
              id="imp-remaining"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              value={remainingMax}
              onChange={(event) => setRemainingMax(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Add up the totals of every paper you have not written yet.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="imp-target">
              Target overall percentage
            </label>
            <input
              id="imp-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="0.5"
              value={targetPercent}
              onChange={(event) => setTargetPercent(event.target.value)}
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
              Marks still needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.marksNeeded)}
            </p>
            <p
              className={`mt-1 max-w-md text-sm ${
                !hasError && !result.achievable
                  ? "font-medium text-[var(--danger)]"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              {hasError ? "Fix the input above to see a result." : result.message}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the improvement needed result"
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
          {[
            ["Current percentage", hasError ? DASH : `${PCT.format(result.currentPercent)}%`],
            [
              "Required in remaining exams",
              hasError || result.requiredPercentOfRemaining === null
                ? DASH
                : `${PCT.format(result.requiredPercentOfRemaining)}%`,
            ],
            [
              "Best possible overall percentage",
              hasError ? DASH : `${PCT.format(result.bestPossiblePercent)}%`,
            ],
            ["Combined maximum marks", hasError ? DASH : NUM.format(result.totalMax)],
            [
              "Target reachable?",
              hasError ? DASH : result.achievable ? "Yes" : "No",
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
        Marks needed are rounded up to the next whole mark, since fractions cannot be scored.
        Grace marks, moderation and internal-assessment weighting differ by board and are not
        included.
      </p>
    </main>
  );
}
