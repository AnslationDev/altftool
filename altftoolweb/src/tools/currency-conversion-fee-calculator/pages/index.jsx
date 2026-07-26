"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, Check, Copy, RotateCcw } from "lucide-react";

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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const rate4 = (value) => NUM4.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${num(value)}%`;

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "SGD", "AUD", "CAD", "JPY", "CHF", "THB"];

const METHODS = {
  credit: { label: "Credit card abroad", markup: 3.5, fee: 0, flat: 0 },
  debit: { label: "Debit card abroad", markup: 3.5, fee: 0, flat: 150 },
  forexcard: { label: "Forex prepaid card", markup: 2, fee: 0, flat: 100 },
  bank: { label: "Bank / net banking", markup: 2.5, fee: 0, flat: 500 },
  cash: { label: "Cash at a money changer", markup: 2.5, fee: 0, flat: 0 },
  custom: { label: "Custom", markup: 1, fee: 0, flat: 0 },
};

const GST_RATE = 18;

const DEFAULTS = {
  amount: 1000,
  currency: "USD",
  midRate: 84.5,
  method: "credit",
  markup: 3.5,
  cardFee: 0,
  flatFee: 0,
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

/**
 * Taxable value of a foreign-exchange supply under GST Rule 32(2)(b).
 * 1% of the gross amount up to ₹1 lakh (minimum ₹250);
 * ₹1,000 + 0.5% of the excess up to ₹10 lakh;
 * ₹5,500 + 0.1% of the excess above that, capped at ₹60,000.
 */
function gstTaxableValue(grossInr) {
  if (!(grossInr > 0)) return 0;
  if (grossInr <= 100000) return Math.max(grossInr * 0.01, 250);
  if (grossInr <= 1000000) return 1000 + (grossInr - 100000) * 0.005;
  return Math.min(5500 + (grossInr - 1000000) * 0.001, 60000);
}

export default function ToolHome() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [midRate, setMidRate] = useState(String(DEFAULTS.midRate));
  const [method, setMethod] = useState(DEFAULTS.method);
  const [markup, setMarkup] = useState(String(DEFAULTS.markup));
  const [cardFee, setCardFee] = useState(String(DEFAULTS.cardFee));
  const [flatFee, setFlatFee] = useState(String(DEFAULTS.flatFee));
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const a = toNumber(amount);
    const mid = toNumber(midRate);
    const mk = toNumber(markup);
    const cf = toNumber(cardFee);
    const flat = toNumber(flatFee);

    if ([a, mid, mk, cf, flat].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (a <= 0) return { error: "Transaction amount must be greater than zero." };
    if (mid <= 0) return { error: "Enter the mid-market rate — it must be greater than zero." };
    if (mk < 0 || mk > 15) return { error: "Exchange rate markup should be between 0% and 15%." };
    if (cf < 0 || cf > 15) return { error: "Card fee should be between 0% and 15%." };
    if (flat < 0) return { error: "Flat fee cannot be negative." };

    const gross = a * mid;
    const markupAmount = (gross * mk) / 100;
    const appliedRate = mid * (1 + mk / 100);
    const convertedInr = gross + markupAmount;
    const cardFeeAmount = (convertedInr * cf) / 100;
    const gstOnFx = (gstTaxableValue(gross) * GST_RATE) / 100;
    const gstOnFees = ((cardFeeAmount + flat) * GST_RATE) / 100;
    const totalGst = gstOnFx + gstOnFees;
    const totalCharges = markupAmount + cardFeeAmount + flat + totalGst;
    const totalPaid = gross + totalCharges;
    const effectiveRate = totalPaid / a;
    const effectiveMarkup = (totalPaid / gross - 1) * 100;

    return {
      amountValue: a,
      mid,
      gross,
      markupAmount,
      appliedRate,
      convertedInr,
      cardFeeAmount,
      flat,
      gstBase: gstTaxableValue(gross),
      gstOnFx,
      gstOnFees,
      totalGst,
      totalCharges,
      totalPaid,
      effectiveRate,
      effectiveMarkup,
      markupPct: mk,
      cardFeePct: cf,
    };
  }, [amount, midRate, markup, cardFee, flatFee]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Currency Conversion Cost",
      `Transaction: ${num(calc.amountValue)} ${currency}`,
      `Mid-market rate: ${rate4(calc.mid)} INR per ${currency}`,
      `Value at mid-market: ${money2(calc.gross)}`,
      `Exchange rate markup (${pct(calc.markupPct)}): ${money2(calc.markupAmount)}`,
      `Card / bank fee: ${money2(calc.cardFeeAmount + calc.flat)}`,
      `GST (18%): ${money2(calc.totalGst)}`,
      `Total charges: ${money2(calc.totalCharges)}`,
      `Total you pay: ${money2(calc.totalPaid)}`,
      `Effective rate: ${rate4(calc.effectiveRate)} INR per ${currency}`,
      `Effective cost over mid-market: ${pct(calc.effectiveMarkup)}`,
    ].join("\n");
  }, [calc, currency]);

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

  const applyMethod = (key) => {
    setMethod(key);
    if (key === "custom") return;
    setMarkup(String(METHODS[key].markup));
    setCardFee(String(METHODS[key].fee));
    setFlatFee(String(METHODS[key].flat));
  };

  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setCurrency(DEFAULTS.currency);
    setMidRate(String(DEFAULTS.midRate));
    setMethod(DEFAULTS.method);
    setMarkup(String(DEFAULTS.markup));
    setCardFee(String(DEFAULTS.cardFee));
    setFlatFee(String(DEFAULTS.flatFee));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
          Forex cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Currency Conversion Fee Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The advertised &ldquo;zero commission&rdquo; rate is rarely what you pay. Enter the
          mid-market rate you can see on any rate tracker, add the markup and card fees, and this
          works out the GST under Rule 32(2)(b) and the exchange rate you are really getting.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ccf-amount">
              Transaction amount
            </label>
            <input
              id="ccf-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccf-currency">
              Currency
            </label>
            <select
              id="ccf-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccf-mid">
              Mid-market rate (INR per 1 {currency})
            </label>
            <input
              id="ccf-mid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={midRate}
              onChange={(event) => setMidRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccf-method">
              How you are paying
            </label>
            <select
              id="ccf-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={method}
              onChange={(event) => applyMethod(event.target.value)}
            >
              {Object.entries(METHODS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccf-markup">
              Exchange rate markup (%)
            </label>
            <input
              id="ccf-markup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="15"
              step="0.1"
              value={markup}
              onChange={(event) => {
                setMarkup(event.target.value);
                setMethod("custom");
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccf-cardfee">
              Cross-currency / card fee (%)
            </label>
            <input
              id="ccf-cardfee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="15"
              step="0.1"
              value={cardFee}
              onChange={(event) => {
                setCardFee(event.target.value);
                setMethod("custom");
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ccf-flat">
              Flat fee charged by the bank (INR)
            </label>
            <input
              id="ccf-flat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={flatFee}
              onChange={(event) => {
                setFlatFee(event.target.value);
                setMethod("custom");
              }}
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
                  You actually pay
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money2(calc.totalPaid)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  for {num(calc.amountValue)} {currency} — an effective rate of{" "}
                  {rate4(calc.effectiveRate)}, {pct(calc.effectiveMarkup)} above mid-market
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy currency conversion cost result"
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
                ["Value at the mid-market rate", money2(calc.gross)],
                [`Exchange rate markup (${pct(calc.markupPct)})`, money2(calc.markupAmount)],
                ["Rate your bank applies", `${rate4(calc.appliedRate)} INR / ${currency}`],
                [`Cross-currency card fee (${pct(calc.cardFeePct)})`, money2(calc.cardFeeAmount)],
                ["Flat bank fee", money2(calc.flat)],
                ["GST taxable value on conversion", money2(calc.gstBase)],
                ["GST on the conversion (18%)", money2(calc.gstOnFx)],
                ["GST on the fees (18%)", money2(calc.gstOnFees)],
                ["Total charges over mid-market", money2(calc.totalCharges)],
                ["Total payable", money2(calc.totalPaid)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5">
              <div
                className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Charges are ${pct(calc.effectiveMarkup)} on top of the mid-market value`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{
                    width: `${Math.max(0, Math.min(100, (calc.gross / calc.totalPaid) * 100))}%`,
                  }}
                />
                <span
                  className="block h-full bg-[var(--danger)]"
                  style={{
                    width: `${Math.max(0, Math.min(100, (calc.totalCharges / calc.totalPaid) * 100))}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Genuine currency value {money(calc.gross)} · charges {money(calc.totalCharges)}
              </p>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Same amount, other payment methods</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Method
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Markup
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Total payable
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(METHODS)
                    .filter(([key]) => key !== "custom")
                    .map(([key, preset]) => {
                      const converted = calc.gross * (1 + preset.markup / 100);
                      const fee = (converted * preset.fee) / 100;
                      const gst =
                        (gstTaxableValue(calc.gross) * GST_RATE) / 100 +
                        ((fee + preset.flat) * GST_RATE) / 100;
                      const total = converted + fee + preset.flat + gst;
                      return (
                        <tr key={key} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2 pr-3 font-semibold">{preset.label}</td>
                          <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                            {pct(preset.markup)}
                          </td>
                          <td className="py-2 text-right font-semibold">{money2(total)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Typical market defaults — replace them with the numbers in your own card&apos;s
              schedule of charges.
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Banks and card networks apply their own reference rate at settlement,
        which may differ from the mid-market rate at the moment you spend. Never accept
        &ldquo;dynamic currency conversion&rdquo; at a foreign terminal — being billed in rupees
        abroad usually adds another 3–7% on top of everything shown here.
      </p>
    </main>
  );
}
