"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Percent, RotateCcw } from "lucide-react";

import { LETTER_BANDS, US_GPA_MAX, convertGpaToPercentage } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const GPA_FMT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { gpa: "3.5" };
const DASH = "—";

export default function ToolHome() {
  const [gpa, setGpa] = useState(DEFAULTS.gpa);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertGpaToPercentage({ gpa: gpa.trim() === "" ? Number.NaN : Number(gpa) }),
    [gpa],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "US GPA to percentage",
      `GPA: ${GPA_FMT.format(result.gpa)} / ${GPA_FMT.format(US_GPA_MAX)}`,
      `Linear conversion (GPA ÷ 4 × 100): ${NUM.format(result.linearPercentage)}%`,
      `Nearest US letter grade: ${result.letter} (${GPA_FMT.format(result.letterPoints)} points)`,
      `Typical percentage band for ${result.letter}: ${result.bandMin}–${result.bandMax}%`,
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
    setGpa(DEFAULTS.gpa);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Linear percentage", DASH],
        ["Nearest letter grade", DASH],
        ["Typical percentage band", DASH],
      ]
    : [
        ["Linear percentage (GPA ÷ 4 × 100)", `${NUM.format(result.linearPercentage)}%`],
        [
          "Nearest letter grade",
          `${result.letter} (${GPA_FMT.format(result.letterPoints)} points)`,
        ],
        ["Typical percentage band", `${result.bandMin}–${result.bandMax}%`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Percent className="h-4 w-4" aria-hidden="true" />
          Grade Conversion
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          US GPA to Percentage Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Converts a 4.0-scale GPA into the linear percentage (GPA ÷ 4 × 100) most application
          forms expect, plus the nearest US letter grade and its typical classroom percentage
          band.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="g2p-gpa">
              Cumulative GPA (4.0 scale)
            </label>
            <input
              id="g2p-gpa"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="4"
              step="0.01"
              value={gpa}
              onChange={(event) => setGpa(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Use your unweighted GPA — weighted GPAs above 4.0 have no standard percentage
              mapping.
            </p>
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
              Linear percentage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.linearPercentage)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Closest US letter grade: ${result.letter}, usually scored ${result.bandMin}–${result.bandMax}% in class.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the GPA to percentage result"
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
        <h2 className="text-base font-semibold">US letter grade table</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Letter
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Grade points
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Percentage band
                </th>
              </tr>
            </thead>
            <tbody>
              {LETTER_BANDS.map((band) => (
                <tr key={band.letter} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{band.letter}</td>
                  <td className="py-2 pr-3">{GPA_FMT.format(band.points)}</td>
                  <td className="py-2 text-right">
                    {band.pctMin}–{band.pctMax}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Approximation only. US institutions do not officially convert GPA to percentages; when a
        form demands one, state the method you used (linear GPA ÷ 4 × 100 is the most commonly
        requested) and attach your transcript.
      </p>
    </main>
  );
}
