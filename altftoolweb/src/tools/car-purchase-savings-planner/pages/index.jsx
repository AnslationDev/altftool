"use client";

import { useMemo, useState } from "react";
import { Car, Check, Copy, RotateCcw } from "lucide-react";

import { RULE_MAX_COST_OF_INCOME_PCT, RULE_MAX_LOAN_YEARS, RULE_MIN_DOWN_PCT, planCarPurchase } from "../lib";

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

const DASH = "—";

const DEFAULTS = {
  price: "1200000",
  buyYears: "2",
  growth: "4",
  downPct: "20",
  loanRate: "9.5",
  loanYears: "5",
  income: "100000",
  holding: "5",
  km: "12000",
  mileage: "15",
  fuelPrice: "105",
  insurance: "25000",
  maintenance: "12000",
  exShare: "85",
  existing: "50000",
  returnPct: "6",
};

export default function ToolHome() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [buyYears, setBuyYears] = useState(DEFAULTS.buyYears);
  const [growth, setGrowth] = useState(DEFAULTS.growth);
  const [downPct, setDownPct] = useState(DEFAULTS.downPct);
  const [loanRate, setLoanRate] = useState(DEFAULTS.loanRate);
  const [loanYears, setLoanYears] = useState(DEFAULTS.loanYears);
  const [income, setIncome] = useState(DEFAULTS.income);
  const [holding, setHolding] = useState(DEFAULTS.holding);
  const [km, setKm] = useState(DEFAULTS.km);
  const [mileage, setMileage] = useState(DEFAULTS.mileage);
  const [fuelPrice, setFuelPrice] = useState(DEFAULTS.fuelPrice);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [maintenance, setMaintenance] = useState(DEFAULTS.maintenance);
  const [exShare, setExShare] = useState(DEFAULTS.exShare);
  const [existing, setExisting] = useState(DEFAULTS.existing);
  const [returnPct, setReturnPct] = useState(DEFAULTS.returnPct);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planCarPurchase({
        onRoadPrice: price,
        yearsToBuy: buyYears,
        priceGrowth: growth,
        downPaymentPct: downPct,
        loanRate,
        loanYears,
        grossMonthlyIncome: income,
        holdingYears: holding,
        kmPerYear: km,
        mileage,
        fuelPrice,
        insurancePerYear: insurance,
        maintenancePerYear: maintenance,
        exShowroomSharePct: exShare,
        existingSavings: existing,
        savingsReturn: returnPct,
      }),
    [
      price, buyYears, growth, downPct, loanRate, loanYears, income, holding, km, mileage,
      fuelPrice, insurance, maintenance, exShare, existing, returnPct,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Car Purchase Plan",
      `Price on the purchase date: ${money(result.futurePrice)}`,
      `Down payment at ${num(result.downPaymentPct)}%: ${money(result.downPayment)}`,
      result.downPaymentFunded
        ? "Down payment already covered by existing savings."
        : `Save ${money(result.monthlySaving)} a month for ${result.buyMonths} months.`,
      `Loan ${money(result.loanAmount)} · EMI ${money(result.emi)} for ${result.loanMonths} months`,
      `Running cost: ${money(result.runningPerMonth)} a month`,
      `Total monthly car cost: ${money(result.monthlyCarCost)}`,
      result.costSharePct === null
        ? "Share of income: not calculated"
        : `Share of gross income: ${num(result.costSharePct)}%`,
      `20/4/10 rule: ${result.rulePasses ? "passes" : "fails"}`,
      `Cost of owning it for ${num(result.holdingYears)} years after resale: ${money(result.tco)} (${money(result.tcoPerMonth)} a month)`,
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
    setPrice(DEFAULTS.price);
    setBuyYears(DEFAULTS.buyYears);
    setGrowth(DEFAULTS.growth);
    setDownPct(DEFAULTS.downPct);
    setLoanRate(DEFAULTS.loanRate);
    setLoanYears(DEFAULTS.loanYears);
    setIncome(DEFAULTS.income);
    setHolding(DEFAULTS.holding);
    setKm(DEFAULTS.km);
    setMileage(DEFAULTS.mileage);
    setFuelPrice(DEFAULTS.fuelPrice);
    setInsurance(DEFAULTS.insurance);
    setMaintenance(DEFAULTS.maintenance);
    setExShare(DEFAULTS.exShare);
    setExisting(DEFAULTS.existing);
    setReturnPct(DEFAULTS.returnPct);
    setCopied(false);
  };

  const buyFields = [
    { id: "cp-price", label: "On-road price today (₹)", value: price, set: setPrice, step: "10000", min: "0" },
    { id: "cp-buyyears", label: "Years until you buy", value: buyYears, set: setBuyYears, step: "1", min: "1" },
    { id: "cp-growth", label: "Car price inflation (% per year)", value: growth, set: setGrowth, step: "0.5", min: "0" },
    { id: "cp-down", label: "Down payment (% of price)", value: downPct, set: setDownPct, step: "1", min: "1" },
    { id: "cp-loanrate", label: "Car loan rate (% per year)", value: loanRate, set: setLoanRate, step: "0.05", min: "0" },
    { id: "cp-loanyears", label: "Loan tenure (years)", value: loanYears, set: setLoanYears, step: "1", min: "1" },
    { id: "cp-income", label: "Gross monthly income (₹)", value: income, set: setIncome, step: "5000", min: "0" },
    { id: "cp-existing", label: "Already saved for the down payment (₹)", value: existing, set: setExisting, step: "10000", min: "0" },
    { id: "cp-return", label: "Return on those savings (% per year)", value: returnPct, set: setReturnPct, step: "0.5", min: "0" },
  ];

  const ownFields = [
    { id: "cp-holding", label: "Years you will keep the car", value: holding, set: setHolding, step: "1", min: "1" },
    { id: "cp-km", label: "Kilometres driven a year", value: km, set: setKm, step: "1000", min: "0" },
    { id: "cp-mileage", label: "Fuel efficiency (km per litre)", value: mileage, set: setMileage, step: "0.5", min: "0.1" },
    { id: "cp-fuel", label: "Fuel price (₹ per litre)", value: fuelPrice, set: setFuelPrice, step: "1", min: "0" },
    { id: "cp-insurance", label: "Insurance a year (₹)", value: insurance, set: setInsurance, step: "1000", min: "0" },
    { id: "cp-maintenance", label: "Service & repairs a year (₹)", value: maintenance, set: setMaintenance, step: "1000", min: "0" },
    { id: "cp-exshare", label: "Ex-showroom share of on-road price (%)", value: exShare, set: setExShare, step: "1", min: "1" },
  ];

  const rows = hasError
    ? [
        ["Price on the purchase date", DASH],
        ["Down payment", DASH],
        ["Loan and EMI", DASH],
        ["Interest over the loan", DASH],
        ["Running cost a month", DASH],
        ["Total car cost a month", DASH],
        ["Share of gross income", DASH],
      ]
    : [
        ["Price on the purchase date", `${money(result.futurePrice)} (+${money(result.priceIncrease)})`],
        ["Down payment", `${money(result.downPayment)} at ${num(result.downPaymentPct)}%`],
        ["Loan and EMI", `${money(result.loanAmount)} · ${money(result.emi)} × ${result.loanMonths}`],
        ["Interest over the loan", money(result.totalInterest)],
        ["Running cost a month", money(result.runningPerMonth)],
        ["Total car cost a month", money(result.monthlyCarCost)],
        [
          "Share of gross income",
          result.costSharePct === null ? "Enter income to see this" : `${num(result.costSharePct)}%`,
        ],
      ];

  const ruleChecks = hasError
    ? []
    : [
        {
          key: "down",
          label: `Down payment at least ${RULE_MIN_DOWN_PCT}%`,
          detail: `You are putting down ${num(result.downPaymentPct)}%`,
          ok: result.rule.downOk,
        },
        {
          key: "tenure",
          label: `Loan no longer than ${RULE_MAX_LOAN_YEARS} years`,
          detail: `Your tenure is ${result.loanMonths} months`,
          ok: result.rule.tenureOk,
        },
        {
          key: "cost",
          label: `All car costs under ${RULE_MAX_COST_OF_INCOME_PCT}% of gross income`,
          detail:
            result.costSharePct === null
              ? "Enter your gross monthly income to test this leg"
              : `Currently ${num(result.costSharePct)}%`,
          ok: result.rule.costOk,
        },
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Car className="h-4 w-4" aria-hidden="true" />
          Car purchase
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Car Purchase Savings Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Three questions in one place: how much to save each month for the down payment, whether
          the EMI passes the 20/4/10 affordability rule, and what the car really costs once fuel,
          insurance, servicing and resale value are all counted.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Buying it</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {buyFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Owning it</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {ownFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
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
              Save every month for the down payment
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.monthlySaving)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the plan."
                : result.downPaymentFunded
                  ? "Existing savings already cover the down payment."
                  : `For ${result.buyMonths} months, to reach ${money(result.downPayment)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy car purchase plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
          <h2 className="text-base font-semibold">The 20/4/10 affordability rule</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {ruleChecks.map((check) => (
              <li
                key={check.key}
                className={`rounded-md px-3 py-2 ${
                  check.ok === true
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : check.ok === false
                      ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                }`}
              >
                <span className="font-semibold">{check.label}</span>
                <span className="block text-xs opacity-90">{check.detail}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            The rule is a widely used guideline, not a lending requirement. Failing a leg does not
            mean a loan will be refused — it means the car is taking a larger share of your income
            than the guideline considers comfortable.
          </p>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Cost of owning it for {num(result.holdingYears)} years</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Line</th>
                  <th scope="col" className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2 pr-3">Down payment</td>
                  <td className="py-2 text-right font-semibold">{money(result.downPayment)}</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2 pr-3">EMIs paid while you own it</td>
                  <td className="py-2 text-right font-semibold">{money(result.emiPaidInHolding)}</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2 pr-3">Fuel, insurance and servicing</td>
                  <td className="py-2 text-right font-semibold">{money(result.runningTotal)}</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2 pr-3">Less resale value ({num(result.residualPct)}% of ex-showroom)</td>
                  <td className="py-2 text-right font-semibold text-[var(--success)]">
                    −{money(result.resale)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-semibold">Net cost of ownership</td>
                  <td className="py-2 text-right font-semibold">{money(result.tco)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            That is {money(result.tcoPerMonth)} a month
            {result.tcoPerKm === null ? "" : ` and about ${money(result.tcoPerKm)} per kilometre`}.
            Resale uses the India Motor Tariff depreciation schedule for Insured Declared Value
            (5% under six months, rising to 50% at five years); past five years the tariff has no
            figure, so a further 10% a year is assumed.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Actual resale prices depend on model, condition, mileage and demand and often differ from
        the insurance depreciation schedule. Fuel prices and insurance premiums change every year.
        Informational only — not lending or investment advice.
      </p>
    </main>
  );
}
