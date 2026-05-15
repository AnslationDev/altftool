"use client";

import { useMemo, useState } from "react";
import {
  BadgePercent,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  Clipboard,
  Download,
  Landmark,
  Percent,
  PiggyBank,
  RefreshCw,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
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
  sharePrice: 2450,
  annualDividend: 92,
  sharesOwned: 120,
  dividendGrowth: 6,
  priceGrowth: 8,
  taxRate: 10,
  targetAnnualIncome: 120000,
  years: 10,
  frequency: 4,
};

const FREQUENCY_OPTIONS = [
  { label: "Annual", value: 1 },
  { label: "Half Yearly", value: 2 },
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
];

const COLORS = ["#2563eb", "#059669", "#f59e0b", "#8b5cf6"];

function formatMoney(value, compact = false) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(Number.isFinite(value) ? value : 0);
}

function formatNumber(value, digits = 0) {
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

function calculateDividend(values) {
  const sharePrice = clampNumber(values.sharePrice, 0, 100000000);
  const annualDividend = clampNumber(values.annualDividend, 0, 10000000);
  const sharesOwned = clampNumber(values.sharesOwned, 0, 100000000);
  const dividendGrowth = clampNumber(values.dividendGrowth, -100, 100) / 100;
  const priceGrowth = clampNumber(values.priceGrowth, -100, 100) / 100;
  const taxRate = clampNumber(values.taxRate, 0, 80) / 100;
  const targetAnnualIncome = clampNumber(values.targetAnnualIncome, 0, 1000000000);
  const years = Math.max(1, Math.round(clampNumber(values.years, 1, 60)));
  const frequency = Math.max(1, Number(values.frequency) || 1);
  const yieldPercent = sharePrice > 0 ? (annualDividend / sharePrice) * 100 : 0;
  const investmentValue = sharePrice * sharesOwned;
  const grossAnnualIncome = annualDividend * sharesOwned;
  const tax = grossAnnualIncome * taxRate;
  const netAnnualIncome = grossAnnualIncome - tax;
  const payoutPerPeriod = grossAnnualIncome / frequency;
  const netPayoutPerPeriod = netAnnualIncome / frequency;
  const monthlyEquivalent = netAnnualIncome / 12;
  const sharesForTarget = annualDividend > 0 ? Math.ceil(targetAnnualIncome / (annualDividend * (1 - taxRate))) : Infinity;
  const capitalForTarget = Number.isFinite(sharesForTarget) ? sharesForTarget * sharePrice : 0;
  const paybackYears = grossAnnualIncome > 0 ? investmentValue / grossAnnualIncome : Infinity;

  const rows = Array.from({ length: years + 1 }, (_, year) => {
    const projectedDividend = annualDividend * (1 + dividendGrowth) ** year;
    const projectedPrice = sharePrice * (1 + priceGrowth) ** year;
    const projectedIncome = projectedDividend * sharesOwned;
    const projectedTax = projectedIncome * taxRate;
    return {
      year,
      label: year === 0 ? "Now" : `Y${year}`,
      dividend: projectedDividend,
      price: projectedPrice,
      yield: projectedPrice > 0 ? (projectedDividend / projectedPrice) * 100 : 0,
      grossIncome: projectedIncome,
      netIncome: projectedIncome - projectedTax,
      portfolioValue: projectedPrice * sharesOwned,
    };
  });

  return {
    sharePrice,
    annualDividend,
    sharesOwned,
    taxRate,
    frequency,
    years,
    yieldPercent,
    investmentValue,
    grossAnnualIncome,
    tax,
    netAnnualIncome,
    payoutPerPeriod,
    netPayoutPerPeriod,
    monthlyEquivalent,
    sharesForTarget,
    capitalForTarget,
    paybackYears,
    rows,
  };
}

function buildSummary(values, metrics) {
  return [
    "Dividend Yield Calculator Summary",
    `Share price: ${formatMoney(values.sharePrice)}`,
    `Annual dividend per share: ${formatMoney(values.annualDividend)}`,
    `Dividend yield: ${formatPercent(metrics.yieldPercent)}`,
    `Shares owned: ${formatNumber(values.sharesOwned)}`,
    `Investment value: ${formatMoney(metrics.investmentValue)}`,
    `Gross annual dividend income: ${formatMoney(metrics.grossAnnualIncome)}`,
    `Net annual dividend income: ${formatMoney(metrics.netAnnualIncome)}`,
    `Net payout per period: ${formatMoney(metrics.netPayoutPerPeriod)}`,
    `Monthly equivalent: ${formatMoney(metrics.monthlyEquivalent)}`,
    `Target annual income: ${formatMoney(values.targetAnnualIncome)}`,
    `Capital required for target: ${formatMoney(metrics.capitalForTarget)}`,
  ].join("\n");
}

function exportCsv(metrics) {
  const rows = [
    ["Year", "Dividend Per Share", "Share Price", "Yield %", "Gross Income", "Net Income", "Portfolio Value"],
    ...metrics.rows.map((row) => [
      row.year,
      row.dividend.toFixed(2),
      row.price.toFixed(2),
      row.yield.toFixed(2),
      Math.round(row.grossIncome),
      Math.round(row.netIncome),
      Math.round(row.portfolioValue),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "dividend-yield-plan.csv";
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

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
      <p className="font-semibold text-[var(--foreground)]">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-[var(--muted-foreground)]">
          {item.name}: {item.dataKey === "yield" ? formatPercent(item.value) : formatMoney(item.value)}
        </p>
      ))}
    </div>
  );
}

