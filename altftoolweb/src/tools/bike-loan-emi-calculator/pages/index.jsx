"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";

import { computeBikeLoan } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const TENURE_PRESETS = [12, 18, 24, 36, 48, 60];

const DEFAULTS = {
  exShowroom: "110000",
  rto: "12000",
  insurance: "9000",
  accessories: "4000",
  downPayment: "35000",
  rate: "10.5",
  months: "36",
  feePct: "1",
  feeFlat: "500",
  financeFee: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return 0;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [exShowroom, setExShowroom] = useState(DEFAULTS.exShowroom);
  const [rto, setRto] = useState(DEFAULTS.rto);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [accessories, setAccessories] = useState(DEFAULTS.accessories);
  const [downPayment, setDownPayment] = useState(DEFAULTS.downPayment);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [feePct, setFeePct] = useState(DEFAULTS.feePct);
  const [feeFlat, setFeeFlat] = useState(DEFAULTS.feeFlat);
  const [financeFee, setFinanceFee] = useState(DEFAULTS.financeFee);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const rawMonths = toNumber(months);
    return computeBikeLoan({
      exShowroom: toNumber(exShowroom),
      rtoAndRegistration: toNumber(rto),
      insurance: toNumber(insurance),
      accessories: toNumber(accessories),
      downPayment: toNumber(downPayment),
      annualRate: toNumber(rate),
      months: Number.isFinite(rawMonths) ? Math.round(rawMonths) : rawMonths,
      processingFeePct: toNumber(feePct),
      processingFeeFlat: toNumber(feeFlat),
      financeFee,
    });
  }, [exShowroom, rto, insurance, accessories, downPayment, rate, months, feePct, feeFlat, financeFee]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Bike Loan EMI",
      `On-road price: ${INR.format(result.onRoadPrice)}`,
      `Down payment: ${INR.format(toNumber(downPayment))} (${NUM1.format(result.downPaymentPct)}%)`,
      `Amount financed: ${INR.format(result.amountFinanced)} at ${rate}% for ${months} months`,
      `EMI: ${INR.format(result.emi)}`,
      `Total interest: ${INR.format(result.totalInterest)}`,
      `Processing fee: ${INR.format(result.processingFee)}`,
      `Total repayment: ${INR.format(result.totalRepayment)}`,
      `Everything you pay: ${INR.format(result.totalOutgo)} — ${INR.format(result.costOverOnRoad)} above the on-road price`,
    ].join("\n");
  }, [hasError, result, downPayment, rate, months]);

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
    setExShowroom(DEFAULTS.exShowroom);
    setRto(DEFAULTS.rto);
    setInsurance(DEFAULTS.insurance);
    setAccessories(DEFAULTS.accessories);
    setDownPayment(DEFAULTS.downPayment);
    setRate(DEFAULTS.rate);
    setMonths(DEFAULTS.months);
    setFeePct(DEFAULTS.feePct);
    setFeeFlat(DEFAULTS.feeFlat);
    setFinanceFee(DEFAULTS.financeFee);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["On-road price", DASH],
        ["Down payment", DASH],
        ["Amount financed", DASH],
        ["Processing fee", DASH],
        ["Total interest", DASH],
        ["Total repayment", DASH],
        ["Everything you pay", DASH],
        ["Cost above the on-road price", DASH],
        ["Loan to value", DASH],
      ]
    : [
        ["On-road price", INR.format(result.onRoadPrice)],
        [
          "Down payment",
          `${INR.format(toNumber(downPayment))} (${NUM1.format(result.downPaymentPct)}%)`,
        ],
        ["Amount financed", INR.format(result.amountFinanced)],
        [
          "Processing fee",
          `${INR.format(result.processingFee)} · ${financeFee ? "added to the loan" : "paid up front"}`,
        ],
        [
          "Total interest",
          `${INR.format(result.totalInterest)} (${NUM1.format(result.interestAsPctOfLoan)}% of the loan)`,
        ],
        ["Total repayment", INR.format(result.totalRepayment)],
        ["Everything you pay", INR.format(result.totalOutgo)],
        ["Cost above the on-road price", INR.format(result.costOverOnRoad)],
        ["Loan to value", `${NUM1.format(result.ltvPct)}%`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Two-wheeler finance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Bike Loan EMI Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lenders finance the on-road price, not the ex-showroom price in the advertisement. Build it
          up properly and see the instalment, the interest and the year-by-year schedule.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          On-road price
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="loan-ex-showroom">
              Ex-showroom price (₹)
            </label>
            <input
              id="loan-ex-showroom"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1000"
              value={exShowroom}
              onChange={(event) => setExShowroom(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="loan-rto">
              RTO tax and registration (₹)
            </label>
            <input
              id="loan-rto"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={rto}
              onChange={(event) => setRto(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="loan-insurance">
              Insurance (₹)
            </label>
            <input
              id="loan-insurance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={insurance}
              onChange={(event) => setInsurance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="loan-accessories">
              Accessories and extras (₹)
            </label>
            <input
              id="loan-accessories"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={accessories}
              onChange={(event) => setAccessories(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          The loan
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="loan-down-payment">
              Down payment (₹)
            </label>
            <input
              id="loan-down-payment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={downPayment}
              onChange={(event) => setDownPayment(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="loan-rate">
              Annual interest rate (%)
            </label>
            <input
              id="loan-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="loan-months">
              Tenure (months)
            </label>
            <input
              id="loan-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="84"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {TENURE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMonths(String(preset))}
                  aria-pressed={String(preset) === months}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {preset} m
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="loan-fee-pct">
              Processing fee (% of loan)
            </label>
            <input
              id="loan-fee-pct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.1"
              value={feePct}
              onChange={(event) => setFeePct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="loan-fee-flat">
              Documentation charge (₹)
            </label>
            <input
              id="loan-fee-flat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={feeFlat}
              onChange={(event) => setFeeFlat(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 sm:mt-7">
            <input
              id="loan-finance-fee"
              type="checkbox"
              checked={financeFee}
              onChange={(event) => setFinanceFee(event.target.checked)}
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            />
            <label htmlFor="loan-finance-fee" className="min-h-11 flex-1 py-3 text-sm font-semibold">
              Add the fee to the loan
            </label>
          </div>
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
              Monthly instalment
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : INR.format(result.emi)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see an EMI."
                : `${months} instalments on ${INR.format(result.amountFinanced)} at ${rate}% reducing balance`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy bike loan EMI result"
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
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-sm">
              <caption className="pb-2 text-left text-xs text-[var(--muted-foreground)]">
                Amortisation, year by year
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Principal
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Interest
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Paid
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.years.map((year) => (
                  <tr key={year.year} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3">
                      {year.year}
                      {year.months < 12 && (
                        <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                          ({year.months} m)
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">{INR.format(year.principalPaid)}</td>
                    <td className="py-2 pr-3 text-right">{INR.format(year.interestPaid)}</td>
                    <td className="py-2 pr-3 text-right">{INR.format(year.totalPaid)}</td>
                    <td className="py-2 text-right font-semibold">{INR.format(year.closingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate, not a loan offer or financial advice. Your lender&apos;s sanction letter
        governs: rates are subject to credit assessment, GST applies to fees, and a broken EMI for the
        part-month between disbursal and the first due date is common. Check the foreclosure and
        part-prepayment terms before signing, and speak to your bank about anything binding.
      </p>
    </main>
  );
}
