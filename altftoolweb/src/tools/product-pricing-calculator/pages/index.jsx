"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tag } from "lucide-react";

import {
  ROUNDING_STRATEGIES,
  TAX_PRESETS,
  breakEvenUnits,
  buildMarginLadder,
  buildUnitCost,
  evaluatePrice,
  priceForMargin,
  roundToPricePoint,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const CURRENCY_LOCALES = {
  INR: "en-IN", USD: "en-US", EUR: "en-IE", GBP: "en-GB",
  AED: "en-AE", SGD: "en-SG", AUD: "en-AU", CAD: "en-CA",
};

const DEFAULTS = {
  currency: "INR",
  materials: "40",
  labour: "15",
  packaging: "5",
  shipping: "8",
  other: "2",
  overheadPerMonth: "12000",
  unitsPerMonth: "800",
  margin: "40",
  commission: "15",
  tax: "18",
  rounding: "charm99",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [materials, setMaterials] = useState(DEFAULTS.materials);
  const [labour, setLabour] = useState(DEFAULTS.labour);
  const [packaging, setPackaging] = useState(DEFAULTS.packaging);
  const [shipping, setShipping] = useState(DEFAULTS.shipping);
  const [other, setOther] = useState(DEFAULTS.other);
  const [overheadPerMonth, setOverheadPerMonth] = useState(DEFAULTS.overheadPerMonth);
  const [unitsPerMonth, setUnitsPerMonth] = useState(DEFAULTS.unitsPerMonth);
  const [margin, setMargin] = useState(DEFAULTS.margin);
  const [commission, setCommission] = useState(DEFAULTS.commission);
  const [tax, setTax] = useState(DEFAULTS.tax);
  const [rounding, setRounding] = useState(DEFAULTS.rounding);
  const [copied, setCopied] = useState(false);

  const money = useMemo(() => {
    const locale = CURRENCY_LOCALES[currency] ?? "en-US";
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [currency]);

  const pct = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }), []);
  const int = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }), []);

  const cost = useMemo(
    () =>
      buildUnitCost({
        materials: toNumber(materials),
        labour: toNumber(labour),
        packaging: toNumber(packaging),
        shipping: toNumber(shipping),
        other: toNumber(other),
        overheadPerMonth: toNumber(overheadPerMonth),
        unitsPerMonth: toNumber(unitsPerMonth),
      }),
    [materials, labour, packaging, shipping, other, overheadPerMonth, unitsPerMonth],
  );

  const targetPrice = useMemo(() => {
    if (cost.error) return { error: cost.error };
    return priceForMargin({
      unitCost: cost.unitCost,
      targetMarginPercent: toNumber(margin),
      commissionPercent: toNumber(commission),
    });
  }, [cost, margin, commission]);

  const rounded = useMemo(() => {
    if (targetPrice.error) return { error: targetPrice.error };
    return roundToPricePoint(targetPrice.price, rounding);
  }, [targetPrice, rounding]);

  const outcome = useMemo(() => {
    if (cost.error || rounded.error) return { error: cost.error ?? rounded.error };
    return evaluatePrice({
      unitCost: cost.unitCost,
      netPrice: rounded.price,
      commissionPercent: toNumber(commission),
      taxPercent: toNumber(tax),
    });
  }, [cost, rounded, commission, tax]);

  const breakEven = useMemo(() => {
    if (cost.error || outcome.error) return { error: cost.error ?? outcome.error };
    return breakEvenUnits({
      fixedCosts: toNumber(overheadPerMonth),
      netReceivedPerUnit: outcome.netReceived,
      variableCostPerUnit: cost.variableCost,
    });
  }, [cost, outcome, overheadPerMonth]);

  const ladder = useMemo(() => {
    if (cost.error) return [];
    return buildMarginLadder({
      unitCost: cost.unitCost,
      commissionPercent: toNumber(commission),
      taxPercent: toNumber(tax),
    });
  }, [cost, commission, tax]);

  const error = cost.error || targetPrice.error || outcome.error || null;
  const ok = !error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Product pricing",
      `Unit cost: ${money(cost.unitCost)} (variable ${money(cost.variableCost)} + overhead ${money(cost.overheadPerUnit)})`,
      `Target margin: ${pct.format(toNumber(margin))}% after ${pct.format(toNumber(commission))}% commission`,
      `Price before tax: ${money(outcome.netPrice)}`,
      `Tax: ${money(outcome.tax)}`,
      `Shelf price including tax: ${money(outcome.grossPrice)}`,
      `Commission: ${money(outcome.commission)}`,
      `Profit per unit: ${money(outcome.profit)}`,
      `Margin achieved: ${pct.format(outcome.marginPercent)}%`,
      breakEven.error ? null : `Break-even: ${int.format(breakEven.units)} units a month`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, cost, money, pct, margin, commission, outcome, breakEven, int]);

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
    setCurrency(DEFAULTS.currency);
    setMaterials(DEFAULTS.materials);
    setLabour(DEFAULTS.labour);
    setPackaging(DEFAULTS.packaging);
    setShipping(DEFAULTS.shipping);
    setOther(DEFAULTS.other);
    setOverheadPerMonth(DEFAULTS.overheadPerMonth);
    setUnitsPerMonth(DEFAULTS.unitsPerMonth);
    setMargin(DEFAULTS.margin);
    setCommission(DEFAULTS.commission);
    setTax(DEFAULTS.tax);
    setRounding(DEFAULTS.rounding);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Tag className="h-4 w-4" aria-hidden="true" />
          Pricing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Product Pricing Calculator with Taxes</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build the landed unit cost, set the margin you want to keep after a marketplace takes its
          cut, add tax, then round to a price point — and see the margin you actually end up with.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Unit cost</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-materials">Materials</label>
            <input id="pp-materials" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={materials} onChange={(e) => setMaterials(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-labour">Labour</label>
            <input id="pp-labour" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={labour} onChange={(e) => setLabour(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-packaging">Packaging</label>
            <input id="pp-packaging" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={packaging} onChange={(e) => setPackaging(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-shipping">Inbound shipping per unit</label>
            <input id="pp-shipping" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={shipping} onChange={(e) => setShipping(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-other">Other direct cost</label>
            <input id="pp-other" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={other} onChange={(e) => setOther(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-currency">Currency</label>
            <select id="pp-currency" className={`mt-2 ${INPUT_CLASS}`} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {Object.keys(CURRENCY_LOCALES).map((code) => (<option key={code} value={code}>{code}</option>))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-overhead">Fixed overhead a month</label>
            <input id="pp-overhead" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="100" value={overheadPerMonth} onChange={(e) => setOverheadPerMonth(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-units">Units sold a month</label>
            <input id="pp-units" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" step="10" value={unitsPerMonth} onChange={(e) => setUnitsPerMonth(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Margin, commission and tax</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-margin">Target gross margin (% of price)</label>
            <input id="pp-margin" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="99" step="1" value={margin} onChange={(e) => setMargin(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-commission">Marketplace commission (%)</label>
            <input id="pp-commission" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="99" step="0.5" value={commission} onChange={(e) => setCommission(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-tax">Sales tax / VAT / GST (%)</label>
            <input id="pp-tax" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" step="0.5" value={tax} onChange={(e) => setTax(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-rounding">Round the price to</label>
            <select id="pp-rounding" className={`mt-2 ${INPUT_CLASS}`} value={rounding} onChange={(e) => setRounding(e.target.value)}>
              {Object.values(ROUNDING_STRATEGIES).map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {TAX_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setTax(String(preset.percent))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Shelf price including tax
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(outcome.grossPrice) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${money(outcome.netPrice)} before tax · margin achieved ${pct.format(outcome.marginPercent)}%` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the pricing breakdown" className={GHOST_BTN} disabled={!summary}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy pricing"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && outcome.belowCost && (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            After commission this price sits below cost — every unit loses {money(Math.abs(outcome.profit))}.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Variable cost per unit", ok ? money(cost.variableCost) : DASH],
            ["Overhead absorbed per unit", ok ? money(cost.overheadPerUnit) : DASH],
            ["Total unit cost", ok ? money(cost.unitCost) : DASH],
            ["Calculated price before rounding", targetPrice.error ? DASH : money(targetPrice.price)],
            ["Price before tax", ok ? money(outcome.netPrice) : DASH],
            ["Marketplace commission", ok ? `-${money(outcome.commission)}` : DASH],
            ["You receive per unit", ok ? money(outcome.netReceived) : DASH],
            ["Tax collected", ok ? money(outcome.tax) : DASH],
            ["Profit per unit", ok ? money(outcome.profit) : DASH],
            ["Markup on cost", ok ? `${pct.format(outcome.markupPercent)}%` : DASH],
            ["Break-even volume a month", breakEven.error ? DASH : `${int.format(breakEven.units)} units`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ladder.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where other margins would put the price</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Target margin</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Before tax</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Shelf price</th>
                  <th scope="col" className="py-2 text-right font-semibold">Profit / unit</th>
                </tr>
              </thead>
              <tbody>
                {ladder.map((row) => (
                  <tr key={row.targetMarginPercent} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.targetMarginPercent}%</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{money(row.netPrice)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.grossPrice)}</td>
                    <td className="py-2 text-right font-semibold">{money(row.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Tax rates vary by product category and by where the customer is, and
        marketplaces often charge referral, closing and fulfilment fees on top of the headline
        commission — check your seller agreement and take advice from a qualified accountant before
        setting prices.
      </p>
    </main>
  );
}
