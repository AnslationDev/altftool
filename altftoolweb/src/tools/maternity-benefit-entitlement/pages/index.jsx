"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { safeCopyText } from "@/shared/utils/clipboard";
import {
  CRECHE_EMPLOYEE_THRESHOLD,
  OTHER_LEAVE_TYPES,
  buildDefaultInputs,
  computeMaternityEntitlement,
  computeOtherLeave,
} from "../lib";

const numberFmt = new Intl.NumberFormat("en-IN");
const inrFmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DASH = "—";

/** Today's calendar date in the viewer's own timezone, as YYYY-MM-DD. */
function localTodayISO() {
  const now = new Date();
  const y = String(now.getFullYear()).padStart(4, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function showDate(iso) {
  if (typeof iso !== "string" || iso.length !== 10) return DASH;
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return DASH;
  return dateFmt.format(parsed);
}

function showCount(value, unit) {
  if (!Number.isFinite(value)) return DASH;
  return `${numberFmt.format(value)} ${unit}`;
}

const CHILD_OPTIONS = [0, 1, 2, 3, 4];
const WEEK_OPTIONS = [5, 6, 7];

const inputClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const labelClass = "block text-sm font-medium text-[var(--foreground)]";
const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-semibold text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const panelClass = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const noteClass =
  "rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]";

function Row({ label, value, hint }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">
        {label}
        {hint ? <span className="block text-xs opacity-80">{hint}</span> : null}
      </dt>
      <dd className="text-sm font-semibold text-[var(--foreground)] tabular-nums">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [form, setForm] = useState(() => buildDefaultInputs(localTodayISO()));
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  }, []);

  const reset = useCallback(() => {
    setForm(buildDefaultInputs(localTodayISO()));
    setCopied(false);
  }, []);

  const result = useMemo(
    () =>
      computeMaternityEntitlement({
        joiningDate: form.joiningDate,
        expectedDeliveryDate: form.expectedDeliveryDate,
        daysWorked: Number(form.daysWorked),
        asOfDate: form.asOfDate,
        survivingChildren: Number(form.survivingChildren),
        leaveStartDate: form.leaveStartDate,
        workingDaysPerWeek: Number(form.workingDaysPerWeek),
        employeeCount: Number(form.employeeCount),
      }),
    [form],
  );

  const other = useMemo(
    () =>
      computeOtherLeave({
        type: form.otherLeaveType,
        eventDate: form.otherLeaveEventDate,
      }),
    [form.otherLeaveType, form.otherLeaveEventDate],
  );

  const failed = Boolean(result.error);
  const ok = !failed;

  const heroLabel = ok && result.alreadyQualified
    ? "Section 5(2) eighty-day condition"
    : "Eightieth day of actual work falls on";
  const heroValue = failed
    ? DASH
    : result.alreadyQualified
      ? "Already met"
      : result.qualificationSearchExhausted
        ? "Not reachable"
        : showDate(result.qualificationDate);

  const copyText = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Maternity Benefit Act, 1961 — entitlement working",
      "",
      `Section 5(2) requirement: ${result.qualifyingDaysRequired} days of actual work in the 12 months preceding the expected delivery date (${showDate(result.windowStart)} to ${showDate(result.windowEnd)})`,
      `Days actually worked to ${showDate(form.asOfDate)}: ${numberFmt.format(result.daysWorked)}`,
      result.alreadyQualified
        ? "Eighty-day condition: already met"
        : `Eightieth day of actual work falls on: ${showDate(result.qualificationDate)} (${numberFmt.format(result.shortfallDays)} days short, at ${result.workingDaysPerWeek} working days a week)`,
      `Condition met before leave begins: ${result.qualifiesBeforeLeave ? "yes" : "no"}`,
      `Condition met inside the 12-month window: ${result.qualifiesWithinWindow ? "yes" : "no"}`,
      "",
      `Entitlement (${result.entitlementClause}): ${result.totalWeeks} weeks = ${result.totalLeaveDays} days`,
      `Maximum pre-natal portion: ${result.maxPrenatalWeeks} weeks`,
      `Earliest permissible leave start: ${showDate(result.earliestPermissibleLeaveStart)}`,
      `Leave start entered: ${showDate(result.leaveStart)}`,
      `Expected date of delivery: ${showDate(form.expectedDeliveryDate)}`,
      `Leave end: ${showDate(result.leaveEnd)}`,
      `Rejoining date: ${showDate(result.rejoinDate)}`,
      `Earliest rejoining permitted by section 4(2): ${showDate(result.earliestLawfulRejoinDate)}`,
      `Nursing breaks (section 11), two a day until: ${showDate(result.nursingBreaksUntil)}`,
      `Section 11A creche at ${result.crecheThreshold}+ employees: ${result.crecheApplies ? "applies" : "does not apply"} (${numberFmt.format(result.employeeCount)} employees)`,
      "",
      "Establishment policy may be more generous than these figures under section 27, and may never be less.",
    ];
    return lines.join("\n");
  }, [failed, result, form.asOfDate, form.expectedDeliveryDate]);

  const onCopy = useCallback(async () => {
    if (!copyText) return;
    const done = await safeCopyText(copyText);
    if (!done) return;
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }, [copyText]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--foreground)]">
      <p className="text-sm text-[var(--muted-foreground)]">
        Maternity Benefit Act, 1961, as amended by the Maternity Benefit (Amendment) Act, 2017.
        Section 5(2) requires eighty days of actual work with the employer inside the twelve months
        immediately preceding the expected date of delivery — until that is satisfied, no maternity
        benefit is payable. This page gives the date it will be satisfied.
      </p>

      {/* ---------------- INPUTS ---------------- */}
      <section className="mt-6" aria-labelledby="inputs-heading">
        <h2 id="inputs-heading" className="text-base font-semibold">
          Service and delivery details
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="joining-date">
              Date of joining this employer
            </label>
            <input
              id="joining-date"
              type="date"
              className={`${inputClass} mt-1`}
              value={form.joiningDate}
              onChange={(event) => setField("joiningDate", event.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="edd">
              Expected date of delivery
            </label>
            <input
              id="edd"
              type="date"
              className={`${inputClass} mt-1`}
              value={form.expectedDeliveryDate}
              onChange={(event) => setField("expectedDeliveryDate", event.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="days-worked">
              Days actually worked for this employer
            </label>
            <input
              id="days-worked"
              type="number"
              inputMode="numeric"
              min="0"
              max="366"
              step="1"
              className={`${inputClass} mt-1`}
              value={form.daysWorked}
              onChange={(event) => setField("daysWorked", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Days of lay-off and days declared as holidays with wages count, per the Explanation to
              section 5(2).
            </p>
          </div>

          <div>
            <label className={labelClass} htmlFor="as-of">
              Those days are counted up to
            </label>
            <input
              id="as-of"
              type="date"
              className={`${inputClass} mt-1`}
              value={form.asOfDate}
              onChange={(event) => setField("asOfDate", event.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="children">
              Surviving children before this birth
            </label>
            <select
              id="children"
              className={`${inputClass} mt-1`}
              value={form.survivingChildren}
              onChange={(event) => setField("survivingChildren", event.target.value)}
            >
              {CHILD_OPTIONS.map((count) => (
                <option key={count} value={count}>
                  {count === 4 ? "4 or more" : count}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="leave-start">
              Maternity leave start date
            </label>
            <input
              id="leave-start"
              type="date"
              className={`${inputClass} mt-1`}
              value={form.leaveStartDate}
              onChange={(event) => setField("leaveStartDate", event.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="week-days">
              Working days per week (roster)
            </label>
            <select
              id="week-days"
              className={`${inputClass} mt-1`}
              value={form.workingDaysPerWeek}
              onChange={(event) => setField("workingDaysPerWeek", event.target.value)}
            >
              {WEEK_OPTIONS.map((count) => (
                <option key={count} value={count}>
                  {count} days
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="employees">
              Employees in the establishment
            </label>
            <input
              id="employees"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              className={`${inputClass} mt-1`}
              value={form.employeeCount}
              onChange={(event) => setField("employeeCount", event.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ---------------- RESULT ---------------- */}
      <section className="mt-6" aria-labelledby="result-heading">
        <h2 id="result-heading" className="sr-only">
          Result
        </h2>

        {failed ? (
          <p
            role="alert"
            className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <div className={panelClass}>
          <p className="text-sm text-[var(--muted-foreground)]">{heroLabel}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{heroValue}</p>

          {ok ? (
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {result.alreadyQualified
                ? `${numberFmt.format(result.daysWorked)} of the ${numberFmt.format(result.qualifyingDaysRequired)} days required by section 5(2) are already worked, counted to ${showDate(form.asOfDate)}.`
                : `${numberFmt.format(result.shortfallDays)} more days of actual work are needed to reach the ${numberFmt.format(result.qualifyingDaysRequired)} days section 5(2) requires, counted at ${result.workingDaysPerWeek} working days a week from ${showDate(form.asOfDate)}.`}
            </p>
          ) : null}

          {ok && !result.qualifiesWithinWindow ? (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
            >
              That date is after {showDate(result.windowEnd)}, the last day of the twelve months
              immediately preceding the expected date of delivery. On these figures the eighty days
              of section 5(2) cannot be completed inside the window for this delivery.
            </p>
          ) : null}

          {ok && result.qualifiesWithinWindow && !result.qualifiesBeforeLeave ? (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
            >
              That date is after {showDate(result.lastWorkingDayBeforeLeave)}, the last day work can
              be done before the leave start entered.{" "}
              {numberFmt.format(result.daysStillShortAtLeaveStart)} days of the eighty are still
              outstanding on the leave start date.
            </p>
          ) : null}

          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              Entitlement under section 5(3)
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {ok ? showCount(result.totalWeeks, "weeks") : DASH}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {ok ? result.entitlementClause : DASH}
            </p>
          </div>

          <dl className="mt-4">
            <Row
              label="Section 5(2) window"
              hint="twelve months immediately preceding the expected delivery date"
              value={ok ? `${showDate(result.windowStart)} to ${showDate(result.windowEnd)}` : DASH}
            />
            <Row
              label="Counted from"
              hint="the later of joining and the start of the window"
              value={ok ? showDate(result.countFrom) : DASH}
            />
            <Row
              label="Working days available before leave begins"
              value={ok ? showCount(result.workingDaysAvailableBeforeLeave, "days") : DASH}
            />
            <Row
              label="Total leave"
              value={ok ? showCount(result.totalLeaveDays, "days") : DASH}
            />
            <Row
              label="Maximum pre-natal portion"
              hint="section 5(3)"
              value={ok ? showCount(result.maxPrenatalWeeks, "weeks") : DASH}
            />
            <Row
              label="Pre-natal days used by the leave start entered"
              value={ok ? showCount(result.prenatalDaysUsed, "days") : DASH}
            />
            <Row
              label="Days remaining after the expected delivery date"
              value={ok ? showCount(result.postnatalDaysLeft, "days") : DASH}
            />
            <Row
              label="Medical bonus"
              hint="section 8 read with S.O. 2496(E) of 19 December 2011, where free pre-natal and post-natal care is not provided"
              value={ok ? inrFmt.format(result.medicalBonusInr) : DASH}
            />
          </dl>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className={`${buttonClass} disabled:opacity-50`}
              onClick={onCopy}
              disabled={failed}
              aria-label="Copy the maternity benefit working to the clipboard"
            >
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" className={secondaryButtonClass} onClick={reset}>
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- TIMELINE ---------------- */}
      <section className="mt-6" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="text-base font-semibold">
          Dated timeline
        </h2>
        <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--card)] text-left">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Milestone
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Rule
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Eighty days of actual work complete",
                  ok
                    ? result.alreadyQualified
                      ? `Already met by ${showDate(form.asOfDate)}`
                      : showDate(result.qualificationDate)
                    : DASH,
                  "s.5(2)",
                ],
                [
                  "Earliest permissible leave start",
                  ok ? showDate(result.earliestPermissibleLeaveStart) : DASH,
                  "s.5(3)",
                ],
                ["Leave start entered", ok ? showDate(result.leaveStart) : DASH, "notice of claim, s.6"],
                [
                  "Expected date of delivery",
                  ok ? showDate(form.expectedDeliveryDate) : DASH,
                  "input",
                ],
                ["Leave end", ok ? showDate(result.leaveEnd) : DASH, "s.5(3)"],
                ["Rejoining date", ok ? showDate(result.rejoinDate) : DASH, "s.5(3)"],
                [
                  "Earliest rejoining permitted after delivery",
                  ok ? showDate(result.earliestLawfulRejoinDate) : DASH,
                  "s.4(2)",
                ],
                [
                  "Rejoining if the additional one month of illness leave is taken in full",
                  ok ? showDate(result.rejoinAfterIllnessLeave) : DASH,
                  "s.10",
                ],
                [
                  "Nursing breaks, two a day, until",
                  ok ? showDate(result.nursingBreaksUntil) : DASH,
                  "s.11",
                ],
              ].map(([milestone, date, rule]) => (
                <tr key={milestone} className="border-t border-[var(--border)]">
                  <th scope="row" className="px-4 py-3 text-left font-normal">
                    {milestone}
                  </th>
                  <td className="px-4 py-3 font-semibold tabular-nums">{date}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ok && result.leaveStartTooEarly ? (
          <p role="alert" className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            The leave start entered is before {showDate(result.earliestPermissibleLeaveStart)}. Section
            5(3) permits not more than {result.maxPrenatalWeeks} weeks of the{" "}
            {result.totalWeeks}-week benefit to precede the expected date of delivery.
          </p>
        ) : null}

        {ok && result.rejoinBreachesS4 ? (
          <p className={`mt-3 ${noteClass}`} role="status">
            The rejoining date of {showDate(result.rejoinDate)} falls before{" "}
            {showDate(result.earliestLawfulRejoinDate)}. Section 4(2) bars an employer from knowingly
            employing a woman during the six weeks immediately following the day of her delivery, so
            the two dates conflict on these figures. The section 4(2) period runs from the actual
            date of delivery, which will move this date.
          </p>
        ) : null}

        {ok && !result.shopCoverageMet ? (
          <p className={`mt-3 ${noteClass}`} role="status">
            {numberFmt.format(result.employeeCount)} employees is below the{" "}
            {numberFmt.format(result.coverageThreshold)} at which section 2(1)(b) brings a shop or
            establishment within the Act. Factories, mines and plantations are covered under section
            2(1)(a) regardless of headcount.
          </p>
        ) : null}
      </section>

      {/* ---------------- OTHER LEAVE EVENTS ---------------- */}
      <section className="mt-8" aria-labelledby="other-heading">
        <h2 id="other-heading" className="text-base font-semibold">
          Other leave events under the same Act
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="other-type">
              Event
            </label>
            <select
              id="other-type"
              className={`${inputClass} mt-1`}
              value={form.otherLeaveType}
              onChange={(event) => setField("otherLeaveType", event.target.value)}
            >
              {Object.entries(OTHER_LEAVE_TYPES).map(([key, rule]) => (
                <option key={key} value={key}>
                  {rule.label} ({rule.section})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="other-date">
              Date of the event
            </label>
            <input
              id="other-date"
              type="date"
              className={`${inputClass} mt-1`}
              value={form.otherLeaveEventDate}
              onChange={(event) => setField("otherLeaveEventDate", event.target.value)}
            />
          </div>
        </div>

        {other.error ? (
          <p role="alert" className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {other.error}
          </p>
        ) : null}

        <div className={`${panelClass} mt-4`}>
          <p className="text-sm text-[var(--muted-foreground)]">
            {other.error ? "Entitlement" : `${other.label} — ${other.section}`}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {other.error ? DASH : showCount(other.weeks, "weeks")}
          </p>
          <dl className="mt-3">
            <Row
              label="Leave begins"
              hint={
                other.error
                  ? undefined
                  : other.startsOnEventDay
                    ? "from the date the child is handed over"
                    : "immediately following the day of the event"
              }
              value={other.error ? DASH : showDate(other.leaveStart)}
            />
            <Row label="Leave ends" value={other.error ? DASH : showDate(other.leaveEnd)} />
            <Row label="Rejoining date" value={other.error ? DASH : showDate(other.rejoinDate)} />
            {!other.error && other.earliestLawfulRejoinDate ? (
              <Row
                label="Earliest rejoining permitted"
                hint="s.4(2), six weeks after a miscarriage or medical termination"
                value={showDate(other.earliestLawfulRejoinDate)}
              />
            ) : null}
          </dl>
        </div>
      </section>

      {/* ---------------- STANDING RULES ---------------- */}
      <section className="mt-8" aria-labelledby="rules-heading">
        <h2 id="rules-heading" className="text-base font-semibold">
          What the Act says alongside the dates
        </h2>
        <dl className={`${panelClass} mt-3`}>
          <Row
            label="Nursing breaks"
            hint="s.11"
            value={
              ok
                ? `${numberFmt.format(result.nursingBreaksPerDay)} a day until ${showDate(result.nursingBreaksUntil)}`
                : DASH
            }
          />
          <Row
            label="Creche facility"
            hint={`s.11A, establishments with ${numberFmt.format(CRECHE_EMPLOYEE_THRESHOLD)} or more employees`}
            value={
              ok
                ? result.crecheApplies
                  ? `Applies — ${numberFmt.format(result.crecheVisitsPerDay)} visits a day permitted`
                  : `Does not apply at ${numberFmt.format(result.employeeCount)} employees`
                : DASH
            }
          />
          <Row
            label="Protection against dismissal"
            hint="s.12"
            value="Discharge or dismissal during, or on account of, such absence is void"
          />
          <Row
            label="Work from home"
            hint="s.5(5)"
            value="Available after the benefit is availed, where the nature of work permits, on mutually agreed terms"
          />
          <Row
            label="Written intimation of benefits"
            hint="s.11A(2)"
            value="Due in writing and electronically at the time of initial appointment"
          />
        </dl>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          Section 27 makes the Act override inconsistent awards, agreements and contracts, while
          preserving any benefit that is more favourable to the woman. An establishment&apos;s own
          policy may therefore give more than the figures on this page, and may never give less.
          The eighty-day condition in section 5(2) does not apply to a woman who has immigrated into
          the State of Assam and was pregnant at the time of immigration.
        </p>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          The qualification date projects the remaining days of actual work over the roster you
          selected, with the week filled Monday first. Actual holidays, weekly offs and absences will
          shift it. Statute text read on 29 July 2026.
        </p>
      </section>
    </div>
  );
}
