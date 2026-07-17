"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Clipboard,
  Download,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ResponsiveContainer from "@/components/charts/SafeResponsiveContainer";
import { safeCopyText } from "@/shared/utils/clipboard";
import Description from "../components/Description";

const SAMPLE = {
  initialInvestment: 100000,
  recurringAmount: 10000,
  frequency: "monthly",
  expectedReturn: 12,
  duration: 10,
  compounding: 12,
  inflationRate: 6,
  currency: "INR",
};

const FREQUENCY_OPTIONS = [
  { label: "Weekly", value: "weekly" },
  { label: "Bi-Weekly", value: "bi-weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
];

const COMPOUNDING_OPTIONS = [
  { label: "Monthly", value: 12 },
  { label: "Quarterly", value: 4 },
  { label: "Half Yearly", value: 2 },
  { label: "Yearly", value: 1 },
];

const CURRENCY_OPTIONS = [
  { label: "INR ₹", value: "INR" },
  { label: "USD $", value: "USD" },
  { label: "EUR €", value: "EUR" },
  { label: "GBP £", value: "GBP" },
];

const PIE_COLORS = ["#2563eb", "#059669", "#f59e0b"];

function formatMoney(value, compact = false, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
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

function clampNumber(value, min = 0, max = 100000000) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(min, number), max);
}

function getPeriodsPerYear(frequency) {
  const map = { weekly: 52, "bi-weekly": 26, monthly: 12, quarterly: 4, yearly: 1 };
  return map[frequency] || 12;
}

function calculateDca(values) {
  const initial = clampNumber(values.initialInvestment, 0, 1000000000);
  const recurring = clampNumber(values.recurringAmount, 0, 100000000);
  const annualReturn = clampNumber(values.expectedReturn, 0, 60) / 100;
  const years = Math.max(1, Math.round(clampNumber(values.duration, 1, 60)));
  const periodsPerYear = getPeriodsPerYear(values.frequency);
  const totalPeriods = years * periodsPerYear;
  const compounding = Math.max(1, Number(values.compounding) || 12);
  const inflationRate = clampNumber(values.inflationRate, 0, 30) / 100;

  const periodRate = (1 + annualReturn / compounding) ** (compounding / periodsPerYear) - 1;

  let portfolio = initial;
  let totalInvested = initial;
  const rows = [{ period: 0, label: "Start", invested: totalInvested, value: portfolio, profit: 0 }];

  for (let period = 1; period <= totalPeriods; period++) {
    if (period > 1 || recurring > 0) {
      portfolio += recurring;
      totalInvested += recurring;
    }
    portfolio *= 1 + periodRate;

    const year = Math.ceil(period / periodsPerYear);
    const isYearEnd = period % periodsPerYear === 0 || period === totalPeriods;

    rows.push({
      period,
      label: isYearEnd ? `Y${year}` : "",
      invested: Math.round(totalInvested),
      value: Math.round(portfolio),
      profit: Math.round(portfolio - totalInvested),
      returnRate: period > 0 && rows[rows.length - 1]?.invested > 0
        ? ((portfolio - totalInvested - (rows[rows.length - 1]?.value || 0) + (rows[rows.length - 1]?.invested || 0)) / (rows[rows.length - 1]?.value || 1)) * 100
        : 0,
    });
  }

  const finalRow = rows[rows.length - 1];
  const profit = Math.max(0, finalRow.value - totalInvested);
  const cagr = totalInvested > 0 ? (finalRow.value / totalInvested) ** (1 / years) - 1 : 0;
  const roi = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
  const inflationAdjusted = finalRow.value / (1 + inflationRate) ** years;

  // Annual summary
  const annualData = [];
  for (let y = 0; y <= years; y++) {
    const startPeriod = y === 0 ? 0 : (y - 1) * periodsPerYear;
    const endPeriod = Math.min(y * periodsPerYear, totalPeriods);
    const startRow = rows.find((r) => r.period === startPeriod);
    const endRow = rows.find((r) => r.period === endPeriod);
    if (startRow && endRow) {
      annualData.push({
        year: y === 0 ? "Start" : `Y${y}`,
        invested: endRow.invested,
        value: endRow.value,
        profit: endRow.profit,
        contribution: endRow.invested - (startRow.invested || 0),
      });
    }
  }

  // Scenario data
  const scenarios = [
    { label: "Best Case (+2%)", rate: annualReturn + 0.02, value: 0 },
    { label: "Average Case", rate: annualReturn, value: 0 },
    { label: "Worst Case (-2%)", rate: Math.max(0.01, annualReturn - 0.02), value: 0 },
  ];

  scenarios.forEach((s) => {
    const sr = (1 + s.rate / compounding) ** (compounding / periodsPerYear) - 1;
    let sp = initial;
    let si = initial;
    for (let p = 1; p <= totalPeriods; p++) {
      if (p > 1 || recurring > 0) {
        sp += recurring;
        si += recurring;
      }
      sp *= 1 + sr;
    }
    s.value = Math.round(sp);
  });

  const scenarioBestValue = scenarios[0].value;
  const scenarioAvgValue = scenarios[1].value;
  const scenarioWorstValue = scenarios[2].value;

  return {
    totalInvested,
    portfolioValue: finalRow.value,
    profit,
    roi,
    cagr: cagr * 100,
    inflationAdjusted: Math.round(inflationAdjusted),
    annualData,
    rows,
    years,
    totalPeriods,
    periodRate: periodRate * 100,
    scenarioBestValue,
    scenarioAvgValue,
    scenarioWorstValue,
  };
}

