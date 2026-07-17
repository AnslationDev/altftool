"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarClock,
  Clipboard,
  Download,
  Info,
  LineChart,
  PiggyBank,
  RefreshCcw,
  Target,
  TrendingUp,
  Wallet,
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
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ResponsiveContainer from "@/components/charts/SafeResponsiveContainer";

const SAMPLE = {
  mode: "years",
  annualRate: 8,
  targetYears: 9,
  investmentAmount: 100000,
};

const MODES = [
  { label: "Years to Double", value: "years" },
  { label: "Required Rate", value: "rate" },
];

const PIE_COLORS = ["#059669", "#2563eb", "#f59e0b"];

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

function formatPercent(value) {
  return `${formatNumber(value, 2)}%`;
}

function clampNumber(value, min = 0, max = 1000000000) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(min, number), max);
}

function calculateResults(values) {
  const mode = values.mode;
  const annualRate = clampNumber(values.annualRate, 0.01, 100);
  const targetYears = Math.max(1, Math.round(clampNumber(values.targetYears, 1, 100)));
  const investmentAmount = clampNumber(values.investmentAmount, 0, 1000000000);

  let yearsToDouble, requiredRate;

  if (mode === "years") {
    yearsToDouble = annualRate > 0 ? 72 / annualRate : Infinity;
    requiredRate = annualRate;
  } else {
    requiredRate = targetYears > 0 ? 72 / targetYears : 0;
    yearsToDouble = targetYears;
  }

  const exactYearsToDouble =
    requiredRate > 0 ? Math.log(2) / Math.log(1 + requiredRate / 100) : Infinity;
  const approximationError =
    yearsToDouble !== Infinity && exactYearsToDouble !== Infinity
      ? Math.abs(yearsToDouble - exactYearsToDouble)
      : 0;
  const approximationErrorPercent =
    exactYearsToDouble > 0 ? (approximationError / exactYearsToDouble) * 100 : 0;

  const futureValue = investmentAmount * 2;
  const totalGrowthPercent = investmentAmount > 0 ? ((futureValue - investmentAmount) / investmentAmount) * 100 : 0;

  const rows = Array.from({ length: Math.min(Math.ceil(yearsToDouble) + 2, 30) }, (_, i) => {
    const year = i;
    const value = investmentAmount * (1 + requiredRate / 100) ** year;
    const ruleOf72Value = investmentAmount * 2 ** (year / yearsToDouble);
    return {
      year,
      label: `Y${year}`,
      exactValue: value,
      ruleOf72Value,
      invested: investmentAmount,
    };
  });

  const milestones = [
    { label: "2x (Double)", multiplier: 2 },
    { label: "3x (Triple)", multiplier: 3 },
    { label: "4x (Quadruple)", multiplier: 4 },
    { label: "8x", multiplier: 8 },
  ].map((m) => ({
    ...m,
    years: requiredRate > 0 ? (Math.log(m.multiplier) / Math.log(1 + requiredRate / 100)) : Infinity,
    ruleYears: requiredRate > 0 ? (72 / requiredRate) * Math.log2(m.multiplier) : Infinity,
    value: investmentAmount * m.multiplier,
  }));

  const comparisonRates = [4, 6, 8, 10, 12, 15].map((rate) => ({
    rate,
    ruleYears: rate > 0 ? 72 / rate : Infinity,
    exactYears: rate > 0 ? Math.log(2) / Math.log(1 + rate / 100) : Infinity,
    label: `${rate}%`,
  }));

  return {
    mode,
    annualRate,
    targetYears,
    investmentAmount,
    yearsToDouble,
    requiredRate,
    exactYearsToDouble,
    approximationError,
    approximationErrorPercent,
    futureValue,
    totalGrowthPercent,
    rows,
    milestones,
    comparisonRates,
  };
}

