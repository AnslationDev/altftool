"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import {
  EXAM_DURATION_MINUTES,
  PAPER_PRESETS,
  QUALIFYING_PERCENT_GENERAL,
  QUALIFYING_PERCENT_RESERVED,
  TOTAL_MARKS,
  TOTAL_QUESTIONS,
  buildTetPlan,
  paperById,
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

const DEFAULT_READINESS = {
  cdp: "60",
  lang1: "50",
  lang2: "50",
  maths: "40",
  evs: "50",
  "maths-science": "40",
  social: "40",
};

const DEFAULTS = {
  examISO: "2026-12-13",
  paperId: PAPER_PRESETS[0].id,
  studyHours: "4",
  mockScore: "85",
  isReserved: false,
};

export default function ToolHome() {
  const [todayISO] = useState(() => toLocalISODate(new Date()));
  const [examISO, setExamISO] = useState(DEFAULTS.examISO);
  const [paperId, setPaperId] = useState(DEFAULTS.paperId);
  const [readiness, setReadiness] = useState(DEFAULT_READINESS);
  const [studyHours, setStudyHours] = useState(DEFAULTS.studyHours);
  const [mockScore, setMockScore] = useState(DEFAULTS.mockScore);
  const [isReserved, setIsReserved] = useState(DEFAULTS.isReserved);
  const [copied, setCopied] = useState(false);

  const paper = paperById(paperId) ?? PAPER_PRESETS[0];

  const plan = useMemo(
    () =>
      buildTetPlan({
        todayISO,
        examISO,
        paperId,
        readiness: Object.fromEntries(
          paper.sections.map((section) => [section.id, Number(readiness[section.id] ?? 0)]),
        ),
        dailyStudyHours: Number(studyHours),
        latestMockScore: mockScore.trim() === "" ? Number.NaN : Number(mockScore),
        isReserved,
      }),
    [todayISO, examISO, paperId, paper, readiness, studyHours, mockScore, isReserved],
  );

  const hasError = Boolean(plan.error);

  const setSectionReadiness = (id, value) => {
    setReadiness((current) => ({ ...current, [id]: value }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "TET exam countdown",
      `${paper.label} on ${examISO}`,
      `Days left: ${NUM.format(plan.daysToExam)} (${NUM.format(plan.weeksToExam)} weeks + ${NUM.format(plan.spareDays)} days)`,
      `Study hours left at ${studyHours} h/day: ${NUM.format(plan.studyHoursLeft)}`,
      `Weighted readiness: ${NUM1.format(plan.overallReadiness)}% → expected ${NUM1.format(plan.expectedMarks)}/${TOTAL_MARKS} marks`,
      `Qualifying: ${plan.qualifying.percent}% = ${NUM1.format(plan.qualifying.marks)} marks`,
    ];
    plan.sections.forEach((section) => {
      lines.push(`${section.label}: ${NUM.format(section.readinessPercent)}% ready (${NUM.format(section.questions)} questions)`);
    });
    if (plan.mock) {
      lines.push(
        plan.mock.clearsQualifying
          ? `Latest mock ${NUM.format(plan.mock.score)} already clears qualifying`
          : `Latest mock ${NUM.format(plan.mock.score)} — ${NUM1.format(plan.mock.gapToQualifying)} marks short of qualifying`,
      );
    }
    return lines.join("\n");
  }, [hasError, plan, paper, examISO, studyHours]);

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
    setPaperId(DEFAULTS.paperId);
    setReadiness(DEFAULT_READINESS);
    setStudyHours(DEFAULTS.studyHours);
    setMockScore(DEFAULTS.mockScore);
    setIsReserved(DEFAULTS.isReserved);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          CTET &amp; State TET
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">TET Exam Countdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Days to your TET with a paper-wise tracker: section readiness weighted by question share,
          expected marks, and the gap to the {QUALIFYING_PERCENT_GENERAL}% qualifying line.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tet-exam-date">
              Exam date (from the board&apos;s notice)
            </label>
            <input
              id="tet-exam-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={examISO}
              onChange={(event) => setExamISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tet-paper">
              Paper
            </label>
            <select
              id="tet-paper"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paperId}
              onChange={(event) => setPaperId(event.target.value)}
            >
              {PAPER_PRESETS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tet-hours">
              Study hours per day
            </label>
            <input
              id="tet-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="18"
              step="0.5"
              value={studyHours}
              onChange={(event) => setStudyHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tet-mock">
              Latest full-mock score (of {TOTAL_MARKS}, optional)
            </label>
            <input
              id="tet-mock"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={TOTAL_MARKS}
              step="1"
              value={mockScore}
              onChange={(event) => setMockScore(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="tet-reserved"
        >
          <input
            id="tet-reserved"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={isReserved}
            onChange={(event) => setIsReserved(event.target.checked)}
          />
          Apply the relaxed {QUALIFYING_PERCENT_RESERVED}% qualifying threshold (reserved
          categories, where the recruiting body allows it)
        </label>

        <div className="mt-5">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
            Section readiness (your own estimate, 0–100%)
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {paper.sections.map((section) => (
              <div key={section.id}>
                <label className={LABEL_CLASS} htmlFor={`tet-ready-${section.id}`}>
                  {section.label} ({section.questions} questions)
                </label>
                <input
                  id={`tet-ready-${section.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100"
                  step="5"
                  value={readiness[section.id] ?? "0"}
                  onChange={(event) => setSectionReadiness(section.id, event.target.value)}
                />
              </div>
            ))}
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
              Days to the exam
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(plan.daysToExam)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the countdown."
                : plan.examIsToday
                  ? "The paper is today — one minute per question, no negative marking."
                  : `${NUM.format(plan.weeksToExam)} weeks and ${NUM.format(plan.spareDays)} days — ${NUM.format(plan.studyHoursLeft)} study hours at your daily rate.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the TET countdown plan"
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
              "Weighted readiness",
              hasError ? DASH : `${NUM1.format(plan.overallReadiness)}%`,
            ],
            [
              "Expected marks at current readiness",
              hasError ? DASH : `${NUM1.format(plan.expectedMarks)} / ${TOTAL_MARKS}`,
            ],
            [
              "Qualifying line for your category",
              hasError
                ? DASH
                : `${plan.qualifying.percent}% = ${NUM1.format(plan.qualifying.marks)} marks`,
            ],
            [
              "Latest mock vs qualifying",
              hasError || !plan.mock
                ? hasError
                  ? DASH
                  : "Add a mock score to see it"
                : plan.mock.clearsQualifying
                  ? `Clears it (${NUM.format(plan.mock.score)} marks)`
                  : `${NUM1.format(plan.mock.gapToQualifying)} marks short`,
            ],
            [
              "Weakest section",
              hasError || !plan.weakest
                ? DASH
                : `${plan.weakest.label} — ${NUM.format(plan.weakest.readinessPercent)}% ready`,
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
        <h2 className="text-base font-semibold">Paper-wise tracker</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Section</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Questions</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Weight</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Ready</th>
                <th scope="col" className="py-2 text-right font-semibold">Expected marks</th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : plan.sections).map((section) => (
                <tr key={section.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{section.label}</td>
                  <td className="py-2 pr-3 text-right">{NUM.format(section.questions)}</td>
                  <td className="py-2 pr-3 text-right">{`${NUM.format(section.weightPercent)}%`}</td>
                  <td className="py-2 pr-3 text-right">{`${NUM.format(section.readinessPercent)}%`}</td>
                  <td className="py-2 text-right font-semibold">{NUM1.format(section.expectedMarks)}</td>
                </tr>
              ))}
              {hasError ? (
                <tr>
                  <td colSpan={5} className="py-3 text-center text-[var(--muted-foreground)]">
                    {DASH}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          Every TET paper has {TOTAL_QUESTIONS} questions worth {TOTAL_MARKS} marks in{" "}
          {EXAM_DURATION_MINUTES} minutes with no negative marking — attempt everything.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning aid only. Dates, language options and qualifying relaxations are set
        by the conducting body — CBSE for CTET, the state authority for a state TET — so confirm
        them in the current information bulletin.
      </p>
    </main>
  );
}
