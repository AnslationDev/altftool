"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scissors } from "lucide-react";

import { FIXED_COST_LINES, computeSalonBusiness } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const AGE_GROUPS = [
  { value: "below60", label: "Under 60" },
  { value: "senior", label: "60 to 79 (senior citizen)" },
  { value: "superSenior", label: "80 and above" },
];

const CAPACITY_FIELDS = [
  ["chairs", "Working chairs / beds", "1", "1", undefined],
  ["clientsPerChairPerDay", "Clients per chair per day", "0", "0.5", undefined],
  ["workingDays", "Open days in the year", "1", "1", "366"],
  ["averageTicket", "Average service bill", "0", "50", undefined],
  ["retailSales", "Annual retail product sales", "0", "5000", undefined],
  ["digitalSharePercent", "Collected by UPI / card (%)", "0", "5", "100"],
];

const RATE_FIELDS = [
  ["consumablesPercent", "Consumables as % of service revenue", "100"],
  ["commissionPercent", "Stylist commission as % of service revenue", "100"],
  ["retailCostPercent", "Cost of retail goods as % of retail sales", "100"],
  ["serviceGstRate", "GST rate charged on services (%)", "100"],
];

const DEDUCTION_FIELDS = [
  ["deduction80C", "Section 80C (max 1,50,000)"],
  ["deduction80D", "Section 80D health insurance"],
];

const DEFAULTS = {
  chairs: "4",
  clientsPerChairPerDay: "6",
  workingDays: "300",
  averageTicket: "700",
  retailSales: "400000",
  digitalSharePercent: "70",
  consumablesPercent: "12",
  commissionPercent: "20",
  retailCostPercent: "60",
  serviceGstRate: "5",
  deduction80C: "150000",
  deduction80D: "25000",
};

