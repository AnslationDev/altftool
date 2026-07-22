"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Clipboard,
  Download,
  Gauge,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SAMPLE = {
  currentCost: 50000,
  currentSavings: 500000,
  inflationRate: 6,
  years: 12,
  salaryGrowthRate: 8,
  investmentReturnRate: 10,
  monthlyInvestment: 15000,
  targetRealValue: 50000,
};

const SCENARIOS = [
  { label: "Low", rate: 3.5 },
  { label: "Normal", rate: 6 },
  { label: "High", rate: 8.5 },
  { label: "Stress", rate: 12 },
];

const PIE_COLORS = ["#2563eb", "#ef4444", "#059669", "#f59e0b"];

function clampNumber(value, min = 0, max = 1000000000) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(number, min), max);
}

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

function futureValue(amount, rate, years) {
  return amount * (1 + rate / 100) ** years;
}

function realValue(amount, inflationRate, years) {
  return amount / (1 + inflationRate / 100) ** years;
}

function annuityFutureValue(monthlyAmount, annualRate, years) {
  const months = Math.max(0, Math.round(years * 12));
  const monthlyRate = annualRate / 100 / 12;
  if (months <= 0) return 0;
  if (monthlyRate === 0) return monthlyAmount * months;
  return monthlyAmount * (((1 + monthlyRate) ** months - 1) / monthlyRate);
}

function calculate(values) {
  const currentCost = clampNumber(values.currentCost, 0, 1000000000);
  const currentSavings = clampNumber(values.currentSavings, 0, 10000000000);
  const inflationRate = clampNumber(values.inflationRate, 0, 80);
  const years = clampNumber(values.years, 1, 60);
  const salaryGrowthRate = clampNumber(values.salaryGrowthRate, 0, 80);
  const investmentReturnRate = clampNumber(values.investmentReturnRate, 0, 100);
  const monthlyInvestment = clampNumber(values.monthlyInvestment, 0, 100000000);
  const targetRealValue = clampNumber(values.targetRealValue, 0, 1000000000);

  const futureMonthlyCost = futureValue(currentCost, inflationRate, years);
  const purchasingPower = realValue(currentSavings, inflationRate, years);
  const valueLost = Math.max(0, currentSavings - purchasingPower);
  const salaryFuture = futureValue(currentCost, salaryGrowthRate, years);
  const lifestyleGap = salaryFuture - futureMonthlyCost;
  const requiredMonthlyForTarget = futureValue(targetRealValue, inflationRate, years);
  const savingsNominalFuture = futureValue(currentSavings, investmentReturnRate, years);
  const sipNominalFuture = annuityFutureValue(monthlyInvestment, investmentReturnRate, years);
  const totalPortfolioFuture = savingsNominalFuture + sipNominalFuture;
  const totalPortfolioReal = realValue(totalPortfolioFuture, inflationRate, years);
  const realReturnRate = ((1 + investmentReturnRate / 100) / (1 + inflationRate / 100) - 1) * 100;
  const requiredReturnToBeat = inflationRate + 2;
  const purchasingPowerLossPercent = currentSavings > 0 ? (valueLost / currentSavings) * 100 : 0;

  const rows = [];
  for (let year = 0; year <= years; year += 1) {
    const monthlyCost = futureValue(currentCost, inflationRate, year);
    const salaryLevel = futureValue(currentCost, salaryGrowthRate, year);
    const savingsFuture = futureValue(currentSavings, investmentReturnRate, year);
    const sipFuture = annuityFutureValue(monthlyInvestment, investmentReturnRate, year);
    const portfolio = savingsFuture + sipFuture;
    rows.push({
      year,
      label: `Y${year}`,
      monthlyCost,
      salaryLevel,
      purchasingPower: realValue(currentSavings, inflationRate, year),
      portfolio,
      realPortfolio: realValue(portfolio, inflationRate, year),
    });
  }

  const scenarioRows = SCENARIOS.map((scenario) => ({
    ...scenario,
    futureCost: futureValue(currentCost, scenario.rate, years),
    purchasingPower: realValue(currentSavings, scenario.rate, years),
  }));

  const pieData = [
    { name: "Real value left", value: purchasingPower },
    { name: "Purchasing power lost", value: valueLost },
  ].filter((item) => item.value > 0);

  const status =
    realReturnRate >= 3
      ? { label: "Ahead of Inflation", tone: "good" }
      : realReturnRate >= 0
        ? { label: "Barely Protected", tone: "amber" }
        : { label: "Losing Value", tone: "warn" };

  return {
    currentCost,
    currentSavings,
    inflationRate,
    years,
    salaryGrowthRate,
    investmentReturnRate,
    monthlyInvestment,
    targetRealValue,
    futureMonthlyCost,
    purchasingPower,
    valueLost,
    salaryFuture,
    lifestyleGap,
    requiredMonthlyForTarget,
    totalPortfolioFuture,
    totalPortfolioReal,
    realReturnRate,
    requiredReturnToBeat,
    purchasingPowerLossPercent,
    rows,
    scenarioRows,
    pieData,
    status,
  };
}

