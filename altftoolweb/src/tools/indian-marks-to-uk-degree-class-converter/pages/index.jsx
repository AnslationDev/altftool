"use client";

import { useMemo, useState } from "react";
import { Award, Check, Copy, RotateCcw } from "lucide-react";

import { INSTITUTION_TIERS, convertToUkClass } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { percentage: "62", tierId: "standard" };
const DASH = "—";

export default function ToolHome() {
  const [percentage, setPercentage] = useState(DEFAULTS.percentage);
  const [tierId, setTierId] = useState(DEFAULTS.tierId);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      convertToUkClass({
        percentage: percentage.trim() === "" ? Number.NaN : Number(percentage),
        tierId,
      }),
    [percentage, tierId],
  );

  const hasError = Boolean(result.error);
  const tier = INSTITUTION_TIERS.find((t) => t.id === tierId) ?? INSTITUTION_TIERS[0];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Indian marks to UK degree class",
      `Percentage: ${NUM.format(result.percentage)}%`,
      `Institution type: ${result.tier}`,
      `UK equivalent: ${result.className} (${result.short})`,
      result.nextBand && result.marksToNext > 0
        ? `Marks to the next class (${result.nextBand.short}): ${NUM.format(result.marksToNext)}`
        : null,
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
    setPercentage(DEFAULTS.percentage);
    setTierId(DEFAULTS.tierId);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["UK class equivalent", DASH],
        ["Your percentage", DASH],
        ["Marks to the next class", DASH],
      ]
    : [
        ["UK class equivalent", result.className],
        ["Your percentage", `${NUM.format(result.percentage)}%`],
        [
          "Marks to the next class",
          result.nextBand && result.marksToNext > 0
            ? `${NUM.format(result.marksToNext)} (to ${result.nextBand.short})`
            : "Already in the top class",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Award className="h-4 w-4" aria-hidden="true" />
          Grade Conversion
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Indian Marks to UK Degree Class
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Maps your Indian degree percentage onto the UK First, 2:1, 2:2 and Third classes using
          the equivalency thresholds UK universities publish for Indian qualifications — including
          the lower boundaries many apply to premier institutions.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ukc-pct">
              Overall degree percentage
            </label>
            <input
              id="ukc-pct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.1"
              value={percentage}
              onChange={(event) => setPercentage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ukc-tier">
              Institution type
            </label>
            <select
              id="ukc-tier"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tierId}
              onChange={(event) => setTierId(event.target.value)}
            >
              {INSTITUTION_TIERS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
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
              UK equivalent class
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.short}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.className}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the UK class equivalence result"
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Thresholds applied — {tier.label}</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Indian percentage
                </th>
                <th scope="col" className="py-2 font-semibold">
                  UK class equivalent
                </th>
              </tr>
            </thead>
            <tbody>
              {tier.thresholds.map((band) => (
                <tr key={band.short} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{band.min}% and above</td>
                  <td className="py-2 font-semibold">
                    {band.className} ({band.short})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Indicative only. Each UK university sets its own equivalency table — some ask 65% for a
        2:1 from Indian universities, others accept 55% — so always check the entry requirements
        page of the specific programme, or the university&apos;s country-specific guidance for
        India.
      </p>
    </main>
  );
}
