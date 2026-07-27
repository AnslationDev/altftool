"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Percent, Plus, RotateCcw, Trash2 } from "lucide-react";

import { GST_SLABS, MAX_DISCOUNT_STAGES, computeCascadingDiscount } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ROWS = [
  { id: 1, value: "40" },
  { id: 2, value: "20" },
];

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [listPrice, setListPrice] = useState("2499");
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [nextId, setNextId] = useState(3);
  const [flatOff, setFlatOff] = useState("0");
  const [taxRate, setTaxRate] = useState("0");
  const [quantity, setQuantity] = useState("1");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const price = toNumber(listPrice);
    const flat = toNumber(flatOff);
    const tax = toNumber(taxRate);
    const qty = toNumber(quantity);
    const discounts = rows.map((row) => toNumber(row.value));

    if ([price, flat, tax, qty, ...discounts].some((value) => Number.isNaN(value))) {
      return { error: "Fill every field with a valid number." };
    }
    return computeCascadingDiscount({
      listPrice: price,
      discounts,
      flatOff: flat,
      taxRate: tax,
      quantity: qty,
    });
  }, [listPrice, rows, flatOff, taxRate, quantity]);

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const chain = result.steps.map((step) => `${NUM.format(step.ratePercent)}%`).join(" + ") || "none";
    return [
      "Cascading Discount Calculator",
      `List price: ${money(result.listPrice)}`,
      `Discounts applied: ${chain}`,
      `Price after discounts: ${money(result.priceAfterDiscounts)}`,
      `Flat coupon used: ${money(result.flatOffApplied)}`,
      `Net price per unit: ${money(result.netPrice)}`,
      `Effective discount: ${pct(result.effectiveDiscountPercent)}`,
      `Naive sum of discounts: ${pct(result.sumOfDiscountsPercent)}`,
      `Tax at ${pct(result.taxRate)}: ${money(result.taxAmount)}`,
      `Payable per unit: ${money(result.payablePerUnit)}`,
      `Quantity: ${result.quantity}`,
      `Total payable: ${money(result.linePayable)}`,
      `Total saved: ${money(result.lineSaved)}`,
    ].join("\n");
  }, [ok, result]);

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
    setListPrice("2499");
    setRows(DEFAULT_ROWS);
    setNextId(3);
    setFlatOff("0");
    setTaxRate("0");
    setQuantity("1");
    setCopied(false);
  };

  const addRow = () => {
    if (rows.length >= MAX_DISCOUNT_STAGES) return;
    setRows((current) => [...current, { id: nextId, value: "10" }]);
    setNextId((current) => current + 1);
  };

  const removeRow = (id) => {
    setRows((current) => (current.length <= 1 ? current : current.filter((row) => row.id !== id)));
  };

  const updateRow = (id, value) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, value } : row)));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Percent className="h-4 w-4" aria-hidden="true" />
          Stacked offers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Discount and Cascading Discount Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Successive discounts multiply, they do not add. Stack as many offers as the seller quotes,
          add a flat coupon and tax, and see the one effective discount you are actually getting.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cd-list">
              List price / MRP per unit
            </label>
            <input
              id="cd-list"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={listPrice}
              onChange={(event) => setListPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cd-qty">
              Quantity
            </label>
            <input
              id="cd-qty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Discounts, applied one after another
          </legend>
          <div className="mt-3 grid gap-3">
            {rows.map((row, index) => (
              <div key={row.id} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[var(--muted-foreground)]" htmlFor={`cd-d-${row.id}`}>
                    Offer {index + 1} (%)
                  </label>
                  <input
                    id={`cd-d-${row.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="1"
                    value={row.value}
                    onChange={(event) => updateRow(row.id, event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                  aria-label={`Remove offer ${index + 1}`}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-40 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= MAX_DISCOUNT_STAGES}
            className={`mt-3 ${GHOST_BTN} disabled:opacity-40`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add another offer
          </button>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cd-flat">
              Flat coupon off (after % offers)
            </label>
            <input
              id="cd-flat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={flatOff}
              onChange={(event) => setFlatOff(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cd-tax">
              Tax on discounted value (%)
            </label>
            <input
              id="cd-tax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={taxRate}
              onChange={(event) => setTaxRate(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {GST_SLABS.map((slab) => (
                <button
                  key={slab}
                  type="button"
                  onClick={() => setTaxRate(String(slab))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {slab}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {result.error && (
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
              Effective discount
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? pct(result.effectiveDiscountPercent) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Net ${money(result.netPrice)} per unit, down from ${money(result.listPrice)}`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy discount breakdown"
              className={`${GHOST_BTN} disabled:opacity-40`}
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
          {[
            ["Price after % offers", ok ? money(result.priceAfterDiscounts) : "—"],
            ["Flat coupon applied", ok ? money(result.flatOffApplied) : "—"],
            ["Net price per unit (pre-tax)", ok ? money(result.netPrice) : "—"],
            ["Saved per unit", ok ? money(result.totalSavedPerUnit) : "—"],
            ["If you simply added the offers", ok ? pct(result.sumOfDiscountsPercent) : "—"],
            ["Overstated by", ok ? `${pct(result.overstatedByPercent)} points` : "—"],
            ["Tax charged", ok ? `${money(result.taxAmount)} at ${pct(result.taxRate)}` : "—"],
            ["Payable per unit", ok ? money(result.payablePerUnit) : "—"],
            ["Total payable", ok ? money(result.linePayable) : "—"],
            ["Total saved", ok ? money(result.lineSaved) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.flatOffWasted > 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            {money(result.flatOffWasted)} of the coupon is unused — the price already fell to zero.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Stage by stage</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Stage</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Rate</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Off</th>
                <th scope="col" className="py-2 text-right font-semibold">Price left</th>
              </tr>
            </thead>
            <tbody>
              {ok && result.steps.length > 0 ? (
                result.steps.map((step) => (
                  <tr key={step.stage} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{step.stage}</td>
                    <td className="py-2 pr-3 text-right">{pct(step.ratePercent)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(step.amountOff)}
                    </td>
                    <td className="py-2 text-right">{money(step.priceAfter)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sellers may sequence coupons differently or cap a percentage offer in rupees. Check the final
        order summary before paying — this tool models the common percentage-then-coupon order.
      </p>
    </main>
  );
}