function buildSummary(values, metrics) {
  return [
    "Inflation Impact Calculator Summary",
    `Current monthly cost: ${formatMoney(values.currentCost)}`,
    `Inflation rate: ${formatNumber(values.inflationRate, 2)}%`,
    `Planning years: ${formatNumber(values.years, 1)}`,
    `Future monthly cost: ${formatMoney(metrics.futureMonthlyCost)}`,
    `Current savings purchasing power: ${formatMoney(metrics.purchasingPower)}`,
    `Purchasing power lost: ${formatMoney(metrics.valueLost)} (${formatNumber(metrics.purchasingPowerLossPercent, 2)}%)`,
    `Investment return: ${formatNumber(values.investmentReturnRate, 2)}%`,
    `Real return after inflation: ${formatNumber(metrics.realReturnRate, 2)}%`,
    `Inflation-adjusted portfolio value: ${formatMoney(metrics.totalPortfolioReal)}`,
    `Lifestyle gap: ${formatMoney(metrics.lifestyleGap)}`,
  ].join("\n");
}

function exportCsv(metrics) {
  const rows = [
    ["Year", "Monthly Cost", "Income Benchmark", "Savings Purchasing Power", "Portfolio", "Real Portfolio"],
    ...metrics.rows.map((row) => [
      row.year,
      Math.round(row.monthlyCost),
      Math.round(row.salaryLevel),
      Math.round(row.purchasingPower),
      Math.round(row.portfolio),
      Math.round(row.realPortfolio),
    ]),
    [],
    ["Scenario", "Inflation Rate", "Future Monthly Cost", "Savings Purchasing Power"],
    ...metrics.scenarioRows.map((row) => [
      row.label,
      `${row.rate}%`,
      Math.round(row.futureCost),
      Math.round(row.purchasingPower),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "inflation-impact-plan.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Field({ label, value, onChange, suffix, min = 0, max = 1000000000, step = 1 }) {
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
        ? "bg-rose-500/10 text-rose-600"
        : tone === "amber"
          ? "bg-amber-500/10 text-amber-600"
          : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <article className="tool-card min-w-0 overflow-hidden !p-4 sm:!p-5 xl:!p-6">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${toneClass}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        <div className="min-w-0">
          <p className="break-words text-[0.68rem] font-bold uppercase tracking-wide text-[var(--muted-foreground)] sm:text-xs">{label}</p>
          <p className="tool-money-value mt-1 break-words text-xl font-black leading-tight text-[var(--foreground)] sm:text-2xl xl:text-3xl">{value}</p>
          {detail ? <p className="mt-2 hidden break-words text-sm text-[var(--muted-foreground)] sm:block">{detail}</p> : null}
        </div>
      </div>
    </article>
  );
}

function InsightCard({ icon: Icon, title, body, value, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-rose-500/10 text-rose-600"
        : tone === "amber"
          ? "bg-amber-500/10 text-amber-600"
          : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="break-words text-sm font-bold text-[var(--foreground)]">{title}</p>
          <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{body}</p>
          {value ? <p className="mt-3 break-words text-lg font-black text-[var(--primary)]">{value}</p> : null}
        </div>
      </div>
    </article>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow-md)]">
      <p className="mb-2 text-sm font-bold text-[var(--foreground)]">{label}</p>
      {payload.map((entry) => (
        <p key={`${entry.dataKey}-${entry.name}`} className="text-sm text-[var(--muted-foreground)]">
          <span style={{ color: entry.color }}>●</span> {entry.name}: {formatMoney(entry.value, true)}
        </p>
      ))}
    </div>
  );
}

