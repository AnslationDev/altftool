"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, School } from "lucide-react";

import {
  BOARD_REQUIRED_PERCENT,
  STAGE_MIN_WORKING_DAYS,
  trackSchoolAttendance,
} from "../lib";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : DASH);
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  muted: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const DEFAULTS = {
  stageId: "secondary",
  workingDaysSoFar: "120",
  daysPresent: "96",
  workingDaysRemaining: "80",
  plannedLeaveDays: "5",
  requiredPercent: String(BOARD_REQUIRED_PERCENT),
};

const toCount = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [stageId, setStageId] = useState(DEFAULTS.stageId);
  const [workingDaysSoFar, setWorkingDaysSoFar] = useState(DEFAULTS.workingDaysSoFar);
  const [daysPresent, setDaysPresent] = useState(DEFAULTS.daysPresent);
  const [workingDaysRemaining, setWorkingDaysRemaining] = useState(DEFAULTS.workingDaysRemaining);
  const [plannedLeaveDays, setPlannedLeaveDays] = useState(DEFAULTS.plannedLeaveDays);
  const [requiredPercent, setRequiredPercent] = useState(DEFAULTS.requiredPercent);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      trackSchoolAttendance({
        stageId,
        workingDaysSoFar: toCount(workingDaysSoFar),
        daysPresent: toCount(daysPresent),
        workingDaysRemaining: toCount(workingDaysRemaining),
        plannedLeaveDays: toCount(plannedLeaveDays),
        requiredPercent: toCount(requiredPercent),
      }),
    [
      stageId,
      workingDaysSoFar,
      daysPresent,
      workingDaysRemaining,
      plannedLeaveDays,
      requiredPercent,
    ],
  );

  const hasError = Boolean(result.error);
  const stage = STAGE_MIN_WORKING_DAYS.find((item) => item.id === stageId);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "School Attendance Percentage Tracker",
      `Attendance so far: ${pct(result.percent)} (${result.daysPresent} present of ${result.workingDaysSoFar} working days)`,
      `Requirement: ${result.requiredPercent}% — ${result.status.label}`,
      `Session length: ${result.sessionDays} working days`,
      `Leave allowance for the session: ${result.leaveBudget} days, ${result.leaveBudgetLeft} still available`,
      `Days you must still attend: ${result.mustAttendOfRemaining} of the ${result.workingDaysRemaining} left`,
      `Projection with ${result.plannedLeaveDays} days of planned leave: ${pct(result.projectedPercent)}`,
      `Best possible finish: ${pct(result.bestPossible)}`,
      "",
      result.verdict,
    ].join("\n");
  }, [hasError, result]);

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
    setStageId(DEFAULTS.stageId);
    setWorkingDaysSoFar(DEFAULTS.workingDaysSoFar);
    setDaysPresent(DEFAULTS.daysPresent);
    setWorkingDaysRemaining(DEFAULTS.workingDaysRemaining);
    setPlannedLeaveDays(DEFAULTS.plannedLeaveDays);
    setRequiredPercent(DEFAULTS.requiredPercent);
    setCopied(false);
  };

  const barWidth = hasError
    ? 0
    : Math.max(0, Math.min(100, Number.isFinite(result.percent) ? result.percent : 0));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <School className="h-4 w-4" aria-hidden="true" />
          Board eligibility
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          School Attendance Percentage Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Attendance is counted over the working days of the whole session, and boards ask for{" "}
          {BOARD_REQUIRED_PERCENT}% of them before sending a candidate up for the examination. Enter
          the days so far and the days left to see the leave still affordable and where the year is
          heading.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sa-stage">
              School stage
            </label>
            <select
              id="sa-stage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stageId}
              onChange={(event) => setStageId(event.target.value)}
            >
              {STAGE_MIN_WORKING_DAYS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — at least {item.minDays} working days
                </option>
              ))}
            </select>
            {stage ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{stage.source}.</p>
            ) : null}
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="sa-held">
              Working days held so far
            </label>
            <input
              id="sa-held"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={workingDaysSoFar}
              onChange={(event) => setWorkingDaysSoFar(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sa-present">
              Days marked present
            </label>
            <input
              id="sa-present"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={daysPresent}
              onChange={(event) => setDaysPresent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sa-remaining">
              Working days left this session
            </label>
            <input
              id="sa-remaining"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={workingDaysRemaining}
              onChange={(event) => setWorkingDaysRemaining(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sa-leave">
              Leave you already plan to take (days)
            </label>
            <input
              id="sa-leave"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={plannedLeaveDays}
              onChange={(event) => setPlannedLeaveDays(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sa-target">
              Attendance required by the board (%)
            </label>
            <input
              id="sa-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={requiredPercent}
              onChange={(event) => setRequiredPercent(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Attendance so far
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : pct(result.percent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the result."
                : `${num(result.daysPresent)} present, ${num(result.absencesSoFar)} absent, out of ${num(result.workingDaysSoFar)} working days`}
            </p>
            {!hasError && (
              <span
                className={`mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${TONE_CLASS[result.status.tone]}`}
              >
                {result.status.label}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy attendance summary"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Attendance is ${num(result.percent)} percent against a requirement of ${result.requiredPercent} percent`}
            >
              <span
                className={`block h-full ${result.status.tone === "danger" ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Requirement line sits at {result.requiredPercent}%.
            </p>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Session length (working days)", hasError ? DASH : num(result.sessionDays)],
            ["Leave allowance for the whole session", hasError ? DASH : `${num(result.leaveBudget)} days`],
            [
              "Leave still affordable",
              hasError
                ? DASH
                : result.leaveBudgetLeft >= 0
                  ? `${num(result.leaveBudgetLeft)} days`
                  : `over by ${num(result.leaveBudgetOverrun)} days`,
            ],
            [
              "Days you must still attend",
              hasError ? DASH : `${num(result.mustAttendOfRemaining)} of ${num(result.workingDaysRemaining)}`,
            ],
            ["Days you can still miss", hasError ? DASH : num(result.canMissOfRemaining)],
            [
              `Projection with ${hasError ? DASH : num(result.plannedLeaveDays)} days of planned leave`,
              hasError ? DASH : pct(result.projectedPercent),
            ],
            ["Best possible finish", hasError ? DASH : pct(result.bestPossible)],
            ["Finish if you attend nothing more", hasError ? DASH : pct(result.worstPossible)],
            [
              "Session meets the minimum working days",
              hasError || result.meetsMinWorkingDays === null
                ? DASH
                : result.meetsMinWorkingDays
                  ? `Yes (${num(result.stageMinWorkingDays)} expected)`
                  : `No — ${num(result.stageMinWorkingDays)} expected`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{result.verdict}</p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The attendance register the school maintains is the record the board
        acts on, and condonation of shortage is decided by the board on an application routed
        through the school. Confirm the requirement and the cut-off date with your class teacher.
      </p>
    </main>
  );
}
