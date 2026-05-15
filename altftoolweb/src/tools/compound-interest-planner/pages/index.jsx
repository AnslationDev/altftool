"use client";

import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  BarChart3,
  CalendarClock,
  Clipboard,
  Download,
  LineChart,
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
  principal: 500000,
  annualTopUp: 50000,
  annualRate: 12,
  years: 15,
  compounding: 12,
  taxRate: 10,
  inflationRate: 6,
  reinvest: true,
  topUpTiming: "start",
};

const COMPOUNDING_OPTIONS = [
  { label: "Monthly", value: 12 },
  { label: "Quarterly", value: 4 },
  { label: "Half Yearly", value: 2 },
  { label: "Yearly", value: 1 },
];

const PIE_COLORS = ["#2563eb", "#059669", "#f59e0b"];

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

function clampNumber(value, min = 0, max = 100000000) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(min, number), max);
}

function calculatePlan(values) {
  const years = Math.max(1, Math.round(clampNumber(values.years, 1, 60)));
  const principal = clampNumber(values.principal, 0, 1000000000);
  const annualTopUp = clampNumber(values.annualTopUp, 0, 100000000);
  const annualRate = clampNumber(values.annualRate, 0, 60) / 100;
  const taxRate = clampNumber(values.taxRate, 0, 60) / 100;
  const inflationRate = clampNumber(values.inflationRate, 0, 30) / 100;
  const compounding = Math.max(1, Number(values.compounding) || 1);
  const periodRate = annualRate / compounding;

  let corpus = principal;
  let invested = principal;
  let totalTax = 0;
  const rows = [
    {
      year: 0,
      label: "Now",
      invested,
      value: corpus,
      interest: 0,
      tax: 0,
      realValue: corpus,
      withdrawnInterest: 0,
    },
  ];

  for (let year = 1; year <= years; year += 1) {
    let yearStart = corpus;
    let topUp = annualTopUp;

    if (values.topUpTiming === "start") {
      corpus += topUp;
      invested += topUp;
      yearStart += topUp;
    }

    const beforeGrowth = corpus;
    const grossValue = corpus * (1 + periodRate) ** compounding;
    const grossInterest = Math.max(0, grossValue - beforeGrowth);
    const tax = grossInterest * taxRate;
    const netInterest = Math.max(0, grossInterest - tax);
    totalTax += tax;

    if (values.reinvest) {
      corpus += netInterest;
    } else {
      corpus = beforeGrowth;
    }

    if (values.topUpTiming === "end") {
      corpus += topUp;
      invested += topUp;
    }

    rows.push({
      year,
      label: `Y${year}`,
      invested,
      value: corpus,
      interest: netInterest,
      tax,
      realValue: corpus / (1 + inflationRate) ** year,
      withdrawnInterest: values.reinvest ? 0 : netInterest,
      growthRate: yearStart > 0 ? ((corpus - yearStart) / yearStart) * 100 : 0,
    });
  }

  const finalRow = rows[rows.length - 1];
  const totalWithdrawnInterest = rows.reduce((sum, row) => sum + row.withdrawnInterest, 0);
  const finalValue = finalRow.value;
  const wealthGain = Math.max(0, finalValue - invested);
  const absoluteGain = values.reinvest ? wealthGain : totalWithdrawnInterest;
  const cagr = invested > 0 ? ((finalValue + totalWithdrawnInterest) / invested) ** (1 / years) - 1 : 0;
  const multiple = invested > 0 ? (finalValue + totalWithdrawnInterest) / invested : 0;

  return {
    years,
    rows,
    invested,
    finalValue,
    realValue: finalRow.realValue,
    wealthGain,
    absoluteGain,
    totalTax,
    totalWithdrawnInterest,
    cagr: cagr * 100,
    multiple,
    finalInterest: finalRow.interest,
  };
}

function buildSummary(values, metrics) {
  return [
    "Compound Interest Planner Summary",
    `Lumpsum: ${formatMoney(values.principal)}`,
    `Yearly top-up: ${formatMoney(values.annualTopUp)}`,
    `Annual return: ${formatNumber(values.annualRate, 2)}%`,
    `Duration: ${metrics.years} years`,
    `Compounding: ${COMPOUNDING_OPTIONS.find((item) => item.value === values.compounding)?.label || values.compounding}`,
    `Reinvestment: ${values.reinvest ? "Enabled" : "Interest withdrawn yearly"}`,
    `Total invested: ${formatMoney(metrics.invested)}`,
    `Final corpus: ${formatMoney(metrics.finalValue)}`,
    `Inflation-adjusted value: ${formatMoney(metrics.realValue)}`,
    `Wealth gain: ${formatMoney(metrics.absoluteGain)}`,
    `Estimated tax: ${formatMoney(metrics.totalTax)}`,
    `Effective CAGR: ${formatNumber(metrics.cagr, 2)}%`,
  ].join("\n");
}

