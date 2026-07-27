"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, RotateCcw } from "lucide-react";

import {
  HOUSE_PROPERTY_LOSS_SETOFF_CAP,
  LOSS_CARRY_FORWARD_YEARS,
  TAX_SLAB_OPTIONS,
  computeRentalYield,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : DASH);

const DEFAULTS = {
  purchasePrice: "8000000",
  acquisitionCosts: "600000",
  monthlyRent: "25000",
  vacancyWeeks: "4",
  annualMaintenance: "36000",
  annualPropertyTax: "12000",
  annualInsurance: "4000",
  managementFeePct: "0",
  annualLoanInterest: "0",
  taxSlabPct: "30",
  annualAppreciationPct: "5",
};

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const FIELDS = [
  { key: "purchasePrice", id: "pry-price", label: "Property purchase price (INR)", step: "50000" },
  {
    key: "acquisitionCosts",
    id: "pry-costs",
    label: "Stamp duty, registration, brokerage, interiors (INR)",
    step: "10000",
  },
  { key: "monthlyRent", id: "pry-rent", label: "Monthly rent received (INR)", step: "500" },
  { key: "vacancyWeeks", id: "pry-vacancy", label: "Vacant weeks per year", step: "1", max: "52" },
  {
    key: "annualMaintenance",
    id: "pry-maint",
    label: "Society charges + repairs per year (INR)",
    step: "1000",
  },
  {
    key: "annualPropertyTax",
    id: "pry-proptax",
    label: "Municipal property tax paid per year (INR)",
    step: "500",
  },
  { key: "annualInsurance", id: "pry-ins", label: "Property insurance per year (INR)", step: "500" },
  {
    key: "managementFeePct",
    id: "pry-mgmt",
    label: "Property management fee (% of rent)",
    step: "0.5",
    max: "100",
  },
  {
    key: "annualLoanInterest",
    id: "pry-interest",
    label: "Home loan interest paid per year (INR)",
    step: "10000",
  },
  {
    key: "annualAppreciationPct",
    id: "pry-appreciation",
    label: "Expected capital appreciation (% per year)",
    step: "0.5",
  },
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => {
    const parsed = {};
    for (const key of Object.keys(DEFAULTS)) {
      const value = toNumber(form[key]);
      if (Number.isNaN(value)) return { error: "Fill every field with a valid number." };
      parsed[key] = value;
    }
    return computeRentalYield(parsed);
  }, [form]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Property Yield and Rental Return",
      `Total capital deployed: ${money(result.totalInvestment)}`,
      `Contracted annual rent: ${money(result.contractedAnnualRent)}`,
      `Rent collected after vacancy: ${money(result.collectedRent)}`,
      `Operating expenses: ${money(result.operatingExpenses)}`,
      `Net operating income: ${money(result.netOperatingIncome)}`,
      `Income from house property: ${money(result.housePropertyIncome)}`,
      `Tax on rental income: ${money(result.taxPayable)}`,
      `Tax saved by set-off of loss: ${money(result.taxSaved)}`,
      `Net income after tax: ${money(result.netIncomeAfterTax)}`,
      `Gross yield: ${pct(result.grossYield)}`,
      `Net yield before tax: ${pct(result.netYieldBeforeTax)}`,
      `Net yield after tax: ${pct(result.netYieldAfterTax)}`,
      `Net yield + appreciation: ${pct(result.totalReturnWithAppreciation)}`,
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const show = (key, formatter) => (hasError ? DASH : formatter(result[key]));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Property India
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Property Yield and Rental Return Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Gross yield is the easy number. This works out what the flat actually returns after vacant
          months, society charges, municipal tax and income tax on house property.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                step={field.step}
                max={field.max}
                value={form[field.key]}
                onChange={setField(field.key)}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="pry-slab">
              Your income tax slab rate (%)
            </label>
            <select
              id="pry-slab"
              className={INPUT_CLASS}
              value={form.taxSlabPct}
              onChange={setField("taxSlabPct")}
            >
              {TAX_SLAB_OPTIONS.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {rate}%
                </option>
              ))}
            </select>
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
              Net rental yield after tax
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show("netYieldAfterTax", pct)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Gross yield {show("grossYield", pct)} on a purchase price of{" "}
              {hasError ? DASH : money(toNumber(form.purchasePrice))}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy rental yield result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total capital deployed", show("totalInvestment", money)],
            ["Contracted annual rent", show("contractedAnnualRent", money)],
            ["Vacancy loss", show("vacancyLoss", money)],
            ["Rent actually collected", show("collectedRent", money)],
            ["Operating expenses (society, tax, insurance, management)", show("operatingExpenses", money)],
            ["Expense ratio of collected rent", show("expenseRatio", pct)],
            ["Net operating income", show("netOperatingIncome", money)],
            ["Net income after tax", show("netIncomeAfterTax", money)],
            ["Monthly net income after tax", show("monthlyNetIncomeAfterTax", money)],
            ["Effective gross yield (after vacancy)", show("effectiveGrossYield", pct)],
            ["Net yield before tax", show("netYieldBeforeTax", pct)],
            ["Net yield + expected appreciation", show("totalReturnWithAppreciation", pct)],
            [
              "Years to recover capital from rent alone",
              hasError || result.paybackYears == null
                ? DASH
                : `${NUM.format(result.paybackYears)} years`,
            ],
            [
              "Price as a multiple of monthly rent",
              hasError || result.rentToPriceMonths == null
                ? DASH
                : `${NUM.format(result.rentToPriceMonths)} months of rent`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Income from house property</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Sections 23 and 24 of the Income-tax Act, 1961 — municipal tax paid is deducted first, then
          a flat 30% standard deduction, then home loan interest.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <tbody>
              {[
                ["Gross Annual Value (rent received)", show("grossAnnualValue", money)],
                ["Less: municipal property tax paid", show("annualPropertyTax", money)],
                ["Net Annual Value", show("netAnnualValue", money)],
                ["Less: 30% standard deduction, Section 24(a)", show("standardDeduction", money)],
                ["Less: home loan interest, Section 24(b)", show("annualLoanInterest", money)],
                ["Income / (loss) from house property", show("housePropertyIncome", money)],
                ["Tax payable at your slab", show("taxPayable", money)],
                ["Loss set off against other income this year", show("allowableLossThisYear", money)],
                ["Loss carried forward", show("lossCarriedForward", money)],
                ["Tax saved by the set-off", show("taxSaved", money)],
                ["Cash flow after loan interest", show("cashFlowAfterInterest", money)],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <th scope="row" className="py-2 pr-3 font-normal text-[var(--muted-foreground)]">
                    {label}
                  </th>
                  <td className="py-2 text-right font-semibold">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          A house-property loss can be set off against your other income only up to{" "}
          {INR.format(HOUSE_PROPERTY_LOSS_SETOFF_CAP)} a year under Section 71(3A); the balance
          carries forward for up to {LOSS_CARRY_FORWARD_YEARS} assessment years.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimates only. Yield ignores GST on commercial rent, TDS under Section 194-IB,
        capital gains on exit and society transfer charges. Confirm your own position with a
        chartered accountant before filing.
      </p>
    </main>
  );
}
