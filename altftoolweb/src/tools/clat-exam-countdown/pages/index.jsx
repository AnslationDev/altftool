"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import {
  CURRENT_AFFAIRS_MONTHS,
  EXAM_DURATION_MINUTES,
  MARK_CORRECT,
  MOCK_PHASE_DAYS,
  PENALTY_WRONG,
  TOTAL_MARKS,
  TOTAL_QUESTIONS,
  buildClatPlan,
  projectedScore,
  toLocalISODate,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  examISO: "2026-12-06",
  mocksPerWeek: "2",
  caMonthsCovered: "4",
  practice: "60",
  attempted: "110",
  accuracy: "80",
};

export default function ToolHome() {
  const [todayISO] = useState(() => toLocalISODate(new Date()));
  const [examISO, setExamISO] = useState(DEFAULTS.examISO);
  const [mocksPerWeek, setMocksPerWeek] = useState(DEFAULTS.mocksPerWeek);
  const [caMonthsCovered, setCaMonthsCovered] = useState(DEFAULTS.caMonthsCovered);
  const [practice, setPractice] = useState(DEFAULTS.practice);
  const [attempted, setAttempted] = useState(DEFAULTS.attempted);
  const [accuracy, setAccuracy] = useState(DEFAULTS.accuracy);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildClatPlan({
        todayISO,
        examISO,
        mocksPerWeek: Number(mocksPerWeek),
        caMonthsCovered: Number(caMonthsCovered),
        dailyPracticeQuestions: Number(practice),
      }),
    [todayISO, examISO, mocksPerWeek, caMonthsCovered, practice],
  );

  const score = useMemo(
    () => projectedScore({ attempted: Number(attempted), accuracyPercent: Number(accuracy) }),
    [attempted, accuracy],
  );

  const hasError = Boolean(plan.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "CLAT exam countdown",
      `Exam date: ${examISO}`,
      `Days left: ${NUM.format(plan.daysToExam)} (${NUM.format(plan.weeksToExam)} weeks + ${NUM.format(plan.spareDays)} days)`,
      `Full mocks possible at ${mocksPerWeek}/week: ${NUM.format(plan.mocksPossible)}`,
      `Current affairs: ${NUM.format(plan.caMonthsCovered)}/${CURRENT_AFFAIRS_MONTHS} months covered, ${NUM.format(plan.caMonthsLeft)} to go`,
    ];
    if (plan.caDaysPerMonth !== null && plan.caMonthsLeft > 0) {
      lines.push(`CA pace needed: one month of news every ${NUM1.format(plan.caDaysPerMonth)} days before the mock phase`);
    }
    plan.phases.forEach((phase) => {
      lines.push(`${phase.label}: ${phase.fromISO} to ${phase.toISO} (${NUM.format(phase.days)} days)`);
    });
    plan.sections.forEach((section) => {
      lines.push(`${section.label}: ~${NUM.format(Math.round(section.dailyQuestionTarget))} questions/day`);
    });
    return lines.join("\n");
  }, [hasError, plan, examISO, mocksPerWeek]);

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
    setExamISO(DEFAULTS.examISO);
    setMocksPerWeek(DEFAULTS.mocksPerWeek);
    setCaMonthsCovered(DEFAULTS.caMonthsCovered);
    setPractice(DEFAULTS.practice);
    setAttempted(DEFAULTS.attempted);
    setAccuracy(DEFAULTS.accuracy);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          CLAT UG
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">CLAT Exam Countdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Days to CLAT with prep milestones: mock-test capacity, current-affairs coverage pace, and
          daily targets weighted by the paper&apos;s own section split.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="clat-exam-date">
              CLAT exam date (from the Consortium notice)
            </label>
            <input
              id="clat-exam-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={examISO}
              onChange={(event) => setExamISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="clat-mocks">
              Full mocks you can write per week
            </label>
            <input
              id="clat-mocks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="14"
              step="1"
              value={mocksPerWeek}
              onChange={(event) => setMocksPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="clat-ca">
              Months of current affairs already covered (of {CURRENT_AFFAIRS_MONTHS})
            </label>
            <input
              id="clat-ca"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={CURRENT_AFFAIRS_MONTHS}
              step="1"
              value={caMonthsCovered}
              onChange={(event) => setCaMonthsCovered(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="clat-practice">
              Practice questions you solve per day
            </label>
            <input
              id="clat-practice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={practice}
              onChange={(event) => setPractice(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Days to CLAT
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(plan.daysToExam)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the countdown."
                : plan.examIsToday
                  ? "The exam is today — nothing left to plan."
                  : `${NUM.format(plan.weeksToExam)} weeks and ${NUM.format(plan.spareDays)} days. The last ${MOCK_PHASE_DAYS} days are kept for full mocks and current-affairs revision.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the CLAT countdown plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Full mocks possible at your rate",
              hasError ? DASH : NUM.format(plan.mocksPossible),
            ],
            [
              "Current affairs covered",
              hasError
                ? DASH
                : `${NUM.format(plan.caMonthsCovered)}/${CURRENT_AFFAIRS_MONTHS} months (${NUM1.format(plan.caPercentCovered)}%)`,
            ],
            [
              "Current affairs pace needed",
              hasError
                ? DASH
                : plan.caMonthsLeft === 0
                  ? "Coverage complete — keep revising"
                  : plan.caDaysPerMonth === null
                    ? "No compilation days left before the mock phase"
                    : `One month of news every ${NUM1.format(plan.caDaysPerMonth)} days`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Prep milestones</h2>
        <ul className="mt-3 space-y-2">
          {(hasError ? [] : plan.phases).map((phase) => (
            <li key={phase.id} className="rounded-md border border-[var(--border)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold">{phase.label}</span>
                <span className="text-sm font-semibold text-[var(--primary)]">
                  {NUM.format(phase.days)} days
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                {phase.fromISO} to {phase.toISO} — {phase.note}
              </p>
            </li>
          ))}
          {hasError ? (
            <li className="rounded-md border border-[var(--border)] p-3 text-center text-sm text-[var(--muted-foreground)]">
              {DASH}
            </li>
          ) : null}
        </ul>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Section-wise daily question target</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Section</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Questions in paper</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Weight</th>
                <th scope="col" className="py-2 text-right font-semibold">Your questions/day</th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : plan.sections).map((section) => (
                <tr key={section.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{section.label}</td>
                  <td className="py-2 pr-3 text-right">
                    {section.min}–{section.max}
                  </td>
                  <td className="py-2 pr-3 text-right">{`${NUM.format(section.sharePercent)}%`}</td>
                  <td className="py-2 text-right font-semibold">
                    {NUM.format(Math.round(section.dailyQuestionTarget))}
                  </td>
                </tr>
              ))}
              {hasError ? (
                <tr>
                  <td colSpan={4} className="py-3 text-center text-[var(--muted-foreground)]">
                    {DASH}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          CLAT has {TOTAL_QUESTIONS} questions in {EXAM_DURATION_MINUTES} minutes; the split uses the
          midpoint of each section&apos;s published range.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Marks from your attempt plan</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          CLAT awards +{MARK_CORRECT} for a correct answer and deducts {PENALTY_WRONG} for a wrong
          one, out of {TOTAL_MARKS} marks.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="clat-attempted">
              Questions attempted (of {TOTAL_QUESTIONS})
            </label>
            <input
              id="clat-attempted"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={TOTAL_QUESTIONS}
              step="1"
              value={attempted}
              onChange={(event) => setAttempted(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="clat-accuracy">
              Accuracy on what you attempt (%)
            </label>
            <input
              id="clat-accuracy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={accuracy}
              onChange={(event) => setAccuracy(event.target.value)}
            />
          </div>
        </div>

        {score.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {score.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Projected marks", score.error ? DASH : `${NUM1.format(score.marks)} / ${score.maxMarks}`],
            ["Correct answers", score.error ? DASH : NUM1.format(score.correct)],
            ["Marks lost to negative marking", score.error ? DASH : NUM1.format(score.wrong * PENALTY_WRONG)],
            [
              "Accuracy at which a guess breaks even",
              score.error ? DASH : `${NUM.format(score.breakEvenAccuracy)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning aid only. The exam date, pattern and section ranges are set by the
        Consortium of NLUs notification for your cycle — confirm them on consortiumofnlus.ac.in.
      </p>
    </main>
  );
}
