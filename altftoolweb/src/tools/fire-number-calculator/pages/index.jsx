"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Flame,
  Info,
  PiggyBank,
  RotateCcw,
  Target,
  TrendingUp,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const MAX_MONTHS = 12 * 80;

const withdrawalPresets = [
  { rate: 4, label: "4% rule", hint: "The classic Trinity study number" },
  { rate: 3.5, label: "3.5%", hint: "Conservative — a longer retirement" },
  { rate: 3, label: "3%", hint: "Very safe — early retiree, 50+ years" },
];

const fireFlavours = [
  {
    id: "lean",
    multiplier: 0.7,
    label: "Lean FIRE",
    blurb: "Trimmed lifestyle — smaller city, no car EMI, cooking at home.",
  },
  {
    id: "regular",
    multiplier: 1,
    label: "Regular FIRE",
    blurb: "Your life exactly as it is today, funded forever.",
  },
  {
    id: "fat",
    multiplier: 1.5,
    label: "Fat FIRE",
    blurb: "Room for travel, private healthcare, and helping family.",
  },
];

const savingsRateRows = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];

const inrFull = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatINR = (value) => inrFull.format(Number.isFinite(value) ? value : 0);

function formatCompactINR(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return formatINR(0);
  const abs = Math.abs(amount);
  if (abs >= 1e7) return `${amount < 0 ? "-" : ""}₹${Math.abs(amount / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${amount < 0 ? "-" : ""}₹${Math.abs(amount / 1e5).toFixed(2)} L`;
  return formatINR(amount);
}

function formatYears(months) {
  if (months === null) return "Not reachable";
  if (months <= 0) return "Already there";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  if (rest === 0) return `${years} yr`;
  return `${years} yr ${rest} mo`;
}

function monthsToTarget(startCorpus, monthlyAdd, monthlyRate, target) {
  if (!Number.isFinite(target) || target <= 0) return 0;
  if (startCorpus >= target) return 0;
  let corpus = startCorpus;
  let months = 0;
  while (corpus < target && months < MAX_MONTHS) {
    corpus = corpus * (1 + monthlyRate) + monthlyAdd;
    months += 1;
  }
  return corpus >= target ? months : null;
}

function fireStage(percent) {
  if (percent >= 100) return { label: "Financially independent", note: "Work is now optional. The maths is done." };
  if (percent >= 75) return { label: "Final stretch", note: "Growth is now doing more of the lifting than your salary." };
  if (percent >= 50) return { label: "Halfway there", note: "The back half is usually faster — compounding is on your side." };
  if (percent >= 25) return { label: "Compounding takes over", note: "The first quarter is the hardest. It gets easier from here." };
  if (percent >= 10) return { label: "Building momentum", note: "The habit is set. Now protect the savings rate." };
  return { label: "Starting out", note: "Every rupee invested now has the longest runway it will ever have." };
}

function StatTile({ label, value, hint }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

function NumberField({ label, value, onChange, min, max, step, suffix, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <div className="relative mt-2">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pr-12 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{hint}</span> : null}
    </label>
  );
}

