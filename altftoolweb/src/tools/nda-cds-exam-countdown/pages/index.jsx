"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shield } from "lucide-react";

import {
  EXAM_PRESETS,
  NEGATIVE_MARK_FRACTION,
  SSB_PROCESS_DAYS,
  SSB_SCHEDULE,
  buildDefenceCountdown,
  paperProjection,
  presetById,
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

const DEFAULTS = {
  presetId: EXAM_PRESETS[0].id,
  writtenISO: "2026-09-06",
  ssbStartISO: "",
  studyHours: "5",
  paperId: EXAM_PRESETS[0].papers[0].id,
  attempted: "100",
  accuracy: "70",
};

export default function ToolHome() {
  const [todayISO] = useState(() => toLocalISODate(new Date()));
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [writtenISO, setWrittenISO] = useState(DEFAULTS.writtenISO);
  const [ssbStartISO, setSsbStartISO] = useState(DEFAULTS.ssbStartISO);
  const [studyHours, setStudyHours] = useState(DEFAULTS.studyHours);
  const [paperId, setPaperId] = useState(DEFAULTS.paperId);
  const [attempted, setAttempted] = useState(DEFAULTS.attempted);
  const [accuracy, setAccuracy] = useState(DEFAULTS.accuracy);
  const [copied, setCopied] = useState(false);

  const preset = presetById(presetId) ?? EXAM_PRESETS[0];
  const paper = preset.papers.find((entry) => entry.id === paperId) ?? preset.papers[0];

  const plan = useMemo(
    () =>
      buildDefenceCountdown({
        todayISO,
        writtenISO,
        ssbStartISO,
        dailyStudyHours: Number(studyHours),
      }),
    [todayISO, writtenISO, ssbStartISO, studyHours],
  );

  const projection = useMemo(
    () => paperProjection({ paper, attempted: Number(attempted), accuracyPercent: Number(accuracy) }),
    [paper, attempted, accuracy],
  );

  const hasError = Boolean(plan.error);

  const pickPreset = (id) => {
    setPresetId(id);
    const next = presetById(id);
    if (next) setPaperId(next.papers[0].id);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `${preset.label} — countdown`,
      `Written exam: ${writtenISO}`,
      `Days to written: ${NUM.format(plan.daysToWritten)} (${NUM.format(plan.weeksToWritten)} weeks + ${NUM.format(plan.spareDays)} days)`,
      `Study hours left at ${studyHours} h/day: ${NUM.format(plan.studyHoursLeft)}`,
    ];
    if (plan.ssb) {
      lines.push(`SSB reporting: ${ssbStartISO} (${NUM.format(plan.ssb.daysToSsb)} days away)`);
      lines.push(`Written-to-SSB prep window: ${NUM.format(plan.ssb.writtenToSsb)} days`);
      lines.push(`SSB process: ${SSB_PROCESS_DAYS} days, conference on day ${SSB_PROCESS_DAYS}`);
    }
    preset.papers.forEach((entry) => {
      lines.push(`${entry.label}: ${entry.questions} questions, ${entry.marks} marks, ${entry.minutes} minutes`);
    });
    return lines.join("\n");
  }, [hasError, plan, preset, writtenISO, ssbStartISO, studyHours]);

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
    setPresetId(DEFAULTS.presetId);
    setWrittenISO(DEFAULTS.writtenISO);
    setSsbStartISO(DEFAULTS.ssbStartISO);
    setStudyHours(DEFAULTS.studyHours);
    setPaperId(DEFAULTS.paperId);
    setAttempted(DEFAULTS.attempted);
    setAccuracy(DEFAULTS.accuracy);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Shield className="h-4 w-4" aria-hidden="true" />
          NDA · CDS · SSB
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">NDA CDS Exam Countdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Days to the UPSC written paper, the prep window between written and SSB, and attempt maths
          under the one-third negative marking rule.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="def-preset">
              Exam and entry
            </label>
            <select
              id="def-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => pickPreset(event.target.value)}
            >
              {EXAM_PRESETS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="def-written">
              Written exam date (UPSC calendar)
            </label>
            <input
              id="def-written"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={writtenISO}
              onChange={(event) => setWrittenISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="def-ssb">
              SSB reporting date (optional, from your call-up letter)
            </label>
            <input
              id="def-ssb"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={ssbStartISO}
              onChange={(event) => setSsbStartISO(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="def-hours">
              Study hours per day
            </label>
            <input
              id="def-hours"
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
              Days to the written exam
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(plan.daysToWritten)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the countdown."
                : plan.writtenIsToday
                  ? "The written exam is today."
                  : `${NUM.format(plan.weeksToWritten)} weeks and ${NUM.format(plan.spareDays)} days to ${preset.label.split(" (")[0]}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the defence exam countdown"
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
              "Study hours left at your daily rate",
              hasError ? DASH : `${NUM.format(plan.studyHoursLeft)} h`,
            ],
            [
              "Days to SSB reporting",
              hasError || !plan.ssb ? (hasError ? DASH : "Add your SSB date to see it") : NUM.format(plan.ssb.daysToSsb),
            ],
            [
              "Written-to-SSB prep window",
              hasError || !plan.ssb
                ? hasError
                  ? DASH
                  : "Add your SSB date to see it"
                : `${NUM.format(plan.ssb.writtenToSsb)} days`,
            ],
            [
              "SSB process length",
              `${SSB_PROCESS_DAYS} days — conference on day ${SSB_PROCESS_DAYS}`,
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
        <h2 className="text-base font-semibold">Written paper structure</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Paper</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Questions</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Marks</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Minutes</th>
                <th scope="col" className="py-2 text-right font-semibold">Penalty / wrong</th>
              </tr>
            </thead>
            <tbody>
              {preset.papers.map((entry) => (
                <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{entry.label}</td>
                  <td className="py-2 pr-3 text-right">{NUM.format(entry.questions)}</td>
                  <td className="py-2 pr-3 text-right">{NUM.format(entry.marks)}</td>
                  <td className="py-2 pr-3 text-right">{NUM.format(entry.minutes)}</td>
                  <td className="py-2 text-right">
                    {NUM2.format((entry.marks / entry.questions) * NEGATIVE_MARK_FRACTION)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          UPSC deducts one-third of a question&apos;s marks for each wrong answer. The SSB stage for
          this entry carries {NUM.format(preset.ssbMarks)} marks.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Marks from your attempt plan</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="def-paper">
              Paper
            </label>
            <select
              id="def-paper"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paper.id}
              onChange={(event) => setPaperId(event.target.value)}
            >
              {preset.papers.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} — {entry.questions} questions, {entry.marks} marks
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="def-attempted">
              Questions attempted (of {paper.questions})
            </label>
            <input
              id="def-attempted"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={paper.questions}
              step="1"
              value={attempted}
              onChange={(event) => setAttempted(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="def-accuracy">
              Accuracy on what you attempt (%)
            </label>
            <input
              id="def-accuracy"
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

        {projection.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {projection.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Projected marks",
              projection.error ? DASH : `${NUM1.format(projection.marks)} / ${projection.maxMarks}`,
            ],
            [
              "Marks per question",
              projection.error ? DASH : NUM2.format(projection.marksPerQuestion),
            ],
            [
              "Penalty per wrong answer",
              projection.error ? DASH : NUM2.format(projection.penaltyPerWrong),
            ],
            [
              "Accuracy at which a guess breaks even",
              projection.error ? DASH : `${NUM.format(projection.breakEvenAccuracy)}%`,
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
        <h2 className="text-base font-semibold">The 5-day SSB schedule</h2>
        <ul className="mt-3 space-y-2">
          {SSB_SCHEDULE.map((entry) => (
            <li key={entry.day} className="rounded-md border border-[var(--border)] p-3">
              <p className="text-sm font-semibold">
                Day {entry.day} — {entry.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{entry.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning aid only. Exam dates, paper patterns and SSB call-ups are governed by
        the UPSC notification and your service selection board letter — always confirm on
        upsc.gov.in and joinindianarmy.nic.in.
      </p>
    </main>
  );
}
