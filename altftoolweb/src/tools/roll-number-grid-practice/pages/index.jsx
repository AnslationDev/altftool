"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Grid3x3, ListChecks, RotateCcw, Shuffle } from "lucide-react";

import {
  DEFAULT_DIGITS,
  DIGIT_ROWS,
  MAX_DIGITS,
  MIN_DIGITS,
  STATUS,
  evaluateGrid,
  generateRollNumber,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const DEFAULT_SEED = 20260726;

const STATUS_LABEL = {
  [STATUS.CORRECT]: "Correct",
  [STATUS.WRONG]: "Wrong digit",
  [STATUS.MISSING]: "Left blank",
  [STATUS.MULTIPLE]: "Multiple marks",
};

export default function ToolHome() {
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [digitCount, setDigitCount] = useState(String(DEFAULT_DIGITS));
  const [marks, setMarks] = useState({});
  const [checked, setChecked] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(null);
  const [copied, setCopied] = useState(false);

  const generated = useMemo(
    () =>
      generateRollNumber({
        seed,
        length: digitCount.trim() === "" ? Number.NaN : Number(digitCount),
      }),
    [seed, digitCount],
  );

  const hasError = Boolean(generated.error);
  const target = hasError ? "" : generated.digits;

  const marksArray = useMemo(
    () => Array.from({ length: target.length }, (_, col) => marks[col] ?? []),
    [target, marks],
  );

  const result = useMemo(
    () => (checked && !hasError ? evaluateGrid({ target, marks: marksArray }) : null),
    [checked, hasError, target, marksArray],
  );

  const toggleMark = (col, digit) => {
    if (startedAt === null) setStartedAt(Date.now());
    setChecked(false);
    setElapsedMs(null);
    setMarks((prev) => {
      const current = prev[col] ?? [];
      const next = current.includes(digit)
        ? current.filter((d) => d !== digit)
        : [...current, digit];
      return { ...prev, [col]: next };
    });
  };

  const checkGrid = () => {
    setChecked(true);
    if (startedAt !== null) setElapsedMs(Date.now() - startedAt);
  };

  const newNumber = () => {
    setSeed((s) => s + 1);
    setMarks({});
    setChecked(false);
    setStartedAt(null);
    setElapsedMs(null);
    setCopied(false);
  };

  const reset = () => {
    setSeed(DEFAULT_SEED);
    setDigitCount(String(DEFAULT_DIGITS));
    setMarks({});
    setChecked(false);
    setStartedAt(null);
    setElapsedMs(null);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!result || result.error) return "";
    return [
      "Roll number grid practice",
      `Target: ${target}`,
      `Accuracy: ${NUM.format(result.accuracyPercent)}%`,
      `Correct: ${result.correct}/${result.total}`,
      `Wrong: ${result.wrong}, blank: ${result.missing}, multiple marks: ${result.multiple}`,
      elapsedMs !== null ? `Time: ${NUM.format(elapsedMs / 1000)} s` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [result, target, elapsedMs]);

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

  const columnStatus = (col) => (result && !result.error ? result.columns[col]?.status : null);

  const bubbleClass = (col, digit) => {
    const marked = (marks[col] ?? []).includes(digit);
    const status = columnStatus(col);
    let ring = "border-[var(--border)]";
    if (marked && status === STATUS.CORRECT) ring = "border-[var(--success)]";
    else if (marked && (status === STATUS.WRONG || status === STATUS.MULTIPLE))
      ring = "border-[var(--danger)]";
    else if (marked) ring = "border-[var(--primary)]";
    return `flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-semibold transition active:scale-[0.95] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${ring} ${
      marked
        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
        : "bg-[var(--background)] text-[var(--foreground)]"
    }`;
  };

  const rows =
    result && !result.error
      ? [
          ["Correct columns", `${result.correct} of ${result.total}`],
          ["Wrong digit", String(result.wrong)],
          ["Left blank", String(result.missing)],
          ["Multiple marks (scanner rejects)", String(result.multiple)],
          ["Time taken", elapsedMs !== null ? `${NUM.format(elapsedMs / 1000)} s` : DASH],
        ]
      : [
          ["Correct columns", DASH],
          ["Wrong digit", DASH],
          ["Left blank", DASH],
          ["Multiple marks (scanner rejects)", DASH],
          ["Time taken", DASH],
        ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Grid3x3 className="h-4 w-4" aria-hidden="true" />
          OMR Practice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Roll Number Grid Practice
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Bubble the roll number below into the 0–9 grid exactly as on a real OMR sheet, then check
          yourself — blanks and double marks are flagged the way a scanner would reject them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="roll-digits">
              Number of digits ({MIN_DIGITS}–{MAX_DIGITS})
            </label>
            <input
              id="roll-digits"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_DIGITS}
              max={MAX_DIGITS}
              step="1"
              value={digitCount}
              onChange={(event) => {
                setDigitCount(event.target.value);
                setMarks({});
                setChecked(false);
                setStartedAt(null);
                setElapsedMs(null);
              }}
            />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={newNumber} className={`${GHOST_BTN} w-full`}>
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              New roll number
            </button>
          </div>
        </div>

        {hasError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {generated.error}
          </p>
        ) : (
          <>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Fill this roll number
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold tracking-[0.3em] text-[var(--primary)]">
              {target}
            </p>

            <div className="mt-4 overflow-x-auto pb-2">
              <div className="inline-flex gap-2">
                {Array.from({ length: target.length }, (_, col) => (
                  <div key={col} className="flex flex-col items-center gap-1.5">
                    <span className="flex h-8 w-11 items-center justify-center border border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)]">
                      {result && !result.error ? STATUS_LABEL[result.columns[col].status][0] : ""}
                    </span>
                    {DIGIT_ROWS.map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        aria-pressed={(marks[col] ?? []).includes(digit)}
                        aria-label={`Column ${col + 1}, digit ${digit}`}
                        onClick={() => toggleMark(col, digit)}
                        className={bubbleClass(col, digit)}
                      >
                        {digit}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={checkGrid} className={PRIMARY_BTN}>
                <ListChecks className="h-4 w-4" aria-hidden="true" />
                Check my grid
              </button>
            </div>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Accuracy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result && !result.error ? `${NUM.format(result.accuracyPercent)}%` : DASH}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {result && !result.error
                ? result.allCorrect
                  ? "Perfect grid — a scanner would read this roll number correctly."
                  : "Any blank or double-marked column would corrupt your roll number on a real OMR."
                : "Fill the grid and press “Check my grid” to see your score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!summary}
              aria-label="Copy the practice result"
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
              aria-label="Reset the practice grid"
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
        On real OMR sheets a column left blank reads as no digit and a column with two marks is
        rejected, so a single grid mistake can misroute your entire result. Practise until you can
        fill your full roll number correctly in under 30 seconds.
      </p>
    </main>
  );
}
