"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Package, Plus, RotateCcw, Trash2 } from "lucide-react";

import { GST_SLABS, MODES, priceBulkOrder } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const INR4 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 4,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const COUNT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const unitMoney = (value) => INR4.format(Number.isFinite(value) ? value : 0);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");
const count = (value) => (Number.isFinite(value) ? COUNT.format(value) : "—");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULT_TIERS = [
  { id: 1, minQty: "1", unitPrice: "100" },
  { id: 2, minQty: "10", unitPrice: "90" },
  { id: 3, minQty: "50", unitPrice: "80" },
];

const DEFAULTS = {
  quantity: "48",
  mode: "flat",
  shippingFlat: "200",
  freeShippingAbove: "5000",
  gstRatePct: "18",
};

export default function ToolHome() {
  const [quantity, setQuantity] = useState(DEFAULTS.quantity);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [shippingFlat, setShippingFlat] = useState(DEFAULTS.shippingFlat);
  const [freeShippingAbove, setFreeShippingAbove] = useState(DEFAULTS.freeShippingAbove);
  const [gstRatePct, setGstRatePct] = useState(DEFAULTS.gstRatePct);
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      priceBulkOrder({
        quantity: toNumber(quantity),
        mode,
        shippingFlat: toNumber(shippingFlat),
        freeShippingAbove: toNumber(freeShippingAbove),
        gstRatePct: toNumber(gstRatePct),
        tiers: tiers.map((tier) => ({
          id: String(tier.id),
          minQty: toNumber(tier.minQty),
          unitPrice: toNumber(tier.unitPrice),
        })),
      }),
    [quantity, mode, shippingFlat, freeShippingAbove, gstRatePct, tiers],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Bulk order pricing",
      `Quantity: ${count(result.quantity)} units`,
      `Pricing: ${MODES.find((m) => m.id === result.mode)?.label}`,
      `Goods value: ${money(result.goodsValue)}`,
      `Effective price per unit: ${unitMoney(result.effectiveUnitPriceExTax)}`,
      `Shipping: ${money(result.shipping)}`,
      `GST at ${pct(result.gstRatePct)}: ${money(result.gst)}`,
      `Order total: ${money(result.total)}`,
      `Landed cost per unit: ${unitMoney(result.effectiveUnitPriceLanded)}`,
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
    setQuantity(DEFAULTS.quantity);
    setMode(DEFAULTS.mode);
    setShippingFlat(DEFAULTS.shippingFlat);
    setFreeShippingAbove(DEFAULTS.freeShippingAbove);
    setGstRatePct(DEFAULTS.gstRatePct);
    setTiers(DEFAULT_TIERS);
    setCopied(false);
  };

  const updateTier = (id, patch) =>
    setTiers((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addTier = () =>
    setTiers((rows) => {
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      const highest = rows.reduce((max, row) => Math.max(max, toNumber(row.minQty) || 0), 0);
      return [...rows, { id: nextId, minQty: String(highest * 2 || 1), unitPrice: "0" }];
    });

  const removeTier = (id) => setTiers((rows) => rows.filter((row) => row.id !== id));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Package className="h-4 w-4" aria-hidden="true" />
          Volume pricing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Bulk Order Discount Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your supplier&apos;s quantity breaks and see what an order really costs per unit —
          including the cases where ordering a few more units makes the whole order cheaper.
        </p>
      </header>

      <section className={CARD} aria-labelledby="bo-order">
        <h2 id="bo-order" className="text-base font-semibold">
          The order
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bo-qty">
              Quantity (units)
            </label>
            <input
              id="bo-qty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bo-gst">
              GST on goods and freight (%)
            </label>
            <input
              id="bo-gst"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={gstRatePct}
              onChange={(event) => setGstRatePct(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {GST_SLABS.map((slab) => (
                <button
                  key={slab}
                  type="button"
                  onClick={() => setGstRatePct(String(slab))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {slab}%
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bo-ship">
              Shipping / freight (INR)
            </label>
            <input
              id="bo-ship"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={shippingFlat}
              onChange={(event) => setShippingFlat(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bo-free">
              Free shipping above goods value (INR)
            </label>
            <input
              id="bo-free"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={freeShippingAbove}
              onChange={(event) => setFreeShippingAbove(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Set 0 if freight is always charged.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          {MODES.map((option) => (
            <label
              key={option.id}
              htmlFor={`bo-mode-${option.id}`}
              className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                mode === option.id
                  ? "border-[var(--primary)] bg-[var(--muted)]"
                  : "border-[var(--border)]"
              }`}
            >
              <input
                id={`bo-mode-${option.id}`}
                type="radio"
                name="bo-mode"
                className="mt-1 h-4 w-4 accent-[var(--primary)]"
                checked={mode === option.id}
                onChange={() => setMode(option.id)}
              />
              <span>
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                  {option.hint}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="bo-tiers">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="bo-tiers" className="text-base font-semibold">
            Quantity breaks
          </h2>
          <button type="button" onClick={addTier} className={GHOST_BTN} aria-label="Add a price tier">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add tier
          </button>
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          The first tier must start at quantity 1. Tiers are sorted automatically.
        </p>

        <ul className="mt-4 space-y-3">
          {tiers.map((tier, index) => (
            <li key={tier.id} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`bo-tier-min-${tier.id}`}>
                    Tier {index + 1} starts at quantity
                  </label>
                  <input
                    id={`bo-tier-min-${tier.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={tier.minQty}
                    onChange={(event) => updateTier(tier.id, { minQty: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`bo-tier-price-${tier.id}`}>
                    Unit price (INR)
                  </label>
                  <input
                    id={`bo-tier-price-${tier.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={tier.unitPrice}
                    onChange={(event) => updateTier(tier.id, { unitPrice: event.target.value })}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeTier(tier.id)}
                aria-label={`Remove tier ${index + 1}`}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 self-end rounded-md px-3 text-xs font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`} aria-labelledby="bo-result" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="bo-result"
              className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]"
            >
              Effective cost per unit
            </h2>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : unitMoney(result.effectiveUnitPriceExTax)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the pricing."
                : `${count(result.quantity)} units · order total ${money(result.total)} · landed ${unitMoney(result.effectiveUnitPriceLanded)} a unit`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the bulk order pricing result"
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
          {[
            ["Goods value", hasError ? DASH : money(result.goodsValue)],
            [
              "At the base tier price",
              hasError ? DASH : `${money(result.undiscounted)} (${unitMoney(result.tiers[0].unitPrice)} a unit)`,
            ],
            [
              "Volume saving",
              hasError ? DASH : `${money(result.saving)} (${pct(result.savingPct)})`,
            ],
            [
              "Shipping",
              hasError
                ? DASH
                : result.shippingWaived
                  ? "Waived — order value is above the free-shipping threshold"
                  : money(result.shipping),
            ],
            ["Value GST is charged on", hasError ? DASH : money(result.taxableValue)],
            [`GST at ${hasError ? "—" : pct(result.gstRatePct)}`, hasError ? DASH : money(result.gst)],
            ["Order total", hasError ? DASH : money(result.total)],
            ["Landed cost per unit", hasError ? DASH : unitMoney(result.effectiveUnitPriceLanded)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.cheaperUpgrade && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            Ordering {count(result.cheaperUpgrade.extraUnits)} more units — {count(result.cheaperUpgrade.quantity)}{" "}
            in total — drops the goods value to {money(result.cheaperUpgrade.goodsValue)}, which is{" "}
            {money(result.cheaperUpgrade.saves)} <strong>less</strong> for more stock.
          </p>
        )}

        {!hasError && !result.cheaperUpgrade && result.nextTier && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            The next break is at {count(result.nextTier.minQty)} units —{" "}
            {count(result.nextTier.unitsAway)} more — where the rate falls to{" "}
            {unitMoney(result.nextTier.unitPrice)} a unit.
          </p>
        )}
      </section>

      {!hasError && (
        <section className={`mt-6 ${CARD}`} aria-labelledby="bo-bands">
          <h2 id="bo-bands" className="text-base font-semibold">
            How the price list applies
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Band
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Unit price
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Units charged
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.bands.map((band) => (
                  <tr key={band.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {count(band.minQty)}
                      {band.maxQty === null ? "+" : `–${count(band.maxQty)}`}
                    </td>
                    <td className="py-2 pr-3 text-right">{unitMoney(band.unitPrice)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {count(band.units)}
                    </td>
                    <td className="py-2 text-right font-semibold">{money(band.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            {result.mode === "flat"
              ? "Flat pricing: the whole order takes the rate of the band the quantity reaches, so only one band carries units."
              : "Graduated pricing: each band charges only the units that fall inside it, so several bands carry units at once."}
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Freight charged by a supplier forms part of the value of supply under section 15(2)(c) of
        the CGST Act, which is why GST here is calculated on goods plus shipping. Confirm the exact
        tier structure with your supplier — some quote flat rates and others quote slab rates for the
        same price list.
      </p>
    </main>
  );
}
