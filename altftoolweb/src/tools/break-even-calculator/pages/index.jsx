"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Clipboard,
  Download,
  LineChart,
  Package,
  Percent,
  RefreshCw,
  Scale,
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
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SAMPLE = {
  fixedCost: 450000,
  variableCost: 320,
  sellingPrice: 850,
  expectedUnits: 1200,
  targetProfit: 250000,
  taxRate: 0,
  maxUnits: 2200,
};

const PIE_COLORS = ["#2563eb", "#f59e0b", "#059669"];

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
  return `${formatNumber(value, 1)}%`;
}

function clampNumber(value, min = 0, max = 1000000000) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(min, number), max);
}

function calculateBreakEven(values) {
  const fixedCost = clampNumber(values.fixedCost);
  const variableCost = clampNumber(values.variableCost);
  const sellingPrice = clampNumber(values.sellingPrice);
  const expectedUnits = clampNumber(values.expectedUnits, 0, 10000000);
  const targetProfit = clampNumber(values.targetProfit);
  const taxRate = clampNumber(values.taxRate, 0, 80) / 100;
  const contribution = Math.max(0, sellingPrice - variableCost);
  const contributionMargin = sellingPrice > 0 ? (contribution / sellingPrice) * 100 : 0;
  const breakEvenUnits = contribution > 0 ? Math.ceil(fixedCost / contribution) : Infinity;
  const breakEvenRevenue = Number.isFinite(breakEvenUnits) ? breakEvenUnits * sellingPrice : 0;
  const expectedRevenue = expectedUnits * sellingPrice;
  const expectedVariableCost = expectedUnits * variableCost;
  const expectedProfitBeforeTax = expectedRevenue - expectedVariableCost - fixedCost;
  const expectedTax = Math.max(0, expectedProfitBeforeTax * taxRate);
  const expectedProfit = expectedProfitBeforeTax - expectedTax;
  const targetUnits = contribution > 0 ? Math.ceil((fixedCost + targetProfit) / contribution) : Infinity;
  const marginOfSafetyUnits = Number.isFinite(breakEvenUnits) ? expectedUnits - breakEvenUnits : 0;
  const marginOfSafetyPercent = expectedUnits > 0 ? (marginOfSafetyUnits / expectedUnits) * 100 : 0;
  const maxUnits = Math.max(
    10,
    Math.ceil(Math.max(values.maxUnits, expectedUnits, Number.isFinite(targetUnits) ? targetUnits : 0, Number.isFinite(breakEvenUnits) ? breakEvenUnits : 0) * 1.15),
  );
  const step = Math.max(1, Math.ceil(maxUnits / 18));
  const rows = [];

  for (let units = 0; units <= maxUnits; units += step) {
    const revenue = units * sellingPrice;
    const totalCost = fixedCost + units * variableCost;
    const profit = revenue - totalCost;
    rows.push({
      units,
      label: `${formatNumber(units)}u`,
      revenue,
      totalCost,
      profit,
    });
  }

  if (!rows.some((row) => row.units === expectedUnits)) {
    rows.push({
      units: expectedUnits,
      label: `${formatNumber(expectedUnits)}u`,
      revenue: expectedRevenue,
      totalCost: fixedCost + expectedVariableCost,
      profit: expectedProfitBeforeTax,
    });
  }

  rows.sort((a, b) => a.units - b.units);

  return {
    fixedCost,
    variableCost,
    sellingPrice,
    expectedUnits,
    targetProfit,
    taxRate,
    contribution,
    contributionMargin,
    breakEvenUnits,
    breakEvenRevenue,
    expectedRevenue,
    expectedVariableCost,
    expectedProfitBeforeTax,
    expectedTax,
    expectedProfit,
    targetUnits,
    marginOfSafetyUnits,
    marginOfSafetyPercent,
    maxUnits,
    rows,
  };
}

function buildSummary(values, metrics) {
  return [
    "Break-Even Calculator Summary",
    `Fixed cost: ${formatMoney(values.fixedCost)}`,
    `Variable cost per unit: ${formatMoney(values.variableCost)}`,
    `Selling price per unit: ${formatMoney(values.sellingPrice)}`,
    `Contribution per unit: ${formatMoney(metrics.contribution)}`,
    `Contribution margin: ${formatPercent(metrics.contributionMargin)}`,
    `Break-even units: ${Number.isFinite(metrics.breakEvenUnits) ? formatNumber(metrics.breakEvenUnits) : "Not possible"}`,
    `Break-even revenue: ${formatMoney(metrics.breakEvenRevenue)}`,
    `Expected units: ${formatNumber(values.expectedUnits)}`,
    `Expected profit after tax: ${formatMoney(metrics.expectedProfit)}`,
    `Target profit units: ${Number.isFinite(metrics.targetUnits) ? formatNumber(metrics.targetUnits) : "Not possible"}`,
    `Margin of safety: ${formatNumber(metrics.marginOfSafetyUnits)} units (${formatPercent(metrics.marginOfSafetyPercent)})`,
  ].join("\n");
}

