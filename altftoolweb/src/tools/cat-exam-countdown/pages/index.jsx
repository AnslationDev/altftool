"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Target } from "lucide-react";

import {
  CAT_DEFAULT_EXAM_DATE,
  CAT_PATTERN,
  CAT_SECTION_DEFAULTS,
  attemptsForTargetScore,
  buildMockPlan,
  computeSectionalPace,
  countdownTo,
  toLocalISODate,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

const PEAK_PHASE_DAYS_FIELD_HINT =
  "Days at the end reserved for full-length mocks only, with no new topics started.";

export default function ToolHome() {
  const [today, setToday] = useState(() => toLocalISODate(new Date()));
  const [examDate, setExamDate] = useState(CAT_DEFAULT_EXAM_DATE);
  const [mocksTaken, setMocksTaken] = useState("6");
  const [targetMocks, setTargetMocks] = useState("30");
  const [sections, setSections] = useState(() => CAT_SECTION_DEFAULTS.map((s) => ({ ...s })));
  const [daysPerWeek, setDaysPerWeek] = useState("6");
  const [hoursPerDay, setHoursPerDay] = useState("3");
  const [peakDays, setPeakDays] = useState("26");
  const [targetScore, setTargetScore] = useState("100");
  const [accuracy, setAccuracy] = useState("80");
  const [mcqShare, setMcqShare] = useState("70");
  const [copied, setCopied] = useState(false);

  const count = useMemo(() => countdownTo(today, examDate), [today, examDate]);

  const plan = useMemo(
    () =>
      buildMockPlan({
        todayISO: today,
        examISO: examDate,
        mocksTaken: toNumber(mocksTaken),
        targetMocks: toNumber(targetMocks),
      }),
    [today, examDate, mocksTaken, targetMocks],
  );

  const pace = useMemo(
    () =>
      computeSectionalPace({
        todayISO: today,
        examISO: examDate,
        sections: sections.map((section) => ({
          ...section,
          total: toNumber(section.total),
          done: toNumber(section.done),
          questions: toNumber(section.questions),
        })),
        studyDaysPerWeek: toNumber(daysPerWeek),
        hoursPerDay: toNumber(hoursPerDay),
        peakPhaseDays: toNumber(peakDays),
      }),
    [today, examDate, sections, daysPerWeek, hoursPerDay, peakDays],
  );

  const score = useMemo(
    () =>
      attemptsForTargetScore({
        targetNet: toNumber(targetScore),
        accuracyPercent: toNumber(accuracy),
        mcqSharePercent: toNumber(mcqShare),
      }),
    [targetScore, accuracy, mcqShare],
  );

  const planError = count.error || plan.error || pace.error || "";
  const ok = !planError;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "CAT Exam Countdown",
      `As on ${today}, CAT on ${examDate}`,
      `${NUM0.format(plan.daysLeft)} days to go (${NUM1.format(plan.weeksLeft)} weeks)`,
      `Mocks: ${NUM0.format(plan.mocksTaken)} written, ${NUM0.format(plan.mocksLeft)} left of a ${NUM0.format(plan.targetMocks)} target`,
      "",
      "Phase plan:",
    ];
    plan.phases.forEach((phase) => {
      lines.push(
        `  ${phase.label}: ${phase.startISO} to ${phase.endISO} · ${NUM0.format(phase.days)} days · ${NUM0.format(phase.mocks)} mocks` +
          (phase.mocksPerWeek === null ? "" : ` (${NUM.format(phase.mocksPerWeek)} per week)`),
      );
    });
    lines.push(
      "",
      `Syllabus: ${NUM0.format(pace.topicsDone)} of ${NUM0.format(pace.topicsTotal)} topics done`,
      `Study days before the mock-only phase: ${NUM0.format(pace.studyDays)} (${NUM0.format(pace.totalHours)} hours)`,
    );
    pace.perSection.forEach((section) => {
      lines.push(
        `  ${section.label}: ${NUM0.format(section.remaining)} topics left, ${NUM.format(section.hours)} hours allotted`,
      );
    });
    if (!score.error) {
      lines.push(
        "",
        `Target net ${NUM0.format(toNumber(targetScore))} at ${NUM0.format(toNumber(accuracy))}% accuracy needs ${NUM0.format(score.attemptsRounded)} attempts`,
      );
    }
    return lines.join("\n");
  }, [ok, today, examDate, plan, pace, score, targetScore, accuracy]);

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
    setToday(toLocalISODate(new Date()));
    setExamDate(CAT_DEFAULT_EXAM_DATE);
    setMocksTaken("6");
    setTargetMocks("30");
    setSections(CAT_SECTION_DEFAULTS.map((s) => ({ ...s })));
    setDaysPerWeek("6");
    setHoursPerDay("3");
    setPeakDays("26");
    setTargetScore("100");
    setAccuracy("80");
    setMcqShare("70");
    setCopied(false);
  };

  const updateSection = (id, key, value) => {
    setSections((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Target className="h-4 w-4" aria-hidden="true" />
          CAT countdown
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">CAT Exam Countdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Days left to CAT, a phased mock schedule that back-loads full-length tests, and the
          sectional pace VARC, DILR and QA each need from here.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Dates and mocks</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cat-today">
              Today&apos;s date
            </label>
            <input
              id="cat-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cat-exam">
              CAT exam date
            </label>
            <input
              id="cat-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={examDate}
              onChange={(event) => setExamDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cat-mocks-taken">
              Full mocks already written
            </label>
            <input
              id="cat-mocks-taken"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={mocksTaken}
              onChange={(event) => setMocksTaken(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cat-mocks-target">
              Mock target before the exam
            </label>
            <input
              id="cat-mocks-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={targetMocks}
              onChange={(event) => setTargetMocks(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Sectional syllabus</h2>
        <div className="mt-4 space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`cat-total-${section.id}`}>
                  {section.label} — total topics
                </label>
                <input
                  id={`cat-total-${section.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={section.total}
                  onChange={(event) => updateSection(section.id, "total", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`cat-done-${section.id}`}>
                  {section.label} — topics finished
                </label>
                <input
                  id={`cat-done-${section.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={section.done}
                  onChange={(event) => updateSection(section.id, "done", event.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cat-dpw">
              Study days per week (1-7)
            </label>
            <input
              id="cat-dpw"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="7"
              step="1"
              value={daysPerWeek}
              onChange={(event) => setDaysPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cat-hours">
              Study hours on a study day
            </label>
            <input
              id="cat-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="18"
              step="0.5"
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cat-peak">
              Mock-only phase at the end (days)
            </label>
            <input
              id="cat-peak"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={peakDays}
              onChange={(event) => setPeakDays(event.target.value)}
              aria-describedby="cat-peak-hint"
            />
            <p id="cat-peak-hint" className="mt-1 text-xs text-[var(--muted-foreground)]">
              {PEAK_PHASE_DAYS_FIELD_HINT}
            </p>
          </div>
        </div>
      </section>

      {planError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {planError}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              CAT {ok ? `on ${examDate}` : "countdown"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM0.format(plan.daysLeft)} days` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM0.format(count.weeks)} weeks ${NUM0.format(count.spareDays)} days · ${NUM0.format(plan.mocksLeft)} mocks still to write`
                : "Fix the inputs above to see the countdown."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy CAT countdown and study plan"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Mocks per week from here",
              ok && plan.mocksPerWeekOverall !== null
                ? NUM.format(plan.mocksPerWeekOverall)
                : DASH,
            ],
            [
              "Topics still to cover",
              ok ? `${NUM0.format(pace.topicsRemaining)} of ${NUM0.format(pace.topicsTotal)}` : DASH,
            ],
            ["Syllabus finished", ok ? `${NUM.format(pace.percentDone)}%` : DASH],
            [
              "Topics per study day",
              ok && pace.topicsPerStudyDay !== null ? NUM.format(pace.topicsPerStudyDay) : DASH,
            ],
            ["Study days before the mock phase", ok ? NUM0.format(pace.studyDays) : DASH],
            ["Study hours available", ok ? `${NUM0.format(pace.totalHours)} hours` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Mock schedule milestones</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Phase
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Window
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Days
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Mocks
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.phases.map((phase) => (
                  <tr key={phase.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 align-top font-semibold">
                      {phase.label}
                      <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                        {phase.note}
                      </span>
                    </td>
                    <td className="py-2 pr-3 align-top whitespace-nowrap text-[var(--muted-foreground)]">
                      {phase.startISO}
                      <span className="block">to {phase.endISO}</span>
                    </td>
                    <td className="py-2 pr-3 text-right align-top">{NUM0.format(phase.days)}</td>
                    <td className="py-2 text-right align-top font-semibold">
                      {NUM0.format(phase.mocks)}
                      <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                        {phase.mocksPerWeek === null
                          ? "no days left"
                          : `${NUM.format(phase.mocksPerWeek)}/week`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 text-sm font-semibold">Sectional pace</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Section
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Left
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Hours
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Hours/topic
                  </th>
                </tr>
              </thead>
              <tbody>
                {pace.perSection.map((section) => (
                  <tr key={section.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {section.label}
                      <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                        {NUM.format(section.weightPercent)}% of the paper ·{" "}
                        {NUM.format(section.percentDone)}% done
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">{NUM0.format(section.remaining)}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(section.hours)}</td>
                    <td className="py-2 text-right font-semibold">
                      {section.hoursPerTopic === null ? "done" : NUM.format(section.hoursPerTopic)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Attempts needed for a target score</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cat-target-score">
              Target net score (raw marks)
            </label>
            <input
              id="cat-target-score"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={targetScore}
              onChange={(event) => setTargetScore(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cat-accuracy">
              Mock accuracy (%)
            </label>
            <input
              id="cat-accuracy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={accuracy}
              onChange={(event) => setAccuracy(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cat-mcq-share">
              Share of your attempts that are MCQs (%)
            </label>
            <input
              id="cat-mcq-share"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={mcqShare}
              onChange={(event) => setMcqShare(event.target.value)}
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
            [
              "Attempts needed",
              score.error ? DASH : `${NUM0.format(score.attemptsRounded)} questions`,
            ],
            ["Net marks earned per attempt", score.error ? DASH : NUM.format(score.netPerAttempt)],
            ["Correct answers inside those", score.error ? DASH : NUM.format(score.correctNeeded)],
            [
              "Marks given away to negatives",
              score.error ? DASH : NUM.format(score.marksLostToNegatives),
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
        CAT runs {CAT_PATTERN.totalMinutes} minutes with a hard {CAT_PATTERN.sectionMinutes} minute
        limit on each of the three sections, marked +{CAT_PATTERN.correctMark} for a correct answer
        and {CAT_PATTERN.mcqNegativeMark} for a wrong multiple-choice answer, with no penalty on
        type-in-the-answer questions. Phase shares here are a planning convention, not an official
        rule — confirm the exam date and slot on your own admit card.
      </p>
    </main>
  );
}
