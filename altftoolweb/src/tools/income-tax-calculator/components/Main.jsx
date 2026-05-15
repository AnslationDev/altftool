"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeIndianRupee,
  Clipboard,
  Download,
  Loader2,
  Percent,
  ReceiptIndianRupee,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const NEW_SLABS = [
  { from: 0, to: 400000, rate: 0 },
  { from: 400000, to: 800000, rate: 0.05 },
  { from: 800000, to: 1200000, rate: 0.1 },
  { from: 1200000, to: 1600000, rate: 0.15 },
  { from: 1600000, to: 2000000, rate: 0.2 },
  { from: 2000000, to: 2400000, rate: 0.25 },
  { from: 2400000, to: Infinity, rate: 0.3 },
];

const OLD_SLABS = {
  below60: [
    { from: 0, to: 250000, rate: 0 },
    { from: 250000, to: 500000, rate: 0.05 },
    { from: 500000, to: 1000000, rate: 0.2 },
    { from: 1000000, to: Infinity, rate: 0.3 },
  ],
  senior: [
    { from: 0, to: 300000, rate: 0 },
    { from: 300000, to: 500000, rate: 0.05 },
    { from: 500000, to: 1000000, rate: 0.2 },
    { from: 1000000, to: Infinity, rate: 0.3 },
  ],
  superSenior: [
    { from: 0, to: 500000, rate: 0 },
    { from: 500000, to: 1000000, rate: 0.2 },
    { from: 1000000, to: Infinity, rate: 0.3 },
  ],
};

const AGE_OPTIONS = {
  below60: "Below 60",
  senior: "60 to 79",
  superSenior: "80 and above",
};

const DEFAULT_FORM = {
  salaryIncome: 1800000,
  otherIncome: 50000,
  isSalaried: true,
  resident: true,
  ageGroup: "below60",
  section80C: 150000,
  section80D: 25000,
  npsSelf: 50000,
  employerNps: 0,
  hraExemption: 0,
  homeLoanInterest: 0,
  otherDeductions: 0,
};

const HIGH_INCOME_SAMPLE = {
  salaryIncome: 6200000,
  otherIncome: 200000,
  isSalaried: true,
  resident: true,
  ageGroup: "below60",
  section80C: 150000,
  section80D: 50000,
  npsSelf: 50000,
  employerNps: 250000,
  hraExemption: 240000,
  homeLoanInterest: 200000,
  otherDeductions: 0,
};

function formatMoney(value, compact = false) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value) {
  return `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}%`;
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(number, min), max);
}

function calculateSlabTax(taxableIncome, slabs) {
  let tax = 0;
  const rows = slabs.map((slab) => {
    const amount = Math.max(0, Math.min(taxableIncome, slab.to) - slab.from);
    const slabTax = amount * slab.rate;
    tax += slabTax;

    return {
      ...slab,
      amount,
      tax: slabTax,
    };
  });

  return { tax, rows };
}

function getMarginalRate(taxableIncome, slabs) {
  const active = slabs.find((slab) => taxableIncome > slab.from && taxableIncome <= slab.to) || slabs.at(-1);
  return active ? active.rate * 100 : 0;
}

function getSurchargeRate(taxableIncome, regime) {
  if (taxableIncome <= 5000000) return 0;
  if (taxableIncome <= 10000000) return 0.1;
  if (taxableIncome <= 20000000) return 0.15;
  if (taxableIncome <= 50000000) return 0.25;
  return regime === "new" ? 0.25 : 0.37;
}

function getSurchargeThreshold(taxableIncome) {
  if (taxableIncome <= 5000000) return 0;
  if (taxableIncome <= 10000000) return 5000000;
  if (taxableIncome <= 20000000) return 10000000;
  if (taxableIncome <= 50000000) return 20000000;
  return 50000000;
}

