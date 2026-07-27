"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FlaskConical, RotateCcw } from "lucide-react";

import {
  DEFAULT_LAB_HOURS_PER_SESSION,
  DEFAULT_REQUIRED_PERCENT,
  DEFAULT_THEORY_HOURS_PER_CLASS,
  trackLabAttendance,
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

const DEFAULTS = {
  theoryHeld: "40",
  theoryAttended: "32",
  theoryRemaining: "8",
  theoryHoursPerClass: String(DEFAULT_THEORY_HOURS_PER_CLASS),
  labHeld: "12",
  labAttended: "8",
  labRemaining: "4",
  labHoursPerSession: String(DEFAULT_LAB_HOURS_PER_SESSION),
  theoryRequiredPercent: String(DEFAULT_REQUIRED_PERCENT),
  labRequiredPercent: String(DEFAULT_REQUIRED_PERCENT),
  experimentsPrescribed: "10",
  experimentsCompleted: "6",
};

const toCount = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

function HeadCard({ head, hasError }) {
  return (
    <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
      <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
        {head ? head.label : DASH}
      </p>
      <p
        className={`mt-1 text-3xl font-semibold ${
          !hasError && head && head.percent !== null && !head.meetsTarget
            ? "text-[var(--danger)]"
            : "text-[var(--primary)]"
        }`}
      >
        {hasError || !head || head.percent === null ? DASH : pct(head.percent)}
      </p>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        {hasError || !head
          ? "Fix the input above."
          : `${num(head.attended)} of ${num(head.held)} attended · bar at ${num(head.target)}%`}
      </p>
      <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
        {[
          [
            "Must still attend",
            hasError || !head
              ? DASH
              : head.remaining > 0
                ? `${num(head.mustAttendOfRemaining)} of ${num(head.remaining)} left`
                : head.consecutiveNeeded === null
                  ? "not possible"
                  : `${num(head.consecutiveNeeded)} in a row`,
          ],
          [
            "Can still miss",
            hasError || !head ? DASH : num(head.remaining > 0 ? head.canSkipOfRemaining : head.canMissNow),
          ],
          ["Best possible finish", hasError || !head || head.bestPossible === null ? DASH : pct(head.bestPossible)],
          [
            "Shortfall against the bar",
            hasError || !head || head.shortfallPoints === null
              ? DASH
              : head.shortfallPoints === 0
                ? "none"
                : `${num(head.shortfallPoints)} points`,
          ],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">{label}</dt>
            <dd className="text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const result = useMemo(
    () =>
      trackLabAttendance({
        theoryHeld: toCount(values.theoryHeld),
        theoryAttended: toCount(values.theoryAttended),
        theoryRemaining: toCount(values.theoryRemaining),
        theoryHoursPerClass: toCount(values.theoryHoursPerClass),
        labHeld: toCount(values.labHeld),
        labAttended: toCount(values.labAttended),
        labRemaining: toCount(values.labRemaining),
        labHoursPerSession: toCount(values.labHoursPerSession),
        theoryRequiredPercent: toCount(values.theoryRequiredPercent),
        labRequiredPercent: toCount(values.labRequiredPercent),
        experimentsPrescribed: toCount(values.experimentsPrescribed),
        experimentsCompleted: toCount(values.experimentsCompleted),
      }),
    [values],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Lab Attendance Requirement Tracker",
      `Theory: ${pct(result.theory.percent)} (${result.theory.attended}/${result.theory.held}), bar ${result.theory.target}%`,
      `Practical: ${pct(result.lab.percent)} (${result.lab.attended}/${result.lab.held}), bar ${result.lab.target}%`,
      `Combined by session count: ${pct(result.combinedByCount)}`,
      `Combined by contact hours: ${pct(result.combinedByHours)}`,
      `Experiments completed: ${result.experimentsCompleted} of ${result.experimentsPrescribed}`,
      `Lab sessions still to attend: ${result.lab.mustAttendOfRemaining} of ${result.lab.remaining}`,
      `Eligible: ${result.eligible ? "yes" : "no"}`,
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
    setValues(DEFAULTS);
    setCopied(false);
  };

  const numberField = (id, label, field, extra = {}) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        value={values[field]}
        onChange={setField(field)}
        {...extra}
      />
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          Practical courses
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Lab Attendance Requirement Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A practical course is a separate head of account: it has its own attendance bar, its own
          roll, and a record book that has to be complete. Track it apart from theory, and see the
          combined figure both ways — by session count and by contact hours.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Theory paper</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {numberField("lab-th-held", "Lectures held", "theoryHeld")}
          {numberField("lab-th-att", "Lectures attended", "theoryAttended")}
          {numberField("lab-th-rem", "Lectures still to come", "theoryRemaining")}
          {numberField("lab-th-hrs", "Contact hours per lecture", "theoryHoursPerClass", {
            min: "1",
            max: "8",
          })}
          {numberField("lab-th-target", "Attendance required (%)", "theoryRequiredPercent", {
            min: "1",
            max: "100",
            inputMode: "decimal",
          })}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Practical / lab course</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {numberField("lab-lb-held", "Lab sessions held", "labHeld")}
          {numberField("lab-lb-att", "Lab sessions attended", "labAttended")}
          {numberField("lab-lb-rem", "Lab sessions still to come", "labRemaining")}
          {numberField("lab-lb-hrs", "Contact hours per lab session", "labHoursPerSession", {
            min: "1",
            max: "8",
          })}
          {numberField("lab-lb-target", "Attendance required (%)", "labRequiredPercent", {
            min: "1",
            max: "100",
            inputMode: "decimal",
          })}
          {numberField("lab-exp-total", "Experiments prescribed", "experimentsPrescribed", {
            max: "100",
          })}
          {numberField("lab-exp-done", "Experiments completed and signed", "experimentsCompleted", {
            max: "100",
          })}
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
              Practical attendance
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !hasError && result.lab && result.lab.percent !== null && !result.lab.meetsTarget
                  ? "text-[var(--danger)]"
                  : "text-[var(--primary)]"
              }`}
            >
              {hasError || result.lab.percent === null ? DASH : pct(result.lab.percent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the result."
                : result.eligible
                  ? "Both heads clear their bar and the record is complete."
                  : `Not eligible yet — ${result.blockers.length} condition${result.blockers.length === 1 ? "" : "s"} outstanding.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy lab attendance summary"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Combined, counting sessions", hasError ? DASH : pct(result.combinedByCount)],
            ["Combined, counting contact hours", hasError ? DASH : pct(result.combinedByHours)],
            [
              "Difference the lab hours make",
              hasError || result.hoursGap === null ? DASH : `${num(result.hoursGap)} points`,
            ],
            [
              "Contact hours attended",
              hasError ? DASH : `${num(result.attendedHours)} of ${num(result.heldHours)}`,
            ],
            [
              "Experiments completed",
              hasError
                ? DASH
                : result.experimentsPrescribed === 0
                  ? "not tracked"
                  : `${num(result.experimentsCompleted)} of ${num(result.experimentsPrescribed)} (${pct(result.recordPercent)})`,
            ],
            [
              "Experiments still pending",
              hasError ? DASH : result.experimentsPrescribed === 0 ? "not tracked" : num(result.experimentsPending),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.blockers.length > 0 && (
          <ul className="mt-4 grid gap-2 text-sm">
            {result.blockers.map((item) => (
              <li
                key={item}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning)]"
              >
                {item}
              </li>
            ))}
          </ul>
        )}

        {!hasError && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{result.verdict}</p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <HeadCard head={result.theory} hasError={hasError} />
          <HeadCard head={result.lab} hasError={hasError} />
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Attendance bars, the way practicals are weighted against theory and the
        rules on repeat labs are set by your university or institute. Check the roll your lab
        in-charge maintains and the current examination ordinance before relying on any figure here.
      </p>
    </main>
  );
}
