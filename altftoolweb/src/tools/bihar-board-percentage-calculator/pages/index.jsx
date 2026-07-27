"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  COUNTED_SUBJECTS,
  DIVISIONS,
  LEVELS,
  MAX_MARKS_PER_SUBJECT,
  PASS_MARK_PERCENT,
  TOTAL_MAX,
  computeBsebResult,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const MATRIC_SUBJECTS = ["Hindi / Mother tongue", "Second language", "Mathematics", "Science", "Social Science"];
const INTER_SUBJECTS = ["Language paper 1", "Language paper 2", "Subject 3", "Subject 4", "Subject 5"];

const DEFAULTS = {
  level: "matric",
  matricMarks: ["72", "65", "80", "58", "69"],
  interMarks: ["70", "62", "76", "68", "59"],
};

const DASH = "—";

export default function ToolHome() {
  const [level, setLevel] = useState(DEFAULTS.level);
  const [matricMarks, setMatricMarks] = useState(DEFAULTS.matricMarks);
  const [interMarks, setInterMarks] = useState(DEFAULTS.interMarks);
  const [copied, setCopied] = useState(false);

  const isMatric = level === "matric";
  const marks = isMatric ? matricMarks : interMarks;
  const subjectNames = isMatric ? MATRIC_SUBJECTS : INTER_SUBJECTS;

  const result = useMemo(() => {
    const parsed = marks.map((v) => (String(v).trim() === "" ? Number.NaN : Number(v)));
    return computeBsebResult({ level, marks: parsed });
  }, [level, marks]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Bihar Board ${result.levelLabel}`,
      `Total: ${NUM.format(result.totalObtained)} / ${NUM.format(result.totalMax)}`,
      `Percentage: ${NUM.format(result.percentage)}%`,
      `Division: ${result.division}`,
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
    setLevel(DEFAULTS.level);
    setMatricMarks(DEFAULTS.matricMarks);
    setInterMarks(DEFAULTS.interMarks);
    setCopied(false);
  };

  const setMarkAt = (index, value) => {
    if (isMatric) {
      setMatricMarks((prev) => prev.map((v, i) => (i === index ? value : v)));
    } else {
      setInterMarks((prev) => prev.map((v, i) => (i === index ? value : v)));
    }
  };

  const rows = hasError
    ? [
        ["Total marks", DASH],
        ["Percentage", DASH],
        ["Pass status", DASH],
        ["Division", DASH],
      ]
    : [
        ["Total marks", `${NUM.format(result.totalObtained)} / ${NUM.format(result.totalMax)}`],
        ["Percentage", `${NUM.format(result.percentage)}%`],
        [
          "Pass status",
          result.passed
            ? `Passed (${PASS_MARK_PERCENT}%+ in every subject and aggregate)`
            : result.failedSubjects > 0
              ? `Fail — ${result.failedSubjects} subject${result.failedSubjects === 1 ? "" : "s"} below ${result.passMark}`
              : `Fail — aggregate below ${NUM.format(result.aggregatePassMark)}`,
        ],
        ["Division", result.division],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          BSEB Patna
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bihar Board Percentage Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter marks in the {COUNTED_SUBJECTS} compulsory subjects (out of {MAX_MARKS_PER_SUBJECT}{" "}
          each). BSEB declares the result on a {TOTAL_MAX}-mark aggregate; the optional sixth
          subject is not added to it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="bseb-level">
            Examination level
          </label>
          <select
            id="bseb-level"
            className={`mt-2 ${INPUT_CLASS} sm:max-w-xs`}
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            {Object.values(LEVELS).map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {marks.map((value, index) => (
            <div key={`${level}-${subjectNames[index]}`}>
              <label className={LABEL_CLASS} htmlFor={`bseb-sub-${index}`}>
                {subjectNames[index]} (out of {MAX_MARKS_PER_SUBJECT})
              </label>
              <input
                id={`bseb-sub-${index}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max={MAX_MARKS_PER_SUBJECT}
                value={value}
                onChange={(event) => setMarkAt(index, event.target.value)}
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
              {isMatric ? "Matric percentage" : "Inter percentage"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.percentage)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : `Division: ${result.division}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Bihar Board percentage result"
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
        <h2 className="text-base font-semibold">BSEB divisions on 500 marks</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Aggregate marks
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Division
                </th>
              </tr>
            </thead>
            <tbody>
              {DIVISIONS.map((band) => (
                <tr key={band.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    {NUM.format(band.minMarks)}+ of {NUM.format(TOTAL_MAX)} ({band.minPercent}%)
                  </td>
                  <td className="py-2 text-right font-semibold">{band.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Pass requires {PASS_MARK_PERCENT}% in each subject and in the aggregate. Informational
          only — your official BSEB marksheet always prevails.
        </p>
      </section>
    </main>
  );
}
