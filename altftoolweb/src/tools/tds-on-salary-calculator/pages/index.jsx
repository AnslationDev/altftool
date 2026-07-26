"use client";

import { useMemo, useState } from "react";
import { Banknote, Copy, RotateCcw } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Tax engine — Finance Act 2025 rates (FY 2025-26 / AY 2026-27)        */
/* ------------------------------------------------------------------ */

const NEW_REGIME_SLABS = [
  [400000, 0],
  [800000, 0.05],
  [1200000, 0.1],
  [1600000, 0.15],
  [2000000, 0.2],
  [2400000, 0.25],
  [Infinity, 0.3],
];

const OLD_REGIME_SLABS = {
  below60: [
    [250000, 0],
    [500000, 0.05],
    [1000000, 0.2],
    [Infinity, 0.3],
  ],
  senior: [
    [300000, 0],
    [500000, 0.05],
    [1000000, 0.2],
    [Infinity, 0.3],
  ],
  superSenior: [
    [500000, 0],
    [1000000, 0.2],
    [Infinity, 0.3],
  ],
};

const SURCHARGE_BANDS_NEW = [
  [5000000, 0.1],
  [10000000, 0.15],
  [20000000, 0.25],
];

const SURCHARGE_BANDS_OLD = [
  [5000000, 0.1],
  [10000000, 0.15],
  [20000000, 0.25],
  [50000000, 0.37],
];

const round2 = (value) => Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;

function slabTax(income, slabs) {
  let tax = 0;
  let last = 0;
  for (const [ceiling, rate] of slabs) {
    if (income <= last) break;
    tax += (Math.min(income, ceiling) - last) * rate;
    last = ceiling;
  }
  return tax;
}

function computeIncomeTax(taxableIncome, regime, ageBand) {
  const income = Math.max(0, taxableIncome);
  const slabs =
    regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_SLABS[ageBand] || OLD_REGIME_SLABS.below60;
  const bands = regime === "new" ? SURCHARGE_BANDS_NEW : SURCHARGE_BANDS_OLD;

  const baseTax = slabTax(income, slabs);

  let rebate = 0;
  if (regime === "new") {
    if (income <= 1200000) {
      rebate = Math.min(baseTax, 60000);
    } else {
      const excess = income - 1200000;
      if (baseTax > excess) rebate = baseTax - excess;
    }
  } else if (income <= 500000) {
    rebate = Math.min(baseTax, 12500);
  }

  const afterRebate = Math.max(0, baseTax - rebate);

  let surcharge = 0;
  let bandIndex = -1;
  for (let i = 0; i < bands.length; i += 1) {
    if (income > bands[i][0]) bandIndex = i;
  }
  if (bandIndex >= 0) {
    const [threshold, rate] = bands[bandIndex];
    const prevRate = bandIndex === 0 ? 0 : bands[bandIndex - 1][1];
    surcharge = afterRebate * rate;
    const cap = slabTax(threshold, slabs) * (1 + prevRate) + (income - threshold);
    if (afterRebate + surcharge > cap) surcharge = Math.max(0, cap - afterRebate);
  }

  const cess = (afterRebate + surcharge) * 0.04;
  return {
    baseTax: round2(baseTax),
    rebate: round2(rebate),
    surcharge: round2(surcharge),
    cess: round2(cess),
    total: round2(afterRebate + surcharge + cess),
  };
}

/* ------------------------------------------------------------------ */

const STD_DEDUCTION = { new: 75000, old: 50000 };
const CAP_80C = 150000;
const CAP_80CCD1B = 50000;
const CAP_HOME_LOAN = 200000;
const CAP_PROF_TAX = 2500;

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => inr.format(Number.isFinite(value) ? Math.round(value) : 0);