function calculateSurchargeWithRelief(tax, taxableIncome, regime, slabs) {
  const rate = getSurchargeRate(taxableIncome, regime);
  if (!rate || tax <= 0) return { surcharge: 0, relief: 0, rate: 0 };

  const threshold = getSurchargeThreshold(taxableIncome);
  const previousRate = getSurchargeRate(threshold, regime);
  const thresholdTax = calculateSlabTax(threshold, slabs).tax;
  const thresholdTaxWithSurcharge = thresholdTax + thresholdTax * previousRate;
  const maxTaxWithSurcharge = thresholdTaxWithSurcharge + (taxableIncome - threshold);
  const rawSurcharge = tax * rate;
  const rawTaxWithSurcharge = tax + rawSurcharge;
  const relief = Math.max(0, rawTaxWithSurcharge - maxTaxWithSurcharge);
  const surcharge = Math.max(0, rawSurcharge - relief);

  return { surcharge, relief, rate };
}

function calculateRegime(form, regime) {
  const grossIncome = form.salaryIncome + form.otherIncome;
  const slabs = regime === "new" ? NEW_SLABS : OLD_SLABS[form.ageGroup];
  const standardDeduction = form.isSalaried ? (regime === "new" ? 75000 : 50000) : 0;
  const oldDeductions =
    standardDeduction +
    Math.min(form.section80C, 150000) +
    form.section80D +
    Math.min(form.npsSelf, 50000) +
    form.employerNps +
    form.hraExemption +
    Math.min(form.homeLoanInterest, 200000) +
    form.otherDeductions;
  const newDeductions = standardDeduction + form.employerNps;
  const allowedDeductions = regime === "new" ? newDeductions : oldDeductions;
  const taxableIncome = Math.max(0, grossIncome - allowedDeductions);
  const slabResult = calculateSlabTax(taxableIncome, slabs);
  const baseTax = slabResult.tax;

  let rebate = 0;
  let rebateMarginalRelief = 0;

  if (form.resident && regime === "new") {
    if (taxableIncome <= 1200000) {
      rebate = Math.min(baseTax, 60000);
    } else {
      rebateMarginalRelief = Math.max(0, baseTax - (taxableIncome - 1200000));
    }
  }

  if (form.resident && regime === "old" && taxableIncome <= 500000) {
    rebate = Math.min(baseTax, 12500);
  }

  const taxAfterRebate = Math.max(0, baseTax - rebate - rebateMarginalRelief);
  const surchargeResult = calculateSurchargeWithRelief(taxAfterRebate, taxableIncome, regime, slabs);
  const cess = (taxAfterRebate + surchargeResult.surcharge) * 0.04;
  const totalTax = taxAfterRebate + surchargeResult.surcharge + cess;

  return {
    regime,
    grossIncome,
    standardDeduction,
    allowedDeductions,
    taxableIncome,
    baseTax,
    rebate,
    rebateMarginalRelief,
    taxAfterRebate,
    surcharge: surchargeResult.surcharge,
    surchargeRelief: surchargeResult.relief,
    surchargeRate: surchargeResult.rate,
    cess,
    totalTax,
    takeHome: Math.max(0, grossIncome - totalTax),
    effectiveRate: grossIncome ? (totalTax / grossIncome) * 100 : 0,
    marginalRate: getMarginalRate(taxableIncome, slabs),
    slabs: slabResult.rows,
  };
}

function buildSummary(form, oldResult, newResult) {
  const better = newResult.totalTax <= oldResult.totalTax ? "New Regime" : "Old Regime";
  const savings = Math.abs(newResult.totalTax - oldResult.totalTax);

  return [
    "Income Tax Calculator Summary",
    `Gross income: ${formatMoney(oldResult.grossIncome)}`,
    `Age group: ${AGE_OPTIONS[form.ageGroup]}`,
    `Resident individual: ${form.resident ? "Yes" : "No"}`,
    `Old regime tax: ${formatMoney(oldResult.totalTax)}`,
    `New regime tax: ${formatMoney(newResult.totalTax)}`,
    `Suggested regime: ${better}`,
    `Estimated savings: ${formatMoney(savings)}`,
    `Old taxable income: ${formatMoney(oldResult.taxableIncome)}`,
    `New taxable income: ${formatMoney(newResult.taxableIncome)}`,
  ].join("\n");
}

