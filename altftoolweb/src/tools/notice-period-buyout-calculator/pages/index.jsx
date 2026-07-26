"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  basic: 45000,
  allowances: 45000,
  base: "basic",
  requiredDays: 90,
  servedDays: 30,
  leaveDays: 10,
  dayBasis: "30",
  gst: false,
  reimburse: 0,
};

const BASE_OPTIONS = [
  { id: "basic", label: "Basic + DA only" },
  { id: "gross", label: "Full monthly gross" },
];

const DAY_BASIS_OPTIONS = [
  { id: "30", label: "30 days", value: 30 },
  { id: "26", label: "26 working days", value: 26 },
  { id: "365", label: "Calendar year / 365", value: 365 / 12 },
];

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Notice buyout = unserved days x per-day salary on the contractual base.
 * Approved leave balance can normally be set off against the shortfall first.
 */
export function computeBuyout({
  basic,
  allowances,
  base,
  requiredDays,
  servedDays,
  leaveDays,
  daysPerMonth,
  gst,
  reimburse,
}) {
  const gross = basic + allowances;
  const monthlyBase = base === "gross" ? gross : basic;
  const perDay = daysPerMonth > 0 ? monthlyBase / daysPerMonth : 0;

  const pendingDays = Math.max(0, requiredDays - servedDays);
  const leaveUsed = Math.min(leaveDays, pendingDays);
  const shortfallDays = Math.max(0, pendingDays - leaveUsed);

  const buyout = shortfallDays * perDay;
  const gstAmount = gst ? buyout * 0.18 : 0;
  const totalPayable = buyout + gstAmount;
  const netCost = Math.max(0, totalPayable - reimburse);

  return {
    gross,
    monthlyBase,
    perDay,
    pendingDays,
    leaveUsed,
    shortfallDays,
    buyout,
    gstAmount,
    totalPayable,
    netCost,
    lastWorkingDayShift: shortfallDays,
    monthsOfBase: monthlyBase > 0 ? buyout / monthlyBase : 0,
  };
}

