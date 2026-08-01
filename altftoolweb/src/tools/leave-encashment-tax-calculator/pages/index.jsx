"use client";

import { useCallback, useMemo, useState } from "react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => inr.format(Number.isFinite(value) ? value : 0);
const days = (value) =>
  `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(
    Number.isFinite(value) ? value : 0
  )} days`;

const LIFETIME_CAP = 2500000;
const MONTHS_MULTIPLE = 10;
const STATUTORY_LEAVE_PER_YEAR = 30;

const EMPLOYER_OPTIONS = [
  { id: "private", label: "Private / non-government employer" },
  { id: "government", label: "Central or State government employee" },
];

const EVENT_OPTIONS = [
  { id: "retirement", label: "Retirement, superannuation or resignation" },
  { id: "service", label: "Encashment while still in service" },
];

const DEFAULT_STATE = {
  employer: "private",
  event: "retirement",
  avgSalary: "80000",
  years: "20",
  entitlement: "30",
  availed: "180",
  received: "800000",
  priorExemption: "0",
};

const toNumber = (value) => {
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULT_STATE);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const setField = useCallback(
    (key, value) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      resetCopyState();
    },
    [resetCopyState],
  );

  const calc = useMemo(() => {
    const errors = [];
    const avgSalary = toNumber(form.avgSalary);
    const years = toNumber(form.years);
    const entitlement = toNumber(form.entitlement);
    const availed = toNumber(form.availed);
    const received = toNumber(form.received);
    const priorExemption = toNumber(form.priorExemption);

    if (!Number.isFinite(avgSalary) || avgSalary <= 0)
      errors.push("Enter the average monthly salary as a number greater than zero.");
    if (!Number.isFinite(years) || years < 0)
      errors.push("Enter completed years of service as 0 or more.");
    if (!Number.isFinite(entitlement) || entitlement < 0)
      errors.push("Enter leave entitlement per year as 0 or more days.");
    if (!Number.isFinite(availed) || availed < 0)
      errors.push("Enter leave already taken or encashed as 0 or more days.");
    if (!Number.isFinite(received) || received < 0)
      errors.push("Enter the leave encashment received as 0 or more.");
    if (!Number.isFinite(priorExemption) || priorExemption < 0)
      errors.push("Enter exemption already claimed as 0 or more.");

    if (errors.length) return { errors };

    const completedYears = Math.floor(years);
    const cappedEntitlement = Math.min(entitlement, STATUTORY_LEAVE_PER_YEAR);
    const creditedDays = cappedEntitlement * completedYears;
    const unavailedDays = Math.max(0, creditedDays - availed);
    const dailySalary = avgSalary / 30;
    const cashEquivalent = unavailedDays * dailySalary;
    const tenMonthsSalary = MONTHS_MULTIPLE * avgSalary;
    const capRemaining = Math.max(0, LIFETIME_CAP - priorExemption);

    let exempt;
    let limbs;
    let note;

    if (form.employer === "government") {
      if (form.event === "retirement") {
        exempt = received;
        limbs = [["Government employee on retirement", "Fully exempt under section 10(10AA)(i)"]];
        note =
          "Leave encashment received by a Central or State government employee at retirement is fully exempt from tax.";
      } else {
        exempt = 0;
        limbs = [["Encashment while in service", "Fully taxable"]];
        note =
          "Leave encashed during service is taxable as salary for every employee, government or not. Relief under section 89 may be claimed.";
      }
    } else if (form.event === "service") {
      exempt = 0;
      limbs = [["Encashment while in service", "Fully taxable"]];
      note =
        "Leave encashed while still working is fully taxable as salary. Only encashment at retirement or resignation qualifies for the section 10(10AA)(ii) exemption.";
    } else {
      exempt = Math.max(0, Math.min(received, capRemaining, tenMonthsSalary, cashEquivalent));
      limbs = [
        ["1. Leave encashment actually received", money(received)],
        [
          `2. Statutory limit${priorExemption > 0 ? " left" : ""}`,
          money(capRemaining),
        ],
        ["3. 10 months × average monthly salary", money(tenMonthsSalary)],
        [
          `4. Cash value of ${days(unavailedDays)} unavailed leave`,
          money(cashEquivalent),
        ],
      ];
      note = null;
    }

    const taxable = Math.max(0, received - exempt);

    return {
      errors: [],
      avgSalary,
      completedYears,
      cappedEntitlement,
      entitlementEntered: entitlement,
      creditedDays,
      availed,
      unavailedDays,
      dailySalary,
      cashEquivalent,
      tenMonthsSalary,
      capRemaining,
      received,
      exempt,
      taxable,
      limbs,
      note,
    };
  }, [form]);

  const report = useMemo(() => {
    if (calc.errors?.length) return "";
    const lines = [
      "Leave Encashment Tax Calculation",
      "",
      `Employer: ${EMPLOYER_OPTIONS.find((o) => o.id === form.employer)?.label}`,
      `Event: ${EVENT_OPTIONS.find((o) => o.id === form.event)?.label}`,
      `Average monthly salary (last 10 months): ${money(calc.avgSalary)}`,
      `Completed years of service: ${calc.completedYears}`,
      `Leave credited at ${calc.cappedEntitlement} days a year: ${days(calc.creditedDays)}`,
      `Leave already taken or encashed: ${days(calc.availed)}`,
      `Unavailed leave counted: ${days(calc.unavailedDays)}`,
      "",
      `Leave encashment received: ${money(calc.received)}`,
      `Exempt under section 10(10AA): ${money(calc.exempt)}`,
      `Taxable as salary: ${money(calc.taxable)}`,
      "",
      "Informational only — confirm with your employer or tax adviser.",
    ];
    return lines.join("\n");
  }, [calc, form.employer, form.event]);

  const copyReport = () => {
    if (!report) return;
    copyToClipboard("result", report, { label: "Leave encashment tax calculation" });
  };

  const inputClass =
    "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

  const hasErrors = Boolean(calc.errors?.length);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">Leave Encashment Tax Calculator</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            When a private-sector employee retires or resigns, section 10(10AA)(ii) exempts the least
            of four amounts — the encashment received, the {money(LIFETIME_CAP)} lifetime limit, ten
            months of average salary, and the cash value of unavailed leave capped at 30 days per
            completed year. This tool runs all four and shows what stays taxable.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your details</h2>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="lec-employer" className="text-sm font-semibold">
                    Employer type
                  </label>
                  <select
                    id="lec-employer"
                    value={form.employer}
                    onChange={(e) => setField("employer", e.target.value)}
                    className={inputClass}
                  >
                    {EMPLOYER_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="lec-event" className="text-sm font-semibold">
                    When was the leave encashed?
                  </label>
                  <select
                    id="lec-event"
                    value={form.event}
                    onChange={(e) => setField("event", e.target.value)}
                    className={inputClass}
                  >
                    {EVENT_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="lec-salary" className="text-sm font-semibold">
                    Average monthly salary, last 10 months (₹)
                  </label>
                  <input
                    id="lec-salary"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1000"
                    value={form.avgSalary}
                    onChange={(e) => setField("avgSalary", e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Basic pay + DA forming part of retirement benefits + commission fixed as a
                    percentage of turnover.
                  </p>
                </div>
                <div>
                  <label htmlFor="lec-years" className="text-sm font-semibold">
                    Completed years of service
                  </label>
                  <input
                    id="lec-years"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={form.years}
                    onChange={(e) => setField("years", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="lec-entitlement" className="text-sm font-semibold">
                    Leave earned per year (days)
                  </label>
                  <input
                    id="lec-entitlement"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="60"
                    step="1"
                    value={form.entitlement}
                    onChange={(e) => setField("entitlement", e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    The exemption counts a maximum of 30 days a year even if your policy is more
                    generous.
                  </p>
                </div>
                <div>
                  <label htmlFor="lec-availed" className="text-sm font-semibold">
                    Leave already taken or encashed (days)
                  </label>
                  <input
                    id="lec-availed"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={form.availed}
                    onChange={(e) => setField("availed", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="lec-received" className="text-sm font-semibold">
                    Leave encashment received (₹)
                  </label>
                  <input
                    id="lec-received"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1000"
                    value={form.received}
                    onChange={(e) => setField("received", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="lec-prior" className="text-sm font-semibold">
                    Exemption already claimed earlier (₹)
                  </label>
                  <input
                    id="lec-prior"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="10000"
                    value={form.priorExemption}
                    onChange={(e) => setField("priorExemption", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (
                  !window.confirm(
                    "Reset every field? This will clear all your entered values and cannot be undone.",
                  )
                ) {
                  return;
                }
                setForm(DEFAULT_STATE);
                resetCopyState();
              }}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              Reset
            </button>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {hasErrors ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {calc.errors[0]}
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Exempt under section 10(10AA)
                </p>
                <p className="mt-2 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.exempt)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  out of {money(calc.received)} received — {money(calc.taxable)} is taxable as salary
                </p>

                <dl className="mt-5 grid gap-2">
                  {[
                    ["Leave encashment received", money(calc.received)],
                    ["Exempt amount", money(calc.exempt)],
                    ["Taxable as salary", money(calc.taxable)],
                    ["Unavailed leave counted", days(calc.unavailedDays)],
                    ["Average daily salary", money(calc.dailySalary)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    >
                      <dt className="text-[var(--muted-foreground)]">{label}</dt>
                      <dd className="font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>

                <h3 className="mt-6 text-sm font-semibold">Exemption test</h3>
                <ul className="mt-2 grid gap-1 text-sm">
                  {calc.limbs.map(([label, value]) => (
                    <li
                      key={label}
                      className="flex justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                    >
                      <span className="text-[var(--muted-foreground)]">{label}</span>
                      <span className="font-medium">{value}</span>
                    </li>
                  ))}
                </ul>

                {calc.note ? (
                  <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6">
                    {calc.note}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={copyReport}
                  aria-label={
                    isCopied("result")
                      ? "Copied the leave encashment tax calculation to clipboard"
                      : "Copy the leave encashment tax calculation"
                  }
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {isCopied("result") ? "Copied!" : "Copy result"}
                </button>
                <span className="sr-only" role="status" aria-live="polite">
                  {announcement}
                </span>

                <div className="mt-5 grid gap-2 text-xs leading-6 text-[var(--muted-foreground)]">
                  <p>
                    Leave credit is computed at {calc.cappedEntitlement} days for each of{" "}
                    {calc.completedYears} completed years ({days(calc.creditedDays)}), less{" "}
                    {days(calc.availed)} already taken or encashed.
                    {calc.entitlementEntered > STATUTORY_LEAVE_PER_YEAR
                      ? ` Your entitlement of ${calc.entitlementEntered} days a year was trimmed to the statutory 30 days.`
                      : ""}
                  </p>
                  <p>
                    The {money(LIFETIME_CAP)} ceiling applies from 1 April 2023 and is a lifetime
                    limit across all employers. Informational only — confirm with your employer or a
                    tax adviser.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