function buildSummary(values, metrics) {
  return [
    "DCA Calculator Report",
    `Initial Investment: ${formatMoney(values.initialInvestment, false, values.currency)}`,
    `Recurring Investment: ${formatMoney(values.recurringAmount, false, values.currency)}`,
    `Frequency: ${values.frequency}`,
    `Expected Annual Return: ${formatNumber(values.expectedReturn, 2)}%`,
    `Duration: ${values.duration} years`,
    `Inflation Rate: ${formatNumber(values.inflationRate, 1)}%`,
    `Total Invested: ${formatMoney(metrics.totalInvested, false, values.currency)}`,
    `Portfolio Value: ${formatMoney(metrics.portfolioValue, false, values.currency)}`,
    `Estimated Profit: ${formatMoney(metrics.profit, false, values.currency)}`,
    `ROI: ${formatNumber(metrics.roi, 2)}%`,
    `CAGR: ${formatNumber(metrics.cagr, 2)}%`,
    `Inflation-Adjusted Value: ${formatMoney(metrics.inflationAdjusted, false, values.currency)}`,
  ].join("\n");
}

function exportCsv(values, metrics) {
  const rows = [
    ["Period", "Invested", "Portfolio Value", "Profit"],
    ...metrics.rows.map((row) => [row.period, row.invested, row.value, row.profit]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "dca-calculator-schedule.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Field({ label, value, onChange, suffix, min = 0, max = 100000000, step = 1 }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block break-words text-sm font-semibold text-[var(--foreground)]">{label}</span>
      <div className="flex min-w-0 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background)] focus-within:border-[var(--primary)] focus-within:shadow-[var(--anslation-ds-focus-ring)]">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(clampNumber(event.target.value, min, max))}
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-[var(--foreground)] outline-none"
        />
        {suffix ? (
          <span className="flex shrink-0 items-center border-l border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted-foreground)]">
            {suffix}
          </span>
        ) : null}
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
        : tone === "violet"
          ? "bg-violet-500/10 text-violet-600"
          : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
          <p className="tool-money-value mt-1 text-[var(--foreground)]">{value}</p>
          <p className="mt-1 break-words text-sm leading-5 text-[var(--muted-foreground)]">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
      <p className="font-semibold text-[var(--foreground)]">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-[var(--muted-foreground)]">
          {item.name}: {typeof item.value === "number" ? item.value.toLocaleString("en-IN") : item.value}
        </p>
      ))}
    </div>
  );
}

