"use client";

import { useMemo, useState } from "react";
import { Car, Check, Copy, RotateCcw } from "lucide-react";
import {
  EXEMPT_BUYERS,
  GOODS_TYPES,
  THRESHOLD,
  computeTcsMotorVehicle,
  firstTaxableValue,
  getGoodsType,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const INR0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money0 = (value) => (Number.isFinite(value) ? INR0.format(value) : DASH);

const DEFAULTS = {
  value: "1200000",
  goodsType: "motor-vehicle",
  panFurnished: true,
  buyerExempt: false,
  manufacturerToDealer: false,
};

const QUICK_VALUES = [900000, 1200000, 2500000, 5000000];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW = "flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]";
const CHECKBOX = "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [goodsType, setGoodsType] = useState(DEFAULTS.goodsType);
  const [panFurnished, setPanFurnished] = useState(DEFAULTS.panFurnished);
  const [buyerExempt, setBuyerExempt] = useState(DEFAULTS.buyerExempt);
  const [manufacturerToDealer, setManufacturerToDealer] = useState(DEFAULTS.manufacturerToDealer);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTcsMotorVehicle({
        saleConsideration: toNumber(value),
        goodsType,
        panFurnished,
        buyerExempt,
        manufacturerToDealer,
      }),
    [value, goodsType, panFurnished, buyerExempt, manufacturerToDealer],
  );

  const goods = getGoodsType(goodsType);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "TCS on sale — section 206C(1F)",
      `Goods: ${result.goodsLabel}`,
      `Sale consideration: ${money(result.saleConsideration)}`,
      `Threshold: value must exceed ${money0(result.threshold)}`,
      `Rate applied: ${result.appliedRate}%`,
      `TCS collected: ${money(result.tcs)}`,
      `Total the buyer pays: ${money(result.totalPayable)}`,
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
    setValue(DEFAULTS.value);
    setGoodsType(DEFAULTS.goodsType);
    setPanFurnished(DEFAULTS.panFurnished);
    setBuyerExempt(DEFAULTS.buyerExempt);
    setManufacturerToDealer(DEFAULTS.manufacturerToDealer);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Car className="h-4 w-4" aria-hidden="true" />
          Section 206C(1F)
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          TCS on Motor Vehicle Sale
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A dealer collects 1% tax at source when a car sells for more than{" "}
          {money0(THRESHOLD)}. The 1% runs on the whole invoice value, not on the excess — this
          works out the collection and what actually goes on the buyer&rsquo;s cheque.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="v-goods">
              What is being sold
            </label>
            <select
              id="v-goods"
              className={`mt-2 ${INPUT_CLASS}`}
              value={goodsType}
              onChange={(event) => setGoodsType(event.target.value)}
            >
              {GOODS_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{goods.note}</p>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="v-value">
              Sale consideration on the invoice (INR)
            </label>
            <input
              id="v-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Take the figure the dealer invoices. The exclusion of GST clarified in Circular
              17/2020 was specific to section 206C(1H), not to this sub-section.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_VALUES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={CHIP_BTN}
                  onClick={() => setValue(String(preset))}
                >
                  {money0(preset)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={CHECK_ROW} htmlFor="v-pan">
              <input
                id="v-pan"
                type="checkbox"
                className={CHECKBOX}
                checked={panFurnished}
                onChange={(event) => setPanFurnished(event.target.checked)}
              />
              Buyer has furnished a PAN
            </label>
            <p className={HINT_CLASS}>Without it, section 206CC pushes the rate to 5%.</p>
          </div>

          <div>
            <label className={CHECK_ROW} htmlFor="v-exempt">
              <input
                id="v-exempt"
                type="checkbox"
                className={CHECKBOX}
                checked={buyerExempt}
                onChange={(event) => setBuyerExempt(event.target.checked)}
              />
              Buyer is an exempt entity
            </label>
            <p className={HINT_CLASS}>Government, foreign mission, local authority or PSU carrier.</p>
          </div>

          {goods.allowsDealerCarveOut ? (
            <div className="sm:col-span-2">
              <label className={CHECK_ROW} htmlFor="v-dealer">
                <input
                  id="v-dealer"
                  type="checkbox"
                  className={CHECKBOX}
                  checked={manufacturerToDealer}
                  onChange={(event) => setManufacturerToDealer(event.target.checked)}
                />
                Sale by a manufacturer to a dealer or distributor
              </label>
              <p className={HINT_CLASS}>
                Circular 22/2016 keeps non-retail sales out of section 206C(1F).
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              TCS the seller collects
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.tcs)}
            </p>
            <p className="mt-1 max-w-prose text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the collection." : result.reason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy motor vehicle TCS result"
              className={GHOST_BTN}
              disabled={hasError}
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
          {[
            ["Rate applied", hasError ? DASH : `${result.appliedRate}%`],
            ["Statutory rate", `${result.statutoryRate ?? 1}%`],
            ["Value must exceed", money0(THRESHOLD)],
            ["Sale consideration", hasError ? DASH : money(result.saleConsideration)],
            ["Threshold crossed?", hasError ? DASH : result.thresholdCrossed ? "Yes" : "No"],
            ["TCS collected", hasError ? DASH : money(result.tcs)],
            ["Total the buyer pays", hasError ? DASH : money(result.totalPayable)],
          ].map(([label, cell]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{cell}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.thresholdCrossed && result.headroom > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
            {money(result.headroom)} of headroom left. Collection starts at{" "}
            {money(firstTaxableValue())}.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Buyers with no TCS</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {EXEMPT_BUYERS.map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. TCS is an advance collection, not an extra tax — it is
        reflected in Form 26AS and the Annual Information Statement and is credited against the
        buyer&rsquo;s income-tax liability, with any excess refunded. The seller deposits it by the
        7th of the following month and reports it in Form 27EQ. Confirm the invoice treatment with
        your dealer or tax adviser.
      </p>
    </main>
  );
}