function exportCsv(oldResult, newResult) {
  const rows = [
    ["Metric", "Old Regime", "New Regime"],
    ["Gross income", oldResult.grossIncome, newResult.grossIncome],
    ["Allowed deductions", oldResult.allowedDeductions, newResult.allowedDeductions],
    ["Taxable income", oldResult.taxableIncome, newResult.taxableIncome],
    ["Base slab tax", oldResult.baseTax, newResult.baseTax],
    ["87A rebate", oldResult.rebate, newResult.rebate],
    ["87A marginal relief", oldResult.rebateMarginalRelief, newResult.rebateMarginalRelief],
    ["Tax after rebate", oldResult.taxAfterRebate, newResult.taxAfterRebate],
    ["Surcharge", oldResult.surcharge, newResult.surcharge],
    ["Surcharge marginal relief", oldResult.surchargeRelief, newResult.surchargeRelief],
    ["Cess", oldResult.cess, newResult.cess],
    ["Total tax", oldResult.totalTax, newResult.totalTax],
    ["Take home after tax", oldResult.takeHome, newResult.takeHome],
  ];
  const csv = rows
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "income-tax-comparison.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function MoneyField({ label, value, min = 0, max, step = 1000, onChange }) {
  return (
    <label className="block rounded-lg border border-(--border) bg-(--background) p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-(--foreground)">{label}</span>
        <span className="rounded-md bg-(--section-highlight) px-2 py-1 text-sm font-semibold text-(--primary)">
          {formatMoney(value, true)}
        </span>
      </div>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(clampNumber(event.target.value, min, max))}
        className="mb-3 w-full rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-(--foreground) outline-none transition focus:border-(--primary)"
      />
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[var(--primary)]"
      />
      <div className="mt-2 flex justify-between text-xs text-(--muted-foreground)">
        <span>{formatMoney(min, true)}</span>
        <span>{formatMoney(max, true)}</span>
      </div>
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-amber-500/10 text-amber-600"
        : "bg-(--section-highlight) text-(--primary)";

  return (
    <div className="rounded-lg border border-(--border) bg-(--card) p-5">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
            {label}
          </p>
          <p className="mt-1 text-xl font-bold text-(--foreground)">{value}</p>
          {detail && <p className="mt-1 text-sm text-(--muted-foreground)">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

function RegimeBreakup({ title, result, recommended }) {
  return (
    <section className={`rounded-lg border p-5 ${recommended ? "border-emerald-500/50 bg-emerald-500/10" : "border-(--border) bg-(--card)"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-(--foreground)">{title}</h2>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            Taxable income {formatMoney(result.taxableIncome)}
          </p>
        </div>
        {recommended && (
          <span className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-(--primary-foreground)">
            Lower tax
          </span>
        )}
      </div>

      <div className="mt-5 space-y-3 text-sm">
        {[
          ["Gross income", result.grossIncome],
          ["Allowed deductions", result.allowedDeductions],
          ["Base slab tax", result.baseTax],
          ["87A rebate", result.rebate],
          ["87A marginal relief", result.rebateMarginalRelief],
          ["Surcharge", result.surcharge],
          ["Surcharge relief", result.surchargeRelief],
          ["Health & education cess", result.cess],
          ["Total tax", result.totalTax],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 rounded-lg bg-(--background) px-3 py-2">
            <span className="text-(--muted-foreground)">{label}</span>
            <span className="font-semibold text-(--foreground)">{formatMoney(value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function MainComponent() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [displayForm, setDisplayForm] = useState(DEFAULT_FORM);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeSlab, setActiveSlab] = useState("new");
  const [copied, setCopied] = useState(false);

  const oldResult = useMemo(() => calculateRegime(displayForm, "old"), [displayForm]);
  const newResult = useMemo(() => calculateRegime(displayForm, "new"), [displayForm]);
  const selectedSlabResult = activeSlab === "new" ? newResult : oldResult;
  const recommended = newResult.totalTax <= oldResult.totalTax ? "new" : "old";
  const savings = Math.abs(newResult.totalTax - oldResult.totalTax);

  const updateForm = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const calculateTax = () => {
    setIsCalculating(true);
    window.setTimeout(() => {
      setDisplayForm(form);
      setIsCalculating(false);
    }, 900);
  };

  const copySummary = async () => {
    await navigator.clipboard?.writeText(buildSummary(displayForm, oldResult, newResult));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-8 text-(--foreground)">
      <div className="text-center">
        <h1 className="heading">Income Tax Calculator</h1>
        <p className="description mt-3">
          Compare India old and new tax regimes with deductions, 87A rebate,
          surcharge, 4% cess, and slab-wise tax breakup.
        </p>
      </div>

      <section className="mt-8 rounded-lg border border-(--border) bg-(--card) p-5 sm:p-6">
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px] 2xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <ReceiptIndianRupee className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">India Tax Planner</h2>
              <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
                Current slabs, 87A rebate, surcharge, and cess follow Income Tax
                Department guidance for AY 2026-27.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-(--border) bg-(--background) p-4">
            <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
              Suggested regime
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {recommended === "new" ? "New Regime" : "Old Regime"}
            </p>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              Estimated savings: {formatMoney(savings)}.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-lg border border-(--border) bg-(--card) p-5">
          <MoneyField
            label="Salary / Pension Income"
            value={form.salaryIncome}
            max={100000000}
            step={50000}
            onChange={(value) => updateForm("salaryIncome", value)}
          />
          <MoneyField
            label="Other Income"
            value={form.otherIncome}
            max={20000000}
            step={10000}
            onChange={(value) => updateForm("otherIncome", value)}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => updateForm("isSalaried", !form.isSalaried)}
              className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${
                form.isSalaried
                  ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                  : "border-(--border) bg-(--background) text-(--foreground)"
              }`}
            >
              Salaried: {form.isSalaried ? "Yes" : "No"}
            </button>
            <button
              type="button"
              onClick={() => updateForm("resident", !form.resident)}
              className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${
                form.resident
                  ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                  : "border-(--border) bg-(--background) text-(--foreground)"
              }`}
            >
              Resident: {form.resident ? "Yes" : "No"}
            </button>
          </div>

          <label className="block rounded-lg border border-(--border) bg-(--background) p-4">
            <span className="mb-2 block text-sm font-semibold text-(--foreground)">Age Group</span>
            <select
              value={form.ageGroup}
              onChange={(event) => updateForm("ageGroup", event.target.value)}
              className="w-full rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
            >
              {Object.entries(AGE_OPTIONS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-lg border border-(--border) bg-(--background) p-4">
            <h3 className="mb-4 font-semibold text-(--foreground)">Old Regime Deductions</h3>
            <div className="space-y-4">
              <MoneyField label="80C" value={form.section80C} max={150000} step={5000} onChange={(value) => updateForm("section80C", value)} />
              <MoneyField label="80D / Medical Insurance" value={form.section80D} max={100000} step={5000} onChange={(value) => updateForm("section80D", value)} />
              <MoneyField label="NPS Self 80CCD(1B)" value={form.npsSelf} max={50000} step={5000} onChange={(value) => updateForm("npsSelf", value)} />
              <MoneyField label="HRA Exemption" value={form.hraExemption} max={1000000} step={10000} onChange={(value) => updateForm("hraExemption", value)} />
              <MoneyField label="Home Loan Interest" value={form.homeLoanInterest} max={200000} step={10000} onChange={(value) => updateForm("homeLoanInterest", value)} />
              <MoneyField label="Other Deductions" value={form.otherDeductions} max={1000000} step={10000} onChange={(value) => updateForm("otherDeductions", value)} />
            </div>
          </div>

          <MoneyField
            label="Employer NPS 80CCD(2)"
            value={form.employerNps}
            max={1000000}
            step={10000}
            onChange={(value) => updateForm("employerNps", value)}
          />

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={calculateTax} disabled={isCalculating} className="btn-primary">
              {isCalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isCalculating ? "Calculating..." : "Calculate Tax"}
            </button>
            <button type="button" onClick={() => setForm(HIGH_INCOME_SAMPLE)} className="btn-secondary">
              <RefreshCw className="h-4 w-4" />
              Load Sample
            </button>
            <button type="button" onClick={copySummary} className="btn-secondary">
              <Clipboard className="h-4 w-4" />
              {copied ? "Copied" : "Copy"}
            </button>
            <button type="button" onClick={() => exportCsv(oldResult, newResult)} className="btn-secondary">
              <Download className="h-4 w-4" />
              CSV
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {isCalculating && (
            <div className="flex items-center gap-3 rounded-lg border border-(--border) bg-(--section-highlight) p-4 text-(--primary)">
              <Loader2 className="h-5 w-5 animate-spin" />
              <div>
                <p className="font-semibold">Calculating tax comparison...</p>
                <p className="text-sm">Applying slabs, deductions, rebate, surcharge, cess, and regime comparison.</p>
              </div>
            </div>
          )}

          <div className="tool-card-grid">
            <MetricCard
              icon={Scale}
              label="New Regime Tax"
              value={formatMoney(newResult.totalTax)}
              detail={`Effective rate ${formatPercent(newResult.effectiveRate)}`}
              tone={recommended === "new" ? "good" : "default"}
            />
            <MetricCard
              icon={BadgeIndianRupee}
              label="Old Regime Tax"
              value={formatMoney(oldResult.totalTax)}
              detail={`Effective rate ${formatPercent(oldResult.effectiveRate)}`}
              tone={recommended === "old" ? "good" : "default"}
            />
            <MetricCard
              icon={ShieldCheck}
              label="Estimated Savings"
              value={formatMoney(savings)}
              detail={`${recommended === "new" ? "New" : "Old"} regime is lower.`}
              tone="good"
            />
            <MetricCard
              icon={Percent}
              label="Marginal Rate"
              value={formatPercent(recommended === "new" ? newResult.marginalRate : oldResult.marginalRate)}
              detail="Based on the suggested regime taxable slab."
            />
          </div>

          <div className="grid gap-6 2xl:grid-cols-2">
            <RegimeBreakup title="Old Regime Breakup" result={oldResult} recommended={recommended === "old"} />
            <RegimeBreakup title="New Regime Breakup" result={newResult} recommended={recommended === "new"} />
          </div>

          <section className="rounded-lg border border-(--border) bg-(--card) p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-(--foreground)">Slab-wise Breakup</h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  Review taxable amount and tax charged inside each slab.
                </p>
              </div>
              <div className="flex rounded-lg border border-(--border) bg-(--background) p-1">
                {[
                  ["new", "New"],
                  ["old", "Old"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setActiveSlab(value)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                      activeSlab === value ? "bg-(--primary) text-(--primary-foreground)" : "text-(--foreground)"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-(--border)">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-(--background) text-xs uppercase text-(--muted-foreground)">
                  <tr>
                    <th className="px-4 py-3">Slab</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Taxed Amount</th>
                    <th className="px-4 py-3">Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border)">
                  {selectedSlabResult.slabs.map((slab) => (
                    <tr key={`${slab.from}-${slab.to}`} className="bg-(--card)">
                      <td className="px-4 py-3 text-(--foreground)">
                        {slab.to === Infinity
                          ? `Above ${formatMoney(slab.from)}`
                          : `${formatMoney(slab.from)} to ${formatMoney(slab.to)}`}
                      </td>
                      <td className="px-4 py-3 text-(--foreground)">{formatPercent(slab.rate * 100)}</td>
                      <td className="px-4 py-3 text-(--foreground)">{formatMoney(slab.amount)}</td>
                      <td className="px-4 py-3 font-semibold text-(--foreground)">{formatMoney(slab.tax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm">
          This is an estimate for regular individual income. Special-rate capital
          gains, foreign income, business restrictions, employer perks, alternate
          minimum tax, and exact ITR rules can change the final liability.
        </p>
      </div>
    </main>
  );
}
