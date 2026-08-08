"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, Check, Copy, RotateCcw } from "lucide-react";

import { SECTION_MAX, SECTION_MIN, computeToefl } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  reading: "26",
  listening: "25",
  speaking: "23",
  writing: "24",
};

const DASH = "—";

const toNumber = (value) => (value.trim() === "" ? Number.NaN : Number(value));

export default function ToolHome() {
  const [reading, setReading] = useState(DEFAULTS.reading);
  const [listening, setListening] = useState(DEFAULTS.listening);
  const [speaking, setSpeaking] = useState(DEFAULTS.speaking);
  const [writing, setWriting] = useState(DEFAULTS.writing);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeToefl({
        reading: toNumber(reading),
        listening: toNumber(listening),
        speaking: toNumber(speaking),
        writing: toNumber(writing),
      }),
    [reading, listening, speaking, writing],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "TOEFL iBT score",
      `Reading: ${result.scores.reading} (${result.levels.reading})`,
      `Listening: ${result.scores.listening} (${result.levels.listening})`,
      `Speaking: ${result.scores.speaking} (${result.levels.speaking})`,
      `Writing: ${result.scores.writing} (${result.levels.writing})`,
      `Total: ${result.total} / ${result.totalMax}`,
      `IELTS equivalent (ETS linking table): ${result.ieltsLabel}`,
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
    setReading(DEFAULTS.reading);
    setListening(DEFAULTS.listening);
    setSpeaking(DEFAULTS.speaking);
    setWriting(DEFAULTS.writing);
    setCopied(false);
  };

  const fields = [
    ["toefl-reading", "Reading", reading, setReading],
    ["toefl-listening", "Listening", listening, setListening],
    ["toefl-speaking", "Speaking", speaking, setSpeaking],
    ["toefl-writing", "Writing", writing, setWriting],
  ];

  const rows = hasError
    ? [
        ["IELTS equivalent", DASH],
        ["Reading level", DASH],
        ["Listening level", DASH],
        ["Speaking level", DASH],
        ["Writing level", DASH],
      ]
    : [
        ["IELTS equivalent (ETS linking table)", result.ieltsLabel],
        ["Reading level", `${result.scores.reading} — ${result.levels.reading}`],
        ["Listening level", `${result.scores.listening} — ${result.levels.listening}`],
        ["Speaking level", `${result.scores.speaking} — ${result.levels.speaking}`],
        ["Writing level", `${result.scores.writing} — ${result.levels.writing}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
          English Proficiency
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">TOEFL Score Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sum your four TOEFL iBT section scores into the 0–120 total, see the ETS performance level
          for each section, and compare the total with IELTS bands using the official ETS linking
          table.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([id, label, value, setter]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label} ({SECTION_MIN}–{SECTION_MAX})
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={SECTION_MIN}
                max={SECTION_MAX}
                step="1"
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
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
              TOEFL iBT total
            </p>
            <p
              className="mt-1 text-4xl font-semibold text-[var(--primary)]"
              aria-live="polite"
              aria-atomic="true"
            >
              {hasError ? DASH : `${result.total} / ${result.totalMax}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Comparable to IELTS band ${result.ieltsLabel} under the ETS score comparison study.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the TOEFL score result"
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

        <div aria-live="polite" aria-atomic="true">
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">TOEFL total vs IELTS band (ETS linking table)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  TOEFL iBT total
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  IELTS band
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["118–120", "9.0"],
                ["115–117", "8.5"],
                ["110–114", "8.0"],
                ["102–109", "7.5"],
                ["94–101", "7.0"],
                ["79–93", "6.5"],
                ["60–78", "6.0"],
                ["46–59", "5.5"],
                ["35–45", "5.0"],
                ["32–34", "4.5"],
                ["0–31", "4.0 or below"],
              ].map(([range, band]) => (
                <tr key={range} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 tabular-nums">{range}</td>
                  <td className="py-2 text-right font-semibold">{band}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational comparison based on the ETS TOEFL–IELTS score linking study. Universities set
        their own required scores per test — always check the exact requirement for your programme
        rather than relying on converted equivalents.
      </p>
    </main>
  );
}
