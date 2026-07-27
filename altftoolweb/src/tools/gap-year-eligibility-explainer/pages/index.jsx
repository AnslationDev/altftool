"use client";

import { useMemo, useState } from "react";
import { CalendarRange, Check, Copy, RotateCcw } from "lucide-react";

import { EXAM_RULES, assessGapEligibility } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { examId: "jee-main", passYear: "2024", attemptYear: "2026" };
const DASH = "—";

export default function ToolHome() {
  const [examId, setExamId] = useState(DEFAULTS.examId);
  const [passYear, setPassYear] = useState(DEFAULTS.passYear);
  const [attemptYear, setAttemptYear] = useState(DEFAULTS.attemptYear);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => assessGapEligibility({ examId, passYear, attemptYear }),
    [examId, passYear, attemptYear],
  );
  const hasError = Boolean(result.error);

  const verdictText = hasError
    ? DASH
    : result.allowed
      ? result.hasCap
        ? "Within the window"
        : "No gap limit"
      : "Outside the window";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Gap-year check — ${result.exam.label}`,
      `Class 12 passed: ${passYear}, attempt: ${attemptYear} (gap of ${NUM.format(result.gapYears)} year${result.gapYears === 1 ? "" : "s"})`,
      `Verdict: ${verdictText}`,
      result.hasCap
        ? `Rule: maximum gap ${result.maxGapYears} year${result.maxGapYears === 1 ? "" : "s"}; last eligible attempt year ${result.lastEligibleYear}`
        : "Rule: no gap-year cap for this exam",
      `Summary: ${result.summary}`,
      `Proof: ${result.proof.join(" ")}`,
    ].join("\n");
  }, [hasError, result, passYear, attemptYear, verdictText]);

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
    setExamId(DEFAULTS.examId);
    setPassYear(DEFAULTS.passYear);
    setAttemptYear(DEFAULTS.attemptYear);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarRange className="h-4 w-4" aria-hidden="true" />
          Eligibility Checks
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gap Year Eligibility Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every exam treats a gap after Class 12 differently — NEET has no cap, JEE Main allows two
          years, JEE Advanced one. Enter your passing year and intended attempt to see the rule
          that applies and the proof, if any, you will be asked for.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gap-exam">
              Exam
            </label>
            <select
              id="gap-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              value={examId}
              onChange={(event) => {
                setCopied(false);
                setExamId(event.target.value);
              }}
            >
              {EXAM_RULES.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gap-pass">
              Year you passed Class 12
            </label>
            <input
              id="gap-pass"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1980"
              max="2100"
              step="1"
              value={passYear}
              onChange={(event) => {
                setCopied(false);
                setPassYear(event.target.value);
              }}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              For JEE Advanced, use the year you FIRST appeared in Class 12.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gap-attempt">
              Intended attempt / admission year
            </label>
            <input
              id="gap-attempt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1980"
              max="2100"
              step="1"
              value={attemptYear}
              onChange={(event) => {
                setCopied(false);
                setAttemptYear(event.target.value);
              }}
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
              Gap-year verdict
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError
                  ? "text-[var(--primary)]"
                  : result.allowed
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {verdictText}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the gap year eligibility result"
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
          {(hasError
            ? [
                ["Your gap", DASH],
                ["Gap limit for this exam", DASH],
                ["Last eligible attempt year", DASH],
              ]
            : [
                ["Your gap", `${NUM.format(result.gapYears)} year${result.gapYears === 1 ? "" : "s"}`],
                [
                  "Gap limit for this exam",
                  result.hasCap
                    ? `${result.maxGapYears} year${result.maxGapYears === 1 ? "" : "s"} after passing`
                    : "None",
                ],
                [
                  "Last eligible attempt year",
                  result.hasCap ? String(result.lastEligibleYear) : "Any year",
                ],
                ...(result.hasCap && !result.allowed
                  ? [["Over the window by", `${NUM.format(result.yearsOver)} year${result.yearsOver === 1 ? "" : "s"}`]]
                  : []),
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <h3 className="text-sm font-semibold">Proof you may be asked for</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
              {result.proof.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{result.caveat}</p>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Gap rules at a glance</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Exam
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Maximum gap after Class 12
                </th>
              </tr>
            </thead>
            <tbody>
              {EXAM_RULES.map((rule) => (
                <tr key={rule.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{rule.label}</td>
                  <td className="py-2 text-right font-semibold">
                    {Number.isInteger(rule.maxGapYears)
                      ? `${rule.maxGapYears} year${rule.maxGapYears === 1 ? "" : "s"}`
                      : "No limit"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational summary of eligibility clauses from recent bulletins and brochures; age
        limits, attempt counts and board-mark conditions apply separately, and rules can change
        each cycle. Verify against the current information bulletin of the exam before planning a
        drop year.
      </p>
    </main>
  );
}
