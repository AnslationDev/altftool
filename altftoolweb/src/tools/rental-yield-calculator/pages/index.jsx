"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Building,
  Calculator,
  Clipboard,
  Download,
  Home,
  Landmark,
  PiggyBank,
  RefreshCcw,
  Shield,
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
  purchasePrice: 5000000,
  currentMarketValue: 5500000,
  downPayment: 1500000,
  loanAmount: 3500000,
  interestRate: 8.5,
  loanTenure: 20,
  monthlyRent: 25000,
  vacancyRate: 5,
  maintenanceCost: 30000,
  propertyTax: 25000,
  insurance: 12000,
  hoaCharges: 0,
  repairs: 15000,
  propertyManagementFee: 8,
  utilities: 6000,
  otherExpenses: 5000,
};

const PIE_COLORS = ["#059669", "#ef4444", "#2563eb", "#f59e0b", "#8b5cf6"];

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
  const purchasePrice = clampNumber(values.purchasePrice, 1, 10000000000);
  const currentMarketValue = clampNumber(values.currentMarketValue, 1, 10000000000);
  const downPayment = clampNumber(values.downPayment, 0, purchasePrice);
  const loanAmount = clampNumber(values.loanAmount, 0, purchasePrice);
  const interestRate = clampNumber(values.interestRate, 0, 50);
  const loanTenure = Math.max(1, Math.round(clampNumber(values.loanTenure, 1, 50)));
  const monthlyRent = clampNumber(values.monthlyRent, 0, 10000000);
  const vacancyRate = clampNumber(values.vacancyRate, 0, 100) / 100;
  const maintenanceCost = clampNumber(values.maintenanceCost, 0, 1000000);
  const propertyTax = clampNumber(values.propertyTax, 0, 1000000);
  const insurance = clampNumber(values.insurance, 0, 1000000);
  const hoaCharges = clampNumber(values.hoaCharges, 0, 1000000);
  const repairs = clampNumber(values.repairs, 0, 1000000);
  const propertyManagementFee = clampNumber(values.propertyManagementFee, 0, 100) / 100;
  const utilities = clampNumber(values.utilities, 0, 1000000);
  const otherExpenses = clampNumber(values.otherExpenses, 0, 1000000);

  const annualRent = monthlyRent * 12;
  const effectiveAnnualRent = annualRent * (1 - vacancyRate);
  const annualManagementFee = effectiveAnnualRent * propertyManagementFee;

  const totalAnnualExpenses =
    maintenanceCost +
    propertyTax +
    insurance +
    hoaCharges +
    repairs +
    annualManagementFee +
    utilities +
    otherExpenses;

  const netAnnualIncome = effectiveAnnualRent - totalAnnualExpenses;
  const grossRentalYield = purchasePrice > 0 ? (effectiveAnnualRent / purchasePrice) * 100 : 0;
  const netRentalYield = purchasePrice > 0 ? (netAnnualIncome / purchasePrice) * 100 : 0;

  const monthlyMortgage =
    loanAmount > 0 && interestRate > 0
      ? (loanAmount * (interestRate / 100 / 12) * (1 + interestRate / 100 / 12) ** (loanTenure * 12)) /
        ((1 + interestRate / 100 / 12) ** (loanTenure * 12) - 1)
      : loanAmount > 0
        ? loanAmount / (loanTenure * 12)
        : 0;

  const annualMortgage = monthlyMortgage * 12;
  const netCashFlow = netAnnualIncome - annualMortgage;
  const monthlyCashFlow = netCashFlow / 12;

  const capitalAppreciation = currentMarketValue - purchasePrice;
  const totalReturn = netAnnualIncome + capitalAppreciation;
  const roi = downPayment > 0 ? (totalReturn / downPayment) * 100 : 0;
  const cashOnCashRoi = downPayment > 0 ? (netCashFlow / downPayment) * 100 : 0;

  const breakEvenYears =
    netAnnualIncome > 0 && capitalAppreciation < 0
      ? Math.abs(capitalAppreciation) / netAnnualIncome
      : netAnnualIncome > 0
        ? downPayment / netAnnualIncome
        : Infinity;

  const expenseBreakdown = [
    { name: "Maintenance", value: maintenanceCost },
    { name: "Property Tax", value: propertyTax },
    { name: "Insurance", value: insurance },
    { name: "HOA", value: hoaCharges },
    { name: "Repairs", value: repairs },
    { name: "Management", value: annualManagementFee },
    { name: "Utilities", value: utilities },
    { name: "Other", value: otherExpenses },
  ].filter((item) => item.value > 0);

  const incomeBreakdown = [
    { name: "Gross Rent", value: annualRent },
    { name: "Vacancy Loss", value: annualRent * vacancyRate },
    { name: "Net Rental Income", value: effectiveAnnualRent },
  ];

  const cashFlowProjection = Array.from({ length: 6 }, (_, year) => {
    const projectedRent = effectiveAnnualRent * 1.03 ** year;
    const projectedExpenses = totalAnnualExpenses * 1.02 ** year;
    const projectedNet = projectedRent - projectedExpenses - annualMortgage;
    return {
      year,
      label: `Y${year}`,
      income: projectedRent,
      expenses: projectedExpenses,
      cashFlow: projectedNet,
    };
  });

  return {
    purchasePrice,
    currentMarketValue,
    downPayment,
    loanAmount,
    interestRate,
    loanTenure,
    monthlyRent,
    annualRent,
    effectiveAnnualRent,
    vacancyRate,
    totalAnnualExpenses,
    netAnnualIncome,
    grossRentalYield,
    netRentalYield,
    monthlyMortgage,
    annualMortgage,
    netCashFlow,
    monthlyCashFlow,
    capitalAppreciation,
    totalReturn,
    roi,
    cashOnCashRoi,
    breakEvenYears,
    expenseBreakdown,
    incomeBreakdown,
    cashFlowProjection,
  };
}

