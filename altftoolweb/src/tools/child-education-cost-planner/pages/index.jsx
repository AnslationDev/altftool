"use client";

import { useMemo, useState } from "react";
import { Copy, GraduationCap, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const pct = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

const money = (v) => inr.format(Number.isFinite(v) ? v : 0);
const rate = (v) => `${pct.format(Number.isFinite(v) ? v : 0)}%`;

const DEFAULTS = {
  annualFee: "600000",
  duration: "4",
  childAge: "6",
  startAge: "18",
  eduInflation: "10",
  returnRate: "12",
  savings: "200000",
};

const PRESETS = [
  { label: "Engineering in India (4 yrs)", annualFee: "300000", duration: "4", eduInflation: "10" },
  { label: "Private MBBS (5.5 yrs)", annualFee: "1500000", duration: "6", eduInflation: "10" },
  { label: "Overseas masters (2 yrs)", annualFee: "3500000", duration: "2", eduInflation: "8" },
];

const num = (v) => {
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : NaN;
};

export default function ToolHome() {
  const [annualFee, setAnnualFee] = useState(DEFAULTS.annualFee);
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [childAge, setChildAge] = useState(DEFAULTS.childAge);
  const [startAge, setStartAge] = useState(DEFAULTS.startAge);
  const [eduInflation, setEduInflation] = useState(DEFAULTS.eduInflation);
  const [returnRate, setReturnRate] = useState(DEFAULTS.returnRate);
  const [savings, setSavings] = useState(DEFAULTS.savings);
  const [copied, setCopied] = useState(false);

  const state = useMemo(() => {
    const fee = num(annualFee);
    const dur = num(duration);
    const age = num(childAge);
    const start = num(startAge);
    const g = num(eduInflation);
    const r = num(returnRate);
    const existing = num(savings);

    if ([fee, dur, age, start, g, r, existing].some((v) => Number.isNaN(v))) {
      return { error: "Enter a number in every field." };
    }
    if (fee <= 0) return { error: "Annual fee in today's money must be greater than 0." };
    if (dur < 1 || dur > 10) return { error: "Course duration must be between 1 and 10 years." };
    if (age < 0 || age > 25) return { error: "Child's current age must be between 0 and 25." };
    if (start <= age) return { error: "Course start age must be greater than the child's current age." };
    if (start > 35) return { error: "Course start age must be 35 or below." };
    if (g < 0 || g > 30) return { error: "Education inflation must be between 0% and 30%." };
    if (r < 0 || r > 30) return { error: "Expected return must be between 0% and 30%." };
    if (existing < 0) return { error: "Existing savings cannot be negative." };

    const yearsToGo = start - age;
    const gr = g / 100;
    const rr = r / 100;
    const D = Math.round(dur);

    // Fee for each academic year, inflated to the year it is actually paid
    const schedule = [];
    let corpusNeeded = 0;
    for (let d = 0; d < D; d += 1) {
      const feeThatYear = fee * Math.pow(1 + gr, yearsToGo + d);
      // Discount back to the goal date; money for later years keeps earning until it's spent
      const presentAtGoal = feeThatYear / Math.pow(1 + rr, d);
      corpusNeeded += presentAtGoal;
      schedule.push({
        year: d + 1,
        childAge: start + d,
        fee: feeThatYear,
      });
    }

    const totalSpend = schedule.reduce((sum, row) => sum + row.fee, 0);
    const futureSavings = existing * Math.pow(1 + rr, yearsToGo);
    const gap = Math.max(0, corpusNeeded - futureSavings);

    const monthlyRate = rr / 12;
    const months = Math.round(yearsToGo * 12);
    let monthlySip = 0;
    if (gap > 0 && months > 0) {
      if (monthlyRate === 0) {
        monthlySip = gap / months;
      } else {
        const factor = ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        monthlySip = gap / factor;
      }
    }
    const lumpsumToday = gap > 0 ? gap / Math.pow(1 + rr, yearsToGo) : 0;
    const totalInvested = monthlySip * months;

    return {
      yearsToGo,
      months,
      schedule,
      firstYearFee: schedule[0]?.fee || 0,
      totalSpend,
      corpusNeeded,
      futureSavings,
      gap,
      monthlySip,
      lumpsumToday,
      totalInvested,
      growth: Math.max(0, gap - totalInvested),
      todayTotal: fee * D,
      funded: gap === 0,
      inputs: { fee, D, g, r, existing },
    };
  }, [annualFee, duration, childAge, startAge, eduInflation, returnRate, savings]);

  const report = useMemo(() => {
    if (state.error) return "";
    return [
      "Child Education Cost Planner",
      `Annual fee today: ${money(state.inputs.fee)} x ${state.inputs.D} years = ${money(state.todayTotal)}`,
      `Years to go: ${state.yearsToGo}`,
      `Education inflation: ${rate(state.inputs.g)} p.a. | Expected return: ${rate(state.inputs.r)} p.a.`,
      `First-year fee at admission: ${money(state.firstYearFee)}`,
      `Total fees over the course (future value): ${money(state.totalSpend)}`,
      `Corpus needed at admission: ${money(state.corpusNeeded)}`,
      `Existing savings grow to: ${money(state.futureSavings)}`,
      `Shortfall to fund: ${money(state.gap)}`,
      `Monthly SIP needed: ${money(state.monthlySip)}`,
      `Or one-time lumpsum today: ${money(state.lumpsumToday)}`,
    ].join("\n");
  }, [state]);

  const copyResult = async () => {
    if (!report) return;
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reset = () => {
    setAnnualFee(DEFAULTS.annualFee);
    setDuration(DEFAULTS.duration);
    setChildAge(DEFAULTS.childAge);
    setStartAge(DEFAULTS.startAge);
    setEduInflation(DEFAULTS.eduInflation);
    setReturnRate(DEFAULTS.returnRate);
    setSavings(DEFAULTS.savings);
  };

  const inputClass =
    "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "block text-sm font-semibold text-[var(--foreground)]";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <GraduationCap className="h-4 w-4" />
            Goal planning
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Child Education Cost Planner
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
            See what a course costing today&apos;s fees will actually cost when your child enrols, and
            the monthly SIP that closes the gap.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="cec-fee">
                    Annual fee today (₹)
                  </label>
                  <input
                    id="cec-fee"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="10000"
                    value={annualFee}
                    onChange={(e) => setAnnualFee(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="cec-duration">
                    Course duration (years)
                  </label>
                  <input
                    id="cec-duration"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="10"
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="cec-child-age">
                    Child&apos;s age now
                  </label>
                  <input
                    id="cec-child-age"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="25"
                    step="1"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="cec-start-age">
                    Age when course starts
                  </label>
                  <input
                    id="cec-start-age"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="35"
                    step="1"
                    value={startAge}
                    onChange={(e) => setStartAge(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="cec-edu-inflation">
                    Education inflation (% p.a.)
                  </label>
                  <input
                    id="cec-edu-inflation"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="30"
                    step="0.5"
                    value={eduInflation}
                    onChange={(e) => setEduInflation(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="cec-return">
                    Expected return (% p.a.)
                  </label>
                  <input
                    id="cec-return"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="30"
                    step="0.5"
                    value={returnRate}
                    onChange={(e) => setReturnRate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="cec-savings">
                  Already saved for this goal (₹)
                </label>
                <input
                  id="cec-savings"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10000"
                  value={savings}
                  onChange={(e) => setSavings(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold">Typical courses</p>
                <div className="grid gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setAnnualFee(preset.annualFee);
                        setDuration(preset.duration);
                        setEduInflation(preset.eduInflation);
                      }}
                      className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={reset}
                aria-label="Reset all inputs to defaults"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {state.error ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {state.error}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Monthly SIP needed
                    </p>
                    <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                      {money(state.monthlySip)}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      for {state.yearsToGo} {state.yearsToGo === 1 ? "year" : "years"} ({state.months} months)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyResult}
                    aria-label="Copy the education cost plan"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy plan"}
                  </button>
                </div>

                {state.funded ? (
                  <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--success)]">
                    Your existing savings already cover this goal at the assumed return — no fresh SIP
                    is needed.
                  </p>
                ) : null}

                <dl className="mt-5 grid gap-3">
                  {[
                    ["Cost in today's money", money(state.todayTotal)],
                    ["First-year fee at admission", money(state.firstYearFee)],
                    ["Total fees over the course (future)", money(state.totalSpend)],
                    ["Corpus needed on admission day", money(state.corpusNeeded)],
                    ["Existing savings will grow to", money(state.futureSavings)],
                    ["Shortfall to fund", money(state.gap)],
                    ["Or invest a lumpsum today", money(state.lumpsumToday)],
                    ["Total you would invest via SIP", money(state.totalInvested)],
                    ["Growth the SIP contributes", money(state.growth)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                    >
                      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
                      <dd className="text-sm font-semibold text-[var(--foreground)]">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6">
                  <p className="mb-2 text-sm font-semibold">Year-wise fee at the time of payment</p>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[280px] text-left text-sm">
                      <thead>
                        <tr className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                          <th scope="col" className="py-2 pr-3 font-semibold">Course year</th>
                          <th scope="col" className="py-2 pr-3 font-semibold">Child&apos;s age</th>
                          <th scope="col" className="py-2 font-semibold">Fee payable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.schedule.map((row) => (
                          <tr key={row.year} className="border-t border-[var(--border)]">
                            <td className="py-2 pr-3">Year {row.year}</td>
                            <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.childAge}</td>
                            <td className="py-2 font-semibold">{money(row.fee)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
                  Each year&apos;s fee is inflated at the education inflation rate to the year it is
                  paid, then discounted back to admission day at your expected return — money for
                  later years keeps earning until it is spent. SIP is assumed to be invested at the
                  start of each month. Estimates only, not investment advice.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