const DEFAULT_FIXED = {
  rent: "60000",
  fixedSalaries: "80000",
  utilities: "25000",
  marketing: "15000",
  other: "10000",
};

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [fixed, setFixed] = useState(DEFAULT_FIXED);
  const [ageGroup, setAgeGroup] = useState("below60");
  const [usePresumptive, setUsePresumptive] = useState(false);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setFixedCost = (key, value) => setFixed((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => {
    const parsed = {};
    for (const key of Object.keys(DEFAULTS)) {
      const value = toNumber(form[key]);
      if (Number.isNaN(value)) return { error: "Fill every field with a valid number." };
      parsed[key] = value;
    }
    const parsedFixed = {};
    for (const line of FIXED_COST_LINES) {
      const value = toNumber(fixed[line.key]);
      if (Number.isNaN(value)) return { error: "Fill every fixed cost with a valid number." };
      parsedFixed[line.key] = value;
    }
    return computeSalonBusiness({ ...parsed, fixedCosts: parsedFixed, ageGroup, usePresumptive });
  }, [form, fixed, ageGroup, usePresumptive]);

  const ok = !result.error;
  const chosen = ok ? (result.better === "new" ? result.newRegime : result.oldRegime) : null;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Salon Business Profit and Tax — FY 2025-26",
      `Clients served: ${num(result.clientsPerYear)} a year (${num(result.clientsPerDay)} a day)`,
      `Service revenue: ${money(result.serviceRevenue)}`,
      `Retail sales: ${money(result.retailSales)}`,
      `Total revenue: ${money(result.totalRevenue)}`,
      `Variable costs: ${money(result.variableCost)}`,
      `Gross profit: ${money(result.grossProfit)} (${pct(result.grossMarginPercent)})`,
      `Annual fixed costs: ${money(result.annualFixed)}`,
      `Net profit: ${money(result.netProfit)} (${pct(result.netMarginPercent)})`,
      `Contribution per client: ${money(result.contributionPerClient)}`,
      `Break-even: ${result.breakEvenClientsYear === null ? "not reachable" : `${num(result.breakEvenClientsYear)} clients a year, ${num(result.breakEvenPerChairDay)} per chair per day`}`,
      `Section 44AD presumptive income: ${money(result.presumptiveIncome)}`,
      `New regime tax: ${money(result.newRegime.totalTax)}`,
      `Old regime tax: ${money(result.oldRegime.totalTax)}`,
      `GST on services at ${pct(result.serviceGstRate)}: ${money(result.gstOnServices)}`,
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
    setFixed(DEFAULT_FIXED);
    setAgeGroup("below60");
    setUsePresumptive(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scissors className="h-4 w-4" aria-hidden="true" />
          FY 2025-26 · AY 2026-27
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Salon and Beauty Business Tax Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build revenue from chair capacity, take out consumables and stylist commission, and see
          break-even clients per chair, income tax under both regimes and where the GST thresholds
          fall.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Capacity and revenue</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {CAPACITY_FIELDS.map(([key, label, min, step, max]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`sb-${key}`}>
                {label}
              </label>
              <input
                id={`sb-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={min}
                max={max}
                step={step}
                value={form[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Variable cost rates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {RATE_FIELDS.map(([key, label, max]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`sb-${key}`}>
                {label}
              </label>
              <input
                id={`sb-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max={max}
                step="1"
                value={form[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Fixed monthly costs</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {FIXED_COST_LINES.map((line) => (
            <div key={line.key}>
              <label className={LABEL_CLASS} htmlFor={`sb-fx-${line.key}`}>
                {line.label}
              </label>
              <input
                id={`sb-fx-${line.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1000"
                value={fixed[line.key]}
                onChange={(event) => setFixedCost(line.key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Owner and tax options</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-age">
              Age category
            </label>
            <select
              id="sb-age"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ageGroup}
              onChange={(event) => setAgeGroup(event.target.value)}
            >
              {AGE_GROUPS.map((group) => (
                <option key={group.value} value={group.value}>
                  {group.label}
                </option>
              ))}
            </select>
          </div>
          {DEDUCTION_FIELDS.map(([key, label]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`sb-${key}`}>
                {label}
              </label>
              <input
                id={`sb-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1000"
                value={form[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
            </div>
          ))}
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="sb-44ad"
            >
              <input
                id="sb-44ad"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={usePresumptive}
                onChange={(event) => setUsePresumptive(event.target.checked)}
              />
              Declare under section 44AD
            </label>
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
              Net profit for the year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.netProfit) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${pct(result.netMarginPercent)} of ${money(result.totalRevenue)} revenue · tax ${money(chosen.totalTax)} on the ${result.better === "new" ? "new" : "old"} regime`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy salon profit and tax result"
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

        {ok && result.isLoss && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            The salon is running at a loss at this occupancy, so no income tax arises. A loss return
            still needs books of account.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Clients served in the year", ok ? num(result.clientsPerYear) : "—"],
            ["Service revenue", ok ? money(result.serviceRevenue) : "—"],
            ["Revenue per chair", ok ? money(result.revenuePerChair) : "—"],
            ["Retail product sales", ok ? money(result.retailSales) : "—"],
            ["Total revenue", ok ? money(result.totalRevenue) : "—"],
            ["Consumables", ok ? money(result.consumablesCost) : "—"],
            ["Stylist commission", ok ? money(result.commissionCost) : "—"],
            ["Cost of retail goods", ok ? money(result.retailCost) : "—"],
            ["Gross profit", ok ? `${money(result.grossProfit)} (${pct(result.grossMarginPercent)})` : "—"],
            ["Fixed costs for the year", ok ? money(result.annualFixed) : "—"],
            ["Contribution per client", ok ? money(result.contributionPerClient) : "—"],
            [
              "Break-even clients per year",
              ok ? (result.breakEvenClientsYear === null ? "Never at this pricing" : num(result.breakEvenClientsYear)) : "—",
            ],
            [
              "Break-even per chair per day",
              ok && result.breakEvenPerChairDay !== null ? num(result.breakEvenPerChairDay) : "—",
            ],
            [
              "Capacity used at break-even",
              ok && result.capacityUsedAtBreakEven !== null ? pct(result.capacityUsedAtBreakEven) : "—",
            ],
            ["Section 44AD presumptive income", ok ? money(result.presumptiveIncome) : "—"],
            ["Income offered to tax", ok ? money(result.businessIncome) : "—"],
            ["New regime tax", ok ? money(result.newRegime.totalTax) : "—"],
            ["Old regime tax", ok ? money(result.oldRegime.totalTax) : "—"],
            ["Profit after income tax", ok ? money(result.profitAfterTax) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">GST and compliance</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {[
            [
              "GST registration",
              ok
                ? result.gstRegistrationRequired
                  ? "Required — turnover is above the 20,00,000 services threshold"
                  : "Below the 20,00,000 services threshold"
                : "—",
            ],
            [
              `GST collectable on services at ${ok ? pct(result.serviceGstRate) : "—"}`,
              ok ? money(result.gstOnServices) : "—",
            ],
            [
              "Composition option for services (6%)",
              ok
                ? result.serviceCompositionEligible
                  ? `Eligible — levy would be ${money(result.serviceCompositionLevy)}`
                  : "Not eligible — turnover above 50,00,000"
                : "—",
            ],
            [
              "Books of account (section 44AA)",
              ok ? (result.booksRequired ? "Required" : "Not required at this level") : "—",
            ],
            [
              "Tax audit (section 44AB)",
              ok ? (result.auditLikely ? "Likely applicable — check with your CA" : "Below the audit threshold") : "—",
            ],
            [
              "Advance tax",
              ok ? (result.advanceTaxDue ? "Payable in four instalments" : "Not applicable — tax under 10,000") : "—",
            ],
          ].map(([label, value]) => (
            <li
              key={label}
              className="flex flex-col gap-1 rounded-md bg-[var(--muted)] px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <span className="font-semibold">{label}</span>
              <span className="text-[var(--muted-foreground)] sm:text-right">{value}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate for a resident individual proprietor. GST rates on beauty services and
        on retail cosmetics differ, and the special category states use lower thresholds. Confirm
        your rate and registration position with a GST practitioner.
      </p>
    </main>
  );
}
