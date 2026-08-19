"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Info,
  Landmark,
  PiggyBank,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const WAGE_CEILING = 15000;
const EPS_CAP = 1250;
const EPS_RATE = 0.0833;
const EPF_RATE = 0.12;

const presets = [
  { label: "Fresher, 24, basic 18,000", currentAge: 24, wage: 18000, hike: 8, opening: 0 },
  { label: "Mid-career, 32, basic 45,000", currentAge: 32, wage: 45000, hike: 6, opening: 600000 },
  { label: "Senior, 42, basic 90,000", currentAge: 42, wage: 90000, hike: 4, opening: 2500000 },
];

const vpfOptions = [0, 5, 10, 15, 20];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatMoney = (value) => inr.format(Number.isFinite(value) ? value : 0);
const formatPct = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(
    Number.isFinite(value) ? value : 0
  );

function buildSchedule(input) {
  const { currentAge, retirementAge, monthlyWage, hikePct, openingBalance, ratePct, capWage, vpfPct } =
    input;

  const years = Math.max(0, Math.floor(retirementAge - currentAge));
  const rate = ratePct / 100;
  const rows = [];

  let balance = Math.max(0, openingBalance);
  let wage = Math.max(0, monthlyWage);
  let totalEmployee = 0;
  let totalEmployerEpf = 0;
  let totalEps = 0;
  let totalInterest = 0;
  let finalWage = wage;

  for (let index = 0; index < years; index += 1) {
    const contribWage = capWage ? Math.min(wage, WAGE_CEILING) : wage;
    const epsWage = Math.min(contribWage, WAGE_CEILING);
    const epsMonthly = Math.min(EPS_RATE * epsWage, EPS_CAP);
    const employerEpfMonthly = EPF_RATE * contribWage - epsMonthly;
    const employeeMonthly = EPF_RATE * contribWage + (vpfPct / 100) * wage;

    const opening = balance;
    let running = balance;
    let yearInterest = 0;

    for (let month = 0; month < 12; month += 1) {
      running += employeeMonthly + employerEpfMonthly;
      yearInterest += running * (rate / 12);
    }

    const closing = running + yearInterest;
    const employeeYear = employeeMonthly * 12;
    const employerYear = employerEpfMonthly * 12;
    const epsYear = epsMonthly * 12;

    rows.push({
      index: index + 1,
      age: currentAge + index,
      wage,
      contribWage,
      opening,
      employeeYear,
      employerYear,
      epsYear,
      interest: yearInterest,
      closing,
    });

    totalEmployee += employeeYear;
    totalEmployerEpf += employerYear;
    totalEps += epsYear;
    totalInterest += yearInterest;
    finalWage = wage;
    balance = closing;
    wage *= 1 + hikePct / 100;
  }

  return {
    years,
    rows,
    corpus: balance,
    totalEmployee,
    totalEmployerEpf,
    totalEps,
    totalInterest,
    finalWage,
    openingBalance: Math.max(0, openingBalance),
  };
}

