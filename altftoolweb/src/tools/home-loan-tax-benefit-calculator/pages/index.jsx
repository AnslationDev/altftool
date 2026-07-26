"use client";

import { useMemo, useState } from "react";
import { Check, Copy, House, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const CAP_80C = 150000;
const CAP_24B_SELF = 200000;
const CAP_80EEA = 150000;
const CAP_LOSS_SETOFF = 200000;
const STANDARD_DEDUCTION_LETOUT = 0.3;
const CESS = 0.04;

const SLABS = [5, 10, 15, 20, 30];

const DEFAULTS = {
  loan: 5000000,
  rate: 8.5,
  years: 20,
  year: 1,
  other80c: 50000,
  slab: 30,
  property: "self",
  rent: 240000,
  eea: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/** Reducing-balance EMI; handles the 0% case. */
function computeEmi(principal, annualRate, months) {
  if (!(principal > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return principal / months;
  const growth = Math.pow(1 + r, months);
  return (principal * r * growth) / (growth - 1);
}

/** Principal and interest paid inside each loan year of the amortisation. */
function yearlySplit(principal, annualRate, months, emi) {
  const r = annualRate / 12 / 100;
  const rows = [];
  let balance = principal;
  let yearInterest = 0;
  let yearPrincipal = 0;

  for (let month = 1; month <= months; month += 1) {
    const interest = balance * r;
    let paid = emi - interest;
    if (paid > balance || month === months) paid = balance;
    balance = Math.max(0, balance - paid);
    yearInterest += interest;
    yearPrincipal += paid;

    if (month % 12 === 0 || month === months) {
      rows.push({
        year: Math.ceil(month / 12),
        principal: yearPrincipal,
        interest: yearInterest,
        balance,
      });
      yearInterest = 0;
      yearPrincipal = 0;
    }
  }
  return rows;
}

/** Deductions for one financial year under the old regime. */
function deductionsFor({ principalPaid, interestPaid, other80c, property, rent, eea }) {
  const d80c = Math.max(0, Math.min(principalPaid, CAP_80C - Math.max(0, other80c)));

  let d24 = 0;
  let d80eea = 0;
  let carryForward = 0;

  if (property === "self") {
    d24 = Math.min(interestPaid, CAP_24B_SELF);
    if (eea) {
      const spare = Math.max(0, interestPaid - CAP_24B_SELF);
      d80eea = Math.min(spare, CAP_80EEA);
    }
  } else {
    const netAnnualValue = rent * (1 - STANDARD_DEDUCTION_LETOUT);
    const houseIncome = netAnnualValue - interestPaid;
    if (houseIncome >= 0) {
      // Interest is fully absorbed by rent; only the taxable rent is left.
      d24 = interestPaid;
    } else {
      const loss = -houseIncome;
      const allowed = Math.min(loss, CAP_LOSS_SETOFF);
      carryForward = loss - allowed;
      d24 = interestPaid;
    }
  }

  return { d80c, d24, d80eea, carryForward };
}

export default function ToolHome() {
  const [loan, setLoan] = useState(String(DEFAULTS.loan));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [year, setYear] = useState(String(DEFAULTS.year));
  const [other80c, setOther80c] = useState(String(DEFAULTS.other80c));
  const [slab, setSlab] = useState(String(DEFAULTS.slab));
  const [property, setProperty] = useState(DEFAULTS.property);
  const [rent, setRent] = useState(String(DEFAULTS.rent));
  const [eea, setEea] = useState(DEFAULTS.eea);
  const [showTable, setShowTable] = useState(true);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const p = toNumber(loan);
    const r = toNumber(rate);
    const y = toNumber(years);
    const yr = toNumber(year);
    const other = toNumber(other80c);
    const s = toNumber(slab);
    const rentValue = property === "letout" ? toNumber(rent) : 0;

    if ([p, r, y, yr, other, s, rentValue].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (p <= 0) return { error: "Loan amount must be greater than zero." };
    if (r < 0 || r > 30) return { error: "Interest rate should be between 0% and 30% per year." };
    if (y < 1 || y > 30) return { error: "Home loan tenure is usually between 1 and 30 years." };
    if (other < 0 || rentValue < 0) return { error: "Amounts cannot be negative." };
    if (other > CAP_80C) return { error: "Other 80C investments cannot exceed ₹1,50,000." };

    const months = Math.round(y * 12);
    const emi = computeEmi(p, r, months);
    const rows = yearlySplit(p, r, months, emi);
    const totalYears = rows.length;
    const selected = Math.min(Math.max(1, Math.round(yr)), totalYears);
    const row = rows[selected - 1];

    const marginal = s / 100;
    const withCess = marginal * (1 + CESS);

    const detail = deductionsFor({
      principalPaid: row.principal,
      interestPaid: row.interest,
      other80c: other,
      property,
      rent: rentValue,
      eea,
    });

    const totalDeduction = detail.d80c + detail.d24 + detail.d80eea;
    const taxSaved = totalDeduction * withCess;
    const netInterest = Math.max(0, row.interest - (detail.d24 + detail.d80eea) * withCess);

    const lifetime = rows.map((item) => {
      const d = deductionsFor({
        principalPaid: item.principal,
        interestPaid: item.interest,
        other80c: other,
        property,
        rent: rentValue,
        eea,
      });
      const total = d.d80c + d.d24 + d.d80eea;
      return {
        year: item.year,
        principal: item.principal,
        interest: item.interest,
        d80c: d.d80c,
        d24: d.d24 + d.d80eea,
        saved: total * withCess,
      };
    });

    const lifetimeSaved = lifetime.reduce((sum, item) => sum + item.saved, 0);
    const lifetimeInterest = rows.reduce((sum, item) => sum + item.interest, 0);

    // New regime (Sec 115BAC): no 80C, and no 24(b) for a self-occupied house.
    const newRegimeDeduction =
      property === "letout" ? Math.min(detail.d24, rentValue * (1 - STANDARD_DEDUCTION_LETOUT)) : 0;
    const newRegimeSaved = newRegimeDeduction * withCess;

    return {
      emi,
      months,
      selected,
      totalYears,
      principalPaid: row.principal,
      interestPaid: row.interest,
      closing: row.balance,
      ...detail,
      totalDeduction,
      taxSaved,
      netInterest,
      lifetime,
      lifetimeSaved,
      lifetimeInterest,
      newRegimeSaved,
      marginalWithCess: withCess * 100,
      rentValue,
    };
  }, [loan, rate, years, year, other80c, slab, property, rent, eea]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Home Loan Tax Benefit Calculator (old regime)",
      `Loan: ${money(toNumber(loan))} at ${num(toNumber(rate))}% for ${num(toNumber(years))} years`,
      `EMI: ${money(calc.emi)}`,
      `Year ${calc.selected}: principal ${money(calc.principalPaid)}, interest ${money(calc.interestPaid)}`,
      `Section 80C deduction: ${money(calc.d80c)}`,
      `Section 24(b) deduction: ${money(calc.d24)}`,
      calc.d80eea > 0 ? `Section 80EEA deduction: ${money(calc.d80eea)}` : null,
      `Total deduction: ${money(calc.totalDeduction)}`,
      `Tax saved this year: ${money(calc.taxSaved)}`,
      `Effective interest after tax relief: ${money(calc.netInterest)}`,
      `Tax saved over the full tenure: ${money(calc.lifetimeSaved)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [calc, loan, rate, years]);

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
    setLoan(String(DEFAULTS.loan));
    setRate(String(DEFAULTS.rate));
    setYears(String(DEFAULTS.years));
    setYear(String(DEFAULTS.year));
    setOther80c(String(DEFAULTS.other80c));
    setSlab(String(DEFAULTS.slab));
    setProperty(DEFAULTS.property);
    setRent(String(DEFAULTS.rent));
    setEea(DEFAULTS.eea);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <House className="h-4 w-4" aria-hidden="true" />
          Home loan tax
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Home Loan Tax Benefit Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See how much of your EMI comes back as tax relief — Section 80C on principal (₹1.5 lakh
          cap), Section 24(b) on interest (₹2 lakh cap for a self-occupied home) and Section 80EEA
          where it applies, for any year of the loan.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hltb-loan">
              Loan amount (INR)
            </label>
            <input
              id="hltb-loan"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50000"
              value={loan}
              onChange={(event) => setLoan(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hltb-rate">
              Interest rate (% per year)
            </label>
            <input
              id="hltb-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hltb-years">
              Tenure (years)
            </label>
            <input
              id="hltb-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hltb-year">
              Loan year to analyse
            </label>
            <input
              id="hltb-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hltb-other80c">
              Other 80C investments already claimed (INR)
            </label>
            <input
              id="hltb-other80c"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="150000"
              step="5000"
              value={other80c}
              onChange={(event) => setOther80c(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hltb-slab">
              Your marginal tax slab
            </label>
            <select
              id="hltb-slab"
              className={`mt-2 ${INPUT_CLASS}`}
              value={slab}
              onChange={(event) => setSlab(event.target.value)}
            >
              {SLABS.map((value) => (
                <option key={value} value={value}>
                  {value}% + 4% cess
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hltb-property">
              Property type
            </label>
            <select
              id="hltb-property"
              className={`mt-2 ${INPUT_CLASS}`}
              value={property}
              onChange={(event) => setProperty(event.target.value)}
            >
              <option value="self">Self-occupied</option>
              <option value="letout">Let out / rented</option>
            </select>
          </div>
          {property === "letout" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="hltb-rent">
                Annual rent received (INR)
              </label>
              <input
                id="hltb-rent"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1000"
                value={rent}
                onChange={(event) => setRent(event.target.value)}
              />
            </div>
          ) : (
            <div className="flex items-end">
              <label
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--foreground)]"
                htmlFor="hltb-eea"
              >
                <input
                  id="hltb-eea"
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={eea}
                  onChange={(event) => setEea(event.target.checked)}
                />
                Eligible for Section 80EEA
              </label>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          80EEA gives an extra ₹1.5 lakh of interest deduction, but only on loans sanctioned between
          1 April 2019 and 31 March 2022 for a home with stamp-duty value up to ₹45 lakh.
        </p>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Tax saved in loan year {calc.selected}
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.taxSaved)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  on {money(calc.totalDeduction)} of deductions at {num(calc.marginalWithCess)}%
                  effective tax
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy home loan tax benefit result"
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
                ["Monthly EMI", money(calc.emi)],
                [`Principal repaid in year ${calc.selected}`, money(calc.principalPaid)],
                [`Interest paid in year ${calc.selected}`, money(calc.interestPaid)],
                ["Section 80C deduction (principal)", money(calc.d80c)],
                ["Section 24(b) deduction (interest)", money(calc.d24)],
                ...(calc.d80eea > 0 ? [["Section 80EEA extra interest", money(calc.d80eea)]] : []),
                ...(calc.carryForward > 0
                  ? [["House-property loss carried forward", money(calc.carryForward)]]
                  : []),
                ["Total deduction claimed", money(calc.totalDeduction)],
                ["Interest cost after tax relief", money(calc.netInterest)],
                ["Outstanding balance at year end", money(calc.closing)],
                ["Same year under the new regime", money(calc.newRegimeSaved)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Tax saved across the full tenure</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {money(calc.lifetimeSaved)} saved against {money(calc.lifetimeInterest)} of total
                  interest
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTable((value) => !value)}
                className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                aria-expanded={showTable}
              >
                {showTable ? "Hide" : "Show"}
              </button>
            </div>
            {showTable && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Year
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        80C
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        24(b)
                      </th>
                      <th scope="col" className="py-2 text-right font-semibold">
                        Tax saved
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {calc.lifetime.map((row) => (
                      <tr
                        key={row.year}
                        className={`border-b border-[var(--border)] last:border-0 ${
                          row.year === calc.selected ? "text-[var(--primary)]" : ""
                        }`}
                      >
                        <td className="py-2 pr-3 font-semibold">{row.year}</td>
                        <td className="py-2 pr-3 text-right">{money(row.d80c)}</td>
                        <td className="py-2 pr-3 text-right">{money(row.d24)}</td>
                        <td className="py-2 text-right font-semibold">{money(row.saved)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate under the old tax regime. Deductions on a self-occupied home are only
        available once construction is complete; pre-construction interest is claimed in five equal
        instalments within the same ₹2 lakh cap. Confirm your position with a qualified tax adviser.
      </p>
    </main>
  );
}
