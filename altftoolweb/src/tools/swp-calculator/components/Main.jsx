"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle,
  Clipboard,
  Download,
  Gauge,
  IndianRupee,
  Loader2,
  Percent,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

const DEFAULT_FORM = {
  corpus: 5000000,
  investedCost: 3800000,
  monthlyWithdrawal: 40000,
  expectedReturn: 8,
  withdrawalStepUp: 5,
  tenureYears: 25,
  taxRate: 10,
  timing: "end",
};

const RETIREMENT_SAMPLE = {
  corpus: 7500000,
  investedCost: 5200000,
  monthlyWithdrawal: 55000,
  expectedReturn: 8.5,
  withdrawalStepUp: 6,
  tenureYears: 30,
  taxRate: 10,
  timing: "end",
};

function formatMoney(value, compact = false) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(Number.isFinite(value) ? value : 0);
}

function formatNumber(value, digits = 1) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(number, min), max);
}

function getMonthlyRate(annualReturn) {
  return Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
}

function simulateSWP(input, override = {}) {
  const config = { ...input, ...override };
  const months = Math.round(config.tenureYears * 12);
  const monthlyRate = getMonthlyRate(config.expectedReturn);
  let corpus = Math.max(0, config.corpus);
  let costBasis = Math.min(Math.max(0, config.investedCost), corpus);
  let withdrawal = Math.max(0, config.monthlyWithdrawal);
  let totalWithdrawn = 0;
  let totalTax = 0;
  let totalReturns = 0;
  let depletedMonth = null;
  const rows = [];

  for (let year = 1; year <= config.tenureYears; year += 1) {
    const openingCorpus = corpus;
    const openingWithdrawal = withdrawal;
    let yearlyWithdrawn = 0;
    let yearlyTax = 0;
    let yearlyReturns = 0;

    for (let month = 1; month <= 12; month += 1) {
      const absoluteMonth = (year - 1) * 12 + month;
      if (absoluteMonth > months || corpus <= 0) break;

      const applyWithdrawal = () => {
        const grossWithdrawal = Math.min(withdrawal, corpus);
        const embeddedGain = Math.max(0, corpus - costBasis);
        const taxableRatio = corpus > 0 ? embeddedGain / corpus : 0;
        const taxableGain = grossWithdrawal * taxableRatio;
        const tax = taxableGain * (config.taxRate / 100);
        const capitalReturned = grossWithdrawal - taxableGain;

        corpus -= grossWithdrawal;
        costBasis = Math.max(0, costBasis - capitalReturned);
        yearlyWithdrawn += grossWithdrawal;
        yearlyTax += tax;
        totalWithdrawn += grossWithdrawal;
        totalTax += tax;

        if (corpus <= 0 && depletedMonth === null) {
          depletedMonth = absoluteMonth;
        }
      };

      if (config.timing === "beginning") {
        applyWithdrawal();
      }

      if (corpus > 0) {
        const returns = corpus * monthlyRate;
        corpus += returns;
        yearlyReturns += returns;
        totalReturns += returns;
      }

      if (config.timing === "end" && corpus > 0) {
        applyWithdrawal();
      }
    }

    rows.push({
      year,
      openingCorpus,
      openingWithdrawal,
      withdrawn: yearlyWithdrawn,
      tax: yearlyTax,
      netCashflow: yearlyWithdrawn - yearlyTax,
      returns: yearlyReturns,
      closingCorpus: Math.max(0, corpus),
    });

    withdrawal *= 1 + config.withdrawalStepUp / 100;

    if (corpus <= 0) {
      for (let blankYear = year + 1; blankYear <= config.tenureYears; blankYear += 1) {
        rows.push({
          year: blankYear,
          openingCorpus: 0,
          openingWithdrawal: withdrawal,
          withdrawn: 0,
          tax: 0,
          netCashflow: 0,
          returns: 0,
          closingCorpus: 0,
        });
        withdrawal *= 1 + config.withdrawalStepUp / 100;
      }
      break;
    }
  }

  const finalCorpus = Math.max(0, corpus);
  const plannedWithdrawal = rows.reduce((sum, row) => sum + row.openingWithdrawal * 12, 0);
  const monthsCovered = depletedMonth || months;

  return {
    rows,
    finalCorpus,
    totalWithdrawn,
    totalTax,
    netReceived: totalWithdrawn - totalTax,
    totalReturns,
    depletedMonth,
    monthsCovered,
    plannedWithdrawal,
    survived: depletedMonth === null,
  };
}

function getSafeWithdrawal(input) {
  let low = 0;
  let high = Math.max(input.corpus, input.monthlyWithdrawal * 6);

  for (let index = 0; index < 44; index += 1) {
    const mid = (low + high) / 2;
    const simulation = simulateSWP(input, { monthlyWithdrawal: mid });
    if (simulation.survived) low = mid;
    else high = mid;
  }

  return low;
}

