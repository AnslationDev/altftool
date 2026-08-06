"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";
import {
  LEAVE_MODES,
  MATERNITY_RULES,
  computeMaternityLeave,
  entitlementForChildren,
} from "../lib";

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "UTC",
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const showDate = (iso) => (iso ? DATE_FMT.format(new Date(`${iso}T00:00:00Z`)) : "—");

const DEFAULTS = {
  mode: "birth",
  anchorDate: "2026-09-01",
  survivingChildren: "0",
  preDeliveryWeeks: "8",
  illnessDays: "0",
  daysWorked: "220",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [anchorDate, setAnchorDate] = useState(DEFAULTS.anchorDate);
  const [survivingChildren, setSurvivingChildren] = useState(DEFAULTS.survivingChildren);
  const [preDeliveryWeeks, setPreDeliveryWeeks] = useState(DEFAULTS.preDeliveryWeeks);
  const [illnessDays, setIllnessDays] = useState(DEFAULTS.illnessDays);
  const [daysWorked, setDaysWorked] = useState(DEFAULTS.daysWorked);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      computeMaternityLeave({
        mode,
        anchorDate,
        survivingChildren: Number(survivingChildren),
        preDeliveryWeeks: Number(preDeliveryWeeks),
        illnessDays: Number(illnessDays),
        daysWorked: Number(daysWorked),
      }),
    [mode, anchorDate, survivingChildren, preDeliveryWeeks, illnessDays, daysWorked],
  );

  const anchorLabel =
    LEAVE_MODES.find((item) => item.id === mode)?.anchor ?? "Reference date";

  // The real cap on pre-delivery weeks drops to 6 once survivingChildren >= 2
  // (s.5(3) proviso); computeMaternityLeave already enforces this and shows a
  // warning when it trims the value, but the input's own max attribute should
  // match so the browser's spinner/validation reflects the true entitlement.
  const preWeeksCap = entitlementForChildren(survivingChildren).maxPreWeeks;

  const summary = useMemo(() => {
    if (plan.error) return "";
    return [
      "Maternity leave plan",
      `Basis: ${plan.basis}`,
      `${anchorLabel}: ${showDate(plan.anchorDate)}`,
      `Entitlement: ${plan.entitledWeeks} weeks (${plan.totalDays} days)`,
      `Leave begins: ${showDate(plan.leaveStart)}`,
      `Paid leave ends: ${showDate(plan.leaveEnd)}`,
      plan.illnessDays > 0 ? `Illness leave ends: ${showDate(plan.illnessEnd)}` : null,
      `Report back to work: ${showDate(plan.rejoinDate)}`,
      plan.nursingBreaksUntil
        ? `Nursing breaks until: ${showDate(plan.nursingBreaksUntil)}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [plan, anchorLabel]);

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
    setMode(DEFAULTS.mode);
    setAnchorDate(DEFAULTS.anchorDate);
    setSurvivingChildren(DEFAULTS.survivingChildren);
    setPreDeliveryWeeks(DEFAULTS.preDeliveryWeeks);
    setIllnessDays(DEFAULTS.illnessDays);
    setDaysWorked(DEFAULTS.daysWorked);
    setCopied(false);
  };

  const failed = Boolean(plan.error);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Employment leave
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Maternity Leave Date Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the expected due date to get the leave start date, the last day of paid leave and
          the date you are due back at work, using the Maternity Benefit Act, 1961 entitlement rules.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ml-mode">
              Type of leave
            </label>
            <select
              id="ml-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {LEAVE_MODES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ml-anchor">
              {anchorLabel}
            </label>
            <input
              id="ml-anchor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={anchorDate}
              onChange={(event) => setAnchorDate(event.target.value)}
            />
          </div>

          {mode === "birth" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ml-children">
                  Surviving children before this birth
                </label>
                <input
                  id="ml-children"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="10"
                  step="1"
                  value={survivingChildren}
                  onChange={(event) => setSurvivingChildren(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ml-pre">
                  Weeks taken before the due date
                </label>
                <input
                  id="ml-pre"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max={preWeeksCap}
                  step="1"
                  value={preDeliveryWeeks}
                  onChange={(event) => setPreDeliveryWeeks(event.target.value)}
                />
              </div>
            </>
          ) : null}

          {mode !== "adoption" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="ml-illness">
                Extra illness leave, days (section 10)
              </label>
              <input
                id="ml-illness"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max={MATERNITY_RULES.ILLNESS_MAX_DAYS}
                step="1"
                value={illnessDays}
                onChange={(event) => setIllnessDays(event.target.value)}
              />
            </div>
          ) : null}

          <div>
            <label className={LABEL_CLASS} htmlFor="ml-worked">
              Days worked in the last 12 months
            </label>
            <input
              id="ml-worked"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="366"
              step="1"
              value={daysWorked}
              onChange={(event) => setDaysWorked(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Leave begins
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : showDate(plan.leaveStart)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to see the plan."
                : `${plan.entitledWeeks} weeks of leave · back at work on ${showDate(plan.rejoinDate)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy maternity leave dates"
              className={GHOST_BTN}
              disabled={failed}
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
            ["Statutory basis", failed ? "—" : plan.basis],
            [
              "Total entitlement",
              failed ? "—" : `${plan.entitledWeeks} weeks (${plan.totalDays} days)`,
            ],
            [
              "Before the due date",
              failed || plan.mode !== "birth"
                ? "—"
                : `${NUM.format(plan.preWeeks)} weeks (${plan.preDays} days)`,
            ],
            [
              "After the due date",
              failed || plan.mode !== "birth"
                ? "—"
                : `${NUM.format(plan.postWeeks)} weeks (${plan.postDays} days)`,
            ],
            ["Last day of paid leave", failed ? "—" : showDate(plan.leaveEnd)],
            [
              "Illness leave (section 10)",
              failed || plan.illnessDays === 0
                ? "—"
                : `${plan.illnessDays} days, ending ${showDate(plan.illnessEnd)}`,
            ],
            ["Report back to work", failed ? "—" : showDate(plan.rejoinDate)],
            [
              "Nursing breaks available until",
              failed || !plan.nursingBreaksUntil ? "—" : showDate(plan.nursingBreaksUntil),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && plan.preCapped ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
          >
            Pre-delivery leave was trimmed to the statutory maximum of {plan.maxPreWeeks} weeks for
            this entitlement.
          </p>
        ) : null}

        {!failed && plan.eligibilityChecked && !plan.eligible ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
          >
            Section 5(2) needs at least {MATERNITY_RULES.MIN_QUALIFYING_DAYS} days of work in the
            12 months before the expected delivery date — you are {plan.qualifyingDaysShort} day(s)
            short on the figure entered.
          </p>
        ) : null}
      </section>

      {!failed ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Timeline</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Milestone
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.milestones.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 text-right font-semibold">{showDate(row.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Entitlements depend on your employer&apos;s policy, state rules and
        whether the establishment is covered by the Maternity Benefit Act or the ESI Act — confirm
        the dates with your HR team before filing your leave application.
      </p>
    </main>
  );
}
