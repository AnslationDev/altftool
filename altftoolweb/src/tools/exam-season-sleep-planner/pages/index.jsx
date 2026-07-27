"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import {
  DEFAULT_BREAK_MIN,
  DEFAULT_FOCUS_BLOCK_MIN,
  MAX_PHASE_ADVANCE_PER_DAY_MIN,
  formatDuration,
  planExamSchedule,
} from "../lib";

const DEFAULTS = {
  examStart: "09:30",
  commuteMin: "30",
  prepMin: "45",
  targetSleepH: "8",
  currentBedtime: "01:00",
  daysUntilExam: "7",
  studyStart: "09:00",
  studyHoursPerDay: "4",
  blockMin: String(DEFAULT_FOCUS_BLOCK_MIN),
  breakMin: String(DEFAULT_BREAK_MIN),
  isTeen: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  return Number(trimmed);
};

export default function ToolHome() {
  const [examStart, setExamStart] = useState(DEFAULTS.examStart);
  const [commuteMin, setCommuteMin] = useState(DEFAULTS.commuteMin);
  const [prepMin, setPrepMin] = useState(DEFAULTS.prepMin);
  const [targetSleepH, setTargetSleepH] = useState(DEFAULTS.targetSleepH);
  const [currentBedtime, setCurrentBedtime] = useState(DEFAULTS.currentBedtime);
  const [daysUntilExam, setDaysUntilExam] = useState(DEFAULTS.daysUntilExam);
  const [studyStart, setStudyStart] = useState(DEFAULTS.studyStart);
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(DEFAULTS.studyHoursPerDay);
  const [blockMin, setBlockMin] = useState(DEFAULTS.blockMin);
  const [breakMin, setBreakMin] = useState(DEFAULTS.breakMin);
  const [isTeen, setIsTeen] = useState(DEFAULTS.isTeen);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planExamSchedule({
        examStart,
        commuteMin: toNumber(commuteMin),
        prepMin: toNumber(prepMin),
        targetSleepH: toNumber(targetSleepH),
        currentBedtime,
        daysUntilExam: toNumber(daysUntilExam),
        studyStart,
        studyHoursPerDay: toNumber(studyHoursPerDay),
        blockMin: toNumber(blockMin),
        breakMin: toNumber(breakMin),
        isTeen,
      }),
    [
      examStart,
      commuteMin,
      prepMin,
      targetSleepH,
      currentBedtime,
      daysUntilExam,
      studyStart,
      studyHoursPerDay,
      blockMin,
      breakMin,
      isTeen,
    ],
  );

  const ok = !plan.error;

  const rows = [
    ["Exam-day alarm", ok ? plan.wake.label : DASH, ok ? `Set by ${plan.wakeDrivenBy}` : ""],
    ["Target lights-out", ok ? plan.bedtime.label : DASH, ok ? `${formatDuration(plan.timeInBedMin)} in bed` : ""],
    ["Wind-down begins", ok ? plan.windDownStart.label : DASH, "No new material after this"],
    [
      "Hardest topic review",
      ok ? `${plan.preSleepReview.start.time}–${plan.preSleepReview.end.time}` : DASH,
      "Sleep consolidates what you saw last",
    ],
    ["Morning re-test", ok ? plan.morningReview.label : DASH, "Recall the same material an hour after waking"],
    [
      "Bedtime shift needed",
      ok ? (plan.advanceIsDelay ? "None" : formatDuration(plan.advanceNeededMin)) : DASH,
      ok && !plan.advanceIsDelay
        ? `About ${formatDuration(plan.perDayShiftMin)} earlier each night`
        : "Your current bedtime is already early enough",
    ],
    [
      "Nights needed to shift",
      ok ? (plan.advanceIsDelay ? "0" : String(plan.daysNeededToShift)) : DASH,
      ok ? `You have ${plan.daysUntilExam} left` : "",
    ],
    ["Focus time scheduled", ok ? formatDuration(plan.focusMinutes) : DASH, ok ? `Study day ends ${plan.studyEnd.label}` : ""],
    ["Free time before wind-down", ok ? formatDuration(plan.restGapMin) : DASH, "Eat, move, see people"],
  ];

  const summary = ok
    ? [
        "Exam Season Sleep Planner",
        `Exam starts: ${plan.exam.label}`,
        `Alarm: ${plan.wake.label}`,
        `Lights out: ${plan.bedtime.label} (${formatDuration(plan.timeInBedMin)} in bed)`,
        `Wind-down: ${plan.windDownStart.label}`,
        `Pre-sleep review: ${plan.preSleepReview.start.time}-${plan.preSleepReview.end.time}`,
        `Morning re-test: ${plan.morningReview.label}`,
        plan.advanceIsDelay
          ? "Bedtime shift: none needed"
          : `Bedtime shift: ${formatDuration(plan.advanceNeededMin)} earlier over ${plan.daysNeededToShift} nights`,
        `Focus time: ${formatDuration(plan.focusMinutes)} ending ${plan.studyEnd.label}`,
      ].join("\n")
    : "";

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
    setExamStart(DEFAULTS.examStart);
    setCommuteMin(DEFAULTS.commuteMin);
    setPrepMin(DEFAULTS.prepMin);
    setTargetSleepH(DEFAULTS.targetSleepH);
    setCurrentBedtime(DEFAULTS.currentBedtime);
    setDaysUntilExam(DEFAULTS.daysUntilExam);
    setStudyStart(DEFAULTS.studyStart);
    setStudyHoursPerDay(DEFAULTS.studyHoursPerDay);
    setBlockMin(DEFAULTS.blockMin);
    setBreakMin(DEFAULTS.breakMin);
    setIsTeen(DEFAULTS.isTeen);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Exam season
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Exam Season Sleep Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lay out revision blocks and a bedtime that actually lets memory consolidate. The plan
          moves your body clock no faster than {MAX_PHASE_ADVANCE_PER_DAY_MIN} minutes a night, the
          most a sleep schedule reliably shifts.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="exam-start">
              Exam start time
            </label>
            <input
              id="exam-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={examStart}
              onChange={(event) => setExamStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="exam-days">
              Days until the exam
            </label>
            <input
              id="exam-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              step="1"
              value={daysUntilExam}
              onChange={(event) => setDaysUntilExam(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="exam-commute">
              Travel to the exam hall (minutes)
            </label>
            <input
              id="exam-commute"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="5"
              value={commuteMin}
              onChange={(event) => setCommuteMin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="exam-prep">
              Getting ready after the alarm (minutes)
            </label>
            <input
              id="exam-prep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="5"
              value={prepMin}
              onChange={(event) => setPrepMin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="exam-sleep">
              Sleep target (hours)
            </label>
            <input
              id="exam-sleep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="4"
              max="12"
              step="0.25"
              value={targetSleepH}
              onChange={(event) => setTargetSleepH(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="exam-current-bed">
              Bedtime you actually keep now
            </label>
            <input
              id="exam-current-bed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={currentBedtime}
              onChange={(event) => setCurrentBedtime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="exam-study-start">
              First study block starts
            </label>
            <input
              id="exam-study-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={studyStart}
              onChange={(event) => setStudyStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="exam-study-hours">
              Focus hours per study day
            </label>
            <input
              id="exam-study-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="14"
              step="0.5"
              value={studyHoursPerDay}
              onChange={(event) => setStudyHoursPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="exam-block">
              Focus block length (minutes)
            </label>
            <input
              id="exam-block"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="180"
              step="5"
              value={blockMin}
              onChange={(event) => setBlockMin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="exam-break">
              Break length (minutes)
            </label>
            <input
              id="exam-break"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="5"
              value={breakMin}
              onChange={(event) => setBreakMin(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            id="exam-teen"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={isTeen}
            onChange={(event) => setIsTeen(event.target.checked)}
          />
          <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="exam-teen">
            Student is 13–18 (use the 8–10 hour teenage sleep range)
          </label>
        </div>
      </section>

      {plan.error && (
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
              Target lights-out
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? plan.bedtime.time : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `Alarm at ${plan.wake.time} on exam day` : "Fix the inputs above to see a plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the exam sleep and study plan"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value, note]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt>
                <span className="block font-medium text-[var(--foreground)]">{label}</span>
                {note ? <span className="block text-xs text-[var(--muted-foreground)]">{note}</span> : null}
              </dt>
              <dd className="shrink-0 text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && plan.warnings.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {plan.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      {ok && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Study day timetable</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Slot</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Start</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">End</th>
                  <th scope="col" className="py-2 text-right font-semibold">Length</th>
                </tr>
              </thead>
              <tbody>
                {plan.blocks.map((block, position) => (
                  <tr
                    key={`${block.kind}-${block.start.minutes}-${position}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 font-semibold">
                      {block.kind === "focus" ? `Focus ${block.index}` : "Break"}
                    </td>
                    <td className="py-2 pr-3">{block.start.time}</td>
                    <td className="py-2 pr-3">{block.end.time}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {formatDuration(block.minutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Why sleep is part of revision</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>Material studied shortly before sleep is consolidated overnight, which is why the last slot goes to the hardest topic.</li>
          <li>Testing yourself the next morning is spaced retrieval — far more effective per minute than re-reading notes.</li>
          <li>An all-nighter typically costs more in recall and reading speed the next day than the extra hours add.</li>
          <li>Bright light and a walk within an hour of waking anchors the earlier bedtime you are trying to build.</li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not a substitute for advice from your school, university or doctor.
        If exam stress is affecting your sleep, eating or mood over more than a couple of weeks,
        talk to a GP or a student wellbeing service.
      </p>
    </main>
  );
}