const DEFAULTS = {
  grossSalary: "1500000",
  regime: "new",
  ageBand: "below60",
  hraExempt: "180000",
  otherExempt: "0",
  professionalTax: "2500",
  employerNps: "0",
  s80c: "150000",
  s80d: "25000",
  s80ccd1b: "50000",
  homeLoanInterest: "0",
  otherIncome: "0",
  monthsRemaining: "12",
  tdsAlready: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num = (value) => {
  const parsed = Number(String(value).trim() === "" ? 0 : value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export default function ToolHome() {
  const [grossSalary, setGrossSalary] = useState(DEFAULTS.grossSalary);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [ageBand, setAgeBand] = useState(DEFAULTS.ageBand);
  const [hraExempt, setHraExempt] = useState(DEFAULTS.hraExempt);
  const [otherExempt, setOtherExempt] = useState(DEFAULTS.otherExempt);
  const [professionalTax, setProfessionalTax] = useState(DEFAULTS.professionalTax);
  const [employerNps, setEmployerNps] = useState(DEFAULTS.employerNps);
  const [s80c, setS80c] = useState(DEFAULTS.s80c);
  const [s80d, setS80d] = useState(DEFAULTS.s80d);
  const [s80ccd1b, setS80ccd1b] = useState(DEFAULTS.s80ccd1b);
  const [homeLoanInterest, setHomeLoanInterest] = useState(DEFAULTS.homeLoanInterest);
  const [otherIncome, setOtherIncome] = useState(DEFAULTS.otherIncome);
  const [monthsRemaining, setMonthsRemaining] = useState(DEFAULTS.monthsRemaining);
  const [tdsAlready, setTdsAlready] = useState(DEFAULTS.tdsAlready);
  const [copied, setCopied] = useState(false);

  const isOld = regime === "old";

  const validation = useMemo(() => {
    const fields = [
      ["annual gross salary", grossSalary],
      ["HRA exemption", hraExempt],
      ["other exempt allowances", otherExempt],
      ["professional tax", professionalTax],
      ["employer NPS contribution", employerNps],
      ["Section 80C", s80c],
      ["Section 80D", s80d],
      ["Section 80CCD(1B)", s80ccd1b],
      ["home loan interest", homeLoanInterest],
      ["other income", otherIncome],
      ["TDS already deducted", tdsAlready],
    ];
    for (const [label, value] of fields) {
      const parsed = num(value);
      if (!Number.isFinite(parsed)) return `Enter a valid number for ${label}.`;
      if (parsed < 0) return `${label.charAt(0).toUpperCase()}${label.slice(1)} cannot be negative.`;
      if (parsed > 1e11) return `${label.charAt(0).toUpperCase()}${label.slice(1)} is unrealistically large.`;
    }
    if (num(grossSalary) <= 0) return "Enter your annual gross salary to calculate TDS.";
    if (isOld && num(hraExempt) + num(otherExempt) > num(grossSalary)) {
      return "Exempt allowances cannot exceed your gross salary.";
    }
    const months = num(monthsRemaining);
    if (!Number.isInteger(months) || months < 1 || months > 12) {
      return "Months remaining in the financial year must be a whole number between 1 and 12.";
    }
    return "";
  }, [
    grossSalary,
    hraExempt,
    otherExempt,
    professionalTax,
    employerNps,
    s80c,
    s80d,
    s80ccd1b,
    homeLoanInterest,
    otherIncome,
    tdsAlready,
    monthsRemaining,
    isOld,
  ]);

  const result = useMemo(() => {
    if (validation) return null;
    const gross = num(grossSalary);
    const exemptions = isOld ? Math.min(num(hraExempt) + num(otherExempt), gross) : 0;
    const afterExempt = Math.max(0, gross - exemptions);

    const standardDeduction = Math.min(STD_DEDUCTION[regime], afterExempt);
    const profTax = isOld ? Math.min(num(professionalTax), CAP_PROF_TAX) : 0;
    const salaryIncome = Math.max(0, afterExempt - standardDeduction - profTax);

    const chapterVia = isOld
      ? Math.min(num(s80c), CAP_80C) +
        num(s80d) +
        Math.min(num(s80ccd1b), CAP_80CCD1B) +
        num(employerNps)
      : num(employerNps);
    const houseProperty = isOld ? Math.min(num(homeLoanInterest), CAP_HOME_LOAN) : 0;

    const grossTotal = salaryIncome + num(otherIncome);
    const totalDeductions = Math.min(chapterVia + houseProperty, grossTotal);
    const taxableIncome = Math.max(0, grossTotal - totalDeductions);

    const tax = computeIncomeTax(taxableIncome, regime, ageBand);
    const months = num(monthsRemaining);
    const balance = Math.max(0, tax.total - num(tdsAlready));
    const monthly = months > 0 ? balance / months : 0;

    return {
      gross,
      exemptions: round2(exemptions),
      standardDeduction: round2(standardDeduction),
      profTax: round2(profTax),
      salaryIncome: round2(salaryIncome),
      chapterVia: round2(Math.min(chapterVia, grossTotal)),
      houseProperty: round2(houseProperty),
      grossTotal: round2(grossTotal),
      taxableIncome: round2(taxableIncome),
      tax,
      balance: round2(balance),
      monthly: round2(monthly),
      months,
      effectiveRate: gross > 0 ? (tax.total / gross) * 100 : 0,
      inHandMonthly: round2((gross - tax.total) / 12),
    };
  }, [
    validation,
    grossSalary,
    regime,
    ageBand,
    hraExempt,
    otherExempt,
    professionalTax,
    employerNps,
    s80c,
    s80d,
    s80ccd1b,
    homeLoanInterest,
    otherIncome,
    monthsRemaining,
    tdsAlready,
    isOld,
  ]);

  const report = useMemo(() => {
    if (!result) return "";
    return [
      `TDS on Salary — ${regime === "new" ? "new regime" : "old regime"}`,
      `Annual gross salary: ${money(result.gross)}`,
      `Standard deduction: ${money(result.standardDeduction)}`,
      isOld ? `Exempt allowances (HRA etc.): ${money(result.exemptions)}` : null,
      `Taxable income: ${money(result.taxableIncome)}`,
      `Annual tax incl. 4% cess: ${money(result.tax.total)}`,
      `TDS already deducted: ${money(num(tdsAlready))}`,
      `Balance to deduct over ${result.months} month(s): ${money(result.balance)}`,
      `Monthly TDS: ${money(result.monthly)}`,
      `Effective tax rate on gross salary: ${result.effectiveRate.toFixed(2)}%`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [result, regime, isOld, tdsAlready]);

  const copyResult = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setGrossSalary(DEFAULTS.grossSalary);
    setRegime(DEFAULTS.regime);
    setAgeBand(DEFAULTS.ageBand);
    setHraExempt(DEFAULTS.hraExempt);
    setOtherExempt(DEFAULTS.otherExempt);
    setProfessionalTax(DEFAULTS.professionalTax);
    setEmployerNps(DEFAULTS.employerNps);
    setS80c(DEFAULTS.s80c);
    setS80d(DEFAULTS.s80d);
    setS80ccd1b(DEFAULTS.s80ccd1b);
    setHomeLoanInterest(DEFAULTS.homeLoanInterest);
    setOtherIncome(DEFAULTS.otherIncome);
    setMonthsRemaining(DEFAULTS.monthsRemaining);
    setTdsAlready(DEFAULTS.tdsAlready);
    setCopied(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Banknote className="h-4 w-4" aria-hidden="true" />
            Tax
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">TDS on Salary Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Estimate the tax your employer should withhold each month under Section 192 — from your
            annual salary, exemptions, deductions and the regime you have declared.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid gap-4">
              <div>
                <span id="tds-regime-label" className="block text-sm font-semibold">
                  Tax regime declared to employer
                </span>
                <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="tds-regime-label">
                  {[
                    { id: "new", label: "New regime" },
                    { id: "old", label: "Old regime" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={regime === option.id}
                      onClick={() => setRegime(option.id)}
                      className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        regime === option.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="tds-gross" className="block text-sm font-semibold">
                    Annual gross salary (₹)
                  </label>
                  <input
                    id="tds-gross"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={grossSalary}
                    onChange={(event) => setGrossSalary(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="tds-age" className="block text-sm font-semibold">
                    Age band
                  </label>
                  <select
                    id="tds-age"
                    value={ageBand}
                    onChange={(event) => setAgeBand(event.target.value)}
                    disabled={!isOld}
                    className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                  >
                    <option value="below60">Below 60</option>
                    <option value="senior">60 to 79</option>
                    <option value="superSenior">80 and above</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="tds-hra" className="block text-sm font-semibold">
                    HRA exemption (₹)
                  </label>
                  <input
                    id="tds-hra"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={hraExempt}
                    onChange={(event) => setHraExempt(event.target.value)}
                    disabled={!isOld}
                    className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                  />
                </div>
                <div>
                  <label htmlFor="tds-other-exempt" className="block text-sm font-semibold">
                    Other exempt allowances (₹)
                  </label>
                  <input
                    id="tds-other-exempt"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={otherExempt}
                    onChange={(event) => setOtherExempt(event.target.value)}
                    disabled={!isOld}
                    className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                  />
                </div>
                <div>
                  <label htmlFor="tds-proftax" className="block text-sm font-semibold">
                    Professional tax paid (₹)
                  </label>
                  <input
                    id="tds-proftax"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max={CAP_PROF_TAX}
                    value={professionalTax}
                    onChange={(event) => setProfessionalTax(event.target.value)}
                    disabled={!isOld}
                    className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                  />
                </div>
                <div>
                  <label htmlFor="tds-80c" className="block text-sm font-semibold">
                    Section 80C (max ₹1,50,000)
                  </label>
                  <input
                    id="tds-80c"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={s80c}
                    onChange={(event) => setS80c(event.target.value)}
                    disabled={!isOld}
                    className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                  />
                </div>
                <div>
                  <label htmlFor="tds-80d" className="block text-sm font-semibold">
                    Section 80D health insurance (₹)
                  </label>
                  <input
                    id="tds-80d"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={s80d}
                    onChange={(event) => setS80d(event.target.value)}
                    disabled={!isOld}
                    className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                  />
                </div>
                <div>
                  <label htmlFor="tds-80ccd" className="block text-sm font-semibold">
                    Section 80CCD(1B) NPS (max ₹50,000)
                  </label>
                  <input
                    id="tds-80ccd"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={s80ccd1b}
                    onChange={(event) => setS80ccd1b(event.target.value)}
                    disabled={!isOld}
                    className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                  />
                </div>
                <div>
                  <label htmlFor="tds-homeloan" className="block text-sm font-semibold">
                    Home loan interest u/s 24(b) (₹)
                  </label>
                  <input
                    id="tds-homeloan"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={homeLoanInterest}
                    onChange={(event) => setHomeLoanInterest(event.target.value)}
                    disabled={!isOld}
                    className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                  />
                </div>
                <div>
                  <label htmlFor="tds-nps-employer" className="block text-sm font-semibold">
                    Employer NPS u/s 80CCD(2) (₹)
                  </label>
                  <input
                    id="tds-nps-employer"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={employerNps}
                    onChange={(event) => setEmployerNps(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="tds-other-income" className="block text-sm font-semibold">
                    Other income reported (₹)
                  </label>
                  <input
                    id="tds-other-income"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={otherIncome}
                    onChange={(event) => setOtherIncome(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="tds-already" className="block text-sm font-semibold">
                    TDS already deducted (₹)
                  </label>
                  <input
                    id="tds-already"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={tdsAlready}
                    onChange={(event) => setTdsAlready(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="tds-months" className="block text-sm font-semibold">
                    Months left in the year
                  </label>
                  <input
                    id="tds-months"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="12"
                    step="1"
                    value={monthsRemaining}
                    onChange={(event) => setMonthsRemaining(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  disabled={!result}
                  aria-label="Copy TDS computation to clipboard"
                  className={`${PRIMARY_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              {validation ? (
                <p
                  role="alert"
                  className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                >
                  {validation}
                </p>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Monthly TDS to be deducted
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                    {money(result.monthly)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {money(result.balance)} spread over {result.months} remaining month
                    {result.months === 1 ? "" : "s"}
                  </p>

                  <dl className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Annual gross salary</dt>
                      <dd className="text-sm font-semibold">{money(result.gross)}</dd>
                    </div>
                    {isOld && result.exemptions > 0 && (
                      <div className="flex items-center justify-between gap-4 py-2.5">
                        <dt className="text-sm text-[var(--muted-foreground)]">Exempt allowances</dt>
                        <dd className="text-sm font-semibold">- {money(result.exemptions)}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">
                        Standard deduction ({regime === "new" ? "₹75,000" : "₹50,000"})
                      </dt>
                      <dd className="text-sm font-semibold">- {money(result.standardDeduction)}</dd>
                    </div>
                    {isOld && result.profTax > 0 && (
                      <div className="flex items-center justify-between gap-4 py-2.5">
                        <dt className="text-sm text-[var(--muted-foreground)]">Professional tax</dt>
                        <dd className="text-sm font-semibold">- {money(result.profTax)}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Income from salary</dt>
                      <dd className="text-sm font-semibold">{money(result.salaryIncome)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Deductions claimed</dt>
                      <dd className="text-sm font-semibold">
                        - {money(result.chapterVia + result.houseProperty)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Taxable income</dt>
                      <dd className="text-sm font-semibold">{money(result.taxableIncome)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Tax on slab rates</dt>
                      <dd className="text-sm font-semibold">{money(result.tax.baseTax)}</dd>
                    </div>
                    {result.tax.rebate > 0 && (
                      <div className="flex items-center justify-between gap-4 py-2.5">
                        <dt className="text-sm text-[var(--muted-foreground)]">Section 87A rebate</dt>
                        <dd className="text-sm font-semibold text-[var(--success)]">
                          - {money(result.tax.rebate)}
                        </dd>
                      </div>
                    )}
                    {result.tax.surcharge > 0 && (
                      <div className="flex items-center justify-between gap-4 py-2.5">
                        <dt className="text-sm text-[var(--muted-foreground)]">Surcharge</dt>
                        <dd className="text-sm font-semibold">{money(result.tax.surcharge)}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Health &amp; education cess (4%)</dt>
                      <dd className="text-sm font-semibold">{money(result.tax.cess)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm font-semibold">Annual tax (total TDS for the year)</dt>
                      <dd className="text-sm font-semibold">{money(result.tax.total)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Effective rate on gross salary</dt>
                      <dd className="text-sm font-semibold">{result.effectiveRate.toFixed(2)}%</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">
                        Average monthly pay after tax
                      </dt>
                      <dd className="text-sm font-semibold">{money(result.inHandMonthly)}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs text-[var(--muted-foreground)]">
                    Slab rates are those notified by the Finance Act 2025 for FY 2025-26. Employer NPS
                    under 80CCD(2) is allowed in both regimes; all other Chapter VI-A deductions and
                    exemptions apply only in the old regime. Provident fund and gratuity deducted from
                    CTC are not modelled — informational only.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
