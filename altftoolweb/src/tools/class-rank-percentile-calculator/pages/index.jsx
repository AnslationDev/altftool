"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Trophy } from "lucide-react";

import { computeRankPercentile } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { rank: "25", classSize: "500" };
const DASH = "—";

export default function ToolHome() {
  const [rank, setRank] = useState(DEFAULTS.rank);
  const [classSize, setClassSize] = useState(DEFAULTS.classSize);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeRankPercentile({
        rank: rank.trim() === "" ? Number.NaN : Number(rank),
        classSize: classSize.trim() === "" ? Number.NaN : Number(classSize),
      }),
    [rank, classSize],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Class rank percentile",
      `Rank ${INT.format(result.rank)} of ${INT.format(result.classSize)}`,
      `Top ${NUM.format(result.topPercent)}% of the class`,
      `Percentile: ${NUM.format(result.percentile)} (students ranked below you: ${INT.format(result.studentsBelow)})`,
      result.band,
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
    setRank(DEFAULTS.rank);
    setClassSize(DEFAULTS.classSize);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Top percent of class", DASH],
        ["Percentile", DASH],
        ["Students ranked below you", DASH],
        ["Top 10% (decile)", DASH],
        ["Top 25% (quartile)", DASH],
      ]
    : [
        ["Top percent of class", `Top ${NUM.format(result.topPercent)}%`],
        ["Percentile", NUM.format(result.percentile)],
        ["Students ranked below you", INT.format(result.studentsBelow)],
        ["Top 10% (decile)", result.topDecile ? "Yes" : "No"],
        ["Top 25% (quartile)", result.topQuartile ? "Yes" : "No"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          Admissions
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Class Rank Percentile Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Converts your class rank and class size into the &quot;top X%&quot; figure applications
          ask for (rank ÷ class size × 100) and your percentile — the share of the class ranked
          below you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="crp-rank">
              Your class rank (1 = top)
            </label>
            <input
              id="crp-rank"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={rank}
              onChange={(event) => setRank(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="crp-size">
              Class size (students ranked)
            </label>
            <input
              id="crp-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={classSize}
              onChange={(event) => setClassSize(event.target.value)}
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
              Your standing
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `Top ${NUM.format(result.topPercent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.band}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the class rank percentile result"
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
        Registrars usually give tied students the same (better) rank, and some schools rank only a
        subset of the class. Use the officially reported rank and ranked-class size from your
        transcript when filling in applications.
      </p>
    </main>
  );
}