function buildSummary(values, metrics) {
  return [
    "Rule of 72 Calculator Summary",
    `Mode: ${values.mode === "years" ? "Years to Double" : "Required Rate to Double"}`,
    values.mode === "years"
      ? `Annual rate: ${formatPercent(values.annualRate)}`
      : `Target years: ${metrics.targetYears}`,
    `Years to double (Rule of 72): ${formatNumber(metrics.yearsToDouble)}`,
    `Required rate: ${formatPercent(metrics.requiredRate)}`,
    `Exact years to double: ${formatNumber(metrics.exactYearsToDouble)}`,
    `Approximation error: ${formatNumber(metrics.approximationErrorPercent, 2)}%`,
    `Investment amount: ${formatMoney(metrics.investmentAmount)}`,
    `Future value (doubled): ${formatMoney(metrics.futureValue)}`,
    `Total growth: ${formatPercent(metrics.totalGrowthPercent)}`,
  ].join("\n");
}

function exportCsv(values, metrics) {
  const rows = [
    ["Year", "Rule of 72 Value", "Exact Compound Value", "Invested"],
    ...metrics.rows.map((row) => [
      row.year,
      Math.round(row.ruleOf72Value),
      Math.round(row.exactValue),
      Math.round(row.invested),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "rule-of-72-calculation.csv";
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
    <article className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
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
    </article>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
      <p className="font-semibold text-[var(--foreground)]">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-[var(--muted-foreground)]">
          {item.name}: {formatMoney(item.value)}
        </p>
      ))}
    </div>
  );
}

