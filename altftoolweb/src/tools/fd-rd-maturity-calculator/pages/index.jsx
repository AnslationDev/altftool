"use client";

import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  BarChart3,
  CalendarClock,
  Clipboard,
  Download,
  Landmark,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SAMPLE = {
  mode: "fd",
  principal: 500000,
  monthlyDeposit: 10000,
  annualRate: 7.25,
  years: 3,
  months: 0,
  compounding: 4,
  taxRate: 10,
};

const COMPOUNDING_OPTIONS = [
  { label: "Monthly", value: 12 },
  { label: "Quarterly", value: 4 },
  { label: "Half Yearly", value: 2 },
  { label: "Yearly", value: 1 },
];

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

function getMonths(years, months) {
  return Math.max(1, Math.round(clampNumber(years, 0, 50) * 12 + clampNumber(months, 0, 11)));
}

function calculateFd(principal, annualRate, tenureMonths, compounding) {
  const years = tenureMonths / 12;
  const rate = annualRate / 100;
  const maturity = principal * (1 + rate / compounding) ** (compounding * years);
  const rows = Array.from({ length: tenureMonths + 1 }, (_, month) => {
    const monthYears = month / 12;
    const value = principal * (1 + rate / compounding) ** (compounding * monthYears);
    return {
      month,
      label: month === 0 ? "Now" : `${month}m`,
      invested: principal,
      value,
      interest: Math.max(0, value - principal),
    };
  });

  return { maturity, invested: principal, rows };
}

function calculateRd(monthlyDeposit, annualRate, tenureMonths, compounding) {
  const rate = annualRate / 100;
  let maturity = 0;
  const rows = [];

  for (let month = 0; month <= tenureMonths; month += 1) {
    const invested = monthlyDeposit * month;
    let value = 0;
    for (let depositMonth = 1; depositMonth <= month; depositMonth += 1) {
      const monthsRemaining = month - depositMonth + 1;
      const yearsRemaining = monthsRemaining / 12;
      value += monthlyDeposit * (1 + rate / compounding) ** (compounding * yearsRemaining);
    }
    rows.push({
      month,
      label: month === 0 ? "Now" : `${month}m`,
      invested,
      value,
      interest: Math.max(0, value - invested),
    });
    if (month === tenureMonths) maturity = value;
  }

  return { maturity, invested: monthlyDeposit * tenureMonths, rows };
}

function buildSummary(mode, values, metrics) {
  return [
    "FD / RD Maturity Calculator Summary",
    `Deposit type: ${mode.toUpperCase()}`,
    `Principal: ${formatMoney(values.principal)}`,
    `Monthly RD deposit: ${formatMoney(values.monthlyDeposit)}`,
    `Annual interest rate: ${formatNumber(values.annualRate, 2)}%`,
    `Tenure: ${metrics.tenureMonths} months`,
    `Total invested: ${formatMoney(metrics.invested)}`,
    `Gross maturity: ${formatMoney(metrics.maturity)}`,
    `Interest earned: ${formatMoney(metrics.interest)}`,
    `Tax on interest: ${formatMoney(metrics.tax)}`,
    `Net maturity: ${formatMoney(metrics.netMaturity)}`,
  ].join("\n");
}

function exportCsv(mode, values, metrics) {
  const rows = [
    ["Month", "Type", "Invested", "Maturity Value", "Interest"],
    ...metrics.rows.map((row) => [
      row.month,
      mode.toUpperCase(),
      Math.round(row.invested),
      Math.round(row.value),
      Math.round(row.interest),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "fd-rd-maturity-schedule.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Field({ label, value, onChange, suffix, min = 0, max = 100000000, step = 1 }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block break-words text-sm font-semibold text-[var(--foreground)]">
        {label}
      </span>
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
        {suffix && (
          <span className="flex shrink-0 items-center border-l border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted-foreground)]">
            {suffix}
          </span>
        )}
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
          {item.name}: {formatMoney(item.value)}
        </p>
      ))}
    </div>
  );
}

