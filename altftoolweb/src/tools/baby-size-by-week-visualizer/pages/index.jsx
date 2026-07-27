"use client";

import { useMemo, useState } from "react";
import { Apple, Check, Copy, RotateCcw } from "lucide-react";

import {
  MAX_WEEK,
  MIN_WEEK,
  fetalSizeForWeek,
  fetalSizeSeries,
  formatLength,
  formatWeight,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_WEEK = "24";
const DASH = "—";
const ALL_ROWS = fetalSizeSeries();

export default function ToolHome() {
  const [week, setWeek] = useState(DEFAULT_WEEK);
  const [showTable, setShowTable] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const trimmed = week.trim();
    if (trimmed === "") return { error: "Enter a gestational week as a number." };
    return fetalSizeForWeek(Number(trimmed));
  }, [week]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Baby size at ${result.week} weeks`,
      `Length (${result.lengthTypeLabel}): ${formatLength(result.lengthCm)}`,
      `Estimated weight: ${formatWeight(result.weightGrams)}`,
      `Roughly ${result.comparisonPhrase}`,
      result.weeklyGainGrams === null
        ? ""
        : `Gained about ${result.weeklyGainGrams} g since last week`,
      "Population averages, not a target for any individual pregnancy.",
    ]
      .filter(Boolean)
      .join("\n");
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
    setWeek(DEFAULT_WEEK);
    setShowTable(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Apple className="h-4 w-4" aria-hidden="true" />
          Pregnancy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Baby Size By Week Visualizer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Average length and weight for weeks {MIN_WEEK} to {MAX_WEEK}, with the everyday fruit or
          vegetable that matches. Crown-rump length up to week 19, head to heel from week 20.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bsw-week">
              Gestational week
            </label>
            <input
              id="bsw-week"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_WEEK}
              max={MAX_WEEK}
              step="1"
              value={week}
              onChange={(event) => setWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bsw-slider">
              Slide through the weeks
            </label>
            <input
              id="bsw-slider"
              className="mt-4 h-11 w-full accent-[var(--primary)]"
              type="range"
              min={MIN_WEEK}
              max={MAX_WEEK}
              step="1"
              value={hasError ? MIN_WEEK : result.week}
              onChange={(event) => setWeek(event.target.value)}
            />
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
              About the size of
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.comparisonName}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Pick a week between 8 and 40."
                : `Week ${result.week} · ${formatLength(result.lengthCm)} ${result.lengthTypeLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy baby size for this week"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to week 24" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Length", hasError ? DASH : formatLength(result.lengthCm)],
            [
              "Length measured",
              hasError ? DASH : `${result.lengthType} (${result.lengthTypeLabel})`,
            ],
            ["Estimated weight", hasError ? DASH : formatWeight(result.weightGrams)],
            [
              "Gain since last week",
              hasError || result.weeklyGainGrams === null ? DASH : `${result.weeklyGainGrams} g`,
            ],
            [
              "Share of average birth weight",
              hasError ? DASH : `${result.percentOfTermWeight.toFixed(0)}%`,
            ],
            [
              "Share of average birth length",
              hasError ? DASH : `${result.percentOfTermLength.toFixed(0)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 space-y-3">
            <div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${result.percentOfTermWeight.toFixed(0)} percent of average birth weight`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${Math.min(100, result.percentOfTermWeight)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Weight against a 3.4 kg term average</p>
            </div>
            <div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${result.percentOfTermLength.toFixed(0)} percent of average birth length`}
              >
                <span
                  className="block h-full bg-[var(--success)]"
                  style={{ width: `${Math.min(100, result.percentOfTermLength)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Length against a 51 cm term average</p>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Week by week table</h2>
          <button
            type="button"
            onClick={() => setShowTable((value) => !value)}
            aria-expanded={showTable}
            className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            {showTable ? "Hide" : "Show"}
          </button>
        </div>
        {showTable && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Week</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Length</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Weight</th>
                  <th scope="col" className="py-2 font-semibold">Compare</th>
                </tr>
              </thead>
              <tbody>
                {ALL_ROWS.map((row) => (
                  <tr
                    key={row.week}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      !hasError && row.week === result.week ? "bg-[var(--muted)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 font-semibold">{row.week}</td>
                    <td className="py-2 pr-3 text-right">{row.lengthCm.toFixed(1)} cm</td>
                    <td className="py-2 pr-3 text-right">
                      {row.weightGrams >= 1000
                        ? `${(row.weightGrams / 1000).toFixed(2)} kg`
                        : `${row.weightGrams} g`}
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">{row.comparisonName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Averages for information only. Scan-estimated fetal weight itself carries roughly a 10-15% margin
        of error, and healthy babies sit well above and below these figures — your sonographer&rsquo;s
        centile reading is the one that means something.
      </p>
    </main>
  );
}
