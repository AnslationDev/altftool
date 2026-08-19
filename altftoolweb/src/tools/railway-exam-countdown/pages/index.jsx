"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrainFront } from "lucide-react";

import {
  RRB_EXAM_PRESETS,
  buildDayPlan,
  buildStageBoard,
  paperMaths,
  stageQuestionProfile,
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

const dayLabel = (days) => {
  if (days === 0) return "Today";
  if (days < 0) return `${NUM0.format(Math.abs(days))} days ago`;
  return `${NUM0.format(days)} days to go`;
};

const makeStages = (examId) => {
  const exam = RRB_EXAM_PRESETS.find((item) => item.id === examId) || RRB_EXAM_PRESETS[0];
  const seed = ["2026-12-13", "2027-02-20"];
  return exam.stages.map((stage, index) => ({ ...stage, date: seed[index] || "" }));
};

export default function ToolHome() {
  const [today, setToday] = useState(() => toLocalISODate(new Date()));
  const [examId, setExamId] = useState(RRB_EXAM_PRESETS[0].id);
  const [stages, setStages] = useState(() => makeStages(RRB_EXAM_PRESETS[0].id));
  const [windowDays, setWindowDays] = useState("180");
  const [hoursPerDay, setHoursPerDay] = useState("5");
  const [attempts, setAttempts] = useState("80");
  const [accuracy, setAccuracy] = useState("85");
  const [copied, setCopied] = useState(false);

  const exam = RRB_EXAM_PRESETS.find((item) => item.id === examId) || RRB_EXAM_PRESETS[0];

  const board = useMemo(() => buildStageBoard(today, stages), [today, stages]);

  const targetDate = board.error || !board.next ? "" : board.next.date;

  const plan = useMemo(
    () =>
      buildDayPlan({
        todayISO: today,
        examISO: targetDate,
        windowDays: toNumber(windowDays),
        studyHoursPerDay: toNumber(hoursPerDay),
      }),
    [today, targetDate, windowDays, hoursPerDay],
  );

  const scoredStages = stages.filter((stage) => stage.marks > 0 && stage.minutes > 0);
  const scoringStage =
    (board.next && scoredStages.find((stage) => stage.id === board.next.id)) || scoredStages[0];
  const paper = useMemo(() => {
    if (!scoringStage) return { error: "This exam has no scored computer based test recorded." };
    const profile = stageQuestionProfile(scoringStage);
    if (profile.error) return profile;
    return paperMaths({
      questions: profile.questions,
      minutes: scoringStage.minutes,
      marksPerQuestion: profile.marksPerQuestion,
      attempts: toNumber(attempts),
      accuracyPercent: toNumber(accuracy),
    });
  }, [scoringStage, attempts, accuracy]);

  const boardOk = !board.error;
  const planOk = !plan.error;

  const bannerMessage = board.error
    ? board.error
    : board.allPast
      ? "All exam stages for this preset are in the past — pick a different exam or update the stage dates."
      : plan.error || "";

  const changeExam = (nextId) => {
    const nextStages = makeStages(nextId);
    setExamId(nextId);
    setStages(nextStages);

    const nextScoringStage = nextStages.find((stage) => stage.marks > 0 && stage.minutes > 0);
    if (nextScoringStage) {
      const profile = stageQuestionProfile(nextScoringStage);
      if (!profile.error) {
        setAttempts((prev) => {
          const numeric = toNumber(prev);
          return Number.isFinite(numeric) && numeric > profile.questions
            ? String(profile.questions)
            : prev;
        });
      }
    }
  };

  const updateStageDate = (id, date) => {
    setStages((rows) => rows.map((row) => (row.id === id ? { ...row, date } : row)));
  };

  const summary = useMemo(() => {
    if (!boardOk) return "";
    const lines = [`${exam.label} — countdown`, `As on ${today}`];
    board.rows.forEach((row) => {
      lines.push(`${row.label} (${row.date}): ${dayLabel(row.days)}`);
    });
    if (planOk) {
      lines.push(
        "",
        `Phase: ${plan.phase.label} — ${plan.phase.note}`,
        `Preparation window ${NUM0.format(plan.windowDays)} days, ${NUM.format(plan.progressPercent)}% elapsed`,
        `Daily mix at ${NUM.format(plan.studyHoursPerDay)} hours a day:`,
      );
      plan.mix.forEach((row) => {
        lines.push(`  ${row.label}: ${NUM.format(row.percent)}% (${NUM.format(row.hours)} h)`);
      });
    }
    if (!paper.error) {
      lines.push(
        "",
        `${NUM0.format(paper.attempts)} attempts at ${NUM0.format(toNumber(accuracy))}% accuracy = ${NUM.format(paper.netScore)} net of ${NUM0.format(paper.totalMarks)}`,
      );
    }
    return lines.join("\n");
  }, [boardOk, exam, today, board, planOk, plan, paper, accuracy]);

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
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset the exam countdown? All entered stage dates and settings will be lost.")
    ) {
      return;
    }
    setToday(toLocalISODate(new Date()));
    setExamId(RRB_EXAM_PRESETS[0].id);
    setStages(makeStages(RRB_EXAM_PRESETS[0].id));
    setWindowDays("180");
    setHoursPerDay("5");
    setAttempts("80");
    setAccuracy("85");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <TrainFront className="h-4 w-4" aria-hidden="true" />
          RRB countdown
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Railway Exam Countdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Days left to each RRB stage, the preparation phase you are in, and how today&apos;s study
          hours should be split between new learning, revision and mocks.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Exam and stage dates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rrb-today">
              Today&apos;s date
            </label>
            <input
              id="rrb-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rrb-exam">
              RRB recruitment
            </label>
            <select
              id="rrb-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              value={examId}
              onChange={(event) => changeExam(event.target.value)}
            >
              {RRB_EXAM_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {stages.map((stage) => (
            <div key={stage.id}>
              <label className={LABEL_CLASS} htmlFor={`rrb-date-${stage.id}`}>
                {stage.label}
              </label>
              <input
                id={`rrb-date-${stage.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={stage.date}
                onChange={(event) => updateStageDate(stage.id, event.target.value)}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="rrb-window">
              Whole preparation window (days)
            </label>
            <input
              id="rrb-window"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={windowDays}
              onChange={(event) => setWindowDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rrb-hours">
              Study hours a day
            </label>
            <input
              id="rrb-hours"
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
        </div>
      </section>

      {bannerMessage ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {bannerMessage}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {boardOk && board.next ? `Next: ${board.next.label}` : "Next stage"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {planOk ? `${NUM0.format(plan.daysLeft)} days` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {planOk
                ? `${NUM0.format(plan.weeks)} weeks ${NUM0.format(plan.spareDays)} days · ${NUM0.format(plan.studyHoursLeft)} study hours left`
                : "Fill in a future stage date to see the countdown."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy railway exam countdown and study mix"
              className={GHOST_BTN}
              disabled={!boardOk}
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
            ["Preparation phase", planOk ? plan.phase.label : DASH],
            [
              "Window elapsed",
              planOk
                ? `${NUM.format(plan.progressPercent)}% (${NUM0.format(plan.daysElapsed)} of ${NUM0.format(plan.windowDays)} days)`
                : DASH,
            ],
            [
              "New learning today",
              planOk ? `${NUM.format(plan.mix[0].percent)}% · ${NUM1.format(plan.mix[0].hours)} h` : DASH,
            ],
            [
              "Practice & revision today",
              planOk ? `${NUM.format(plan.mix[1].percent)}% · ${NUM1.format(plan.mix[1].hours)} h` : DASH,
            ],
            [
              "Mocks & analysis today",
              planOk ? `${NUM.format(plan.mix[2].percent)}% · ${NUM1.format(plan.mix[2].hours)} h` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {planOk ? (
          <>
            <div
              className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Today's split is ${NUM.format(plan.mix[0].percent)} percent new learning, ${NUM.format(plan.mix[1].percent)} percent revision and ${NUM.format(plan.mix[2].percent)} percent mocks`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${plan.mix[0].percent}%` }}
              />
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${plan.mix[1].percent}%` }}
              />
              <span
                className="block h-full bg-[var(--warning)]"
                style={{ width: `${plan.mix[2].percent}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{plan.phase.note}</p>
          </>
        ) : null}
      </section>

      {boardOk ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Stage board</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Stage
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Countdown
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Phase
                  </th>
                </tr>
              </thead>
              <tbody>
                {board.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.label}
                      {row.marks > 0 ? (
                        <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                          {NUM0.format(row.marks)} marks · {NUM0.format(row.minutes)} min
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.date}</td>
                    <td
                      className={`py-2 pr-3 text-right font-semibold ${row.isPast ? "text-[var(--muted-foreground)]" : ""}`}
                    >
                      {dayLabel(row.days)}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {row.phase ? row.phase.label : "done"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">
          Net score at your attempt strategy{scoringStage ? ` — ${scoringStage.label}` : ""}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rrb-attempts">
              Questions you plan to attempt
            </label>
            <input
              id="rrb-attempts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={attempts}
              onChange={(event) => setAttempts(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rrb-accuracy">
              Accuracy in mocks (%)
            </label>
            <input
              id="rrb-accuracy"
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

        {paper.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {paper.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Expected net score",
              paper.error
                ? DASH
                : `${NUM.format(paper.netScore)} of ${NUM0.format(paper.totalMarks)} (${NUM.format(paper.netPercent)}%)`,
            ],
            ["Correct answers", paper.error ? DASH : NUM.format(paper.correct)],
            [
              "Marks lost to one third negative marking",
              paper.error ? DASH : NUM.format(paper.penalty),
            ],
            [
              "Seconds available per question",
              paper.error ? DASH : NUM.format(paper.secondsPerQuestion),
            ],
            [
              "Seconds per question you actually attempt",
              paper.error ? DASH : NUM.format(paper.secondsPerAttempt),
            ],
            [
              "Break-even accuracy",
              paper.error ? DASH : `${NUM.format(paper.breakEvenAccuracyPercent)}%`,
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
        RRB computer based tests deduct one third of the marks for a question on every wrong answer,
        which puts break-even accuracy at 25%. Question counts, durations and stage lists differ
        between centralised employment notices — the CEN you applied under and your admit card are
        the only authority on dates and pattern. Phase bands and the daily mix are planning
        conventions, not railway rules.
      </p>
    </main>
  );
}
