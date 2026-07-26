"use client";

import { useCallback, useMemo, useState } from "react";
import { safeCopyText } from "@/shared/utils/clipboard";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => inr.format(Number.isFinite(value) ? value : 0);
const pct = (value) =>
  `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
    Number.isFinite(value) ? value : 0
  )}%`;

const EPS_WAGE_CEILING = 15000;
const EPS_RATE = 0.0833;
const EMPLOYER_RATE = 0.12;

const DEFAULT_STATE = {
  currentAge: "30",
  retirementAge: "58",
  wage: "40000",
  employeeRate: "12",
  hike: "7",
  interest: "8.25",
  openingBalance: "250000",
  capContribution: false,
};

const toNumber = (value) => {
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  }, []);

  const calc = useMemo(() => {
    const errors = [];
    const currentAge = toNumber(form.currentAge);
    const retirementAge = toNumber(form.retirementAge);
    const wage = toNumber(form.wage);
    const employeeRate = toNumber(form.employeeRate);
    const hike = toNumber(form.hike);
    const interest = toNumber(form.interest);
    const openingBalance = toNumber(form.openingBalance);

    if (!Number.isFinite(currentAge) || currentAge < 15 || currentAge > 70)
      errors.push("Enter your current age between 15 and 70.");
    if (!Number.isFinite(retirementAge) || retirementAge < 16 || retirementAge > 75)
      errors.push("Enter a retirement age between 16 and 75.");
    if (Number.isFinite(currentAge) && Number.isFinite(retirementAge) && retirementAge <= currentAge)
      errors.push("Retirement age must be greater than your current age.");
    if (!Number.isFinite(wage) || wage <= 0)
      errors.push("Enter monthly basic + DA as a number greater than zero.");
    if (!Number.isFinite(employeeRate) || employeeRate < 0 || employeeRate > 100)
      errors.push("Employee contribution rate must be between 0 and 100 percent.");
    if (!Number.isFinite(hike) || hike < 0 || hike > 50)
      errors.push("Expected annual hike must be between 0 and 50 percent.");
    if (!Number.isFinite(interest) || interest < 0 || interest > 20)
      errors.push("EPF interest rate must be between 0 and 20 percent.");
    if (!Number.isFinite(openingBalance) || openingBalance < 0)
      errors.push("Enter the existing EPF balance as 0 or more.");

    if (errors.length) return { errors };

    const totalYears = Math.round(retirementAge - currentAge);
    const monthlyRate = interest / 100 / 12;
    const employeeFraction = employeeRate / 100;

    let balance = openingBalance;
    let totalEmployee = 0;
    let totalEmployer = 0;
    let totalEps = 0;
    let totalInterest = 0;
    let currentWage = wage;
    const rows = [];

    for (let year = 0; year < totalYears; year += 1) {
      let accruedInterest = 0;
      let yearEmployee = 0;
      let yearEmployer = 0;
      let yearEps = 0;
      const openingForYear = balance;

      for (let month = 0; month < 12; month += 1) {
        const contributionWage = form.capContribution
          ? Math.min(currentWage, EPS_WAGE_CEILING)
          : currentWage;
        const employeeShare = employeeFraction * contributionWage;
        const employerTotal = EMPLOYER_RATE * contributionWage;
        const eps = EPS_RATE * Math.min(currentWage, EPS_WAGE_CEILING);
        const employerEpf = Math.max(0, employerTotal - eps);

        balance += employeeShare + employerEpf;
        yearEmployee += employeeShare;
        yearEmployer += employerEpf;
        yearEps += eps;
        accruedInterest += balance * monthlyRate;
      }

      balance += accruedInterest;
      totalEmployee += yearEmployee;
      totalEmployer += yearEmployer;
      totalEps += yearEps;
      totalInterest += accruedInterest;

      rows.push({
        year: year + 1,
        age: Math.round(currentAge) + year + 1,
        wage: currentWage,
        opening: openingForYear,
        employee: yearEmployee,
        employer: yearEmployer,
        interest: accruedInterest,
        closing: balance,
      });

      currentWage *= 1 + hike / 100;
    }

    const invested = openingBalance + totalEmployee + totalEmployer;
    const interestShare = balance > 0 ? (totalInterest / balance) * 100 : 0;

    return {
      errors: [],
      totalYears,
      corpus: balance,
      totalEmployee,
      totalEmployer,
      totalEps,
      totalInterest,
      invested,
      interestShare,
      finalWage: currentWage / (1 + hike / 100),
      rows,
      openingBalance,
      interest,
    };
  }, [form]);

  const report = useMemo(() => {
    if (calc.errors?.length) return "";
    return [
      "EPF Maturity Projection",
      "",
      `Years to retirement: ${calc.totalYears}`,
      `Existing EPF balance: ${money(calc.openingBalance)}`,
      `Interest rate assumed: ${pct(calc.interest)} a year`,
      "",
      `Projected corpus at retirement: ${money(calc.corpus)}`,
      `Your contributions: ${money(calc.totalEmployee)}`,
      `Employer EPF contributions: ${money(calc.totalEmployer)}`,
      `Interest earned: ${money(calc.totalInterest)}`,
      `Diverted to EPS pension (not part of the corpus): ${money(calc.totalEps)}`,
      "",
      "Projection only — the EPF rate is declared each year and salary growth is an assumption.",
    ].join("\n");
  }, [calc]);

  const copyReport = async () => {
    if (!report) return;
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const inputClass =
    "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

  const hasErrors = Boolean(calc.errors?.length);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">EPF Maturity Calculator</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Project your Employees&apos; Provident Fund corpus at retirement. The calculator adds
            your 12% and the employer&apos;s share month by month, sends 8.33% of wages up to{" "}
            {money(EPS_WAGE_CEILING)} to the pension scheme, and compounds interest on the monthly
            running balance the way EPFO does.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your inputs</h2>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="epf-age" className="text-sm font-semibold">
                    Current age
                  </label>
                  <input
                    id="epf-age"
                    type="number"
                    inputMode="numeric"
                    min="15"
                    max="70"
                    step="1"
                    value={form.currentAge}
                    onChange={(e) => setField("currentAge", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="epf-retire" className="text-sm font-semibold">
                    Retirement age
                  </label>
                  <input
                    id="epf-retire"
                    type="number"
                    inputMode="numeric"
                    min="16"
                    max="75"
                    step="1"
                    value={form.retirementAge}
                    onChange={(e) => setField("retirementAge", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="epf-wage" className="text-sm font-semibold">
                    Monthly basic + DA (₹)
                  </label>
                  <input
                    id="epf-wage"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1000"
                    value={form.wage}
                    onChange={(e) => setField("wage", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="epf-empRate" className="text-sm font-semibold">
                    Your contribution rate (%)
                  </label>
                  <input
                    id="epf-empRate"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.5"
                    value={form.employeeRate}
                    onChange={(e) => setField("employeeRate", e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    12% is statutory; raise it for Voluntary Provident Fund.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="epf-hike" className="text-sm font-semibold">
                    Expected annual salary hike (%)
                  </label>
                  <input
                    id="epf-hike"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="50"
                    step="0.5"
                    value={form.hike}
                    onChange={(e) => setField("hike", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="epf-interest" className="text-sm font-semibold">
                    EPF interest rate (%)
                  </label>
                  <input
                    id="epf-interest"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="20"
                    step="0.05"
                    value={form.interest}
                    onChange={(e) => setField("interest", e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    EPFO declared 8.25% for FY 2024-25; the rate is reviewed every year.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="epf-opening" className="text-sm font-semibold">
                  Existing EPF balance (₹)
                </label>
                <input
                  id="epf-opening"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1000"
                  value={form.openingBalance}
                  onChange={(e) => setField("openingBalance", e.target.value)}
                  className={inputClass}
                />
              </div>

              <label
                htmlFor="epf-cap"
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 hover:border-[var(--primary)]"
              >
                <input
                  id="epf-cap"
                  type="checkbox"
                  checked={form.capContribution}
                  onChange={(e) => setField("capContribution", e.target.checked)}
                  className="mt-1.5 h-4 w-4 accent-[var(--primary)]"
                />
                <span>
                  My employer restricts PF to the {money(EPS_WAGE_CEILING)} statutory wage ceiling
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                setForm(DEFAULT_STATE);
                setCopied(false);
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
                  EPF corpus at retirement
                </p>
                <p className="mt-2 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.corpus)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  after {calc.totalYears} year{calc.totalYears === 1 ? "" : "s"} — interest is{" "}
                  {pct(calc.interestShare)} of the final corpus
                </p>

                <dl className="mt-5 grid gap-2">
                  {[
                    ["Opening balance", money(calc.openingBalance)],
                    ["Your contributions", money(calc.totalEmployee)],
                    ["Employer EPF contributions", money(calc.totalEmployer)],
                    ["Interest earned", money(calc.totalInterest)],
                    ["Total invested", money(calc.invested)],
                    ["Diverted to EPS pension", money(calc.totalEps)],
                    ["Final monthly basic + DA", money(calc.finalWage)],
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

                <button
                  type="button"
                  onClick={copyReport}
                  aria-label="Copy the EPF maturity projection"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {copied ? "Copied!" : "Copy result"}
                </button>

                <h3 className="mt-6 text-sm font-semibold">Year-by-year growth</h3>
                <div className="mt-2 max-h-80 overflow-auto rounded-md border border-[var(--border)]">
                  <table className="w-full min-w-[340px] border-collapse text-sm">
                    <thead className="sticky top-0 bg-[var(--card)]">
                      <tr className="text-left text-xs uppercase text-[var(--muted-foreground)]">
                        <th className="px-3 py-2 font-semibold">Age</th>
                        <th className="px-3 py-2 text-right font-semibold">Contributions</th>
                        <th className="px-3 py-2 text-right font-semibold">Interest</th>
                        <th className="px-3 py-2 text-right font-semibold">Closing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calc.rows.map((row) => (
                        <tr key={row.year} className="border-t border-[var(--border)]">
                          <td className="px-3 py-2">{row.age}</td>
                          <td className="px-3 py-2 text-right">
                            {money(row.employee + row.employer)}
                          </td>
                          <td className="px-3 py-2 text-right">{money(row.interest)}</td>
                          <td className="px-3 py-2 text-right font-semibold">{money(row.closing)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 grid gap-2 text-xs leading-6 text-[var(--muted-foreground)]">
                  <p>
                    Of the employer&apos;s 12%, 8.33% of wages up to {money(EPS_WAGE_CEILING)} (a
                    maximum of {money(EPS_RATE * EPS_WAGE_CEILING)} a month) goes to the Employees&apos;
                    Pension Scheme and buys a monthly pension instead of adding to this corpus.
                  </p>
                  <p>
                    A projection, not a statement. EPFO declares the interest rate each year, salary
                    growth is your assumption, and withdrawals or job gaps will change the outcome.
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
