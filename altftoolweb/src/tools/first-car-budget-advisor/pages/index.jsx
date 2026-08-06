"use client";

import { useMemo, useState } from "react";
import { CarFront, Check, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULT_DOWN_PAYMENT_FRACTION,
  DEFAULT_INCOME_SHARE,
  DEFAULT_MAX_LOAN_MONTHS,
  adviseFirstCarBudget,
} from "../lib";

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
const PCT = new Intl.NumberFormat("en-IN", {
  style: "percent",
  maximumFractionDigits: 1,
});

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const pct = (v) => (Number.isFinite(v) ? PCT.format(v) : DASH);

const TENURES = [
  { value: "36", label: "36 months (3 years)" },
  { value: "48", label: "48 months (4 years) — the 20/4/10 limit" },
  { value: "60", label: "60 months (5 years)" },
  { value: "72", label: "72 months (6 years)" },
];

const DEFAULTS = {
  income: "120000",
  savings: "400000",
  emergency: "150000",
  km: "700",
  mileage: "18",
  fuelPrice: "105",
  insurance: "15000",
  maintenance: "10000",
  parking: "0",
  rate: "9.5",
  tenure: String(DEFAULT_MAX_LOAN_MONTHS),
  downPct: String(DEFAULT_DOWN_PAYMENT_FRACTION * 100),
  sharePct: String(DEFAULT_INCOME_SHARE * 100),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [income, setIncome] = useState(DEFAULTS.income);
  const [savings, setSavings] = useState(DEFAULTS.savings);
  const [emergency, setEmergency] = useState(DEFAULTS.emergency);
  const [km, setKm] = useState(DEFAULTS.km);
  const [mileage, setMileage] = useState(DEFAULTS.mileage);
  const [fuelPrice, setFuelPrice] = useState(DEFAULTS.fuelPrice);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [maintenance, setMaintenance] = useState(DEFAULTS.maintenance);
  const [parking, setParking] = useState(DEFAULTS.parking);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [tenure, setTenure] = useState(DEFAULTS.tenure);
  const [downPct, setDownPct] = useState(DEFAULTS.downPct);
  const [sharePct, setSharePct] = useState(DEFAULTS.sharePct);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const result = useMemo(
    () =>
      adviseFirstCarBudget({
        grossMonthlyIncome: toNum(income),
        savings: toNum(savings),
        emergencyFund: toNum(emergency),
        kmPerMonth: toNum(km),
        mileageKmpl: toNum(mileage),
        fuelPricePerLitre: toNum(fuelPrice),
        annualInsurance: toNum(insurance),
        annualMaintenance: toNum(maintenance),
        monthlyParking: toNum(parking),
        annualRate: toNum(rate),
        tenureMonths: toNum(tenure),
        downPaymentFraction: toNum(downPct) / 100,
        incomeShare: toNum(sharePct) / 100,
      }),
    [
      income,
      savings,
      emergency,
      km,
      mileage,
      fuelPrice,
      insurance,
      maintenance,
      parking,
      rate,
      tenure,
      downPct,
      sharePct,
    ],
  );

  const hasError = Boolean(result.error);

  const rows = hasError
    ? [
        ["Monthly transport budget", DASH],
        ["Fuel", DASH],
        ["Insurance", DASH],
        ["Maintenance", DASH],
        ["Parking", DASH],
        ["Running costs total", DASH],
        ["EMI you can carry", DASH],
        ["Loan that EMI supports", DASH],
        ["Down payment from savings", DASH],
        ["Down payment share", DASH],
        ["Total interest over the loan", DASH],
        ["All-in monthly cost", DASH],
        ["Share of gross income", DASH],
        ["Cost per km driven", DASH],
      ]
    : [
        ["Monthly transport budget", money(result.transportBudget)],
        ["Fuel", money(result.monthlyFuel)],
        ["Insurance", money(result.monthlyInsurance)],
        ["Maintenance", money(result.monthlyMaintenance)],
        ["Parking", money(result.monthlyParking)],
        ["Running costs total", money(result.monthlyRunning)],
        ["EMI you can carry", money(result.maxEmi)],
        ["Loan that EMI supports", money(result.loanAmount)],
        ["Down payment from savings", money(result.downPayment)],
        ["Down payment share", pct(result.downPaymentShare)],
        ["Total interest over the loan", money(result.totalInterest)],
        ["All-in monthly cost", money(result.monthlyAllIn)],
        ["Share of gross income", pct(result.actualIncomeShare)],
        ["Cost per km driven", money2(result.costPerKm)],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "First Car Budget Advisor (20/4/10 rule)",
      `Affordable on-road price: ${money(result.maxPrice)}`,
      `Down payment: ${money(result.downPayment)} (${pct(result.downPaymentShare)})`,
      `Loan: ${money(result.loanAmount)} over ${toNum(tenure)} months`,
      `EMI: ${money(result.emi)}`,
      ...rows.map(([label, value]) => `${label}: ${value}`),
      `Limited by: ${result.limitedBy}`,
    ].join("\n");
  }, [hasError, result, rows, tenure]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 4000);
    }
  };

  const reset = () => {
    setIncome(DEFAULTS.income);
    setSavings(DEFAULTS.savings);
    setEmergency(DEFAULTS.emergency);
    setKm(DEFAULTS.km);
    setMileage(DEFAULTS.mileage);
    setFuelPrice(DEFAULTS.fuelPrice);
    setInsurance(DEFAULTS.insurance);
    setMaintenance(DEFAULTS.maintenance);
    setParking(DEFAULTS.parking);
    setRate(DEFAULTS.rate);
    setTenure(DEFAULTS.tenure);
    setDownPct(DEFAULTS.downPct);
    setSharePct(DEFAULTS.sharePct);
    setCopied(false);
  };

  const moneyFields = [
    ["fcb-income", "Gross monthly income (₹)", income, setIncome, "1000"],
    ["fcb-savings", "Savings available (₹)", savings, setSavings, "5000"],
    ["fcb-emergency", "Keep back as emergency fund (₹)", emergency, setEmergency, "5000"],
    ["fcb-km", "Driving per month (km)", km, setKm, "50"],
    ["fcb-mileage", "Expected mileage (km per litre)", mileage, setMileage, "0.5"],
    ["fcb-fuel", "Fuel price (₹ per litre)", fuelPrice, setFuelPrice, "0.5"],
    ["fcb-insurance", "Insurance per year (₹)", insurance, setInsurance, "500"],
    ["fcb-maintenance", "Service and repairs per year (₹)", maintenance, setMaintenance, "500"],
    ["fcb-parking", "Parking per month (₹)", parking, setParking, "100"],
    ["fcb-rate", "Loan interest rate (% per year)", rate, setRate, "0.05"],
  ];

  const ruleFields = [
    ["fcb-downpct", "Minimum down payment (% of price)", downPct, setDownPct, "1"],
    ["fcb-sharepct", "Income cap for all car costs (%)", sharePct, setSharePct, "1"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CarFront className="h-4 w-4" aria-hidden="true" />
          20/4/10 rule
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">First Car Budget Advisor</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Decide your ceiling before a showroom decides it for you. Fuel, insurance and servicing
          come out of the budget first — whatever is left is the EMI you can actually carry.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          {moneyFields.map(([id, label, value, setter, step]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={value}
                onChange={(e) => setter(e.target.value)}
              />
            </div>
          ))}

          <div>
            <label className={LABEL_CLASS} htmlFor="fcb-tenure">
              Loan tenure
            </label>
            <select
              id="fcb-tenure"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
            >
              {TENURES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {ruleFields.map(([id, label, value, setter, step]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={value}
                onChange={(e) => setter(e.target.value)}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              On-road price you can afford
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.maxPrice)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your budget."
                : `${money(result.downPayment)} down, ${money(result.loanAmount)} financed at an EMI of ${money(result.emi)}`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                disabled={hasError}
                aria-label={copied ? "Copied to clipboard" : "Copy first car budget result"}
                className={`${GHOST_BTN} disabled:opacity-50`}
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
            {copyError && (
              <p role="status" aria-live="polite" className="text-xs text-[var(--danger)]">
                Couldn&apos;t copy — try selecting and copying manually.
              </p>
            )}
          </div>
        </div>

        {!hasError &&
          result.notes.map((note) => (
            <p
              key={note}
              className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </p>
          ))}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not financial advice. The 20/4/10 rule is a guideline, not a lending
        standard — a bank will run its own income-multiple and obligation checks, and quoted rates
        vary with credit score, vehicle age and tenure. On-road price includes road tax,
        registration and first-year insurance, so budget against that figure rather than the
        ex-showroom price.
      </p>
    </main>
  );
}
