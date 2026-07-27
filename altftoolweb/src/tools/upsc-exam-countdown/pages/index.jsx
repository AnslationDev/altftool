"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";

import {
  EXAM_PRESETS,
  computeCountdown,
  computeMilestones,
  computeStudyPlan,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function pretty(iso) {
  if (!iso) return DASH;
  const [y, m, d] = iso.split("-").map(Number);
  return DATE_FMT.format(new Date(Date.UTC(y, m - 1, d)));
}

const DEFAULTS = {
  examId: "prelims",
  examDate: EXAM_PRESETS[0].defaultDate,
  hoursPerDay: "6",
};

export default function ToolHome() {
  const [examId, setExamId] = useState(DEFAULTS.examId);
  const [examDate, setExamDate] = useState(DEFAULTS.examDate);
  const [hoursPerDay, setHoursPerDay] = useState(DEFAULTS.hoursPerDay);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const preset = EXAM_PRESETS.find((item) => item.id === examId) ?? EXAM_PRESETS[0];

  const countdown = useMemo(
    () => computeCountdown({ nowMs, examDate }),
    [nowMs, examDate],
  );
  const plan = useMemo(
    () =>
      computeStudyPlan({
        nowMs,
        examDate,
        hoursPerDay: hoursPerDay.trim() === "" ? NaN : Number(hoursPerDay),
      }),
    [nowMs, examDate, hoursPerDay],
  );
  const milestoneResult = useMemo(
    () => computeMilestones({ nowMs, examDate }),
    [nowMs, examDate],
  );

  const hasError = Boolean(countdown.error);
  const isPast = !hasError && countdown.past;

  const summary = useMemo(() => {
    if (hasError || isPast) return "";
    const lines = [
      `${preset.label} — ${pretty(examDate)}`,
      `${countdown.days} days ${countdown.hours} h ${countdown.minutes} m to go (${countdown.weeks} weeks ${countdown.weekRemainderDays} days)`,
    ];
    if (!plan.error) {
      lines.push(
        `At ${plan.hoursPerDay} h/day: ${NUM.format(plan.totalHours)} study hours left (${plan.hoursPerWeek} h/week)`,
      );
    }
    return lines.join("\n");
  }, [hasError, isPast, preset, examDate, countdown, plan]);

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
    setExamDate(DEFAULTS.examDate);
    setHoursPerDay(DEFAULTS.hoursPerDay);
    setCopied(false);
  };

  const selectExam = (id) => {
    setExamId(id);
    const next = EXAM_PRESETS.find((item) => item.id === id);
    if (next) setExamDate(next.defaultDate);
  };

  const units = hasError
    ? []
    : [
        ["Days", countdown.days],
        ["Hours", countdown.hours],
        ["Minutes", countdown.minutes],
        ["Seconds", countdown.seconds],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Civil Services Examination
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">UPSC Exam Countdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A live clock to Prelims or Mains, your remaining study hours at any daily target, and
          the dates by which a quarter, half and three-quarters of your prep time will be gone.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="upsc-exam">
              Exam stage
            </label>
            <select
              id="upsc-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              value={examId}
              onChange={(event) => selectExam(event.target.value)}
            >
              {EXAM_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upsc-date">
              Exam date
            </label>
            <input
              id="upsc-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={examDate}
              onChange={(event) => setExamDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="upsc-hours">
              Study hours per day
            </label>
            <input
              id="upsc-hours"
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
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">{preset.note}</p>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {countdown.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {preset.label} · {hasError ? DASH : pretty(examDate)}
            </p>
            {isPast ? (
              <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                That date has passed — set the next exam date.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-4 gap-2 text-center" role="timer" aria-live="off" aria-label="Time remaining to the exam">
                {units.map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg bg-[var(--muted)] px-2 py-3"
                  >
                    <div className="text-2xl font-semibold tabular-nums text-[var(--primary)] sm:text-4xl">
                      {hasError ? DASH : String(value).padStart(2, "0")}
                    </div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the countdown summary"
              className={GHOST_BTN}
              disabled={hasError || isPast}
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
          {(hasError || isPast
            ? [
                ["Weeks remaining", DASH],
                ["Study days (incl. today)", DASH],
                ["Total study hours at your target", DASH],
                ["Hours per week", DASH],
              ]
            : [
                [
                  "Weeks remaining",
                  `${NUM.format(countdown.weeks)} weeks ${countdown.weekRemainderDays} days`,
                ],
                ["Study days (incl. today)", NUM.format(countdown.totalDays)],
                [
                  "Total study hours at your target",
                  plan.error ? DASH : `${NUM.format(plan.totalHours)} h`,
                ],
                ["Hours per week", plan.error ? DASH : `${plan.hoursPerWeek} h`],
                [
                  "One extra hour a day buys",
                  plan.error ? DASH : `${NUM.format(plan.extraHourYield)} more hours`,
                ],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {!hasError && !isPast && plan.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {plan.error}
          </p>
        ) : null}
      </section>

      {!hasError && !isPast && milestoneResult.milestones?.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Prep-time milestones</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            The dates by which this much of your remaining prep time will be gone — natural
            checkpoints for finishing the syllabus, starting test series and switching to
            revision.
          </p>
          <ul className="mt-3 grid gap-2">
            {milestoneResult.milestones.map((milestone) => (
              <li
                key={milestone.percent}
                className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
              >
                <span className="font-semibold text-[var(--primary)]">
                  {milestone.percent}% elapsed
                </span>
                <span className="text-right">
                  <span className="font-semibold">{pretty(milestone.date)}</span>
                  <span className="ml-2 text-[var(--muted-foreground)]">
                    in {NUM.format(milestone.daysFromNow)} days
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Default dates follow UPSC&apos;s customary calendar pattern (Prelims on the last Sunday of
        May) and are not notification dates — always confirm the notified schedule on upsc.gov.in
        and edit the date above to match.
      </p>
    </main>
  );
}
