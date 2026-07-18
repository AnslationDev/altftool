"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Copy, Info, RotateCcw, Target, TrendingUp } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const presets = [
  { label: "First job", monthly: 5000, stepUp: 10, ret: 12, years: 25 },
  { label: "Steady climb", monthly: 10000, stepUp: 10, ret: 12, years: 15 },
  { label: "Aggressive saver", monthly: 25000, stepUp: 15, ret: 12, years: 20 },
];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrPrecise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const plain = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const formatMoney = (value) => inr.format(Number.isFinite(value) ? value : 0);
const formatMoneyPrecise = (value) => inrPrecise.format(Number.isFinite(value) ? value : 0);

function formatCompact(value) {
  if (!Number.isFinite(value) || value <= 0) return "0";
  if (value >= 10000000) return `${plain.format(value / 10000000)} Cr`;
  if (value >= 100000) return `${plain.format(value / 100000)} L`;
  return plain.format(Math.round(value));
}

function accumulate({ monthly, stepUp, ret, years }) {
  const rate = ret / 100 / 12;
  const step = 1 + stepUp / 100;
  let balance = 0;
  let invested = 0;
  const rows = [];

  for (let year = 0; year < years; year += 1) {
    const contribution = monthly * Math.pow(step, year);
    let yearInvested = 0;
    for (let month = 0; month < 12; month += 1) {
      balance = (balance + contribution) * (1 + rate);
      invested += contribution;
      yearInvested += contribution;
    }
    rows.push({
      year: year + 1,
      monthly: contribution,
      yearInvested,
      cumulativeInvested: invested,
      corpus: balance,
    });
  }

  return { corpus: balance, invested, gain: balance - invested, rows };
}

function solveMonthly({ target, stepUp, ret, years }) {
  if (target <= 0 || years <= 0) return 0;
  let lo = 0;
  let hi = 1000;
  let guard = 0;
  while (accumulate({ monthly: hi, stepUp, ret, years }).corpus < target && guard < 60) {
    hi *= 2;
    guard += 1;
  }
  for (let i = 0; i < 80; i += 1) {
    const mid = (lo + hi) / 2;
    if (accumulate({ monthly: mid, stepUp, ret, years }).corpus < target) lo = mid;
    else hi = mid;
  }
  return hi;
}

