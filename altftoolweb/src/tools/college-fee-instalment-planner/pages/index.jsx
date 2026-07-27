"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import { addMonths, formatIsoDate, parseIsoDate, planFeeInstalments } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const showDate = (iso) => {
  const stamp = parseIsoDate(iso);
  return stamp === null ? "—" : DATE_FMT.format(new Date(stamp));
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

function todayIso() {
  const now = new Date();
  return formatIsoDate(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function defaultFirstDue() {
  const stamp = parseIsoDate(todayIso());
  return formatIsoDate(addMonths(stamp, 3));
}

const DEFAULTS = {
  fee: "400000",
  instalments: "4",
  gap: "6",
  saved: "0",
  rate: "0",
  lead: "15",
};

export default function ToolHome() {
  const [fee, setFee] = useState(DEFAULTS.fee);
  const [instalments, setInstalments] = useState(DEFAULTS.instalments);
  const [gap, setGap] = useState(DEFAULTS.gap);
  const [saved, setSaved] = useState(DEFAULTS.saved);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [lead, setLead] = useState(DEFAULTS.lead);
  const [planFrom, setPlanFrom] = useState(todayIso);
  const [firstDue, setFirstDue] = useState(defaultFirstDue);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planFeeInstalments({
        totalFee: fee,
        instalments,
        firstDueDate: firstDue,
        monthsBetween: gap,
        today: planFrom,
        alreadySaved: saved,
        annualRate: rate,
        reminderLeadDays: lead,
      }),
    [fee, instalments, firstDue, gap, planFrom, saved, rate, lead],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "College Fee Instalment Planner",
      `Total fee: ${money(result.totalFee)} in ${result.instalments} instalments of ${money(result.perInstalment)}`,
      `Set aside this month: ${money2(result.firstMonthOutgo)}`,
      `Savings applied: ${money(result.savingsUsed)}`,
      `Total still to deposit: ${money(result.totalDeposited)}`,
      `First due: ${showDate(result.firstDueDate)} · Last due: ${showDate(result.lastDueDate)}`,
      "",
      ...result.schedule.map(
        (row) =>
          `#${row.number} due ${showDate(row.dueDate)} — ${money(row.amount)} (remind on ${showDate(row.remindOn)}; set aside ${money2(row.monthlySetAside || 0)}/month for ${row.monthsToSave} month(s))`,
      ),
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
    setFee(DEFAULTS.fee);
    setInstalments(DEFAULTS.instalments);
    setGap(DEFAULTS.gap);
    setSaved(DEFAULTS.saved);
    setRate(DEFAULTS.rate);
    setLead(DEFAULTS.lead);
    setPlanFrom(todayIso());
    setFirstDue(defaultFirstDue());
    setCopied(false);
  };

  const numberFields = [
    { id: "fee-total", label: "Total fee for the programme (₹)", value: fee, set: setFee, step: "10000" },
    { id: "fee-count", label: "Number of instalments", value: instalments, set: setInstalments, step: "1" },
    { id: "fee-gap", label: "Months between instalments", value: gap, set: setGap, step: "1" },
    { id: "fee-saved", label: "Already saved for fees (₹)", value: saved, set: setSaved, step: "5000" },
    { id: "fee-rate", label: "Interest on parked money (% per year)", value: rate, set: setRate, step: "0.25" },
    { id: "fee-lead", label: "Remind me this many days before", value: lead, set: setLead, step: "1" },
  ];

  const rows = hasError
    ? [
        ["Each instalment", DASH],
        ["Existing savings applied", DASH],
        ["Left over from savings", DASH],
        ["Total still to deposit", DASH],
        ["Interest the balance earns", DASH],
        ["Saving period", DASH],
      ]
    : [
        ["Each instalment", money(result.perInstalment)],
        ["Existing savings applied", money(result.savingsUsed)],
        ["Left over from savings", money(result.savingsLeftOver)],
        ["Total still to deposit", money(result.totalDeposited)],
        ["Interest the balance earns", money(result.interestEarned)],
        [
          "Saving period",
          `${result.monthsOfSaving} month(s), ending ${showDate(result.lastDueDate)}`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Fee schedule
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">College Fee Instalment Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a semester fee schedule into a month-by-month savings plan. Each instalment gets its
          own sinking fund, so the nearest due date is funded first and your monthly commitment
          steps down as each semester is cleared.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fee-from">
              Plan from (today)
            </label>
            <input
              id="fee-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={planFrom}
              onChange={(event) => setPlanFrom(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fee-first-due">
              First instalment due on
            </label>
            <input
              id="fee-first-due"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={firstDue}
              onChange={(event) => setFirstDue(event.target.value)}
            />
          </div>
          {numberFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Set aside this month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money2(result.firstMonthOutgo)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your plan."
                : result.fullyCovered
                  ? "Your existing savings already cover every instalment."
                  : `Falls to ${money2(result.phases.length > 1 ? result.phases[1].monthly : 0)} after ${showDate(result.firstDueDate)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the fee savings plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Due dates and reminders</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Due date</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Remind on</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="py-2 text-right font-semibold">Set aside / month</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.number} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.number}</td>
                    <td className="py-2 pr-3">{showDate(row.dueDate)}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{showDate(row.remindOn)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.amount)}</td>
                    <td className="py-2 text-right font-semibold">
                      {row.monthlySetAside ? `${money2(row.monthlySetAside)} × ${row.monthsToSave}` : "Covered"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && result.phases.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What you deposit each month</h2>
          <ul className="mt-3 divide-y divide-[var(--border)] text-sm">
            {result.phases.map((phase) => (
              <li key={phase.fromMonth} className="flex items-center justify-between gap-4 py-2.5">
                <span className="text-[var(--muted-foreground)]">
                  Month {phase.fromMonth}
                  {phase.months > 1 ? `–${phase.toMonth}` : ""} (until {showDate(phase.untilDue)})
                </span>
                <span className="text-right font-semibold">{money2(phase.monthly)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Reminder dates are calculated, not sent — add them to your own calendar. Confirm the exact
        due dates and any late fee with the institution&rsquo;s fee notice.
      </p>
    </main>
  );
}
