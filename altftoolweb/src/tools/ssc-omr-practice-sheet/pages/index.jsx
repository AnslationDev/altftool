"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, Printer, RotateCcw } from "lucide-react";

import {
  DEFAULT_ROLL_COLUMNS,
  MAX_ROLL_COLUMNS,
  MIN_ROLL_COLUMNS,
  ROLL_DIGIT_ROWS,
  SHEET_PATTERNS,
  buildSscSheet,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  patternId: SHEET_PATTERNS[0].id,
  rollColumns: String(DEFAULT_ROLL_COLUMNS),
};

const DASH = "—";

function Bubble({ label }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-[var(--foreground)] text-[10px] leading-none text-[var(--foreground)]"
    >
      {label}
    </span>
  );
}

export default function ToolHome() {
  const [patternId, setPatternId] = useState(DEFAULTS.patternId);
  const [rollColumns, setRollColumns] = useState(DEFAULTS.rollColumns);
  const [copied, setCopied] = useState(false);

  const sheet = useMemo(
    () =>
      buildSscSheet({
        patternId,
        rollColumns: rollColumns.trim() === "" ? Number.NaN : Number(rollColumns),
      }),
    [patternId, rollColumns],
  );

  const hasError = Boolean(sheet.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "SSC OMR practice sheet",
      `Pattern: ${sheet.pattern.label}`,
      `Questions: ${NUM.format(sheet.totalQuestions)}`,
      `Total marks: ${NUM.format(sheet.totalMarks)}`,
      `Marks per question: ${NUM.format(sheet.marksPerQuestion)}`,
      `Negative per wrong answer: ${NUM.format(sheet.negativePerWrong)}`,
      `Roll number columns: ${NUM.format(sheet.rollColumns)}`,
    ].join("\n");
  }, [hasError, sheet]);

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
    setPatternId(DEFAULTS.patternId);
    setRollColumns(DEFAULTS.rollColumns);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Questions", DASH],
        ["Total marks", DASH],
        ["Negative marking", DASH],
        ["Roll number columns", DASH],
      ]
    : [
        ["Questions", NUM.format(sheet.totalQuestions)],
        ["Total marks", NUM.format(sheet.totalMarks)],
        ["Marks per question", NUM.format(sheet.marksPerQuestion)],
        ["Negative per wrong answer", NUM.format(sheet.negativePerWrong)],
        ["Options per question", sheet.optionLabels.join(" ")],
        ["Roll number columns", NUM.format(sheet.rollColumns)],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <style>{`@media print { body * { visibility: hidden; } #ssc-omr-sheet, #ssc-omr-sheet * { visibility: visible; } #ssc-omr-sheet { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; } }`}</style>

      <header className="mb-6 print:hidden">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          OMR Practice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          SSC OMR Practice Sheet
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Print an SSC-style OMR answer sheet — A to D bubbles, part-wise question blocks and a roll
          number grid — matching the CGL and CHSL Tier-I structure for timed mock-test practice.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-pattern">
              Paper pattern
            </label>
            <select
              id="ssc-pattern"
              className={`mt-2 ${INPUT_CLASS}`}
              value={patternId}
              onChange={(event) => setPatternId(event.target.value)}
            >
              {SHEET_PATTERNS.map((pattern) => (
                <option key={pattern.id} value={pattern.id}>
                  {pattern.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-roll-cols">
              Roll number columns ({MIN_ROLL_COLUMNS}–{MAX_ROLL_COLUMNS})
            </label>
            <input
              id="ssc-roll-cols"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_ROLL_COLUMNS}
              max={MAX_ROLL_COLUMNS}
              step="1"
              value={rollColumns}
              onChange={(event) => setRollColumns(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)] print:hidden"
        >
          {sheet.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Questions on this sheet
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(sheet.totalQuestions)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to build the sheet."
                : `${NUM.format(sheet.totalMarks)} marks in total — ${NUM.format(sheet.marksPerQuestion)} per question, minus ${NUM.format(sheet.negativePerWrong)} per wrong answer.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the sheet summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={hasError}
              aria-label="Print the OMR practice sheet"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print sheet
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={GHOST_BTN}
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

      {!hasError ? (
        <section
          id="ssc-omr-sheet"
          className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        >
          <div className="border-b-2 border-[var(--foreground)] pb-3 text-center">
            <h2 className="text-lg font-bold uppercase tracking-wide">
              Staff Selection Commission — OMR Practice Answer Sheet
            </h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Darken one bubble fully per question. Each question carries{" "}
              {NUM.format(sheet.marksPerQuestion)} mark(s); {NUM.format(sheet.negativePerWrong)} is
              deducted for a wrong answer.
            </p>
          </div>

          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide">Roll Number</h3>
              <div className="mt-2 overflow-x-auto">
                <div className="inline-block border border-[var(--foreground)] p-2">
                  <div className="flex gap-1">
                    {Array.from({ length: sheet.rollColumns }, (_, col) => (
                      <div key={col} className="flex flex-col items-center gap-1">
                        <span className="flex h-6 w-5 items-center justify-center border border-[var(--foreground)] text-[10px]" />
                        {ROLL_DIGIT_ROWS.map((digit) => (
                          <Bubble key={digit} label={String(digit)} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide">Test Form Number</h3>
              <div className="mt-2 inline-flex items-center gap-3 border border-[var(--foreground)] p-3">
                {["A", "B", "C", "D"].map((code) => (
                  <span key={code} className="flex items-center gap-1 text-xs font-semibold">
                    {code}
                    <Bubble label="" />
                  </span>
                ))}
              </div>
              <div className="mt-4 space-y-3 text-xs">
                <p className="border-b border-[var(--foreground)] pb-1">
                  Candidate&apos;s Name: ____________________________
                </p>
                <p className="border-b border-[var(--foreground)] pb-1">
                  Candidate&apos;s Signature: ____________________________
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {sheet.blocks.map((block) => (
              <div key={block.name}>
                <h3 className="border-b border-[var(--foreground)] pb-1 text-sm font-bold uppercase tracking-wide">
                  {block.name} (Q{block.start}–Q{block.end})
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 md:grid-cols-4">
                  {block.questions.map((q) => (
                    <div key={q} className="flex items-center gap-1.5 text-xs">
                      <span className="w-8 shrink-0 text-right font-semibold tabular-nums">
                        {q}.
                      </span>
                      {sheet.optionLabels.map((option) => (
                        <Bubble key={option} label={option} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)] print:hidden">
        Practice layout for self-study only — SSC Tier-I examinations are now computer-based; this
        sheet mirrors the part structure and marking scheme for offline mock-test practice and is
        not an official SSC document.
      </p>
    </main>
  );
}