export default function InflationImpactCalculator() {
  const [values, setValues] = useState(SAMPLE);
  const metrics = useMemo(() => calculate(values), [values]);

  const updateValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const copySummary = async () => {
    const text = buildSummary(values, metrics);
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1360px] px-4 pb-12 pt-8 text-[var(--foreground)] sm:px-6 sm:pt-10 lg:px-8">
        <header className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,var(--section-highlight),var(--background)_52%,rgba(59,130,246,0.08))] p-5 text-center shadow-sm sm:p-7 xl:p-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
              <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate">Purchasing power planner</span>
              </span>
              <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-amber-600">
                <TrendingUp className="h-4 w-4 shrink-0" />
                Future cost {formatMoney(metrics.futureMonthlyCost)}
              </span>
            </div>
            <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">Inflation Impact Calculator</h1>
            <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
              See how inflation changes future expenses, savings value, lifestyle affordability, and real investment growth over time.
            </p>
          </div>

          <section className="mx-auto mt-5 grid w-full max-w-6xl grid-cols-2 gap-3 sm:mt-8 lg:grid-cols-4 xl:gap-5">
            <MetricCard
              icon={TrendingUp}
              label="Inflated Cost"
              value={formatMoney(metrics.futureMonthlyCost)}
              detail="Monthly cost needed to buy the same lifestyle."
              tone="warn"
            />
            <MetricCard
              icon={Wallet}
              label="Savings Real Value"
              value={formatMoney(metrics.purchasingPower)}
              detail={`${formatMoney(metrics.valueLost)} purchasing power lost.`}
              tone="amber"
            />
            <MetricCard
              icon={Gauge}
              label="Real Return"
              value={`${formatNumber(metrics.realReturnRate, 2)}%`}
              detail={`Investment return minus inflation effect.`}
              tone={metrics.status.tone}
            />
            <MetricCard
              icon={Target}
              label="Required Target"
              value={formatMoney(metrics.requiredMonthlyForTarget)}
              detail={`To keep ${formatMoney(values.targetRealValue)} buying power.`}
              tone="good"
            />
          </section>
        </header>

        <div className="mt-5 grid min-w-0 gap-4 sm:mt-8 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
          <section className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <PiggyBank className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Inflation Inputs</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  Adjust cost, savings, inflation, income growth, and investment assumptions.
                </p>
              </div>
            </div>

            <div className="tool-form-grid">
              <Field
                label="Current monthly cost"
                value={values.currentCost}
                onChange={(value) => updateValue("currentCost", value)}
                suffix="INR"
                max={1000000000}
              />
              <Field
                label="Current savings"
                value={values.currentSavings}
                onChange={(value) => updateValue("currentSavings", value)}
                suffix="INR"
                max={10000000000}
              />
              <Field
                label="Inflation rate"
                value={values.inflationRate}
                onChange={(value) => updateValue("inflationRate", value)}
                suffix="%"
                max={80}
                step={0.1}
              />
              <Field
                label="Planning years"
                value={values.years}
                onChange={(value) => updateValue("years", value)}
                suffix="yrs"
                min={1}
                max={60}
                step={1}
              />
              <Field
                label="Income growth"
                value={values.salaryGrowthRate}
                onChange={(value) => updateValue("salaryGrowthRate", value)}
                suffix="%"
                max={80}
                step={0.1}
              />
              <Field
                label="Investment return"
                value={values.investmentReturnRate}
                onChange={(value) => updateValue("investmentReturnRate", value)}
                suffix="%"
                max={100}
                step={0.1}
              />
              <Field
                label="Monthly investment"
                value={values.monthlyInvestment}
                onChange={(value) => updateValue("monthlyInvestment", value)}
                suffix="INR"
                max={100000000}
              />
              <Field
                label="Target real monthly value"
                value={values.targetRealValue}
                onChange={(value) => updateValue("targetRealValue", value)}
                suffix="INR"
                max={1000000000}
              />
            </div>

            <div className="mt-5">
              <p className="mb-3 text-sm font-bold text-[var(--foreground)]">Inflation scenario</p>
              <div className="tool-tab-grid">
                {SCENARIOS.map((scenario) => (
                  <button
                    key={scenario.label}
                    type="button"
                    onClick={() => updateValue("inflationRate", scenario.rate)}
                    className={values.inflationRate === scenario.rate ? "btn-primary" : "btn-secondary"}
                  >
                    {scenario.label} {scenario.rate}%
                  </button>
                ))}
              </div>
            </div>

            <div className="tool-action-grid mt-6">
              <button type="button" className="btn-secondary" onClick={() => setValues(SAMPLE)}>
                <RefreshCw className="h-4 w-4" />
                Sample
              </button>
              <button type="button" className="btn-secondary" onClick={copySummary}>
                <Clipboard className="h-4 w-4" />
                Copy
              </button>
              <button type="button" className="btn-primary" onClick={() => exportCsv(metrics)}>
                <Download className="h-4 w-4" />
                CSV
              </button>
            </div>
          </section>

          <section className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Purchasing Power Timeline</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  Future expense, income benchmark, and real portfolio value by year.
                </p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <BarChart3 className="h-5 w-5" />
              </span>
            </div>
            <div className="h-[330px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.rows} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} width={64} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="monthlyCost" name="Inflated cost" stroke="#ef4444" fill="#ef4444" fillOpacity={0.14} strokeWidth={3} />
                  <Area type="monotone" dataKey="salaryLevel" name="Income benchmark" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} strokeWidth={3} />
                  <Area type="monotone" dataKey="realPortfolio" name="Real portfolio" stroke="#059669" fill="#059669" fillOpacity={0.12} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <section className="mt-6 grid min-w-0 gap-6 xl:grid-cols-3">
          <InsightCard
            icon={ShieldCheck}
            title={metrics.status.label}
            body="Real return shows whether investments are growing faster than inflation."
            value={`${formatNumber(metrics.realReturnRate, 2)}% real return`}
            tone={metrics.status.tone}
          />
          <InsightCard
            icon={AlertTriangle}
            title="Lifestyle Gap"
            body="Positive means income growth can outrun inflation for this monthly cost."
            value={formatMoney(metrics.lifestyleGap)}
            tone={metrics.lifestyleGap >= 0 ? "good" : "warn"}
          />
          <InsightCard
            icon={Zap}
            title="Beat Inflation Target"
            body="A practical benchmark return to preserve and grow purchasing power."
            value={`${formatNumber(metrics.requiredReturnToBeat, 1)}%+`}
            tone="amber"
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Gauge className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Scenario Stress Test</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  Compare future costs across common inflation environments.
                </p>
              </div>
            </div>
            <div className="h-[300px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.scenarioRows} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} width={64} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="futureCost" name="Future cost" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="purchasingPower" name="Savings value" fill="#059669" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Wallet className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Savings Erosion</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  How much of today&apos;s savings keeps real buying power.
                </p>
              </div>
            </div>
            <div className="h-[250px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.pieData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="82%" paddingAngle={4}>
                    {metrics.pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {metrics.pieData.map((item, index) => (
                <div key={item.name} className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                  <span className="min-w-0 break-words text-sm font-semibold text-[var(--muted-foreground)]">
                    <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    {item.name}
                  </span>
                  <span className="shrink-0 text-sm font-bold text-[var(--foreground)]">{formatMoney(item.value, true)}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
    </main>
  );
}
