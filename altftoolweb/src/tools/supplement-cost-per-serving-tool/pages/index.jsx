"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, Receipt, RotateCcw, Trash2 } from "lucide-react";

import { REFERENCE_DOSES, compareSupplements } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const CURRENCIES = [
  { code: "INR", locale: "en-IN", label: "INR ₹" },
  { code: "USD", locale: "en-US", label: "USD $" },
  { code: "EUR", locale: "en-IE", label: "EUR €" },
  { code: "GBP", locale: "en-GB", label: "GBP £" },
];

const START_PRODUCTS = [
  {
    id: 1,
    name: "Brand A blend",
    price: "1200",
    shipping: "0",
    containerAmount: "250",
    servingAmount: "3.5",
    activePerServingMg: "3000",
  },
  {
    id: 2,
    name: "Brand B pure",
    price: "900",
    shipping: "0",
    containerAmount: "300",
    servingAmount: "5",
    activePerServingMg: "5000",
  },
];

const BLANK = {
  name: "",
  price: "",
  shipping: "0",
  containerAmount: "",
  servingAmount: "",
  activePerServingMg: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [products, setProducts] = useState(START_PRODUCTS);
  const [reference, setReference] = useState("creatine");
  const [targetDose, setTargetDose] = useState("5000");
  const [perDay, setPerDay] = useState("1");
  const [currency, setCurrency] = useState("INR");
  const [copied, setCopied] = useState(false);

  const money = useMemo(() => {
    const entry = CURRENCIES.find((item) => item.code === currency) || CURRENCIES[0];
    const formatter = new Intl.NumberFormat(entry.locale, {
      style: "currency",
      currency: entry.code,
      maximumFractionDigits: 2,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : DASH);
  }, [currency]);

  const result = useMemo(
    () =>
      compareSupplements({
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          shipping: product.shipping.trim() === "" ? 0 : Number(product.shipping),
          containerAmount: Number(product.containerAmount),
          servingAmount: Number(product.servingAmount),
          activePerServingMg: Number(product.activePerServingMg),
        })),
        targetDoseMg: Number(targetDose),
        servingsPerDay: Number(perDay),
      }),
    [products, targetDose, perDay],
  );

  const hasError = Boolean(result.error);

  const updateProduct = (id, field, value) => {
    setProducts((list) =>
      list.map((product) => (product.id === id ? { ...product, [field]: value } : product)),
    );
    setCopied(false);
  };

  const addProduct = () => {
    setProducts((list) => {
      const nextId = list.reduce((max, product) => Math.max(max, product.id), 0) + 1;
      return [...list, { ...BLANK, id: nextId, name: `Product ${list.length + 1}` }];
    });
    setCopied(false);
  };

  const removeProduct = (id) => {
    setProducts((list) => (list.length <= 1 ? list : list.filter((product) => product.id !== id)));
    setCopied(false);
  };

  const applyReference = (value) => {
    setReference(value);
    const entry = REFERENCE_DOSES.find((item) => item.id === value);
    if (entry && entry.mg !== null) setTargetDose(String(entry.mg));
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Supplement comparison at ${result.targetDoseMg} mg per effective serving`,
      `Best value: ${result.bestName} at ${money(result.bestCostPerEffectiveServing)} per effective serving`,
      `Most expensive: ${result.worstName} at ${money(result.worstCostPerEffectiveServing)}`,
      `Switching saves about ${money(result.annualSaving)} a year at ${result.servingsPerDay} servings a day`,
      "",
    ];
    result.sorted.forEach((row) => {
      lines.push(
        `${row.name}: ${money(row.costPerEffectiveServing)} per effective serving, ${row.effectiveServings} servings per container`,
      );
    });
    return lines.join("\n");
  }, [hasError, result, money]);

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
    setProducts(START_PRODUCTS);
    setReference("creatine");
    setTargetDose("5000");
    setPerDay("1");
    setCurrency("INR");
    setCopied(false);
  };

  const referenceNote = REFERENCE_DOSES.find((item) => item.id === reference);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Sports nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Supplement Cost Per Serving Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A label serving is whatever the manufacturer decided. Enter the dose you actually take and
          compare products on cost per effective serving instead.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-reference">
              Reference dose
            </label>
            <select
              id="sc-reference"
              className={`mt-2 ${INPUT_CLASS}`}
              value={reference}
              onChange={(event) => applyReference(event.target.value)}
            >
              {REFERENCE_DOSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-target">
              Your dose per serving (mg of active)
            </label>
            <input
              id="sc-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.001"
              step="100"
              value={targetDose}
              onChange={(event) => {
                setTargetDose(event.target.value);
                setReference("custom");
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-perday">
              Effective servings per day
            </label>
            <input
              id="sc-perday"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="20"
              step="0.5"
              value={perDay}
              onChange={(event) => {
                setPerDay(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-currency">
              Currency
            </label>
            <select
              id="sc-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {referenceNote && (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">{referenceNote.source}</p>
        )}
      </section>

      <section className="mt-6 space-y-4">
        {products.map((product, index) => {
          const row = result.rows ? result.rows.find((item) => item.id === product.id) : null;
          return (
            <div
              key={product.id}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">Product {index + 1}</h2>
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className={GHOST_BTN}
                  aria-label={`Remove product ${index + 1}`}
                  disabled={products.length <= 1}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`sc-name-${product.id}`}>
                    Product name
                  </label>
                  <input
                    id={`sc-name-${product.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={product.name}
                    onChange={(event) => updateProduct(product.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sc-price-${product.id}`}>
                    Price
                  </label>
                  <input
                    id={`sc-price-${product.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={product.price}
                    onChange={(event) => updateProduct(product.id, "price", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sc-ship-${product.id}`}>
                    Shipping and tax
                  </label>
                  <input
                    id={`sc-ship-${product.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={product.shipping}
                    onChange={(event) => updateProduct(product.id, "shipping", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sc-container-${product.id}`}>
                    Container size (g, capsules or ml)
                  </label>
                  <input
                    id={`sc-container-${product.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={product.containerAmount}
                    onChange={(event) =>
                      updateProduct(product.id, "containerAmount", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sc-serving-${product.id}`}>
                    Label serving size (same unit)
                  </label>
                  <input
                    id={`sc-serving-${product.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={product.servingAmount}
                    onChange={(event) =>
                      updateProduct(product.id, "servingAmount", event.target.value)
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`sc-active-${product.id}`}>
                    Active ingredient per label serving (mg)
                  </label>
                  <input
                    id={`sc-active-${product.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="100"
                    value={product.activePerServingMg}
                    onChange={(event) =>
                      updateProduct(product.id, "activePerServingMg", event.target.value)
                    }
                  />
                </div>
              </div>

              {row && row.error ? (
                <p
                  role="alert"
                  className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                >
                  {row.error}
                </p>
              ) : row ? (
                <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                  {[
                    ["Cost per effective serving", money(row.costPerEffectiveServing)],
                    ["Cost per label serving", money(row.costPerLabelServing)],
                    [
                      "Servings in the container",
                      `${NUM.format(row.effectiveServings)} effective (${NUM.format(row.labelServings)} on the label)`,
                    ],
                    ["Label servings needed per dose", NUM.format(row.servingsPerDose)],
                    ["Total active in the container", `${NUM.format(row.totalActiveMg / 1000)} g`],
                    ["Cost per gram of active", money(row.costPerGramActive)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-2">
                      <dt className="text-[var(--muted-foreground)]">{label}</dt>
                      <dd className="text-right font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          );
        })}

        <button type="button" onClick={addProduct} className={GHOST_BTN} aria-label="Add another product">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add another product
        </button>
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
              Best cost per effective serving
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.bestCostPerEffectiveServing)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${result.bestName} — cheapest of ${result.comparedCount} products at ${result.targetDoseMg} mg per serving`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy supplement comparison"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the comparison" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Most expensive option", hasError ? DASH : `${result.worstName} at ${money(result.worstCostPerEffectiveServing)}`],
            [
              "Yearly saving by switching",
              hasError ? DASH : `${money(result.annualSaving)} at ${result.servingsPerDay} servings a day`,
            ],
            ["Products compared", hasError ? DASH : `${result.comparedCount} valid, ${result.invalidCount} incomplete`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Product</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per effective serving</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Premium</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Days per container</th>
                  <th scope="col" className="py-2 text-right font-semibold">Per year</th>
                </tr>
              </thead>
              <tbody>
                {result.sorted.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.name}</span>
                      {row.isBest && (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--success)]">
                          best value
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">
                      {money(row.costPerEffectiveServing)}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.premiumPct === 0 ? "—" : `+${row.premiumPct}%`}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.daysPerContainer}
                    </td>
                    <td className="py-2 text-right">{money(row.costPerYear)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Cost is only one factor. Third-party testing, ingredient form and label accuracy matter too,
        and a proprietary blend that hides per-ingredient amounts cannot be compared honestly at all.
        This is informational; ask a doctor or dietitian before starting a supplement.
      </p>
    </main>
  );
}