export default function ToolHome() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(58);
  const [monthlyWage, setMonthlyWage] = useState(35000);
  const [hikePct, setHikePct] = useState(5);
  const [openingBalance, setOpeningBalance] = useState(200000);
  const [ratePct, setRatePct] = useState(8.25);
  const [capWage, setCapWage] = useState(false);
  const [vpfPct, setVpfPct] = useState(10);
  const [copied, setCopied] = useState(false);

  const baseInput = useMemo(
    () => ({
      currentAge: Number(currentAge) || 0,
      retirementAge: Number(retirementAge) || 0,
      monthlyWage: Number(monthlyWage) || 0,
      hikePct: Number(hikePct) || 0,
      openingBalance: Number(openingBalance) || 0,
      ratePct: Number(ratePct) || 0,
      capWage,
    }),
    [currentAge, retirementAge, monthlyWage, hikePct, openingBalance, ratePct, capWage]
  );

  const plan = useMemo(() => buildSchedule({ ...baseInput, vpfPct: 0 }), [baseInput]);
  const vpfPlan = useMemo(
    () => buildSchedule({ ...baseInput, vpfPct: Number(vpfPct) || 0 }),
    [baseInput, vpfPct]
  );

  const firstYear = plan.rows[0];
  const totalContributions = plan.totalEmployee + plan.totalEmployerEpf;
  const corpus = plan.corpus;
  const parts = [
    { key: "opening", label: "Current balance", value: plan.openingBalance, color: "var(--muted-foreground)" },
    { key: "employee", label: "Your contribution", value: plan.totalEmployee, color: "var(--primary)" },
    { key: "employer", label: "Employer EPF share", value: plan.totalEmployerEpf, color: "var(--secondary)" },
    { key: "interest", label: "Interest earned", value: plan.totalInterest, color: "var(--anslation-ds-success)" },
  ].filter((part) => part.value > 0);
  const partsTotal = parts.reduce((sum, part) => sum + part.value, 0) || 1;

  const pensionableService = plan.years >= 20 ? plan.years + 2 : plan.years;
  // EPS pension is based on the pensionable salary near/at retirement (capped at the
  // statutory Rs 15,000 ceiling), not the day-one wage the employee started with.
  const pensionableSalary = Math.min(Math.max(0, Number(plan.finalWage) || 0), WAGE_CEILING);
  const epsPension = (pensionableSalary * pensionableService) / 70;

  const vpfDelta = vpfPlan.corpus - plan.corpus;
  const vpfExtraMonthly = ((Number(vpfPct) || 0) / 100) * (Number(monthlyWage) || 0);

  const report = useMemo(() => {
    const lines = [
      "EPF Projection Summary",
      `Age today: ${baseInput.currentAge} | Retirement age: ${baseInput.retirementAge} (${plan.years} years)`,
      `Basic + DA today: ${formatMoney(baseInput.monthlyWage)}/month, growing ${baseInput.hikePct}% a year`,
      `Basic + DA at retirement: ${formatMoney(plan.finalWage)}/month`,
      `Interest rate assumed: ${baseInput.ratePct}% a year`,
      `Wage ceiling: ${capWage ? "Restricted to Rs 15,000 statutory ceiling" : "Contributions on full basic + DA"}`,
      "",
      `EPF corpus at ${baseInput.retirementAge}: ${formatMoney(corpus)}`,
      `  Current balance carried in: ${formatMoney(plan.openingBalance)}`,
      `  Your contributions: ${formatMoney(plan.totalEmployee)}`,
      `  Employer EPF share: ${formatMoney(plan.totalEmployerEpf)}`,
      `  Interest earned: ${formatMoney(plan.totalInterest)}`,
      `  Interest as share of corpus: ${formatPct((plan.totalInterest / (corpus || 1)) * 100)}%`,
      "",
      `Employer money diverted to EPS (pension, not EPF): ${formatMoney(plan.totalEps)}`,
      `Estimated EPS pension: ${formatMoney(epsPension)}/month`,
      `  Formula: pensionable salary ${formatMoney(pensionableSalary)} x service ${pensionableService} / 70`,
      "",
      `VPF scenario at ${vpfPct}% extra: corpus ${formatMoney(vpfPlan.corpus)} (+${formatMoney(vpfDelta)})`,
      "",
      "Year-wise projection",
      "Age | Monthly basic+DA | Employee | Employer EPF | Interest | Closing balance",
      ...plan.rows.map((row) =>
        [
          row.age,
          formatMoney(row.wage),
          formatMoney(row.employeeYear),
          formatMoney(row.employerYear),
          formatMoney(row.interest),
          formatMoney(row.closing),
        ].join(" | ")
      ),
      "",
      `Generated: ${new Date().toLocaleString()}`,
    ];
    return lines.join("\n");
  }, [
    baseInput,
    plan,
    corpus,
    capWage,
    epsPension,
    pensionableSalary,
    pensionableService,
    vpfPct,
    vpfPlan,
    vpfDelta,
  ]);

  const applyPreset = (preset) => {
    setCurrentAge(preset.currentAge);
    setMonthlyWage(preset.wage);
    setHikePct(preset.hike);
    setOpeningBalance(preset.opening);
  };

  const resetAll = () => {
    setCurrentAge(30);
    setRetirementAge(58);
    setMonthlyWage(35000);
    setHikePct(5);
    setOpeningBalance(200000);
    setRatePct(8.25);
    setCapWage(false);
    setVpfPct(10);
  };

  const copySummary = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const inputClass =
    "mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Landmark className="h-4 w-4" />
            Retirement planning
          </div>
          <h1 className="text-4xl font-semibold leading-tight">EPF Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Your employer&apos;s 12% does not all land in your PF. A slice is siphoned into the pension scheme
            first, capped at the ₹15,000 wage ceiling. This projects your real EPF corpus month by month with
            EPFO&apos;s own interest convention, splits employer money correctly, and shows the pension you build
            alongside it.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">Current age</span>
                <input
                  type="number"
                  min="15"
                  max="70"
                  value={currentAge}
                  onChange={(event) => setCurrentAge(Number(event.target.value))}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Retirement age</span>
                <input
                  type="number"
                  min="40"
                  max="70"
                  value={retirementAge}
                  onChange={(event) => setRetirementAge(Number(event.target.value))}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold">Current basic + DA (monthly)</span>
              <input
                type="number"
                min="0"
                step="500"
                value={monthlyWage}
                onChange={(event) => setMonthlyWage(Number(event.target.value))}
                className={inputClass}
              />
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">Annual increase %</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={hikePct}
                  onChange={(event) => setHikePct(Number(event.target.value))}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Interest rate %</span>
                <input
                  type="number"
                  min="0"
                  max="15"
                  step="0.05"
                  value={ratePct}
                  onChange={(event) => setRatePct(Number(event.target.value))}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold">Current EPF balance</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={openingBalance}
                onChange={(event) => setOpeningBalance(Number(event.target.value))}
                className={inputClass}
              />
            </label>

            <button
              type="button"
              onClick={() => setCapWage((value) => !value)}
              aria-pressed={capWage}
              className={`mt-4 flex w-full items-start gap-3 rounded-md border px-3 py-3 text-left transition ${
                capWage
                  ? "border-[var(--primary)] bg-[var(--muted)]"
                  : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
              }`}
            >
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border"
                style={{
                  borderColor: capWage ? "var(--primary)" : "var(--border)",
                  background: capWage ? "var(--primary)" : "transparent",
                }}
              >
                {capWage && (
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{ background: "var(--primary-foreground)" }}
                  />
                )}
              </span>
              <span>
                <span className="block text-sm font-semibold">Restrict to ₹15,000 wage ceiling</span>
                <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                  Many employers cap PF at the statutory wage. Turn this on if your payslip shows PF frozen near
                  ₹1,800 a month.
                </span>
              </span>
            </button>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quick presets</span>
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {firstYear && (
              <div className="mt-5 rounded-md bg-[var(--muted)] p-4">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  This month&apos;s split
                </p>
                <dl className="mt-2 grid gap-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--muted-foreground)]">You → EPF (12%)</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatMoney(firstYear.employeeYear / 12)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--muted-foreground)]">Employer → EPF</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatMoney(firstYear.employerYear / 12)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--muted-foreground)]">Employer → EPS (8.33%)</dt>
                    <dd className="font-semibold tabular-nums">{formatMoney(firstYear.epsYear / 12)}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  EPS is capped at 8.33% of ₹15,000 = ₹1,250 a month. Everything your employer puts in above that
                  cap flows back into EPF.
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  EPF corpus at age {baseInput.retirementAge}
                </p>
                <button
                  type="button"
                  onClick={copySummary}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy summary"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4" aria-live="polite">
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p className="text-4xl font-semibold text-[var(--primary)]">{formatMoney(corpus)}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {plan.years > 0
                      ? `After ${plan.years} years, tax-free on withdrawal at retirement`
                      : "Set a retirement age above your current age to project growth"}
                  </p>
                </div>
                {plan.years > 0 && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]">
                    <TrendingUp className="h-4 w-4 text-[var(--anslation-ds-success)]" />
                    {formatPct((plan.totalInterest / (corpus || 1)) * 100)}% of it is interest
                  </div>
                )}
              </div>

              <div className="tool-compact-grid mt-6">
                {[
                  [
                    "Your contributions",
                    formatMoney(plan.totalEmployee),
                    "12% of basic + DA, every month",
                  ],
                  [
                    "Employer EPF share",
                    formatMoney(plan.totalEmployerEpf),
                    "12% minus the EPS slice",
                  ],
                  [
                    "Interest earned",
                    formatMoney(plan.totalInterest),
                    `Compounded yearly at ${baseInput.ratePct}%`,
                  ],
                ].map(([label, value, detail]) => (
                  <div
                    key={label}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 text-lg font-semibold">{value}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  What builds the corpus
                </p>
                <div className="mt-2 flex h-4 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  {parts.map((part) => (
                    <div
                      key={part.key}
                      style={{
                        width: `${(part.value / partsTotal) * 100}%`,
                        background: part.color,
                      }}
                      title={`${part.label}: ${formatMoney(part.value)}`}
                    />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  {parts.map((part) => (
                    <span key={part.key} className="inline-flex items-center gap-2 text-xs">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: part.color }}
                      />
                      <span className="text-[var(--muted-foreground)]">{part.label}</span>
                      <span className="font-semibold">
                        {formatPct((part.value / partsTotal) * 100)}%
                      </span>
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  You and your employer put in {formatMoney(totalContributions)}. Interest adds
                  {" "}{formatMoney(plan.totalInterest)} on top — the longer you leave it untouched, the more of
                  your corpus is money you never earned at work.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-lg font-semibold">Year-wise projection</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                EPFO accrues interest on the monthly running balance and credits the whole year&apos;s interest
                once, at the close of the financial year. Interest therefore does not compound within a year — it
                compounds from one year to the next. That is exactly how the table below is built.
              </p>
              <div className="mt-4 max-h-[420px] overflow-auto">
                <table className="w-full min-w-[680px] border-collapse text-sm">
                  <thead className="sticky top-0 bg-[var(--card)]">
                    <tr className="border-b border-[var(--border)] text-left">
                      <th className="py-2 pr-3 font-semibold">Age</th>
                      <th className="py-2 pr-3 font-semibold">Monthly basic + DA</th>
                      <th className="py-2 pr-3 text-right font-semibold">Your share</th>
                      <th className="py-2 pr-3 text-right font-semibold">Employer EPF</th>
                      <th className="py-2 pr-3 text-right font-semibold">EPS</th>
                      <th className="py-2 pr-3 text-right font-semibold">Interest</th>
                      <th className="py-2 text-right font-semibold">Closing balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.rows.map((row) => (
                      <tr key={row.index} className="border-b border-[var(--border)]">
                        <td className="py-2.5 pr-3 font-semibold">{row.age}</td>
                        <td className="py-2.5 pr-3 tabular-nums text-[var(--muted-foreground)]">
                          {formatMoney(row.wage)}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">
                          {formatMoney(row.employeeYear)}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">
                          {formatMoney(row.employerYear)}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                          {formatMoney(row.epsYear)}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-[var(--anslation-ds-success)]">
                          {formatMoney(row.interest)}
                        </td>
                        <td className="py-2.5 text-right font-semibold tabular-nums">
                          {formatMoney(row.closing)}
                        </td>
                      </tr>
                    ))}
                    {plan.rows.length === 0 && (
                      <tr>
                        <td className="py-4 text-[var(--muted-foreground)]" colSpan={7}>
                          Retirement age must be higher than your current age.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                The EPS column is employer money that funds your pension instead of your PF balance — it never
                appears in the closing balance.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">The pension you build alongside</h2>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="rounded-lg bg-[var(--muted)] p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">Estimated EPS pension</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                    {formatMoney(epsPension)}
                    <span className="text-sm font-normal text-[var(--muted-foreground)]">/month</span>
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border)] p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">Employer money routed to EPS</p>
                  <p className="mt-1 text-2xl font-semibold">{formatMoney(plan.totalEps)}</p>
                </div>
              </div>
              <p className="mt-4 rounded-md bg-[var(--muted)] p-3 font-mono text-sm">
                Monthly pension = pensionable salary × pensionable service ÷ 70 ={" "}
                {formatMoney(pensionableSalary)} × {pensionableService} ÷ 70 = {formatMoney(epsPension)}
              </p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                <li>
                  Pensionable salary is the average of your last 60 months, but it is capped at ₹15,000 unless you
                  hold a valid higher-pension option — so most members top out at ₹7,500 a month (₹15,000 × 35 ÷
                  70).
                </li>
                <li>
                  Service of 20 years or more earns a 2-year weightage bonus, which is already included above.
                  This estimate counts only service from today to retirement — add any EPS years you have already
                  completed elsewhere.
                </li>
                <li>
                  You need at least 10 years of EPS service to draw a pension at all. Below that you can withdraw
                  the EPS amount instead.
                </li>
                <li>
                  If you first joined EPF on or after 1 September 2014 earning above ₹15,000, you are not an EPS
                  member — your employer&apos;s full 12% goes to EPF and there is no pension.
                </li>
              </ul>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Tax status: EEE</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Exempt going in, exempt while it grows, exempt coming out — one of the last genuinely
                  triple-exempt products left in India.
                </p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  <li>
                    <strong className="text-[var(--foreground)]">Contribution:</strong> your 12% qualifies under
                    section 80C up to ₹1.5 lakh — in the old regime only.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Growth:</strong> interest is tax-free, but
                    interest on your own contributions above ₹2.5 lakh in a year is taxable (₹5 lakh where the
                    employer does not contribute).
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Withdrawal:</strong> fully tax-free after five
                    years of continuous service.
                  </li>
                  <li>
                    Employer contributions to EPF, NPS and superannuation together above ₹7.5 lakh a year are
                    taxable in your hands.
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Withdrawal rules</h2>
                </div>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  <li>
                    Full withdrawal at retirement, or after two months of continuous unemployment. Up to 90% can
                    be taken one year before retirement.
                  </li>
                  <li>
                    Partial withdrawals are allowed for a house, medical treatment, marriage or education — each
                    with its own service condition and limit.
                  </li>
                  <li>
                    Withdraw before five years of continuous service and TDS applies on amounts of ₹50,000 or
                    more: 10% with PAN, higher without.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Transfer, never withdraw, on a job change.</strong>{" "}
                    Transferring keeps the five-year clock running and keeps compounding intact.
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">Consider VPF before any other debt option</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Voluntary Provident Fund lets you push more than the statutory 12% into the same account, at the
                same {baseInput.ratePct}% rate, with the same EEE treatment. No debt fund or bank FD is paying
                this, tax-free, today.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {vpfOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setVpfPct(option)}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                      Number(vpfPct) === option
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    +{option}% VPF
                  </button>
                ))}
              </div>
              <div className="tool-compact-grid mt-4">
                {[
                  [
                    "Extra each month",
                    formatMoney(vpfExtraMonthly),
                    `${vpfPct}% of your current basic + DA`,
                  ],
                  [
                    "Corpus with VPF",
                    formatMoney(vpfPlan.corpus),
                    `vs ${formatMoney(plan.corpus)} without`,
                  ],
                  [
                    "You end up with",
                    `+${formatMoney(vpfDelta)}`,
                    vpfExtraMonthly > 0
                      ? `${formatPct((vpfDelta / (plan.corpus || 1)) * 100)}% more at retirement`
                      : "Pick a VPF rate to compare",
                  ],
                ].map(([label, value, detail]) => (
                  <div
                    key={label}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 text-lg font-semibold">{value}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{detail}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
                Two catches worth knowing: your employer does not match VPF, and once your own contributions cross
                ₹2.5 lakh in a year the interest on the excess becomes taxable. VPF is also locked in like EPF, so
                keep your emergency fund somewhere you can actually reach it.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