function buildSummary(values, metrics) {
  return [
    "Rental Yield Calculator Summary",
    `Purchase price: ${formatMoney(values.purchasePrice)}`,
    `Monthly rent: ${formatMoney(values.monthlyRent)}`,
    `Annual rent: ${formatMoney(metrics.annualRent)}`,
    `Effective annual rent: ${formatMoney(metrics.effectiveAnnualRent)}`,
    `Gross rental yield: ${formatPercent(metrics.grossRentalYield)}`,
    `Net rental yield: ${formatPercent(metrics.netRentalYield)}`,
    `Annual expenses: ${formatMoney(metrics.totalAnnualExpenses)}`,
    `Net annual income: ${formatMoney(metrics.netAnnualIncome)}`,
    `Monthly mortgage: ${formatMoney(metrics.monthlyMortgage)}`,
    `Net cash flow: ${formatMoney(metrics.netCashFlow)}`,
    `ROI: ${formatPercent(metrics.roi)}`,
    `Break-even years: ${formatNumber(metrics.breakEvenYears)}`,
  ].join("\n");
}

function exportCsv(values, metrics) {
  const rows = [
    ["Metric", "Value"],
    ["Purchase Price", values.purchasePrice],
    ["Monthly Rent", values.monthlyRent],
    ["Annual Rent", Math.round(metrics.annualRent)],
    ["Gross Rental Yield", formatPercent(metrics.grossRentalYield)],
    ["Net Rental Yield", formatPercent(metrics.netRentalYield)],
    ["Total Annual Expenses", Math.round(metrics.totalAnnualExpenses)],
    ["Net Annual Income", Math.round(metrics.netAnnualIncome)],
    ["Monthly Cash Flow", Math.round(metrics.monthlyCashFlow)],
    ["ROI", formatPercent(metrics.roi)],
    ...metrics.expenseBreakdown.map((e) => [e.name, e.value]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "rental-yield-calculation.csv";
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
          : tone === "danger"
            ? "bg-red-500/10 text-red-600"
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
          {item.name}: {typeof item.value === "number" && item.value > 1000 ? formatMoney(item.value) : formatNumber(item.value)}
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

export default function RentalYieldCalculator() {
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
                <Home className="h-3.5 w-3.5" />
                Real Estate
              </span>
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">
                <Calculator className="h-3.5 w-3.5 text-[var(--primary)]" />
                Yield Analysis
              </span>
            </div>
            <h1 className="heading mx-auto max-w-5xl text-center">Rental Yield Calculator</h1>
            <p className="description mx-auto mt-3 max-w-4xl text-center">
              Analyse rental property profitability with gross yield, net yield, cash flow,
              ROI, and break-even — all computed from your own inputs.
            </p>
          </div>

          <div className="tool-card-grid mx-auto mt-8 w-full max-w-5xl">
            <MetricCard
              icon={TrendingUp}
              label="Gross Yield"
              value={formatPercent(metrics.grossRentalYield)}
              detail={`Annual rent ${formatMoney(metrics.effectiveAnnualRent)}`}
              tone="good"
            />
            <MetricCard
              icon={Target}
              label="Net Yield"
              value={formatPercent(metrics.netRentalYield)}
              detail={`After all expenses`}
              tone={metrics.netRentalYield > 0 ? "good" : "danger"}
            />
            <MetricCard
              icon={Wallet}
              label="Monthly Cash Flow"
              value={formatMoney(metrics.monthlyCashFlow)}
              detail={metrics.netCashFlow >= 0 ? "Positive cash flow" : "Negative cash flow"}
              tone={metrics.netCashFlow >= 0 ? "good" : "danger"}
            />
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            icon={PiggyBank}
            label="ROI"
            value={formatPercent(metrics.roi)}
            detail={`On down payment of ${formatMoney(metrics.downPayment)}`}
            tone="good"
          />
          <MetricCard
            icon={Building}
            label="Annual Income"
            value={formatMoney(metrics.netAnnualIncome)}
            detail={`From ${formatMoney(metrics.monthlyRent)}/month rent`}
          />
          <MetricCard
            icon={Landmark}
            label="Annual Expenses"
            value={formatMoney(metrics.totalAnnualExpenses)}
            detail={`Including management fees`}
            tone="warn"
          />
          <MetricCard
            icon={Shield}
            label="Break-even"
            value={formatNumber(metrics.breakEvenYears) + " yrs"}
            detail={`Capital appreciation: ${formatMoney(metrics.capitalAppreciation)}`}
            tone="violet"
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,410px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <SectionCard
              title="Property Details"
              description="Purchase and loan information for the property."
              icon={Building}
            >
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                <Field
                  label="Purchase Price"
                  value={values.purchasePrice}
                  onChange={(value) => updateValue("purchasePrice", value)}
                  suffix="₹"
                />
                <Field
                  label="Current Market Value"
                  value={values.currentMarketValue}
                  onChange={(value) => updateValue("currentMarketValue", value)}
                  suffix="₹"
                />
                <Field
                  label="Down Payment"
                  value={values.downPayment}
                  onChange={(value) => updateValue("downPayment", value)}
                  suffix="₹"
                />
                <Field
                  label="Loan Amount"
                  value={values.loanAmount}
                  onChange={(value) => updateValue("loanAmount", value)}
                  suffix="₹"
                />
                <Field
                  label="Interest Rate"
                  value={values.interestRate}
                  onChange={(value) => updateValue("interestRate", value)}
                  suffix="%"
                  max={50}
                  step={0.1}
                />
                <Field
                  label="Loan Tenure"
                  value={values.loanTenure}
                  onChange={(value) => updateValue("loanTenure", value)}
                  suffix="yrs"
                  max={50}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Rental Income"
              description="Expected rent and vacancy assumptions."
              icon={Wallet}
            >
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                <Field
                  label="Monthly Rent"
                  value={values.monthlyRent}
                  onChange={(value) => updateValue("monthlyRent", value)}
                  suffix="₹"
                />
                <Field
                  label="Vacancy Rate"
                  value={values.vacancyRate}
                  onChange={(value) => updateValue("vacancyRate", value)}
                  suffix="%"
                  max={100}
                  step={0.5}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Annual Expenses"
              description="All recurring costs to maintain and manage the property."
              icon={BarChart3}
            >
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                <Field
                  label="Maintenance Cost"
                  value={values.maintenanceCost}
                  onChange={(value) => updateValue("maintenanceCost", value)}
                  suffix="₹"
                />
                <Field
                  label="Property Tax"
                  value={values.propertyTax}
                  onChange={(value) => updateValue("propertyTax", value)}
                  suffix="₹"
                />
                <Field
                  label="Insurance"
                  value={values.insurance}
                  onChange={(value) => updateValue("insurance", value)}
                  suffix="₹"
                />
                <Field
                  label="HOA Charges"
                  value={values.hoaCharges}
                  onChange={(value) => updateValue("hoaCharges", value)}
                  suffix="₹"
                />
                <Field
                  label="Repairs"
                  value={values.repairs}
                  onChange={(value) => updateValue("repairs", value)}
                  suffix="₹"
                />
                <Field
                  label="Management Fee"
                  value={values.propertyManagementFee}
                  onChange={(value) => updateValue("propertyManagementFee", value)}
                  suffix="%"
                  max={100}
                  step={0.5}
                />
                <Field
                  label="Utilities"
                  value={values.utilities}
                  onChange={(value) => updateValue("utilities", value)}
                  suffix="₹"
                />
                <Field
                  label="Other Expenses"
                  value={values.otherExpenses}
                  onChange={(value) => updateValue("otherExpenses", value)}
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
          </div>

          <div className="min-w-0 space-y-6">
            <SectionCard title="Cash Flow Projection" description="5-year outlook based on 3% rent growth and 2% expense inflation." icon={TrendingUp}>
              <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={metrics.cashFlowProjection} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rentalIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.34} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="rentalExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis width={58} tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#059669" fill="url(#rentalIncome)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#rentalExpenses)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
              <SectionCard title="Expense Breakdown" description="Where your rental income goes." icon={BarChart3}>
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <BarChart
                      data={metrics.expenseBreakdown}
                      layout="vertical"
                      margin={{ top: 10, right: 8, left: 60, bottom: 0 }}
                    >
                      <XAxis type="number" tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={60} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="value" name="Amount" fill="#ef4444" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Income Split" description="Gross rent vs net income after vacancy." icon={Wallet}>
                <div className="h-56 min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Net Income", value: Math.max(0, metrics.effectiveAnnualRent) },
                          { name: "Vacancy Loss", value: metrics.annualRent * metrics.vacancyRate },
                        ].filter((item) => item.value > 0)}
                        innerRadius="55%"
                        outerRadius="82%"
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        <Cell fill="#059669" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    { name: "Effective Annual Rent", value: metrics.effectiveAnnualRent, color: "#059669" },
                    { name: "Vacancy Loss", value: metrics.annualRent * metrics.vacancyRate, color: "#f59e0b" },
                  ].map((item) => (
                    <div key={item.name} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                      <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
                        <span className="min-w-0 break-words">{item.name}</span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-[var(--foreground)]">{formatMoney(item.value, true)}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </section>

            <SectionCard title="Annual Summary" description="Complete financial overview." icon={Calculator}>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Purchase Price", formatMoney(metrics.purchasePrice)],
                  ["Monthly Rent", formatMoney(metrics.monthlyRent)],
                  ["Annual Rent", formatMoney(metrics.annualRent)],
                  ["Gross Yield", formatPercent(metrics.grossRentalYield)],
                  ["Net Yield", formatPercent(metrics.netRentalYield)],
                  ["Monthly Mortgage", formatMoney(metrics.monthlyMortgage)],
                  ["Total Expenses", formatMoney(metrics.totalAnnualExpenses)],
                  ["Net Annual Income", formatMoney(metrics.netAnnualIncome)],
                  ["Monthly Cash Flow", formatMoney(metrics.monthlyCashFlow)],
                  ["ROI", formatPercent(metrics.roi)],
                  ["Cash-on-Cash ROI", formatPercent(metrics.cashOnCashRoi)],
                  ["Break-even Years", formatNumber(metrics.breakEvenYears)],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </section>

        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-700">
          This calculator provides estimates only. Actual rental returns depend on market conditions, vacancy periods, maintenance surprises, tax rules, and financing terms. Consult a financial advisor for investment decisions.
        </div>
      </div>
    </main>
  );
}
