"use client";

import { useMemo, useState } from "react";
import {
  Armchair,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Copy,
  Hourglass,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatINR = (value) => inrFormatter.format(Math.round(Number.isFinite(value) ? value : 0));

const formatINRShort = (value) => {
  const safe = Number.isFinite(value) ? value : 0;
  const sign = safe < 0 ? "-" : "";
  const abs = Math.abs(safe);
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
  if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1)}k`;
  return `${sign}₹${Math.round(abs)}`;
};

const clampNumber = (value, min, max) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

const defaults = {
  currentAge: 30,
  retireAge: 60,
  lifeExpectancy: 85,
  monthlyExpenses: 50000,
  existingCorpus: 500000,
  inflation: 6,
  preReturn: 12,
  postReturn: 8,
};

const presets = [
  { label: "Early starter, 25", currentAge: 25, retireAge: 55, monthlyExpenses: 40000, existingCorpus: 200000 },
  { label: "Classic plan, 30", currentAge: 30, retireAge: 60, monthlyExpenses: 50000, existingCorpus: 500000 },
  { label: "Late starter, 40", currentAge: 40, retireAge: 62, monthlyExpenses: 70000, existingCorpus: 1500000 },
];

function NumberField({ label, value, onChange, suffix, min, max, step, hint }) {
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
          className={`h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)] ${
            suffix ? "pr-20" : ""
          }`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--muted-foreground)]">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{hint}</span> : null}
    </label>
  );
}

function StatTile({ label, main, sub }) {
  return (
    <div className="rounded-lg bg-[var(--muted)] p-5">
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[var(--primary)]">{main}</p>
      {sub ? <p className="mt-1 text-sm text-[var(--muted-foreground)]">{sub}</p> : null}
    </div>
  );
}

export default function ToolHome() {
  const [currentAge, setCurrentAge] = useState(defaults.currentAge);
  const [retireAge, setRetireAge] = useState(defaults.retireAge);
  const [lifeExpectancy, setLifeExpectancy] = useState(defaults.lifeExpectancy);
  const [monthlyExpenses, setMonthlyExpenses] = useState(defaults.monthlyExpenses);
  const [existingCorpus, setExistingCorpus] = useState(defaults.existingCorpus);
  const [inflation, setInflation] = useState(defaults.inflation);
  const [preReturn, setPreReturn] = useState(defaults.preReturn);
  const [postReturn, setPostReturn] = useState(defaults.postReturn);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(() => {
    const ageNow = clampNumber(Number(currentAge) || 0, 10, 90);
    const ageRetire = clampNumber(Number(retireAge) || 0, 10, 95);
    const ageEnd = clampNumber(Number(lifeExpectancy) || 0, 40, 110);
    const expensesNow = clampNumber(Number(monthlyExpenses) || 0, 0, 1e9);
    const corpusNow = clampNumber(Number(existingCorpus) || 0, 0, 1e12);
    const g = clampNumber(Number(inflation) || 0, 0, 20) / 100;
    const rPre = clampNumber(Number(preReturn) || 0, 0, 30) / 100;
    const rPost = clampNumber(Number(postReturn) || 0, 0, 30) / 100;

    const invalidAges = ageRetire <= ageNow || ageEnd <= ageRetire;
    const yearsToRetire = Math.max(0, Math.round(ageRetire - ageNow));
    const retirementYears = Math.max(1, Math.round(ageEnd - ageRetire));

    const monthlyAtRetirement = expensesNow * Math.pow(1 + g, yearsToRetire);
    const annualAtRetirement = monthlyAtRetirement * 12;
    const realRate = (1 + rPost) / (1 + g) - 1;
    const corpusRequired =
      Math.abs(realRate) < 1e-9
        ? annualAtRetirement * retirementYears
        : ((annualAtRetirement * (1 - Math.pow(1 + realRate, -retirementYears))) / realRate) *
          (1 + realRate);

    const monthlyRate = rPre / 12;
    const months = yearsToRetire * 12;
    const corpusFv = corpusNow * Math.pow(1 + monthlyRate, months);
    const gap = Math.max(0, corpusRequired - corpusFv);
    const sipFactor =
      monthlyRate === 0
        ? months
        : ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const monthlySip = months > 0 && gap > 0 && sipFactor > 0 ? gap / sipFactor : 0;
    const coverage = corpusRequired > 0 ? Math.min(100, (corpusFv / corpusRequired) * 100) : 0;

    const delayYears = 5;
    let delayed = null;
    if (yearsToRetire > delayYears && gap > 0) {
      const lateMonths = (yearsToRetire - delayYears) * 12;
      const lateFactor =
        monthlyRate === 0
          ? lateMonths
          : ((Math.pow(1 + monthlyRate, lateMonths) - 1) / monthlyRate) * (1 + monthlyRate);
      const lateSip = gap / lateFactor;
      delayed = {
        startAge: ageNow + delayYears,
        sip: lateSip,
        extraMonthly: lateSip - monthlySip,
        extraInvested: lateSip * lateMonths - monthlySip * months,
      };
    }

    const rows = [];
    let corpus = corpusNow;
    for (let year = 0; year < yearsToRetire; year++) {
      const start = corpus;
      for (let month = 0; month < 12; month++) {
        corpus = (corpus + monthlySip) * (1 + monthlyRate);
      }
      const invested = monthlySip * 12;
      rows.push({
        age: ageNow + year + 1,
        phase: "grow",
        flow: invested,
        growth: corpus - start - invested,
        end: corpus,
      });
    }
    let withdrawal = annualAtRetirement;
    for (let year = 0; year < retirementYears; year++) {
      const start = corpus;
      corpus = (corpus - withdrawal) * (1 + rPost);
      rows.push({
        age: ageRetire + year + 1,
        phase: "draw",
        flow: -withdrawal,
        growth: corpus - (start - withdrawal),
        end: Math.abs(corpus) < 1 ? 0 : corpus,
      });
      withdrawal *= 1 + g;
    }

    return {
      ageNow,
      ageRetire,
      ageEnd,
      expensesNow,
      corpusNow,
      g,
      rPre,
      rPost,
      invalidAges,
      yearsToRetire,
      retirementYears,
      monthlyAtRetirement,
      annualAtRetirement,
      realRate,
      corpusRequired,
      corpusFv,
      gap,
      monthlySip,
      coverage,
      delayed,
      rows,
    };
  }, [currentAge, retireAge, lifeExpectancy, monthlyExpenses, existingCorpus, inflation, preReturn, postReturn]);

  const report = useMemo(
    () =>
      [
        "Retirement Corpus Plan - ALTFTool",
        `Age ${plan.ageNow} -> retire at ${plan.ageRetire}, plan till ${plan.ageEnd}`,
        `Monthly expenses today: ${formatINR(plan.expensesNow)}`,
        `Expenses at ${plan.ageRetire} (${(plan.g * 100).toFixed(1)}% inflation): ${formatINR(plan.monthlyAtRetirement)}/month`,
        `Required corpus at ${plan.ageRetire}: ${formatINRShort(plan.corpusRequired)} (${formatINR(plan.corpusRequired)})`,
        `Existing corpus ${formatINR(plan.corpusNow)} grows to ${formatINRShort(plan.corpusFv)} by ${plan.ageRetire}`,
        `Gap to build: ${formatINRShort(plan.gap)}`,
        `Required SIP: ${formatINR(plan.monthlySip)}/month for ${plan.yearsToRetire} years at ${(plan.rPre * 100).toFixed(1)}% pre-retirement return`,
        plan.delayed
          ? `Start at ${plan.delayed.startAge} instead and the SIP jumps to ${formatINR(plan.delayed.sip)}/month (+${formatINR(plan.delayed.extraMonthly)}/month)`
          : "",
        `Assumptions: inflation ${(plan.g * 100).toFixed(1)}%, post-retirement return ${(plan.rPost * 100).toFixed(1)}%, real post-retirement rate ${(plan.realRate * 100).toFixed(2)}%`,
        `Generated: ${new Date().toLocaleString()}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [plan]
  );

  const applyPreset = (preset) => {
    setCurrentAge(preset.currentAge);
    setRetireAge(preset.retireAge);
    setMonthlyExpenses(preset.monthlyExpenses);
    setExistingCorpus(preset.existingCorpus);
  };

  const resetAll = () => {
    setCurrentAge(defaults.currentAge);
    setRetireAge(defaults.retireAge);
    setLifeExpectancy(defaults.lifeExpectancy);
    setMonthlyExpenses(defaults.monthlyExpenses);
    setExistingCorpus(defaults.existingCorpus);
    setInflation(defaults.inflation);
    setPreReturn(defaults.preReturn);
    setPostReturn(defaults.postReturn);
  };

  const copyPlan = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Armchair className="h-4 w-4" />
            Retirement planning
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Retirement Corpus Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            See how much your current lifestyle really costs at retirement after inflation, the corpus that funds
            it till your planned age, and the monthly SIP that closes the gap.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[400px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Your details</h2>
            <div className="mt-4 grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Current age" value={currentAge} onChange={setCurrentAge} suffix="yrs" min={10} max={90} step={1} />
                <NumberField label="Retire at" value={retireAge} onChange={setRetireAge} suffix="yrs" min={30} max={95} step={1} />
              </div>
              <NumberField
                label="Current monthly expenses"
                value={monthlyExpenses}
                onChange={setMonthlyExpenses}
                suffix="₹/mo"
                min={0}
                step={1000}
                hint="The household spend you want to sustain after retiring"
              />
              <NumberField
                label="Existing retirement corpus"
                value={existingCorpus}
                onChange={setExistingCorpus}
                suffix="₹"
                min={0}
                step={50000}
                hint="EPF, NPS, mutual funds already earmarked for retirement"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAssumptions((open) => !open)}
              aria-expanded={showAssumptions}
              className="mt-5 flex w-full items-center justify-between rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-left text-sm font-semibold transition hover:border-[var(--primary)]"
            >
              <span>
                Assumptions ({inflation}% inflation, {preReturn}% / {postReturn}% returns)
              </span>
              {showAssumptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showAssumptions ? (
              <div className="mt-3 grid gap-4 rounded-md bg-[var(--muted)] p-4">
                <NumberField label="Plan till age (life expectancy)" value={lifeExpectancy} onChange={setLifeExpectancy} suffix="yrs" min={40} max={110} step={1} />
                <NumberField label="Inflation" value={inflation} onChange={setInflation} suffix="%/yr" min={0} max={20} step={0.5} />
                <NumberField label="Pre-retirement return" value={preReturn} onChange={setPreReturn} suffix="%/yr" min={0} max={30} step={0.5} hint="Equity-heavy growth phase" />
                <NumberField label="Post-retirement return" value={postReturn} onChange={setPostReturn} suffix="%/yr" min={0} max={30} step={0.5} hint="Safer allocation once withdrawals begin" />
              </div>
            ) : null}

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quick presets</span>
                <button type="button" onClick={resetAll} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 2xl:grid-cols-1">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 self-start">
            {plan.invalidAges ? (
              <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-sm shadow-[var(--anslation-ds-shadow-sm)]">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--anslation-ds-danger)]" />
                <p className="text-[var(--muted-foreground)]">
                  For a meaningful plan, keep retirement age above current age and life expectancy above retirement
                  age. Results below floor the out-of-order years at zero.
                </p>
              </div>
            ) : null}

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Your retirement plan</p>
                <button type="button" onClick={copyPlan} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy plan"}
                </button>
              </div>

              <div aria-live="polite" className="mt-4 grid gap-4 sm:grid-cols-2">
                <StatTile
                  label={`Corpus needed at ${plan.ageRetire}`}
                  main={formatINRShort(plan.corpusRequired)}
                  sub={`${formatINR(plan.corpusRequired)} funds ${plan.retirementYears} years of rising expenses`}
                />
                <StatTile
                  label="Monthly SIP to get there"
                  main={plan.yearsToRetire > 0 ? formatINR(plan.monthlySip) : "—"}
                  sub={
                    plan.yearsToRetire > 0
                      ? `for ${plan.yearsToRetire} years at ${(plan.rPre * 100).toFixed(1)}% • gap ${formatINRShort(plan.gap)}`
                      : "No accumulation years left before retirement age"
                  }
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4 text-[var(--anslation-ds-danger)]" />
                  {formatINR(plan.expensesNow)} today &asymp; {formatINRShort(plan.monthlyAtRetirement)}/month at {plan.ageRetire}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]">
                  <Wallet className="h-4 w-4 text-[var(--primary)]" />
                  Existing corpus grows to {formatINRShort(plan.corpusFv)} — {plan.coverage.toFixed(0)}% of target
                </span>
                {plan.gap === 0 ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--anslation-ds-success)]">
                    <Sparkles className="h-4 w-4" />
                    Existing corpus alone compounds past the target — no fresh SIP needed
                  </span>
                ) : null}
              </div>

              <div className="mt-5 rounded-md bg-[var(--muted)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
                How the math works: expenses are inflated for {plan.yearsToRetire} years, then the corpus is the
                present value of {plan.retirementYears} years of inflation-growing withdrawals (paid at the start of
                each year) discounted at the real post-retirement rate ((1 + {(plan.rPost * 100).toFixed(1)}%) / (1 +{" "}
                {(plan.g * 100).toFixed(1)}%) − 1 = {(plan.realRate * 100).toFixed(2)}%). The SIP is sized so your
                existing corpus plus monthly investing exactly reach that corpus.
              </div>
            </div>

            {plan.delayed ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <Hourglass className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">The cost of waiting 5 years</h2>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Start today (age {plan.ageNow})</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--anslation-ds-success)]">{formatINR(plan.monthlySip)}/mo</p>
                  </div>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Start at age {plan.delayed.startAge}</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--anslation-ds-danger)]">{formatINR(plan.delayed.sip)}/mo</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  Waiting five years costs <span className="font-semibold text-[var(--anslation-ds-danger)]">{formatINR(plan.delayed.extraMonthly)} more every month</span>{" "}
                  and about <span className="font-semibold text-[var(--anslation-ds-danger)]">{formatINRShort(plan.delayed.extraInvested)}</span> more contributed overall,
                  for the same corpus. Compounding rewards the early start.
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Year-wise journey: build, then draw down</h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-[var(--muted-foreground)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: "var(--primary)" }} />
                Accumulation
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: "var(--anslation-ds-danger)" }} />
                Drawdown
              </span>
            </div>
          </div>
          <div className="mt-4 max-h-[430px] overflow-x-auto overflow-y-auto rounded-md border border-[var(--border)]">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-[var(--muted-foreground)]">
                  <th className="sticky top-0 bg-[var(--card)] px-3 py-2 font-semibold">Age</th>
                  <th className="sticky top-0 bg-[var(--card)] px-3 py-2 font-semibold">Phase</th>
                  <th className="sticky top-0 bg-[var(--card)] px-3 py-2 font-semibold">Invested / withdrawn</th>
                  <th className="sticky top-0 bg-[var(--card)] px-3 py-2 font-semibold">Growth</th>
                  <th className="sticky top-0 bg-[var(--card)] px-3 py-2 font-semibold">Corpus at year end</th>
                </tr>
              </thead>
              <tbody>
                {plan.rows.map((row) => (
                  <tr key={row.age} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 font-semibold">{row.age}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold ${
                          row.phase === "grow" ? "text-[var(--primary)]" : "text-[var(--anslation-ds-danger)]"
                        }`}
                      >
                        {row.phase === "grow" ? "Accumulate" : "Withdraw"}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-2 ${
                        row.flow < 0 ? "text-[var(--anslation-ds-danger)]" : "text-[var(--anslation-ds-success)]"
                      }`}
                    >
                      {row.flow < 0 ? "−" : "+"}
                      {formatINR(Math.abs(row.flow))}
                    </td>
                    <td className="px-3 py-2 text-[var(--muted-foreground)]">{formatINR(row.growth)}</td>
                    <td className={`px-3 py-2 font-semibold ${row.end < 0 ? "text-[var(--anslation-ds-danger)]" : ""}`}>
                      {formatINR(row.end)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Accumulation compounds monthly at {(plan.rPre * 100).toFixed(1)}% with the SIP invested at the start of
            each month. Drawdown withdraws a full year of expenses at the start of each year, growing{" "}
            {(plan.g * 100).toFixed(1)}% annually, while the balance earns {(plan.rPost * 100).toFixed(1)}%. A plan on
            track ends near zero at age {plan.ageEnd}.
          </p>
        </section>
      </div>
    </main>
  );
}
