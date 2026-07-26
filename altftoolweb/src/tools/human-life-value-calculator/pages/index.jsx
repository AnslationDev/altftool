"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  currentAge: 32,
  retirementAge: 60,
  annualIncome: 1200000,
  personalExpenses: 300000,
  growth: 6,
  discount: 8,
  loans: 2500000,
  goals: 2000000,
  assets: 1000000,
  existingCover: 2500000,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Present value of a growing annuity paid at the end of each year for n years.
 * First payment is `payment`; each later payment grows by `growth`.
 * Falls back to the g === r limit case to avoid a divide-by-zero.
 */
function presentValueGrowing(payment, growth, discount, years) {
  if (!(payment > 0) || !(years > 0)) return 0;
  const g = growth / 100;
  const r = discount / 100;
  if (Math.abs(r - g) < 1e-9) return (payment * years) / (1 + r);
  return (payment * (1 - Math.pow((1 + g) / (1 + r), years))) / (r - g);
}

export default function ToolHome() {
  const [currentAge, setCurrentAge] = useState(String(DEFAULTS.currentAge));
  const [retirementAge, setRetirementAge] = useState(String(DEFAULTS.retirementAge));
  const [annualIncome, setAnnualIncome] = useState(String(DEFAULTS.annualIncome));
  const [personalExpenses, setPersonalExpenses] = useState(String(DEFAULTS.personalExpenses));
  const [growth, setGrowth] = useState(String(DEFAULTS.growth));
  const [discount, setDiscount] = useState(String(DEFAULTS.discount));
  const [loans, setLoans] = useState(String(DEFAULTS.loans));
  const [goals, setGoals] = useState(String(DEFAULTS.goals));
  const [assets, setAssets] = useState(String(DEFAULTS.assets));
  const [existingCover, setExistingCover] = useState(String(DEFAULTS.existingCover));
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const age = toNumber(currentAge);
    const retire = toNumber(retirementAge);
    const income = toNumber(annualIncome);
    const spend = toNumber(personalExpenses);
    const g = toNumber(growth);
    const r = toNumber(discount);
    const debt = toNumber(loans);
    const goal = toNumber(goals);
    const asset = toNumber(assets);
    const cover = toNumber(existingCover);

    const all = [age, retire, income, spend, g, r, debt, goal, asset, cover];
    if (all.some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (age < 15 || age > 75) return { error: "Current age should be between 15 and 75." };
    if (retire <= age) return { error: "Retirement age must be greater than your current age." };
    if (retire > 80) return { error: "Retirement age should be 80 or lower." };
    if (income <= 0) return { error: "Annual income must be greater than zero." };
    if (spend < 0 || debt < 0 || goal < 0 || asset < 0 || cover < 0) {
      return { error: "Amounts cannot be negative." };
    }
    if (spend >= income) {
      return { error: "Personal expenses must be less than your annual income." };
    }
    if (g < 0 || g > 25) return { error: "Income growth should be between 0% and 25% per year." };
    if (r <= 0 || r > 25) return { error: "Discount rate should be between 0.1% and 25% per year." };

    const years = Math.round(retire - age);
    const netContribution = income - spend;
    const hlv = presentValueGrowing(netContribution, g, r, years);
    const simpleHlv = netContribution * years;
    const needs = hlv + debt + goal;
    const alreadyCovered = asset + cover;
    const gap = Math.max(0, needs - alreadyCovered);
    const surplus = Math.max(0, alreadyCovered - needs);

    return {
      years,
      income,
      spend,
      netContribution,
      hlv,
      simpleHlv,
      debt,
      goal,
      needs,
      asset,
      cover,
      alreadyCovered,
      gap,
      surplus,
      incomeMultiple: hlv / income,
      coverMultiple: needs / income,
    };
  }, [
    currentAge,
    retirementAge,
    annualIncome,
    personalExpenses,
    growth,
    discount,
    loans,
    goals,
    assets,
    existingCover,
  ]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Human Life Value Calculator",
      `Earning years left: ${calc.years}`,
      `Annual income: ${money(calc.income)}`,
      `Annual personal expenses: ${money(calc.spend)}`,
      `Annual income supporting the family: ${money(calc.netContribution)}`,
      `Human Life Value (present value): ${money(calc.hlv)}`,
      `Undiscounted income replacement: ${money(calc.simpleHlv)}`,
      `Loans outstanding: ${money(calc.debt)}`,
      `Future goals: ${money(calc.goal)}`,
      `Total protection need: ${money(calc.needs)}`,
      `Existing assets + life cover: ${money(calc.alreadyCovered)}`,
      calc.gap > 0
        ? `Additional cover required: ${money(calc.gap)}`
        : `Cover surplus: ${money(calc.surplus)}`,
    ].join("\n");
  }, [calc]);

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
    setCurrentAge(String(DEFAULTS.currentAge));
    setRetirementAge(String(DEFAULTS.retirementAge));
    setAnnualIncome(String(DEFAULTS.annualIncome));
    setPersonalExpenses(String(DEFAULTS.personalExpenses));
    setGrowth(String(DEFAULTS.growth));
    setDiscount(String(DEFAULTS.discount));
    setLoans(String(DEFAULTS.loans));
    setGoals(String(DEFAULTS.goals));
    setAssets(String(DEFAULTS.assets));
    setExistingCover(String(DEFAULTS.existingCover));
    setCopied(false);
  };

  const fields = [
    ["hlv-current-age", "Current age (years)", currentAge, setCurrentAge, 1],
    ["hlv-retire-age", "Retirement age (years)", retirementAge, setRetirementAge, 1],
    ["hlv-income", "Annual income (INR)", annualIncome, setAnnualIncome, 10000],
    ["hlv-expenses", "Your own annual expenses (INR)", personalExpenses, setPersonalExpenses, 10000],
    ["hlv-growth", "Expected income growth (% per year)", growth, setGrowth, 0.5],
    ["hlv-discount", "Discount rate (% per year)", discount, setDiscount, 0.5],
    ["hlv-loans", "Outstanding loans (INR)", loans, setLoans, 50000],
    ["hlv-goals", "Future goals — education, marriage (INR)", goals, setGoals, 50000],
    ["hlv-assets", "Existing savings & investments (INR)", assets, setAssets, 50000],
    ["hlv-cover", "Existing life insurance cover (INR)", existingCover, setExistingCover, 100000],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Insurance planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Human Life Value Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Human Life Value is the present value of the income you would still have earned for your
          family. This calculator discounts your growing future earnings, adds loans and goals, then
          subtracts what you already have to show the term cover gap.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([id, label, value, setter, step]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Human Life Value
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.hlv)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {num(calc.incomeMultiple)}× your current annual income, over {calc.years} earning
                  years
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy human life value result"
                  className={GHOST_BTN}
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
                ["Income that supports the family (per year)", money(calc.netContribution)],
                ["Earning years remaining", `${calc.years} years`],
                ["Discounted value of future earnings", money(calc.hlv)],
                ["Same earnings without discounting", money(calc.simpleHlv)],
                ["Add: outstanding loans", money(calc.debt)],
                ["Add: future goals", money(calc.goal)],
                ["Total protection need", money(calc.needs)],
                ["Less: savings & investments", `− ${money(calc.asset)}`],
                ["Less: existing life cover", `− ${money(calc.cover)}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {calc.gap > 0 ? "Additional cover you should buy" : "You are adequately covered"}
            </p>
            <p
              className={`mt-1 text-3xl font-semibold ${
                calc.gap > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"
              }`}
            >
              {calc.gap > 0 ? money(calc.gap) : money(calc.surplus)}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {calc.gap > 0
                ? `Your total need of ${money(calc.needs)} is about ${num(
                    calc.coverMultiple,
                  )}× your annual income, and ${money(
                    calc.alreadyCovered,
                  )} is already in place through savings and existing policies.`
                : `Your savings and existing policies of ${money(
                    calc.alreadyCovered,
                  )} already exceed the ${money(calc.needs)} your family would need.`}
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Insurers apply their own income-multiple limits, medical
        underwriting and age caps when deciding the sum assured they will issue.
      </p>
    </main>
  );
}
