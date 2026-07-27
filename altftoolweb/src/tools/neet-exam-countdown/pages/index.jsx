"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Stethoscope } from "lucide-react";

import {
  EXAM_DURATION_MINUTES,
  MARK_CORRECT,
  PENALTY_WRONG,
  SUBJECTS,
  TOTAL_MARKS,
  TOTAL_QUESTIONS,
  buildNeetPlan,
  projectedScore,
  toLocalISODate,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_EXAM_ISO = "2027-05-02";
const DEFAULT_REVISION_DAYS = "30";
const DEFAULT_PRACTICE = "120";

const buildDefaultSubjects = () =>
  SUBJECTS.map((subject) => ({
    id: subject.id,
    label: subject.label,
    questions: subject.questions,
    chaptersTotal: String(subject.defaultChapters),
    chaptersDone: String(subject.defaultDone),
  }));

const PACE_LABELS = {
  ahead: "Ahead of pace",
  "on-track": "On track",
  behind: "Behind pace",
};

export default function ToolHome() {
  const [todayISO] = useState(() => toLocalISODate(new Date()));
  const [examISO, setExamISO] = useState(DEFAULT_EXAM_ISO);
  const [prepStartISO, setPrepStartISO] = useState("");
  const [revisionDays, setRevisionDays] = useState(DEFAULT_REVISION_DAYS);
  const [practice, setPractice] = useState(DEFAULT_PRACTICE);
  const [subjects, setSubjects] = useState(buildDefaultSubjects);
  const [attempted, setAttempted] = useState("165");
  const [accuracy, setAccuracy] = useState("85");
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildNeetPlan({
        todayISO,
        examISO,
        prepStartISO,
        revisionDays: Number(revisionDays),
        dailyPracticeQuestions: Number(practice),
        subjects: subjects.map((subject) => ({
          ...subject,
          chaptersTotal: Number(subject.chaptersTotal),
          chaptersDone: Number(subject.chaptersDone),
        })),
      }),
    [todayISO, examISO, prepStartISO, revisionDays, practice, subjects],
  );

  const score = useMemo(
    () => projectedScore({ attempted: Number(attempted), accuracyPercent: Number(accuracy) }),
    [attempted, accuracy],
  );

  const hasError = Boolean(plan.error);

  const updateSubject = (id, field, value) => {
    setSubjects((current) =>
      current.map((subject) => (subject.id === id ? { ...subject, [field]: value } : subject)),
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "NEET exam countdown",
      `Exam date: ${examISO}`,
      `Days left: ${NUM.format(plan.daysToExam)} (${NUM.format(plan.weeksToExam)} weeks + ${NUM.format(plan.spareDays)} days)`,
      `Study days before revision: ${NUM.format(plan.studyDays)} (revision buffer ${NUM.format(plan.revisionDays)} days)`,
      `Syllabus done: ${NUM1.format(plan.syllabusPercentDone)}% (${NUM.format(plan.chaptersDoneAll)}/${NUM.format(plan.chaptersTotalAll)} chapters)`,
      `Required pace: ${plan.requiredChaptersPerDayAll === null ? "finish revision plan" : `${NUM2.format(plan.requiredChaptersPerDayAll)} chapters/day overall`}`,
    ];
    plan.rows.forEach((row) => {
      lines.push(
        `${row.label}: ${NUM.format(row.chaptersLeft)} chapters left, ${NUM.format(Math.round(row.dailyQuestionTarget))} practice questions/day`,
      );
    });
    if (plan.pace) {
      lines.push(`Pace check: ${PACE_LABELS[plan.pace.status]} (${plan.pace.delta >= 0 ? "+" : ""}${NUM1.format(plan.pace.delta)} points vs even pace)`);
    }
    return lines.join("\n");
  }, [hasError, plan, examISO]);

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
    setExamISO(DEFAULT_EXAM_ISO);
    setPrepStartISO("");
    setRevisionDays(DEFAULT_REVISION_DAYS);
    setPractice(DEFAULT_PRACTICE);
    setSubjects(buildDefaultSubjects());
    setAttempted("165");
    setAccuracy("85");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Stethoscope className="h-4 w-4" aria-hidden="true" />
          NEET UG
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">NEET Exam Countdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Days left to NEET, the chapter pace each subject needs before your revision buffer, and a
          daily question target split by the paper&apos;s 45-45-90 pattern.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-exam-date">
              NEET exam date (from the NTA notice)
            </label>
            <input
              id="neet-exam-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={examISO}
              onChange={(event) => setExamISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-prep-start">
              Prep start date (optional, for the pace check)
            </label>
            <input
              id="neet-prep-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={prepStartISO}
              onChange={(event) => setPrepStartISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-revision">
              Revision buffer before the exam (days)
            </label>
            <input
              id="neet-revision"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={revisionDays}
              onChange={(event) => setRevisionDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-practice">
              Practice questions you solve per day
            </label>
            <input
              id="neet-practice"
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

        <div className="mt-5">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
            Chapter tracker (edit counts to match your own list)
          </h2>
          <div className="mt-3 space-y-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="rounded-md border border-[var(--border)] p-3"
              >
                <p className="text-sm font-semibold">
                  {subject.label}
                  <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                    {subject.questions} questions in the paper
                  </span>
                </p>
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`neet-total-${subject.id}`}>
                      Total chapters
                    </label>
                    <input
                      id={`neet-total-${subject.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="numeric"
                      min="1"
                      step="1"
                      value={subject.chaptersTotal}
                      onChange={(event) => updateSubject(subject.id, "chaptersTotal", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`neet-done-${subject.id}`}>
                      Chapters completed
                    </label>
                    <input
                      id={`neet-done-${subject.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      value={subject.chaptersDone}
                      onChange={(event) => updateSubject(subject.id, "chaptersDone", event.target.value)}
                    />
                  </div>
                </div>
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
              Days to NEET
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(plan.daysToExam)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the countdown."
                : plan.examIsToday
                  ? "The exam is today — this is execution day, not planning day."
                  : `${NUM.format(plan.weeksToExam)} weeks and ${NUM.format(plan.spareDays)} days, of which ${NUM.format(plan.studyDays)} are study days before your revision buffer.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the NEET countdown plan"
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
              "Syllabus completed",
              hasError
                ? DASH
                : `${NUM1.format(plan.syllabusPercentDone)}% (${NUM.format(plan.chaptersDoneAll)}/${NUM.format(plan.chaptersTotalAll)} chapters)`,
            ],
            [
              "Required pace across subjects",
              hasError
                ? DASH
                : plan.requiredChaptersPerDayAll === null
                  ? "No study days left — go straight to revision"
                  : plan.requiredChaptersPerDayAll === 0
                    ? "Syllabus finished — hold the revision plan"
                    : `${NUM2.format(plan.requiredChaptersPerDayAll)} chapters per day`,
            ],
            [
              "Pace check vs even pace",
              hasError || !plan.pace
                ? hasError
                  ? DASH
                  : "Add a prep start date to see it"
                : `${PACE_LABELS[plan.pace.status]} (${plan.pace.delta >= 0 ? "+" : ""}${NUM1.format(plan.pace.delta)} points)`,
            ],
            [
              "Revision buffer",
              hasError ? DASH : `Last ${NUM.format(plan.revisionDays)} days kept free of new chapters`,
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
        <h2 className="text-base font-semibold">Subject-wise pace and daily question target</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Subject</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Done</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Left</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Chapters/day needed</th>
                <th scope="col" className="py-2 text-right font-semibold">Questions/day</th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : plan.rows).map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 pr-3 text-right">{`${NUM1.format(row.percentDone)}%`}</td>
                  <td className="py-2 pr-3 text-right">{NUM.format(row.chaptersLeft)}</td>
                  <td className="py-2 pr-3 text-right font-semibold">
                    {row.requiredChaptersPerDay === null
                      ? DASH
                      : row.requiredChaptersPerDay === 0
                        ? "Done"
                        : NUM2.format(row.requiredChaptersPerDay)}
                  </td>
                  <td className="py-2 text-right font-semibold">
                    {NUM.format(Math.round(row.dailyQuestionTarget))}
                  </td>
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
          The questions-per-day split follows the paper pattern — Physics 45, Chemistry 45,
          Biology 90 of {TOTAL_QUESTIONS} questions in {EXAM_DURATION_MINUTES} minutes.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Marks from your attempt plan</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          NEET awards +{MARK_CORRECT} for a correct answer and deducts {PENALTY_WRONG} for a wrong
          one, out of {TOTAL_MARKS} marks.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-attempted">
              Questions attempted (of {TOTAL_QUESTIONS})
            </label>
            <input
              id="neet-attempted"
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
            <label className={LABEL_CLASS} htmlFor="neet-accuracy">
              Accuracy on what you attempt (%)
            </label>
            <input
              id="neet-accuracy"
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
        Informational planning aid only. The exam date, pattern and syllabus are fixed by the NTA
        notification for your year — confirm both on nta.ac.in before anchoring your plan to them.
      </p>
    </main>
  );
}