function exportCsv(metrics) {
  const rows = [
    ["Units", "Revenue", "Total Cost", "Profit"],
    ...metrics.rows.map((row) => [
      Math.round(row.units),
      Math.round(row.revenue),
      Math.round(row.totalCost),
      Math.round(row.profit),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "break-even-scenario.csv";
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
          {item.name}: {item.dataKey === "units" ? formatNumber(item.value) : formatMoney(item.value)}
        </p>
      ))}
    </div>
  );
}

export default function BreakEvenCalculator() {
  const [values, setValues] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const metrics = useMemo(() => calculateBreakEven(values), [values]);
  const viable = metrics.contribution > 0;
  const profitTone = metrics.expectedProfit >= 0 ? "good" : "warn";
  const safetyTone = metrics.marginOfSafetyUnits >= 0 ? "good" : "amber";
  const splitData = useMemo(
    () => [
      { name: "Fixed Cost", value: metrics.fixedCost },
      { name: "Variable Cost", value: metrics.expectedVariableCost },
      { name: "Profit", value: Math.max(0, metrics.expectedProfitBeforeTax) },
    ].filter((item) => item.value > 0),
    [metrics.expectedProfitBeforeTax, metrics.expectedVariableCost, metrics.fixedCost],
  );

  const updateValue = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const copySummary = async () => {
    await navigator.clipboard?.writeText(buildSummary(values, metrics));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadSample = () => setValues(SAMPLE);
  const resetSimple = () =>
    setValues({
      fixedCost: 100000,
      variableCost: 120,
      sellingPrice: 300,
      expectedUnits: 800,
      targetProfit: 50000,
      taxRate: 0,
      maxUnits: 1200,
    });

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto w-full max-w-[1240px]">
        <header className="text-center">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-[var(--primary)]">
                <Scale className="h-3.5 w-3.5" />
                Zero-profit point
              </span>
              <span className={`inline-flex items-center justify-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${viable ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-rose-500/30 bg-rose-500/10 text-rose-600"}`}>
                <Package className="h-3.5 w-3.5" />
                {viable ? "Contribution positive" : "Price below variable cost"}
              </span>
            </div>
            <h1 className="heading mx-auto max-w-5xl text-center">Break-Even Calculator</h1>
            <p className="description mx-auto mt-3 max-w-4xl text-center">
              Calculate how many units you must sell to cover fixed and variable costs,
              then test profit targets, margin of safety, and cost-volume scenarios.
            </p>
          </div>

          <div className="tool-card-grid mx-auto mt-8 w-full max-w-5xl">
            <MetricCard
              icon={Target}
              label="Break-even Units"
              value={viable ? formatNumber(metrics.breakEvenUnits) : "Not possible"}
              detail={viable ? `${formatMoney(metrics.breakEvenRevenue)} break-even revenue` : "Selling price must exceed variable cost"}
              tone={viable ? "good" : "warn"}
            />
            <MetricCard
              icon={Wallet}
              label="Contribution / Unit"
              value={formatMoney(metrics.contribution)}
              detail={`${formatPercent(metrics.contributionMargin)} contribution margin`}
            />
            <MetricCard
              icon={TrendingUp}
              label="Expected Profit"
              value={formatMoney(metrics.expectedProfit)}
              detail={`${formatNumber(values.expectedUnits)} expected units after tax`}
              tone={profitTone}
            />
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            icon={Scale}
            label="Break-even Revenue"
            value={formatMoney(metrics.breakEvenRevenue)}
            detail="Revenue needed for zero profit"
            tone={viable ? "good" : "warn"}
          />
          <MetricCard
            icon={Package}
            label="Target Profit Units"
            value={viable ? formatNumber(metrics.targetUnits) : "Not possible"}
            detail={`${formatMoney(values.targetProfit)} target profit`}
          />
          <MetricCard
            icon={Percent}
            label="Margin of Safety"
            value={`${formatNumber(metrics.marginOfSafetyUnits)} units`}
            detail={`${formatPercent(metrics.marginOfSafetyPercent)} versus expected sales`}
            tone={safetyTone}
          />
          <MetricCard
            icon={AlertTriangle}
            label="Tax Estimate"
            value={formatMoney(metrics.expectedTax)}
            detail={`${formatPercent(values.taxRate)} applied only on positive profit`}
            tone="amber"
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,410px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <SectionCard
              title="Cost & Price Inputs"
              description="Add your fixed cost, per-unit economics, expected sales and profit target."
              icon={Scale}
            >
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                <Field label="Fixed Cost" value={values.fixedCost} onChange={(value) => updateValue("fixedCost", value)} suffix="₹" />
                <Field label="Variable Cost / Unit" value={values.variableCost} onChange={(value) => updateValue("variableCost", value)} suffix="₹" />
                <Field label="Selling Price / Unit" value={values.sellingPrice} onChange={(value) => updateValue("sellingPrice", value)} suffix="₹" />
                <Field label="Expected Sales Units" value={values.expectedUnits} onChange={(value) => updateValue("expectedUnits", value)} suffix="units" max={10000000} />
                <Field label="Target Profit" value={values.targetProfit} onChange={(value) => updateValue("targetProfit", value)} suffix="₹" />
                <Field label="Tax Rate" value={values.taxRate} onChange={(value) => updateValue("taxRate", value)} suffix="%" max={80} />
              </div>

              <div className="mt-4">
                <Field label="Chart Max Units" value={values.maxUnits} onChange={(value) => updateValue("maxUnits", value)} suffix="units" max={10000000} />
              </div>

              <div className="tool-action-grid mt-5">
                <button type="button" onClick={loadSample} className="btn-secondary">
                  <RefreshCw className="h-4 w-4" />
                  Load Sample
                </button>
                <button type="button" onClick={resetSimple} className="btn-secondary">
                  <Scale className="h-4 w-4" />
                  Simple Plan
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

            <SectionCard title="Business Signals" description="Fast read before changing pricing or cost structure." icon={BarChart3}>
              <div className="tool-card-grid">
                {[
                  ["Expected Revenue", metrics.expectedRevenue, "Sales forecast value"],
                  ["Expected Cost", metrics.fixedCost + metrics.expectedVariableCost, "Fixed plus variable"],
                  ["Profit Before Tax", metrics.expectedProfitBeforeTax, "Before tax estimate"],
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
            <SectionCard title="Cost Volume Profit Chart" description="Revenue and cost lines cross at the break-even point." icon={LineChart}>
              <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.rows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="beRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="beCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" minTickGap={16} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis width={58} tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    {viable ? <ReferenceLine x={`${formatNumber(metrics.breakEvenUnits)}u`} stroke="#059669" strokeDasharray="4 4" /> : null}
                    <Area type="monotone" dataKey="totalCost" name="Total Cost" stroke="#f59e0b" fill="url(#beCost)" strokeWidth={2} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" fill="url(#beRevenue)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
              <SectionCard title="Profit Curve" description="Profit turns positive after break-even." icon={TrendingUp}>
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.rows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <YAxis width={56} tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <ReferenceLine y={0} stroke="var(--border)" />
                      <Bar dataKey="profit" name="Profit" radius={[8, 8, 0, 0]}>
                        {metrics.rows.map((row) => (
                          <Cell key={row.units} fill={row.profit >= 0 ? "#059669" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Expected Sales Split" description="Cost and profit at your expected units." icon={Wallet}>
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

            <SectionCard title="Scenario Table" description="Revenue, cost, and profit at key unit levels." icon={Package}>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Break-even", viable ? metrics.breakEvenUnits : 0],
                  ["Expected", metrics.expectedUnits],
                  ["Target Profit", viable ? metrics.targetUnits : 0],
                  ["Half Expected", Math.round(metrics.expectedUnits / 2)],
                  ["Max Chart", metrics.maxUnits],
                  ["Safety Gap", Math.max(0, metrics.marginOfSafetyUnits)],
                ].map(([label, units]) => {
                  const revenue = units * metrics.sellingPrice;
                  const profit = revenue - (metrics.fixedCost + units * metrics.variableCost);
                  return (
                    <article key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
                      <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{formatNumber(units)} units</p>
                      <p className={`mt-1 break-words text-sm font-semibold ${profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatMoney(profit)} profit
                      </p>
                    </article>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </section>

        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-700">
          Break-even analysis is an estimate. Discounts, refunds, taxes, channel fees, inventory losses, and capacity constraints can change real profit.
        </div>
      </div>
    </main>
  );
}
