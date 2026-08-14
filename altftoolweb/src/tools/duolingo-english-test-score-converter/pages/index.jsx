"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Languages, RotateCcw } from "lucide-react";

import { DET_MAX, DET_MIN, DET_STEP, DET_TO_IELTS, convertDetScore } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { score: "120" };
const DASH = "—";

export default function ToolHome() {
  const [score, setScore] = useState(DEFAULTS.score);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const result = useMemo(
    () => convertDetScore({ score: score.trim() === "" ? Number.NaN : Number(score) }),
    [score],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Duolingo English Test score conversion",
      `DET score: ${result.score}`,
      `IELTS equivalent (Duolingo concordance): ${result.ieltsLabel}`,
      `TOEFL iBT equivalent (derived via ETS linking table): ${result.toeflRange}`,
      `CEFR level: ${result.cefr}`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setScore(DEFAULTS.score);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["IELTS equivalent", DASH],
        ["TOEFL iBT equivalent", DASH],
        ["CEFR level", DASH],
      ]
    : [
        ["IELTS equivalent (Duolingo concordance)", result.ieltsLabel],
        ["TOEFL iBT equivalent (derived)", result.toeflRange],
        ["CEFR level", result.cefr],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Languages className="h-4 w-4" aria-hidden="true" />
          English Proficiency
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Duolingo English Test Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Map a Duolingo English Test score (10–160) to its IELTS band using Duolingo&apos;s
          published concordance, its CEFR level, and a TOEFL iBT range derived through the ETS
          linking table.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="det-score">
              DET overall score ({DET_MIN}–{DET_MAX}, steps of {DET_STEP})
            </label>
            <input
              id="det-score"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={DET_MIN}
              max={DET_MAX}
              step={DET_STEP}
              value={score}
              onChange={(event) => setScore(event.target.value)}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true" role="status">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              IELTS equivalent
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.ieltsLabel}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `DET ${result.score} sits at CEFR ${result.cefr} under Duolingo's published alignment.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
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
              aria-label="Reset to the default score"
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
        <h2 className="text-base font-semibold">DET to IELTS concordance (Duolingo)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  DET score
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  IELTS band
                </th>
              </tr>
            </thead>
            <tbody>
              {DET_TO_IELTS.map(([min, , label], index) => {
                const prevMin = index === 0 ? DET_MAX + 5 : DET_TO_IELTS[index - 1][0];
                const range = index === 0 ? `${min}–${DET_MAX}` : `${min}–${prevMin - 5}`;
                return (
                  <tr key={label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 tabular-nums">{range}</td>
                    <td className="py-2 text-right font-semibold">{label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational comparison only. The IELTS mapping is Duolingo&apos;s published concordance;
        the TOEFL range is derived by chaining it with the ETS TOEFL–IELTS linking table, so treat
        it as an approximation and always check the exact score your institution accepts.
      </p>
    </main>
  );
}