export default function DividendYieldCalculator() {
  const [values, setValues] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const metrics = useMemo(() => calculateDividend(values), [values]);

  const updateValue = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const copySummary = async () => {
    await navigator.clipboard?.writeText(buildSummary(values, metrics));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const frequencyLabel = FREQUENCY_OPTIONS.find((item) => item.value === values.frequency)?.label || "Custom";
  const splitData = [
    { name: "Net Dividend", value: metrics.netAnnualIncome },
    { name: "Tax", value: metrics.tax },
  ].filter((item) => item.value > 0);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto w-full max-w-[1240px]">
        <header className="text-center">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                <BadgePercent className="h-3.5 w-3.5" />
                Dividend Yield
              </span>
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">
                <CalendarClock className="h-3.5 w-3.5 text-[var(--primary)]" />
                {frequencyLabel} payouts
              </span>
            </div>
            <h1 className="heading mx-auto max-w-5xl text-center">Dividend Yield Calculator</h1>
            <p className="description mx-auto mt-3 max-w-4xl text-center">
              Calculate annual dividend yield, dividend income, tax-adjusted cash flow,
              target income capital, and long-term dividend growth projections.
            </p>
          </div>

          <div className="tool-card-grid mx-auto mt-8 w-full max-w-5xl">
            <MetricCard
              icon={BadgePercent}
              label="Dividend Yield"
              value={formatPercent(metrics.yieldPercent)}
              detail={`${formatMoney(metrics.annualDividend)} annual dividend per share`}
              tone="good"
            />
            <MetricCard
              icon={Wallet}
              label="Net Annual Income"
              value={formatMoney(metrics.netAnnualIncome)}
              detail={`${formatNumber(metrics.sharesOwned)} shares after tax`}
            />
            <MetricCard
              icon={Target}
              label="Capital For Target"
              value={Number.isFinite(metrics.sharesForTarget) ? formatMoney(metrics.capitalForTarget) : "Not possible"}
              detail={`${formatMoney(values.targetAnnualIncome)} target annual income`}
              tone="violet"
            />
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            icon={BriefcaseBusiness}
            label="Investment Value"
            value={formatMoney(metrics.investmentValue)}
            detail={`${formatMoney(values.sharePrice)} x ${formatNumber(values.sharesOwned)} shares`}
          />
          <MetricCard
            icon={PiggyBank}
            label="Payout / Period"
            value={formatMoney(metrics.netPayoutPerPeriod)}
            detail={`${frequencyLabel} net cash flow`}
            tone="good"
          />
          <MetricCard
            icon={Landmark}
            label="Tax On Dividends"
            value={formatMoney(metrics.tax)}
            detail={`${formatPercent(values.taxRate)} dividend tax estimate`}
            tone="warn"
          />
          <MetricCard
            icon={CalendarClock}
            label="Payback Estimate"
            value={Number.isFinite(metrics.paybackYears) ? `${formatNumber(metrics.paybackYears, 1)}y` : "N/A"}
            detail="Years of dividends to recover capital"
            tone="violet"
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,410px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <SectionCard title="Dividend Inputs" description="Enter share price, annual dividend, holdings, tax and income target." icon={BadgePercent}>
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                <Field label="Share Price" value={values.sharePrice} onChange={(value) => updateValue("sharePrice", value)} suffix="₹" />
                <Field label="Annual Dividend / Share" value={values.annualDividend} onChange={(value) => updateValue("annualDividend", value)} suffix="₹" />
                <Field label="Shares Owned" value={values.sharesOwned} onChange={(value) => updateValue("sharesOwned", value)} suffix="shares" />
                <Field label="Target Annual Income" value={values.targetAnnualIncome} onChange={(value) => updateValue("targetAnnualIncome", value)} suffix="₹" />
              </div>

              <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                <Field label="Dividend Growth" value={values.dividendGrowth} onChange={(value) => updateValue("dividendGrowth", value)} suffix="%" max={100} />
                <Field label="Share Price Growth" value={values.priceGrowth} onChange={(value) => updateValue("priceGrowth", value)} suffix="%" max={100} />
                <Field label="Tax Rate" value={values.taxRate} onChange={(value) => updateValue("taxRate", value)} suffix="%" max={80} />
                <Field label="Projection Years" value={values.years} onChange={(value) => updateValue("years", value)} suffix="yrs" min={1} max={60} />
              </div>

              <label className="mt-4 block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Payout Frequency</span>
                <select
                  value={values.frequency}
                  onChange={(event) => updateValue("frequency", Number(event.target.value))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                >
                  {FREQUENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="tool-action-grid mt-5">
                <button type="button" onClick={() => setValues(SAMPLE)} className="btn-secondary">
                  <RefreshCw className="h-4 w-4" />
                  Load Sample
                </button>
                <button
                  type="button"
                  onClick={() => setValues({ ...SAMPLE, sharePrice: 1000, annualDividend: 50, sharesOwned: 100, targetAnnualIncome: 60000 })}
                  className="btn-secondary"
                >
                  <Percent className="h-4 w-4" />
                  5% Yield
                </button>
                <button type="button" onClick={copySummary} className="btn-secondary">
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy Summary"}
                </button>
                <button type="button" onClick={() => exportCsv(metrics)} className="btn-primary">
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Income Signals" description="Fast view of dividend cash flow quality." icon={PiggyBank}>
              <div className="tool-card-grid">
                {[
                  ["Gross Income", metrics.grossAnnualIncome, "Before tax"],
                  ["Monthly Equivalent", metrics.monthlyEquivalent, "Net annual / 12"],
                  ["Shares For Target", metrics.sharesForTarget, "Required holdings"],
                ].map(([label, value, detail]) => (
                  <div key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">
                      {label.includes("Shares") ? formatNumber(Number.isFinite(value) ? value : 0) : formatMoney(value)}
                    </p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{detail}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="min-w-0 space-y-6">
            <SectionCard title="Dividend Growth Projection" description="Projected income, portfolio value and yield over time." icon={TrendingUp}>
              <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.rows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" minTickGap={16} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis width={58} tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="netIncome" name="Net Income" fill="#059669" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="portfolioValue" name="Portfolio Value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
              <SectionCard title="Yield Trend" description="Dividend yield changes with dividend and price growth." icon={BarChart3}>
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.rows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <YAxis width={48} tickFormatter={(value) => `${formatNumber(value, 1)}%`} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="yield" name="Yield" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Dividend Split" description="Net cash flow versus estimated tax." icon={Wallet}>
                <div className="h-56 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={splitData} innerRadius="55%" outerRadius="82%" paddingAngle={3} dataKey="value" nameKey="name">
                        {splitData.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
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
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                        <span className="min-w-0 break-words">{item.name}</span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-[var(--foreground)]">{formatMoney(item.value, true)}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </section>

            <SectionCard title="Projection Schedule" description="Year-wise dividend and portfolio projection." icon={CalendarClock}>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {metrics.rows.slice(0, 1).concat(metrics.rows.slice(1).filter((row) => row.year % Math.max(1, Math.ceil(metrics.years / 8)) === 0 || row.year === metrics.years)).map((row) => (
                  <article key={row.year} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{row.year === 0 ? "Now" : `Year ${row.year}`}</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{formatMoney(row.netIncome)}</p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                      Yield {formatPercent(row.yield)}
                    </p>
                  </article>
                ))}
              </div>
            </SectionCard>
          </div>
        </section>

        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-700">
          Dividend yield is not guaranteed. Company payouts, share price, taxes, and growth assumptions can change actual returns.
        </div>
      </div>
    </main>
  );
}