function exportCsv(values, metrics) {
  const rows = [
    ["Year", "Invested", "Corpus Value", "Net Interest", "Tax", "Inflation Adjusted Value", "Withdrawn Interest"],
    ...metrics.rows.map((row) => [
      row.year,
      Math.round(row.invested),
      Math.round(row.value),
      Math.round(row.interest),
      Math.round(row.tax),
      Math.round(row.realValue),
      Math.round(row.withdrawnInterest),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "compound-interest-plan.csv";
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

export default function CompoundInterestPlanner() {
  const [values, setValues] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const metrics = useMemo(() => calculatePlan(values), [values]);
  const splitData = useMemo(
    () => [
      { name: "Invested", value: metrics.invested },
      { name: "Reinvested Gain", value: Math.max(0, metrics.wealthGain) },
      { name: "Tax", value: metrics.totalTax },
    ].filter((item) => item.value > 0),
    [metrics.invested, metrics.totalTax, metrics.wealthGain],
  );

  const updateValue = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const copySummary = async () => {
    await navigator.clipboard?.writeText(buildSummary(values, metrics));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const reset = () => setValues(SAMPLE);

  const conservativeValue = metrics.rows.at(Math.max(0, Math.floor(metrics.rows.length * 0.6)))?.value || metrics.finalValue;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto w-full max-w-[1240px]">
        <header className="text-center">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                <PiggyBank className="h-3.5 w-3.5" />
                Finance Planner
              </span>
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">
                <CalendarClock className="h-3.5 w-3.5 text-[var(--primary)]" />
                Year-wise growth
              </span>
            </div>
            <h1 className="heading mx-auto max-w-5xl text-center">Compound Interest Planner</h1>
            <p className="description mx-auto mt-3 max-w-4xl text-center">
              Plan lumpsum investing with reinvested returns, yearly top-ups, tax drag,
              inflation-adjusted value, and a clean year-wise growth chart.
            </p>
          </div>

          <div className="tool-card-grid mx-auto mt-8 w-full max-w-5xl">
            <MetricCard
              icon={TrendingUp}
              label="Final Corpus"
              value={formatMoney(metrics.finalValue)}
              detail={`${formatNumber(metrics.multiple, 2)}x total value multiple`}
              tone="good"
            />
            <MetricCard
              icon={Wallet}
              label="Total Invested"
              value={formatMoney(metrics.invested)}
              detail={`${formatMoney(values.annualTopUp)} yearly top-up`}
            />
            <MetricCard
              icon={ShieldCheck}
              label="Real Value"
              value={formatMoney(metrics.realValue)}
              detail={`${formatNumber(values.inflationRate)}% inflation adjusted`}
              tone="violet"
            />
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            icon={PiggyBank}
            label="Wealth Gain"
            value={formatMoney(metrics.absoluteGain)}
            detail={values.reinvest ? "Reinvested compounding gain" : "Withdrawn interest total"}
            tone="good"
          />
          <MetricCard
            icon={LineChart}
            label="Effective CAGR"
            value={`${formatNumber(metrics.cagr, 2)}%`}
            detail={`${values.annualRate}% expected annual return`}
          />
          <MetricCard
            icon={CalendarClock}
            label="Plan Duration"
            value={`${metrics.years} Years`}
            detail={`${values.compounding} compounding periods per year`}
            tone="violet"
          />
          <MetricCard
            icon={ShieldCheck}
            label="Estimated Tax"
            value={formatMoney(metrics.totalTax)}
            detail={`${formatNumber(values.taxRate)}% tax on yearly interest`}
            tone="warn"
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,410px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <SectionCard
              title="Investment Inputs"
              description="Set principal, yearly additions, returns, compounding and reinvestment behavior."
              icon={PiggyBank}
            >
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                <Field label="Lumpsum Principal" value={values.principal} onChange={(value) => updateValue("principal", value)} suffix="₹" />
                <Field label="Yearly Top-up" value={values.annualTopUp} onChange={(value) => updateValue("annualTopUp", value)} suffix="₹" />
                <Field label="Expected Return" value={values.annualRate} onChange={(value) => updateValue("annualRate", value)} suffix="%" max={60} step={0.05} />
                <Field label="Investment Years" value={values.years} onChange={(value) => updateValue("years", value)} max={60} />
              </div>

              <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                <label className="block min-w-0">
                  <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Compounding</span>
                  <select
                    value={values.compounding}
                    onChange={(event) => updateValue("compounding", Number(event.target.value))}
                    className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  >
                    {COMPOUNDING_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block min-w-0">
                  <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Top-up Timing</span>
                  <select
                    value={values.topUpTiming}
                    onChange={(event) => updateValue("topUpTiming", event.target.value)}
                    className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  >
                    <option value="start">Start of each year</option>
                    <option value="end">End of each year</option>
                  </select>
                </label>
              </div>

              <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                <Field label="Tax Rate" value={values.taxRate} onChange={(value) => updateValue("taxRate", value)} suffix="%" max={60} />
                <Field label="Inflation Rate" value={values.inflationRate} onChange={(value) => updateValue("inflationRate", value)} suffix="%" max={30} step={0.1} />
              </div>

              <button
                type="button"
                onClick={() => updateValue("reinvest", !values.reinvest)}
                className={`mt-4 flex min-h-12 w-full min-w-0 items-center justify-between gap-3 rounded-lg border px-4 text-left transition ${
                  values.reinvest
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                }`}
              >
                <span className="min-w-0 break-words text-sm font-bold">
                  {values.reinvest ? "Reinvest yearly gains" : "Withdraw yearly gains"}
                </span>
                <span className="shrink-0 text-xs font-black uppercase">
                  {values.reinvest ? "On" : "Off"}
                </span>
              </button>

              <div className="tool-action-grid mt-5">
                <button type="button" onClick={reset} className="btn-secondary">
                  <RefreshCw className="h-4 w-4" />
                  Load Sample
                </button>
                <button type="button" onClick={() => setValues({ ...SAMPLE, principal: 100000, annualTopUp: 0, years: 10 })} className="btn-secondary">
                  <ArrowRightLeft className="h-4 w-4" />
                  Simple Plan
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

            <SectionCard title="Growth Signals" description="Quick read on reinvestment power and real returns." icon={BarChart3}>
              <div className="tool-card-grid">
                {[
                  ["Mid-plan Corpus", conservativeValue, "Around 60% of timeline"],
                  ["Last Year Interest", metrics.finalInterest, "Net interest in final year"],
                  ["Withdrawn Interest", metrics.totalWithdrawnInterest, values.reinvest ? "No yearly withdrawals" : "Total paid out"],
                ].map(([label, value, detail]) => (
                  <div key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{formatMoney(value)}</p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{detail}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="min-w-0 space-y-6">
            <SectionCard title="Reinvestment Growth Chart" description="Corpus value, invested capital, and inflation-adjusted buying power." icon={TrendingUp}>
              <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.rows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="compoundValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.34} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="compoundReal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" minTickGap={16} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis width={58} tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="invested" name="Invested" stroke="#94a3b8" fill="transparent" strokeWidth={2} />
                    <Area type="monotone" dataKey="realValue" name="Real Value" stroke="#8b5cf6" fill="url(#compoundReal)" strokeWidth={2} />
                    <Area type="monotone" dataKey="value" name="Corpus" stroke="#2563eb" fill="url(#compoundValue)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
              <SectionCard title="Year-wise Returns" description="Net interest generated each year." icon={BarChart3}>
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.rows.slice(1)} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <YAxis width={56} tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="interest" name="Net Interest" fill="#059669" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Corpus Split" description="What the final value is made of." icon={Wallet}>
                <div className="h-56 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={splitData} innerRadius="55%" outerRadius="82%" paddingAngle={3} dataKey="value" nameKey="name">
                        {splitData.map((entry, index) => (
                          <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {splitData.map((item, index) => (
                    <div key={item.name} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                      <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
                        <span className="min-w-0 break-words">{item.name}</span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-[var(--foreground)]">{formatMoney(item.value, true)}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </section>

            <SectionCard title="Year-wise Schedule" description="Detailed corpus view across every year." icon={CalendarClock}>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {metrics.rows.slice(0, 1).concat(metrics.rows.slice(1).filter((row) => row.year % Math.max(1, Math.ceil(metrics.years / 8)) === 0 || row.year === metrics.years)).map((row) => (
                  <article key={row.year} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{row.year === 0 ? "Start" : `Year ${row.year}`}</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{formatMoney(row.value)}</p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                      Invested {formatMoney(row.invested)}
                    </p>
                  </article>
                ))}
              </div>
            </SectionCard>
          </div>
        </section>

        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-700">
          This planner is an estimate. Real returns, tax rules, inflation, fees, and market movement can change final results.
        </div>
      </div>
    </main>
  );
}