export default function DcaCalculator() {
  const [values, setValues] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const metrics = useMemo(() => calculateDca(values), [values]);

  const updateValue = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const copySummary = async () => {
    const success = await safeCopyText(buildSummary(values, metrics));
    if (!success) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const reset = () => setValues(SAMPLE);

  const chartData = useMemo(
    () =>
      metrics.rows
        .filter((row) => row.label || row.period === 0 || row.period === metrics.totalPeriods)
        .map((row) => ({
          ...row,
          labelVal: row.period === 0 ? "Start" : row.label || "",
        })),
    [metrics],
  );

  const profitPie = useMemo(
    () =>
      [
        { name: "Invested", value: metrics.totalInvested, color: PIE_COLORS[0] },
        { name: "Estimated Profit", value: metrics.profit, color: PIE_COLORS[1] },
      ].filter((item) => item.value > 0),
    [metrics.totalInvested, metrics.profit],
  );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
          <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,420px)] 2xl:items-center">
            <div className="min-w-0">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
                <TrendingUp className="h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">Investment Planner</span>
              </div>
              <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
                DCA Calculator
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
                Estimate investment growth using Dollar Cost Averaging. Compare weekly, monthly, quarterly, or
                yearly recurring investments with multiple return scenarios.
              </p>
            </div>
            <div className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Estimated portfolio</p>
              <p className="tool-money-value tool-hero-value mt-2 text-[var(--primary)]">
                {formatMoney(metrics.portfolioValue, false, values.currency)}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-[var(--muted-foreground)]">
                {formatMoney(metrics.profit, false, values.currency)} profit over {metrics.years} years
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            icon={PiggyBank}
            label="Total Invested"
            value={formatMoney(metrics.totalInvested, false, values.currency)}
            detail={`${formatNumber(values.initialInvestment, false)} initial + recurring`}
          />
          <MetricCard
            icon={TrendingUp}
            label="Estimated Profit"
            value={formatMoney(metrics.profit, false, values.currency)}
            detail={`${formatNumber(metrics.roi, 2)}% ROI`}
            tone="good"
          />
          <MetricCard
            icon={BarChart3}
            label="CAGR"
            value={`${formatNumber(metrics.cagr, 2)}%`}
            detail={`${formatNumber(values.expectedReturn, 2)}% expected return`}
          />
          <MetricCard
            icon={ShieldCheck}
            label="Inflation Adjusted"
            value={formatMoney(metrics.inflationAdjusted, false, values.currency)}
            detail={`${formatNumber(values.inflationRate, 1)}% inflation rate`}
            tone="warn"
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Investment Details</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Set your initial investment, recurring amount, frequency, return expectations, and duration.
              </p>

              <div className="mt-5 space-y-4">
                <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                  <Field
                    label="Initial Investment"
                    value={values.initialInvestment}
                    onChange={(value) => updateValue("initialInvestment", value)}
                    suffix=""
                    max={100000000}
                    step={5000}
                  />
                  <Field
                    label="Recurring Investment"
                    value={values.recurringAmount}
                    onChange={(value) => updateValue("recurringAmount", value)}
                    suffix=""
                    max={10000000}
                    step={1000}
                  />
                </div>

                <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                  <label className="block min-w-0">
                    <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Investment Frequency</span>
                    <select
                      value={values.frequency}
                      onChange={(event) => updateValue("frequency", event.target.value)}
                      className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    >
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block min-w-0">
                    <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Compounding</span>
                    <select
                      value={values.compounding}
                      onChange={(event) => updateValue("compounding", Number(event.target.value))}
                      className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    >
                      {COMPOUNDING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                  <Field
                    label="Expected Annual Return"
                    value={values.expectedReturn}
                    onChange={(value) => updateValue("expectedReturn", value)}
                    suffix="%"
                    max={60}
                    step={0.5}
                  />
                  <Field
                    label="Duration (Years)"
                    value={values.duration}
                    onChange={(value) => updateValue("duration", value)}
                    max={60}
                  />
                </div>

                <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                  <Field
                    label="Inflation Rate"
                    value={values.inflationRate}
                    onChange={(value) => updateValue("inflationRate", value)}
                    suffix="%"
                    max={30}
                    step={0.1}
                  />
                  <label className="block min-w-0">
                    <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Currency</span>
                    <select
                      value={values.currency}
                      onChange={(event) => updateValue("currency", event.target.value)}
                      className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    >
                      {CURRENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="tool-action-grid mt-5">
                <button type="button" onClick={reset} className="btn-secondary">
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </button>
                <button type="button" onClick={copySummary} className="btn-secondary">
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy Summary"}
                </button>
                <button type="button" onClick={() => exportCsv(values, metrics)} className="btn-primary">
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </section>

            <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Scenario Comparison</h2>
              <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-3 2xl:grid-cols-1">
                {[
                  ["Best Case (+2%)", metrics.scenarioBestValue, "Higher returns"],
                  ["Average Case", metrics.scenarioAvgValue, "Expected returns"],
                  ["Worst Case (-2%)", metrics.scenarioWorstValue, "Conservative estimate"],
                ].map(([label, value, detail]) => (
                  <div key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">
                      {formatMoney(value, false, values.currency)}
                    </p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="min-w-0 space-y-6">
            <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
              <div className="mb-4 flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-[var(--foreground)]">Portfolio Growth</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">Invested amount vs portfolio value over time</p>
                </div>
              </div>
              <div className="h-72 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dcaInvested" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="dcaValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" minTickGap={18} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis width={58} tickFormatter={(val) => formatMoney(val, true, values.currency)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
                            <p className="font-semibold text-[var(--foreground)]">{label}</p>
                            {payload.map((item) => (
                              <p key={item.dataKey} className="text-[var(--muted-foreground)]">
                                {item.name}: {formatMoney(item.value, false, values.currency)}
                              </p>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="invested" name="Invested" stroke="#94a3b8" fill="url(#dcaInvested)" strokeWidth={2} />
                    <Area type="monotone" dataKey="value" name="Portfolio" stroke="#2563eb" fill="url(#dcaValue)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
              <div className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
                <div className="mb-4 flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-[var(--foreground)]">Year-wise Summary</h2>
                    <p className="text-sm text-[var(--muted-foreground)]">Annual portfolio value progression</p>
                  </div>
                </div>
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <RechartsBarChart data={metrics.annualData.slice(1)} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="year" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <YAxis width={56} tickFormatter={(val) => formatMoney(val, true, values.currency)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
                              <p className="font-semibold text-[var(--foreground)]">{label}</p>
                              {payload.map((item) => (
                                <p key={item.dataKey} className="text-[var(--muted-foreground)]">
                                  {item.name}: {formatMoney(item.value, false, values.currency)}
                                </p>
                              ))}
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="value" name="Portfolio Value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="contribution" name="Yearly Contribution" fill="#059669" radius={[8, 8, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Return Split</h2>
                <div className="mt-4 space-y-3">
                  {profitPie.map((item, index) => {
                    const total = metrics.portfolioValue;
                    const percent = total > 0 ? (item.value / total) * 100 : 0;
                    return (
                      <div key={item.name} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <p className="break-words text-sm font-semibold text-[var(--foreground)]">{item.name}</p>
                          <p className="break-words text-sm font-bold text-[var(--foreground)]">
                            {formatMoney(item.value, false, values.currency)}
                          </p>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                          <div
                            className={`h-full rounded-full ${index === 0 ? "bg-blue-600" : "bg-emerald-600"}`}
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Investment Timeline</h2>
              <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {metrics.annualData.filter((_, i) => i % Math.max(1, Math.floor(metrics.annualData.length / 8)) === 0 || i === metrics.annualData.length - 1).slice(0, 9).map((row) => (
                  <div key={row.year} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{row.year}</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">
                      {formatMoney(row.value, false, values.currency)}
                    </p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                      Invested {formatMoney(row.invested, false, values.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-700">
          This calculator provides estimates. Actual returns depend on market performance, fees, taxes, and investment timing.
        </div>
      </div>
      <Description />
    </main>
  );
}
