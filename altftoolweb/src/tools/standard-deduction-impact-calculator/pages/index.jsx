"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptIndianRupee, RotateCcw } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => inr.format(Math.round(Number.isFinite(value) ? value : 0));

const NEW_REGIME_SLABS = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 0.05 },
  { upTo: 1200000, rate: 0.1 },
  { upTo: 1600000, rate: 0.15 },
  { upTo: 2000000, rate: 0.2 },
  { upTo: 2400000, rate: 0.25 },
  { upTo: Infinity, rate: 0.3 },
];

const oldRegimeSlabs = (exemption) => [
  { upTo: exemption, rate: 0 },
  { upTo: Math.max(exemption, 500000), rate: 0.05 },
  { upTo: Math.max(exemption, 1000000), rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

const INCOME_TYPES = [
  { id: "salary", label: "Salary or pension", old: 50000, new: 75000 },
  { id: "family", label: "Family pension", old: 15000, new: 25000 },
];

const AGE_OPTIONS = [
  { id: "below60", label: "Below 60", exemption: 250000 },
  { id: "senior", label: "60-79", exemption: 300000 },
  { id: "super", label: "80+", exemption: 500000 },
];

function slabTax(income, slabs) {
  let previous = 0;
  let tax = 0;
  for (const slab of slabs) {
    const band = Math.max(0, Math.min(income, slab.upTo) - previous);
    if (band > 0 && slab.rate > 0) tax += band * slab.rate;
    previous = slab.upTo;
    if (income <= slab.upTo) break;
  }
  return tax;
}

function payable(regime, taxableIncome, exemption) {
  const income = Math.max(0, taxableIncome);
  const slabs = regime === "new" ? NEW_REGIME_SLABS : oldRegimeSlabs(exemption);
  const grossTax = slabTax(income, slabs);

  let rebate = 0;
  if (regime === "new") {
    rebate =
      income <= 1200000
        ? Math.min(grossTax, 60000)
        : Math.min(grossTax, Math.max(0, grossTax - (income - 1200000)));
  } else if (income <= 500000) {
    rebate = Math.min(grossTax, 12500);
  }

  const afterRebate = Math.max(0, grossTax - rebate);
  const cess = afterRebate * 0.04;
  return { taxableIncome: income, grossTax, rebate, cess, total: afterRebate + cess };
}

const DEFAULTS = {
  incomeType: "salary",
  age: "below60",
  gross: "1000000",
  otherIncome: "0",
  otherDeductions: "150000",
  regime: "new",
};

export default function ToolHome() {
  const [incomeType, setIncomeType] = useState(DEFAULTS.incomeType);
  const [age, setAge] = useState(DEFAULTS.age);
  const [gross, setGross] = useState(DEFAULTS.gross);
  const [otherIncome, setOtherIncome] = useState(DEFAULTS.otherIncome);
  const [otherDeductions, setOtherDeductions] = useState(DEFAULTS.otherDeductions);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [copied, setCopied] = useState(false);

  const values = useMemo(
    () => ({
      gross: Number(gross),
      otherIncome: Number(otherIncome),
      otherDeductions: Number(otherDeductions),
    }),
    [gross, otherIncome, otherDeductions]
  );

  const error = useMemo(() => {
    const list = Object.values(values);
    if (list.some((value) => !Number.isFinite(value))) {
      return "Please enter numbers only — letters and symbols are not valid amounts.";
    }
    if (list.some((value) => value < 0)) return "Amounts cannot be negative.";
    if (values.otherDeductions > values.gross + values.otherIncome) {
      return "Other deductions cannot exceed your total income.";
    }
    return "";
  }, [values]);

  const result = useMemo(() => {
    if (error) return null;
    const type = INCOME_TYPES.find((item) => item.id === incomeType) || INCOME_TYPES[0];
    const ageOption = AGE_OPTIONS.find((item) => item.id === age) || AGE_OPTIONS[0];
    const totalIncome = values.gross + values.otherIncome;

    const build = (regimeId) => {
      const cap = regimeId === "new" ? type.new : type.old;
      // Salary/pension: flat cap, but never more than the income itself.
      // Family pension u/s 57(iia): lower of one-third of the pension or the cap.
      const ceiling = type.id === "family" ? Math.max(0, values.gross) / 3 : Math.max(0, values.gross);
      const deduction = Math.min(cap, ceiling);
      const chapterVia = regimeId === "old" ? values.otherDeductions : 0;
      const without = payable(regimeId, totalIncome - chapterVia, ageOption.exemption);
      const withSd = payable(regimeId, totalIncome - chapterVia - deduction, ageOption.exemption);
      return {
        regimeId,
        deduction,
        chapterVia,
        without,
        withSd,
        saving: Math.max(0, without.total - withSd.total),
        savingRate: deduction > 0 ? ((without.total - withSd.total) / deduction) * 100 : 0,
      };
    };

    const oldRegime = build("old");
    const newRegime = build("new");
    return {
      type,
      ageOption,
      totalIncome,
      oldRegime,
      newRegime,
      selected: regime === "new" ? newRegime : oldRegime,
    };
  }, [age, error, incomeType, regime, values]);

  const report = useMemo(() => {
    if (!result) return "";
    const s = result.selected;
    return [
      "Standard Deduction Impact Calculator (FY 2025-26 / AY 2026-27)",
      `Income type: ${result.type.label}`,
      `Regime: ${s.regimeId === "new" ? "New regime" : "Old regime"}`,
      `Total income: ${money(result.totalIncome)}`,
      `Standard deduction applied: ${money(s.deduction)}`,
      `Taxable income without standard deduction: ${money(s.without.taxableIncome)}`,
      `Taxable income with standard deduction: ${money(s.withSd.taxableIncome)}`,
      `Tax without standard deduction: ${money(s.without.total)}`,
      `Tax with standard deduction: ${money(s.withSd.total)}`,
      `Tax saved: ${money(s.saving)} (${s.savingRate.toFixed(1)}% of the deduction)`,
      "",
      `Old regime saving: ${money(result.oldRegime.saving)} on a ${money(result.oldRegime.deduction)} deduction`,
      `New regime saving: ${money(result.newRegime.saving)} on a ${money(result.newRegime.deduction)} deduction`,
      "Informational estimate only — confirm with the Income Tax Department or a tax professional.",
    ].join("\n");
  }, [result]);

  const copyResult = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setIncomeType(DEFAULTS.incomeType);
    setAge(DEFAULTS.age);
    setGross(DEFAULTS.gross);
    setOtherIncome(DEFAULTS.otherIncome);
    setOtherDeductions(DEFAULTS.otherDeductions);
    setRegime(DEFAULTS.regime);
    setCopied(false);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "mb-1 block text-sm font-medium text-[var(--foreground)]";
  const chip = (active) =>
    `min-h-11 rounded-md px-3 py-2 text-sm font-semibold ring-1 transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
      active
        ? "bg-[var(--primary)] text-[var(--primary-foreground)] ring-[var(--primary)]"
        : "bg-[var(--background)] text-[var(--foreground)] ring-[var(--border)]"
    }`;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Standard Deduction Impact Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            The standard deduction is a flat cut to salary and pension income — Rs 75,000 under the
            new regime and Rs 50,000 under the old for FY 2025-26. See exactly how many rupees of
            tax it saves you.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your income</h2>

            <fieldset className="mt-4">
              <legend className={labelClass}>Income type</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {INCOME_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setIncomeType(type.id)}
                    aria-pressed={incomeType === type.id}
                    className={chip(incomeType === type.id)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Deduction available: {money(INCOME_TYPES.find((t) => t.id === incomeType).new)} new
                regime / {money(INCOME_TYPES.find((t) => t.id === incomeType).old)} old regime.
                {incomeType === "family"
                  ? " Family pension is capped at one-third of the pension received."
                  : ""}
              </p>
            </fieldset>

            <fieldset className="mt-4">
              <legend className={labelClass}>Tax regime to analyse</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRegime("new")}
                  aria-pressed={regime === "new"}
                  className={chip(regime === "new")}
                >
                  New regime
                </button>
                <button
                  type="button"
                  onClick={() => setRegime("old")}
                  aria-pressed={regime === "old"}
                  className={chip(regime === "old")}
                >
                  Old regime
                </button>
              </div>
            </fieldset>

            <fieldset className="mt-4">
              <legend className={labelClass}>Age (affects old-regime exemption)</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {AGE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setAge(option.id)}
                    aria-pressed={age === option.id}
                    className={chip(age === option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="sd-gross">
                  Annual salary or pension (Rs)
                </label>
                <input
                  id="sd-gross"
                  className={inputClass}
                  inputMode="numeric"
                  value={gross}
                  onChange={(event) => setGross(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="sd-other-income">
                  Other income — interest, rent (Rs)
                </label>
                <input
                  id="sd-other-income"
                  className={inputClass}
                  inputMode="numeric"
                  value={otherIncome}
                  onChange={(event) => setOtherIncome(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="sd-other-ded">
                  Other old-regime deductions — 80C, 80D, etc. (Rs)
                </label>
                <input
                  id="sd-other-ded"
                  className={inputClass}
                  inputMode="numeric"
                  value={otherDeductions}
                  onChange={(event) => setOtherDeductions(event.target.value)}
                />
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyResult}
                disabled={!result}
                aria-label="Copy standard deduction impact result to clipboard"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset all inputs"
                className="inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-semibold ring-1 ring-[var(--border)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Impact of the standard deduction</h2>
            {result ? (
              <>
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  Tax saved in the {result.selected.regimeId === "new" ? "new" : "old"} regime
                </p>
                <p className="text-4xl font-bold tracking-tight text-[var(--primary)]">
                  {money(result.selected.saving)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  <ReceiptIndianRupee className="mr-1 inline h-3.5 w-3.5" />
                  {money(result.selected.deduction)} deduction returns{" "}
                  {result.selected.savingRate.toFixed(1)}% of itself as tax saved.
                </p>

                <dl className="mt-5 space-y-2 text-sm">
                  <Row label="Total income" value={money(result.totalIncome)} />
                  <Row
                    label="Taxable income before standard deduction"
                    value={money(result.selected.without.taxableIncome)}
                  />
                  <Row
                    label="Taxable income after standard deduction"
                    value={money(result.selected.withSd.taxableIncome)}
                  />
                  <Row
                    label="Tax without standard deduction"
                    value={money(result.selected.without.total)}
                  />
                  <Row
                    label="Tax with standard deduction"
                    value={money(result.selected.withSd.total)}
                    strong
                  />
                </dl>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Mini
                    title="Old regime"
                    deduction={result.oldRegime.deduction}
                    saving={result.oldRegime.saving}
                    highlight={result.selected.regimeId === "old"}
                  />
                  <Mini
                    title="New regime"
                    deduction={result.newRegime.deduction}
                    saving={result.newRegime.saving}
                    highlight={result.selected.regimeId === "new"}
                  />
                </div>

                {result.selected.saving === 0 ? (
                  <p className="mt-4 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                    Your tax is already nil at this income because of the Section 87A rebate or the
                    basic exemption, so the standard deduction saves nothing extra this year — it
                    still lowers your taxable income on record.
                  </p>
                ) : (
                  <p className="mt-4 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                    The saving equals the deduction multiplied by your top slab rate plus 4% cess,
                    unless part of the deduction pushes you under a rebate threshold.
                  </p>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Fix the highlighted input to see the impact.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-2">
      <dt className="text-[var(--muted-foreground)]">{label}</dt>
      <dd className={strong ? "text-base font-bold" : "font-semibold"}>{value}</dd>
    </div>
  );
}

function Mini({ title, deduction, saving, highlight }) {
  return (
    <div
      className={`rounded-lg p-4 ring-1 ${
        highlight ? "ring-[var(--primary)] bg-[var(--muted)]" : "ring-[var(--border)]"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xl font-bold">{money(saving)}</p>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        saved on a {money(deduction)} deduction
      </p>
    </div>
  );
}
