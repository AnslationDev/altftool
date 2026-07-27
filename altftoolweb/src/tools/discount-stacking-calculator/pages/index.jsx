"use client";

import { useMemo, useState } from "react";
import { Check, CircleDollarSign, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { DEFAULT_TAX_PERCENT, TAX_PRESETS, priceStack, stackLedger } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM.format(v)}%` : DASH);

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return 0;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULTS = {
  subtotal: "10000",
  percentOffs: [
    { id: "p1", label: "Sale price", percent: "20" },
    { id: "p2", label: "Extra coupon", percent: "10" },
  ],
  flatOffs: [{ id: "f1", label: "Welcome voucher", amount: "500" }],
  cardPercent: "10",
  cardCap: "1500",
  cardMinSpend: "5000",
  shippingCost: "100",
  freeShippingThreshold: "5000",
  taxPercent: String(DEFAULT_TAX_PERCENT),
  taxOnShipping: true,
  cashbackPercent: "5",
  cashbackCap: "200",
};

let seq = 10;
const nextId = (prefix) => {
  seq += 1;
  return `${prefix}${seq}`;
};

export default function ToolHome() {
  const [subtotal, setSubtotal] = useState(DEFAULTS.subtotal);
  const [percentOffs, setPercentOffs] = useState(DEFAULTS.percentOffs);
  const [flatOffs, setFlatOffs] = useState(DEFAULTS.flatOffs);
  const [cardPercent, setCardPercent] = useState(DEFAULTS.cardPercent);
  const [cardCap, setCardCap] = useState(DEFAULTS.cardCap);
  const [cardMinSpend, setCardMinSpend] = useState(DEFAULTS.cardMinSpend);
  const [shippingCost, setShippingCost] = useState(DEFAULTS.shippingCost);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(DEFAULTS.freeShippingThreshold);
  const [taxPercent, setTaxPercent] = useState(DEFAULTS.taxPercent);
  const [taxOnShipping, setTaxOnShipping] = useState(DEFAULTS.taxOnShipping);
  const [cashbackPercent, setCashbackPercent] = useState(DEFAULTS.cashbackPercent);
  const [cashbackCap, setCashbackCap] = useState(DEFAULTS.cashbackCap);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      priceStack({
        subtotal: toNumber(subtotal),
        percentOffs: percentOffs.map((o) => ({ label: o.label, percent: toNumber(o.percent) })),
        flatOffs: flatOffs.map((o) => ({ label: o.label, amount: toNumber(o.amount) })),
        cardPercent: toNumber(cardPercent),
        cardCap: toNumber(cardCap),
        cardMinSpend: toNumber(cardMinSpend),
        shippingCost: toNumber(shippingCost),
        freeShippingThreshold: toNumber(freeShippingThreshold),
        taxPercent: toNumber(taxPercent),
        taxOnShipping,
        cashbackPercent: toNumber(cashbackPercent),
        cashbackCap: toNumber(cashbackCap),
      }),
    [
      subtotal,
      percentOffs,
      flatOffs,
      cardPercent,
      cardCap,
      cardMinSpend,
      shippingCost,
      freeShippingThreshold,
      taxPercent,
      taxOnShipping,
      cashbackPercent,
      cashbackCap,
    ],
  );

  const hasError = Boolean(result.error);
  const ledger = useMemo(() => stackLedger(result), [result]);

  const reset = () => {
    setSubtotal(DEFAULTS.subtotal);
    setPercentOffs(DEFAULTS.percentOffs);
    setFlatOffs(DEFAULTS.flatOffs);
    setCardPercent(DEFAULTS.cardPercent);
    setCardCap(DEFAULTS.cardCap);
    setCardMinSpend(DEFAULTS.cardMinSpend);
    setShippingCost(DEFAULTS.shippingCost);
    setFreeShippingThreshold(DEFAULTS.freeShippingThreshold);
    setTaxPercent(DEFAULTS.taxPercent);
    setTaxOnShipping(DEFAULTS.taxOnShipping);
    setCashbackPercent(DEFAULTS.cashbackPercent);
    setCashbackCap(DEFAULTS.cashbackCap);
    setCopied(false);
  };

  const copy = async () => {
    if (hasError) return;
    const lines = [
      `Effective cost after cashback: ${money(result.effective)}`,
      `Amount payable at checkout: ${money(result.payable)}`,
      `Total saved vs list price: ${money(result.saved)} (${pct(result.savedPercent)})`,
      `Combined percentage offers: ${pct(result.combinedPercent)}`,
      "",
      ...ledger.map((s) => `${s.label}: ${money(s.running)}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const patchPercent = (id, patch) =>
    setPercentOffs((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const patchFlat = (id, patch) =>
    setFlatOffs((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <CircleDollarSign className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Discount Stacking Calculator
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Stack a sale price, coupons, a card offer, shipping, tax and cashback in the order shops
          actually apply them, and see what the basket really costs.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="subtotal">
            Basket subtotal before offers (₹)
          </label>
          <input
            id="subtotal"
            className={`${INPUT_CLASS} mt-1`}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={subtotal}
            onChange={(e) => setSubtotal(e.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="tax-percent">
            Tax rate
          </label>
          <select
            id="tax-percent"
            className={`${INPUT_CLASS} mt-1`}
            value={taxPercent}
            onChange={(e) => setTaxPercent(e.target.value)}
          >
            {TAX_PRESETS.map((t) => (
              <option key={t.percent} value={String(t.percent)}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section aria-labelledby="pct-heading" className="mt-6">
        <h2 id="pct-heading" className="mb-2 text-sm font-semibold text-[var(--foreground)]">
          Percentage offers (these multiply)
        </h2>
        <div className="space-y-3">
          {percentOffs.map((o, i) => (
            <div key={o.id} className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
              <div>
                <label className="sr-only" htmlFor={`plabel-${o.id}`}>
                  Percentage offer {i + 1} name
                </label>
                <input
                  id={`plabel-${o.id}`}
                  className={INPUT_CLASS}
                  type="text"
                  placeholder="Offer name"
                  value={o.label}
                  onChange={(e) => patchPercent(o.id, { label: e.target.value })}
                />
              </div>
              <div>
                <label className="sr-only" htmlFor={`ppct-${o.id}`}>
                  Percentage offer {i + 1} value in percent
                </label>
                <input
                  id={`ppct-${o.id}`}
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="any"
                  value={o.percent}
                  onChange={(e) => patchPercent(o.id, { percent: e.target.value })}
                />
              </div>
              <button
                type="button"
                className={`${GHOST_BTN} px-3`}
                onClick={() => setPercentOffs((prev) => prev.filter((x) => x.id !== o.id))}
                aria-label={`Remove percentage offer ${o.label || i + 1}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={`${GHOST_BTN} mt-3`}
          onClick={() =>
            setPercentOffs((prev) => [...prev, { id: nextId("p"), label: "", percent: "0" }])
          }
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add percentage offer
        </button>
      </section>

      <section aria-labelledby="flat-heading" className="mt-6">
        <h2 id="flat-heading" className="mb-2 text-sm font-semibold text-[var(--foreground)]">
          Flat-amount coupons (applied last)
        </h2>
        <div className="space-y-3">
          {flatOffs.map((o, i) => (
            <div key={o.id} className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
              <div>
                <label className="sr-only" htmlFor={`flabel-${o.id}`}>
                  Flat coupon {i + 1} name
                </label>
                <input
                  id={`flabel-${o.id}`}
                  className={INPUT_CLASS}
                  type="text"
                  placeholder="Coupon name"
                  value={o.label}
                  onChange={(e) => patchFlat(o.id, { label: e.target.value })}
                />
              </div>
              <div>
                <label className="sr-only" htmlFor={`famt-${o.id}`}>
                  Flat coupon {i + 1} amount in rupees
                </label>
                <input
                  id={`famt-${o.id}`}
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={o.amount}
                  onChange={(e) => patchFlat(o.id, { amount: e.target.value })}
                />
              </div>
              <button
                type="button"
                className={`${GHOST_BTN} px-3`}
                onClick={() => setFlatOffs((prev) => prev.filter((x) => x.id !== o.id))}
                aria-label={`Remove flat coupon ${o.label || i + 1}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={`${GHOST_BTN} mt-3`}
          onClick={() => setFlatOffs((prev) => [...prev, { id: nextId("f"), label: "", amount: "0" }])}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add flat coupon
        </button>
      </section>

      <section aria-labelledby="card-heading" className="mt-6">
        <h2 id="card-heading" className="mb-2 text-sm font-semibold text-[var(--foreground)]">
          Card / bank offer
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="card-percent">
              Instant discount (%)
            </label>
            <input
              id="card-percent"
              className={`${INPUT_CLASS} mt-1`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="any"
              value={cardPercent}
              onChange={(e) => setCardPercent(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="card-cap">
              Maximum discount (₹, 0 = no cap)
            </label>
            <input
              id="card-cap"
              className={`${INPUT_CLASS} mt-1`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={cardCap}
              onChange={(e) => setCardCap(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="card-min">
              Minimum spend to qualify (₹)
            </label>
            <input
              id="card-min"
              className={`${INPUT_CLASS} mt-1`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={cardMinSpend}
              onChange={(e) => setCardMinSpend(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="ship-heading" className="mt-6">
        <h2 id="ship-heading" className="mb-2 text-sm font-semibold text-[var(--foreground)]">
          Shipping and cashback
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ship-cost">
              Shipping charge (₹)
            </label>
            <input
              id="ship-cost"
              className={`${INPUT_CLASS} mt-1`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ship-free">
              Free shipping above (₹, 0 = never)
            </label>
            <input
              id="ship-free"
              className={`${INPUT_CLASS} mt-1`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cash-percent">
              Cashback (%)
            </label>
            <input
              id="cash-percent"
              className={`${INPUT_CLASS} mt-1`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="any"
              value={cashbackPercent}
              onChange={(e) => setCashbackPercent(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cash-cap">
              Cashback cap (₹, 0 = no cap)
            </label>
            <input
              id="cash-cap"
              className={`${INPUT_CLASS} mt-1`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={cashbackCap}
              onChange={(e) => setCashbackCap(e.target.value)}
            />
          </div>
        </div>
        <label className="mt-3 flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="tax-ship">
          <input
            id="tax-ship"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={taxOnShipping}
            onChange={(e) => setTaxOnShipping(e.target.checked)}
          />
          Shipping is taxable
        </label>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className={PRIMARY_BTN} onClick={copy} aria-label="Copy the stacked price breakdown to clipboard">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy result"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={reset}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {hasError ? (
        <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section
        aria-labelledby="result-heading"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <h2 id="result-heading" className="text-sm font-semibold text-[var(--muted-foreground)]">
          Effective cost after cashback
        </h2>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--foreground)]">
          {hasError ? DASH : money(result.effective)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError ? DASH : `You pay ${money(result.payable)} at checkout, then ${money(result.cashback)} comes back.`}
        </p>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Total saved vs list</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">{hasError ? DASH : money(result.saved)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Saving as a share of list</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">{hasError ? DASH : pct(result.savedPercent)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Combined percentage offers</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">{hasError ? DASH : pct(result.combinedPercent)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Discount on merchandise</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {hasError ? DASH : pct(result.effectiveDiscountPercent)}
            </dd>
          </div>
        </dl>

        {!hasError ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.orderingPenalty > 0 ? (
              <li>
                Apply the flat coupon <strong className="text-[var(--foreground)]">after</strong> the percentage
                offers — the other way round costs you {money(result.orderingPenalty)} more.
              </li>
            ) : null}
            {!result.cardQualified && Number(cardPercent) > 0 ? (
              <li>The basket is below the card offer&apos;s minimum spend, so no instant discount applies.</li>
            ) : null}
            {result.cardCapped ? <li>The card offer hit its cap, so a bigger basket earns no extra instant discount.</li> : null}
            {result.cashbackCapped ? <li>Cashback hit its cap.</li> : null}
            {result.flatWasted > 0 ? (
              <li>{money(result.flatWasted)} of coupon value is wasted — the coupons exceed the discounted basket.</li>
            ) : null}
            {result.shortOfFreeShipping > 0 ? (
              <li>Add {money(result.shortOfFreeShipping)} more to clear the free-shipping threshold.</li>
            ) : null}
          </ul>
        ) : null}
      </section>

      <section aria-labelledby="ledger-heading" className="mt-6">
        <h2 id="ledger-heading" className="mb-3 text-sm font-semibold text-[var(--foreground)]">
          Step by step
        </h2>
        <div className="overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)]">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <caption className="sr-only">Running total after each stage of the discount stack</caption>
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">Stage</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">Change</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">Running total</th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]" colSpan={3}>{DASH}</td>
                </tr>
              ) : (
                ledger.map((step) => (
                  <tr key={step.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 text-[var(--foreground)]">{step.label}</td>
                    <td
                      className={`px-4 py-3 text-right ${
                        step.delta < 0 ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {step.delta === 0 ? DASH : money(step.delta)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">
                      {money(step.running)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs text-[var(--muted-foreground)]">
        Retailers vary in whether a card offer applies before or after coupons, and whether tax is
        charged on the pre- or post-discount price. Check the offer terms before you count on the total.
      </p>
    </div>
  );
}
