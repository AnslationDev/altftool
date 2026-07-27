"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import {
  COUNTED_SUBJECTS,
  MAX_MARKS_PER_SUBJECT,
  PASS_MARK_PERCENT,
  RESULT_CLASSES,
  computeHscResult,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SUBJECT_LABELS = [
  "Subject 2 (e.g. Physics / Economics)",
  "Subject 3 (e.g. Chemistry / Book-Keeping)",
  "Subject 4 (e.g. Maths / Secretarial Practice)",
  "Subject 5 (e.g. Biology / OC)",
  "Subject 6 (e.g. Second language / IT)",
];

const DEFAULTS = {
  english: "78",
  others: ["82", "74", "88", "69", "91"],
  additional: "",
  hasAdditional: false,
};

const DASH = "—";

export default function ToolHome() {
  const [english, setEnglish] = useState(DEFAULTS.english);
  const [others, setOthers] = useState(DEFAULTS.others);
  const [hasAdditional, setHasAdditional] = useState(DEFAULTS.hasAdditional);
  const [additional, setAdditional] = useState(DEFAULTS.additional);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const toNumber = (v) => (String(v).trim() === "" ? Number.NaN : Number(v));
    const otherMarks = others.map(toNumber);
    if (hasAdditional) otherMarks.push(toNumber(additional));
    return computeHscResult({ englishMarks: toNumber(english), otherMarks });
  }, [english, others, hasAdditional, additional]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Maharashtra HSC percentage",
      `Total: ${NUM.format(result.totalObtained)} / ${NUM.format(result.totalMax)}`,
      `Percentage: ${NUM.format(result.percentage)}%`,
      `Result: ${result.resultClass}`,
      result.droppedMarks !== null
        ? `Lowest additional-subject score dropped: ${NUM.format(result.droppedMarks)}`
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
    setEnglish(DEFAULTS.english);
    setOthers(DEFAULTS.others);
    setHasAdditional(DEFAULTS.hasAdditional);
    setAdditional(DEFAULTS.additional);
    setCopied(false);
  };

  const setOtherAt = (index, value) => {
    setOthers((prev) => prev.map((v, i) => (i === index ? value : v)));
  };

  const rows = hasError
    ? [
        ["Marks counted", DASH],
        ["Percentage", DASH],
        ["Pass status", DASH],
        ["Result class", DASH],
      ]
    : [
        ["Marks counted", `${NUM.format(result.totalObtained)} / ${NUM.format(result.totalMax)}`],
        ["Percentage", `${NUM.format(result.percentage)}%`],
        [
          "Pass status",
          result.passed
            ? "Passed (35+ in every subject)"
            : `Fail — ${result.failedSubjects} subject${result.failedSubjects === 1 ? "" : "s"} below ${result.passMark}`,
        ],
        ["Result class", result.resultClass],
        ...(result.droppedMarks !== null
          ? [["Lowest score dropped (additional subject rule)", NUM.format(result.droppedMarks)]]
          : []),
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          MSBSHSE Std XII
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Maharashtra HSC Percentage Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your marks out of {MAX_MARKS_PER_SUBJECT} per subject. The percentage is computed on{" "}
          {COUNTED_SUBJECTS} subjects (base 600); with an additional seventh subject the board counts
          English plus your best five other scores.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hsc-english">
              English (compulsory)
            </label>
            <input
              id="hsc-english"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_MARKS_PER_SUBJECT}
              value={english}
              onChange={(event) => setEnglish(event.target.value)}
            />
          </div>
          {SUBJECT_LABELS.map((label, index) => (
            <div key={label}>
              <label className={LABEL_CLASS} htmlFor={`hsc-sub-${index + 2}`}>
                {label}
              </label>
              <input
                id={`hsc-sub-${index + 2}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max={MAX_MARKS_PER_SUBJECT}
                value={others[index]}
                onChange={(event) => setOtherAt(index, event.target.value)}
              />
            </div>
          ))}
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="hsc-has-additional"
        >
          <input
            id="hsc-has-additional"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={hasAdditional}
            onChange={(event) => setHasAdditional(event.target.checked)}
          />
          I offered an additional (seventh) subject
        </label>

        {hasAdditional ? (
          <div className="mt-3 sm:max-w-xs">
            <label className={LABEL_CLASS} htmlFor="hsc-additional">
              Additional subject marks
            </label>
            <input
              id="hsc-additional"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_MARKS_PER_SUBJECT}
              value={additional}
              onChange={(event) => setAdditional(event.target.value)}
            />
          </div>
        ) : null}
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
              HSC percentage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.percentage)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Result class: ${result.resultClass}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the HSC percentage result"
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
        <h2 className="text-base font-semibold">MSBSHSE result classes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Aggregate percentage
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Class awarded
                </th>
              </tr>
            </thead>
            <tbody>
              {RESULT_CLASSES.map((band) => (
                <tr key={band.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{band.minPercent}% and above</td>
                  <td className="py-2 text-right font-semibold">{band.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          A minimum of {PASS_MARK_PERCENT}% ({(PASS_MARK_PERCENT / 100) * MAX_MARKS_PER_SUBJECT}{" "}
          marks) is required in each subject to pass. Environment Education and Health &amp;
          Physical Education are graded separately and never enter the percentage. Always confirm
          against your official MSBSHSE marksheet.
        </p>
      </section>
    </main>
  );
}
