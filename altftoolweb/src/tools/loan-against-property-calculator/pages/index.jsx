"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${num(value)}%`;

const PROPERTY_TYPES = [
  { id: "residential", label: "Residential (self-occupied / rented)", ltv: 70 },
  { id: "commercial", label: "Commercial shop or office", ltv: 60 },
  { id: "industrial", label: "Industrial unit", ltv: 55 },
  { id: "plot", label: "Vacant land / plot", ltv: 50 },
];

const DEFAULTS = {
  propertyType: "residential",
  propertyValue: "10000000",
  ltv: "70",
  existingLoan: "0",
  income: "150000",
  rent: "0",
  existingEmi: "20000",
  foir: "55",
  rate: "9.75",
  years: "15",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** Share of rental income lenders typically count towards repayment capacity. */
const RENT_FACTOR = 0.75;

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

function emiFor(principal, annualRate, months) {
  if (!(principal > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return principal / months;
  const growth = Math.pow(1 + r, months);
  return (principal * r * growth) / (growth - 1);
}

/** Inverse of the EMI formula: the largest principal a given EMI can service. */
function principalFor(emi, annualRate, months) {
  if (!(emi > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return emi * months;
  const growth = Math.pow(1 + r, months);
  return (emi * (growth - 1)) / (r * growth);
}

export default function ToolHome() {
  const [propertyType, setPropertyType] = useState(DEFAULTS.propertyType);
  const [propertyValue, setPropertyValue] = useState(DEFAULTS.propertyValue);
  const [ltv, setLtv] = useState(DEFAULTS.ltv);
  const [existingLoan, setExistingLoan] = useState(DEFAULTS.existingLoan);
  const [income, setIncome] = useState(DEFAULTS.income);
  const [rent, setRent] = useState(DEFAULTS.rent);
  const [existingEmi, setExistingEmi] = useState(DEFAULTS.existingEmi);
  const [foir, setFoir] = useState(DEFAULTS.foir);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [copied, setCopied] = useState(false);

  const onTypeChange = (id) => {
    setPropertyType(id);
    const preset = PROPERTY_TYPES.find((item) => item.id === id);
    if (preset) setLtv(String(preset.ltv));
  };

  const calc = useMemo(() => {
    const value = toNumber(propertyValue);
    const ltvPct = toNumber(ltv);
    const outstanding = toNumber(existingLoan);
    const salary = toNumber(income);
    const rental = toNumber(rent);
    const otherEmi = toNumber(existingEmi);
    const foirPct = toNumber(foir);
    const r = toNumber(rate);
    const y = toNumber(years);

    const all = [value, ltvPct, outstanding, salary, rental, otherEmi, foirPct, r, y];
    if (all.some((entry) => Number.isNaN(entry))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (all.some((entry) => entry < 0)) return { error: "Values cannot be negative." };
    if (value <= 0) return { error: "Enter the market value of the property." };
    if (ltvPct <= 0 || ltvPct > 90) return { error: "LTV for a property loan is usually 50% to 75%." };
    if (foirPct <= 0 || foirPct > 80) return { error: "FOIR is normally between 40% and 65%." };
    if (r < 0 || r > 40) return { error: "Interest rate should be between 0% and 40% per year." };
    if (y <= 0 || y > 25) return { error: "Loan against property tenure is usually 5 to 20 years." };
    if (salary + rental <= 0) return { error: "Enter your monthly income to test affordability." };

    const months = Math.round(y * 12);
    const consideredIncome = salary + rental * RENT_FACTOR;
    const foirCapEmi = (consideredIncome * foirPct) / 100;
    const availableEmi = Math.max(0, foirCapEmi - otherEmi);

    const propertyCap = (value * ltvPct) / 100;
    const valueBased = Math.max(0, propertyCap - outstanding);
    const incomeBased = principalFor(availableEmi, r, months);
    const eligible = Math.min(valueBased, incomeBased);
    const binding = incomeBased <= valueBased ? "income" : "property";

    const emi = emiFor(eligible, r, months);
    const totalPayment = emi * months;
    const totalInterest = Math.max(0, totalPayment - eligible);
    const newFoir = consideredIncome > 0 ? ((otherEmi + emi) / consideredIncome) * 100 : 0;
    const effectiveLtv = value > 0 ? ((eligible + outstanding) / value) * 100 : 0;

    return {
      months,
      consideredIncome,
      foirCapEmi,
      availableEmi,
      propertyCap,
      valueBased,
      incomeBased,
      eligible,
      binding,
      emi,
      totalPayment,
      totalInterest,
      newFoir,
      effectiveLtv,
      rental,
      otherEmi,
      outstanding,
      zero: eligible <= 0,
    };
  }, [propertyValue, ltv, existingLoan, income, rent, existingEmi, foir, rate, years]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Loan Against Property Eligibility",
      `Property value: ${money(toNumber(propertyValue))}`,
      `LTV cap applied: ${pct(toNumber(ltv))}`,
      `Property-based limit: ${money(calc.valueBased)}`,
      `Income-based limit (FOIR ${pct(toNumber(foir))}): ${money(calc.incomeBased)}`,
      `Eligible loan amount: ${money(calc.eligible)}`,
      `EMI: ${money(calc.emi)} for ${calc.months} months at ${num(toNumber(rate))}% per year`,
      `Total interest: ${money(calc.totalInterest)}`,
      `FOIR after this loan: ${pct(calc.newFoir)}`,
    ].join("\n");
  }, [calc, propertyValue, ltv, foir, rate]);

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
    setPropertyType(DEFAULTS.propertyType);
    setPropertyValue(DEFAULTS.propertyValue);
    setLtv(DEFAULTS.ltv);
    setExistingLoan(DEFAULTS.existingLoan);
    setIncome(DEFAULTS.income);
    setRent(DEFAULTS.rent);
    setExistingEmi(DEFAULTS.existingEmi);
    setFoir(DEFAULTS.foir);
    setRate(DEFAULTS.rate);
    setYears(DEFAULTS.years);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Loan against property
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Loan Against Property Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lenders sanction a LAP on whichever is lower: the loan-to-value cap on your property, or
          what your income can service within their FOIR limit. This tool computes both and shows the
          binding constraint, the EMI and the total interest.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Property</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lap-type">
              Property type
            </label>
            <select
              id="lap-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={propertyType}
              onChange={(event) => onTypeChange(event.target.value)}
            >
              {PROPERTY_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} — typical LTV {option.ltv}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lap-value">
              Market value of property (INR)
            </label>
            <input
              id="lap-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50000"
              value={propertyValue}
              onChange={(event) => setPropertyValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lap-ltv">
              LTV the lender allows (%)
            </label>
            <input
              id="lap-ltv"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="90"
              step="1"
              value={ltv}
              onChange={(event) => setLtv(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lap-existing-loan">
              Existing loan outstanding on this property (INR)
            </label>
            <input
              id="lap-existing-loan"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={existingLoan}
              onChange={(event) => setExistingLoan(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Income and loan terms</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lap-income">
              Net monthly income (INR)
            </label>
            <input
              id="lap-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={income}
              onChange={(event) => setIncome(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lap-rent">
              Monthly rental income (INR)
            </label>
            <input
              id="lap-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={rent}
              onChange={(event) => setRent(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Only {Math.round(RENT_FACTOR * 100)}% of rent is counted, as most lenders do.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lap-existing-emi">
              Existing monthly EMIs (INR)
            </label>
            <input
              id="lap-existing-emi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={existingEmi}
              onChange={(event) => setExistingEmi(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lap-foir">
              FOIR limit (%)
            </label>
            <input
              id="lap-foir"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="80"
              step="1"
              value={foir}
              onChange={(event) => setFoir(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lap-rate">
              Interest rate (% per year)
            </label>
            <input
              id="lap-rate"
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
            <label className={LABEL_CLASS} htmlFor="lap-years">
              Tenure (years)
            </label>
            <input
              id="lap-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="25"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
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
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Eligible loan amount
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.eligible)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  EMI {money(calc.emi)} for {calc.months} months
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy loan against property eligibility result"
                  className={GHOST_BTN}
                >
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            {calc.zero ? (
              <p
                role="alert"
                className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                No eligibility at these numbers. Your existing EMIs already use up the FOIR limit, or
                the property is fully mortgaged. Close some debt, add a co-applicant or extend the
                tenure and check again.
              </p>
            ) : (
              <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                {calc.binding === "income"
                  ? "Your income is the binding constraint — the property could support a larger loan, but the FOIR limit caps the EMI."
                  : "The property value is the binding constraint — your income could service a larger EMI, but the LTV cap limits the sanction."}
              </p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div
                className={`rounded-lg border p-4 ${
                  calc.binding === "property"
                    ? "border-[var(--primary)]"
                    : "border-[var(--border)]"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Property-based limit
                </p>
                <p className="mt-1 text-2xl font-semibold">{money(calc.valueBased)}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {pct(toNumber(ltv))} of value = {money(calc.propertyCap)}
                  {calc.outstanding > 0 ? `, less ${money(calc.outstanding)} outstanding` : ""}
                </p>
              </div>
              <div
                className={`rounded-lg border p-4 ${
                  calc.binding === "income" ? "border-[var(--primary)]" : "border-[var(--border)]"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Income-based limit
                </p>
                <p className="mt-1 text-2xl font-semibold">{money(calc.incomeBased)}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  EMI headroom {money(calc.availableEmi)} per month
                </p>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Income considered by the lender", `${money(calc.consideredIncome)} per month`],
                ["Maximum total EMI at this FOIR", money(calc.foirCapEmi)],
                ["Less existing EMIs", money(calc.otherEmi)],
                ["EMI available for the new loan", money(calc.availableEmi)],
                ["EMI on the sanctioned amount", money(calc.emi)],
                ["Total interest over the tenure", money(calc.totalInterest)],
                ["Total repayment", money(calc.totalPayment)],
                ["FOIR after this loan", pct(calc.newFoir)],
                ["Effective LTV used", pct(calc.effectiveLtv)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Actual sanction depends on the lender&apos;s own valuation and
        legal report, clear title, property age and location, your credit score, income documents and
        internal FOIR policy — which is often stricter at lower income levels.
      </p>
    </main>
  );
}
