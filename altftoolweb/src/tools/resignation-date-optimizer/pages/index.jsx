"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  Copy,
  Info,
  RotateCcw,
  Scale,
  TriangleAlert,
} from "lucide-react";

import { addMonths, addYears, parseISODate, rankResignationDates, toISODate } from "../lib";

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-medium text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const DASH = "—";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

function money(value) {
  return typeof value === "number" && Number.isFinite(value) ? inr.format(value) : DASH;
}

function signedMoney(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return DASH;
  if (value === 0) return inr.format(0);
  return `${value > 0 ? "+" : "−"}${inr.format(Math.abs(value))}`;
}

function longDate(iso) {
  const ts = parseISODate(iso);
  if (ts === null) return DASH;
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function buildDefaults() {
  const now = new Date();
  const todayTs = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    today: toISODate(todayTs),
    resignationDate: toISODate(todayTs),
    // Seeded just inside the contested 4-year band so the eligibility question
    // is answered on screen at first paint.
    dateOfJoining: toISODate(addMonths(addYears(todayTs, -4), -9)),
    noticeDays: "90",
    workDaysPerWeek: "5",
    grossMonthly: "120000",
    basicDaMonthly: "60000",
    noticeRecoveryBasis: "basic",
    leaveBalanceDays: "18",
    leaveAccrualPerMonth: "1.25",
    leaveDivisor: "26",
    bonusAmount: "200000",
    bonusDate: toISODate(addMonths(todayTs, 3)),
    bonusMode: "payout",
    marginalRate: "0.30",
  };
}

const RATE_OPTIONS = [
  ["0", "Nil"],
  ["0.05", "5%"],
  ["0.10", "10%"],
  ["0.15", "15%"],
  ["0.20", "20%"],
  ["0.25", "25%"],
  ["0.30", "30%"],
];

