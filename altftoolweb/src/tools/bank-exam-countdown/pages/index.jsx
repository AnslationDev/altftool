"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  BANK_EXAM_PRESETS,
  BANK_NEGATIVE_FRACTION,
  IBPS_PO_MERIT_WEIGHTS,
  attemptsForCutoff,
  buildStageBoard,
  paperSpeed,
  toLocalISODate,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
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
  const exam = BANK_EXAM_PRESETS.find((item) => item.id === examId) || BANK_EXAM_PRESETS[0];
  return exam.stages.map((stage) => ({ ...stage, date: "" }));
};

export default function ToolHome() {
  const [today, setToday] = useState(() => toLocalISODate(new Date()));
  const [examId, setExamId] = useState(BANK_EXAM_PRESETS[0].id);
  const [stages, setStages] = useState(() => {
    const rows = makeStages(BANK_EXAM_PRESETS[0].id);
    // Seeded so a real countdown is on screen at first paint; replace with your own dates.
    const seed = ["2026-10-10", "2026-11-28", "2027-02-15"];
    return rows.map((row, index) => ({ ...row, date: seed[index] || "" }));
  });
  const [cutoff, setCutoff] = useState("55");
  const [accuracy, setAccuracy] = useState("85");
  const [copied, setCopied] = useState(false);

  const exam = BANK_EXAM_PRESETS.find((item) => item.id === examId) || BANK_EXAM_PRESETS[0];

  const board = useMemo(() => buildStageBoard(today, stages), [today, stages]);

  const speedStage = stages.find((stage) => stage.sections && stage.sections.length > 0);
  const speed = useMemo(
    () => (speedStage ? paperSpeed(speedStage.sections) : { error: "This exam has no sectional break-up recorded." }),
    [speedStage],
  );

  const questionsAvailable = speed.error ? undefined : speed.questions;
  const cutoffResult = useMemo(
    () =>
      attemptsForCutoff({
        cutoffMarks: toNumber(cutoff),
        accuracyPercent: toNumber(accuracy),
        marksPerQuestion: 1,
        questionsAvailable,
      }),
    [cutoff, accuracy, questionsAvailable],
  );

  const ok = !board.error;

  const changeExam = (nextId) => {
    setExamId(nextId);
    setStages(makeStages(nextId));
  };

  const updateStageDate = (id, date) => {
    setStages((rows) => rows.map((row) => (row.id === id ? { ...row, date } : row)));
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [`${exam.label} — stage countdown`, `As on ${today}`];
    board.rows.forEach((row) => {
      lines.push(
        `${row.label} (${row.date}): ${dayLabel(row.days)}` +
          (row.gapFromPrevious === null
            ? ""
            : ` · ${NUM0.format(row.gapFromPrevious)} days after ${row.previousLabel}`),
      );
    });
    if (!speed.error) {
      lines.push(
        "",
        `${speedStage.label}: ${NUM0.format(speed.questions)} questions in ${NUM0.format(speed.minutes)} minutes`,
        `Average ${NUM.format(speed.secondsPerQuestion)} seconds per question`,
      );
      speed.rows.forEach((row) => {
        lines.push(
          `  ${row.label}: ${NUM0.format(row.questions)} Q / ${NUM0.format(row.minutes)} min = ${NUM.format(row.secondsPerQuestion)} s per question`,
        );
      });
    }
    if (!cutoffResult.error) {
      lines.push(
        "",
        `Cutoff ${NUM.format(toNumber(cutoff))} at ${NUM0.format(toNumber(accuracy))}% accuracy needs ${NUM0.format(cutoffResult.attemptsRounded)} attempts`,
      );
    }
    return lines.join("\n");
  }, [ok, exam, today, board, speed, speedStage, cutoffResult, cutoff, accuracy]);

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
    setExamId(BANK_EXAM_PRESETS[0].id);
    const rows = makeStages(BANK_EXAM_PRESETS[0].id);
    const seed = ["2026-10-10", "2026-11-28", "2027-02-15"];
    setStages(rows.map((row, index) => ({ ...row, date: seed[index] || "" })));
    setCutoff("55");
    setAccuracy("85");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Bank exam countdown
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Bank Exam Countdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A stage-by-stage countdown board for IBPS, SBI and RBI recruitment, with the gap between
          prelims and mains, the seconds you get per question, and the attempts a cutoff demands.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Exam and stage dates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bank-today">
              Today&apos;s date
            </label>
            <input
              id="bank-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bank-exam">
              Recruitment exam
            </label>
            <select
              id="bank-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              value={examId}
              onChange={(event) => changeExam(event.target.value)}
            >
              {BANK_EXAM_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {stages.map((stage) => (
            <div key={stage.id}>
              <label className={LABEL_CLASS} htmlFor={`bank-date-${stage.id}`}>
                {stage.label}
              </label>
              <input
                id={`bank-date-${stage.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={stage.date}
                onChange={(event) => updateStageDate(stage.id, event.target.value)}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Leave a stage blank until its date is announced. Only the dates you fill in appear on the
          board.
        </p>
      </section>

      {board.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {board.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {ok && board.next ? `Next: ${board.next.label}` : "Next stage"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok && board.next ? `${NUM0.format(board.next.days)} days` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? board.next
                  ? `${board.next.date} · ${NUM0.format(board.next.weeks)} weeks ${NUM0.format(board.next.spareDays)} days`
                  : "Every dated stage is already behind you."
                : "Fill in at least one stage date."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy bank exam countdown board"
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
            ["Stages with a date", ok ? NUM0.format(board.totalStages) : DASH],
            [
              "Stage after next",
              ok && board.following ? `${board.following.label} · ${board.following.date}` : DASH,
            ],
            [
              "Window between them",
              ok && board.gapToFollowing !== null
                ? `${NUM0.format(board.gapToFollowing)} days`
                : DASH,
            ],
            [
              "Seconds per question in the objective paper",
              speed.error ? DASH : NUM.format(speed.secondsPerQuestion),
            ],
            [
              "Attempts needed for the cutoff",
              cutoffResult.error ? DASH : NUM0.format(cutoffResult.attemptsRounded),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Countdown board</h2>
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
                    Gap
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
                          {NUM0.format(row.marks)} marks
                          {row.minutes > 0 ? ` · ${NUM0.format(row.minutes)} min` : ""}
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
                      {row.gapFromPrevious === null
                        ? "first"
                        : `+${NUM0.format(row.gapFromPrevious)}d`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {speed.error ? null : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Speed budget — {speedStage.label}</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Sectional timing means unused minutes in one section cannot be carried into the next.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Section
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Questions
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Minutes
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Sec / question
                  </th>
                </tr>
              </thead>
              <tbody>
                {speed.rows.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{NUM0.format(row.questions)}</td>
                    <td className="py-2 pr-3 text-right">{NUM0.format(row.minutes)}</td>
                    <td className="py-2 text-right font-semibold">
                      {NUM.format(row.secondsPerQuestion)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3 font-semibold">Whole paper</td>
                  <td className="py-2 pr-3 text-right">{NUM0.format(speed.questions)}</td>
                  <td className="py-2 pr-3 text-right">{NUM0.format(speed.minutes)}</td>
                  <td className="py-2 text-right font-semibold">
                    {NUM.format(speed.secondsPerQuestion)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Attempts needed to clear a cutoff</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bank-cutoff">
              Target cutoff (marks)
            </label>
            <input
              id="bank-cutoff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              step="0.25"
              value={cutoff}
              onChange={(event) => setCutoff(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bank-accuracy">
              Your accuracy in mocks (%)
            </label>
            <input
              id="bank-accuracy"
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
        </div>

        {cutoffResult.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {cutoffResult.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Attempts needed",
              cutoffResult.error ? DASH : `${NUM0.format(cutoffResult.attemptsRounded)} questions`,
            ],
            [
              "Correct answers inside those",
              cutoffResult.error ? DASH : NUM0.format(cutoffResult.correctNeeded),
            ],
            [
              "Net marks per attempt",
              cutoffResult.error ? DASH : NUM.format(cutoffResult.netPerAttempt),
            ],
            [
              "Marks given away to negatives",
              cutoffResult.error ? DASH : NUM.format(cutoffResult.marksLostToNegatives),
            ],
            [
              "Break-even accuracy",
              cutoffResult.error
                ? DASH
                : `${NUM.format(cutoffResult.breakEvenAccuracyPercent)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!cutoffResult.error && cutoffResult.exceedsPaper ? (
          <p className="mt-3 text-sm font-semibold text-[var(--warning)]">
            That is more attempts than the paper has questions ({NUM0.format(cutoffResult.questionsAvailable)}).
            The cutoff is unreachable at this accuracy.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Bank objective papers deduct {NUM.format(BANK_NEGATIVE_FRACTION)} of the marks for a question
        on every wrong answer, which puts break-even accuracy at 20%. IBPS builds the probationary
        officer merit list on {IBPS_PO_MERIT_WEIGHTS.mains}:{IBPS_PO_MERIT_WEIGHTS.interview}{" "}
        weightage between the main exam and the interview, with the preliminary exam only a
        qualifying filter. Patterns change between recruitment cycles — the notification you applied
        under is the only authority.
      </p>
    </main>
  );
}
