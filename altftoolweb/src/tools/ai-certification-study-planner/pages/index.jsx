"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import {
  BACKGROUNDS,
  EXAMS,
  MAX_HOURS_PER_WEEK,
  MIN_HOURS_PER_WEEK,
  buildStudyPlan,
  planToText,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const ONE_DP = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  examId: "aif-c01",
  background: "some",
  hoursPerWeek: "6",
  examDate: "",
};

const FALLBACK_TODAY = "2026-01-05";

const isoToday = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [today, setToday] = useState(FALLBACK_TODAY);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setToday(isoToday());
  }, []);

  const plan = useMemo(
    () =>
      buildStudyPlan({
        examId: form.examId,
        background: form.background,
        hoursPerWeek: Number(form.hoursPerWeek),
        examDate: form.examDate,
        today,
      }),
    [form, today]
  );

  const hasError = Boolean(plan.error);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const reset = () => {
    setForm(DEFAULTS);
    setToday(isoToday());
    setCopied(false);
  };

  const clipboardText = useMemo(() => (hasError ? "" : planToText(plan)), [hasError, plan]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const selectedExam = EXAMS.find((exam) => exam.id === form.examId);

  const breakdown = [
    ["Total study hours", hasError ? DASH : `${NUM.format(plan.totalHours)} h`],
    ["Domain study", hasError ? DASH : `${NUM.format(plan.domainHours)} h`],
    ["Practice exams and revision", hasError ? DASH : `${NUM.format(plan.revisionHours)} h`],
    ["Exam-ready by", hasError ? DASH : plan.readyDate],
    [
      "Exam format",
      hasError
        ? DASH
        : `${NUM.format(plan.exam.questions)} questions in ${NUM.format(plan.exam.minutes)} min (${ONE_DP.format(plan.minutesPerQuestion)} min each)`,
    ],
    [
      "Passing score",
      hasError
        ? DASH
        : plan.exam.passingScore
          ? `${NUM.format(plan.exam.passingScore)} on ${plan.exam.scoreScale}`
          : plan.exam.scoreScale,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Exam prep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Certification Study Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split your study time across an AI certification&apos;s published domain weights, see which
          week each topic falls in, and check whether your booked exam date leaves enough hours.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="acp-exam">
              Certification
            </label>
            <select
              id="acp-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.examId}
              onChange={(event) => setField("examId", event.target.value)}
            >
              {EXAMS.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({exam.code})
                </option>
              ))}
            </select>
            {selectedExam && (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {selectedExam.vendor} · {selectedExam.level} level ·{" "}
                {NUM.format(selectedExam.domains.length)} exam domains
              </p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="acp-background">
              Your background
            </label>
            <select
              id="acp-background"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.background}
              onChange={(event) => setField("background", event.target.value)}
            >
              {BACKGROUNDS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="acp-hours">
              Study hours per week
            </label>
            <input
              id="acp-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_HOURS_PER_WEEK}
              max={MAX_HOURS_PER_WEEK}
              step="0.5"
              value={form.hoursPerWeek}
              onChange={(event) => setField("hoursPerWeek", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="acp-start">
              Start date
            </label>
            <input
              id="acp-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => {
                setToday(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="acp-examdate">
              Exam date (optional)
            </label>
            <input
              id="acp-examdate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.examDate}
              onChange={(event) => setField("examDate", event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Preparation time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(plan.totalWeeks)} weeks`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs to see a plan"
                : `${NUM.format(plan.totalHours)} hours at ${ONE_DP.format(plan.hoursPerWeek)} h/week`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the study plan"
              className={GHOST_BTN}
              disabled={hasError}
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {breakdown.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.readiness && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              plan.readiness.onTrack
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--warning-soft)] text-[var(--warning)]"
            }`}
          >
            {plan.readiness.onTrack
              ? `On track: ${NUM.format(plan.readiness.daysUntilExam)} days left gives you about ${NUM.format(plan.readiness.hoursAvailable)} study hours against the ${NUM.format(plan.totalHours)} this plan needs.`
              : `Short by about ${NUM.format(plan.readiness.hoursShort)} hours. ${
                  plan.readiness.hoursPerWeekNeeded
                    ? `You would need ${ONE_DP.format(plan.readiness.hoursPerWeekNeeded)} h/week to be ready, or move the exam date.`
                    : "The exam is today — move the date to build a plan."
                }`}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Hours per exam domain</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Domain</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Published</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Hours</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">~Questions</th>
                  <th scope="col" className="py-2 text-right font-semibold">Weeks</th>
                </tr>
              </thead>
              <tbody>
                {plan.schedule.map((domain) => (
                  <tr key={domain.name} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3 font-semibold">{domain.name}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {domain.published}
                    </td>
                    <td className="py-2 pr-3 text-right">{ONE_DP.format(domain.hours)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM.format(domain.questionsApprox)}
                    </td>
                    <td className="py-2 text-right">
                      {domain.weekStart === domain.weekEnd
                        ? domain.weekStart
                        : `${domain.weekStart}-${domain.weekEnd}`}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3 font-semibold">{plan.revisionBlock.name}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{DASH}</td>
                  <td className="py-2 pr-3 text-right">{ONE_DP.format(plan.revisionBlock.hours)}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{DASH}</td>
                  <td className="py-2 text-right">
                    {plan.revisionBlock.weekStart === plan.revisionBlock.weekEnd
                      ? plan.revisionBlock.weekStart
                      : `${plan.revisionBlock.weekStart}-${plan.revisionBlock.weekEnd}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-5 space-y-2">
            {plan.schedule.map((domain) => (
              <div key={`bar-${domain.name}`} className="flex items-center gap-3 text-sm">
                <span className="w-12 shrink-0 text-right font-semibold">{domain.weight}%</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
                  <span
                    className="block h-full bg-[var(--primary)]"
                    style={{ width: `${domain.weight}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Domain weights follow each vendor&apos;s published exam guide; Microsoft publishes ranges, so
        the midpoint is used and the set is rescaled to 100%. Vendors revise these outlines, and the
        hour budgets are planning heuristics rather than official figures — check the current exam
        guide before you book.
      </p>
    </main>
  );
}