export default function ToolHome() {
  const [basic, setBasic] = useState(String(DEFAULTS.basic));
  const [allowances, setAllowances] = useState(String(DEFAULTS.allowances));
  const [base, setBase] = useState(DEFAULTS.base);
  const [requiredDays, setRequiredDays] = useState(String(DEFAULTS.requiredDays));
  const [servedDays, setServedDays] = useState(String(DEFAULTS.servedDays));
  const [leaveDays, setLeaveDays] = useState(String(DEFAULTS.leaveDays));
  const [dayBasis, setDayBasis] = useState(DEFAULTS.dayBasis);
  const [gst, setGst] = useState(DEFAULTS.gst);
  const [reimburse, setReimburse] = useState(String(DEFAULTS.reimburse));
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const b = toNumber(basic);
    const a = toNumber(allowances);
    const req = toNumber(requiredDays);
    const served = toNumber(servedDays);
    const leave = toNumber(leaveDays);
    const reimb = toNumber(reimburse);

    if ([b, a, req, served, leave, reimb].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (b <= 0) return { error: "Basic + DA must be greater than zero." };
    if (a < 0 || leave < 0 || reimb < 0) return { error: "Amounts and days cannot be negative." };
    if (req <= 0 || req > 365) return { error: "Notice period should be between 1 and 365 days." };
    if (served < 0) return { error: "Days already served cannot be negative." };
    if (served > req) return { error: "Days served cannot exceed the required notice period." };
    if (leave > 365) return { error: "Leave balance looks too high — enter days, not hours." };

    const option = DAY_BASIS_OPTIONS.find((item) => item.id === dayBasis) ?? DAY_BASIS_OPTIONS[0];

    return computeBuyout({
      basic: b,
      allowances: a,
      base,
      requiredDays: req,
      servedDays: served,
      leaveDays: leave,
      daysPerMonth: option.value,
      gst,
      reimburse: reimb,
    });
  }, [basic, allowances, base, requiredDays, servedDays, leaveDays, dayBasis, gst, reimburse]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Notice Period Buyout Calculator",
      `Monthly gross: ${money(calc.gross)}`,
      `Buyout base: ${base === "gross" ? "Full monthly gross" : "Basic + DA"} (${money(calc.monthlyBase)})`,
      `Per-day salary: ${money(calc.perDay)}`,
      `Notice pending after service: ${num(calc.pendingDays)} days`,
      `Leave adjusted: ${num(calc.leaveUsed)} days`,
      `Days to buy out: ${num(calc.shortfallDays)} days`,
      `Buyout amount: ${money(calc.buyout)}`,
      gst ? `GST @18%: ${money(calc.gstAmount)}` : null,
      `Total payable to employer: ${money(calc.totalPayable)}`,
      `Net cost after new-employer reimbursement: ${money(calc.netCost)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [calc, base, gst]);

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
    setBasic(String(DEFAULTS.basic));
    setAllowances(String(DEFAULTS.allowances));
    setBase(DEFAULTS.base);
    setRequiredDays(String(DEFAULTS.requiredDays));
    setServedDays(String(DEFAULTS.servedDays));
    setLeaveDays(String(DEFAULTS.leaveDays));
    setDayBasis(DEFAULTS.dayBasis);
    setGst(DEFAULTS.gst);
    setReimburse(String(DEFAULTS.reimburse));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Notice buyout
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Notice Period Buyout Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See exactly what it costs to leave early. Enter your salary split, how much notice you
          will actually serve and the leave you can adjust — the calculator returns the recovery
          amount your employer will deduct or invoice.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="npb-basic">
              Monthly Basic + DA (INR)
            </label>
            <input
              id="npb-basic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={basic}
              onChange={(event) => setBasic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="npb-allow">
              Other monthly allowances (INR)
            </label>
            <input
              id="npb-allow"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={allowances}
              onChange={(event) => setAllowances(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="npb-base">
              Buyout is charged on
            </label>
            <select
              id="npb-base"
              className={`mt-2 ${INPUT_CLASS}`}
              value={base}
              onChange={(event) => setBase(event.target.value)}
            >
              {BASE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="npb-daybasis">
              Per-day salary basis
            </label>
            <select
              id="npb-daybasis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dayBasis}
              onChange={(event) => setDayBasis(event.target.value)}
            >
              {DAY_BASIS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="npb-required">
              Notice period in contract (days)
            </label>
            <input
              id="npb-required"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              value={requiredDays}
              onChange={(event) => setRequiredDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="npb-served">
              Notice you will serve (days)
            </label>
            <input
              id="npb-served"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={servedDays}
              onChange={(event) => setServedDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="npb-leave">
              Leave balance adjusted against notice (days)
            </label>
            <input
              id="npb-leave"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={leaveDays}
              onChange={(event) => setLeaveDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="npb-reimburse">
              New employer buyout reimbursement (INR)
            </label>
            <input
              id="npb-reimburse"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={reimburse}
              onChange={(event) => setReimburse(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={gst}
              onChange={(event) => setGst(event.target.checked)}
            />
            Employer invoices GST @18% on the buyout
          </label>
          <div className="flex flex-wrap gap-2">
            {[30, 60, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setRequiredDays(String(days))}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {days}-day notice
              </button>
            ))}
          </div>
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Notice buyout payable
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                {money(calc.totalPayable)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {num(calc.shortfallDays)} unserved days at {money(calc.perDay)} per day
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy notice period buyout result"
                className={GHOST_BTN}
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset all inputs"
                className={PRIMARY_BTN}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Monthly gross salary", money(calc.gross)],
              [
                "Salary base used for buyout",
                `${money(calc.monthlyBase)} (${base === "gross" ? "gross" : "Basic + DA"})`,
              ],
              ["Per-day salary", money(calc.perDay)],
              ["Notice left after days served", `${num(calc.pendingDays)} days`],
              ["Leave adjusted against notice", `${num(calc.leaveUsed)} days`],
              ["Days you must buy out", `${num(calc.shortfallDays)} days`],
              ["Buyout amount", money(calc.buyout)],
              gst ? ["GST @18%", money(calc.gstAmount)] : null,
              ["Total payable to employer", money(calc.totalPayable)],
              ["Net cost after reimbursement", money(calc.netCost)],
              ["Buyout in months of base salary", `${num(calc.monthsOfBase)} months`],
            ]
              .filter(Boolean)
              .map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
          </dl>

          {calc.shortfallDays === 0 && (
            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--success)]">
              Nothing to buy out — the notice served plus adjusted leave already covers the full
              notice period.
            </p>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Buyout terms differ by contract — some employers charge on CTC,
        refuse leave adjustment, or recover the amount from the full and final settlement instead of
        invoicing you. Read your appointment letter and confirm with HR.
      </p>
    </main>
  );
}
