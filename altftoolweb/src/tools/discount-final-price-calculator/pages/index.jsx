"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Tag, Trash2 } from "lucide-react";

import { GST_SLABS, STEP_TYPES, applyDiscounts, discountFromPrices } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");
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

const DEFAULT_STEPS = [
  { id: 1, type: "percent", value: "20" },
  { id: 2, type: "percent", value: "10" },
];

const DEFAULTS = { price: "2000", taxRatePct: "18", listPrice: "2499", paidPrice: "1799" };

export default function ToolHome() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [taxRatePct, setTaxRatePct] = useState(DEFAULTS.taxRatePct);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [listPrice, setListPrice] = useState(DEFAULTS.listPrice);
  const [paidPrice, setPaidPrice] = useState(DEFAULTS.paidPrice);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      applyDiscounts({
        price: toNumber(price),
        taxRatePct: toNumber(taxRatePct),
        steps: steps.map((step) => ({
          id: String(step.id),
          type: step.type,
          value: toNumber(step.value),
        })),
      }),
    [price, taxRatePct, steps],
  );

  const reverse = useMemo(
    () => discountFromPrices({ listPrice: toNumber(listPrice), paidPrice: toNumber(paidPrice) }),
    [listPrice, paidPrice],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Discount and Final Price",
      `List price: ${money(result.price)}`,
      `Discounts applied: ${result.stages
        .map((stage) => (stage.type === "percent" ? `${NUM.format(stage.value)}%` : money(stage.value)))
        .join(" then ")}`,
      `Price after discount: ${money(result.discountedPrice)}`,
      `You save: ${money(result.totalSaved)} (${pct(result.effectiveDiscountPct)})`,
      `GST at ${pct(result.taxRatePct)}: ${money(result.tax)}`,
      `Final payable: ${money(result.finalPayable)}`,
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
    setTaxRatePct(DEFAULTS.taxRatePct);
    setSteps(DEFAULT_STEPS);
    setListPrice(DEFAULTS.listPrice);
    setPaidPrice(DEFAULTS.paidPrice);
    setCopied(false);
  };

  const updateStep = (id, patch) =>
    setSteps((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addStep = () =>
    setSteps((rows) => {
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [...rows, { id: nextId, type: "percent", value: "5" }];
    });

  const removeStep = (id) => setSteps((rows) => rows.filter((row) => row.id !== id));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Tag className="h-4 w-4" aria-hidden="true" />
          Discounts
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Discount and Final Price Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Stack percentage and flat discounts in the order the checkout applies them, add GST on the
          discounted value, and see the equivalent single discount — because 20% plus another 10% is
          28% off, not 30%.
        </p>
      </header>

      <section className={CARD} aria-labelledby="dc-inputs">
        <h2 id="dc-inputs" className="text-base font-semibold">
          Price and tax
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-price">
              List price before discount (INR)
            </label>
            <input
              id="dc-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-gst">
              GST added on the discounted price (%)
            </label>
            <input
              id="dc-gst"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={taxRatePct}
              onChange={(event) => setTaxRatePct(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {GST_SLABS.map((slab) => (
                <button
                  key={slab}
                  type="button"
                  onClick={() => setTaxRatePct(String(slab))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {slab}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="dc-steps">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="dc-steps" className="text-base font-semibold">
            Discounts, in the order they apply
          </h2>
          <button type="button" onClick={addStep} className={GHOST_BTN} aria-label="Add a discount step">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add discount
          </button>
        </div>

        {steps.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            No discounts yet — you are paying the full list price.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {steps.map((step, index) => (
              <li key={step.id} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`dc-step-type-${step.id}`}>
                      Discount {index + 1} type
                    </label>
                    <select
                      id={`dc-step-type-${step.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      value={step.type}
                      onChange={(event) => updateStep(step.id, { type: event.target.value })}
                    >
                      {STEP_TYPES.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`dc-step-value-${step.id}`}>
                      {step.type === "percent" ? "Percentage off (%)" : "Amount off (INR)"}
                    </label>
                    <input
                      id={`dc-step-value-${step.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max={step.type === "percent" ? "100" : undefined}
                      step={step.type === "percent" ? "1" : "10"}
                      value={step.value}
                      onChange={(event) => updateStep(step.id, { value: event.target.value })}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeStep(step.id)}
                  aria-label={`Remove discount ${index + 1}`}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 self-end rounded-md px-3 text-xs font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`} aria-labelledby="dc-result">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="dc-result"
              className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]"
            >
              Final payable
            </h2>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.finalPayable)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the price."
                : `${money(result.discountedPrice)} after discount plus ${money(result.tax)} GST`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the discounted price result"
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
            ["List price", hasError ? DASH : money(result.price)],
            ["Price after all discounts", hasError ? DASH : money(result.discountedPrice)],
            ["You save", hasError ? DASH : money(result.totalSaved)],
            ["Equivalent single discount", hasError ? DASH : pct(result.effectiveDiscountPct)],
            ["You are paying this much of list", hasError ? DASH : pct(result.payingPct)],
            [
              "If the percentages were simply added",
              hasError ? DASH : `${pct(result.naiveSumPct)} — overstates by ${pct(result.stackingGapPct)}`,
            ],
            ["GST", hasError ? DASH : `${money(result.tax)} at ${pct(result.taxRatePct)}`],
            ["Final payable", hasError ? DASH : money(result.finalPayable)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <>
            <div
              className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`You pay ${pct(result.payingPct)} of the list price and save ${pct(result.effectiveDiscountPct)}`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.payingPct))}%` }}
              />
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${Math.max(0, Math.min(100, result.effectiveDiscountPct))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Paying {pct(result.payingPct)} · Saving {pct(result.effectiveDiscountPct)}
            </p>
          </>
        )}

        {!hasError && result.clampedAny && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            A flat discount was larger than the price remaining at that point, so it was capped —
            the price stops at zero rather than going negative.
          </p>
        )}
      </section>

      {!hasError && result.stages.length > 0 && (
        <section className={`mt-6 ${CARD}`} aria-labelledby="dc-stages">
          <h2 id="dc-stages" className="text-base font-semibold">
            Step by step
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Step
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Before
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Taken off
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    After
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.stages.map((stage, index) => (
                  <tr key={stage.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {index + 1}.{" "}
                      {stage.type === "percent"
                        ? `${NUM.format(stage.value)}% off`
                        : `${money(stage.value)} off`}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(stage.before)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--success)]">
                      {money(stage.off)}
                    </td>
                    <td className="py-2 text-right font-semibold">{money(stage.after)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Order matters when a flat amount is mixed with a percentage: Rs 200 off then 10% leaves
            more than 10% off then Rs 200.
          </p>
        </section>
      )}

      <section className={`mt-6 ${CARD}`} aria-labelledby="dc-reverse">
        <h2 id="dc-reverse" className="text-base font-semibold">
          Work backwards from two prices
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-list">
              Marked price (INR)
            </label>
            <input
              id="dc-list"
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
            <label className={LABEL_CLASS} htmlFor="dc-paid">
              Price actually paid (INR)
            </label>
            <input
              id="dc-paid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={paidPrice}
              onChange={(event) => setPaidPrice(event.target.value)}
            />
          </div>
        </div>
        {reverse.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {reverse.error}
          </p>
        ) : (
          <p className="mt-4 text-sm">
            That is a discount of{" "}
            <strong className="text-[var(--primary)]">{pct(reverse.discountPct)}</strong> —{" "}
            {money(reverse.saved)} off, paying {pct(reverse.paidPct)} of the marked price.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Under section 15(3)(a) of the CGST Act, a discount shown on the face of the invoice is
        deducted before GST is charged, which is why tax here is calculated on the discounted value.
        Post-sale discounts follow different conditions — check the invoice for the exact treatment.
      </p>
    </main>
  );
}