export default function ToolHome() {
  const [form, setForm] = useState(buildDefaults);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setCopied(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(
    () =>
      rankResignationDates({
        dateOfJoining: form.dateOfJoining,
        today: form.today,
        resignationDate: form.resignationDate,
        noticeDays: Number(form.noticeDays),
        grossMonthly: Number(form.grossMonthly),
        basicDaMonthly: Number(form.basicDaMonthly),
        leaveBalanceDays: Number(form.leaveBalanceDays),
        leaveAccrualPerMonth: Number(form.leaveAccrualPerMonth),
        leaveDivisor: Number(form.leaveDivisor),
        bonusAmount: Number(form.bonusAmount),
        bonusDate: form.bonusDate,
        bonusMode: form.bonusMode,
        noticeRecoveryBasis: form.noticeRecoveryBasis,
        marginalRate: Number(form.marginalRate),
        workDaysPerWeek: Number(form.workDaysPerWeek),
      }),
    [form],
  );

  const failed = Boolean(result.error);
  const baseline = failed ? null : result.baseline;
  const ranked = failed ? [] : result.ranked;
  const rows = failed ? [] : result.byDate;
  const flags = failed ? null : result.flags;
  const top = ranked[0] ?? null;

  async function copySummary() {
    if (failed || !baseline) return;
    const lines = [
      "Resignation date — rupee outcome by last working day",
      `Joined ${longDate(form.dateOfJoining)} | as on ${longDate(form.today)}`,
      "",
      `Gratuity, 5 years completed (s.4(1)): ${longDate(flags.strictEligibleDate)}`,
      `Gratuity, 4 years + ${flags.continuousServiceThreshold} days worked in the 5th year (contested): ${longDate(flags.contestedEligibleDate)}`,
      "",
      `Leaving today (${longDate(baseline.lwd)}): total ${money(baseline.total)}`,
      ...rows.map(
        (row) =>
          `${row.lwd} | salary ${money(row.salaryAhead)} | gratuity ${money(row.gratuity.amount)} (${row.gratuity.basis}) | leave ${money(row.leaveEncashment)} | bonus ${money(row.bonusNet)} | notice recovery ${money(row.noticeRecoverySigned)} | total ${money(row.total)} | vs today ${signedMoney(row.delta)} | FY ${row.fiscalYear}`,
      ),
      "",
      "Figures are computed, not advice. Gratuity on the 4-year-240-day reading is contested.",
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function reset() {
    setCopied(false);
    setForm(buildDefaults());
  }

  const gratuityNow = baseline?.gratuity ?? null;
  const statusTone =
    gratuityNow?.basis === "settled"
      ? "success"
      : gratuityNow?.basis === "contested"
        ? "warning"
        : "danger";
  const statusText =
    gratuityNow?.basis === "settled"
      ? "Five years of continuous service completed"
      : gratuityNow?.basis === "contested"
        ? "Only on the contested 4-year + 240-day reading"
        : "Not eligible on either reading yet";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 text-[var(--foreground)]">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <CalendarClock aria-hidden="true" className="h-7 w-7 text-[var(--primary)]" />
          Resignation Date Optimizer
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Prices each candidate last working day in rupees: gratuity under the Payment of
          Gratuity Act 1972, notice served or bought out, leave encashment, and any bonus or
          retention date. It reports the numbers and the rule behind each one. It does not tell
          you when to resign.
        </p>
      </header>

      {/* -------------------------------------------------- gratuity answer */}
      <section
        aria-labelledby="gratuity-status"
        className={`mb-6 rounded-xl p-5 ring-1 ${
          statusTone === "success"
            ? "bg-[var(--success-soft)] ring-[var(--success)]"
            : statusTone === "warning"
              ? "bg-[var(--warning-soft)] ring-[var(--warning)]"
              : "bg-[var(--danger-soft)] ring-[var(--danger)]"
        }`}
      >
        <h2
          id="gratuity-status"
          className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase"
        >
          <Scale aria-hidden="true" className="h-4 w-4" />
          Gratuity eligibility if you left on {longDate(form.today)}
        </h2>
        <p className="mt-2 text-xl font-bold sm:text-2xl">{failed ? DASH : statusText}</p>
        {!failed && (
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--muted-foreground)]">
                Service completed on {longDate(form.today)}
              </dt>
              <dd className="font-semibold">
                {gratuityNow.service.years}y {gratuityNow.service.months}m{" "}
                {gratuityNow.service.days}d
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted-foreground)]">
                Days worked in the 5th year (from {longDate(gratuityNow.fourthAnniversary)})
              </dt>
              <dd className="font-semibold">
                {num.format(gratuityNow.workedInFifthYear)} of {gratuityNow.threshold} needed
                {gratuityNow.shortOfThreshold > 0
                  ? ` — short by ${num.format(gratuityNow.shortOfThreshold)}`
                  : ""}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted-foreground)]">
                Date 4 years + {flags.continuousServiceThreshold} days worked is reached
                (contested)
              </dt>
              <dd className="font-semibold">{longDate(flags.contestedEligibleDate)}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted-foreground)]">
                Date 5 years is completed (settled, s.4(1))
              </dt>
              <dd className="font-semibold">{longDate(flags.strictEligibleDate)}</dd>
            </div>
          </dl>
        )}
        <p className="mt-4 flex gap-2 text-xs leading-5">
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>The 4-years-240-days reading is contested.</strong> Section 4(1) of the
            Payment of Gratuity Act, 1972 requires &ldquo;not less than five years&rdquo; of
            continuous service. Section 2A(2)(a) deems one year of continuous service where an
            employee has actually worked 240 days (190 days where the establishment works less
            than six days a week). Reading the two together, the Madras High Court in{" "}
            <em>Mettur Beardsell Ltd. v. Regional Labour Commissioner</em> (1998) held that 4
            years and 240 days in the fifth year qualifies, and the Kerala High Court followed
            it in <em>Sreeja B. v. Regional Joint Labour Commissioner</em> (2015). There is no
            binding Supreme Court ruling on the point and employers commonly decline to pay on
            it. Treat the contested figure as disputable, not as an entitlement.
          </span>
        </p>
      </section>

      {/* ------------------------------------------------------------ inputs */}
      <form className="grid gap-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className={CARD}>
          <legend className="px-1 text-sm font-semibold">Service and notice</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="doj">
                Date of joining
              </label>
              <input
                className={`${INPUT} mt-1`}
                id="doj"
                onChange={set("dateOfJoining")}
                type="date"
                value={form.dateOfJoining}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="today">
                Current date
              </label>
              <input
                className={`${INPUT} mt-1`}
                id="today"
                onChange={set("today")}
                type="date"
                value={form.today}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="resignation">
                Date notice is given
              </label>
              <input
                className={`${INPUT} mt-1`}
                id="resignation"
                onChange={set("resignationDate")}
                type="date"
                value={form.resignationDate}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="notice-days">
                Notice period required (days)
              </label>
              <input
                className={`${INPUT} mt-1`}
                id="notice-days"
                inputMode="numeric"
                min="0"
                onChange={set("noticeDays")}
                step="1"
                type="number"
                value={form.noticeDays}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="work-week">
                Working days a week
              </label>
              <select
                className={`${INPUT} mt-1`}
                id="work-week"
                onChange={set("workDaysPerWeek")}
                value={form.workDaysPerWeek}
              >
                <option value="5">5 days — 190-day test, s.2A(2)(a)(i)</option>
                <option value="6">6 days — 240-day test, s.2A(2)(a)(ii)</option>
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="recovery-basis">
                Notice buyout recovered on
              </label>
              <select
                className={`${INPUT} mt-1`}
                id="recovery-basis"
                onChange={set("noticeRecoveryBasis")}
                value={form.noticeRecoveryBasis}
              >
                <option value="basic">Basic + DA</option>
                <option value="gross">Monthly gross</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className={CARD}>
          <legend className="px-1 text-sm font-semibold">Pay and leave</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="gross">
                Monthly gross salary (₹)
              </label>
              <input
                className={`${INPUT} mt-1`}
                id="gross"
                inputMode="numeric"
                min="0"
                onChange={set("grossMonthly")}
                step="1000"
                type="number"
                value={form.grossMonthly}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="basic">
                Monthly basic + DA (₹)
              </label>
              <input
                className={`${INPUT} mt-1`}
                id="basic"
                inputMode="numeric"
                min="0"
                onChange={set("basicDaMonthly")}
                step="1000"
                type="number"
                value={form.basicDaMonthly}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Gratuity and leave encashment use this, not gross — s.2(s) wages exclude HRA,
                bonus, overtime and commission.
              </p>
            </div>
            <div>
              <label className={LABEL} htmlFor="leave-balance">
                Leave balance today (days)
              </label>
              <input
                className={`${INPUT} mt-1`}
                id="leave-balance"
                inputMode="decimal"
                min="0"
                onChange={set("leaveBalanceDays")}
                step="0.5"
                type="number"
                value={form.leaveBalanceDays}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="leave-accrual">
                Leave earned per month (days)
              </label>
              <input
                className={`${INPUT} mt-1`}
                id="leave-accrual"
                inputMode="decimal"
                min="0"
                onChange={set("leaveAccrualPerMonth")}
                step="0.25"
                type="number"
                value={form.leaveAccrualPerMonth}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="leave-divisor">
                Encashment day = basic + DA divided by
              </label>
              <select
                className={`${INPUT} mt-1`}
                id="leave-divisor"
                onChange={set("leaveDivisor")}
                value={form.leaveDivisor}
              >
                <option value="26">26 working days</option>
                <option value="30">30 calendar days</option>
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="rate">
                Your marginal income tax rate
              </label>
              <select
                className={`${INPUT} mt-1`}
                id="rate"
                onChange={set("marginalRate")}
                value={form.marginalRate}
              >
                {RATE_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label} + 4% cess
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className={CARD}>
          <legend className="px-1 text-sm font-semibold">Bonus or retention clause</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={LABEL} htmlFor="bonus-mode">
                Clause type
              </label>
              <select
                className={`${INPUT} mt-1`}
                id="bonus-mode"
                onChange={set("bonusMode")}
                value={form.bonusMode}
              >
                <option value="payout">Paid if still employed on the date</option>
                <option value="clawback">Clawed back if you leave before the date</option>
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="bonus-amount">
                Amount (₹, 0 if none)
              </label>
              <input
                className={`${INPUT} mt-1`}
                id="bonus-amount"
                inputMode="numeric"
                min="0"
                onChange={set("bonusAmount")}
                step="1000"
                type="number"
                value={form.bonusAmount}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="bonus-date">
                Clause date
              </label>
              <input
                className={`${INPUT} mt-1`}
                id="bonus-date"
                onChange={set("bonusDate")}
                type="date"
                value={form.bonusDate}
              />
            </div>
          </div>
        </fieldset>
      </form>

      {failed && (
        <p
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          role="alert"
        >
          {result.error}
        </p>
      )}

      {/* ----------------------------------------------------------- results */}
      <section aria-labelledby="ranked-heading" className={`mt-6 ${CARD}`}>
        <h2 id="ranked-heading" className="text-sm font-semibold">
          Dates ranked by total rupee outcome
        </h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Total = salary for days still worked + gratuity + leave encashment + bonus received −
          notice buyout recovery − clawback. Before income tax. Ranking is arithmetic only.
        </p>

        <div className="mt-4 border-b border-[var(--border)] pb-4">
          <p className="text-xs text-[var(--muted-foreground)]">
            Highest total in the list, versus leaving today
          </p>
          <p className="text-3xl font-bold tabular-nums sm:text-4xl">
            {failed || !top ? DASH : signedMoney(top.delta)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {failed || !top
              ? DASH
              : `Last working day ${longDate(top.lwd)} — ${top.daysAhead} days from today. Leaving today totals ${money(baseline.total)}.`}
          </p>
        </div>

        <ol className="mt-4 grid gap-3">
          {(failed ? [] : ranked).map((row, index) => (
            <li
              key={row.lwd}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">
                  {index + 1}. {longDate(row.lwd)}
                </p>
                <p className="text-lg font-bold tabular-nums">{signedMoney(row.delta)}</p>
              </div>
              <dl className="mt-2 grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--muted-foreground)]">Total</dt>
                  <dd className="font-medium tabular-nums">{money(row.total)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--muted-foreground)]">
                    Exit settlement only (no salary)
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {money(row.settlementTotal)} ({signedMoney(row.settlementDelta)})
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--muted-foreground)]">Tax-free portion</dt>
                  <dd className="font-medium tabular-nums">{money(row.exemptTotal)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--muted-foreground)]">Payout financial year</dt>
                  <dd className="font-medium tabular-nums">FY {row.fiscalYear}</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {row.reasons.join(" · ")}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            aria-label="Copy the full date-by-date breakdown to the clipboard"
            className={PRIMARY_BTN}
            disabled={failed}
            onClick={copySummary}
            type="button"
          >
            {copied ? (
              <Check aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Copy aria-hidden="true" className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button
            aria-label="Reset all inputs to their defaults"
            className={GHOST_BTN}
            onClick={reset}
            type="button"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------ table */}
      <section aria-labelledby="table-heading" className={`mt-6 ${CARD}`}>
        <h2 id="table-heading" className="text-sm font-semibold">
          Every candidate date, component by component
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[56rem] border-collapse text-sm">
            <caption className="sr-only">
              Rupee components of the exit settlement for each candidate last working day
            </caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)]">
                <th className="px-2 py-2 font-medium" scope="col">
                  Last working day
                </th>
                <th className="px-2 py-2 text-right font-medium" scope="col">
                  Salary till exit
                </th>
                <th className="px-2 py-2 text-right font-medium" scope="col">
                  Gratuity
                </th>
                <th className="px-2 py-2 text-right font-medium" scope="col">
                  Leave encashment
                </th>
                <th className="px-2 py-2 text-right font-medium" scope="col">
                  Bonus
                </th>
                <th className="px-2 py-2 text-right font-medium" scope="col">
                  Notice recovery
                </th>
                <th className="px-2 py-2 text-right font-medium" scope="col">
                  Total
                </th>
                <th className="px-2 py-2 text-right font-medium" scope="col">
                  vs today
                </th>
                <th className="px-2 py-2 text-right font-medium" scope="col">
                  FY
                </th>
              </tr>
            </thead>
            <tbody>
              {failed && (
                <tr>
                  <td className="px-2 py-3 text-[var(--muted-foreground)]" colSpan={9}>
                    {DASH}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr
                  key={row.lwd}
                  className="border-b border-[var(--border)] align-top last:border-0"
                >
                  <th className="px-2 py-2 text-left font-medium" scope="row">
                    {longDate(row.lwd)}
                    <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                      {row.daysAhead === 0 ? "today" : `+${row.daysAhead} days`}
                      {row.gratuity.basis === "contested" ? " · gratuity contested" : ""}
                    </span>
                  </th>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {money(row.salaryAhead)}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {money(row.gratuity.amount)}
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {row.gratuity.eligible ? `${row.gratuity.payableYears} yrs` : "not eligible"}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {money(row.leaveEncashment)}
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {num.format(row.leaveDays)} d
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {money(row.bonusNet)}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {money(row.noticeRecoverySigned)}
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {row.noticeShortfall} d short
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums">
                    {money(row.total)}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">{signedMoney(row.delta)}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{row.fiscalYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ------------------------------------------------- notice pay + tax */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="buyout-heading" className={CARD}>
          <h2 id="buyout-heading" className="text-sm font-semibold">
            Notice served versus bought out, if you left today
          </h2>
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted-foreground)]">Shortfall in notice</dt>
              <dd className="font-medium tabular-nums">
                {failed ? DASH : `${baseline.noticeShortfall} days`}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted-foreground)]">Recovery deducted</dt>
              <dd className="font-medium tabular-nums">
                {failed ? DASH : money(baseline.noticeRecovery)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted-foreground)]">
                Tax that turns on the treatment
              </dt>
              <dd className="font-medium tabular-nums">
                {failed ? DASH : money(baseline.buyoutTaxSwing)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted-foreground)]">
                Pre-tax earnings needed to fund it
              </dt>
              <dd className="font-medium tabular-nums">
                {failed ? DASH : money(baseline.recoveryPreTaxCost)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Section 16 of the Income-tax Act, 1961 lists no deduction for notice pay recovered by
            an employer, so most employers deduct TDS on gross salary and report the un-netted
            figure in Form 16. The ITAT Ahmedabad bench took the opposite view in{" "}
            <em>Nandinho Rebello v. DCIT</em> (ITA No. 2378/Ahd/2013, order dated 18 April 2017),
            holding that only salary actually received was taxable; that order binds nobody else.
            The gross-up above is the recovery divided by one minus your marginal rate including
            4% cess. On GST, CBIC Circular No. 178/10/2022-GST dated 3 August 2022 confirms notice
            pay recovery is not consideration for a supply, so no GST arises.
          </p>
        </section>

        <section aria-labelledby="fy-heading" className={CARD}>
          <h2 id="fy-heading" className="text-sm font-semibold">
            Month and financial year boundaries
          </h2>
          <p className="mt-3 text-sm">
            {failed
              ? DASH
              : flags.crossesFiscalYear
                ? `The candidate dates fall across financial years ${flags.fiscalYears.join(" and ")}. The financial year runs 1 April to 31 March, so a last working day on 31 March and one on 1 April put the same settlement into different years of assessment.`
                : `Every candidate date falls in financial year ${flags.fiscalYears[0]}, so no candidate shifts the settlement into a different year of assessment.`}
          </p>
          <ul className="mt-3 grid gap-2 text-xs text-[var(--muted-foreground)]">
            <li className="flex gap-2">
              <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Gratuity is exempt under s.10(10)(ii) up to ₹20,00,000 across an entire career, and
              leave encashment under s.10(10AA)(ii) up to ₹25,00,000 across an entire career
              (CBDT Notification No. 31/2023 dated 24 May 2023). Both ceilings are lifetime, not
              annual, so the year a payout lands in does not reset them.
            </li>
            <li className="flex gap-2">
              <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {failed
                ? DASH
                : `Tax-free portion if you left today: ${money(baseline.exemptTotal)} of ${money(baseline.total)}. Taxable portion of the payout: ${money(baseline.taxableBase)}.`}
            </li>
            <li className="flex gap-2">
              <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              A last working day inside a month still earns part-month salary; this page prices
              part months at monthly gross ÷ 30 per calendar day.
            </li>
          </ul>
        </section>
      </div>

      {/* ------------------------------------------------------ assumptions */}
      <section aria-labelledby="assumptions-heading" className={`mt-6 ${CARD}`}>
        <h2 id="assumptions-heading" className="text-sm font-semibold">
          Rules applied and assumptions made
        </h2>
        <ul className="mt-3 grid gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
          <li>
            Gratuity = 15 ÷ 26 × last drawn monthly basic + DA × qualifying years, per s.4(2) of
            the Payment of Gratuity Act, 1972. A part year over six months counts as a full year.
            The statutory ceiling is ₹20,00,000 (s.4(3), as amended with effect from 29 March
            2018).
          </li>
          <li>
            Days worked in the fifth year are counted as the establishment&rsquo;s working days
            between the fourth anniversary of joining and the last working day, both inclusive.
            Paid public holidays are not deducted, because the Explanation to s.2A treats leave
            with full wages as days worked. Unpaid absence is not modelled.
          </li>
          <li>
            Leave encashment = balance plus accrual, valued at basic + DA divided by the day
            basis you selected. The s.10(10AA)(ii) exemption is the least of ₹25,00,000, the
            amount received, ten months&rsquo; average basic + DA, and the cash value of leave
            credited at 30 days per completed year. Current basic + DA stands in for the ten-month
            average, and the balance is assumed to sit within the 30-day-a-year credit.
          </li>
          <li>
            Notice recovery = shortfall days × the basis you selected ÷ 30. Employer policy on
            the recovery base and on part-month salary varies; the divisor used here is stated on
            screen so you can check it against your appointment letter.
          </li>
          <li>
            The estimated tax shown applies your chosen marginal rate plus 4% health and education
            cess to the taxable part of the exit payout only. It is not a full-year tax
            computation and takes no account of slabs, regime choice, or other income.
          </li>
          <li>
            Figures read on 28 July 2026. This page computes and reports. It is not legal or tax
            advice, and no date on it is put forward as a recommended one.
          </li>
        </ul>
      </section>
    </div>
  );
}