function SectionCard({ title, description, icon: Icon, children }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
      <div className="mb-4 flex min-w-0 items-start gap-3">
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div className="min-w-0">
          <h2 className="break-words text-xl font-semibold text-[var(--foreground)]">{title}</h2>
          {description ? <p className="mt-1 break-words text-sm leading-6 text-[var(--muted-foreground)]">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function RuleOf72Calculator() {
  const [values, setValues] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const metrics = useMemo(() => calculateResults(values), [values]);

  const updateValue = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const copySummary = async () => {
    await navigator.clipboard?.writeText(buildSummary(values, metrics));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const reset = () => setValues(SAMPLE);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto w-full max-w-[1240px]">
        <header className="text-center">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" />
                Finance Tool
              </span>
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">
                <CalendarClock className="h-3.5 w-3.5 text-[var(--primary)]" />
                Real-time
              </span>
            </div>
            <h1 className="heading mx-auto max-w-5xl text-center">Rule of 72 Calculator</h1>
            <p className="description mx-auto mt-3 max-w-4xl text-center">
              Quickly estimate how many years it takes for your investment to double at a
              given annual return — or find the rate needed to double within a target timeframe.
            </p>
          </div>

          <div className="tool-card-grid mx-auto mt-8 w-full max-w-5xl">
            <MetricCard
              icon={TrendingUp}
              label="Years to Double"
              value={formatNumber(metrics.yearsToDouble)}
              detail={`Rule of 72 at ${formatPercent(metrics.requiredRate)}`}
              tone="good"
            />
            <MetricCard
              icon={Target}
              label="Required Rate"
              value={formatPercent(metrics.requiredRate)}
              detail={values.mode === "rate" ? `To double in ${metrics.targetYears} years` : "For given return rate"}
            />
            <MetricCard
              icon={LineChart}
              label="Exact Years"
              value={formatNumber(metrics.exactYearsToDouble)}
              detail={`${formatNumber(metrics.approximationErrorPercent, 2)}% approx error`}
              tone="violet"
            />
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            icon={Wallet}
            label="Future Value"
            value={formatMoney(metrics.futureValue)}
            detail={`From ${formatMoney(metrics.investmentAmount)} invested`}
            tone="good"
          />
          <MetricCard
            icon={PiggyBank}
            label="Total Growth"
            value={formatPercent(metrics.totalGrowthPercent)}
            detail="From initial investment"
          />
          <MetricCard
            icon={CalendarClock}
            label="Doubling Period"
            value={`${formatNumber(metrics.yearsToDouble)} Years`}
            detail={`Exact: ${formatNumber(metrics.exactYearsToDouble)} years`}
            tone="violet"
          />
          <MetricCard
            icon={Info}
            label="Approx Error"
            value={formatNumber(metrics.approximationErrorPercent, 2) + "%"}
            detail={`${formatNumber(metrics.approximationError)} year difference`}
            tone="warn"
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,410px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <SectionCard
              title="Calculator Inputs"
              description="Switch between years-to-double and required-rate modes."
              icon={Target}
            >
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                <label className="block min-w-0">
                  <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Calculation Mode</span>
                  <select
                    value={values.mode}
                    onChange={(event) => updateValue("mode", event.target.value)}
                    className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  >
                    {MODES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                {values.mode === "years" ? (
                  <Field
                    label="Annual Rate of Return"
                    value={values.annualRate}
                    onChange={(value) => updateValue("annualRate", value)}
                    suffix="%"
                    max={100}
                    step={0.1}
                  />
                ) : (
                  <Field
                    label="Target Years to Double"
                    value={values.targetYears}
                    onChange={(value) => updateValue("targetYears", value)}
                    suffix="yrs"
                    max={100}
                  />
                )}
                <Field
                  label="Investment Amount"
                  value={values.investmentAmount}
                  onChange={(value) => updateValue("investmentAmount", value)}
                  suffix="₹"
                />
              </div>

              <div className="tool-action-grid mt-5">
                <button type="button" onClick={reset} className="btn-secondary">
                  <RefreshCcw className="h-4 w-4" />
                  Load Sample
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
            </SectionCard>

            <SectionCard title="Rate Comparison" description="How different rates affect doubling time." icon={BarChart3}>
              <div className="space-y-3">
                {metrics.comparisonRates.map((item) => (
                  <div key={item.rate} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[var(--foreground)]">{item.label}</span>
                      <span className="text-sm font-bold text-[var(--primary)]">
                        {formatNumber(item.ruleYears)} yrs (Rule) / {formatNumber(item.exactYears)} yrs (Exact)
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                      <div
                        className="h-full rounded-full bg-[var(--primary)]"
                        style={{ width: `${Math.min(100, (item.ruleYears / 20) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Investment Milestones" description="When your investment reaches multiples of the original." icon={Wallet}>
              <div className="tool-card-grid">
                {metrics.milestones.map((m) => (
                  <div key={m.label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{m.label}</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{formatNumber(m.ruleYears)} years</p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                      Value: {formatMoney(m.value)}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="min-w-0 space-y-6">
            <SectionCard title="Growth Projection" description="Rule of 72 estimate vs exact compound interest formula." icon={TrendingUp}>
              <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={metrics.rows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rule72Exact" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.34} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="rule72Estimate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" minTickGap={16} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis width={58} tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="invested" name="Invested" stroke="#94a3b8" fill="transparent" strokeWidth={2} />
                    <Area type="monotone" dataKey="ruleOf72Value" name="Rule of 72" stroke="#059669" fill="url(#rule72Estimate)" strokeWidth={2} />
                    <Area type="monotone" dataKey="exactValue" name="Exact Compound" stroke="#2563eb" fill="url(#rule72Exact)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Milestone Timeline" description="Doubling milestones across years." icon={CalendarClock}>
              <div className="h-64 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={metrics.milestones.map((m) => ({ name: m.label, ruleYears: m.ruleYears, exactYears: m.exactYears }))} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis width={40} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="ruleYears" name="Rule of 72" fill="#059669" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="exactYears" name="Exact" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
              <SectionCard title="Error Analysis" description="Difference between Rule of 72 and exact formula." icon={Info}>
                <div className="space-y-3">
                  <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Absolute Error</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{formatNumber(metrics.approximationError)} years</p>
                  </div>
                  <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Percentage Error</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{formatNumber(metrics.approximationErrorPercent, 2)}%</p>
                  </div>
                  <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Best Accuracy Range</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">6% – 10%</p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Lowest error within this range</p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="What is Rule of 72?" description="A quick mental math shortcut for compound growth." icon={Info}>
                <div className="space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  <p>The <strong className="text-[var(--foreground)]">Rule of 72</strong> is a simple way to estimate the number of years required to double your investment at a given annual rate of return.</p>
                  <p><strong className="text-[var(--foreground)]">Formula:</strong> Years to Double = 72 ÷ Annual Rate</p>
                  <p>It works best for interest rates between <strong className="text-[var(--foreground)]">6% and 10%</strong>, where the error is smallest. Outside this range, the exact compound formula is more accurate.</p>
                  <p>You can also reverse it: Required Rate = 72 ÷ Target Years.</p>
                </div>
              </SectionCard>
            </section>
          </div>
        </section>

        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-700">
          The Rule of 72 is an approximation. For precise planning, use the exact compound interest formula. Actual returns vary with market conditions, fees, and taxes.
        </div>
      </div>
    </main>
  );
}