export default function ToolHome() {
  const [tab, setTab] = useState("projection");
  const [monthly, setMonthly] = useState(10000);
  const [stepUp, setStepUp] = useState(10);
  const [ret, setRet] = useState(12);
  const [years, setYears] = useState(15);
  const [target, setTarget] = useState(10000000);
  const [copied, setCopied] = useState(false);

  const inputs = useMemo(
    () => ({
      monthly: Math.max(0, Number(monthly) || 0),
      stepUp: Math.max(0, Number(stepUp) || 0),
      ret: Math.max(0, Number(ret) || 0),
      years: Math.min(Math.max(Math.round(Number(years) || 0), 1), 40),
      target: Math.max(0, Number(target) || 0),
    }),
    [monthly, ret, stepUp, target, years]
  );

  const stepUpPlan = useMemo(
    () => accumulate({ monthly: inputs.monthly, stepUp: inputs.stepUp, ret: inputs.ret, years: inputs.years }),
    [inputs.monthly, inputs.ret, inputs.stepUp, inputs.years]
  );

  const flatPlan = useMemo(
    () => accumulate({ monthly: inputs.monthly, stepUp: 0, ret: inputs.ret, years: inputs.years }),
    [inputs.monthly, inputs.ret, inputs.years]
  );

  const advantage = stepUpPlan.corpus - flatPlan.corpus;
  const wealthRatio = stepUpPlan.invested > 0 ? stepUpPlan.corpus / stepUpPlan.invested : 0;
  const maxCorpus = useMemo(
    () => Math.max(...stepUpPlan.rows.map((row) => row.corpus), 1),
    [stepUpPlan.rows]
  );

  const goal = useMemo(() => {
    const required = solveMonthly({
      target: inputs.target,
      stepUp: inputs.stepUp,
      ret: inputs.ret,
      years: inputs.years,
    });
    const rounded = Math.ceil(required / 100) * 100;
    const check = accumulate({ monthly: rounded, stepUp: inputs.stepUp, ret: inputs.ret, years: inputs.years });
    const flatRequired = solveMonthly({ target: inputs.target, stepUp: 0, ret: inputs.ret, years: inputs.years });
    return { required, rounded, check, flatRequired: Math.ceil(flatRequired / 100) * 100 };
  }, [inputs.ret, inputs.stepUp, inputs.target, inputs.years]);

  const summary = useMemo(() => {
    if (tab === "goal") {
      return [
        "Step-Up SIP — Goal Seek",
        `Target corpus: ${formatMoney(inputs.target)}`,
        `Horizon: ${inputs.years} years at ${inputs.ret}% expected return`,
        `Annual step-up: ${inputs.stepUp}%`,
        `Required starting SIP: ${formatMoney(goal.rounded)} per month`,
        `Final year SIP would be: ${formatMoney(goal.check.rows[goal.check.rows.length - 1]?.monthly || 0)}`,
        `Total invested: ${formatMoney(goal.check.invested)}`,
        `Projected corpus: ${formatMoney(goal.check.corpus)}`,
        `A flat SIP with no step-up would need: ${formatMoney(goal.flatRequired)} per month`,
        "",
        `Generated: ${new Date().toLocaleString()}`,
      ].join("\n");
    }

    return [
      "Step-Up SIP Calculator",
      `Starting SIP: ${formatMoney(inputs.monthly)} per month`,
      `Annual step-up: ${inputs.stepUp}% | Expected return: ${inputs.ret}% | Horizon: ${inputs.years} years`,
      "",
      `Step-up corpus: ${formatMoney(stepUpPlan.corpus)}`,
      `Total invested: ${formatMoney(stepUpPlan.invested)}`,
      `Wealth gained: ${formatMoney(stepUpPlan.gain)} (wealth ratio ${wealthRatio.toFixed(2)}x)`,
      "",
      `Flat SIP corpus: ${formatMoney(flatPlan.corpus)} on ${formatMoney(flatPlan.invested)} invested`,
      `Step-up advantage: ${formatMoney(advantage)}`,
      `Final year SIP: ${formatMoney(stepUpPlan.rows[stepUpPlan.rows.length - 1]?.monthly || 0)}`,
      "",
      `Generated: ${new Date().toLocaleString()}`,
    ].join("\n");
  }, [advantage, flatPlan, goal, inputs, stepUpPlan, tab, wealthRatio]);

  const copySummary = async () => {
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const applyPreset = (preset) => {
    setMonthly(preset.monthly);
    setStepUp(preset.stepUp);
    setRet(preset.ret);
    setYears(preset.years);
  };

  const reset = () => {
    setMonthly(10000);
    setStepUp(10);
    setRet(12);
    setYears(15);
    setTarget(10000000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <TrendingUp className="h-4 w-4" />
            Wealth building
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Step-Up SIP Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Your salary rises every year — your SIP can too. Raise the instalment by a fixed percentage each year and
            watch the corpus pull away from a flat SIP, calculated month by month with no shortcuts.
          </p>
        </section>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {[
            { id: "projection", label: "Projection", icon: TrendingUp },
            { id: "goal", label: "Goal seek", icon: Target },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-pressed={tab === item.id}
                className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm font-semibold transition ${
                  tab === item.id
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-4">
              {tab === "goal" ? (
                <label className="block">
                  <span className="text-sm font-semibold">Target corpus</span>
                  <input
                    type="number"
                    min="0"
                    value={target}
                    onChange={(event) => setTarget(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                  <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                    {formatCompact(inputs.target)} — what you want at the end of the horizon.
                  </span>
                </label>
              ) : (
                <label className="block">
                  <span className="text-sm font-semibold">Monthly SIP</span>
                  <input
                    type="number"
                    min="0"
                    value={monthly}
                    onChange={(event) => setMonthly(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
              )}

              <label className="block">
                <span className="text-sm font-semibold">Annual step-up ({inputs.stepUp}%)</span>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={inputs.stepUp}
                  onChange={(event) => setStepUp(event.target.value)}
                  className="mt-3 w-full accent-[var(--primary)]"
                />
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  Raise the instalment by this much every 12 months.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Expected return (% a year)</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={ret}
                  onChange={(event) => setRet(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Horizon ({inputs.years} years)</span>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={inputs.years}
                  onChange={(event) => setYears(event.target.value)}
                  className="mt-3 w-full accent-[var(--primary)]"
                />
              </label>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quick presets</span>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
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

            <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--muted)] p-3">
              <p className="text-xs text-[var(--muted-foreground)]">Formula</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                Every month: corpus = (corpus + instalment) x (1 + return / 12). The instalment itself is multiplied by
                (1 + step-up) once every 12 months. No annualised shortcut — all {inputs.years * 12} months are simulated.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {tab === "goal" ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Starting SIP needed for {formatCompact(inputs.target)}
                  </p>
                  <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy summary"}
                  </button>
                </div>
                <p className="mt-3 text-4xl font-semibold text-[var(--primary)]" aria-live="polite">
                  {formatMoney(goal.rounded)}
                  <span className="ml-2 text-lg font-semibold text-[var(--muted-foreground)]">a month</span>
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Start here, raise it {inputs.stepUp}% every year for {inputs.years} years at {inputs.ret}% and you land
                  on {formatMoney(goal.check.corpus)}. Solved by binary search over the same month-by-month simulation.
                </p>

                <div className="tool-compact-grid mt-6">
                  {[
                    ["Final year SIP", formatMoney(goal.check.rows[goal.check.rows.length - 1]?.monthly || 0)],
                    ["Total invested", formatMoney(goal.check.invested)],
                    ["Wealth gained", formatMoney(goal.check.gain)],
                    ["Flat SIP would need", formatMoney(goal.flatRequired)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                      <p className="mt-1 font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                {goal.flatRequired > goal.rounded && (
                  <div className="mt-5 flex items-start gap-2 rounded-md border border-[var(--border)] bg-[var(--muted)] p-3 text-sm leading-6">
                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--anslation-ds-success)" }} />
                    <span>
                      Stepping up {inputs.stepUp}% a year lets you begin{" "}
                      <strong>{formatMoney(goal.flatRequired - goal.rounded)} lighter</strong> every month than a flat
                      SIP chasing the same goal — easier to start today, and your future raises carry the rest.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Corpus after {inputs.years} years
                  </p>
                  <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy summary"}
                  </button>
                </div>
                <p className="mt-3 text-4xl font-semibold text-[var(--primary)]" aria-live="polite">
                  {formatMoney(stepUpPlan.corpus)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  About {formatCompact(stepUpPlan.corpus)} — step-up adds{" "}
                  <strong style={{ color: "var(--anslation-ds-success)" }}>{formatMoney(advantage)}</strong> over a flat{" "}
                  {formatMoney(inputs.monthly)} SIP.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      title: `Step-up SIP (${inputs.stepUp}% a year)`,
                      corpus: stepUpPlan.corpus,
                      invested: stepUpPlan.invested,
                      gain: stepUpPlan.gain,
                      accent: "var(--primary)",
                    },
                    {
                      title: "Flat SIP (no step-up)",
                      corpus: flatPlan.corpus,
                      invested: flatPlan.invested,
                      gain: flatPlan.gain,
                      accent: "var(--muted-foreground)",
                    },
                  ].map((card) => (
                    <div key={card.title} className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
                      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{card.title}</p>
                      <p className="mt-2 text-2xl font-semibold" style={{ color: card.accent }}>
                        {formatMoney(card.corpus)}
                      </p>
                      <div className="mt-3 grid gap-1 text-xs text-[var(--muted-foreground)]">
                        <div className="flex justify-between gap-2">
                          <span>Invested</span>
                          <span className="font-semibold text-[var(--foreground)]">{formatMoney(card.invested)}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span>Returns</span>
                          <span className="font-semibold text-[var(--foreground)]">{formatMoney(card.gain)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="tool-compact-grid mt-6">
                  {[
                    ["Total invested", formatMoney(stepUpPlan.invested)],
                    ["Wealth gained", formatMoney(stepUpPlan.gain)],
                    ["Final year SIP", formatMoney(stepUpPlan.rows[stepUpPlan.rows.length - 1]?.monthly || 0)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                      <p className="mt-1 font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
                  Wealth ratio {wealthRatio.toFixed(2)}x
                  <span className="font-normal text-[var(--muted-foreground)]">
                    every {formatMoneyPrecise(1)} invested becomes {formatMoneyPrecise(wealthRatio)}
                  </span>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Corpus growth by year</p>
              <div className="mt-4 grid gap-2">
                {stepUpPlan.rows.map((row) => (
                  <div key={`bar-${row.year}`} className="grid gap-1">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold">Year {row.year}</span>
                      <span className="text-[var(--muted-foreground)]">{formatCompact(row.corpus)}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max((row.corpus / maxCorpus) * 100, 1)}%`,
                          background: "var(--primary)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Year-wise breakdown</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Year</th>
                      <th className="py-2 pr-3 font-semibold">Monthly SIP</th>
                      <th className="py-2 pr-3 font-semibold">Invested that year</th>
                      <th className="py-2 pr-3 font-semibold">Cumulative invested</th>
                      <th className="py-2 font-semibold">Corpus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stepUpPlan.rows.map((row) => (
                      <tr key={row.year} className="border-b border-[var(--border)]">
                        <td className="py-2.5 pr-3 font-semibold">{row.year}</td>
                        <td className="py-2.5 pr-3">{formatMoney(row.monthly)}</td>
                        <td className="py-2.5 pr-3">{formatMoney(row.yearInvested)}</td>
                        <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">
                          {formatMoney(row.cumulativeInvested)}
                        </td>
                        <td className="py-2.5 font-semibold text-[var(--primary)]">{formatMoney(row.corpus)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                <Info className="h-4 w-4" />
                Why a step-up beats a bigger flat SIP
              </div>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                <li>
                  Your income compounds too. A 10% annual step-up usually tracks a normal appraisal, so the higher
                  instalment never feels like a cut in lifestyle.
                </li>
                <li>
                  Starting small is what makes it survive. The easiest SIP to keep is the one you can afford in month one
                  — the raises do the heavy lifting later.
                </li>
                <li>
                  Early money matters most, but late money still compounds. Step-up money lands in the years your corpus
                  is largest, so returns amplify it.
                </li>
                <li>
                  Most fund houses and apps support an automatic annual top-up on an existing SIP mandate. Set it once
                  and you never have to remember.
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
              Returns are assumed steady at {inputs.ret}% a year for the maths. Real markets do not move in a straight
              line, and this projection ignores expense ratio, exit load and capital gains tax. Use it to size the habit,
              not to predict a number.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
