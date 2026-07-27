"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Package, RotateCcw } from "lucide-react";

import { computeBatchCost, unitCostAtVolume } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");
const units = (value) => (Number.isFinite(value) ? `${INT.format(value)} units` : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  unitsStarted: "1000",
  rejectPercent: "4",
  material: "45",
  labour: "18",
  packaging: "7",
  otherVariable: "5",
  periodFixedCost: "240000",
  batchesInPeriod: "4",
  sellingPrice: "199",
  targetMarginPercent: "25",
};

const FIELDS = [
  ["unitsStarted", "Units started in the batch", "1", "1"],
  ["rejectPercent", "Reject / scrap rate (%)", "0", "0.5"],
  ["material", "Direct material per unit", "0", "1"],
  ["labour", "Direct labour per unit", "0", "1"],
  ["packaging", "Packaging per unit", "0", "1"],
  ["otherVariable", "Other variable cost per unit", "0", "1"],
  ["periodFixedCost", "Fixed overhead for the period", "0", "1000"],
  ["batchesInPeriod", "Batches sharing that overhead", "1", "1"],
  ["sellingPrice", "Selling price per unit", "0", "1"],
  ["targetMarginPercent", "Target net margin (%)", "0", "1"],
];

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => {
    const parsed = {};
    for (const key of Object.keys(DEFAULTS)) {
      const value = toNumber(form[key]);
      if (Number.isNaN(value)) return { error: "Fill every field with a valid number." };
      parsed[key] = value;
    }
    return computeBatchCost(parsed);
  }, [form]);

  const ok = !result.error;

  const volumeRows = useMemo(() => {
    if (!ok) return [];
    const base = result.goodUnits;
    return [0.5, 1, 2, 5].map((factor) => {
      const volume = Math.max(1, Math.round(base * factor));
      return { volume, cost: unitCostAtVolume(result, volume) };
    });
  }, [ok, result]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Cost Per Unit and Batch Cost",
      `Batch: ${INT.format(result.unitsStarted)} started, ${NUM.format(result.goodUnits)} good units`,
      `Variable cost per unit started: ${money(result.variablePerStarted)}`,
      `Total variable cost: ${money(result.totalVariableCost)}`,
      `Fixed overhead absorbed: ${money(result.fixedAbsorbed)}`,
      `Total batch cost: ${money(result.totalBatchCost)}`,
      `Full cost per good unit: ${money(result.fullCostPerUnit)}`,
      `  variable ${money(result.variablePerGoodUnit)} + fixed ${money(result.fixedPerGoodUnit)}`,
      `Selling price: ${money(result.sellingPrice)}`,
      `Contribution per unit: ${money(result.contributionPerUnit)} (${pct(result.contributionMarginPercent)})`,
      `Break-even: ${result.breakEvenUnits === null ? "not achievable at this price" : units(result.breakEvenUnits)}`,
      `Batch profit: ${money(result.batchProfit)} (${pct(result.netMarginPercent)} net margin)`,
      `Price for a ${pct(result.targetMarginPercent)} margin: ${money(result.suggestedPrice)}`,
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Package className="h-4 w-4" aria-hidden="true" />
          Batch costing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cost Per Unit and Batch Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Spread fixed overhead and variable costs across a production run, recover the cost of
          rejects from the units you can actually sell, and see contribution, break-even and the
          price your target margin needs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map(([key, label, min, step]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`cpu-${key}`}>
                {label}
              </label>
              <input
                id={`cpu-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={min}
                step={step}
                value={form[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
            </div>
          ))}
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
              Full cost per good unit
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.fullCostPerUnit) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM.format(result.goodUnits)} saleable of ${INT.format(result.unitsStarted)} started`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy batch costing result"
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
            ["Variable cost per unit started", ok ? money(result.variablePerStarted) : "—"],
            ["Total variable cost of the batch", ok ? money(result.totalVariableCost) : "—"],
            ["Fixed overhead absorbed by the batch", ok ? money(result.fixedAbsorbed) : "—"],
            ["Total batch cost", ok ? money(result.totalBatchCost) : "—"],
            ["Variable cost per good unit", ok ? money(result.variablePerGoodUnit) : "—"],
            ["Fixed cost per good unit", ok ? money(result.fixedPerGoodUnit) : "—"],
            ["Cost lost to rejects", ok ? money(result.scrapCost) : "—"],
            ["Contribution per unit", ok ? money(result.contributionPerUnit) : "—"],
            ["Contribution margin", ok ? pct(result.contributionMarginPercent) : "—"],
            [
              "Break-even volume",
              ok ? (result.breakEvenUnits === null ? "Never — price is below variable cost" : units(result.breakEvenUnits)) : "—",
            ],
            [
              "Margin of safety",
              ok && result.marginOfSafetyPercent !== null
                ? `${units(result.marginOfSafetyUnits)} (${pct(result.marginOfSafetyPercent)})`
                : "—",
            ],
            ["Profit per unit", ok ? money(result.profitPerUnit) : "—"],
            ["Batch revenue", ok ? money(result.batchRevenue) : "—"],
            ["Batch profit", ok ? money(result.batchProfit) : "—"],
            ["Net margin", ok ? pct(result.netMarginPercent) : "—"],
            [
              `Price needed for a ${ok ? pct(result.targetMarginPercent) : "—"} margin`,
              ok ? money(result.suggestedPrice) : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What a bigger run would cost</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Same overhead, spread over more good units.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Good units</th>
                <th scope="col" className="py-2 text-right font-semibold">Full cost per unit</th>
              </tr>
            </thead>
            <tbody>
              {volumeRows.length > 0 ? (
                volumeRows.map((row) => (
                  <tr key={row.volume} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{INT.format(row.volume)}</td>
                    <td className="py-2 text-right">{money(row.cost)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={2}>
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Costing estimates for planning. Absorption bases, inventory valuation and statutory
        disclosures should follow your accounting policy — check with your accountant before using
        these figures in statutory accounts.
      </p>
    </main>
  );
}