export default function FdRdMaturityCalculator() {
  const [mode, setMode] = useState(SAMPLE.mode);
  const [values, setValues] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const metrics = useMemo(() => {
    const tenureMonths = getMonths(values.years, values.months);
    const base =
      mode === "fd"
        ? calculateFd(values.principal, values.annualRate, tenureMonths, values.compounding)
        : calculateRd(values.monthlyDeposit, values.annualRate, tenureMonths, values.compounding);
    const interest = Math.max(0, base.maturity - base.invested);
    const tax = interest * (values.taxRate / 100);
    const netMaturity = Math.max(0, base.maturity - tax);
    const effectiveYield = base.invested > 0 ? (interest / base.invested) * 100 : 0;
    const yearlyRows = base.rows.filter((row) => row.month % 12 === 0 || row.month === tenureMonths);

    return {
      ...base,
      tenureMonths,
      interest,
      tax,
      netMaturity,
      effectiveYield,
      yearlyRows,
      monthlyGrowth: tenureMonths > 0 ? interest / tenureMonths : 0,
    };
  }, [mode, values]);

  const updateValue = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const copySummary = async () => {
    await navigator.clipboard.writeText(buildSummary(mode, values, metrics));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadSample = () => {
    setMode(SAMPLE.mode);
    setValues(SAMPLE);
  };

  const reset = () => {
    setMode("fd");
    setValues(SAMPLE);
  };

  const maturityLabel = mode === "fd" ? "FD Maturity" : "RD Maturity";
  const depositLabel = mode === "fd" ? "Principal Amount" : "Monthly Deposit";

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
          <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,420px)] 2xl:items-center">
            <div className="min-w-0">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
                <Landmark className="h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">Deposit Planner</span>
              </div>
              <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
                FD / RD Maturity Calculator
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
                Estimate fixed deposit or recurring deposit maturity with compounding,
                tax impact, net value, and a month-wise growth schedule.
              </p>
            </div>
            <div className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Net maturity estimate</p>
              <p className="tool-money-value tool-hero-value mt-2 text-[var(--primary)]">
                {formatMoney(metrics.netMaturity)}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-[var(--muted-foreground)]">
                {formatMoney(metrics.interest)} gross interest over {metrics.tenureMonths} months.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            icon={PiggyBank}
            label="Total Invested"
            value={formatMoney(metrics.invested)}
            detail={mode === "fd" ? "One-time deposit" : `${metrics.tenureMonths} monthly deposits`}
          />
          <MetricCard
            icon={TrendingUp}
            label="Interest Earned"
            value={formatMoney(metrics.interest)}
            detail={`${formatNumber(metrics.effectiveYield)}% effective growth`}
            tone="good"
          />
          <MetricCard
            icon={ShieldCheck}
            label="Tax Impact"
            value={formatMoney(metrics.tax)}
            detail={`${formatNumber(values.taxRate)}% tax on interest`}
            tone="warn"
          />
          <MetricCard
            icon={CalendarClock}
            label={maturityLabel}
            value={formatMoney(metrics.maturity)}
            detail={`${values.annualRate}% annual rate`}
            tone="violet"
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Deposit Details</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Switch between FD and RD, then tune rate, tenure, compounding, and tax.
              </p>

              <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                {[
                  ["fd", "Fixed Deposit"],
                  ["rd", "Recurring Deposit"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMode(key)}
                    className={`min-h-11 min-w-0 rounded-md border px-3 text-sm font-semibold transition ${
                      mode === key
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="block break-words">{label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-4">
                <Field
                  label={depositLabel}
                  value={mode === "fd" ? values.principal : values.monthlyDeposit}
                  onChange={(value) => updateValue(mode === "fd" ? "principal" : "monthlyDeposit", value)}
                  suffix="₹"
                />
                <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                  <Field
                    label="Interest Rate"
                    value={values.annualRate}
                    onChange={(value) => updateValue("annualRate", value)}
                    suffix="%"
                    max={40}
                    step={0.05}
                  />
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
                </div>
                <div className="grid min-w-0 gap-4 sm:grid-cols-3 2xl:grid-cols-1">
                  <Field
                    label="Years"
                    value={values.years}
                    onChange={(value) => updateValue("years", value)}
                    max={50}
                  />
                  <Field
                    label="Months"
                    value={values.months}
                    onChange={(value) => updateValue("months", value)}
                    max={11}
                  />
                  <Field
                    label="Tax Rate"
                    value={values.taxRate}
                    onChange={(value) => updateValue("taxRate", value)}
                    suffix="%"
                    max={40}
                  />
                </div>
              </div>

              <div className="tool-action-grid mt-5">
                <button type="button" onClick={loadSample} className="btn-secondary">
                  <RefreshCw className="h-4 w-4" />
                  Load Sample
                </button>
                <button type="button" onClick={reset} className="btn-secondary">
                  <ArrowRightLeft className="h-4 w-4" />
                  Reset
                </button>
                <button type="button" onClick={copySummary} className="btn-secondary">
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy Summary"}
                </button>
                <button type="button" onClick={() => exportCsv(mode, values, metrics)} className="btn-primary">
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </section>

            <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Deposit Signals</h2>
              <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-3 2xl:grid-cols-1">
                {[
                  ["Tenure", `${metrics.tenureMonths} months`, `${formatNumber(metrics.tenureMonths / 12, 1)} years`],
                  ["Monthly Growth", formatMoney(metrics.monthlyGrowth), "Average interest per month"],
                  ["Net Gain", formatMoney(metrics.netMaturity - metrics.invested), "After tax estimate"],
                ].map(([label, value, detail]) => (
                  <div key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{value}</p>
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
                  <h2 className="font-semibold text-[var(--foreground)]">Maturity Growth</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">Invested value versus maturity value over time</p>
                </div>
              </div>
              <div className="h-72 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.rows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fdValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" minTickGap={18} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis width={58} tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="invested" name="Invested" stroke="#94a3b8" fill="transparent" strokeWidth={2} />
                    <Area type="monotone" dataKey="value" name="Value" stroke="#2563eb" fill="url(#fdValue)" strokeWidth={3} />
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
                    <h2 className="font-semibold text-[var(--foreground)]">Yearly Snapshot</h2>
                    <p className="text-sm text-[var(--muted-foreground)]">Interest buildup across tenure</p>
                  </div>
                </div>
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.yearlyRows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <YAxis width={56} tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="interest" name="Interest" fill="#059669" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Maturity Split</h2>
                <div className="mt-4 space-y-3">
                  {[
                    ["Invested", metrics.invested, "bg-[var(--primary)]"],
                    ["Interest", metrics.interest, "bg-emerald-600"],
                    ["Tax", metrics.tax, "bg-amber-500"],
                  ].map(([label, amount, color]) => {
                    const percent = metrics.maturity > 0 ? (amount / metrics.maturity) * 100 : 0;
                    return (
                      <div key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <p className="break-words text-sm font-semibold text-[var(--foreground)]">{label}</p>
                          <p className="break-words text-sm font-bold text-[var(--foreground)]">{formatMoney(amount)}</p>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, percent)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Schedule Preview</h2>
              <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {metrics.yearlyRows.slice(-6).map((row) => (
                  <div key={`${row.month}-${row.value}`} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      {row.month === 0 ? "Start" : `Month ${row.month}`}
                    </p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{formatMoney(row.value)}</p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                      Interest {formatMoney(row.interest)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-700">
          This calculator gives an estimate. Bank rules, TDS, premature withdrawal, and compounding policies may change the final payout.
        </div>
      </div>
    </main>
  );
}