export default function ToolHome() {
  const [annualExpenses, setAnnualExpenses] = useState(600000);
  const [withdrawalRate, setWithdrawalRate] = useState(4);
  const [currentCorpus, setCurrentCorpus] = useState(1500000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(50000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [inflation, setInflation] = useState(6);
  const [currentAge, setCurrentAge] = useState(30);
  const [coastAge, setCoastAge] = useState(60);
  const [annualIncome, setAnnualIncome] = useState(1200000);
  const [copied, setCopied] = useState(false);
  const [today, setToday] = useState(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const model = useMemo(() => {
    const expenses = Math.max(0, Number(annualExpenses) || 0);
    const rate = Math.min(12, Math.max(0.1, Number(withdrawalRate) || 4));
    const corpus = Math.max(0, Number(currentCorpus) || 0);
    const monthly = Math.max(0, Number(monthlyInvestment) || 0);
    const nominal = Number(expectedReturn) || 0;
    const infl = Number(inflation) || 0;
    const age = Math.max(0, Number(currentAge) || 0);

    const realAnnual = (1 + nominal / 100) / (1 + infl / 100) - 1;
    const realMonthly = realAnnual <= -1 ? -0.999 : Math.pow(1 + realAnnual, 1 / 12) - 1;

    const fireNumber = expenses / (rate / 100);
    const multiple = 100 / rate;
    const months = monthsToTarget(corpus, monthly, realMonthly, fireNumber);
    const progress = fireNumber > 0 ? (corpus / fireNumber) * 100 : 100;

    const coastTarget = Math.max(age, Number(coastAge) || 60);
    const yearsToCoastAge = Math.max(0, coastTarget - age);
    const coastGrowth = Math.pow(1 + realAnnual, yearsToCoastAge);
    const coastNumber = coastGrowth > 0 ? fireNumber / coastGrowth : fireNumber;
    const coasting = corpus >= coastNumber;
    const coastGap = coastNumber - corpus;
    const monthsToCoast = coasting ? 0 : monthsToTarget(corpus, monthly, realMonthly, coastNumber);

    return {
      expenses,
      rate,
      corpus,
      monthly,
      nominal,
      infl,
      age,
      realAnnual,
      realMonthly,
      fireNumber,
      multiple,
      months,
      progress,
      coastTarget,
      yearsToCoastAge,
      coastNumber,
      coasting,
      coastGap,
      monthsToCoast,
    };
  }, [
    annualExpenses,
    coastAge,
    currentAge,
    currentCorpus,
    expectedReturn,
    inflation,
    monthlyInvestment,
    withdrawalRate,
  ]);

  const flavours = useMemo(
    () =>
      fireFlavours.map((flavour) => {
        const expenses = model.expenses * flavour.multiplier;
        const number = expenses / (model.rate / 100);
        const months = monthsToTarget(model.corpus, model.monthly, model.realMonthly, number);
        return {
          ...flavour,
          expenses,
          number,
          months,
          age: months === null ? null : model.age + months / 12,
        };
      }),
    [model]
  );

  const savings = useMemo(() => {
    const income = Math.max(0, Number(annualIncome) || 0);
    const saved = income - model.expenses;
    const savingsRate = income > 0 ? (saved / income) * 100 : 0;
    const investingRate = income > 0 ? ((model.monthly * 12) / income) * 100 : 0;
    const gap = saved - model.monthly * 12;

    const table = savingsRateRows.map((rate) => {
      const base = 100;
      const spend = base * (1 - rate / 100);
      const target = spend / (model.rate / 100);
      const months = monthsToTarget(0, (base * rate) / 100 / 12, model.realMonthly, target);
      return { rate, months };
    });

    const nearest = table.reduce((best, row) =>
      Math.abs(row.rate - savingsRate) < Math.abs(best.rate - savingsRate) ? row : best
    );

    return { income, saved, savingsRate, investingRate, gap, table, nearest };
  }, [annualIncome, model]);

  const fireDateLabel = useMemo(() => {
    if (!today || model.months === null) return null;
    if (model.months <= 0) return "today";
    const date = new Date(today.getFullYear(), today.getMonth() + model.months, 1);
    return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  }, [model.months, today]);

  const fireAge = model.months === null ? null : model.age + model.months / 12;

  const summary = useMemo(
    () =>
      [
        "FIRE Number Calculator — summary",
        "",
        `Annual expenses: ${formatINR(model.expenses)}`,
        `Withdrawal rate: ${model.rate}% (${model.multiple.toFixed(1)}x expenses)`,
        `FIRE number: ${formatINR(model.fireNumber)} (${formatCompactINR(model.fireNumber)})`,
        "",
        `Current corpus: ${formatINR(model.corpus)}`,
        `Monthly investment: ${formatINR(model.monthly)}`,
        `Expected return: ${model.nominal}% | Inflation: ${model.infl}% | Real return: ${(model.realAnnual * 100).toFixed(2)}%`,
        `Progress to FIRE: ${model.progress.toFixed(1)}% — ${fireStage(model.progress).label}`,
        `Time to FIRE: ${formatYears(model.months)}${fireAge === null ? "" : ` (age ${fireAge.toFixed(1)})`}`,
        fireDateLabel ? `Estimated FIRE date: ${fireDateLabel}` : "",
        "",
        `Coast FIRE number at age ${model.age} (coasting to ${model.coastTarget}): ${formatINR(model.coastNumber)}`,
        model.coasting
          ? "Verdict: you are already coasting — existing corpus alone reaches your FIRE number."
          : `Verdict: not coasting yet — ${formatINR(model.coastGap)} short (${formatYears(model.monthsToCoast)} away).`,
        "",
        "Flavours:",
        ...flavours.map(
          (flavour) =>
            `  ${flavour.label} (${flavour.multiplier}x): ${formatINR(flavour.number)} — ${formatYears(flavour.months)}`
        ),
        "",
        `Annual take-home income: ${formatINR(savings.income)}`,
        `Savings rate: ${savings.savingsRate.toFixed(1)}% | Actually invested: ${savings.investingRate.toFixed(1)}%`,
        "",
        "All figures are in today's rupees. Growth uses the inflation-adjusted (real) return.",
      ]
        .filter(Boolean)
        .join("\n"),
    [fireAge, fireDateLabel, flavours, model, savings]
  );

  const copySummary = async () => {
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const reset = () => {
    setAnnualExpenses(600000);
    setWithdrawalRate(4);
    setCurrentCorpus(1500000);
    setMonthlyInvestment(50000);
    setExpectedReturn(12);
    setInflation(6);
    setCurrentAge(30);
    setCoastAge(60);
    setAnnualIncome(1200000);
  };

  const stage = fireStage(model.progress);
  const clampedProgress = Math.max(0, Math.min(100, model.progress));

  const rawWithdrawalRate = Number(withdrawalRate);
  const rateIsClamped = Number.isFinite(rawWithdrawalRate) && rawWithdrawalRate !== model.rate;

  const rawCoastAge = Number(coastAge) || 60;
  const coastAgeIsClamped = model.coastTarget !== rawCoastAge;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Flame className="h-4 w-4" />
            Financial independence
          </div>
          <h1 className="text-4xl font-semibold leading-tight">FIRE Number Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Work out the corpus that covers your expenses forever, the year you actually get there, and
            whether the money you already have could quietly coast you to the finish line on its own.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">Your numbers</span>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="grid gap-4">
              <NumberField
                label="Annual expenses (today)"
                value={annualExpenses}
                onChange={setAnnualExpenses}
                min={0}
                step={10000}
                suffix="₹"
                hint={`About ${formatINR(model.expenses / 12)} per month`}
              />

              <div>
                <span className="text-sm font-semibold">Safe withdrawal rate</span>
                <div className="mt-2 grid gap-2 sm:grid-cols-3 2xl:grid-cols-3">
                  {withdrawalPresets.map((preset) => (
                    <button
                      key={preset.rate}
                      type="button"
                      onClick={() => setWithdrawalRate(preset.rate)}
                      title={preset.hint}
                      aria-pressed={Number(withdrawalRate) === preset.rate}
                      className={`rounded-md border px-2 py-2 text-center text-sm font-semibold transition ${
                        Number(withdrawalRate) === preset.rate
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="mt-2">
                  <NumberField
                    label="Custom rate"
                    value={withdrawalRate}
                    onChange={setWithdrawalRate}
                    min={0.1}
                    max={12}
                    step={0.1}
                    suffix="%"
                    hint={`Your corpus multiple: ${model.multiple.toFixed(1)}x annual expenses`}
                  />
                  {rateIsClamped ? (
                    <p
                      className="mt-2 text-xs font-semibold text-[var(--anslation-ds-warning)]"
                      role="status"
                    >
                      Using {model.rate}% for the calculation — rates outside 0.1–12% aren&apos;t modelled.
                    </p>
                  ) : null}
                </div>
              </div>

              <NumberField
                label="Current invested corpus"
                value={currentCorpus}
                onChange={setCurrentCorpus}
                min={0}
                step={50000}
                suffix="₹"
              />
              <NumberField
                label="Monthly investment"
                value={monthlyInvestment}
                onChange={setMonthlyInvestment}
                min={0}
                step={1000}
                suffix="₹"
                hint={`${formatINR(model.monthly * 12)} invested per year`}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  label="Expected return"
                  value={expectedReturn}
                  onChange={setExpectedReturn}
                  min={-10}
                  max={30}
                  step={0.5}
                  suffix="%"
                />
                <NumberField
                  label="Inflation"
                  value={inflation}
                  onChange={setInflation}
                  min={0}
                  max={20}
                  step={0.5}
                  suffix="%"
                />
              </div>

              <div className="rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                <span className="font-semibold text-[var(--foreground)]">
                  Real return: {(model.realAnnual * 100).toFixed(2)}%
                </span>
                <br />
                Formula: (1 + return) / (1 + inflation) − 1. Every rupee on this page is in
                today&apos;s money, so your expenses stay comparable decades out.
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField label="Current age" value={currentAge} onChange={setCurrentAge} min={0} max={90} step={1} />
                <div>
                  <NumberField label="Coast to age" value={coastAge} onChange={setCoastAge} min={30} max={90} step={1} />
                  {coastAgeIsClamped ? (
                    <p
                      className="mt-2 text-xs font-semibold text-[var(--anslation-ds-warning)]"
                      role="status"
                    >
                      Raised to age {model.coastTarget} — you can&apos;t coast to an age younger than you already
                      are.
                    </p>
                  ) : null}
                </div>
              </div>

              <NumberField
                label="Annual take-home income"
                value={annualIncome}
                onChange={setAnnualIncome}
                min={0}
                step={50000}
                suffix="₹"
                hint="Used for the savings-rate insight below"
              />
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Your FIRE number at {model.rate}%
                </p>
                <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy summary"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-4" aria-live="polite">
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p className="text-4xl font-semibold text-[var(--primary)]">
                    {formatCompactINR(model.fireNumber)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{formatINR(model.fireNumber)}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]">
                  <Target className="h-4 w-4 text-[var(--primary)]" />
                  {model.multiple.toFixed(1)}x annual expenses
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: FIRE number = annual expenses ÷ withdrawal rate. At {model.rate}% you can draw{" "}
                {formatINR(model.expenses)} a year — {formatINR(model.expenses / 12)} a month — and expect the
                corpus to outlive you.
              </p>

              <div className="tool-compact-grid mt-6">
                <StatTile
                  label="Time to FIRE"
                  value={formatYears(model.months)}
                  hint={fireDateLabel ? `Around ${fireDateLabel}` : "Raise savings or returns"}
                />
                <StatTile
                  label="FIRE age"
                  value={fireAge === null ? "—" : fireAge.toFixed(1)}
                  hint={fireAge === null ? "Not within 80 years" : `From age ${model.age} today`}
                />
                <StatTile label="Still to build" value={formatCompactINR(Math.max(0, model.fireNumber - model.corpus))} />
                <StatTile label="Real return used" value={`${(model.realAnnual * 100).toFixed(2)}%`} hint="Inflation-adjusted" />
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">Progress to FIRE</p>
                <p className="text-sm font-semibold text-[var(--primary)]">{model.progress.toFixed(1)}%</p>
              </div>
              <div
                className="mt-3 h-4 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="progressbar"
                aria-valuenow={Math.round(clampedProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progress to FIRE"
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${clampedProgress}%`, background: "var(--primary)" }}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                  <TrendingUp className="h-3.5 w-3.5 text-[var(--primary)]" />
                  {stage.label}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">{stage.note}</span>
              </div>
              <div className="mt-4 grid gap-2 text-xs text-[var(--muted-foreground)] sm:grid-cols-3">
                <p>{formatCompactINR(model.corpus)} invested today</p>
                <p className="sm:text-center">{formatCompactINR(model.fireNumber / 2)} is the halfway mark</p>
                <p className="sm:text-right">{formatCompactINR(model.fireNumber)} is the finish line</p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">Coast FIRE — could you stop investing today?</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Coast FIRE is the corpus that, with zero further investing, grows on its own to your FIRE
                number by age {model.coastTarget}. Formula: FIRE number ÷ (1 + real return)
                <sup>years to {model.coastTarget}</sup>.
              </p>

              <div className="tool-compact-grid mt-4">
                <StatTile
                  label={`Coast number at ${model.age}`}
                  value={formatCompactINR(model.coastNumber)}
                  hint={`${model.yearsToCoastAge} years of growth left`}
                />
                <StatTile label="You have" value={formatCompactINR(model.corpus)} />
                <StatTile
                  label={model.coasting ? "Surplus" : "Shortfall"}
                  value={formatCompactINR(Math.abs(model.coastGap))}
                />
                <StatTile
                  label="Coast reached in"
                  value={model.coasting ? "Already" : formatYears(model.monthsToCoast)}
                />
              </div>

              <div
                className="mt-4 rounded-md border p-4 text-sm leading-6"
                style={{
                  borderColor: model.coasting ? "var(--anslation-ds-success)" : "var(--border)",
                  background: model.coasting ? "var(--anslation-ds-success-soft)" : "var(--muted)",
                }}
              >
                {model.coasting ? (
                  <span>
                    <span className="font-semibold">Yes — you are already coasting.</span> Your{" "}
                    {formatCompactINR(model.corpus)} alone should reach {formatCompactINR(model.fireNumber)} by
                    age {model.coastTarget}. Every rupee you invest from here only buys you an earlier date or a
                    fatter retirement.
                  </span>
                ) : (
                  <span>
                    <span className="font-semibold">Not yet.</span> You are{" "}
                    {formatCompactINR(model.coastGap)} short of the coast number. Keep investing{" "}
                    {formatINR(model.monthly)} a month and you hit coast in {formatYears(model.monthsToCoast)} —
                    after which you could downshift to a job that merely covers the bills.
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <p className="text-sm font-semibold">Lean, regular, or fat — pick your finish line</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Same withdrawal rate, different lifestyles. Multipliers apply to your {formatINR(model.expenses)}{" "}
            annual expenses.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                  <th className="py-2 pr-4 font-semibold">Flavour</th>
                  <th className="py-2 pr-4 font-semibold">Annual spend</th>
                  <th className="py-2 pr-4 font-semibold">Corpus needed</th>
                  <th className="py-2 pr-4 font-semibold">Time to reach</th>
                  <th className="py-2 font-semibold">Age</th>
                </tr>
              </thead>
              <tbody>
                {flavours.map((flavour) => (
                  <tr key={flavour.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-semibold">
                        {flavour.label}{" "}
                        <span className="text-[var(--muted-foreground)]">({flavour.multiplier}x)</span>
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{flavour.blurb}</p>
                    </td>
                    <td className="py-3 pr-4">{formatINR(flavour.expenses)}</td>
                    <td className="py-3 pr-4 font-semibold text-[var(--primary)]">
                      {formatCompactINR(flavour.number)}
                    </td>
                    <td className="py-3 pr-4">{formatYears(flavour.months)}</td>
                    <td className="py-3">{flavour.age === null ? "—" : flavour.age.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_420px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-[var(--primary)]" />
              <p className="text-sm font-semibold">Savings rate is the whole game</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Your income barely matters. What matters is the gap between what you earn and what you spend,
              because that gap simultaneously builds the corpus and shrinks the corpus you need.
            </p>

            <div className="tool-compact-grid mt-4">
              <StatTile
                label="Your savings rate"
                value={`${savings.savingsRate.toFixed(1)}%`}
                hint={`${formatINR(Math.max(0, savings.saved))} a year not spent`}
              />
              <StatTile
                label="Actually invested"
                value={`${savings.investingRate.toFixed(1)}%`}
                hint={`${formatINR(model.monthly * 12)} a year`}
              />
              <StatTile
                label={savings.gap >= 0 ? "Unaccounted" : "Over-investing"}
                value={formatINR(Math.abs(savings.gap))}
                hint={savings.gap >= 0 ? "Saved but not invested" : "Investing more than the gap"}
              />
            </div>

            {savings.gap > 1000 ? (
              <div
                className="mt-4 rounded-md border p-3 text-sm leading-6"
                style={{ borderColor: "var(--anslation-ds-warning)", background: "var(--anslation-ds-warning-soft)" }}
              >
                You save {formatINR(savings.saved)} a year but only invest {formatINR(model.monthly * 12)}. The
                missing {formatINR(savings.gap)} is sitting somewhere earning nothing. Put it to work and your
                FIRE date moves in.
              </div>
            ) : null}

            <div className="mt-5 overflow-x-auto">
              <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Savings rate vs years to FIRE — starting from zero, at your {(model.realAnnual * 100).toFixed(2)}% real
                return and {model.rate}% withdrawal
              </p>
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                    <th className="py-2 pr-4 font-semibold">Savings rate</th>
                    <th className="py-2 pr-4 font-semibold">Years to FIRE</th>
                    <th className="py-2 font-semibold">Working life</th>
                  </tr>
                </thead>
                <tbody>
                  {savings.table.map((row) => {
                    const highlight = row.rate === savings.nearest.rate;
                    return (
                      <tr
                        key={row.rate}
                        className="border-b border-[var(--border)] last:border-0"
                        style={highlight ? { background: "var(--muted)" } : undefined}
                      >
                        <td className="py-2 pr-4 font-semibold">
                          {row.rate}%
                          {highlight ? (
                            <span className="ml-2 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary-foreground)]">
                              you
                            </span>
                          ) : null}
                        </td>
                        <td className="py-2 pr-4">
                          {row.months === null ? "Never" : (row.months / 12).toFixed(1)}
                        </td>
                        <td className="py-2">
                          <div className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-[var(--muted)]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${row.months === null ? 100 : Math.min(100, (row.months / 12 / 70) * 100)}%`,
                                background: highlight ? "var(--primary)" : "var(--anslation-ds-secondary)",
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-semibold">The 4% rule was not written for India</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                It comes from the Trinity study: US portfolios, US inflation, a 30-year retirement. Three things
                are different here.
              </p>
              <ul className="mt-3 grid gap-3 text-sm leading-6 text-[var(--muted-foreground)]">
                <li className="rounded-md bg-[var(--muted)] p-3">
                  <span className="font-semibold text-[var(--foreground)]">Inflation runs hotter.</span> India has
                  lived around 5–7% for decades against the ~3% the rule assumes. Higher inflation eats the same
                  corpus faster.
                </li>
                <li className="rounded-md bg-[var(--muted)] p-3">
                  <span className="font-semibold text-[var(--foreground)]">Healthcare inflates faster still.</span>{" "}
                  Medical costs routinely outpace headline inflation, and premiums climb steeply after 60 — right
                  when you need cover most.
                </li>
                <li className="rounded-md bg-[var(--muted)] p-3">
                  <span className="font-semibold text-[var(--foreground)]">There is no safety net.</span> No social
                  security, no state pension worth planning around. Your corpus is the entire plan.
                </li>
                <li className="rounded-md bg-[var(--muted)] p-3">
                  <span className="font-semibold text-[var(--foreground)]">Retiring early means a longer draw.</span>{" "}
                  Stop at 45 and you may need 45+ years of withdrawals, not 30.
                </li>
              </ul>
              <div className="mt-4 rounded-md border border-[var(--primary)] bg-[var(--muted)] p-3 text-sm leading-6">
                <span className="font-semibold">A saner starting point: 3–3.5%.</span> That is 28–33x expenses
                instead of 25x. It costs you a few extra years of work and buys a plan that survives a bad first
                decade.
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawalRate(3.5)}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-xs"
                  >
                    Use 3.5% ({(100 / 3.5).toFixed(1)}x)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawalRate(3)}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-xs"
                  >
                    Use 3% (33.3x)
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">What this model assumes</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                <li>Every figure is in today&apos;s rupees, grown at the real (inflation-adjusted) return.</li>
                <li>Your monthly investment keeps pace with inflation, so it stays constant in real terms.</li>
                <li>Returns arrive smoothly. Real markets do not — sequence-of-returns risk is not modelled.</li>
                <li>Taxes on withdrawal, one-off goals, and any inheritance or windfall are excluded.</li>
              </ul>
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                Treat the output as a direction of travel, not a promise. Re-run it every year with real numbers.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