function buildSummary(input, result, safeWithdrawal) {
  const depletionText = result.survived
    ? `Corpus survives ${input.tenureYears} years`
    : `Corpus depletes after ${result.monthsCovered} months`;

  return [
    "SWP Calculator Summary",
    `Initial corpus: ${formatMoney(input.corpus)}`,
    `Monthly withdrawal: ${formatMoney(input.monthlyWithdrawal)}`,
    `Expected return: ${input.expectedReturn}% p.a.`,
    `Annual withdrawal step-up: ${input.withdrawalStepUp}%`,
    `Tenure: ${input.tenureYears} years`,
    `Final corpus: ${formatMoney(result.finalCorpus)}`,
    `Total withdrawn: ${formatMoney(result.totalWithdrawn)}`,
    `Estimated tax: ${formatMoney(result.totalTax)}`,
    `Net cash received: ${formatMoney(result.netReceived)}`,
    `Safe first-month withdrawal estimate: ${formatMoney(safeWithdrawal)}`,
    depletionText,
  ].join("\n");
}

function exportCsv(rows) {
  const header = [
    "Year",
    "Opening Corpus",
    "First Monthly SWP",
    "Gross Withdrawn",
    "Estimated Tax",
    "Net Cashflow",
    "Returns Earned",
    "Closing Corpus",
  ];
  const body = rows.map((row) => [
    row.year,
    Math.round(row.openingCorpus),
    Math.round(row.openingWithdrawal),
    Math.round(row.withdrawn),
    Math.round(row.tax),
    Math.round(row.netCashflow),
    Math.round(row.returns),
    Math.round(row.closingCorpus),
  ]);
  const csv = [header, ...body]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "swp-yearly-schedule.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Field({ label, value, min, max, step, prefix, suffix, onChange }) {
  return (
    <label className="block rounded-lg border border-(--border) bg-(--background) p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-(--foreground)">{label}</span>
        <span className="rounded-md bg-(--section-highlight) px-2 py-1 text-sm font-semibold text-(--primary)">
          {prefix}
          {Number(value).toLocaleString("en-IN")}
          {suffix}
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
        <span>
          {prefix}
          {Number(min).toLocaleString("en-IN")}
          {suffix}
        </span>
        <span>
          {prefix}
          {Number(max).toLocaleString("en-IN")}
          {suffix}
        </span>
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

export default function MainComponent() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [displayForm, setDisplayForm] = useState(DEFAULT_FORM);
  const [isCalculating, setIsCalculating] = useState(false);
  const [copied, setCopied] = useState(false);
  const calculationTimerRef = useRef(null);

  const result = useMemo(() => simulateSWP(displayForm), [displayForm]);
  const safeWithdrawal = useMemo(() => getSafeWithdrawal(displayForm), [displayForm]);
  const scenarios = useMemo(
    () =>
      [
        ["Conservative", Math.max(0, displayForm.expectedReturn - 2), "text-amber-600"],
        ["Expected", displayForm.expectedReturn, "text-emerald-600"],
        ["Optimistic", displayForm.expectedReturn + 2, "text-blue-600"],
      ].map(([label, expectedReturn, color]) => ({
        label,
        expectedReturn,
        color,
        simulation: simulateSWP(displayForm, { expectedReturn }),
      })),
    [displayForm],
  );

  const withdrawalRate = displayForm.corpus
    ? (displayForm.monthlyWithdrawal * 12 * 100) / displayForm.corpus
    : 0;
  const depletionText = result.survived
    ? `${displayForm.tenureYears} years covered`
    : `Runs out in ${Math.floor(result.monthsCovered / 12)}y ${result.monthsCovered % 12}m`;
  const riskTone = result.survived ? "good" : "warn";
  const lastUsefulRow = result.rows.findLast((row) => row.closingCorpus > 0) || result.rows[0];
  const finalCorpusWidth = displayForm.corpus
    ? Math.min(100, (result.finalCorpus / displayForm.corpus) * 100)
    : 0;

  useEffect(() => {
    return () => {
      if (calculationTimerRef.current) {
        window.clearTimeout(calculationTimerRef.current);
      }
    };
  }, []);

  const applyForm = (nextForm) => {
    if (calculationTimerRef.current) {
      window.clearTimeout(calculationTimerRef.current);
    }

    setForm(nextForm);
    setIsCalculating(true);
    calculationTimerRef.current = window.setTimeout(() => {
      setDisplayForm(nextForm);
      setIsCalculating(false);
      calculationTimerRef.current = null;
    }, 850);
  };

  const updateForm = (key, value) => {
    const next = { ...form, [key]: value };
    if (key === "corpus") {
      next.investedCost = Math.min(form.investedCost, value);
    }
    if (key === "investedCost") {
      next.investedCost = Math.min(value, next.corpus);
    }
    applyForm(next);
  };

  const copySummary = async () => {
    await navigator.clipboard?.writeText(buildSummary(displayForm, result, safeWithdrawal));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-8 text-(--foreground)">
      <div className="text-center">
        <h1 className="heading">SWP Calculator</h1>
        <p className="description mt-3">
          Plan systematic withdrawals with monthly income, return assumptions,
          inflation step-up, tax estimate, and corpus survival analysis.
        </p>
      </div>

      <section className="mt-8 rounded-lg border border-(--border) bg-(--card) p-5 sm:p-6">
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px] 2xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">Withdrawal Plan</h2>
              <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
                Estimate how long a mutual fund or retirement corpus can support
                monthly withdrawals under changing return and inflation assumptions.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-(--border) bg-(--background) p-4">
            <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
              Corpus status
            </p>
            <p
              className={`mt-2 text-3xl font-bold ${
                result.survived ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {isCalculating ? "Calculating..." : depletionText}
            </p>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              {isCalculating
                ? "Updating corpus survival, tax, and yearly schedule."
                : `Final corpus ${formatMoney(result.finalCorpus)} after planned SWP.`}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-lg border border-(--border) bg-(--card) p-5">
          <Field
            label="Initial Corpus"
            value={form.corpus}
            min={100000}
            max={100000000}
            step={100000}
            prefix="₹"
            onChange={(value) => updateForm("corpus", value)}
          />
          <Field
            label="Invested Cost Basis"
            value={form.investedCost}
            min={0}
            max={form.corpus}
            step={100000}
            prefix="₹"
            onChange={(value) => updateForm("investedCost", value)}
          />
          <Field
            label="Monthly Withdrawal"
            value={form.monthlyWithdrawal}
            min={1000}
            max={500000}
            step={1000}
            prefix="₹"
            onChange={(value) => updateForm("monthlyWithdrawal", value)}
          />
          <Field
            label="Expected Annual Return"
            value={form.expectedReturn}
            min={0}
            max={20}
            step={0.25}
            suffix="%"
            onChange={(value) => updateForm("expectedReturn", value)}
          />
          <Field
            label="Annual SWP Step-Up"
            value={form.withdrawalStepUp}
            min={0}
            max={15}
            step={0.25}
            suffix="%"
            onChange={(value) => updateForm("withdrawalStepUp", value)}
          />
          <Field
            label="Tenure"
            value={form.tenureYears}
            min={1}
            max={45}
            step={1}
            suffix=" yr"
            onChange={(value) => updateForm("tenureYears", value)}
          />
          <Field
            label="Tax Rate on Gains"
            value={form.taxRate}
            min={0}
            max={35}
            step={0.5}
            suffix="%"
            onChange={(value) => updateForm("taxRate", value)}
          />

          <div className="rounded-lg border border-(--border) bg-(--background) p-4">
            <p className="mb-3 text-sm font-semibold text-(--foreground)">Withdrawal Timing</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["end", "Month End"],
                ["beginning", "Month Start"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateForm("timing", value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    form.timing === value
                      ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                      : "border-(--border) bg-(--card) text-(--foreground) hover:border-(--primary)"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyForm(RETIREMENT_SAMPLE)}
              className="btn-secondary"
            >
              <RefreshCw className="h-4 w-4" />
              Load Sample
            </button>
            <button type="button" onClick={copySummary} className="btn-secondary">
              <Clipboard className="h-4 w-4" />
              {copied ? "Copied" : "Copy Summary"}
            </button>
            <button
              type="button"
              onClick={() => exportCsv(result.rows)}
              className="btn-primary"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {isCalculating && (
            <div className="flex items-center gap-3 rounded-lg border border-(--border) bg-(--section-highlight) p-4 text-(--primary)">
              <Loader2 className="h-5 w-5 animate-spin" />
              <div>
                <p className="font-semibold">Calculating updated projection...</p>
                <p className="text-sm">
                  Rechecking corpus life, safe withdrawal, scenarios, and yearly cashflow.
                </p>
              </div>
            </div>
          )}

          <div className="tool-card-grid">
            <MetricCard
              icon={IndianRupee}
              label="Total Withdrawn"
              value={formatMoney(result.totalWithdrawn)}
              detail={`Net after estimated tax: ${formatMoney(result.netReceived)}`}
              tone="good"
            />
            <MetricCard
              icon={ShieldCheck}
              label="Safe Monthly SWP"
              value={formatMoney(safeWithdrawal)}
              detail="Estimated first-month withdrawal that lasts the tenure."
              tone={displayForm.monthlyWithdrawal <= safeWithdrawal ? "good" : "warn"}
            />
            <MetricCard
              icon={TrendingUp}
              label="Returns Earned"
              value={formatMoney(result.totalReturns)}
              detail={`${formatNumber(displayForm.expectedReturn, 2)}% annual return assumption.`}
            />
            <MetricCard
              icon={TrendingDown}
              label="Depletion Risk"
              value={result.survived ? "Low" : "High"}
              detail={result.survived ? "Corpus survives the selected tenure." : depletionText}
              tone={riskTone}
            />
          </div>

          <section className="rounded-lg border border-(--border) bg-(--card) p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-(--foreground)">Corpus Flow</h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  Withdrawal rate is {formatNumber(withdrawalRate, 2)}% of starting corpus.
                </p>
              </div>
              <div className="rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm font-semibold text-(--foreground)">
                Year {lastUsefulRow?.year || 1}: {formatMoney(lastUsefulRow?.closingCorpus || 0, true)}
              </div>
            </div>

            <div className="mt-5 h-4 overflow-hidden rounded-full bg-(--background)">
              <div
                className={`h-full rounded-full ${
                  result.survived ? "bg-emerald-600" : "bg-amber-500"
                }`}
                style={{ width: `${finalCorpusWidth}%` }}
              />
            </div>
            <div className="tool-compact-grid mt-3 text-sm">
              <div className="rounded-lg bg-(--background) p-3">
                <p className="text-(--muted-foreground)">Opening corpus</p>
                <p className="font-semibold text-(--foreground)">{formatMoney(displayForm.corpus)}</p>
              </div>
              <div className="rounded-lg bg-(--background) p-3">
                <p className="text-(--muted-foreground)">Estimated tax</p>
                <p className="font-semibold text-(--foreground)">{formatMoney(result.totalTax)}</p>
              </div>
              <div className="rounded-lg bg-(--background) p-3">
                <p className="text-(--muted-foreground)">Closing corpus</p>
                <p className="font-semibold text-(--foreground)">{formatMoney(result.finalCorpus)}</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-(--border) bg-(--card) p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-(--foreground)">Return Scenarios</h2>
                <p className="text-sm text-(--muted-foreground)">
                  Compare return sensitivity without changing the main inputs.
                </p>
              </div>
            </div>

            <div className="tool-card-grid">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.label}
                  className="rounded-lg border border-(--border) bg-(--background) p-4"
                >
                  <p className={`text-sm font-semibold ${scenario.color}`}>{scenario.label}</p>
                  <p className="mt-2 text-xl font-bold text-(--foreground)">
                    {formatMoney(scenario.simulation.finalCorpus)}
                  </p>
                  <p className="mt-1 text-sm text-(--muted-foreground)">
                    {formatNumber(scenario.expectedReturn, 2)}% return |{" "}
                    {scenario.simulation.survived
                      ? "survives"
                      : `${scenario.simulation.monthsCovered} months`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-(--border) bg-(--card) p-5">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-(--foreground)">Yearly SWP Schedule</h2>
            <p className="mt-1 text-sm text-(--muted-foreground)">
              Opening balance, withdrawal, tax estimate, returns, and closing
              balance for each year.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-(--border)">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-(--background) text-xs uppercase text-(--muted-foreground)">
              <tr>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Opening</th>
                <th className="px-4 py-3">Monthly SWP</th>
                <th className="px-4 py-3">Withdrawn</th>
                <th className="px-4 py-3">Tax</th>
                <th className="px-4 py-3">Returns</th>
                <th className="px-4 py-3">Closing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              {result.rows.map((row) => (
                <tr key={row.year} className="bg-(--card)">
                  <td className="px-4 py-3 font-semibold text-(--foreground)">{row.year}</td>
                  <td className="px-4 py-3 text-(--foreground)">{formatMoney(row.openingCorpus)}</td>
                  <td className="px-4 py-3 text-(--foreground)">{formatMoney(row.openingWithdrawal)}</td>
                  <td className="px-4 py-3 text-(--foreground)">{formatMoney(row.withdrawn)}</td>
                  <td className="px-4 py-3 text-(--foreground)">{formatMoney(row.tax)}</td>
                  <td className="px-4 py-3 text-emerald-600">{formatMoney(row.returns)}</td>
                  <td className="px-4 py-3 font-semibold text-(--foreground)">
                    {formatMoney(row.closingCorpus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm">
          SWP projections are estimates. Market returns, taxation, exit loads,
          fund categories, capital gains rules, and withdrawal timing can change
          real outcomes. Use this for planning, then verify with an advisor.
        </p>
      </div>
    </main>
  );
}
